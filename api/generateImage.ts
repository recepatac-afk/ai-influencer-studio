// Vercel Serverless Function - Google Imagen Proxy
export default async function handler(req, res) {
  // 1. CORS Ayarları (Tarayıcının erişmesine izin ver)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Tarayıcı önden "Erişebilir miyim?" diye sorarsa (OPTIONS) "Evet" de.
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // 2. İstekten gelen prompt'u al
    const { prompt } = req.body || {};
    
    if (!prompt) {
        return res.status(400).json({ error: 'Prompt (komut) eksik.' });
    }

    // 3. API Anahtarını Kontrol Et
    const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        throw new Error("Sunucuda API Anahtarı (VITE_GEMINI_API_KEY) bulunamadı. Vercel ayarlarını kontrol et.");
    }

    console.log("Google API'ye istek gönderiliyor...");

    // 4. Google Imagen 3 Modeline Doğrudan İstek At (SDK kullanmadan fetch ile)
    const googleResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instances: [
            { prompt: prompt }
          ],
          parameters: {
            sampleCount: 1,
            aspectRatio: "9:16" 
          }
        })
      }
    );

    if (!googleResponse.ok) {
        const errorText = await googleResponse.text();
        console.error("Google API Hatası:", errorText);
        throw new Error(`Google API Hatası: ${errorText}`);
    }

    const data = await googleResponse.json();
    
    // 5. Gelen Resmi Base64 Olarak Al
    // Google'ın yanıt yapısı: predictions[0].bytesBase64Encoded
    const imageBase64 = data.predictions?.[0]?.bytesBase64Encoded;

    if (!imageBase64) {
        throw new Error("Google boş resim verisi döndürdü.");
    }

    // 6. Başarılı Sonucu Frontend'e Gönder
    return res.status(200).json({ 
        success: true, 
        image: `data:image/png;base64,${imageBase64}` 
    });

  } catch (error) {
    console.error("Sunucu Hatası:", error);
    // Frontend'in anlayacağı formatta hata dön
    return res.status(500).json({ 
        error: error.message || "Bilinmeyen sunucu hatası" 
    });
  }
}
