import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const path = req.url?.split('?')[0] ?? '';

  if ((path.endsWith('/ai/chat') || path === '/api/ai/chat') && req.method === 'POST') {
    return handleChat(req, res);
  }

  return res.status(404).json({ error: `Not found: ${path}` });
}

async function handleChat(req: VercelRequest, res: VercelResponse) {
  try {
    const { chatHistory, systemInstruction } = req.body;

    if (!chatHistory || !systemInstruction) {
      return res.status(400).json({ error: 'Missing chatHistory or systemInstruction parameter' });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      console.warn('[Proxy API] GEMINI_API_KEY not configured on server.');
      return res.status(500).json({ error: 'Gemini API key is not configured on the server.' });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const apiResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: chatHistory,
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
        }
      })
    });

    if (!apiResponse.ok) {
      const errData = await apiResponse.json().catch(() => ({}));
      return res.status(apiResponse.status).json({
        error: errData?.error?.message || `Gemini API error (Status: ${apiResponse.status})`
      });
    }

    const data = await apiResponse.json();
    const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textResponse) {
      return res.status(550).json({ error: 'Invalid response structure received from Gemini API' });
    }

    return res.status(200).json({ text: textResponse });
  } catch (error: any) {
    console.error('Error in Gemini API proxy:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      details: error.message || String(error)
    });
  }
}
