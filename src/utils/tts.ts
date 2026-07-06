/**
 * TTS Abstraction Layer
 * 
 * Centralizes text-to-speech functionality.
 * Optimized for natural, joyous, Siri-like voice synthesis.
 */

let cachedVoices: SpeechSynthesisVoice[] = [];
let cachedVoicesByAccent: Record<string, SpeechSynthesisVoice | null> = {};

// Initialize voices as soon as possible, since getVoices() is asynchronous on some browsers
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  cachedVoices = window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
    if (import.meta.env.DEV) {
      console.log(`[TTS] Voices loaded. ${cachedVoices.length} voices detected.`);
    }
  };
}

/**
 * Calculates a voice quality score based on browser platform naming standards.
 * Ensures premium neural, natural, online, and siri voices are prioritized.
 */
const getVoiceQualityScore = (voice: SpeechSynthesisVoice, targetAccent: string): number => {
  let score = 0;
  const nameLower = voice.name.toLowerCase();
  const langLower = voice.lang.toLowerCase();

  // Premium Apple Siri voices
  if (nameLower.includes('siri')) {
    score += 150;
  }
  // Microsoft Natural online voices (exceptional clarity)
  else if (nameLower.includes('natural')) {
    score += 100;
    if (nameLower.includes('jenny')) score += 30; // Jenny is warm & joyous
    if (nameLower.includes('aria')) score += 20;  // Aria is bright and soothing
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
      score -= 300; // Penalize non-British voices
    }
  } else if (targetAccent === 'au') {
    const isAustralian = langLower.includes('au') || nameLower.includes('karen') || nameLower.includes('australian') || nameLower.includes('au');
    if (isAustralian) {
      score += 100;
    } else {
      score -= 300; // Penalize non-Australian voices
    }
  } else {
    const isUS = langLower.includes('us') || nameLower.includes('google us') || nameLower.includes('samantha') || nameLower.includes('david');
    if (isUS) {
      score += 100;
    } else {
      score -= 300; // Penalize non-US voices
    }
  }

  return score;
};

export const speakText = (
  text: string,
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

  // Safely cancel any active voice speech without disrupting browsers' internal queues
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }
  
  // Clean text from Markdown tags, formatting, and tables to prevent TTS crashes
  let cleanText = text
    .replace(/\|\|\|/g, '. ') // Replace slide separators with natural pauses
    .replace(/\[NEW\]/gi, '')
    .replace(/\[DELETE\]/gi, '')
    .trim();

  // Strip Markdown characters and formatting blocks
  cleanText = cleanText
    .replace(/\|/g, ' ')                  // Remove table pipes
    .replace(/-{3,}/g, '')                // Remove table line dividers
    .replace(/#{1,6}\s+/g, '')            // Remove markdown headers
    .replace(/(\*\*|__)(.*?)\1/g, '$2')   // Remove bold formatting
    .replace(/(\*|_)(.*?)\1/g, '$2')      // Remove italics formatting
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')   // Remove links (keep link text)
    .replace(/^\s*>\s+/gm, '')            // Remove blockquotes
    .replace(/^\s*[\*\+-]\s+/gm, '')      // Remove bullet points
    .replace(/^\s*\d+\.\s+/gm, '')        // Remove list numbers
    .replace(/\s+/g, ' ')                 // Normalize spacing
    .trim();

  const utterance = new SpeechSynthesisUtterance(cleanText);
  
  // Set callbacks
  if (onStart) utterance.onstart = () => onStart();
  if (onEnd) utterance.onend = () => onEnd();
  
  utterance.onerror = (e) => {
    console.error('[TTS] Error event:', e);
    onError?.(e);
  };

  const targetAccent = accent || 'us';
  let cachedVoice = cachedVoicesByAccent[targetAccent];

  // Refresh voices list in case they loaded asynchronously
  if (cachedVoices.length === 0) {
    cachedVoices = window.speechSynthesis.getVoices();
  }

  // DYNAMIC UPGRADE: If a low quality voice (score < 50) was cached during early async loads,
  // discard it and re-evaluate if better online voices have loaded.
  if (cachedVoice && cachedVoices.length > 2) {
    const cachedScore = getVoiceQualityScore(cachedVoice, targetAccent);
    if (cachedScore < 50) {
      if (import.meta.env.DEV) {
        console.log(`[TTS] Cached voice '${cachedVoice.name}' has low score (${cachedScore}). Re-scanning to upgrade to premium online voice.`);
      }
      cachedVoice = null; // discard to force search
    }
  }

  if (cachedVoice) {
    utterance.voice = cachedVoice;
    if (import.meta.env.DEV) {
      console.log(`[TTS] Using cached voice for ${targetAccent}: ${cachedVoice.name} (${cachedVoice.lang}) - Score: ${getVoiceQualityScore(cachedVoice, targetAccent)}`);
    }
  } else {
    // Determine target language code
    let targetLang = 'en-us';
    if (accent === 'gb') targetLang = 'en-gb';
    else if (accent === 'au') targetLang = 'en-au';

    // Find matching language tags
    let targetVoices = cachedVoices.filter(v => v.lang.toLowerCase() === targetLang || v.lang.toLowerCase().replace('_', '-') === targetLang);
    if (targetVoices.length === 0) {
      targetVoices = cachedVoices.filter(v => v.lang.toLowerCase().startsWith('en') || v.lang.toLowerCase().includes('en'));
    }

    // Sequential fallback for popular voice names if default filter yields nothing
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
    
    // Score them based on how natural, soothing, and joyous they are
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
      if (import.meta.env.DEV) {
        console.log(`[TTS] Selected and cached voice for ${targetAccent}: ${bestVoice.name} (${bestVoice.lang}) - Score: ${highestScore}`);
      }
    } else {
      utterance.lang = accent === 'gb' ? 'en-GB' : accent === 'au' ? 'en-AU' : 'en-US';
      if (import.meta.env.DEV) {
        console.warn(`[TTS] No suitable English voice found. Using default system voice fallback for lang: ${utterance.lang}`);
      }
    }
  }

  // Adjust parameters for a joyous, Siri-like tone
  utterance.rate = 0.98;  // Natural conversational speed
  utterance.pitch = 1.12; // Elevated pitch for a bright, joyous, friendly tone (default is 1.0)

  try {
    window.speechSynthesis.speak(utterance);
  } catch (speakErr) {
    console.error('[TTS] Failed to execute window.speechSynthesis.speak', speakErr);
    onError?.(speakErr);
  }
};
