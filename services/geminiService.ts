import { GoogleGenAI, Type } from "@google/genai";
import { InfluencerData, NicheType, PersonalityType, InfluencerPersona, InfluencerProfile } from "../types";

// ✅ API Anahtarı (Sadece Metin işlemleri için)
const getAI = () => new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

// 📸 FOTOĞRAF ÜRETİMİ (YENİ ADRES MODU)
export const generateInfluencerPhotos = async (data: InfluencerData): Promise<string[]> => {
  console.log("Resim üretimi yeni adresten başlıyor...", data);

  try {
      // 1. Detayları al
      const role = data.scenario?.role || "influencer";
      const outfit = data.outfit || "stylish outfit";
      const pose = data.scenario?.pose || "posing";
      const emotion = data.scenario?.emotion || "confident";
      const location = data.location || "studio";
      const time = data.timeAndSeason?.timeOfDay || "daylight";

      // 2. Prompt Hazırla
      const prompt = `Best quality, masterpiece, ultra realistic, 8k, raw photo.
      Subject: A beautiful ${role}, wearing ${outfit}.
      Action: ${pose} pose, ${emotion} expression.
      Location: ${location}, ${time} lighting.
      Details: high detailed skin texture, cinematic shot, professional photography.`;

      // 3. Linki Oluştur
      const encodedPrompt = encodeURIComponent(prompt);
      const randomSeed = Math.floor(Math.random() * 999999);
      
      // ⚠️ DEĞİŞİKLİK BURADA: 
      // Eski Adres: image.pollinations.ai/prompt/... (Kapandı)
      // Yeni Adres: pollinations.ai/p/... (Yeni Sistem)
      const imageUrl = `https://pollinations.ai/p/${encodedPrompt}?width=1080&height=1920&seed=${randomSeed}&model=flux&nologo=true`;
      
      return [imageUrl];

  } catch (error) {
      console.error("Hata:", error);
      return ["https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80"];
  }
};

export const generateReferenceImage = async (data: InfluencerData): Promise<string> => {
  const images = await generateInfluencerPhotos(data);
  return images[0] || ""; 
};

// 🎥 VİDEO
export const generateInfluencerVideo = async (data: InfluencerData | InfluencerProfile, promptOrRefFrame: string): Promise<string> => {
   return "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4";
};

// 👤 PERSONA
export const generatePersona = async (niche: NicheType, personality: PersonalityType, notes: string): Promise<InfluencerPersona> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `Generate a JSON for influencer persona (${niche}, ${personality}). Fields: name, niche, personality, bio, catchphrase, backstory.`,
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) {
      return { name: "Alya", niche: NicheType.FASHION, personality: PersonalityType.FRIENDLY, bio: "AI", catchphrase: "Selam", backstory: "TR" };
  }
};

// 🖼️ PROFİL RESMİ
export const generateInfluencerImage = async (profile: InfluencerProfile, prompt: string): Promise<string> => {
  const encodedPrompt = encodeURIComponent(`Portrait of ${profile.name}, ${prompt}`);
  // Burada da yeni adresi kullanıyoruz
  return `https://pollinations.ai/p/${encodedPrompt}?width=800&height=800&seed=${Math.floor(Math.random()*1000)}&model=flux&nologo=true`;
};
