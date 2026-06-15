import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { sendChatMessage, ChatMessage } from '../services/geminiService';
import { FaArrowLeft, FaPaperPlane, FaVolumeUp, FaCheckCircle, FaExclamationCircle, FaMicrophone } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { trackEvent } from '../utils/analytics';
import { useToast } from '../hooks/useToast';

interface Scenario {
  id: string;
  title: string;
  description: string;
  emoji: string;
  systemInstruction: string;
  starterMessage: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'nyc_diner',
    title: 'New York Diner',
    description: 'Order breakfast and chat with a classic, fast-talking New York waiter.',
    emoji: '🥞',
    systemInstruction: `You are Sal, a classic, friendly, but busy and fast-talking waiter at a traditional diner in Manhattan, New York. 
    You use casual American diner slang (like "Hon", "folks", "cup of joe", "sunny-side up"). 
    Start by welcoming the student, asking what they want to order, and keep the conversation natural, short, and friendly. 
    If the student makes any grammatical error, do not correct them in the conversation text, just reply naturally as Sal. 
    Keep your responses under 3 sentences.`,
    starterMessage: "Hey there! Welcome to Chelsea's Diner. Grab a seat! Can I get you started with a hot cup of joe, or are you ready to order some grub?"
  },
  {
    id: 'jfk_airport',
    title: 'JFK Border Control',
    description: 'Navigate US Customs and explain the purpose of your visit to a border officer.',
    emoji: '✈️',
    systemInstruction: `You are Officer Davis, a professional, firm, but polite US Customs and Border Protection officer at JFK Airport in New York.
    You will ask the student typical immigration questions: "What is the purpose of your visit?", "How long are you staying?", "Where will you be staying?".
    Keep your tone formal, official, and realistic but encouraging. 
    Keep your responses under 3 sentences.`,
    starterMessage: "Good morning. Please step forward. Hand me your passport and customs declaration form. What is the purpose of your visit to the United States?"
  },
  {
    id: 'texas_bbq',
    title: 'Texas Backyard BBQ',
    description: 'Practice small talk and learn about grill customs at a local barbecue in Austin.',
    emoji: '🍖',
    systemInstruction: `You are Bobby, a warm, outgoing, and hospitable Texan hosting a backyard barbecue in Austin, Texas.
    You talk with a friendly Southern drawl ("Howdy", "y'all", "fixin' to", "darlin'", "buddy"). 
    Offer the student some brisket or sweet tea, ask where they're from, and talk about music or football. 
    Keep your responses under 3 sentences.`,
    starterMessage: "Howdy buddy! Glad y'all could make it to the cookout. Grab a cold sweet tea! We got some brisket fixin' to slide off the bone. Where are you visiting us from?"
  },
  {
    id: 'sf_directions',
    title: 'San Francisco Street',
    description: 'Ask a local for directions to the Golden Gate Bridge and chat about tourist spots.',
    emoji: '🌉',
    systemInstruction: `You are Chloe, a friendly, tech-savvy local resident walking in San Francisco.
    You are helpful and talk about landmarks like the cable cars, Lombard Street, and the Golden Gate Bridge. 
    Use modern, casual West Coast slang ("cool", "super close", "stunning", "honestly").
    Keep your responses under 3 sentences.`,
    starterMessage: "Hey! Oh, you look a little lost. Do you need help finding your way around? It's a gorgeous day to explore!"
  }
];

const AiCoachPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  useDocumentTitle('AI English Coach - Elo');

  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string; correction?: string | null }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzingIndex, setAnalyzingIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast({ type: 'error', message: 'Reconhecimento de voz não é suportado neste navegador.' });
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      const rec = new SpeechRecognition();
      rec.lang = 'en-US';
      rec.continuous = false;
      rec.interimResults = false;

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + (prev ? ' ' : '') + transcript);
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
      rec.start();
    }
  };

  const selectScenario = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setMessages([
      { role: 'model', text: scenario.starterMessage }
    ]);
    trackEvent('ai_chat_start', { scenarioId: scenario.id });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || !selectedScenario) return;

    const userText = input.trim();
    setInput('');
    
    // Add user message locally
    const updatedMessages = [...messages, { role: 'user' as const, text: userText }];
    setMessages(updatedMessages);
    setLoading(true);

    trackEvent('ai_chat_message_sent', { scenarioId: selectedScenario.id });

    try {
      // Map history to Gemini format
      const geminiHistory: ChatMessage[] = updatedMessages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const responseText = await sendChatMessage(
        geminiHistory,
        selectedScenario.systemInstruction
      );

      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
      
      // Trigger grammar correction request asynchronously in the background for the user's message
      analyzeGrammar(userText, updatedMessages.length - 1);
      
    } catch (err: any) {
      console.error(err);
      showToast({ type: 'error', message: 'Falha ao conectar com o Tutor IA.' });
    } finally {
      setLoading(false);
    }
  };

  // Perform background AI check for grammar and slang alternative
  const analyzeGrammar = async (text: string, msgIndex: number) => {
    setAnalyzingIndex(msgIndex);
    try {
      const correctionPrompt = `You are an English teacher. Analyze the user's sentence: "${text}". 
      If it is grammatically correct and natural, return exactly "CORRECT".
      If there is a grammar error, misspelling, or unnatural expression, provide a brief correction (under 15 words) explaining the better way to say it. 
      Format: "Correction: [corrected sentence] (Why: [brief reason])".`;
      
      const response = await sendChatMessage(
        [{ role: 'user', parts: [{ text: correctionPrompt }] }],
        "You are a helpful and concise ESL English teacher assistant."
      );
      
      setMessages(prev => {
        const copy = [...prev];
        if (copy[msgIndex]) {
          copy[msgIndex].correction = response === 'CORRECT' ? null : response;
        }
        return copy;
      });
    } catch (err) {
      console.warn('Grammar check failed:', err);
    } finally {
      setAnalyzingIndex(null);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any current speaking
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      
      // Find a US accent voice if possible
      const voices = window.speechSynthesis.getVoices();
      const usVoice = voices.find(voice => voice.lang.includes('en-US') || voice.lang.includes('en_US'));
      if (usVoice) {
        utterance.voice = usVoice;
      }
      
      window.speechSynthesis.speak(utterance);
      trackEvent('ai_chat_speech_listen', { textLength: text.length });
    } else {
      showToast({ type: 'info', message: 'A síntese de voz não é suportada no seu navegador.' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Top navbar */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => selectedScenario ? setSelectedScenario(null) : navigate('/dashboard')}
          className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
        >
          <FaArrowLeft />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 dark:text-white">AI Conversation Coach</h1>
          <p className="text-sm text-slate-500">Practice your English in real-world American situations.</p>
        </div>
      </div>

      {!selectedScenario ? (
        /* Scenario Selector Grid */
        <div className="space-y-6">
          <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white mb-2">Select a Conversation Scenario</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SCENARIOS.map((sc) => (
              <button
                key={sc.id}
                onClick={() => selectScenario(sc)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 text-left shadow-sm hover:shadow-md hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 -mt-6 -mr-6 w-20 h-20 bg-blue-500/5 rounded-full group-hover:scale-125 transition-transform"></div>
                <div className="flex gap-4 items-start">
                  <span className="text-4xl bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl shadow-inner">{sc.emoji}</span>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-500 transition-colors">{sc.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-light leading-relaxed">{sc.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Chat Area */
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-3xl overflow-hidden shadow-xl flex flex-col h-[65vh]">
          {/* Active scenario header */}
          <div className="bg-slate-900 text-white p-4 px-6 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{selectedScenario.emoji}</span>
              <div>
                <h3 className="font-bold font-serif text-sm">{selectedScenario.title}</h3>
                <p className="text-[10px] text-slate-400 font-light">Conversation Practice</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedScenario(null)}
              className="text-xs text-slate-400 hover:text-white transition-colors uppercase tracking-wider font-semibold"
            >
              Mudar Cenário
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-slate-900/40">
            {messages.map((msg, index) => (
              <div key={index} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className="flex items-end gap-2 max-w-[85%]">
                  {msg.role === 'model' && (
                    <button
                      onClick={() => speakText(msg.text)}
                      className="p-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-600 shadow-sm transition-colors mb-1 self-end"
                      title="Ouvir pronúncia"
                    >
                      <FaVolumeUp size={12} />
                    </button>
                  )}
                  
                  <div
                    className={`rounded-2xl p-4 shadow-sm text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>

                {/* Grammar correction box for user messages */}
                {msg.role === 'user' && (
                  <div className="mt-1.5 max-w-[80%] text-xs font-light text-slate-500">
                    {analyzingIndex === index ? (
                      <span className="flex items-center gap-1.5 animate-pulse text-[10px] text-blue-500">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></span>
                        Analisando gramática...
                      </span>
                    ) : msg.correction ? (
                      <span className="flex items-start gap-1.5 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/5 p-2 rounded-lg border border-amber-100 dark:border-amber-500/10">
                        <FaExclamationCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span>{msg.correction}</span>
                      </span>
                    ) : msg.correction === null ? (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-500/5 px-2 py-0.5 rounded">
                        <FaCheckCircle className="w-2.5 h-2.5" /> Gramática perfeita!
                      </span>
                    ) : null}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-start gap-2">
                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-bl-none p-4 shadow-sm text-sm flex items-center gap-2 text-slate-500">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form input */}
          <form onSubmit={handleSend} className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              placeholder={isListening ? "Ouvindo... fale em inglês" : "Digite sua mensagem em inglês ou use o microfone..."}
              className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
            />
            <button
              type="button"
              onClick={toggleListening}
              disabled={loading}
              className={`p-4 rounded-xl shadow-md transition-all flex items-center justify-center ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-650 text-white animate-pulse' 
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-650 dark:text-slate-350'
              }`}
              title={isListening ? 'Parar de escutar' : 'Falar (Voz)'}
            >
              <FaMicrophone size={14} />
            </button>
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              <FaPaperPlane size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AiCoachPage;
