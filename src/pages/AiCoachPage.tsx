import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';
import { db } from '../lib/firestore';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useToast } from '../hooks/useToast';
import { speakText, cancelSpeech } from '../utils/tts';
import { FaMicrophone, FaStop, FaArrowLeft, FaUndo, FaVolumeUp } from 'react-icons/fa';

interface Message {
  role: 'user' | 'model';
  content: string;
}

interface EvaluationResult {
  reply: string;
  grammarRating: 'Excellent' | 'Good' | 'Needs Improvement';
  grammarTip: string | null;
  vocabularyTip: string | null;
  xpEarned: number;
}

const SCENARIOS = [
  {
    id: 'interview',
    title: 'Entrevista de Emprego 💼',
    desc: 'Simule uma entrevista com um recrutador americano de tecnologia em São Francisco.',
    initialMessage: "Hi there! Welcome to our office. Thanks for coming in. To start off, could you tell me a little bit about yourself and why you're interested in this role?"
  },
  {
    id: 'airport',
    title: 'Check-in no Aeroporto ✈️',
    desc: 'Pratique lidar com o agente de embarque no aeroporto JFK em Nova York.',
    initialMessage: "Hello, next in line please! Passport and boarding pass, please. Are you checking any bags today?"
  },
  {
    id: 'restaurant',
    title: 'Pedido no Restaurante 🍔',
    desc: 'Faça seu pedido e interaja com o garçom em uma lanchonete clássica de Chicago.',
    initialMessage: "Hey guys! Welcome to Lou Malnati's. What can I get started for you today? Any drinks or appetizers?"
  },
  {
    id: 'smalltalk',
    title: 'Conversa de Café ☕',
    desc: 'Pratique "small talk" casual com um estranho amigável na fila do Starbucks.',
    initialMessage: "Man, this queue is moving so slowly today! I hope the coffee is worth the wait. By the way, are you from around here?"
  }
];

export default function AiCoachPage() {
  const { user } = useAuth();
  const { profile } = useUserProfile(user?.uid || '');
  const navigate = useNavigate();
  const { showToast } = useToast();

  useDocumentTitle('Tutor de IA Elo 🤖');

  // Conversational states
  const [selectedScenario, setSelectedScenario] = useState<typeof SCENARIOS[0] | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionXp, setSessionXp] = useState(0);

  // Audio / Speech states
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [lastEvaluation, setLastEvaluation] = useState<EvaluationResult | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.lang = 'en-US';
      rec.interimResults = false;
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        setIsListening(true);
        setTranscription('');
      };

      rec.onresult = (event: any) => {
        const resultText = event.results[0][0].transcript;
        setTranscription(resultText);
        handleSendSentence(resultText);
      };

      rec.onerror = (err: any) => {
        console.error('Speech recognition error:', err);
        setIsListening(false);
        if (err.error === 'not-allowed') {
          showToast({ type: 'error', message: 'Permissão de microfone negada. Ative nas configurações.' });
        } else {
          showToast({ type: 'error', message: 'Falha ao reconhecer áudio. Tente novamente.' });
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }

    return () => {
      cancelSpeech();
    };
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleStartScenario = (scenario: typeof SCENARIOS[0]) => {
    setSelectedScenario(scenario);
    setMessages([{ role: 'model', content: scenario.initialMessage }]);
    setLastEvaluation(null);
    setSessionXp(0);
    // Play initial message out loud
    speakText(scenario.initialMessage);
  };

  const handleToggleListening = () => {
    if (!recognitionRef.current) {
      showToast({ type: 'error', message: 'Reconhecimento de fala não suportado no seu navegador.' });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      cancelSpeech(); // Stop any currently speaking audio
      recognitionRef.current.start();
    }
  };

  const handleSendSentence = async (text: string) => {
    if (!text.trim() || !selectedScenario || !user?.uid) return;
    setLoading(true);

    // 1. Append user message to stream
    const nextMessages = [...messages, { role: 'user', content: text } as Message];
    setMessages(nextMessages);

    try {
      // 2. Fetch evaluation from serverless API
      const res = await fetch('/api/ai-coach-evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: selectedScenario.title,
          history: messages,
          sentence: text
        })
      });

      if (!res.ok) {
        throw new Error('Failed to fetch evaluator feedback.');
      }

      const result: EvaluationResult = await res.json();
      setLastEvaluation(result);

      // 3. Increment session and profile XP in Firestore
      setSessionXp(prev => prev + result.xpEarned);
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        xp: increment(result.xpEarned)
      });

      // 4. Append AI reply to messages stream
      setMessages(prev => [...prev, { role: 'model', content: result.reply }]);

      // 5. Play response audio
      speakText(result.reply);

    } catch (err) {
      console.error('Error evaluating conversation:', err);
      showToast({ type: 'error', message: 'Falha ao processar resposta do tutor.' });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    cancelSpeech();
    setMessages([]);
    setSelectedScenario(null);
    setLastEvaluation(null);
    setSessionXp(0);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-8 flex flex-col justify-between">
      {/* Top Navigation */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between py-4 border-b border-white/5">
        <button
          onClick={selectedScenario ? handleReset : () => navigate('/dashboard')}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
        >
          <FaArrowLeft size={10} />
          {selectedScenario ? 'Escolher Cenário' : 'Voltar ao Painel'}
        </button>

        <h1 className="text-sm font-black uppercase tracking-widest text-slate-400">
          Tutor de IA Elo 🤖
        </h1>

        <div className="text-right">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">XP Ganhos</span>
          <span className="text-xs font-black text-amber-400">{sessionXp} XP ⚡</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl w-full mx-auto flex-1 my-6 flex flex-col justify-center">
        {!selectedScenario ? (
          /* Scenario Selection */
          <div className="space-y-6">
            <div className="text-center max-w-lg mx-auto">
              <h2 className="text-2xl md:text-3xl font-serif font-black text-white tracking-tight">
                Pratique Conversação de Graça
              </h2>
              <p className="text-xs text-slate-400 mt-2">
                Escolha um cenário da vida real abaixo para conversar com nosso tutor de IA. Treine sua pronúncia e ganhe feedback instantâneo de gramática.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SCENARIOS.map(sc => (
                <button
                  key={sc.id}
                  onClick={() => handleStartScenario(sc)}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-left hover:border-blue-500/50 hover:bg-slate-850/30 transition-all group active:scale-98"
                >
                  <h3 className="text-sm font-extrabold text-white group-hover:text-blue-400 transition-colors">
                    {sc.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    {sc.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Active Chat Stream */
          <div className="flex-1 flex flex-col h-[550px] bg-slate-900/60 rounded-3xl border border-slate-800/80 overflow-hidden">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs md:max-w-md p-4 rounded-2xl text-xs leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none shadow-[0_4px_12px_rgba(37,99,235,0.2)]'
                        : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700/50'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.content}</p>
                    
                    {m.role === 'model' && (
                      <button
                        onClick={() => speakText(m.content)}
                        className="mt-2 text-slate-400 hover:text-white transition-colors"
                        title="Ouvir novamente"
                      >
                        <FaVolumeUp size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 border border-slate-700/50 p-4 rounded-2xl rounded-bl-none flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Evaluation Review Panel */}
            {lastEvaluation && (
              <div className="bg-slate-950 p-4 border-t border-slate-850 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gramática:</span>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                      lastEvaluation.grammarRating === 'Excellent' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/30' :
                      lastEvaluation.grammarRating === 'Good' ? 'bg-blue-950/40 text-blue-400 border border-blue-800/30' :
                      'bg-rose-950/40 text-rose-400 border border-rose-800/30'
                    }`}>
                      {lastEvaluation.grammarRating === 'Excellent' ? 'Excelente 🏆' :
                       lastEvaluation.grammarRating === 'Good' ? 'Muito Bom 👍' : 'Pode Melhorar ⚠️'}
                    </span>
                  </div>
                  {lastEvaluation.grammarTip && (
                    <p className="text-[11px] text-slate-350 italic">💡 {lastEvaluation.grammarTip}</p>
                  )}
                  {lastEvaluation.vocabularyTip && (
                    <p className="text-[10px] text-slate-500">Vocabulary: {lastEvaluation.vocabularyTip}</p>
                  )}
                </div>
                <div className="shrink-0 text-emerald-400 text-xs font-bold bg-emerald-500/5 px-3 py-1.5 rounded-xl border border-emerald-500/10">
                  + {lastEvaluation.xpEarned} XP ⚡
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Microphone Control Area */}
      {selectedScenario && (
        <div className="max-w-4xl w-full mx-auto py-6 border-t border-white/5 flex flex-col items-center gap-4 bg-slate-950">
          <div className="text-center">
            {isListening ? (
              <div className="space-y-2">
                <div className="flex gap-1 justify-center items-center h-4">
                  <div className="w-1 bg-blue-500 h-2 rounded animate-pulse"></div>
                  <div className="w-1 bg-blue-500 h-4 rounded animate-pulse [animation-delay:0.1s]"></div>
                  <div className="w-1 bg-blue-500 h-3 rounded animate-pulse [animation-delay:0.2s]"></div>
                  <div className="w-1 bg-blue-500 h-1 rounded animate-pulse [animation-delay:0.3s]"></div>
                </div>
                <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest">Gravando áudio em inglês...</p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 font-light">Clique no microfone para falar em inglês</p>
            )}
          </div>

          <button
            onClick={handleToggleListening}
            disabled={loading}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95 disabled:opacity-50 ${
              isListening
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] animate-pulse'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]'
            }`}
          >
            {isListening ? <FaStop size={18} /> : <FaMicrophone size={18} />}
          </button>

          {transcription && (
            <p className="text-slate-400 text-xs mt-1 max-w-md text-center leading-relaxed">
              Você disse: <span className="text-white italic">"{transcription}"</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
