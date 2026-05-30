/**
 * TTS Abstraction Layer
 * 
 * Centralizes text-to-speech functionality.
 * Currently uses Web Speech API, but can be swapped out for OpenAI TTS, Kokoro, etc.
 */

// Preferred voice fallback order
const PREFERRED_VOICES = ['Samantha', 'Google US English', 'en-US'];

let cachedVoices: SpeechSynthesisVoice[] = [];

// Initialize voices as soon as possible, since getVoices() is asynchronous on some browsers
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  cachedVoices = window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
}

export const speakText = (text: string) => {
  if (!('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis API not supported in this browser.');
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Refresh voices in case it wasn't caught by the event listener
  if (cachedVoices.length === 0) {
    cachedVoices = window.speechSynthesis.getVoices();
  }

  // Find the best voice based on the priority array
  let selectedVoice: SpeechSynthesisVoice | undefined;
  
  for (const preferred of PREFERRED_VOICES) {
    selectedVoice = cachedVoices.find(v => v.name.includes(preferred) || (preferred === 'en-US' && v.lang === 'en-US'));
    if (selectedVoice) break;
  }

  if (selectedVoice) {
    utterance.voice = selectedVoice;
    if (process.env.NODE_ENV === 'development') {
      console.log(`[TTS] Selected voice: ${selectedVoice.name} (${selectedVoice.lang})`);
    }
  } else {
    // Fallback if no specific voice is matched
    utterance.lang = 'en-US';
    if (process.env.NODE_ENV === 'development') {
      console.log('[TTS] Using default system voice');
    }
  }

  utterance.rate = 0.85; // Slightly slower for clarity
  window.speechSynthesis.speak(utterance);
};
