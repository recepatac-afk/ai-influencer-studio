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
    .replace(/\s+/g, "_"); // ⚠️ ÖNEMLİ: Boşlukları alt çizgi yap
};

// 📸 FOTOĞRAF ÜRETİMİ (POLLINATIONS + UNSPLASH FALLBACK)
export const generateInfluencerPhotos = async (data: InfluencerData): Promise<string[]> => {
  console.log("🎨 Resim üretimi başlıyor...", data);
  try {
    // 1. Verileri temizle
    const role = cleanText(data.scenario?.role || "influencer");
    const outfit = cleanText(data.outfit || "fashion");
    const location = cleanText(data.location || "studio");
    
    // 2. Prompt
    const prompt = `photo_of_${role}_wearing_${outfit}_in_${location}_realistic_8k`;
    
    // 3. Random seed
    const randomSeed = Math.floor(Math.random() * 999999);
    
    // ✅ Pollinations URL
    const pollinationsUrl = `https://pollinations.ai/p/${prompt}.jpg?width=720&height=1280&nologo=true&seed=${randomSeed}&model=turbo`;
    
    console.log("✅ Oluşturulan Resim Linki:", pollinationsUrl);
    
    // ✅ Pollinations döndür
    return [pollinationsUrl];
    
  } catch (error) {
    console.error("❌ Resim oluşturma hatası:", error);
    // Fallback: Unsplash (her zaman çalışır)
    return ["https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80"];
  }
};

export const generateReferenceImage = async (data: InfluencerData): Promise<string> => {
  const images = await generateInfluencerPhotos(data);
  return images[0] || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80"; 
};

// 🎥 VİDEO
export const generateInfluencerVideo = async (
  data: InfluencerData | InfluencerProfile,
  promptOrRefFrame: string
): Promise<string> => {
  console.log("🎬 Video üretiliyor (Placeholder)...");
  return "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4";
};

// 👤 PERSONA - GEMINI FLASH
export const generatePersona = async (
  niche: NicheType,
  personality: PersonalityType,
  notes: string = ""
): Promise<InfluencerPersona> => {
  const ai = getAI();
  
  try {
    console.log("👤 Persona üretiliyor...");
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: {
        parts: [{
          text: `Generate a detailed AI influencer persona for the ${niche} niche with ${personality} personality. Notes: ${notes}
          
Return ONLY valid JSON (no markdown) with this structure:
{
  "name": "string",
  "niche": "${niche}",
  "personality": "${personality}",
  "bio": "string",
  "catchphrase": "string",
  "backstory": "string"
}`
        }]
      },
      config: {
        responseMimeType: "application/json",
      }
    });
    
    const text = response.text || "{}";
    console.log("✅ Persona oluşturuldu");
    return JSON.parse(text) as InfluencerPersona;
    
  } catch (error: any) {
    console.error("❌ Persona hatası:", error.message);
    // Fallback
    return {
      name: "Aurora",
      niche: niche,
      personality: personality,
      bio: "AI-generated influencer",
      catchphrase: "Living the dream!",
      backstory: "From dreams to reality"
    } as InfluencerPersona;
  }
};

// 🖼️ PROFİL RESMİ - POLLINATIONS
export const generateInfluencerImage = async (
  profile: InfluencerProfile,
  prompt: string
): Promise<string> => {
  try {
    console.log("🖼️ Profil resmi üretiliyor...");
    
    const safeName = cleanText(profile.name || "User");
    const safePrompt = cleanText(prompt || "portrait");
    
    const imageUrl = `https://pollinations.ai/p/Portrait_of_${safeName}_${safePrompt}.jpg?width=800&height=800&nologo=true&seed=${Math.floor(Math.random()*999999)}&model=turbo`;
    
    console.log("✅ Profil resmi URL:", imageUrl);
    return imageUrl;
    
  } catch (error: any) {
    console.error("❌ Profil resmi hatası:", error.message);
    // Fallback
    return "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80";
  }
};
