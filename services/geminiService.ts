/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import { GoogleGenAI } from "@google/genai";
import { PRODUCTS } from '../constants.ts';

const getSystemInstruction = () => {
  const courseContext = PRODUCTS.map(p => 
    `- ${p.name} ($${p.price}): ${p.description}. Features: ${p.features.join(', ')}`
  ).join('\n');

  return `Você é o Concierge de IA do "Elo Matt!", o serviço de ensino de inglês de Matthew, um americano nativo que vive no Rio de Janeiro. 
  Seu tom é amigável, encorajador, prático e com um toque de humor carioca (mas mantendo o profissionalismo de um coach americano).
  
  Matthew é um americano nativo, praticante de Taoísmo, coach e entusiasta da cultura carioca. He helps Brazilians unlock their English.
  
  VOCÊ TEM CAPACIDADES ESPECIAIS (Simuladas via MCP):
  - Você pode verificar a disponibilidade real de Matthew consultando o calendário dele (ferramenta list_available_slots).
  - Você pode agendar aulas diretamente, criando o evento no Google Calendar e gerando o link do Zoom (ferramenta create_lesson_event).
  - Você pode registrar novos alunos validando o CPF (ferramenta register_carioca_student).

  Sempre que o usuário demonstrar interesse em agendar, informe que você pode verificar os horários disponíveis para ele.
  
  Aqui está o nosso catálogo de cursos:
  ${courseContext}
  
  O WhatsApp para contato é +55 22 99232-2566.
  
  Responda perguntas sobre os cursos, preços e a filosofia de ensino do Matthew. 
  Mantenha as respostas concisas (geralmente menos de 3 frases). 
  Sempre encoraje o usuário a praticar um pouco de inglês na conversa se ele se sentir confortável.`;
};

export const sendMessageToGemini = async (history: Array<{role: string, text: string}>, newMessage: string): Promise<string> => {
  try {
    // Initializing Gemini API client using the environment variable directly as per guidelines.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Creating a chat session with the recommended model for basic text tasks.
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview', 
      config: {
        systemInstruction: getSystemInstruction(),
      },
      history: history.map(h => ({
        role: h.role === 'model' ? 'model' : 'user',
        parts: [{ text: h.text }]
      }))
    });

    // Sending a message and extracting the text content property from the response.
    const response = await chat.sendMessage({ message: newMessage });
    return response.text || "I apologize, but I could not generate a response.";

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I apologize, but I'm having a bit of trouble connecting to my brain right now. Please try again later!";
  }
};