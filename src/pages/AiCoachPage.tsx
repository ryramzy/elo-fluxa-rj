import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { sendChatMessage, ChatMessage, getGeminiApiKey } from '../services/geminiService';
import { 
  FaArrowLeft, 
  FaPaperPlane, 
  FaVolumeUp, 
  FaCheckCircle, 
  FaExclamationCircle, 
  FaMicrophone, 
  FaInfoCircle, 
  FaLock, 
  FaKey,
  FaBookOpen,
  FaCheck,
  FaHourglassHalf,
  FaTrophy
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { trackEvent } from '../utils/analytics';
import { useToast } from '../hooks/useToast';
import { speakText } from '../utils/tts';

interface Scenario {
  id: string;
  title: string;
  description: string;
  descriptionPt: string;
  emoji: string;
  imageUrl: string;
  accentGradient: string;
  textAccent: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  focus: string;
  goals: string[];
  phrases: { english: string; portuguese: string }[];
  systemInstruction: string;
  starterMessage: string;
}

interface Message {
  role: 'user' | 'model';
  text: string;
  correction?: string | null;
  speechScore?: number | null;
  translation?: string | null;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'nyc_diner',
    title: 'New York Diner',
    description: 'Order breakfast and chat with a classic, fast-talking New York waiter.',
    descriptionPt: 'Peça o café da manhã e converse com um garçom típico de Nova York, rápido no falar.',
    emoji: '🥞',
    imageUrl: '/sal.jpg',
    accentGradient: 'from-amber-600/20 to-orange-500/10 border-amber-500/30',
    textAccent: 'text-amber-450',
    difficulty: 'Intermediate',
    focus: 'Diner Slang & Food Orders',
    goals: [
      'Order eggs and bacon combo',
      'Ask for wheat toast instead of white',
      'Mention you want coffee refills'
    ],
    phrases: [
      { english: "Can I get a cup of joe?", portuguese: "Pode me trazer um cafezinho?" },
      { english: "I'd like my eggs sunny-side up, please.", portuguese: "Quero meus ovos estalados, por favor." },
      { english: "Wheat toast instead of white, please.", portuguese: "Torrada integral ao invés de branca, por favor." },
      { english: "Keep the coffee coming!", portuguese: "Pode ir trazendo mais café!" },
      { english: "Can I have the check, please?", portuguese: "Pode trazer a conta, por favor?" }
    ],
    systemInstruction: `You are Sal, a classic, friendly, but busy and fast-talking waiter at a traditional diner in Manhattan, New York. 
    You use casual American diner slang (like "Hon", "folks", "cup of joe", "sunny-side up", "grub"). 
    Start by welcoming the student, asking what they want to order, and keep the conversation natural, short, and friendly. 
    If the student makes any grammatical error, do not correct them in the conversation text, just reply naturally as Sal. 
    Keep your responses under 3 sentences. Do not use any British terms (say "fries", not "chips"; say "color", not "colour").`,
    starterMessage: "Hey there! Welcome to Chelsea's Diner. Grab a seat! Can I get you started with a hot cup of joe, or are you ready to order some grub?"
  },
  {
    id: 'jfk_airport',
    title: 'JFK Border Control',
    description: 'Navigate US Customs and explain the purpose of your visit to a border officer.',
    descriptionPt: 'Passe pela Alfândega dos EUA e explique o motivo da sua visita a um oficial de fronteira.',
    emoji: '✈️',
    imageUrl: '/davis.jpg',
    accentGradient: 'from-violet-600/20 to-indigo-500/10 border-violet-500/30',
    textAccent: 'text-violet-400',
    difficulty: 'Advanced',
    focus: 'Immigration & Clear Explanations',
    goals: [
      'State your visit purpose (tourism)',
      'Confirm the length of your stay (10 days)',
      'Name your accommodation address'
    ],
    phrases: [
      { english: "I am here on vacation.", portuguese: "Estou aqui de férias." },
      { english: "I have a return ticket for next week.", portuguese: "Tenho uma passagem de volta para a semana que vem." },
      { english: "I'll be staying at a hotel in Manhattan.", portuguese: "Vou me hospedar em um hotel em Manhattan." },
      { english: "Here is my passport and customs form.", portuguese: "Aqui está meu passaporte e formulário de alfândega." }
    ],
    systemInstruction: `You are Officer Davis, a professional, firm, but polite US Customs and Border Protection officer at JFK Airport in New York.
    You will ask the student typical immigration questions: "What is the purpose of your visit?", "How long are you staying?", "Where will you be staying?".
    Keep your tone formal, official, and realistic but encouraging. 
    Keep your responses under 3 sentences. Make sure it feels like a professional American airport check.`,
    starterMessage: "Good morning. Please step forward. Hand me your passport and customs declaration form. What is the purpose of your visit to the United States?"
  },
  {
    id: 'texas_bbq',
    title: 'Texas Backyard BBQ',
    description: 'Practice small talk and learn about barbecue customs at a local Austin cookout.',
    descriptionPt: 'Pratique conversação informal e aprenda sobre churrasco no Texas.',
    emoji: '🍖',
    imageUrl: '/bobby.jpg',
    accentGradient: 'from-rose-600/20 to-orange-500/10 border-rose-500/30',
    textAccent: 'text-rose-450',
    difficulty: 'Beginner',
    focus: 'Small Talk & Southern Hospitality',
    goals: [
      'Thank the host Bobby for inviting you',
      'Accept the offer of brisket and sweet tea',
      'Explain that you are visiting from Brazil'
    ],
    phrases: [
      { english: "Howdy Bobby! Thanks for having me.", portuguese: "Olá Bobby! Obrigado por me convidar." },
      { english: "I would love some brisket and sweet tea.", portuguese: "Eu adoraria um peito de boi e chá doce." },
      { english: "I'm visiting Austin from Rio, Brazil.", portuguese: "Estou visitando Austin direto do Rio, Brasil." },
      { english: "This smells absolutely amazing!", portuguese: "Isso cheira absolutamente maravilhoso!" }
    ],
    systemInstruction: `You are Bobby, a warm, outgoing, and hospitable Texan hosting a backyard barbecue in Austin, Texas.
    You talk with a friendly Southern drawl ("Howdy", "y'all", "fixin' to", "darlin'", "buddy"). 
    Offer the student some brisket or sweet tea, ask where they're from, and talk about music or football. 
    Keep your responses under 3 sentences. Be extremely welcoming.`,
    starterMessage: "Howdy buddy! Glad y'all could make it to the cookout. Grab a cold sweet tea! We got some brisket fixin' to slide off the bone. Where are you visiting us from?"
  },
  {
    id: 'sf_directions',
    title: 'San Francisco Street',
    description: 'Ask a local for directions to the Golden Gate Bridge and chat about sights.',
    descriptionPt: 'Peça informações de direção até a Golden Gate Bridge e converse sobre turismo.',
    emoji: '🌉',
    imageUrl: '/chloe.jpg',
    accentGradient: 'from-teal-600/20 to-cyan-500/10 border-teal-500/30',
    textAccent: 'text-teal-400',
    difficulty: 'Intermediate',
    focus: 'Directions & Local Landmarks',
    goals: [
      'Ask directions to the Golden Gate Bridge',
      'Inquire about riding the cable cars',
      'Ask for a scenic viewpoint recommendation'
    ],
    phrases: [
      { english: "How do I get to the Golden Gate Bridge?", portuguese: "Como eu chego na ponte Golden Gate?" },
      { english: "Is it within walking distance from here?", portuguese: "Dá para ir a pé daqui?" },
      { english: "Where is the nearest cable car stop?", portuguese: "Onde fica a parada de bondinho mais próxima?" },
      { english: "Do you have any local restaurant recommendations?", portuguese: "Você tem alguma recomendação de restaurante local?" }
    ],
    systemInstruction: `You are Chloe, a friendly, tech-savvy local resident walking in San Francisco.
    You are helpful and talk about landmarks like the cable cars, Lombard Street, and the Golden Gate Bridge. 
    Use modern, casual West Coast slang ("cool", "super close", "stunning", "honestly", "awesome").
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzingIndex, setAnalyzingIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [usedVoice, setUsedVoice] = useState(false);
  const [currentSpeechScore, setCurrentSpeechScore] = useState<number | null>(null);
  const [translatingIndex, setTranslatingIndex] = useState<number | null>(null);
  const [showTranslationIndex, setShowTranslationIndex] = useState<Record<number, boolean>>({});

  // Pressure Mode Game Mechanics
  const [pressureMode, setPressureMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // API Key management
  const [showApiKeySettings, setShowApiKeySettings] = useState(false);
  const [localApiKey, setLocalApiKey] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);

  // Initialize API Key from localStorage/env
  useEffect(() => {
    const key = getGeminiApiKey();
    setHasApiKey(!!key);
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      setLocalApiKey(localStorage.getItem('elo_gemini_api_key') || '');
    }
  }, []);

  // Pressure Mode Countdown Timer effect
  useEffect(() => {
    if (!selectedScenario || !pressureMode || loading) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    // Only countdown if it's the user's turn (last message is from model)
    const isUserTurn = messages.length > 0 && messages[messages.length - 1].role === 'model';
    if (!isUserTurn) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setTimeLeft(15);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          triggerTimeOutReply();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [messages, pressureMode, loading, selectedScenario]);

  const triggerTimeOutReply = async () => {
    if (!selectedScenario) return;
    setLoading(true);
    showToast({ type: 'error', message: 'Tempo esgotado! Responda rápido!' });

    try {
      let promptText = '';
      if (selectedScenario.id === 'nyc_diner') {
        promptText = "Hey hon, I don't have all day! What can I get you?";
      } else if (selectedScenario.id === 'jfk_airport') {
        promptText = "Please answer the question. I need to know the details of your stay.";
      } else if (selectedScenario.id === 'texas_bbq') {
        promptText = "You alright there, buddy? Don't let the sweet tea get warm now!";
      } else {
        promptText = "Hello? Are you still there? The bridge is that way!";
      }

      setMessages(prev => [...prev, { role: 'model', text: promptText }]);
      handleSpeak(promptText);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('elo_gemini_api_key', localApiKey.trim());
    const finalKey = getGeminiApiKey();
    setHasApiKey(!!finalKey);
    showToast({ type: 'success', message: finalKey ? 'API Key configurada!' : 'Chave removida. Rodando em Modo Demo.' });
    setShowApiKeySettings(false);
  };

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
      showToast({ type: 'error', message: 'Reconhecimento de voz não suportado neste navegador.' });
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
        const confidence = event.results[0][0].confidence || 0;
        const score = confidence < 0.4 ? null : confidence;
        
        setCurrentSpeechScore(score);
        setInput(prev => prev + (prev ? ' ' : '') + transcript);
        setUsedVoice(true);
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

  // Highly robust context-aware Mock Response dialogue tree
  const generateMockReply = (scenarioId: string, userText: string, turnIndex: number): string => {
    const textLower = userText.toLowerCase();
    
    if (scenarioId === 'nyc_diner') {
      if (turnIndex === 1) {
        return "You got it, hon! A fresh plate of sunny-side up eggs and bacon is coming right up. Do you want wheat or white toast with that?";
      }
      if (turnIndex === 3) {
        return "Wheat toast it is! And I'll keep the coffee pot right here for you. So, what brings you to Manhattan? Here on vacation or sightseeing?";
      }
      if (textLower.includes('check') || textLower.includes('bill') || textLower.includes('pay')) {
        return "Sure thing, hon! Here's the check. Take your time, pay at the counter whenever you're ready. Have a fantastic day in the city!";
      }
      return "Ah, that's wonderful! NYC is a great place to explore. Here is your hot grub, straight from the grill. Let me know if you need anything else, alright?";
    }
    
    if (scenarioId === 'jfk_airport') {
      if (turnIndex === 1) {
        return "I see. And how long do you plan to stay in the United States on this trip?";
      }
      if (turnIndex === 3) {
        return "Alright, and what address will you be staying at during your visit?";
      }
      if (textLower.includes('hotel') || textLower.includes('staying') || textLower.includes('street')) {
        return "Understood. Everything looks in order. I'm stamping your passport. Welcome to the United States. Enjoy your stay.";
      }
      return "Thank you. Everything is approved. Have a safe journey and enjoy your time here.";
    }
    
    if (scenarioId === 'texas_bbq') {
      if (turnIndex === 1) {
        return "Well howdy! Brisket is almost ready, y'all are gonna love it. Tell me, buddy, have you ever tried Texas-style barbecue before?";
      }
      if (turnIndex === 3) {
        return "Well, you're fixin' to have the best brisket in Austin! Bobby's special recipe. Here's a plate. What do you think of this Texas heat? Pretty wild, huh?";
      }
      return "Haha, yeah, it gets hot, but that's what makes the sweet tea taste so good! Eat up, buddy, and make yourself at home!";
    }
    
    if (scenarioId === 'sf_directions') {
      if (turnIndex === 1) {
        return "The Golden Gate Bridge? Honestly, it's super close! You can take the historical cable car just two blocks down, or hike up Lombard Street. Are you planning to walk across it today?";
      }
      if (turnIndex === 3) {
        return "Oh, you definitely should! The view is stunning, super breezy but totally worth it. After that, you should check out Fisherman's Wharf for lunch. Do you have a map app open?";
      }
      return "No problem at all! You're gonna have an amazing time. SF is honestly so cool. Have a great day!";
    }

    return "That sounds awesome! Tell me more about that, I'm all ears.";
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || !selectedScenario) return;

    const userText = input.trim();
    setInput('');
    
    const userMessage: Message = { 
      role: 'user', 
      text: userText,
      speechScore: currentSpeechScore
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setLoading(true);

    if (currentSpeechScore !== null && currentSpeechScore !== undefined) {
      trackEvent('ai_coach_speech_clarity', { score: currentSpeechScore });
    }
    trackEvent('ai_chat_message_sent', { scenarioId: selectedScenario.id });
    setCurrentSpeechScore(null);

    try {
      let responseText = '';

      if (!hasApiKey) {
        responseText = generateMockReply(selectedScenario.id, userText, updatedMessages.length);
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        const geminiHistory: ChatMessage[] = updatedMessages.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }));

        responseText = await sendChatMessage(
          geminiHistory,
          selectedScenario.systemInstruction
        );
      }

      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
      analyzeGrammar(userText, updatedMessages.length - 1);

      if (usedVoice) {
        handleSpeak(responseText);
        setUsedVoice(false);
      }
    } catch (err: any) {
      console.error(err);
      showToast({ type: 'error', message: 'Falha ao conectar com o Tutor IA. Rodando modo offline.' });
      const fallbackMsg = generateMockReply(selectedScenario.id, userText, updatedMessages.length);
      setMessages(prev => [...prev, { role: 'model', text: fallbackMsg }]);
    } finally {
      setLoading(false);
    }
  };

  const analyzeGrammar = async (text: string, msgIndex: number) => {
    setAnalyzingIndex(msgIndex);
    try {
      if (!hasApiKey) {
        await new Promise(resolve => setTimeout(resolve, 600));
        let correction = null;
        if (text[0] !== text[0].toUpperCase()) {
          correction = "Good start! Don't forget to capitalize the first letter of your sentences. E.g., \"" + text[0].toUpperCase() + text.slice(1) + "\"";
        }
        setMessages(prev => {
          const copy = [...prev];
          if (copy[msgIndex]) {
            copy[msgIndex].correction = correction;
          }
          return copy;
        });
        return;
      }

      const correctionPrompt = `Analyze this English sentence from a Brazilian student: "${text}".
      If it's correct and natural, return exactly "CORRECT".
      If there's an error, formulate a TESOL/TEFL correction. Praise the effort, provide a corrected version, and explain the grammar rule simply. Keep it short (max 25 words).`;
      
      const response = await sendChatMessage(
        [{ role: 'user', parts: [{ text: correctionPrompt }] }],
        "You are a certified TEFL/TESOL tutor. First praise the student's effort in one sentence. Then state the correction clearly. Then explain the grammar rule in under 25 words. Be warm and encouraging."
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

  const handleTranslate = async (index: number, text: string) => {
    if (messages[index]?.translation) {
      setShowTranslationIndex(prev => ({ ...prev, [index]: !prev[index] }));
      return;
    }

    setTranslatingIndex(index);
    try {
      if (!hasApiKey) {
        await new Promise(resolve => setTimeout(resolve, 400));
        const matched = selectedScenario?.phrases.find(p => p.english.toLowerCase().includes(text.toLowerCase()) || text.toLowerCase().includes(p.english.toLowerCase()));
        
        setMessages(prev => {
          const copy = [...prev];
          if (copy[index]) {
            copy[index].translation = matched ? matched.portuguese : "Tradução simulada para modo offline.";
          }
          return copy;
        });
        setShowTranslationIndex(prev => ({ ...prev, [index]: true }));
        return;
      }

      const translationPrompt = `Translate the following English text to Brazilian Portuguese. Return only the translation, no preamble: ${text}`;
      const translation = await sendChatMessage(
        [{ role: 'user', parts: [{ text: translationPrompt }] }],
        "You are a helpful translator that translates English to natural Brazilian Portuguese."
      );
      
      setMessages(prev => {
        const copy = [...prev];
        if (copy[index]) {
          copy[index].translation = translation;
        }
        return copy;
      });
      setShowTranslationIndex(prev => ({ ...prev, [index]: true }));
      trackEvent('ai_coach_translation_click');
    } catch (err) {
      console.error('Translation failed:', err);
      setMessages(prev => {
        const copy = [...prev];
        if (copy[index]) {
          copy[index].translation = 'Tradução indisponível';
        }
        return copy;
      });
      setShowTranslationIndex(prev => ({ ...prev, [index]: true }));
    } finally {
      setTranslatingIndex(null);
    }
  };

  const handleSpeak = (text: string) => {
    speakText(text);
    trackEvent('ai_chat_speech_listen', { textLength: text.length });
  };

  const handleInsertPhrase = (phrase: string) => {
    setInput(prev => prev + (prev ? ' ' : '') + phrase);
  };

  const isGoalCompleted = (goal: string): boolean => {
    const textLog = messages.map(m => m.text.toLowerCase()).join(' ');
    
    if (goal.includes('eggs and bacon')) return textLog.includes('egg') || textLog.includes('bacon');
    if (goal.includes('wheat toast')) return textLog.includes('wheat') || textLog.includes('toast');
    if (goal.includes('coffee refills')) return textLog.includes('coffee') || textLog.includes('refill') || textLog.includes('cup of joe');
    
    if (goal.includes('tourism')) return textLog.includes('tourism') || textLog.includes('vacation') || textLog.includes('visit');
    if (goal.includes('stay')) return textLog.includes('day') || textLog.includes('week') || textLog.includes('stay');
    if (goal.includes('address')) return textLog.includes('hotel') || textLog.includes('street') || textLog.includes('manhattan');

    if (goal.includes('Bobby')) return textLog.includes('howdy') || textLog.includes('bobby') || textLog.includes('thanks') || textLog.includes('inviting');
    if (goal.includes('brisket')) return textLog.includes('brisket') || textLog.includes('tea') || textLog.includes('love');
    if (goal.includes('Brazil')) return textLog.includes('brazil') || textLog.includes('rio');

    if (goal.includes('Golden Gate Bridge')) return textLog.includes('golden gate') || textLog.includes('bridge') || textLog.includes('get to');
    if (goal.includes('cable cars')) return textLog.includes('cable car') || textLog.includes('bondinho');
    if (goal.includes('scenic viewpoint')) return textLog.includes('view') || textLog.includes('viewpoint') || textLog.includes('spot') || textLog.includes('recommend');

    return false;
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white py-10 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900/40 via-[#020617] to-[#020617]">
      
      {/* Container */}
      <div className="max-w-6xl mx-auto">
        
        {/* Top Navbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 border-b border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => selectedScenario ? setSelectedScenario(null) : navigate('/dashboard')}
              className="p-3 bg-slate-900/60 border border-white/10 rounded-xl hover:bg-slate-800 text-slate-350 hover:text-white transition-all shadow-md active:scale-95"
            >
              <FaArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                AI Conversation Coach
              </h1>
              <p className="text-sm text-slate-450 mt-1 font-medium">
                Immersive cultural dialogue simulations to build real American conversation skills.
              </p>
            </div>
          </div>

          {/* Settings Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowApiKeySettings(!showApiKeySettings)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl border transition-all ${
                hasApiKey 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 animate-pulse' 
                  : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FaLock size={11} />
              {hasApiKey ? 'AI Ativo (Gemini)' : 'Configurar Chave API'}
            </button>
          </div>
        </div>

        {/* API Key Modal/Settings Banner */}
        {showApiKeySettings && (
          <div className="mb-8 p-6 bg-slate-900/80 border border-white/10 rounded-2xl backdrop-blur-xl animate-in slide-in-from-top-4 duration-300">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <FaKey className="text-indigo-400" /> Configuração da API Gemini
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Por padrão, o app roda no <strong>Modo de Demonstração (Mock Mode)</strong> offline com respostas pré-programadas estruturadas. Para falar livremente com a inteligência artificial real do Gemini, insira sua chave abaixo. Ela será armazenada localmente apenas no seu navegador.
            </p>
            
            <form onSubmit={handleSaveApiKey} className="flex flex-col sm:flex-row gap-3">
              <input
                type="password"
                placeholder="Cole sua Gemini API Key (ex: AIzaSy...)"
                value={localApiKey}
                onChange={(e) => setLocalApiKey(e.target.value)}
                className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/30"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('elo_gemini_api_key');
                    setLocalApiKey('');
                    setHasApiKey(false);
                    showToast({ type: 'success', message: 'Rodando em Modo Demo offline.' });
                    setShowApiKeySettings(false);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm px-4 py-3 rounded-xl transition-all"
                >
                  Limpar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Core Layout */}
        {!selectedScenario ? (
          
          /* Redesigned Premium Scenario Select Grid */
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold tracking-tight text-slate-200">
                Selecione um Cenário Cultural Americano
              </h2>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-900 border border-white/5 text-slate-400">
                {SCENARIOS.length} Cenários Disponíveis
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {SCENARIOS.map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => selectScenario(sc)}
                  className={`bg-slate-950/70 border backdrop-blur-md rounded-3xl p-6 text-left shadow-lg hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-350 group relative overflow-hidden flex flex-col justify-between min-h-[260px] ${sc.accentGradient}`}
                >
                  {/* Avatar graphic as card design */}
                  <div 
                    className="absolute right-0 bottom-0 w-36 h-36 bg-cover bg-center rounded-tl-3xl opacity-20 group-hover:opacity-30 group-hover:scale-105 transition-all duration-500 border-l border-t border-white/5"
                    style={{ backgroundImage: `url(${sc.imageUrl})` }}
                  ></div>
                  
                  <div>
                    {/* Header: Title and Difficulty */}
                    <div className="flex justify-between items-start gap-4 mb-4 relative z-10">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl p-2 bg-slate-900/90 rounded-2xl shadow-inner border border-white/5">
                          {sc.emoji}
                        </span>
                        <div>
                          <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                            {sc.title}
                          </h3>
                          <span className={`text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-md ${
                            sc.difficulty === 'Beginner' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : sc.difficulty === 'Intermediate' 
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {sc.difficulty === 'Beginner' ? 'Iniciante' : sc.difficulty === 'Intermediate' ? 'Intermediário' : 'Avançado'}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-900/60 px-2 py-1 rounded-md border border-white/5">
                        {sc.focus}
                      </span>
                    </div>

                    {/* Descriptions */}
                    <p className="text-xs text-slate-300 leading-relaxed font-normal mb-2 max-w-[80%] relative z-10">
                      {sc.description}
                    </p>
                    <p className="text-[11px] text-slate-500 leading-relaxed italic font-light max-w-[80%] relative z-10">
                      {sc.descriptionPt}
                    </p>
                  </div>

                  {/* Footer call to action */}
                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1.5 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                      {sc.goals.length} Metas de Prática
                    </span>
                    <span className="text-xs font-bold text-indigo-400 group-hover:text-indigo-300 flex items-center gap-1">
                      Iniciar Conversa &rarr;
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          
          /* Redesigned Premium Chat Interface with Side Drawer */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Left Chat Area (Col 3) */}
            <div className="lg:col-span-3 bg-slate-950/70 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[75vh] backdrop-blur-xl relative">
              
              {/* Active scenario header */}
              <div className="bg-slate-950 p-4 px-6 flex items-center justify-between border-b border-white/10 z-10">
                <div className="flex items-center gap-3">
                  {/* Immersive Avatar in Chat Header */}
                  <div 
                    className="w-12 h-12 rounded-2xl bg-cover bg-center border border-white/10 shadow-inner"
                    style={{ backgroundImage: `url(${selectedScenario.imageUrl})` }}
                  ></div>
                  <div>
                    <h3 className="font-bold text-sm text-white">{selectedScenario.title}</h3>
                    <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      {hasApiKey ? 'Conectado via Gemini API' : 'Modo Demonstração Ativo'}
                    </p>
                  </div>
                </div>

                {/* Pressure Mode Game Switch */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPressureMode(!pressureMode)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        pressureMode 
                          ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.15)]'
                          : 'bg-slate-900 border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      <FaHourglassHalf className={pressureMode ? 'animate-spin' : ''} />
                      {pressureMode ? 'Pressure Mode ON' : 'Pressure Mode OFF'}
                    </button>
                    {pressureMode && (
                      <span className={`text-sm font-extrabold px-2.5 py-1 rounded-md border ${
                        timeLeft <= 5 
                          ? 'bg-red-500/20 border-red-500/50 text-red-400 animate-pulse' 
                          : 'bg-rose-500/10 border-rose-500/20 text-rose-350'
                      }`}>
                        {timeLeft}s
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedScenario(null)}
                    className="text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-white/5 px-4 py-2 rounded-xl transition-all"
                  >
                    Sair
                  </button>
                </div>
              </div>

              {/* Countdown Pressure Progress Bar */}
              {pressureMode && !loading && (
                <div className="w-full h-1.5 bg-slate-900/60 relative overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ease-linear ${
                      timeLeft <= 5 ? 'bg-red-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${(timeLeft / 15) * 100}%` }}
                  ></div>
                </div>
              )}

              {/* Messages list */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-950/10">
                {messages.map((msg, index) => {
                  const displayScore = msg.speechScore !== undefined && msg.speechScore !== null ? Math.round(msg.speechScore * 100) : null;
                  const isModel = msg.role === 'model';
                  
                  return (
                    <div key={index} className={`flex items-start gap-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                      
                      {/* Avatar next to Model responses */}
                      {isModel && (
                        <div 
                          className="w-9 h-9 rounded-xl bg-cover bg-center border border-white/5 flex-shrink-0 mt-1 shadow-md"
                          style={{ backgroundImage: `url(${selectedScenario.imageUrl})` }}
                        ></div>
                      )}

                      <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[78%]`}>
                        <div className="flex items-end gap-2">
                          
                          {/* Left quick actions for model messages */}
                          {isModel && (
                            <div className="flex flex-col gap-1.5 self-end mb-1">
                              <button
                                onClick={() => handleSpeak(msg.text)}
                                className="p-2 bg-slate-900/80 border border-white/10 hover:border-white/20 text-slate-350 hover:text-white rounded-xl shadow-md transition-all active:scale-95"
                                title="Ouvir pronúncia"
                              >
                                <FaVolumeUp size={12} />
                              </button>
                              <button
                                onClick={() => handleTranslate(index, msg.text)}
                                disabled={translatingIndex === index}
                                className="p-2 bg-slate-900/80 border border-white/10 hover:border-white/20 text-slate-350 hover:text-white rounded-xl shadow-md transition-all active:scale-95 text-[9px] font-extrabold h-8 w-8 flex items-center justify-center"
                                title="Traduzir para português"
                              >
                                {translatingIndex === index ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-indigo-500"></div>
                                ) : (
                                  "PT"
                                )}
                              </button>
                            </div>
                          )}
                          
                          {/* Chat Bubble Content */}
                          <div
                            className={`rounded-2xl p-4 shadow-md text-sm leading-relaxed ${
                              msg.role === 'user'
                                ? 'bg-gradient-to-br from-blue-600 to-indigo-650 text-white rounded-br-none border border-blue-500/20'
                                : 'bg-slate-900/80 border border-white/10 text-slate-100 rounded-bl-none'
                            }`}
                          >
                            {msg.text}
                          </div>
                        </div>

                        {/* On-demand translation display */}
                        {isModel && msg.translation && showTranslationIndex[index] && (
                          <div className="mt-2 text-xs text-slate-400 bg-slate-950/80 p-3 rounded-xl border border-white/5 italic leading-relaxed animate-in fade-in duration-200">
                            🇧🇷 {msg.translation}
                          </div>
                        )}

                        {/* Grammar correction & pronunciation score display for user messages */}
                        {!isModel && (
                          <div className="mt-2 max-w-[90%] flex flex-col gap-1.5 items-end">
                            {/* Pronunciation score */}
                            {displayScore !== null && (
                              <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-md border ${
                                displayScore >= 85 
                                  ? 'text-emerald-450 bg-emerald-500/10 border-emerald-500/20'
                                  : displayScore >= 65
                                    ? 'text-blue-450 bg-blue-500/10 border-blue-500/20'
                                    : 'text-amber-455 bg-amber-500/10 border-amber-500/20'
                              }`}>
                                🗣️ Pronúncia: {displayScore}% {
                                  displayScore >= 85 
                                    ? '(Excelente!)' 
                                    : displayScore >= 65 
                                      ? '(Bom!)' 
                                      : '(Continue praticando!)'
                                }
                              </span>
                            )}

                            {/* Grammar check */}
                            {analyzingIndex === index ? (
                              <span className="flex items-center gap-1.5 animate-pulse text-[10px] text-indigo-400 font-semibold">
                                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping"></span>
                                Analisando gramática...
                              </span>
                            ) : msg.correction ? (
                              <div className="flex items-start gap-2 bg-amber-500/15 p-3 rounded-xl border border-amber-500/25 text-[11px] text-left text-amber-300">
                                <FaExclamationCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-400" />
                                <span>{msg.correction}</span>
                              </div>
                            ) : msg.correction === null ? (
                              <span className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                                <FaCheckCircle className="w-3.5 h-3.5 text-emerald-450" /> Gramática perfeita!
                              </span>
                            ) : null}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {loading && (
                  <div className="flex items-start gap-2 animate-pulse">
                    <div className="bg-slate-900 border border-white/5 rounded-2xl rounded-bl-none p-4 shadow-sm text-sm flex items-center gap-2 text-slate-500">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Form input */}
              <form onSubmit={handleSend} className="p-4 bg-slate-950 border-t border-white/10 flex gap-3 z-10">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                  placeholder={isListening ? "Ouvindo... fale em inglês" : "Digite sua resposta em inglês americano..."}
                  className="flex-1 bg-slate-900 border border-white/10 rounded-xl py-3.5 px-4 text-white placeholder-slate-550 focus:outline-none focus:border-indigo-500 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={toggleListening}
                  disabled={loading}
                  className={`p-4 rounded-xl shadow-md transition-all flex items-center justify-center active:scale-95 ${
                    isListening 
                      ? 'bg-red-500 text-white animate-pulse' 
                      : 'bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-350'
                  }`}
                  title={isListening ? 'Parar de escutar' : 'Falar (Microfone)'}
                >
                  <FaMicrophone size={14} />
                </button>
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="p-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center shadow-indigo-600/35"
                >
                  <FaPaperPlane size={14} />
                </button>
              </form>
            </div>

            {/* Right Information & Checklist Panel (Col 1) */}
            <div className="space-y-6">
              
              {/* Goal Checklist Box */}
              <div className="bg-slate-950/70 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2 border-b border-white/5 pb-2.5">
                  <FaTrophy className="text-indigo-400" /> Metas do Cenário
                </h3>
                <div className="space-y-3.5">
                  {selectedScenario.goals.map((goal, idx) => {
                    const completed = isGoalCompleted(goal);
                    return (
                      <div key={idx} className="flex gap-3 items-start">
                        <div className={`p-1 rounded-md border flex-shrink-0 mt-0.5 transition-all ${
                          completed 
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' 
                            : 'bg-slate-900 border-white/10 text-transparent'
                        }`}>
                          <FaCheck size={10} />
                        </div>
                        <span className={`text-xs leading-relaxed font-semibold transition-all ${
                          completed ? 'text-slate-500 line-through' : 'text-slate-200'
                        }`}>
                          {goal}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Clickable Phrases Box */}
              <div className="bg-slate-950/70 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3.5 flex items-center gap-2 border-b border-white/5 pb-2.5">
                  <FaBookOpen className="text-indigo-400" /> Expressões Úteis
                </h3>
                <p className="text-[10px] text-slate-450 mb-4 font-semibold">
                  Clique em qualquer expressão abaixo para adicioná-la à sua resposta:
                </p>
                <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-1">
                  {selectedScenario.phrases.map((phrase, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleInsertPhrase(phrase.english)}
                      className="w-full bg-slate-900/60 hover:bg-slate-900 border border-white/5 rounded-2xl p-3 text-left transition-all hover:border-white/15 flex flex-col gap-1 active:scale-97 group"
                    >
                      <span className="text-xs font-bold text-indigo-400 group-hover:text-indigo-350 transition-colors">
                        {phrase.english}
                      </span>
                      <span className="text-[10px] text-slate-500 italic leading-snug">
                        {phrase.portuguese}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AiCoachPage;
