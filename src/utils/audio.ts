// Web Audio API Synthesizer for Paranormal Atmosphere & Sound FX

class ParanormalSoundEngine {
  private ctx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  private ambientOscillators: OscillatorNode[] = [];
  public isAmbientPlaying: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Toggle ambient dark drone hum
  public toggleAmbient(enable?: boolean): boolean {
    this.initCtx();
    if (!this.ctx) return false;

    const shouldPlay = enable !== undefined ? enable : !this.isAmbientPlaying;

    if (!shouldPlay) {
      this.stopAmbient();
      return false;
    }

    try {
      this.stopAmbient();

      const now = this.ctx.currentTime;
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.001, now);
      // Smooth fade in to a low, atmospheric rumble
      this.ambientGain.gain.exponentialRampToValueAtTime(0.04, now + 2);

      // Low frequency drone oscillators: 55Hz (A1), 82.4Hz (E2), 110Hz (A2)
      const freqs = [55, 82.4, 110.2];
      this.ambientOscillators = freqs.map((f, i) => {
        const osc = this.ctx!.createOscillator();
        osc.type = i === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(f + (i === 1 ? 0.3 : 0), now);
        
        // Detune modulation for an eerie paranormal wobble
        const lfo = this.ctx!.createOscillator();
        const lfoGain = this.ctx!.createGain();
        lfo.frequency.setValueAtTime(0.15 + i * 0.05, now);
        lfoGain.gain.setValueAtTime(1.5, now);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.detune);
        lfo.start();

        osc.connect(this.ambientGain!);
        osc.start();
        return osc;
      });

      this.ambientGain.connect(this.ctx.destination);
      this.isAmbientPlaying = true;
      return true;
    } catch {
      return false;
    }
  }

  public stopAmbient() {
    if (this.ambientGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.ambientGain.gain.setValueAtTime(this.ambientGain.gain.value, now);
      this.ambientGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
      setTimeout(() => {
        this.ambientOscillators.forEach((o) => {
          try {
            o.stop();
            o.disconnect();
          } catch {
            // ignore
          }
        });
        this.ambientOscillators = [];
        this.ambientGain = null;
        this.isAmbientPlaying = false;
      }, 1300);
    } else {
      this.ambientOscillators = [];
      this.ambientGain = null;
      this.isAmbientPlaying = false;
    }
  }

  // Card Flip Sound (Crisp paper whisper & subtle resonant chime)
  public playCardFlip() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Soft paper whoosh
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.14);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // Audio autoplay restrictions or errors silently handled
    }
  }

  // Ritual Sigil Resonator chime (Triggered when switching elements or exporting)
  public playSigilChime(elementFreq = 440) {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(elementFreq, now);
      osc.frequency.exponentialRampToValueAtTime(elementFreq * 0.75, now + 0.35);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch {
      // ignore
    }
  }
}

export const soundEngine = new ParanormalSoundEngine();
