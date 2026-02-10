import { GoogleGenAI, Type } from "@google/genai";
import { InfluencerData, NicheType, PersonalityType, InfluencerPersona, InfluencerProfile } from "../types";

// ✅ API Anahtarı
const getAI = () => new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

// Türkçe ve özel karakter temizleyici (Gelişmiş)
const cleanText = (text: string) => {
  return text
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Aksanları kaldır
    .replace(/[^a-zA-Z0-9 ]/g, "") // Sadece İngilizce harf ve rakam kalsın
    .trim();
};

// 📸 FOTOĞRAF ÜRETİMİ (TURBO FİNAL)
export const generateInfluencerPhotos = async (data: InfluencerData): Promise<string[]> => {
  console.log("Resim üretimi Turbo Final Mod ile başlıyor...", data);

  try {
      // 1. Verileri temizle
      const role = cleanText(data.scenario?.role || "influencer");
      const outfit = cleanText(data.outfit || "fashion");
      const location = cleanText(data.location || "studio");
      const emotion = cleanText(data.scenario?.emotion || "cool");

      // 2. Prompt (Kısa ve net tutuyoruz ki link bozulmasın)
      const prompt = `photo of a ${role} wearing ${outfit} in ${location}, ${emotion} look, realistic, 8k`;

      // 3. Linki Oluştur
      const encodedPrompt = encodeURIComponent(prompt);
      const randomSeed = Math.floor(Math.random() * 999999);
      
      // ⚠️ KESİN ÇÖZÜM:
      // - 'pollinations.ai/p/' kullanıyoruz (Yeni adres)
      // - .jpg uzantısını kaldırdık (Tarayıcı bazen şaşırıyor)
      // - model=turbo (Çok hızlı olduğu için zaman aşımına uğramaz)
      const imageUrl = `https://pollinations.ai/p/${encodedPrompt}?width=1080&height=1920&nologo=true&seed=${randomSeed}&model=turbo`;
      
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
  return `https://pollinations.ai/p/${encodedPrompt}?width=800&height=800&nologo=true&seed=${Math.floor(Math.random()*1000)}&model=turbo`;
};
