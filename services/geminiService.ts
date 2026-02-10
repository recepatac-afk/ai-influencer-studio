import { GoogleGenAI } from "@google/genai";
import { InfluencerData, NicheType, PersonalityType, InfluencerPersona, InfluencerProfile } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

// 🛡️ VERCEL UYUMLU TEMİZLEYİCİ
// Türkçe karakterleri ve boşlukları yok eder. Linkin bozulmasını engeller.
const cleanText = (text: string) => {
  if (!text) return "model";
  return text
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Türkçe harfleri İngilizceye çevir
    .replace(/[^a-zA-Z0-9]/g, "_") // Harf olmayan her şeyi alt çizgi yap
    .replace(/_+/g, "_") // Çift alt çizgileri teke indir
    .toLowerCase()
    .trim();
};

export const generateInfluencerPhotos = async (data: InfluencerData): Promise<string[]> => {
  // 🚨 KONSOLDA BU YAZIYI GÖRMELİSİN:
  console.log("🚀 VERCEL FİNAL FIX YÜKLENDİ - YENİ ADRES KULLANILIYOR...");

  try {
      const role = cleanText(data.scenario?.role || "influencer");
      const outfit = cleanText(data.outfit || "fashion");
      const location = cleanText(data.location || "studio");

      // Prompt: "photo_of_kadin_wearing_kirmizi_elbise..." gibi olur
      const safePrompt = `photo_of_${role}_wearing_${outfit}_in_${location}_realistic_8k`;
      
      const randomSeed = Math.floor(Math.random() * 100000);

      // ⚠️ DOĞRU ADRES YAPISI:
      // 1. pollinations.ai/p/ (Yeni kapı)
      // 2. .jpg uzantısı (CORB hatasını %100 engeller)
      // 3. nologo=true (Logo olmasın)
      const imageUrl = `https://pollinations.ai/p/${safePrompt}.jpg?width=720&height=1280&model=turbo&nologo=true&seed=${randomSeed}`;
      
      console.log("✅ ÜRETİLEN LİNK:", imageUrl);
      
      return [imageUrl];

  } catch (error) {
      console.error("❌ Hata:", error);
      return ["https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80"];
  }
};

// --- Diğer Fonksiyonlar (Aynı Kalıyor) ---

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
  return `https://pollinations.ai/p/portrait_of_${safeName}.jpg?width=800&height=800&nologo=true&seed=${Math.floor(Math.random()*1000)}&model=turbo`;
};
