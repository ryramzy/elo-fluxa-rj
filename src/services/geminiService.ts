/**
 * Service to interact with the Google Gemini API safely in browser
 */

const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || process.env.API_KEY || '').trim();

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
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
  // Fallback to mock mode if API key is not present
  if (!GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY not found. Operating in MOCK mode.');
    return new Promise((resolve) => {
      setTimeout(() => {
        const lastMsg = chatHistory[chatHistory.length - 1]?.parts[0]?.text || '';
        resolve(`[MOCK RESPONSE - API Key missing] That's interesting! You said: "${lastMsg}". Please add a VITE_GEMINI_API_KEY to your environment variables to enable real AI conversation.`);
      }, 1000);
    });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

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
