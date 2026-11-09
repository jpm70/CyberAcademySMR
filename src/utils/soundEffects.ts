// Sintetizador de audio inmersivo (Efectos SFX + Bucle de Sonido Ambiente de Oficina de Soporte)
// Implementado 100% con Web Audio API nativa (sin archivos externos) y canales de volumen independientes.

class SoundController {
  private ctx: AudioContext | null = null;

  // Canal de Efectos de Sonido (SFX)
  public sfxMuted: boolean = false;
  private sfxVolume: number = 0.75;

  // Canal de Sonido Ambiente de Oficina (Ventiladores del Rack + Tecleo lejano)
  public ambientEnabled: boolean = false;
  private ambientVolume: number = 0.45;
  private ambientMasterGain: GainNode | null = null;
  private fanFilterNode: BiquadFilterNode | null = null;
  private fanNoiseSource: AudioBufferSourceNode | null = null;
  private fanDroneOsc1: OscillatorNode | null = null;
  private fanDroneOsc2: OscillatorNode | null = null;
  private fanLfoOsc: OscillatorNode | null = null;
  private typingTimerId: number | null = null;
  private isHighCpuLoad: boolean = false;

  // Compatibilidad retroactiva con propiedad .muted
  get muted(): boolean {
    return this.sfxMuted;
  }
  set muted(val: boolean) {
    this.sfxMuted = val;
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public getSfxVolume(): number {
    return this.sfxVolume;
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
  }

  public setSfxMuted(muted: boolean) {
    this.sfxMuted = muted;
  }

  public getAmbientVolume(): number {
    return this.ambientVolume;
  }

  public setAmbientVolume(vol: number) {
    this.ambientVolume = Math.max(0, Math.min(1, vol));
    if (this.ambientMasterGain && this.ctx) {
      const targetGain = this.ambientEnabled ? this.ambientVolume * 0.32 : 0.0001;
      this.ambientMasterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.08);
    }
  }

  /**
   * Ajusta la velocidad/frecuencia de los ventiladores del servidor (ej. en Misión 4 con CPU al 99%)
   */
  public setHighCpuLoad(highLoad: boolean) {
    this.isHighCpuLoad = highLoad;
    if (this.ctx && this.fanFilterNode && this.fanDroneOsc1 && this.fanDroneOsc2) {
      const now = this.ctx.currentTime;
      this.fanFilterNode.frequency.setTargetAtTime(highLoad ? 360 : 210, now, 0.4);
      this.fanDroneOsc1.frequency.setTargetAtTime(highLoad ? 78 : 58, now, 0.4);
      this.fanDroneOsc2.frequency.setTargetAtTime(highLoad ? 156 : 116, now, 0.4);
    }
  }

  /**
   * Inicia o detiene el bucle de sonido ambiente suave de oficina:
   * - Zumbido continuo de ventiladores de Rack de Servidores (ruido marrón filtrado + armónicos de ventilación)
   * - Ráfagas suaves y aleatorias de tecleo mecánico lejano en la oficina de soporte
   */
  public setAmbientEnabled(enabled: boolean) {
    this.ambientEnabled = enabled;
    if (enabled) {
      this.startAmbientLoop();
    } else {
      this.stopAmbientLoop();
    }
  }

  public toggleAmbient(): boolean {
    this.setAmbientEnabled(!this.ambientEnabled);
    return this.ambientEnabled;
  }

  private startAmbientLoop() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    // Si ya están creados los nodos del bucle, solo ajustamos la ganancia
    if (this.ambientMasterGain) {
      this.ambientMasterGain.gain.setTargetAtTime(
        this.ambientVolume * 0.32,
        ctx.currentTime,
        0.15
      );
      this.startDistantTypingScheduler();
      return;
    }

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
    masterGain.gain.setTargetAtTime(this.ambientVolume * 0.32, ctx.currentTime, 0.25);
    masterGain.connect(ctx.destination);
    this.ambientMasterGain = masterGain;

    // 1. Generador de ruido marrón/rosa suave en bucle para el flujo de aire de los ventiladores del Rack
    const bufferSize = ctx.sampleRate * 4; // Bucle de 4 segundos sin costuras
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.025 * white) / 1.025;
      lastOut = output[i];
      output[i] *= 1.8; // Normalización suave
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const fanFilter = ctx.createBiquadFilter();
    fanFilter.type = 'lowpass';
    fanFilter.frequency.setValueAtTime(this.isHighCpuLoad ? 360 : 210, ctx.currentTime);
    fanFilter.Q.setValueAtTime(1.2, ctx.currentTime);

    const fanAirGain = ctx.createGain();
    fanAirGain.gain.setValueAtTime(0.55, ctx.currentTime);

    // LFO lento para simular la fluctuación natural del aire en el armario de comunicaciones
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.16, ctx.currentTime);
    lfoGain.gain.setValueAtTime(35, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(fanFilter.frequency);

    whiteNoise.connect(fanFilter);
    fanFilter.connect(fanAirGain);
    fanAirGain.connect(masterGain);

    // 2. Zumbido armónico sutil de transformadores y rodamientos del servidor (58 Hz y 116 Hz)
    const drone1 = ctx.createOscillator();
    const drone2 = ctx.createOscillator();
    const droneGain = ctx.createGain();

    drone1.type = 'sine';
    drone1.frequency.setValueAtTime(this.isHighCpuLoad ? 78 : 58, ctx.currentTime);
    drone2.type = 'triangle';
    drone2.frequency.setValueAtTime(this.isHighCpuLoad ? 156 : 116, ctx.currentTime);

    droneGain.gain.setValueAtTime(0.06, ctx.currentTime);

    drone1.connect(droneGain);
    drone2.connect(droneGain);
    droneGain.connect(masterGain);

    whiteNoise.start();
    lfo.start();
    drone1.start();
    drone2.start();

    this.fanNoiseSource = whiteNoise;
    this.fanFilterNode = fanFilter;
    this.fanDroneOsc1 = drone1;
    this.fanDroneOsc2 = drone2;
    this.fanLfoOsc = lfo;

    // 3. Planificador de tecleo mecánico lejano en la oficina
    this.startDistantTypingScheduler();
  }

  private startDistantTypingScheduler() {
    if (this.typingTimerId !== null) return;

    const scheduleNextBurst = () => {
      if (!this.ambientEnabled) return;
      this.playDistantTypingBurst();
    };

    // Dispara pequeñas ráfagas de tecleo lejano cada 1.8 segundos si el ambiente está activo
    this.typingTimerId = window.setInterval(scheduleNextBurst, 1800);
  }

  private playDistantTypingBurst() {
    if (!this.ambientEnabled || this.ambientVolume <= 0.01 || !this.ctx || !this.ambientMasterGain) {
      return;
    }
    if (this.ctx.state === 'suspended') return;

    // 65% de probabilidad de que un compañero en la oficina esté tecleando en esta ventana
    if (Math.random() > 0.65) return;

    const keyCount = 2 + Math.floor(Math.random() * 5); // 2 a 6 pulsaciones por ráfaga
    let offset = 0;

    for (let i = 0; i < keyCount; i++) {
      offset += 0.065 + Math.random() * 0.14;
      const tapTime = this.ctx.currentTime + offset;

      // Clic mecánico suave filtrado en paso-banda (simula un teclado a varios metros)
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const tapGain = this.ctx.createGain();

      osc.type = 'triangle';
      const basePitch = 1400 + Math.random() * 900;
      osc.frequency.setValueAtTime(basePitch, tapTime);
      osc.frequency.exponentialRampToValueAtTime(320, tapTime + 0.022);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1950 + Math.random() * 500, tapTime);
      filter.Q.setValueAtTime(2.5, tapTime);

      const tapAmp = (0.045 + Math.random() * 0.035) * Math.min(1.2, this.ambientVolume + 0.2);
      tapGain.gain.setValueAtTime(tapAmp, tapTime);
      tapGain.gain.exponentialRampToValueAtTime(0.0005, tapTime + 0.026);

      osc.connect(filter);
      filter.connect(tapGain);
      tapGain.connect(this.ambientMasterGain);

      osc.start(tapTime);
      osc.stop(tapTime + 0.028);
    }
  }

  private stopAmbientLoop() {
    if (this.typingTimerId !== null) {
      window.clearInterval(this.typingTimerId);
      this.typingTimerId = null;
    }
    if (this.ambientMasterGain && this.ctx) {
      this.ambientMasterGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.1);
    }
  }

  // =========================================================================
  // EFECTOS DE SONIDO INTERACTIVOS (CANAL SFX INDEPENDIENTE)
  // =========================================================================

  private getSfxContext(): AudioContext | null {
    if (this.sfxMuted || this.sfxVolume <= 0.01) return null;
    return this.ensureContext();
  }

  public playClick() {
    const ctx = this.getSfxContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(620, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.06);
    gain.gain.setValueAtTime(0.1 * this.sfxVolume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  }

  public playCableSnap() {
    const ctx = this.getSfxContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.setValueAtTime(980, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.18 * this.sfxVolume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.14);
  }

  public playSuccess() {
    const ctx = this.getSfxContext();
    if (!ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const startTime = ctx.currentTime + idx * 0.09;
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.14 * this.sfxVolume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.25);
    });
  }

  public playError() {
    const ctx = this.getSfxContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.12 * this.sfxVolume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }
}

export const soundFX = new SoundController();
