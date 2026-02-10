import { GoogleGenAI, Type } from "@google/genai";
import { InfluencerData, NicheType, PersonalityType, InfluencerPersona, InfluencerProfile } from "../types";

// ✅ API Anahtarı (Sadece Metin işlemleri için)
const getAI = () => new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

// Türkçe karakterleri İngilizceye çeviren yardımcı fonksiyon
const cleanText = (text: string) => {
  return text
    .replace(/ğ/g, "g").replace(/Ğ/g, "G")
    .replace(/ü/g, "u").replace(/Ü/g, "U")
    .replace(/ş/g, "s").replace(/Ş/g, "S")
    .replace(/ı/g, "i").replace(/İ/g, "I")
    .replace(/ö/g, "o").replace(/Ö/g, "O")
    .replace(/ç/g, "c").replace(/Ç/g, "C")
    // Linki bozabilecek diğer her şeyi sil (Sadece harf, sayı ve boşluk kalsın)
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .trim();
};

// 📸 FOTOĞRAF ÜRETİMİ (FİNAL VERSİYON)
export const generateInfluencerPhotos = async (data: InfluencerData): Promise<string[]> => {
  console.log("Resim üretimi Final Mod ile başlıyor...", data);

  try {
      // 1. Verileri al
      const role = data.scenario?.role || "influencer";
      const outfit = data.outfit || "fashion";
      const location = data.location || "studio";
      const emotion = data.scenario?.emotion || "cool";

      // 2. Prompt'u hazırla (Türkçe karakterleri temizle!)
      // Örnek: "İş Gücü" -> "Is Gucu" olur. Bu sayede link bozulmaz.
      const safeRole = cleanText(role);
      const safeOutfit = cleanText(outfit);
      const safeLocation = cleanText(location);
      const safeEmotion = cleanText(emotion);
      
      const prompt = `photo of a ${safeRole} wearing ${safeOutfit} in ${safeLocation}, ${safeEmotion} look, realistic, 8k, masterpiece`;

      // 3. Linki Oluştur
      // encodeURIComponent ile boşlukları %20 yaparız
      const encodedPrompt = encodeURIComponent(prompt);
      const randomSeed = Math.floor(Math.random() * 999999);
      
      // ⚠️ YENİ ADRES YAPISI:
      // pollinations.ai/p/ + PROMPT + .jpg + PARAMETRELER
      const imageUrl = `https://pollinations.ai/p/${encodedPrompt}.jpg?width=1080&height=1920&nologo=true&seed=${randomSeed}&model=flux`;
      
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
