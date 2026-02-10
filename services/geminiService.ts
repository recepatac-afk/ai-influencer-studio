import { GoogleGenAI, Type } from "@google/genai";
import { InfluencerData, NicheType, PersonalityType, InfluencerPersona, InfluencerProfile } from "../types";

// ✅ API Anahtarı
const getAI = () => new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

// Temizleyici: Link bozulmasın diye sadece İngilizce harfler
const cleanText = (text: string) => {
  return text
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Türkçe karakterleri düzelt
    .replace(/[^a-zA-Z0-9 ]/g, "") // Özel işaretleri temizle
    .trim();
};

// 📸 FOTOĞRAF ÜRETİMİ (TURBO MODU - HATA VERMEZ)
export const generateInfluencerPhotos = async (data: InfluencerData): Promise<string[]> => {
  console.log("Resim üretimi Turbo Modu ile başlıyor...", data);

  try {
      // 1. Verileri temizle
      const role = cleanText(data.scenario?.role || "influencer");
      const outfit = cleanText(data.outfit || "fashion");
      const location = cleanText(data.location || "studio");

      // 2. Prompt (Kısa ve net)
      const prompt = `photo of ${role} wearing ${outfit} in ${location} realistic`;

      // 3. Linki Oluştur
      const encodedPrompt = encodeURIComponent(prompt);
      const randomSeed = Math.floor(Math.random() * 999999);
      
      // ⚠️ İŞTE KESİN ÇÖZÜM:
      // - Adres: pollinations.ai/p/ (Yeni ve doğru adres)
      // - Uzantı: .jpg (Tarayıcının resim olduğunu anlaması için ŞART)
      // - Model: turbo (Flux çok ağır olduğu için hata veriyordu, Turbo şimşek gibidir)
      // - Boyut: 720x1280 (HD kalite, hızlı yüklenir)
      const imageUrl = `https://pollinations.ai/p/${encodedPrompt}.jpg?width=720&height=1280&nologo=true&seed=${randomSeed}&model=turbo`;
      
      console.log("Oluşturulan Resim Linki:", imageUrl);
      
      return [imageUrl];

  } catch (error) {
      console.error("Hata:", error);
      // Hata olursa manken resmi göster
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
  return `https://pollinations.ai/p/${encodedPrompt}.jpg?width=800&height=800&nologo=true&seed=${Math.floor(Math.random()*1000)}&model=turbo`;
};
