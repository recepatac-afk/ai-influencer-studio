import { GoogleGenAI } from "@google/genai";
import { InfluencerData, NicheType, PersonalityType, InfluencerPersona, InfluencerProfile } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

// 🛠️ ÖZEL TEMİZLEYİCİ (CORB Hatasını Önler)
// Boşlukları ve garip harfleri siler, kelimeleri "_" ile birleştirir.
// Örnek: "Kırmızı Elbise" -> "Kirmizi_Elbise" olur.
const cleanText = (text: string) => {
  return text
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Türkçe harfleri İngilizce yap
    .replace(/[^a-zA-Z0-9 ]/g, "") // Özel işaretleri sil
    .trim()
    .replace(/\s+/g, "_"); // BOŞLUKLARI ALT ÇİZGİ YAP (Çok Önemli)
};

export const generateInfluencerPhotos = async (data: InfluencerData): Promise<string[]> => {
  console.log("Resim üretimi 'Basit Link Modu' ile başlıyor...", data);

  try {
      const role = cleanText(data.scenario?.role || "influencer");
      const outfit = cleanText(data.outfit || "fashion");
      const location = cleanText(data.location || "studio");

      // Prompt'u dosya ismi gibi hazırlıyoruz
      // Örnek: photo_of_influencer_wearing_fashion_in_studio_realistic
      const prompt = `photo_of_${role}_wearing_${outfit}_in_${location}_realistic`;
      
      const randomSeed = Math.floor(Math.random() * 999999);

      // ⚠️ FARK BURADA:
      // 1. encodeURIComponent YOK (Tarayıcıyı yormaz)
      // 2. .jpg uzantısı VAR
      // 3. model=turbo (Çok hızlıdır, CORB hatasına düşmez)
      const imageUrl = `https://pollinations.ai/p/${prompt}.jpg?width=720&height=1280&nologo=true&seed=${randomSeed}&model=turbo`;
      
      console.log("✅ Oluşturulan Link:", imageUrl);
      
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

export const generateInfluencerVideo = async (data: InfluencerData | InfluencerProfile, promptOrRefFrame: string): Promise<string> => {
   return "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4";
};

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

export const generateInfluencerImage = async (profile: InfluencerProfile, prompt: string): Promise<string> => {
  const safeName = cleanText(profile.name || "User");
  return `https://pollinations.ai/p/Portrait_of_${safeName}.jpg?width=800&height=800&nologo=true&seed=${Math.floor(Math.random()*1000)}&model=turbo`;
};
