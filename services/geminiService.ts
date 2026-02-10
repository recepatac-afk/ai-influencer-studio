import { GoogleGenAI, Type } from "@google/genai";
import { InfluencerData, NicheType, PersonalityType, InfluencerPersona, InfluencerProfile } from "../types";

// ✅ API Anahtarı
const getAI = () => new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

// Gelişmiş Metin Temizleyici (Link bozulmasın diye)
const cleanText = (text: string) => {
  return text
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Türkçe harfleri İngilizceye çevir
    .replace(/[^a-zA-Z0-9 ]/g, "") // Nokta, virgül vs. hepsini sil
    .trim();
};

// 📸 FOTOĞRAF ÜRETİMİ (.JPG GARANTİLİ FİNAL MOD)
export const generateInfluencerPhotos = async (data: InfluencerData): Promise<string[]> => {
  console.log("Resim üretimi JPG Final Mod ile başlıyor...", data);

  try {
      // 1. Verileri temizle
      const role = cleanText(data.scenario?.role || "influencer");
      const outfit = cleanText(data.outfit || "fashion");
      const location = cleanText(data.location || "studio");
      const emotion = cleanText(data.scenario?.emotion || "cool");

      // 2. Prompt (Kısa ve net)
      const prompt = `photo of a ${role} wearing ${outfit} in ${location}, ${emotion} look, realistic`;

      // 3. Linki Oluştur
      const encodedPrompt = encodeURIComponent(prompt);
      const randomSeed = Math.floor(Math.random() * 999999);
      
      // ⚠️ İŞTE SİHİRLİ FORMAT:
      // - pollinations.ai/p/ (Yeni adres)
      // - .jpg (Tarayıcının resim olduğunu anlaması için ŞART)
      // - 720x1280 (Daha hızlı yüklenir)
      // - model=flux (En kalitelisi)
      const imageUrl = `https://pollinations.ai/p/${encodedPrompt}.jpg?width=720&height=1280&nologo=true&seed=${randomSeed}&model=flux`;
      
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
  return `https://pollinations.ai/p/${encodedPrompt}.jpg?width=800&height=800&nologo=true&seed=${Math.floor(Math.random()*1000)}&model=flux`;
};
