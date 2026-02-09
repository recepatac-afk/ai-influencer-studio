// Vercel Serverless Function - Google Imagen & Pollinations Hybrid
export default async function handler(req, res) {
  // 1. CORS Ayarları
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { prompt } = req.body || {};
    
    // Eğer prompt yoksa varsayılan bir şeyler uydur
    const finalPrompt = prompt || "Fashion influencer photo, high quality";
    
    const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

    console.log("Resim üretimi başlıyor. Hedef Prompt:", finalPrompt);

    // ---------------------------------------------------------
    // PLAN A: GOOGLE IMAGEN (Önce bunu dener)
    // ---------------------------------------------------------
    if (apiKey) {
        try {
            console.log("Google Imagen deneniyor...");
            const googleResponse = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  instances: [{ prompt: finalPrompt }],
                  parameters: { sampleCount: 1, aspectRatio: "9:16" }
                })
              }
            );

            if (googleResponse.ok) {
                const data = await googleResponse.json();
                const imageBase64 = data.predictions?.[0]?.bytesBase64Encoded;
                if (imageBase64) {
                    console.log("✅ Google Imagen Başarılı!");
                    return res.status(200).json({ 
                        success: true, 
                        image: `data:image/png;base64,${imageBase64}` 
                    });
                }
            } else {
                console.log("⚠️ Google Imagen Hata Verdi (Bu normal, B Planına geçiliyor).");
            }
        } catch (err) {
            console.log("⚠️ Google Bağlantı Hatası:", err.message);
        }
    }

    // ---------------------------------------------------------
    // PLAN B: POLLINATIONS AI (Google yapamazsa bu yapar!)
    // ---------------------------------------------------------
    console.log("🔄 B Planı Devrede: Pollinations AI kullanılıyor...");
    
    // Prompt'u URL uyumlu hale getir
    const encodedPrompt = encodeURIComponent(finalPrompt + ", photorealistic, 8k, highly detailed, influencer photography");
    
    // Pollinations AI ücretsiz ve anahtarsız resim üretir
    // Seed ekleyerek her seferinde farklı resim çıkmasını sağlıyoruz
    const randomSeed = Math.floor(Math.random() * 10000);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=720&height=1280&nologo=true&seed=${randomSeed}&model=flux`;

    return res.status(200).json({ 
        success: true, 
        image: pollinationsUrl,
        note: "Görsel Pollinations AI (B Planı) ile üretildi çünkü Google API meşguldü."
    });

  } catch (error) {
    console.error("Genel Sunucu Hatası:", error);
    return res.status(500).json({ error: "Sunucu hatası oluştu." });
  }
}
