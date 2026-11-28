import React, { useState, useEffect, useRef } from 'react';
import {
  getVoyager1Distance,
  getVoyager2Distance,
  getSignalDelay,
  formatDistanceKm,
  VOYAGER1_EPHEMERIS,
  VOYAGER2_EPHEMERIS,
} from '../utils/timeUtils';
import { playSignalPing } from '../utils/audio';

export const SignalRoomPage: React.FC = () => {
  const [v1Dist, setV1Dist] = useState(getVoyager1Distance());
  const [v2Dist, setV2Dist] = useState(getVoyager2Distance());
  const [isAudioListening, setIsAudioListening] = useState(false);
  const waveformCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Live ticking distance
  useEffect(() => {
    const interval = setInterval(() => {
      setV1Dist(getVoyager1Distance());
      setV2Dist(getVoyager2Distance());
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const v1Delay = getSignalDelay(v1Dist);
  const v2Delay = getSignalDelay(v2Dist);

  // Oscilloscope canvas animation
  useEffect(() => {
    const canvas = waveformCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let height = (canvas.height = 140);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || 600;
      height = canvas.height = 140;
    };
    window.addEventListener('resize', handleResize);

    let phase = 0;
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Grid background lines
      ctx.strokeStyle = 'rgba(120, 156, 184, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw primary carrier sine wave in muted blue
      ctx.beginPath();
      ctx.strokeStyle = '#789CB8';
      ctx.lineWidth = 1.8;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#789CB8';

      for (let x = 0; x < width; x++) {
        const freq1 = Math.sin((x * 0.025) + phase);
        const freq2 = Math.sin((x * 0.065) - phase * 1.4) * 0.35;
        const noise = (Math.random() - 0.5) * 3;
        const y = height / 2 + (freq1 + freq2) * 32 + noise;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw faint secondary harmonic in antique gold
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(198, 163, 107, 0.6)';
      ctx.lineWidth = 1.2;
      for (let x = 0; x < width; x += 2) {
        const y = height / 2 + Math.cos((x * 0.018) + phase * 0.7) * 18;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      phase += 0.05;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Web Audio synthesizer for cosmic listening
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);

  const toggleCosmicAudio = () => {
    if (!isAudioListening) {
      playSignalPing(880);
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioCtxRef.current = ctx;

        // Carrier drone 73 Hz
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(73, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        oscRef.current = osc;
        setIsAudioListening(true);
      } catch {
        setIsAudioListening(true);
      }
    } else {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
      setIsAudioListening(false);
    }
  };

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      {/* Editorial Header */}
      <div className="mb-12">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="font-mono text-xs text-[var(--antique-gold)] tracking-widest uppercase font-medium">
            // INTERSTELLAR OBSERVATORY // HORIZONS EPHEMERIS MODEL
          </span>
          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-white/5 text-[var(--mist-grey)] border border-white/10">
            MATHEMATICALLY MODELED
          </span>
        </div>
        <h1 className="font-display text-4xl sm:text-6xl font-normal text-[var(--warm-ivory)] tracking-tight">
          The Signal Room
        </h1>
        <p className="text-sm sm:text-base text-[var(--mist-grey)] max-w-3xl mt-3 font-sans font-light leading-relaxed">
          Mathematically extrapolated positions for humanity's most distant spacecraft. Distances are computed using
          the linear ephemeris formula <span className="font-mono text-[var(--antique-gold)]">d = d₀ + v·Δt</span> from
          a verified JPL Horizons baseline epoch. This is a <strong className="text-[var(--warm-ivory)] font-medium">predictive astronomical model</strong>,
          not a live data feed — no direct NASA telemetry connection exists in this web application.
        </p>

        {/* Methodology disclosure plaque */}
        <div className="mt-6 bg-black/40 border border-white/10 rounded-2xl p-5 font-mono text-[11px] text-[var(--mist-grey)] space-y-1.5">
          <div className="text-[var(--antique-gold)] font-medium uppercase tracking-wider mb-2 flex items-center gap-2">
            <span>✦</span>
            <span>Mathematical Model Parameters &amp; Provenance</span>
          </div>
          <div>• Extrapolation formula: <span className="text-[var(--warm-ivory)]">d(t) = d₀ + v·Δt</span> (linear constant-velocity model)</div>
          <div>• Baseline epoch: <span className="text-[var(--warm-ivory)]">2024-11-01 00:00:00 UTC</span></div>
          <div>• Astronomical ephemeris source: <span className="text-[var(--antique-gold)]">NASA/JPL Horizons System (ssd.jpl.nasa.gov/horizons)</span></div>
          <div>• Coordinate reference frame: <span className="text-[var(--warm-ivory)]">Heliocentric — distance measured from the Sun's center of mass</span></div>
          <div>• Limitations: Cruise speed undergoes minute gravitational deceleration; model diverges ~0.1% per decade.</div>
        </div>
      </div>

      {/* VOYAGER 1 & 2 DUAL PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* VOYAGER 1 */}
        <div className="glass p-8 sm:p-10 rounded-3xl border border-white/10 relative overflow-hidden bg-[var(--midnight-navy)]/60">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--antique-gold)] animate-pulse" />
              <h2 className="font-display text-2xl font-normal text-[var(--warm-ivory)]">Voyager 1</h2>
            </div>
            <span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-[10px] font-mono font-medium">
              INTERSTELLAR SPACE
            </span>
          </div>

          <p className="font-mono text-xs text-[var(--mist-grey)] mb-8">
            LAUNCHED: SEPT 5, 1977 • SPEED: ~{VOYAGER1_EPHEMERIS.speedKmS.toFixed(2)} KM/S • HELIOPAUSE: ~2012
          </p>

          <div className="space-y-5">
            {/* Modeled Distance */}
            <div className="bg-black/30 p-5 rounded-2xl border border-white/5">
              <div className="flex justify-between items-center mb-1">
                <span className="font-mono text-[11px] text-[var(--mist-grey)] uppercase">
                  Extrapolated Distance From Sol
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[var(--antique-gold)]/15 text-[var(--antique-gold)]">
                  ESTIMATED
                </span>
              </div>
              <div className="font-display text-3xl sm:text-4xl text-[var(--antique-gold)] tracking-wide">
                {formatDistanceKm(v1Dist)}
              </div>
              <div className="font-mono text-[10px] text-[var(--mist-grey)] mt-1.5">
                ≈ {(v1Dist / 149597870.7).toFixed(2)} Astronomical Units (AU) • Epoch: {VOYAGER1_EPHEMERIS.epochLabel}
              </div>
            </div>

            {/* Light Delay */}
            <div className="bg-black/30 p-5 rounded-2xl border border-white/5">
              <div className="font-mono text-[11px] text-[var(--mist-grey)] uppercase mb-1 flex items-center justify-between">
                <span>One-Way Radio Signal Delay</span>
                <span className="text-[9px] px-2 py-0.5 rounded bg-white/5 text-[var(--mist-grey)]">c ≈ 299,792 km/s</span>
              </div>
              <div className="font-display text-2xl text-[var(--warm-ivory)]">
                {v1Delay.hours} hrs {v1Delay.minutes} mins {v1Delay.seconds} secs
              </div>
              <div className="font-mono text-[10px] text-[var(--mist-grey)] mt-1.5">
                Modeled round-trip delay: ~{(v1Delay.totalSeconds * 2 / 3600).toFixed(1)} hours across deep space
              </div>
            </div>

            {/* Source attribution */}
            <div className="font-mono text-[10px] text-[var(--mist-grey)] bg-black/20 rounded-xl p-3 border border-white/5">
              Attribution: {VOYAGER1_EPHEMERIS.source}
            </div>
          </div>
        </div>

        {/* VOYAGER 2 */}
        <div className="glass p-8 sm:p-10 rounded-3xl border border-white/10 relative overflow-hidden bg-[var(--midnight-navy)]/60">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--antique-gold)] animate-pulse" />
              <h2 className="font-display text-2xl font-normal text-[var(--warm-ivory)]">Voyager 2</h2>
            </div>
            <span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-[10px] font-mono font-medium">
              INTERSTELLAR SPACE
            </span>
          </div>

          <p className="font-mono text-xs text-[var(--mist-grey)] mb-8">
            LAUNCHED: AUG 20, 1977 • SPEED: ~{VOYAGER2_EPHEMERIS.speedKmS.toFixed(2)} KM/S • HELIOPAUSE: DEC 2018
          </p>

          <div className="space-y-5">
            {/* Modeled Distance */}
            <div className="bg-black/30 p-5 rounded-2xl border border-white/5">
              <div className="flex justify-between items-center mb-1">
                <span className="font-mono text-[11px] text-[var(--mist-grey)] uppercase">
                  Extrapolated Distance From Sol
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[var(--antique-gold)]/15 text-[var(--antique-gold)]">
                  ESTIMATED
                </span>
              </div>
              <div className="font-display text-3xl sm:text-4xl text-[var(--antique-gold)] tracking-wide">
                {formatDistanceKm(v2Dist)}
              </div>
              <div className="font-mono text-[10px] text-[var(--mist-grey)] mt-1.5">
                ≈ {(v2Dist / 149597870.7).toFixed(2)} Astronomical Units (AU) • Epoch: {VOYAGER2_EPHEMERIS.epochLabel}
              </div>
            </div>

            {/* Light Delay */}
            <div className="bg-black/30 p-5 rounded-2xl border border-white/5">
              <div className="font-mono text-[11px] text-[var(--mist-grey)] uppercase mb-1 flex items-center justify-between">
                <span>One-Way Radio Signal Delay</span>
                <span className="text-[9px] px-2 py-0.5 rounded bg-white/5 text-[var(--mist-grey)]">c ≈ 299,792 km/s</span>
              </div>
              <div className="font-display text-2xl text-[var(--warm-ivory)]">
                {v2Delay.hours} hrs {v2Delay.minutes} mins {v2Delay.seconds} secs
              </div>
              <div className="font-mono text-[10px] text-[var(--mist-grey)] mt-1.5">
                Traversing interstellar space south of the solar ecliptic plane
              </div>
            </div>

            {/* Source attribution */}
            <div className="font-mono text-[10px] text-[var(--mist-grey)] bg-black/20 rounded-xl p-3 border border-white/5">
              Attribution: {VOYAGER2_EPHEMERIS.source}
            </div>
          </div>
        </div>
      </div>

      {/* OSCILLOSCOPE WAVEFORM FEED */}
      <div className="glass p-8 sm:p-10 rounded-3xl border border-white/10 mb-12 bg-[var(--midnight-navy)]/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-[var(--antique-gold)] uppercase tracking-wider">
                // SYNTHETIC RF CARRIER SIMULATION // 8415 MHZ X-BAND
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/5 text-[var(--mist-grey)] border border-white/10">
                SIMULATION
              </span>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-normal text-[var(--warm-ivory)]">
              Radio Frequency Carrier Waveform Visualizer
            </h2>
            <p className="text-xs text-[var(--mist-grey)] mt-1 font-sans font-light">
              Mathematical visualization of microwave phase modulation and simulated cosmic background noise.
            </p>
          </div>

          <button
            onClick={toggleCosmicAudio}
            className={`px-5 py-2.5 rounded-xl font-mono text-xs font-semibold border transition-all flex items-center gap-2 ${
              isAudioListening
                ? 'bg-[var(--antique-gold)] text-[var(--near-black)] border-[var(--antique-gold)] shadow-sm'
                : 'bg-white/5 text-[var(--warm-ivory)] border-white/10 hover:border-white/20'
            }`}
          >
            <span>{isAudioListening ? '🔊' : '🎧'}</span>
            <span>{isAudioListening ? 'AUDIO ACTIVE (73 HZ)' : 'SIMULATE VOID HARMONIC'}</span>
          </button>
        </div>

        <div className="w-full bg-black/50 rounded-2xl overflow-hidden border border-white/10 p-2">
          <canvas ref={waveformCanvasRef} className="w-full h-[140px] block" />
        </div>
      </div>

      {/* DSN ILLUSTRATIVE STATION MODEL */}
      <div className="glass p-8 sm:p-10 rounded-3xl border border-white/10 mb-12 bg-[var(--midnight-navy)]/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-4">
          <div>
            <div className="font-mono text-xs text-[var(--antique-gold)] uppercase tracking-wider mb-1 flex items-center gap-2">
              <span>// DEEP SPACE NETWORK // GLOBAL GROUND COMPLEX</span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/5 text-[var(--mist-grey)] border border-white/10">
                EDUCATIONAL MODEL
              </span>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-normal text-[var(--warm-ivory)]">
              Deep Space Network — Terrestrial Ground Stations
            </h2>
            <p className="text-xs sm:text-sm text-[var(--mist-grey)] mt-1 font-sans font-light max-w-3xl leading-relaxed">
              Educational illustration of the three globally-spaced DSN complexes (Goldstone, Canberra, Madrid) 
              that maintain 24/7 continuous radio line-of-sight coverage as Earth rotates. Station targets, 
              frequencies and bitrates shown below are <strong className="text-[var(--warm-ivory)] font-medium">illustrative examples</strong>.
            </p>
          </div>

          <a
            href="https://eyes.nasa.gov/dsn/dsn.html"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl font-sans text-xs font-semibold bg-[var(--antique-gold)] text-[var(--near-black)] hover:bg-[#d8b57d] transition-all flex items-center gap-2 flex-shrink-0"
          >
            <span>OFFICIAL NASA DSN NOW ↗</span>
          </a>
        </div>

        {/* Notice */}
        <div className="mb-6 font-mono text-[11px] text-[var(--mist-grey)] bg-black/30 border border-white/5 rounded-xl px-4 py-2.5">
          ✦ Note: The station cards below represent typical operational configurations. Live tracking data changes minute-by-minute and is available directly through NASA's DSN Now portal.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Canberra */}
          <div className="bg-black/30 p-6 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-display text-base text-[var(--warm-ivory)]">DSS-43 CANBERRA</span>
              <span className="font-mono text-[9px] text-[var(--mist-grey)] border border-white/10 px-2 py-0.5 rounded">ILLUSTRATIVE</span>
            </div>
            <div className="font-mono text-xs text-[var(--mist-grey)] mb-3">📍 AUSTRALIA (70M DISH)</div>
            <div className="text-xs space-y-1.5 font-mono text-[var(--mist-grey)]">
              <div>EXAMPLE TARGET: <span className="text-[var(--warm-ivory)]">Voyager 2</span></div>
              <div>EXAMPLE LINK: <span className="text-[var(--antique-gold)]">DOWNLINK ~160 BPS</span></div>
              <div>FREQUENCY: ~8420 MHz (X-Band)</div>
            </div>
          </div>

          {/* Goldstone */}
          <div className="bg-black/30 p-6 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-display text-base text-[var(--warm-ivory)]">DSS-14 GOLDSTONE</span>
              <span className="font-mono text-[9px] text-[var(--mist-grey)] border border-white/10 px-2 py-0.5 rounded">ILLUSTRATIVE</span>
            </div>
            <div className="font-mono text-xs text-[var(--mist-grey)] mb-3">📍 CALIFORNIA, USA (70M)</div>
            <div className="text-xs space-y-1.5 font-mono text-[var(--mist-grey)]">
              <div>EXAMPLE TARGET: <span className="text-[var(--warm-ivory)]">Voyager 1</span></div>
              <div>EXAMPLE LINK: <span className="text-[var(--antique-gold)]">CARRIER LOCK</span></div>
              <div>FREQUENCY: ~8415 MHz (X-Band)</div>
            </div>
          </div>

          {/* Madrid */}
          <div className="bg-black/30 p-6 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-display text-base text-[var(--warm-ivory)]">DSS-63 MADRID</span>
              <span className="font-mono text-[9px] text-[var(--mist-grey)] border border-white/10 px-2 py-0.5 rounded">ILLUSTRATIVE</span>
            </div>
            <div className="font-mono text-xs text-[var(--mist-grey)] mb-3">📍 SPAIN (70M DISH)</div>
            <div className="text-xs space-y-1.5 font-mono text-[var(--mist-grey)]">
              <div>EXAMPLE TARGET: <span className="text-[var(--warm-ivory)]">New Horizons</span></div>
              <div>EXAMPLE LINK: <span className="text-[var(--antique-gold)]">SCHEDULED PASS</span></div>
              <div>FREQUENCY: ~8438 MHz (X-Band)</div>
            </div>
          </div>
        </div>
      </div>

      {/* CARL SAGAN PALE BLUE DOT MEMORIAL (ATTRIBUTED EXCERPT & HISTORICAL CONTEXT) */}
      <div className="glass p-10 sm:p-14 rounded-3xl border border-white/10 text-center relative overflow-hidden bg-[var(--midnight-navy)]/50">
        <div className="w-2.5 h-2.5 bg-[#93c5fd] rounded-full mx-auto mb-5 shadow-[0_0_14px_#93c5fd] animate-pulse" />
        <div className="font-mono text-xs text-[var(--antique-gold)] tracking-widest uppercase mb-2 font-medium">
          HISTORICAL REFLECTION // SELECTED EXCERPT
        </div>
        <div className="font-mono text-[11px] text-[var(--mist-grey)]/75 mb-6 uppercase tracking-wider">
          VOYAGER 1 NARROW-ANGLE CAMERA MOSAIC • 6.06 BILLION KILOMETERS FROM EARTH
        </div>

        <h3 className="font-display text-2xl sm:text-4xl text-[var(--warm-ivory)] mb-6 max-w-xl mx-auto font-normal">
          "That's here. That's home. That's us."
        </h3>

        <blockquote className="font-display italic text-base sm:text-lg text-[var(--warm-ivory)] max-w-2xl mx-auto leading-relaxed font-light mb-6">
          "Look again at that dot. That's here. That's home. That's us. On it everyone you love, everyone you know, everyone you ever heard of, every human being who ever was, lived out their lives... on a mote of dust suspended in a sunbeam."
        </blockquote>

        <p className="text-xs sm:text-sm text-[var(--mist-grey)] max-w-xl mx-auto font-sans font-light leading-relaxed mb-6">
          On February 14, 1990, at the urging of planetary astronomer Carl Sagan, NASA commanded Voyager 1 to turn its cameras backward one final time across the interplanetary abyss before permanently shutting down its imaging subsystem to conserve electrical power for interstellar fields-and-particles sensors.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 border-t border-white/10 text-xs font-mono">
          <span className="text-[var(--mist-grey)]">
            — Carl Sagan, <span className="italic">Pale Blue Dot: A Vision of the Human Future in Space</span> (Random House, 1994)
          </span>
          <a
            href="https://www.planetary.org/worlds/pale-blue-dot"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--antique-gold)] hover:underline inline-flex items-center gap-1 font-medium"
          >
            <span>Read Full Reflection at The Planetary Society</span>
            <span>↗</span>
          </a>
        </div>
      </div>
    </div>
  );
};
