/**
 * TTS Abstraction Layer
 * 
 * Centralizes text-to-speech functionality.
 * Optimized for natural, cloud-synthesized voices with local browser fallbacks.
 */

let cachedVoices: SpeechSynthesisVoice[] = [];
let cachedVoicesByAccent: Record<string, SpeechSynthesisVoice | null> = {};
let currentAudioElement: HTMLAudioElement | null = null;

// Initialize voices as soon as possible, since getVoices() is asynchronous on some browsers
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  cachedVoices = window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
}

/**
 * Halts any active cloud audio stream or local browser speechSynthesis.
 */
export const cancelSpeech = () => {
  if (currentAudioElement) {
    try {
      currentAudioElement.pause();
    } catch (e) {
      console.warn('[TTS] Failed to pause audio element:', e);
    }
    currentAudioElement = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

/**
 * Calculates a voice quality score based on browser platform naming standards.
 * Used for local Web Speech fallbacks.
 */
const getVoiceQualityScore = (voice: SpeechSynthesisVoice, targetAccent: string): number => {
  let score = 0;
  const nameLower = voice.name.toLowerCase();
  const langLower = voice.lang.toLowerCase();

  // Premium Apple Siri voices
  if (nameLower.includes('siri')) {
    score += 150;
  }
  // Microsoft Natural online voices
  else if (nameLower.includes('natural')) {
    score += 100;
    if (nameLower.includes('jenny')) score += 30;
    if (nameLower.includes('aria')) score += 20;
  }
  // Neural/Online voice tokens
  else if (nameLower.includes('neural') || nameLower.includes('online')) {
    score += 80;
  }
  // Google online/premium voices
  else if (nameLower.includes('google')) {
    score += 70;
  }
  // Samantha classic iOS voice
  else if (nameLower.includes('samantha')) {
    score += 65;
  }

  // Penalize local offline dry default voices if natural online alternatives exist
  const localRoboticVoices = ['david', 'zira', 'hazel', 'desktop', 'local', 'microsoft david', 'microsoft zira', 'hazel desktop'];
  if (localRoboticVoices.some(v => nameLower.includes(v))) {
    score -= 100;
  }

  // Prefer female profiles for a soothing default tone
  const femaleKeywords = ['female', 'jenny', 'aria', 'samantha', 'zira', 'hazel', 'susan', 'karen', 'siri', 'fiona'];
  if (femaleKeywords.some(keyword => nameLower.includes(keyword))) {
    score += 15;
  }

  // Accent-specific scoring matching target regional dial
  if (targetAccent === 'gb') {
    const isBritish = langLower.includes('gb') || langLower.includes('uk') || nameLower.includes('daniel') || nameLower.includes('british') || nameLower.includes('uk') || nameLower.includes('gb') || nameLower.includes('oliver');
    if (isBritish) {
      score += 100;
    } else {
      score -= 300;
    }
  } else if (targetAccent === 'au') {
    const isAustralian = langLower.includes('au') || nameLower.includes('karen') || nameLower.includes('australian') || nameLower.includes('au');
    if (isAustralian) {
      score += 100;
    } else {
      score -= 300;
    }
  } else {
    const isUS = langLower.includes('us') || nameLower.includes('google us') || nameLower.includes('samantha') || nameLower.includes('david');
    if (isUS) {
      score += 100;
    } else {
      score -= 300;
    }
  }

  return score;
};

/**
 * Local Web Speech Synthesis fallback.
 */
const speakLocalWebSpeech = (
  cleanText: string,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void,
  accent?: 'us' | 'gb' | 'au'
) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis API not supported in this environment.');
    onError?.('SpeechSynthesis API not supported');
    return;
  }

  const utterance = new SpeechSynthesisUtterance(cleanText);
  
  if (onStart) utterance.onstart = () => onStart();
  if (onEnd) utterance.onend = () => onEnd();
  
  utterance.onerror = (e) => {
    console.error('[TTS Local] Error event:', e);
    onError?.(e);
  };

  const targetAccent = accent || 'us';
  let cachedVoice = cachedVoicesByAccent[targetAccent];

  // Refresh voices list in case they loaded asynchronously
  if (cachedVoices.length === 0) {
    cachedVoices = window.speechSynthesis.getVoices();
  }

  if (cachedVoice && cachedVoices.length > 2) {
    const cachedScore = getVoiceQualityScore(cachedVoice, targetAccent);
    if (cachedScore < 50) {
      cachedVoice = null; // force re-scan
    }
  }

  if (cachedVoice) {
    utterance.voice = cachedVoice;
  } else {
    let targetLang = 'en-us';
    if (accent === 'gb') targetLang = 'en-gb';
    else if (accent === 'au') targetLang = 'en-au';

    let targetVoices = cachedVoices.filter(v => v.lang.toLowerCase() === targetLang || v.lang.toLowerCase().replace('_', '-') === targetLang);
    if (targetVoices.length === 0) {
      targetVoices = cachedVoices.filter(v => v.lang.toLowerCase().startsWith('en') || v.lang.toLowerCase().includes('en'));
    }

    if (targetVoices.length === 0 && cachedVoices.length > 0) {
      const preferredFallbacks = ['google us english', 'samantha', 'david', 'jenny', 'aria', 'daniel', 'karen', 'oliver', 'fiona'];
      for (const fallback of preferredFallbacks) {
        const found = cachedVoices.find(v => v.name.toLowerCase().includes(fallback));
        if (found) {
          targetVoices = [found];
          break;
        }
      }
    }
    
    let bestVoice: SpeechSynthesisVoice | undefined;
    let highestScore = -1;

    for (const voice of targetVoices) {
      const score = getVoiceQualityScore(voice, targetAccent);
      if (score > highestScore) {
        highestScore = score;
        bestVoice = voice;
      }
    }

    if (bestVoice) {
      cachedVoicesByAccent[targetAccent] = bestVoice;
      utterance.voice = bestVoice;
    } else {
      utterance.lang = accent === 'gb' ? 'en-GB' : accent === 'au' ? 'en-AU' : 'en-US';
    }
  }

  utterance.rate = 0.98;
  utterance.pitch = 1.12;

  try {
    window.speechSynthesis.speak(utterance);
  } catch (speakErr) {
    console.error('[TTS Local] Failed to execute speak()', speakErr);
    onError?.(speakErr);
  }
};

/**
 * High-level speak routine. Attempts premium cloud API and falls back to local synthesis.
 */
export const speakText = async (
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void,
  accent?: 'us' | 'gb' | 'au'
) => {
  // 1. Terminate any active speakers
  cancelSpeech();
  
  // Clean text from Markdown tags, formatting, and tables
  let cleanText = text
    .replace(/\|\|\|/g, '. ') // Natural pause replacement
    .replace(/\[NEW\]/gi, '')
    .replace(/\[DELETE\]/gi, '')
    .trim();

  cleanText = cleanText
    .replace(/\|/g, ' ')
    .replace(/-{3,}/g, '')
    .replace(/#{1,6}\s+/g, '')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/^\s*>\s+/gm, '')
    .replace(/^\s*[\*\+-]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanText) {
    return;
  }

  try {
    // 2. Contact the serverless premium voice synthesis proxy
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: cleanText,
        accent: accent || 'us'
      })
    });

    if (!response.ok) {
      throw new Error(`API synthesis returned status: ${response.status}`);
    }

    // 3. Play back the returned MP3 stream using HTML5 Audio
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    currentAudioElement = audio;

    if (onStart) {
      audio.onplay = () => onStart();
    }

    audio.onended = () => {
      if (onEnd) onEnd();
      URL.revokeObjectURL(audioUrl);
      if (currentAudioElement === audio) {
        currentAudioElement = null;
      }
    };

    audio.onerror = (e) => {
      console.warn('[TTS] Audio element playback error, falling back:', e);
      URL.revokeObjectURL(audioUrl);
      speakLocalWebSpeech(cleanText, onStart, onEnd, onError, accent);
    };

    await audio.play();
  } catch (err: any) {
    console.log('[TTS] Premium cloud route bypassed/failed. Falling back to local WebSpeech:', err.message || err);
    speakLocalWebSpeech(cleanText, onStart, onEnd, onError, accent);
  }
};
