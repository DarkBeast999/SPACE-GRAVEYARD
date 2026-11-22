import { useAppStore } from '../store/useAppStore';

let audioContext: AudioContext | null = null;
let droneOscillator: OscillatorNode | null = null;
let droneGainNode: GainNode | null = null;
let pingTimeoutId: number | null = null;

function isAudioAllowed(): boolean {
  try {
    return !!useAppStore.getState().soundEnabled;
  } catch {
    return false;
  }
}

export function initAudio(): AudioContext | null {
  if (!isAudioAllowed()) {
    return null;
  }
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    return audioContext;
  } catch {
    return null;
  }
}

export function muteAllAudio(): void {
  try {
    if (pingTimeoutId) {
      clearTimeout(pingTimeoutId);
      pingTimeoutId = null;
    }
    if (droneOscillator) {
      droneOscillator.stop();
      droneOscillator.disconnect();
      droneOscillator = null;
    }
    if (droneGainNode) {
      droneGainNode.disconnect();
      droneGainNode = null;
    }
    if (audioContext && audioContext.state !== 'closed') {
      audioContext.suspend();
    }
  } catch {
    // ignore
  }
}

export function playSignalPing(freq = 800): void {
  if (!isAudioAllowed()) return;
  try {
    const ctx = initAudio();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(freq, ctx.currentTime);

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.35);
  } catch {
    // Audio unavailable
  }
}

export function startAmbientDrone(): void {
  if (!isAudioAllowed()) return;
  try {
    const ctx = initAudio();
    if (!ctx) return;
    if (droneOscillator) return; // already active

    droneGainNode = ctx.createGain();
    droneGainNode.gain.setValueAtTime(0.05, ctx.currentTime);
    droneGainNode.connect(ctx.destination);

    droneOscillator = ctx.createOscillator();
    droneOscillator.type = 'sine';
    droneOscillator.frequency.setValueAtTime(55, ctx.currentTime); // Low hum
    droneOscillator.connect(droneGainNode);
    droneOscillator.start();

    // Schedule gentle distant telemetry pings every 9 seconds
    const schedulePing = () => {
      if (!isAudioAllowed() || !droneOscillator) return;
      playSignalPing(440);
      pingTimeoutId = window.setTimeout(schedulePing, 9000);
    };
    pingTimeoutId = window.setTimeout(schedulePing, 9000);
  } catch {
    // Audio unavailable
  }
}

export function stopAmbientDrone(): void {
  muteAllAudio();
}

export function playTypewriterClick(): void {
  if (!isAudioAllowed()) return;
  try {
    const ctx = initAudio();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(1100, ctx.currentTime);

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.001);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.025);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.025);
  } catch {
    // Audio unavailable
  }
}

export function playWhooshSound(): void {
  if (!isAudioAllowed()) return;
  try {
    const ctx = initAudio();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(350, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.25);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1800, ctx.currentTime);

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.04);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.25);
  } catch {
    // Audio unavailable
  }
}

export function playSuccessChime(): void {
  if (!isAudioAllowed()) return;
  try {
    const ctx = initAudio();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + i * 0.08 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.3);
      osc.start(ctx.currentTime + i * 0.08);
      osc.stop(ctx.currentTime + i * 0.08 + 0.3);
    });
  } catch {
    // Audio unavailable
  }
}

export function playErrorBuzz(): void {
  if (!isAudioAllowed()) return;
  try {
    const ctx = initAudio();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.22);
  } catch {
    // Audio unavailable
  }
}

export function playLaserSound(): void {
  if (!isAudioAllowed()) return;
  try {
    const ctx = initAudio();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(950, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
  } catch {
    // Audio unavailable
  }
}

export function playExplosionSound(): void {
  if (!isAudioAllowed()) return;
  try {
    const ctx = initAudio();
    if (!ctx) return;

    // White noise buffer for explosion
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.3);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(ctx.currentTime);
  } catch {
    // Audio unavailable
  }
}
