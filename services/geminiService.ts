import { GoogleGenAI } from "@google/genai";
import { InfluencerData, NicheType, PersonalityType, InfluencerPersona, InfluencerProfile } from "../types";

// ✅ API Anahtarı
const getAI = () => new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

// Basit temizleyici
const cleanText = (text: string) => {
  return text.replace(/[^a-zA-Z0-9 ]/g, "").trim();
};

// 📸 FOTOĞRAF ÜRETİMİ (CORB ENGELLEYİCİ MOD)
export const generateInfluencerPhotos = async (data: InfluencerData): Promise<string[]> => {
  console.log("Resim üretimi API Kapısı ile başlıyor...", data);

  try {
      // 1. Verileri al
      const role = cleanText(data.scenario?.role || "influencer");
      const outfit = cleanText(data.outfit || "fashion");
      const location = cleanText(data.location || "studio");

      // 2. Prompt
      const prompt = `photo of ${role} wearing ${outfit} in ${location}, realistic, 8k`;

      // 3. Linki Oluştur
      // encodeURIComponent: Boşlukları %20 yapar (En güvenli yöntem)
      const encodedPrompt = encodeURIComponent(prompt);
      const randomSeed = Math.floor(Math.random() * 999999);
      
      // ⚠️ İŞTE ÇÖZÜM: 'image.pollinations.ai'
      // Bu adres tarayıcıya "Bu bir resim dosyasıdır" bilgisini zorla gönderir.
      // CORB hatası vermesi imkansızdır.
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?nologo=true&seed=${randomSeed}&model=turbo&width=1080&height=1920`;
      
      console.log("✅ Oluşturulan Link:", imageUrl);
      
      return [imageUrl];

  } catch (error) {
      console.error("Hata:", error);
      // Hata olursa manken resmi
      return ["https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80"];
  }
};

export const generateReferenceImage = async (data: InfluencerData): Promise<string> => {
  const images = await generateInfluencerPhotos(data);
  return images[0] || ""; 
};

// Video ve Persona aynı kalıyor
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
  const encodedPrompt = encodeURIComponent(`Portrait of ${safeName}`);
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?nologo=true&seed=${Math.floor(Math.random()*1000)}&model=turbo`;
};
