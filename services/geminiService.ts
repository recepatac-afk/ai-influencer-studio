// api/generateImage.ts (Vercel Serverless Function)
// Dosya yeri: api/generateImage.ts (proje root'ta api klasörü oluştur)

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = request.body;
  const stabilityKey = process.env.VITE_STABILITY_API_KEY;

  if (!stabilityKey) {
    return response.status(500).json({ error: 'API key not configured' });
  }

  if (!prompt) {
    return response.status(400).json({ error: 'Prompt is required' });
  }

  try {
    console.log('🎨 Stability AI ile resim üretiliyor (Backend)...');

    const stabilityResponse = await fetch(
      'https://api.stability.ai/v1/generate',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${stabilityKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          samples: 1,
          steps: 30,
          guidance_scale: 7.5,
          width: 512,
          height: 768,
        }),
      }
    );

    if (!stabilityResponse.ok) {
      const errorData = await stabilityResponse.json().catch(() => ({ message: 'Unknown error' }));
      console.error('Stability API Error:', stabilityResponse.status, errorData);
      return response.status(stabilityResponse.status).json({
        error: `Stability API Error: ${errorData.message || stabilityResponse.statusText}`,
      });
    }

    const data = await stabilityResponse.json();

    if (!data.artifacts || data.artifacts.length === 0) {
      return response.status(400).json({ error: 'No images returned from Stability AI' });
    }

    const imageBase64 = data.artifacts[0].base64;
    console.log('✅ Resim başarıyla oluşturuldu!');

    return response.status(200).json({
      success: true,
      image: `data:image/png;base64,${imageBase64}`,
    });
  } catch (error: any) {
    console.error('❌ Backend Error:', error.message);
    return response.status(500).json({
      error: `Backend Error: ${error.message}`,
    });
  }
}
