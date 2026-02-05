
import { GoogleGenAI, Type } from "@google/genai";
import { InfluencerData, NicheType, PersonalityType, InfluencerPersona, InfluencerProfile } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const base64ToPart = (base64: string) => {
  const [header, data] = base64.split(',');
  const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
  return { inlineData: { data, mimeType } };
};

export const generateInfluencerPhotos = async (data: InfluencerData): Promise<string[]> => {
  const ai = getAI();
  
  const prompt = `Create a masterpiece influencer photograph. 
    Subject: A professional ${data.scenario.role} with a ${data.scenario.emotion} expression. 
    Action: ${data.scenario.action}, ${data.scenario.pose} pose.
    Location: ${data.location}.
    Outfit: ${data.outfit}.
    Lighting/Atmosphere: ${data.scenario.mood}, ${data.timeAndSeason.timeOfDay}, ${data.timeAndSeason.weather}.
    Camera: ${data.scenario.angle} shot, 8k resolution, cinematic lighting, sharp focus.
    
    CRITICAL: Maintain the facial identity from the provided reference images. 
    If a companion image is provided, include that person naturally.
    If a product image is provided, integrate it realistically as a brand placement.
    If a pose image is provided, match that specific body composition.`;

  const parts: any[] = [{ text: prompt }];
  
  // Add references
  data.images.forEach(img => parts.push(base64ToPart(img)));
  if (data.companionImage) parts.push(base64ToPart(data.companionImage));
  if (data.productImage) parts.push(base64ToPart(data.productImage));
  if (data.poseImage) parts.push(base64ToPart(data.poseImage));

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts },
    config: {
      imageConfig: { aspectRatio: "1:1" }
    }
  });

  const urls: string[] = [];
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      urls.push(`data:image/png;base64,${part.inlineData.data}`);
    }
  }
  
  if (urls.length === 0) throw new Error("Görüntü oluşturulamadı.");
  return urls;
};

export const generateReferenceImage = async (data: InfluencerData): Promise<string> => {
  const images = await generateInfluencerPhotos(data);
  return images[0];
};

// Handle both standard wizard data and profile-based video generation
export const generateInfluencerVideo = async (data: InfluencerData | InfluencerProfile, promptOrRefFrame: string): Promise<string> => {
  const ai = getAI();
  
  let finalPrompt = "";
  let base64Data = "";
  let mimeType = "image/png";
  let aspectRatio: "9:16" | "16:9" = "9:16";

  if (promptOrRefFrame.startsWith('data:')) {
    // Standard Wizard flow: reference frame is base64
    const [header, dataStr] = promptOrRefFrame.split(',');
    base64Data = dataStr;
    mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
    const iData = data as InfluencerData;
    
    // Incorporate music choice into the visual rhythm description
    const musicVibe = iData.videoMusic !== 'Hiçbiri' && iData.videoMusic !== 'None' 
      ? `The visual rhythm should match a ${iData.videoMusic} music style (e.g., specific pacing or vibe).` 
      : "";

    finalPrompt = `${iData.videoMotionPrompt}. ${musicVibe} High-end cinematic production of ${iData.scenario.role}.`;
    aspectRatio = iData.videoAspectRatio;
  } else {
    // Profile flow: reference frame is from profileImage, second arg is text prompt
    const profile = data as InfluencerProfile;
    finalPrompt = `${promptOrRefFrame}. Featuring ${profile.name}, who is a ${profile.personality} ${profile.niche} influencer.`;
    if (profile.profileImage) {
      const [header, dataStr] = profile.profileImage.split(',');
      base64Data = dataStr;
      mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
    }
    aspectRatio = "9:16";
  }

  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: finalPrompt,
    image: base64Data ? {
      imageBytes: base64Data,
      mimeType: mimeType
    } : undefined,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video generation failed");

  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

// Generate an initial influencer persona with structured data
export const generatePersona = async (niche: NicheType, personality: PersonalityType, notes: string): Promise<InfluencerPersona> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a detailed AI influencer persona for the ${niche} niche with a ${personality} personality. Additional notes: ${notes}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          niche: { type: Type.STRING, enum: Object.values(NicheType) },
          personality: { type: Type.STRING, enum: Object.values(PersonalityType) },
          bio: { type: Type.STRING },
          catchphrase: { type: Type.STRING },
          backstory: { type: Type.STRING },
        },
        required: ["name", "niche", "personality", "bio", "catchphrase", "backstory"],
      }
    }
  });
  
  const text = response.text || "{}";
  return JSON.parse(text) as InfluencerPersona;
};

// Generate a specific influencer image based on their existing profile
export const generateInfluencerImage = async (profile: InfluencerProfile, prompt: string): Promise<string> => {
  const ai = getAI();
  const fullPrompt = `Influencer: ${profile.name}. Niche: ${profile.niche}. Personality: ${profile.personality}. 
    Scene: ${prompt}. Catchphrase context: ${profile.catchphrase}. 
    High quality influencer photography, 8k, cinematic lighting.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: fullPrompt,
    config: {
      imageConfig: { aspectRatio: "9:16" }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Görüntü oluşturulamadı.");
};
