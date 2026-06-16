/**
 * TTS Abstraction Layer
 * 
 * Centralizes text-to-speech functionality.
 * Currently uses Web Speech API, but can be swapped out for OpenAI TTS, Kokoro, etc.
 */

let cachedVoices: SpeechSynthesisVoice[] = [];

// Initialize voices as soon as possible, since getVoices() is asynchronous on some browsers
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  cachedVoices = window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
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
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Set callbacks
  if (onStart) utterance.onstart = () => onStart();
  if (onEnd) utterance.onend = () => onEnd();
  
  utterance.onerror = (e) => {
    console.error('[TTS] Error event:', e);
    onError?.(e);
  };

  // Refresh voices in case it wasn't caught by the event listener
  if (cachedVoices.length === 0) {
    cachedVoices = window.speechSynthesis.getVoices();
  }

  // Find all English voices
  const englishVoices = cachedVoices.filter(v => v.lang.startsWith('en') || v.lang.includes('en'));
  
  // Score them based on how natural and soothing they are
  let bestVoice: SpeechSynthesisVoice | undefined;
  let highestScore = -1;

  for (const voice of englishVoices) {
    let score = 0;
    const nameLower = voice.name.toLowerCase();
    
    // Microsoft/Edge natural voices are incredibly realistic and soothing
    if (nameLower.includes('natural')) score += 100;
    // Premium Siri/Apple voices
    if (nameLower.includes('samantha')) score += 80;
    if (nameLower.includes('daniel')) score += 70;
    // Google voices
    if (nameLower.includes('google')) score += 60;
    // Online high-quality voices
    if (nameLower.includes('online')) score += 50;
    
    // US English preferred, then UK, then others
    if (voice.lang.startsWith('en-US') || voice.lang.includes('en_US')) {
      score += 10;
    } else if (voice.lang.startsWith('en-GB') || voice.lang.includes('en_GB')) {
      score += 5;
    }

    if (score > highestScore) {
      highestScore = score;
      bestVoice = voice;
    }
  }

  if (bestVoice) {
    utterance.voice = bestVoice;
    if (import.meta.env.DEV) {
      console.log(`[TTS] Selected voice: ${bestVoice.name} (${bestVoice.lang}) - Score: ${highestScore}`);
    }
  } else {
    utterance.lang = 'en-US';
    if (import.meta.env.DEV) {
      console.log('[TTS] Using default system voice');
    }
  }

  utterance.rate = 0.85; // Slightly slower for clarity
  window.speechSynthesis.speak(utterance);
};
