import { GoogleGenAI, Type } from "@google/genai";
import { InfluencerData, NicheType, PersonalityType, InfluencerPersona, InfluencerProfile } from "../types";

// ✅ API Anahtarı
const getAI = () => new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

// Türkçe karakterleri temizleyen ve BOŞLUKLARI ALT ÇİZGİ YAPAN fonksiyon
const cleanText = (text: string) => {
  return text
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Türkçe harfleri düzelt
    .replace(/[^a-zA-Z0-9 ]/g, "") // Özel işaretleri sil
    .trim()
    .replace(/\s+/g, "_"); // ⚠️ ÖNEMLİ: Boşlukları alt çizgi yap (Dosya ismi gibi olsun)
};

// 📸 FOTOĞRAF ÜRETİMİ (TURBO + DOSYA MODU)
export const generateInfluencerPhotos = async (data: InfluencerData): Promise<string[]> => {
  console.log("Resim üretimi Turbo Dosya Modu ile başlıyor...", data);

  try {
      // 1. Verileri temizle (Boşluklar _ olacak)
      const role = cleanText(data.scenario?.role || "influencer");
      const outfit = cleanText(data.outfit || "fashion");
      const location = cleanText(data.location || "studio");
      
      // 2. Prompt (Kelimeler _ ile birleşik olacak)
      // Örnek: "photo_of_influencer_in_Rio_De_Janeiro"
      const prompt = `photo_of_${role}_wearing_${outfit}_in_${location}_realistic_8k`;

      // 3. Linki Oluştur
      const randomSeed = Math.floor(Math.random() * 999999);
      
      // ⚠️ KESİN ÇÖZÜM:
      // - model=turbo (Hata vermez, çok hızlıdır)
      // - .jpg uzantısı var
      // - Prompt içinde boşluk yok, hepsi _ ile birleşik
      const imageUrl = `https://pollinations.ai/p/${prompt}.jpg?width=720&height=1280&nologo=true&seed=${randomSeed}&model=turbo`;
      
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
  return `https://pollinations.ai/p/Portrait_of_${safeName}.jpg?width=800&height=800&nologo=true&seed=${Math.floor(Math.random()*1000)}&model=turbo`;
};
