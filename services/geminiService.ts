
```typescript
import { GoogleGenAI, Type } from "@google/genai";
import { InfluencerData, NicheType, PersonalityType, InfluencerPersona, InfluencerProfile } from "../types";

// ✅ API Anahtarı Bağlantısı
const getAI = () => new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

const base64ToPart = (base64: string) => {
  const [header, data] = base64.split(',');
  const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
  return { inlineData: { data, mimeType } };
};

// 📸 FOTOĞRAF ÜRETİMİ (Imagen 3 Modeli - GERÇEK MOD)
export const generateInfluencerPhotos = async (data: InfluencerData): Promise<string[]> => {
  const ai = getAI();
  
  // Prompt (Komut) Hazırlığı
  const prompt = `Photorealistic influencer photo, 8k resolution.
    Subject: ${data.scenario.role}, ${data.scenario.pose} pose, ${data.scenario.emotion} expression.
    Look Details: ${data.outfit} style outfit.
    Location: ${data.location}.
    Lighting: ${data.scenario.mood}, ${data.timeAndSeason.timeOfDay}.
    Camera: ${data.scenario.angle}, cinematic depth of field.
    Make it look highly realistic, detailed skin texture, professional photography.`;

  // 1. DENEME: Referans Resimli Üretim
  try {
      const parts: any[] = [{ text: prompt }];
      
      // Yüklenen resimleri modele ekle
      if (data.images.length > 0) {
        data.images.forEach(img => parts.push(base64ToPart(img)));
        parts[0].text += " (Reference images provided for facial structure/identity)";
      }

      const response = await ai.models.generateContent({
        model: 'imagen-3.0-generate-001', // ✅ Ressam Model
        contents: { parts },
        config: {
          googleSearchRetrieval: { disabled: true },
        }
      });

      const urls: string[] = [];
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          urls.push(`data:image/png;base64,${part.inlineData.data}`);
        }
      }
      
      if (urls.length > 0) return urls;

  } catch (error) {
      console.log("Referanslı üretim desteklenmedi, metinle deneniyor...", error);
  }

  // 2. DENEME: Sadece Metinle Üretim (Fallback)
  try {
    const response = await ai.models.generateContent({
        model: 'imagen-3.0-generate-001', // ✅ Ressam Model
        contents: { parts: [{ text: prompt }] }
      });

      const urls: string[] = [];
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          urls.push(`data:image/png;base64,${part.inlineData.data}`);
        }
      }
      
      if (urls.length === 0) throw new Error("Görüntü oluşturulamadı. Model yanıtı boş.");
      return urls;

  } catch (finalError: any) {
      console.error("Görüntü üretimi başarısız:", finalError);
      // Hata olursa kullanıcıya hatayı gösterelim ki anlasın
      alert("Resim üretilemedi. Hata: " + (finalError.message || finalError));
      return [];
  }
};

export const generateReferenceImage = async (data: InfluencerData): Promise<string> => {
  const images = await generateInfluencerPhotos(data);
  return images[0] || ""; 
};

// 🎥 VİDEO ÜRETİMİ (Veo Modeli - GERÇEK MOD)
export const generateInfluencerVideo = async (data: InfluencerData | InfluencerProfile, promptOrRefFrame: string): Promise<string> => {
  const ai = getAI();
  
  let finalPrompt = "";
  let base64Data = "";
  let mimeType = "image/png";
  let aspectRatio: "9:16" | "16:9" = "9:16";

  if (promptOrRefFrame.startsWith('data:')) {
    const [header, dataStr] = promptOrRefFrame.split(',');
    base64Data = dataStr;
    mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
    const iData = data as InfluencerData;
    
    const musicVibe = iData.videoMusic !== 'Hiçbiri' && iData.videoMusic !== 'None' 
      ? `The visual rhythm should match a ${iData.videoMusic} music style.` 
      : "";

    finalPrompt = `${iData.videoMotionPrompt}. ${musicVibe} Cinematic shot of ${iData.scenario.role}.`;
    aspectRatio = iData.videoAspectRatio;
  } else {
    const profile = data as InfluencerProfile;
    finalPrompt = `${promptOrRefFrame}. Featuring ${profile.name}, ${profile.niche} influencer.`;
    if (profile.profileImage) {
      const [header, dataStr] = profile.profileImage.split(',');
      base64Data = dataStr;
      mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
    }
  }

  try {
    let operation = await ai.models.generateVideos({
        model: 'veo-2.0-generate-001', 
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

    while (!operation.done && operation.name) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        console.log("Video işleniyor...");
    }

    const downloadLink = operation.result?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video linki alınamadı");
    return downloadLink;
  } catch (e: any) {
      console.error("Video hatası:", e);
      alert("Video üretilemedi. Hata: " + (e.message || e));
      throw new Error("Video üretimi başarısız.");
  }
};

// 👤 PERSONA ÜRETİMİ (Metin Modeli - Gemini 2.0 Flash)
export const generatePersona = async (niche: NicheType, personality: PersonalityType, notes: string): Promise<InfluencerPersona> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
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

// 🖼️ PROFİL RESMİ (Ressam Modeli - Imagen 3)
export const generateInfluencerImage = async (profile: InfluencerProfile, prompt: string): Promise<string> => {
  const ai = getAI();
  const fullPrompt = `Influencer photography of ${profile.name}, ${profile.niche} niche.
    Scene: ${prompt}. Mood: ${profile.personality}.
    High quality, photorealistic, 8k.`;

  try {
      const response = await ai.models.generateContent({
        model: 'imagen-3.0-generate-001', 
        contents: fullPrompt,
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      throw new Error("Resim verisi boş.");
  } catch (e) {
      console.error("Profil resmi hatası:", e);
      return "https://via.placeholder.com/1080x1920?text=Hata";
  }
};

```
