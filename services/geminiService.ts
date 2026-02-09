import { GoogleGenAI, Type } from "@google/genai";
import { InfluencerData, NicheType, PersonalityType, InfluencerPersona, InfluencerProfile } from "../types";

// ✅ API Anahtarı
const getAI = () => new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

// 📸 FOTOĞRAF ÜRETİMİ (Garantili Mod)
export const generateInfluencerPhotos = async (data: InfluencerData): Promise<string[]> => {
  // KULLANICIYA SİTENİN GÜNCELLENDİĞİNİ GÖSTEREN MESAJ
  alert("YENİ SİSTEM DEVREDE! 🚀\nResim Pollinations AI ile oluşturuluyor, lütfen bekleyin...");

  try {
      const prompt = `Best quality, masterpiece, ultra realistic, 8k, raw photo.
      Subject: A beautiful ${data.scenario.role || "influencer"}, wearing ${data.outfit || "stylish outfit"}.
      Action: ${data.scenario.pose || "posing"}, ${data.scenario.emotion || "happy"}.
      Location: ${data.location || "Paris"}, cinematic lighting.
      Details: high detailed skin texture, professional photography.`;

      const encodedPrompt = encodeURIComponent(prompt);
      const randomSeed = Math.floor(Math.random() * 99999);
      
      // Flux Modeli (Xpatla kalitesinde resim verir)
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1080&height=1920&nologo=true&seed=${randomSeed}&model=flux`;
      
      return [imageUrl];

  } catch (error) {
      alert("Hata oldu ama yedek resim gösteriliyor.");
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
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=800&nologo=true&seed=${Math.floor(Math.random()*1000)}&model=flux`;
};
