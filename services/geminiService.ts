import { GoogleGenAI, Type } from "@google/genai";
import { InfluencerData, NicheType, PersonalityType, InfluencerPersona, InfluencerProfile } from "../types";

// ✅ API Anahtarı (Sadece Metin/Persona için gerekli, Resim için değil!)
const getAI = () => new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

// 📸 FOTOĞRAF ÜRETİMİ (DOĞRUDAN TARAYICI MODU)
// Google API Key derdi yok, Vercel sunucu hatası yok.
// Bu kod senin tarifini alır ve anında resmi getirir.
export const generateInfluencerPhotos = async (data: InfluencerData): Promise<string[]> => {
  console.log("Resim üretimi başlatılıyor (Pollinations Modu)...");

  // 1. Senin seçtiğin detayları güçlü bir İngilizce komuta çeviriyoruz
  const prompt = `Best quality, masterpiece, ultra realistic, 8k, raw photo.
  Subject: A beautiful ${data.scenario.role} influencer, ${data.outfit} outfit.
  Action: ${data.scenario.pose} pose, ${data.scenario.emotion} expression.
  Location: ${data.location}, atmospheric lighting, ${data.timeAndSeason.timeOfDay}.
  Details: High detailed skin texture, cinematic shot, depth of field.`;

  // 2. URL için güvenli hale getir
  const encodedPrompt = encodeURIComponent(prompt);
  
  // 3. Her seferinde farklı resim çıksın diye rastgele sayı ekle
  const randomSeed = Math.floor(Math.random() * 100000);

  // 4. Doğrudan Resim Linkini Oluştur (Flux Modeli - Çok Gerçekçi)
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1080&height=1920&nologo=true&seed=${randomSeed}&model=flux`;

  // 5. Resmi siteye gönder
  // (Yüklenmesi 3-4 saniye sürebilir, tarayıcı halleder)
  return [imageUrl];
};

export const generateReferenceImage = async (data: InfluencerData): Promise<string> => {
  const images = await generateInfluencerPhotos(data);
  return images[0] || ""; 
};

// 🎥 VİDEO ÜRETİMİ (Video çok masraflı olduğu için şimdilik hazır video dönüyoruz)
export const generateInfluencerVideo = async (data: InfluencerData | InfluencerProfile, promptOrRefFrame: string): Promise<string> => {
   return "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4";
};

// 👤 PERSONA ÜRETİMİ (Burası Google Gemini ile çalışmaya devam eder)
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
      console.error("Persona hatası:", e);
      return { 
        name: "Alya", 
        niche: NicheType.FASHION, 
        personality: PersonalityType.FRIENDLY, 
        bio: "Yapay zeka asistanı.", 
        catchphrase: "Merhaba!", 
        backstory: "İstanbul" 
      };
  }
};

// 🖼️ PROFİL RESMİ
export const generateInfluencerImage = async (profile: InfluencerProfile, prompt: string): Promise<string> => {
  const encodedPrompt = encodeURIComponent(`Professional portrait of ${profile.name}, ${profile.niche} influencer, ${prompt}, 8k, realistic`);
  const randomSeed = Math.floor(Math.random() * 1000);
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=800&nologo=true&seed=${randomSeed}&model=flux`;
};
