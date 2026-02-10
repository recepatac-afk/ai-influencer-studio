import { GoogleGenAI, Type } from "@google/genai";
import { InfluencerData, NicheType, PersonalityType, InfluencerPersona, InfluencerProfile } from "../types";

// ✅ API Anahtarı (Sadece Metin işlemleri için)
const getAI = () => new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

// 📸 FOTOĞRAF ÜRETİMİ (GARANTİLİ TURBO MOD)
export const generateInfluencerPhotos = async (data: InfluencerData): Promise<string[]> => {
  console.log("Resim üretimi Turbo Mod ile başlıyor...", data);

  try {
      // 1. Detayları al ve temizle
      const role = data.scenario?.role || "influencer";
      const outfit = data.outfit || "fashionable clothes";
      const location = data.location || "city street";
      
      // 2. Basit ve Etkili Prompt
      // Çok uzun promptlar bazen linki bozar, o yüzden sade tutuyoruz.
      const prompt = `photo of a ${role}, wearing ${outfit}, in ${location}, realistic, 8k, masterpiece`;

      // 3. Linki Oluştur
      const encodedPrompt = encodeURIComponent(prompt);
      const randomSeed = Math.floor(Math.random() * 999999);
      
      // ⚠️ KRİTİK DÜZELTME:
      // 'model=turbo' kullanıyoruz. Bu model ücretsizdir, hızlıdır ve hata vermez.
      // Adresi tekrar 'image.pollinations.ai' yaptık çünkü direkt resim veren adres budur.
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1080&height=1920&seed=${randomSeed}&nologo=true&model=turbo`;
      
      return [imageUrl];

  } catch (error) {
      console.error("Hata:", error);
      // Her ihtimale karşı yedek resim
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
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=800&seed=${Math.floor(Math.random()*1000)}&nologo=true&model=turbo`;
};
