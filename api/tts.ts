import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Preflight check
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { text, accent } = req.body || {};

  if (!text) {
    return res.status(400).json({ error: 'Missing text parameter' });
  }

  // 1. Try ElevenLabs API if key is present
  if (process.env.ELEVENLABS_API_KEY) {
    try {
      console.log(`[TTS Web] Synthesizing with ElevenLabs (accent: ${accent || 'us'})`);
      
      // Map regional accents to ElevenLabs voice IDs
      let voiceId = '21m00Tcm4TlvDq8ikWAM'; // Rachel (US)
      if (accent === 'gb') {
        voiceId = 'AZnzlk1XvdvUeBnXmlld'; // Dom (UK)
      } else if (accent === 'au') {
        voiceId = 'EXAVITQu4vr4xnSDxMaL'; // Bella (Australian-adjacent)
      }

      const elevenlabsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

      const response = await fetch(elevenlabsUrl, {
        method: 'POST',
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          accept: 'audio/mpeg'
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.75,
            similarity_boost: 0.75
          }
        })
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs response error: ${response.status} - ${await response.text()}`);
      }

      const audioBuffer = await response.arrayBuffer();
      res.setHeader('Content-Type', 'audio/mpeg');
      return res.status(200).send(Buffer.from(audioBuffer));
    } catch (err: any) {
      console.error('[TTS Web] ElevenLabs failed, falling back to OpenAI:', err);
    }
  }

  // 2. Try OpenAI TTS if key is present
  if (process.env.OPENAI_API_KEY) {
    try {
      console.log(`[TTS Web] Synthesizing with OpenAI tts-1 (accent: ${accent || 'us'})`);
      
      // Default OpenAI voice allocations
      let voice = 'nova'; // US Female
      if (accent === 'gb' || accent === 'au') {
        voice = 'shimmer'; // Alternative clear voice
      }

      const openaiUrl = 'https://api.openai.com/v1/audio/speech';

      const response = await fetch(openaiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: text,
          voice
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI response error: ${response.status} - ${await response.text()}`);
      }

      const audioBuffer = await response.arrayBuffer();
      res.setHeader('Content-Type', 'audio/mpeg');
      return res.status(200).send(Buffer.from(audioBuffer));
    } catch (err: any) {
      console.error('[TTS Web] OpenAI failed:', err);
    }
  }

  // 3. Signal local Web Speech API fallback
  return res.status(404).json({ error: 'No premium TTS providers configured. Using browser fallback.' });
}
