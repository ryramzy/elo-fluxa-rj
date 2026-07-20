import { VercelRequest, VercelResponse } from '@vercel/node';

interface Message {
  role: 'user' | 'model';
  content: string;
}

interface EvaluationRequest {
  scenario: string;
  history: Message[];
  sentence: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    console.warn('[AI Coach API] GEMINI_API_KEY is not set. Using mock fallback responses.');
    return handleMockResponse(req, res);
  }

  try {
    const { scenario, history, sentence } = req.body as EvaluationRequest;

    if (!scenario || !sentence) {
      return res.status(400).json({ error: 'Missing required parameters: scenario, sentence' });
    }

    // Format chat history for prompt context
    const historyText = history
      ? history.map(m => `${m.role === 'user' ? 'Student' : 'Coach'}: "${m.content}"`).join('\n')
      : '';

    const systemPrompt = `You are a friendly, encouraging Native American English Coach named Elo.
The student is practicing a conversational scenario: "${scenario}".
Here is the conversation history:
${historyText}

The student just spoke this transcribed sentence: "${sentence}".

Evaluate the student's sentence and formulate your response.
Specifically check:
1. Grammar correctness.
2. Natural usage (e.g. if a Brazilian student used "I have 20 years", suggest "I am 20 years old").
3. Vocabulary selection.

Provide a reply as Elo to continue the conversation in character. Keep the reply short (1-2 sentences max).
Provide grammatical corrections or improvement tips in Portuguese so the student can understand easily.

You must return a valid JSON object matching this structure:
{
  "reply": "Elo's conversational response in English. Keep it brief, natural, and friendly.",
  "grammarRating": "Excellent" | "Good" | "Needs Improvement",
  "grammarTip": "Short grammar tip in Portuguese highlighting any corrections, or null if it was perfect.",
  "vocabularyTip": "A suggestion in Portuguese for a more natural word choice, or null.",
  "xpEarned": 5
}
`;

    const geminiPayload = {
      contents: [{
        parts: [{ text: systemPrompt }]
      }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    };

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;

    const mpRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiPayload)
    });

    if (!mpRes.ok) {
      throw new Error(`Gemini API returned error: ${await mpRes.text()}`);
    }

    const resBody = await mpRes.json();
    const responseText = resBody.candidates[0].content.parts[0].text;
    const evaluation = JSON.parse(responseText);

    return res.status(200).json(evaluation);

  } catch (error: any) {
    console.error('[AI Coach Evaluation Error]:', error);
    return handleMockResponse(req, res);
  }
}

function handleMockResponse(req: VercelRequest, res: VercelResponse) {
  const { sentence } = req.body;
  
  // High quality mock responses matching scenarios
  const responseList = [
    "That sounds great! Tell me more about it.",
    "Very nice! How can I help you with that today?",
    "Awesome. What else would you like to practice?",
    "Perfect! Let's continue practicing together."
  ];
  
  const randomReply = responseList[Math.floor(Math.random() * responseList.length)];
  
  const isExcellent = sentence && sentence.length > 15;
  const rating = isExcellent ? 'Excellent' : 'Good';
  const grammarTip = isExcellent 
    ? null 
    : 'Excelente pronúncia! Dica: Lembre-se de pronunciar o som do "th" colocando a língua entre os dentes.';

  return res.status(200).json({
    reply: randomReply,
    grammarRating: rating,
    grammarTip: grammarTip,
    vocabularyTip: 'Para soar mais natural, você também poderia usar "I would like to..." em vez de "I want to...".',
    xpEarned: 5
  });
}
