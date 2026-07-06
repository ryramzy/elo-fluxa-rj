import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '../../utils/sounds';

/**
 * NOTE FOR FUTURE UPGRADE (Antigravity 2.0 / PM):
 * Character-level string matching using Levenshtein distance serves as a v1 proxy for pronunciation grading.
 * It has limitations: for example, if a student says "technology" when the target is "tech", character-based edit
 * distance will flag it as incorrect despite demonstrating contextual mastery.
 * Future roadmap upgrade should replace this with phoneme-level comparisons (e.g. CMU Pronouncing Dictionary
 * phoneme lists or a lightweight phoneme-based Web Speech recognition API).
 */

interface WordDiff {
  text: string;
  status: 'correct' | 'warning' | 'error';
  spokenText?: string;
}

interface VoicePracticeProps {
  eloPrompt: string;
  targetPhrase?: string;
  accuracyThreshold?: number; // default: 80
  onSuccess?: () => void;
}

export const VoicePractice: React.FC<VoicePracticeProps> = ({ 
  eloPrompt, 
  targetPhrase, 
  accuracyThreshold = 80, 
  onSuccess 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);
  const [keywords, setKeywords] = useState<{ text: string; matched: boolean }[]>([]);
  const [typedFallback, setTypedFallback] = useState('');
  const [practiceCompleted, setPracticeCompleted] = useState(false);
  const [pronunciationResult, setPronunciationResult] = useState<{
    expected: string;
    spoken: string;
    diffs: WordDiff[];
    score: number;
  } | null>(null);
  
  const recognitionRef = useRef<any>(null);

  // Extract keywords between single/double quotes in the Elo Prompt for fallback match
  useEffect(() => {
    const extracted: { text: string; matched: boolean }[] = [];
    const regex = /['"]([^'"]+)['"]/g;
    let match;
    while ((match = regex.exec(eloPrompt)) !== null) {
      if (match[1] && match[1].trim().length > 1) {
        extracted.push({ text: match[1].toLowerCase().trim(), matched: false });
      }
    }
    setKeywords(extracted);
    setTranscript('');
    setPracticeCompleted(false);
    setTypedFallback('');
    setPronunciationResult(null);
  }, [eloPrompt, targetPhrase]);

  // Check speech recognition support
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US'; // We practice English speaking!

    rec.onstart = () => {
      setIsListening(true);
      setMicPermissionDenied(false);
    };

    rec.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      if (event.error === 'not-allowed') {
        setMicPermissionDenied(true);
      }
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    rec.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const currentText = (finalTranscript || interimTranscript).trim();
      if (currentText) {
        setTranscript(currentText);
        
        if (targetPhrase) {
          const result = calculatePronunciationDiff(targetPhrase, currentText);
          setPronunciationResult({
            expected: targetPhrase,
            spoken: currentText,
            diffs: result.diffs,
            score: result.score
          });
          
          if (result.score >= accuracyThreshold) {
            handleSuccess();
          } else if (event.results[event.results.length - 1]?.isFinal) {
            sounds.playError();
          }
        } else {
          checkMatches(currentText);
        }
      }
    };

    recognitionRef.current = rec;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [targetPhrase, accuracyThreshold]);

  const calculatePronunciationDiff = (expected: string, spoken: string) => {
    const normExpected = expected.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").split(/\s+/).filter(Boolean);
    const normSpoken = spoken.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").split(/\s+/).filter(Boolean);
    
    const diffs: WordDiff[] = [];
    let correctCount = 0;
    
    normExpected.forEach((word, idx) => {
      const spokenWord = normSpoken[idx];
      if (!spokenWord) {
        diffs.push({ text: word, status: 'error' });
      } else if (word === spokenWord) {
        diffs.push({ text: word, status: 'correct' });
        correctCount++;
      } else {
        const distance = getLevenshteinDistance(word, spokenWord);
        if (distance <= 2) {
          diffs.push({ text: word, status: 'warning', spokenText: spokenWord });
          correctCount += 0.5; // partial credit
        } else {
          diffs.push({ text: word, status: 'error', spokenText: spokenWord });
        }
      }
    });

    const rawScore = normExpected.length > 0 ? (correctCount / normExpected.length) * 100 : 0;
    return {
      diffs,
      score: Math.round(rawScore)
    };
  };

  const getLevenshteinDistance = (a: string, b: string): number => {
    const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        if (a[i - 1] === b[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j - 1] + 1
          );
        }
      }
    }
    return matrix[a.length][b.length];
  };

  const checkMatches = (text: string) => {
    const lowerText = text.toLowerCase();
    let allMatched = true;

    setKeywords((prev) => {
      const updated = prev.map((kw) => {
        const isMatch = lowerText.includes(kw.text);
        if (!isMatch) allMatched = false;
        return { ...kw, matched: isMatch };
      });

      if (updated.length > 0 && allMatched && !practiceCompleted) {
        handleSuccess();
      }
      return updated;
    });

    if (keywords.length === 0 && lowerText.split(/\s+/).length >= 3 && !practiceCompleted) {
      handleSuccess();
    }
  };

  const handleSuccess = () => {
    setPracticeCompleted(true);
    sounds.playSuccess();
    if (onSuccess) {
      onSuccess();
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setTranscript('');
      setPronunciationResult(null);
      setKeywords((prev) => prev.map((k) => ({ ...k, matched: false })));
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Failed to start speech recognition', err);
      }
    }
  };

  const handleFallbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedFallback.trim()) return;
    const cleanInput = typedFallback.trim();
    setTranscript(cleanInput);
    
    if (targetPhrase) {
      const result = calculatePronunciationDiff(targetPhrase, cleanInput);
      setPronunciationResult({
        expected: targetPhrase,
        spoken: cleanInput,
        diffs: result.diffs,
        score: result.score
      });
      if (result.score >= accuracyThreshold) {
        handleSuccess();
      } else {
        sounds.playError();
      }
    } else {
      checkMatches(cleanInput);
    }
  };

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col items-center">
      <h3 className="text-sm font-bold tracking-wider text-slate-400 uppercase mb-4">
        Prática de Fala / Speak Practice
      </h3>

      {/* Mic Permission Denied State Banner */}
      {micPermissionDenied && (
        <div className="w-full mb-4 p-4 bg-red-500/10 border border-red-500/25 rounded-2xl text-center">
          <p className="text-xs text-red-400 font-semibold mb-3">
            Acesso ao microfone rejeitado. Ative as permissões nas configurações do navegador ou digite abaixo:
          </p>
          <button
            type="button"
            onClick={() => setIsSupported(false)}
            className="text-[10px] font-extrabold uppercase tracking-wider bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg border border-red-500/30 transition-all"
          >
            Digitar resposta
          </button>
        </div>
      )}

      {/* Keywords Checklist */}
      {keywords.length > 0 && !targetPhrase && (
        <div className="w-full mb-6 bg-slate-950/40 p-4 rounded-2xl border border-slate-800">
          <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
            Palavras-chave necessárias:
          </p>
          <div className="flex flex-wrap gap-2">
            {keywords.map((kw, i) => (
              <span
                key={i}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-1.5 ${
                  kw.matched
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-800/60 text-slate-400 border border-slate-800'
                }`}
              >
                {kw.matched ? '✓' : '•'} {kw.text}
              </span>
            ))}
          </div>
        </div>
      )}

      {isSupported ? (
        <div className="flex flex-col items-center gap-4 w-full">
          <button
            type="button"
            onClick={toggleListening}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 relative ${
              isListening
                ? 'bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.6)] scale-110'
                : 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:scale-105'
            }`}
          >
            {isListening && (
              <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30" />
            )}
            <svg
              className={`w-10 h-10 text-white transition-transform ${isListening ? 'scale-90' : ''}`}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
            </svg>
          </button>

          <p className="text-xs font-medium text-slate-400">
            {isListening ? 'Escutando... fale em inglês agora' : 'Toque para começar a falar'}
          </p>

          {/* Pronunciation Grader Output Card */}
          {pronunciationResult && (
            <div className="w-full mt-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400 block mb-3">
                Precisão da Pronúncia: {pronunciationResult.score}%
              </span>
              <div className="flex flex-wrap justify-center gap-1.5 mb-3">
                {pronunciationResult.diffs.map((diff, i) => (
                  <span
                    key={i}
                    className={`px-2.5 py-1 rounded text-xs font-bold border transition-all ${
                      diff.status === 'correct' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      diff.status === 'warning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}
                    title={diff.status !== 'correct' && diff.spokenText ? `Falado: ${diff.spokenText}` : undefined}
                  >
                    {diff.text}
                  </span>
                ))}
              </div>
              <div className="text-[10px] text-slate-500 italic">
                Sua fala: "{pronunciationResult.spoken}"
              </div>
            </div>
          )}

          {/* Fallback simple spoken transcription */}
          {transcript && !pronunciationResult && (
            <div className="w-full mt-4 bg-slate-950/60 border border-slate-800 rounded-2xl p-4 text-center">
              <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400 block mb-1">
                Você disse:
              </span>
              <p className="text-slate-100 text-lg italic leading-relaxed">
                "{transcript}"
              </p>
            </div>
          )}

          {practiceCompleted && (
            <div className="mt-4 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 animate-bounce">
              <span>🎉 Muito bem! Pronúncia validada.</span>
            </div>
          )}
        </div>
      ) : (
        /* Fallback for unsupported browsers/denied permission */
        <div className="w-full flex flex-col items-center">
          <p className="text-xs text-amber-400/90 mb-4 text-center">
            Prática por voz indisponível neste navegador. Digite sua tradução/frase abaixo:
          </p>
          <form onSubmit={handleFallbackSubmit} className="w-full flex gap-2">
            <input
              type="text"
              placeholder="Digite sua resposta..."
              value={typedFallback}
              onChange={(e) => setTypedFallback(e.target.value)}
              className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-650 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              type="submit"
              className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all shadow-md active:scale-95"
            >
              Validar
            </button>
          </form>

          {/* Grader output for manual input */}
          {pronunciationResult && (
            <div className="w-full mt-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400 block mb-3">
                Precisão do Texto: {pronunciationResult.score}%
              </span>
              <div className="flex flex-wrap justify-center gap-1.5">
                {pronunciationResult.diffs.map((diff, i) => (
                  <span
                    key={i}
                    className={`px-2.5 py-1 rounded text-xs font-bold border transition-all ${
                      diff.status === 'correct' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      diff.status === 'warning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}
                  >
                    {diff.text}
                  </span>
                ))}
              </div>
            </div>
          )}

          {transcript && !pronunciationResult && (
            <div className="w-full mt-4 bg-slate-950/60 border border-slate-800 rounded-2xl p-4 text-center">
              <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400 block mb-1">
                Sua Resposta:
              </span>
              <p className="text-slate-100 text-base italic leading-relaxed">
                "{transcript}"
              </p>
            </div>
          )}

          {practiceCompleted && (
            <div className="mt-4 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 animate-bounce">
              <span>🎉 Correto! Texto validado com sucesso.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
