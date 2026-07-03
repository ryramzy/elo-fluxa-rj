/**
 * TTS Abstraction Layer
 * 
 * Centralizes text-to-speech functionality.
 * Optimized for natural, joyous, Siri-like voice synthesis.
 */

let cachedVoices: SpeechSynthesisVoice[] = [];

// Initialize voices as soon as possible, since getVoices() is asynchronous on some browsers
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  cachedVoices = window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
    console.log(`[TTS] Voices loaded. ${cachedVoices.length} voices detected.`);
  };
}

export const speakText = (
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void
) => {
  if (!('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis API not supported in this browser.');
    onError?.('SpeechSynthesis API not supported');
    return;
  }

  window.speechSynthesis.cancel();
  
  // Clean text from Markdown tags or custom prompt separators
  const cleanText = text
    .replace(/\|\|\|/g, '. ') // Replace slide separators with natural pauses
    .replace(/\[NEW\]/gi, '')
    .replace(/\[DELETE\]/gi, '')
    .trim();

  const utterance = new SpeechSynthesisUtterance(cleanText);
  
  // Set callbacks
  if (onStart) utterance.onstart = () => onStart();
  if (onEnd) utterance.onend = () => onEnd();
  
  utterance.onerror = (e) => {
    console.error('[TTS] Error event:', e);
    onError?.(e);
  };

  // Use cached voice if already determined
  if (selectedVoice) {
    utterance.voice = selectedVoice;
    console.log(`[TTS] Using cached voice: ${selectedVoice.name} (${selectedVoice.lang})`);
  } else {
    // Refresh voices in case it wasn't caught by the event listener
    if (cachedVoices.length === 0) {
      cachedVoices = window.speechSynthesis.getVoices();
    }

    // Find all US English voices primarily, fallback to any English voice ONLY if no US voice is found
    let targetVoices = cachedVoices.filter(v => v.lang.toLowerCase() === 'en-us' || v.lang.toLowerCase() === 'en_us');
    if (targetVoices.length === 0) {
      targetVoices = cachedVoices.filter(v => v.lang.toLowerCase().startsWith('en') || v.lang.toLowerCase().includes('en'));
    }

    // Sequential fallback for popular voice names if default filter yields nothing
    if (targetVoices.length === 0 && cachedVoices.length > 0) {
      const preferredFallbacks = ['google us english', 'samantha', 'david', 'jenny', 'aria'];
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
      let score = 0;
      const nameLower = voice.name.toLowerCase();
      
      // Apple Siri voices are premium and very natural
      if (nameLower.includes('siri')) {
        score += 150;
      }
      // Microsoft Natural online voices (Jenny/Aria are exceptionally friendly and clear)
      else if (nameLower.includes('natural')) {
        score += 100;
        if (nameLower.includes('jenny')) score += 30; // Jenny is warm & joyous
        if (nameLower.includes('aria')) score += 20;  // Aria is bright and soothing
      }
      // Google online voices
      else if (nameLower.includes('google')) {
        score += 80;
      }
      // Other specific premium local/online voices
      else if (nameLower.includes('samantha')) {
        score += 70; // Samantha is classic iOS voice
      }
      else if (nameLower.includes('online')) {
        score += 60;
      }

      // Prefer female voices for a soothing, Siri-like default tone
      const femaleKeywords = ['female', 'jenny', 'aria', 'samantha', 'zira', 'hazel', 'susan', 'karen', 'siri'];
      if (femaleKeywords.some(keyword => nameLower.includes(keyword))) {
        score += 15;
      }

      // US English preferred
      if (voice.lang.startsWith('en-US') || voice.lang.includes('en_US')) {
        score += 10;
      }

      // Heavily penalize any British, UK, or non-US voice to ensure it is never chosen if a US option exists
      const isBritish = voice.lang.toLowerCase().includes('gb') || 
                        voice.lang.toLowerCase().includes('uk') || 
                        nameLower.includes('daniel') || 
                        nameLower.includes('karen') || // Karen is often en-AU or en-GB
                        nameLower.includes('british') || 
                        nameLower.includes('uk') ||
                        nameLower.includes('gb');
      
      if (isBritish) {
        score -= 300; // Extreme penalty
      }

      if (score > highestScore) {
        highestScore = score;
        bestVoice = voice;
      }
    }

    if (bestVoice) {
      selectedVoice = bestVoice;
      utterance.voice = bestVoice;
      console.log(`[TTS] Selected and cached voice: ${bestVoice.name} (${bestVoice.lang}) - Score: ${highestScore}`);
    } else {
      utterance.lang = 'en-US';
      console.log('[TTS] Using default system voice (no matching preferred en-US found)');
    }
  }

  // Adjust parameters for a joyous, Siri-like tone
  utterance.rate = 0.98;  // Natural conversational speed
  utterance.pitch = 1.12; // Elevated pitch for a bright, joyous, friendly tone (default is 1.0)
  
  window.speechSynthesis.speak(utterance);
};
