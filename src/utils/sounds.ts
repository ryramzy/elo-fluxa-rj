// A lightweight procedural sound engine using the Web Audio API.
// No external mp3 files needed!

class SoundEngine {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playEnrollSuccess() {
    try {
      this.init();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      
      // A bright, ascending major chord arpeggio (C5, E5, G5, C6)
      this.playNote(523.25, t, 0.1);      // C5
      this.playNote(659.25, t + 0.1, 0.1); // E5
      this.playNote(783.99, t + 0.2, 0.1); // G5
      this.playNote(1046.50, t + 0.3, 0.4); // C6 with longer decay
    } catch (err) {
      console.warn('Audio playback failed', err);
    }
  }

  public playLessonComplete() {
    try {
      this.init();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      
      // A triumphant fanfare-like chime (G4, C5, E5, G5 held)
      this.playNote(392.00, t, 0.15);      // G4
      this.playNote(523.25, t + 0.15, 0.15); // C5
      this.playNote(659.25, t + 0.30, 0.15); // E5
      this.playNote(783.99, t + 0.45, 0.6);  // G5 held
    } catch (err) {
      console.warn('Audio playback failed', err);
    }
  }

  private playNote(frequency: number, startTime: number, duration: number) {
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, startTime);

    // Envelope (Attack, Decay)
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05); // Quick attack
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration); // Smooth decay

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }
}

export const sounds = new SoundEngine();
