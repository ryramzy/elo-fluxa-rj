import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '../../utils/sounds';

interface VoicePracticeProps {
  eloPrompt: string;
  onSuccess?: () => void;
}

export const VoicePractice: React.FC<VoicePracticeProps> = ({ eloPrompt, onSuccess }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [keywords, setKeywords] = useState<{ text: string; matched: boolean }[]>([]);
  const [typedFallback, setTypedFallback] = useState('');
  const [practiceCompleted, setPracticeCompleted] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Extract keywords between single/double quotes in the Elo Prompt (e.g., 'slippery slope')
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
  }, [eloPrompt]);

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
    };

    rec.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      if (event.error === 'not-allowed') {
        setIsSupported(false); // Fallback to typing if permission denied
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
        checkMatches(currentText);
      }
    };

    recognitionRef.current = rec;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const checkMatches = (text: string) => {
    const lowerText = text.toLowerCase();
    let allMatched = true;

    setKeywords((prev) => {
      const updated = prev.map((kw) => {
        const isMatch = lowerText.includes(kw.text);
        if (!isMatch) allMatched = false;
        return { ...kw, matched: isMatch };
      });

      // If keywords exist and all are matched, complete the practice
      if (updated.length > 0 && allMatched && !practiceCompleted) {
        handleSuccess();
      }
      return updated;
    });

    // If no keywords exist, check for sentence length (> 3 words) to award success
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
      // Reset keyword matches
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
    setTranscript(typedFallback.trim());
    checkMatches(typedFallback.trim());
  };

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col items-center">
      <h3 className="text-sm font-bold tracking-wider text-slate-400 uppercase mb-4">
        Prática de Fala / Speak Practice
      </h3>

      {/* Keywords Checklist */}
      {keywords.length > 0 && (
        <div className="w-full mb-6 bg-slate-950/40 p-4 rounded-2xl border border-slate-800">
          <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
            Keywords to use:
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
          {/* Pulse mic button */}
          <button
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
            {isListening ? 'Listening... speak in English now' : 'Tap to start speaking'}
          </p>

          {/* Transcript box */}
          {transcript && (
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
              <span>🎉 Good job! Pronunciation verified.</span>
            </div>
          )}
        </div>
      ) : (
        /* Fallback for unsupported browsers/denied permission */
        <div className="w-full flex flex-col items-center">
          <p className="text-xs text-amber-400/90 mb-4 text-center">
            Microphone speaking practice not available. Type your response below to practice writing:
          </p>
          <form onSubmit={handleFallbackSubmit} className="w-full flex gap-2">
            <input
              type="text"
              placeholder="Type your translation/response..."
              value={typedFallback}
              onChange={(e) => setTypedFallback(e.target.value)}
              className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              type="submit"
              className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all"
            >
              Verify
            </button>
          </form>

          {transcript && (
            <div className="w-full mt-4 bg-slate-950/60 border border-slate-800 rounded-2xl p-4 text-center">
              <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400 block mb-1">
                Your Answer:
              </span>
              <p className="text-slate-100 text-base italic leading-relaxed">
                "{transcript}"
              </p>
            </div>
          )}

          {practiceCompleted && (
            <div className="mt-4 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 animate-bounce">
              <span>🎉 Correct! Translation matches keywords.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
