/**
 * Service to interact with the Google Gemini API safely in browser
 */

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

/**
 * Retrieves the Gemini API key, prioritizing the environment variable
 * and falling back to localStorage for local development/testing.
 */
export function getGeminiApiKey(): string {
  const envKey = (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
  if (envKey) return envKey;
  
  if (typeof window !== 'undefined') {
    return (localStorage.getItem('elo_gemini_api_key') || '').trim();
  }
  
  return '';
}

/**
 * Send chat history to Gemini and get response
 * @param chatHistory Array of message history mapped to Gemini roles (user, model)
 * @param systemInstruction Prompt instructions defining the AI role/behavior
 */
export async function sendChatMessage(
  chatHistory: ChatMessage[],
  systemInstruction: string
): Promise<string> {
  const isProduction = import.meta.env.PROD;
  const devApiKey = getGeminiApiKey();

  // Route through Vercel server proxy in production or if no local dev key is present
  if (isProduction || !devApiKey) {
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatHistory,
          systemInstruction
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error || `HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return data.text;
    } catch (proxyError) {
      console.error('Error in sendChatMessage via secure proxy:', proxyError);
      
      // If proxy fails and no dev key, drop to mock mode
      if (!devApiKey) {
        console.warn('Proxy failed and no local VITE_GEMINI_API_KEY found. Operating in MOCK mode.');
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(`MOCK_MODE_RESPONSE`);
          }, 800);
        });
      }
    }
  }

  const apiKey = devApiKey;

  // Fallback to mock mode if API key is not present
  if (!apiKey) {
    console.warn('VITE_GEMINI_API_KEY not found in environment or localStorage. Operating in MOCK mode.');
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`MOCK_MODE_RESPONSE`);
      }, 800);
    });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
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

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textResponse) {
      throw new Error('Invalid response structure received from Gemini API');
    }

    return textResponse;
  } catch (error) {
    console.error('Error in sendChatMessage:', error);
    throw error;
  }
}
