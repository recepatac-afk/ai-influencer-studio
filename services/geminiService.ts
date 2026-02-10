import { GoogleGenAI, Type } from "@google/genai";
import { InfluencerData, NicheType, PersonalityType, InfluencerPersona, InfluencerProfile } from "../types";

// ✅ API Anahtarı
const getAI = () => new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

// Temizleyici: Sadece İngilizce harfler kalsın, gerisi gitsin.
const cleanText = (text: string) => {
  return text
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Türkçe karakterleri düzelt
    .replace(/[^a-zA-Z0-9 ]/g, "") // Nokta virgül vs temizle
    .trim();
};

// 📸 FOTOĞRAF ÜRETİMİ (API KAPISI - CORB HATASI OLMAZ)
export const generateInfluencerPhotos = async (data: InfluencerData): Promise<string[]> => {
  console.log("Resim üretimi API Modu ile başlıyor...", data);

  try {
      // 1. Verileri temizle
      const role = cleanText(data.scenario?.role || "influencer");
      const outfit = cleanText(data.outfit || "fashion");
      const location = cleanText(data.location || "studio");

      // 2. Prompt (Basit cümle)
      const prompt = `photo of ${role} wearing ${outfit} in ${location} realistic`;

      // 3. Linki Oluştur
      // encodeURIComponent: Boşlukları %20 yapar, URL bozulmaz.
      const encodedPrompt = encodeURIComponent(prompt);
      const randomSeed = Math.floor(Math.random() * 999999);
      
      // ⚠️ DOĞRU KAPI BURASI:
      // 'image.pollinations.ai/prompt/' -> Burası direkt JPG verir.
      // 'pollinations.ai/p/' -> Burası web sayfası verir (Bu yüzden hata alıyorduk).
      // .jpg uzantısına gerek yoktur, burası zaten resim fabrikasıdır.
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?nologo=true&seed=${randomSeed}&model=turbo`;
      
      console.log("Oluşturulan Resim Linki:", imageUrl);
      
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
  const safeName = cleanText(profile.name || "User");
  const encodedPrompt = encodeURIComponent(`Portrait of ${safeName}`);
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?nologo=true&seed=${Math.floor(Math.random()*1000)}&model=turbo`;
};
