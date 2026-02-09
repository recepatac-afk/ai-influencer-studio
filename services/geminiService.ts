import { GoogleGenAI, Type } from "@google/genai";
import { InfluencerData, NicheType, PersonalityType, InfluencerPersona, InfluencerProfile } from "../types";

// ✅ API ANAHTARI BAĞLANTISI
const getAI = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("❌ VITE_GEMINI_API_KEY tanımlanmamış!");
  }
  return new GoogleGenAI({ apiKey });
};

const base64ToPart = (base64: string) => {
  if (!base64.includes(',')) {
    throw new Error("Geçersiz base64 formatı");
  }
  const [header, data] = base64.split(',');
  const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
  return { inlineData: { data, mimeType } };
};

// 📸 RESİM ÜRETİMİ - STABILITY AI (BACKEND PROXY)
export const generateInfluencerPhotos = async (data: InfluencerData): Promise<string[]> => {
  const prompt = `Photorealistic influencer photo, 8k resolution.
    Subject: ${data.scenario.role}, ${data.scenario.pose} pose, ${data.scenario.emotion} expression.
    Look Details: ${data.outfit} style outfit.
    Location: ${data.location}.
    Lighting: ${data.scenario.mood}, ${data.timeAndSeason.timeOfDay}.
    Camera: ${data.scenario.angle}, cinematic depth of field.
    Make it look highly realistic, detailed skin texture, professional photography.`;

  try {
    console.log("🎨 Backend proxy ile resim üretiliyor...");
    
    // BACKEND'e çağrı yap (CORS sorunu yok)
    const response = await fetch('/api/generateImage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Backend Error: ${errorData.error || response.statusText}`);
    }

    const data_response = await response.json();

    if (!data_response.success || !data_response.image) {
      throw new Error("Resim oluşturulamadı");
    }

    console.log("✅ Resim başarıyla oluşturuldu!");
    return [data_response.image];

  } catch (error: any) {
    console.error("❌ RESİM ÜRETİMİ HATASI:", error.message);
    throw error;
  }
};

export const generateReferenceImage = async (data: InfluencerData): Promise<string> => {
  const images = await generateInfluencerPhotos(data);
  if (!images || images.length === 0) {
    throw new Error("Referans resim oluşturulamadı");
  }
  return images[0];
};

// 🎥 VİDEO ÜRETİMİ - GEMINI FLASH
export const generateInfluencerVideo = async (
  data: InfluencerData | InfluencerProfile,
  promptOrRefFrame: string
): Promise<string> => {
  let finalPrompt = "";

  if (promptOrRefFrame.startsWith('data:')) {
    const iData = data as InfluencerData;
    const musicVibe = iData.videoMusic && iData.videoMusic !== 'Hiçbiri' && iData.videoMusic !== 'None' 
      ? `matching ${iData.videoMusic} music style` 
      : "";

    finalPrompt = `${iData.videoMotionPrompt} ${musicVibe}. Cinematic shot of ${iData.scenario.role}.`;
  } else {
    const profile = data as InfluencerProfile;
    finalPrompt = `${promptOrRefFrame}. Featuring ${profile.name}, ${profile.niche} influencer.`;
  }

  try {
    console.log("🎬 Video script oluşturuluyor...");
    
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: {
        parts: [{ text: `Write a short video script for: ${finalPrompt}` }]
      },
      config: {
        googleSearchRetrieval: { disabled: true },
      }
    });

    console.warn("⚠️ Video API beta aşamasında, metin script döndürülüyor");
    return "https://via.placeholder.com/720x1280?text=Video+Coming+Soon";

  } catch (error: any) {
    console.error("❌ VİDEO HATASI:", error.message);
    throw new Error(`Video oluşturulamadı: ${error.message}`);
  }
};

// 👤 PERSONA ÜRETİMİ - GEMINI FLASH ✅
export const generatePersona = async (
  niche: NicheType,
  personality: PersonalityType,
  notes: string = ""
): Promise<InfluencerPersona> => {
  const ai = getAI();
  
  if (!niche || !personality) {
    throw new Error("Niche ve personality zorunludur");
  }
  
  try {
    console.log("👤 Persona üretiliyor...");
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: {
        parts: [{
          text: `Generate a detailed AI influencer persona for the ${niche} niche with ${personality} personality. Notes: ${notes}
          
Return ONLY valid JSON (no markdown, no code blocks) with this structure:
{
  "name": "string (unique name)",
  "niche": "${niche}",
  "personality": "${personality}",
  "bio": "string (2-3 sentences)",
  "catchphrase": "string (memorable phrase)",
  "backstory": "string (interesting background)"
}`
        }]
      },
      config: {
        responseMimeType: "application/json",
      }
    });
    
    const text = response.text || "{}";
    const persona = JSON.parse(text) as InfluencerPersona;
    
    if (!persona.name || !persona.niche) {
      throw new Error("Persona yanıtı eksik alan içeriyor");
    }
    
    console.log("✅ Persona oluşturuldu:", persona.name);
    return persona;
  } catch (error: any) {
    console.error("❌ PERSONA HATASI:", error.message);
    throw new Error(`Persona oluşturulamadı: ${error.message}`);
  }
};

// 🖼️ PROFİL RESMİ - BACKEND PROXY
export const generateInfluencerImage = async (
  profile: InfluencerProfile,
  prompt: string
): Promise<string> => {
  if (!profile.name || !profile.niche) {
    throw new Error("Profil adı ve niche zorunludur");
  }

  const fullPrompt = `Influencer portrait of ${profile.name}, ${profile.niche} niche. Scene: ${prompt}. Mood: ${profile.personality}. Professional photography, high quality, 8k.`;

  try {
    console.log("🖼️ Profil resmi oluşturuluyor...");
    
    // BACKEND'e çağrı yap (CORS sorunu yok)
    const response = await fetch('/api/generateImage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: fullPrompt }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Backend Error: ${errorData.error || response.statusText}`);
    }

    const data_response = await response.json();
    
    if (data_response.success && data_response.image) {
      console.log("✅ Profil resmi oluşturuldu");
      return data_response.image;
    }

    throw new Error("Resim oluşturulamadı");
  } catch (error: any) {
    console.error("❌ PROFİL RESMİ HATASI:", error.message);
    throw new Error(`Profil resmi oluşturulamadı: ${error.message}`);
  }
};
