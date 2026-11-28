import React, { useRef, useEffect, useState } from 'react';
import {
  playSignalPing,
  playExplosionSound,
  playSuccessChime,
} from '../../utils/audio';

interface LunarLanderProps {
  onBackToHub: () => void;
  onStageClear?: (stage: number) => void;
}

interface StageConfig {
  stage: number;
  name: string;
  location: string;
  padX: number;
  padY: number;
  padWidth: number;
  fuel: number;
  terrain: { x: number; y: number }[];
  startPos: { x: number; y: number; vx: number; vy: number };
}

const STAGES: StageConfig[] = [
  {
    stage: 1,
    name: 'Training Descent',
    location: 'Sea of Tranquility',
    padX: 300,
    padY: 480,
    padWidth: 140,
    fuel: 100,
    startPos: { x: 370, y: 80, vx: 0.2, vy: 0.5 },
    terrain: [
      { x: 0, y: 500 },
      { x: 120, y: 505 },
      { x: 260, y: 495 },
      { x: 300, y: 480 }, // pad start
      { x: 440, y: 480 }, // pad end
      { x: 480, y: 495 },
      { x: 620, y: 510 },
      { x: 740, y: 490 },
      { x: 800, y: 500 },
    ],
  },
  {
    stage: 2,
    name: 'Crater Rim Approach',
    location: 'Fra Mauro Highlands',
    padX: 420,
    padY: 460,
    padWidth: 95,
    fuel: 85,
    startPos: { x: 180, y: 70, vx: 0.8, vy: 0.6 },
    terrain: [
      { x: 0, y: 470 },
      { x: 100, y: 440 }, // hill
      { x: 220, y: 520 }, // crater valley
      { x: 350, y: 490 },
      { x: 420, y: 460 }, // pad start
      { x: 515, y: 460 }, // pad end
      { x: 580, y: 510 },
      { x: 700, y: 430 }, // mountain
      { x: 800, y: 480 },
    ],
  },
  {
    stage: 3,
    name: 'Hadley Gorge Precision',
    location: 'Hadley-Apennine Canyon',
    padX: 360,
    padY: 510,
    padWidth: 65,
    fuel: 70,
    startPos: { x: 500, y: 60, vx: -0.9, vy: 0.8 },
    terrain: [
      { x: 0, y: 350 }, // high cliff
      { x: 140, y: 400 },
      { x: 240, y: 360 }, // peak
      { x: 310, y: 490 }, // steep gorge drop
      { x: 360, y: 510 }, // narrow pad start
      { x: 425, y: 510 }, // narrow pad end
      { x: 490, y: 480 }, // gorge wall
      { x: 600, y: 320 }, // towering mountain
      { x: 720, y: 380 },
      { x: 800, y: 330 },
    ],
  },
];

export const LunarLander: React.FC<LunarLanderProps> = ({ onBackToHub, onStageClear }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [gameState, setGameState] = useState<'briefing' | 'flying' | 'landed' | 'crashed' | 'victory'>('briefing');
  const [fuel, setFuel] = useState(100);
  const [verticalSpeed, setVerticalSpeed] = useState(0);
  const [horizontalSpeed, setHorizontalSpeed] = useState(0);
  const [tiltDegrees, setTiltDegrees] = useState(0);
  const [starsRating, setStarsRating] = useState(3);
  const [crashReason, setCrashReason] = useState('');

  const currentStage = STAGES[currentStageIdx];

  const stateRef = useRef({
    gameState: 'briefing' as 'briefing' | 'flying' | 'landed' | 'crashed' | 'victory',
    x: 370,
    y: 80,
    vx: 0.2,
    vy: 0.5,
    angle: 0, // radians
    fuel: 100,
    keys: { thrust: false, left: false, right: false },
    particles: [] as { x: number; y: number; vx: number; vy: number; life: number; color: string }[],
  });

  const resetLanderForStage = (stageIdx: number) => {
    const cfg = STAGES[stageIdx];
    const s = stateRef.current;
    s.x = cfg.startPos.x;
    s.y = cfg.startPos.y;
    s.vx = cfg.startPos.vx;
    s.vy = cfg.startPos.vy;
    s.angle = 0;
    s.fuel = cfg.fuel;
    s.particles = [];
    s.gameState = 'flying';

    setFuel(cfg.fuel);
    setVerticalSpeed(cfg.startPos.vy);
    setHorizontalSpeed(cfg.startPos.vx);
    setTiltDegrees(0);
    setGameState('flying');
  };

  const handleStartFlight = () => {
    playSignalPing(900);
    resetLanderForStage(currentStageIdx);
  };

  const handleNextStage = () => {
    playSignalPing(800);
    if (currentStageIdx + 1 < STAGES.length) {
      setCurrentStageIdx((prev) => prev + 1);
      resetLanderForStage(currentStageIdx + 1);
    } else {
      setGameState('victory');
      playSuccessChime();
    }
  };

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keys = stateRef.current.keys;
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'Spacebar'].includes(e.key) || e.code === 'Space') {
        e.preventDefault();
      }
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ' || e.code === 'Space') {
        keys.thrust = true;
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keys.left = true;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keys.right = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const keys = stateRef.current.keys;
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'Spacebar'].includes(e.key) || e.code === 'Space') {
        e.preventDefault();
      }
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ' || e.code === 'Space') {
        keys.thrust = false;
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keys.left = false;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keys.right = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // 60FPS Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const loop = () => {
      const s = stateRef.current;
      const width = canvas.width;
      const height = canvas.height;
      const cfg = STAGES[currentStageIdx];

      // 1. CLEAR & BACKGROUND
      ctx.fillStyle = '#05080f';
      ctx.fillRect(0, 0, width, height);

      // Starfield
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      for (let i = 0; i < 45; i++) {
        const starX = (Math.sin(i * 32.1 + 5) * 0.5 + 0.5) * width;
        const starY = (Math.cos(i * 18.7 + 9) * 0.5 + 0.5) * (height * 0.65);
        ctx.fillRect(starX, starY, 1.5, 1.5);
      }

      // Earth in lunar sky
      ctx.save();
      ctx.beginPath();
      ctx.arc(width - 90, 80, 22, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(width - 95, 76, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 2. DRAW TERRAIN
      ctx.save();
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cfg.terrain[0].x, cfg.terrain[0].y);
      for (let i = 1; i < cfg.terrain.length; i++) {
        ctx.lineTo(cfg.terrain[i].x, cfg.terrain[i].y);
      }
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Landing Pad Glow & Markings
      ctx.fillStyle = '#C6A36B';
      ctx.fillRect(cfg.padX, cfg.padY - 2, cfg.padWidth, 6);

      // Pad Guidance Beacons (Blinking)
      const blink = Math.sin(Date.now() * 0.008) > 0;
      ctx.fillStyle = blink ? '#10b981' : '#059669';
      ctx.beginPath();
      ctx.arc(cfg.padX, cfg.padY - 4, 4, 0, Math.PI * 2);
      ctx.arc(cfg.padX + cfg.padWidth, cfg.padY - 4, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = 'bold 9px JetBrains Mono, monospace';
      ctx.fillStyle = '#080D16';
      ctx.textAlign = 'center';
      ctx.fillText('TARGET PAD', cfg.padX + cfg.padWidth / 2, cfg.padY + 2);
      ctx.restore();

      // 3. PHYSICS UPDATE
      if (s.gameState === 'flying') {
        const gravity = 0.038;
        s.vy += gravity;

        // Rotation
        if (s.keys.left && s.fuel > 0) {
          s.angle -= 0.038;
          s.fuel -= 0.08;
        }
        if (s.keys.right && s.fuel > 0) {
          s.angle += 0.038;
          s.fuel -= 0.08;
        }

        // Main Thruster
        if (s.keys.thrust && s.fuel > 0) {
          const thrust = 0.088;
          s.vx += Math.sin(s.angle) * thrust;
          s.vy -= Math.cos(s.angle) * thrust;
          s.fuel -= 0.35;

          // Exhaust particles
          for (let p = 0; p < 3; p++) {
            const spread = (Math.random() - 0.5) * 0.3;
            s.particles.push({
              x: s.x - Math.sin(s.angle) * 16,
              y: s.y + Math.cos(s.angle) * 16,
              vx: -Math.sin(s.angle + spread) * (2 + Math.random() * 3),
              vy: Math.cos(s.angle + spread) * (2 + Math.random() * 3),
              life: 0,
              color: Math.random() > 0.5 ? '#f59e0b' : '#ef4444',
            });
          }
        }

        s.x += s.vx;
        s.y += s.vy;

        // Screen boundaries
        if (s.x < 15) { s.x = 15; s.vx *= -0.5; }
        if (s.x > width - 15) { s.x = width - 15; s.vx *= -0.5; }

        setFuel(Math.max(0, Math.round(s.fuel)));
        setVerticalSpeed(Number(s.vy.toFixed(1)));
        setHorizontalSpeed(Number(s.vx.toFixed(1)));
        setTiltDegrees(Math.round((s.angle * 180) / Math.PI));

        // Touchdown / Collision check against pad & terrain
        // Check landing pad contact:
        const footY = s.y + 16;
        const footX = s.x;

        if (footY >= cfg.padY) {
          const insidePad = footX >= cfg.padX && footX <= cfg.padX + cfg.padWidth;
          const safeVert = s.vy <= 2.2;
          const safeHoriz = Math.abs(s.vx) <= 1.4;
          const safeAngle = Math.abs(s.angle) <= 0.22; // ~12 degrees

          if (insidePad && safeVert && safeHoriz && safeAngle) {
            // SUCCESSFUL LANDING!
            s.gameState = 'landed';
            setGameState('landed');
            playSuccessChime();

            // Calculate star rating based on fuel and vertical velocity
            let stars = 1;
            if (s.fuel > cfg.fuel * 0.4 && s.vy < 1.4) stars = 3;
            else if (s.fuel > cfg.fuel * 0.2) stars = 2;
            setStarsRating(stars);

            if (onStageClear) onStageClear(currentStageIdx + 1);
          } else {
            // CRASH ON PAD!
            s.gameState = 'crashed';
            setGameState('crashed');
            playExplosionSound();

            let reason = 'Hard impact: Descent speed exceeded structural limits (> 2.2 m/s).';
            if (!insidePad) reason = 'Missed target pad: Landed outside designated safety markers.';
            else if (!safeAngle) reason = 'Excessive tilt angle: Lander tipped over on footpads.';
            else if (!safeHoriz) reason = 'High lateral drift speed: Shear stress sheared landing legs.';
            setCrashReason(reason);
          }
        } else {
          // Check collision with rough terrain
          for (let i = 0; i < cfg.terrain.length - 1; i++) {
            const p1 = cfg.terrain[i];
            const p2 = cfg.terrain[i + 1];
            if (s.x >= p1.x && s.x <= p2.x) {
              const slope = (p2.y - p1.y) / (p2.x - p1.x);
              const terrainY = p1.y + slope * (s.x - p1.x);
              if (s.y + 14 >= terrainY) {
                s.gameState = 'crashed';
                setGameState('crashed');
                playExplosionSound();
                setCrashReason('Impacted rocky lunar terrain outside designated landing zone.');
                break;
              }
            }
          }
        }
      }

      // 4. DRAW EXHAUST PARTICLES
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const pt = s.particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life++;
        ctx.fillStyle = pt.color;
        ctx.fillRect(pt.x, pt.y, 2, 2);
        if (pt.life > 16) s.particles.splice(i, 1);
      }

      // 5. DRAW LANDER
      if (s.gameState !== 'crashed') {
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.angle);

        // Landing Gear Struts & Footpads
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        // Left leg
        ctx.moveTo(-10, 8);
        ctx.lineTo(-18, 16);
        ctx.lineTo(-22, 16);
        // Right leg
        ctx.moveTo(10, 8);
        ctx.lineTo(18, 16);
        ctx.lineTo(22, 16);
        ctx.stroke();

        // Gold Foil Descent Base
        ctx.fillStyle = '#C6A36B';
        ctx.strokeStyle = '#d8b57d';
        ctx.lineWidth = 1.5;
        ctx.fillRect(-12, -4, 24, 12);
        ctx.strokeRect(-12, -4, 24, 12);

        // Silver Ascent Cabin
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.arc(0, -10, 10, 0, Math.PI * 2);
        ctx.fill();

        // Cockpit window
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(-4, -13, 8, 4);

        ctx.restore();
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [currentStageIdx]);

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 py-2 h-[calc(100vh-68px)] max-h-[860px] flex flex-col justify-between overflow-hidden select-none">
      {/* Integrated Compact Top Telemetry HUD */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-2xl bg-[#111A35]/90 border border-[#C8D8EA]/20 backdrop-blur-md shadow-lg shrink-0 mb-1">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBackToHub}
            className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#FFC66D] hover:text-[#F5F0E8] transition-colors uppercase tracking-wider cursor-pointer px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 hover:border-[#FFC66D]/40"
          >
            <span>←</span>
            <span>PLAY HUB</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-[#C8D8EA]/70 hidden sm:inline">STAGE {currentStageIdx + 1}/3:</span>
            <span className="font-mono text-xs text-[#F5F0E8] font-bold">
              {currentStage.location.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Live Flight Telemetry Strip */}
        <div className="flex items-center gap-3 sm:gap-5 font-mono text-xs">
          {/* Fuel */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#C8D8EA] uppercase hidden sm:inline">FUEL</span>
            <div className="w-[72px] sm:w-[88px] h-2 bg-black/60 rounded-full overflow-hidden border border-white/15">
              <div
                className={`h-full transition-all duration-150 ${
                  fuel > 40 ? 'bg-[#64E5C0]' : fuel > 20 ? 'bg-[#FFC66D]' : 'bg-[#FF8D7B]'
                }`}
                style={{ width: `${Math.max(0, fuel)}%` }}
              />
            </div>
            <span className={`font-bold ${fuel > 40 ? 'text-[#64E5C0]' : fuel > 20 ? 'text-[#FFC66D]' : 'text-[#FF8D7B]'}`}>
              {fuel}%
            </span>
          </div>

          {/* Vertical Speed */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-[#C8D8EA] uppercase hidden sm:inline">V-SPD</span>
            <span className={`font-display text-base leading-none font-bold ${
              verticalSpeed <= 2.2 ? 'text-[#64E5C0]' : 'text-[#FF8D7B] animate-pulse'
            }`}>
              {verticalSpeed} <span className="text-[10px] font-mono text-[#C8D8EA]/70">m/s</span>
            </span>
          </div>

          {/* Horizontal Drift */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-[#C8D8EA] uppercase hidden sm:inline">DRIFT</span>
            <span className={`font-display text-base leading-none font-bold ${
              Math.abs(horizontalSpeed) <= 1.4 ? 'text-[#64E5C0]' : 'text-[#FFC66D]'
            }`}>
              {horizontalSpeed} <span className="text-[10px] font-mono text-[#C8D8EA]/70">m/s</span>
            </span>
          </div>

          {/* Tilt */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-[#C8D8EA] uppercase hidden sm:inline">TILT</span>
            <span className={`font-display text-base leading-none font-bold ${
              Math.abs(tiltDegrees) <= 12 ? 'text-[#F5F0E8]' : 'text-[#FF8D7B] animate-pulse'
            }`}>
              {tiltDegrees}°
            </span>
          </div>

          {gameState === 'flying' && (
            <button
              onClick={() => resetLanderForStage(currentStageIdx)}
              className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-[10px] font-mono text-[#C8D8EA] uppercase tracking-wider cursor-pointer"
              title="Reset descent stage"
            >
              RESET
            </button>
          )}
        </div>
      </div>

      {/* Main Lander Canvas Container (Fits Viewport Height Exactly) */}
      <div className="flex-1 min-h-0 relative flex items-center justify-center p-1">
        <div className="relative h-full w-auto aspect-[4/3] max-h-full max-w-full rounded-2xl overflow-hidden border border-[#C8D8EA]/25 bg-black shadow-[0_0_35px_rgba(8,11,29,0.9)] flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="w-full h-full block"
          />

        {/* Stage Briefing Overlay */}
        {gameState === 'briefing' && (
          <div className="absolute inset-0 bg-[#080D16]/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#C6A36B]/20 border border-[#C6A36B] flex items-center justify-center text-3xl shadow-xl">
              🌕
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#C6A36B] font-semibold block mb-1">
                STAGE {currentStage.stage} OF 3 // {currentStage.location.toUpperCase()}
              </span>
              <h2 className="font-display text-3xl sm:text-4xl text-[#F0E8D9] font-normal mb-2">
                {currentStage.name}
              </h2>
              <p className="text-xs sm:text-sm text-[#B6C0CC] max-w-md font-light leading-relaxed">
                Pilot the Lunar Module to a safe touchdown on the marked landing platform. Control vertical velocity with main thrusters and counter drift with RCS rotation.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-xs font-mono text-[#B6C0CC] space-y-1.5 max-w-sm text-left">
              <div>🎯 <strong>Touchdown Window:</strong> Vertical &le; 2.2 m/s, Tilt &le; &plusmn;12°</div>
              <div>⌨️ <strong>Controls:</strong> W / Up / Space to Thrust; A / D / Left / Right to Tilt</div>
            </div>

            <button
              onClick={handleStartFlight}
              className="px-8 py-3.5 rounded-xl bg-[#C6A36B] hover:bg-[#d8b57d] text-[#080D16] font-sans text-xs font-bold tracking-widest uppercase transition-all shadow-xl cursor-pointer"
            >
              COMMENCE DESCENT ➔
            </button>
          </div>
        )}

        {/* Successful Touchdown Overlay */}
        {gameState === 'landed' && (
          <div className="absolute inset-0 bg-emerald-950/85 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center space-y-6 animate-fadeIn">
            <div className="text-4xl">🦅</div>
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-300 font-semibold block mb-1">
                CONTACT LIGHT // TOUCHDOWN CONFIRMED
              </span>
              <h2 className="font-display text-3xl sm:text-4xl text-[#F0E8D9]">
                Safe Landing Achieved!
              </h2>
              <div className="flex items-center justify-center gap-1.5 my-3 text-2xl">
                {Array.from({ length: 3 }).map((_, i) => (
                  <span key={i} className={i < starsRating ? 'text-[#C6A36B]' : 'text-white/20'}>
                    ★
                  </span>
                ))}
              </div>
              <p className="text-xs font-mono text-[#B6C0CC]">
                Remaining Fuel: {fuel}% • Vertical Speed: {verticalSpeed} m/s
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleNextStage}
                className="px-6 py-3 rounded-xl bg-[#C6A36B] hover:bg-[#d8b57d] text-[#080D16] font-sans text-xs font-bold tracking-widest uppercase transition-all shadow-lg cursor-pointer"
              >
                {currentStageIdx + 1 < STAGES.length ? 'NEXT STAGE ➔' : 'MISSION COMPLETE ➔'}
              </button>
              <button
                onClick={() => resetLanderForStage(currentStageIdx)}
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-[#F0E8D9] border border-white/20 text-xs font-mono uppercase tracking-wider cursor-pointer"
              >
                REPLAY STAGE
              </button>
            </div>
          </div>
        )}

        {/* Crash Overlay */}
        {gameState === 'crashed' && (
          <div className="absolute inset-0 bg-red-950/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center space-y-6 animate-fadeIn">
            <div className="text-4xl">💥</div>
            <div>
              <span className="text-xs font-mono text-red-300 uppercase tracking-widest block mb-1">
                DESCENT ABORTED // CRASH RECORDED
              </span>
              <h2 className="font-display text-3xl sm:text-4xl text-[#F0E8D9]">
                Lander Destroyed
              </h2>
              <p className="text-xs font-mono text-red-200 mt-2 max-w-sm mx-auto">
                {crashReason}
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => resetLanderForStage(currentStageIdx)}
                className="px-6 py-3 rounded-xl bg-[#C6A36B] hover:bg-[#d8b57d] text-[#080D16] font-sans text-xs font-bold tracking-widest uppercase transition-all shadow-lg cursor-pointer"
              >
                RETRY DESCENT ➔
              </button>
              <button
                onClick={onBackToHub}
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-[#F0E8D9] border border-white/20 text-xs font-mono uppercase tracking-wider cursor-pointer"
              >
                RETURN TO HUB
              </button>
            </div>
          </div>
        )}

        {/* Victory Campaign Screen */}
        {gameState === 'victory' && (
          <div className="absolute inset-0 bg-[#080D16]/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center space-y-6 animate-fadeIn">
            <div className="w-20 h-20 rounded-full bg-[#C6A36B]/20 border border-[#C6A36B] flex items-center justify-center text-4xl mx-auto shadow-xl">
              🏆
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#C6A36B] font-semibold block mb-1">
                ALL THREE LUNAR DESCENT STAGES MASTERED
              </span>
              <h2 className="font-display text-3xl sm:text-4xl text-[#F0E8D9]">
                Master Pilot of the Moon
              </h2>
              <p className="text-sm text-[#B6C0CC] max-w-md mx-auto font-light leading-relaxed mt-2">
                You safely guided the Lunar Module through Tranquility flatlands, Fra Mauro crater rims, and the narrow gorge of Hadley Rille. The footsteps of Apollo live on in your flight precision!
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setCurrentStageIdx(0);
                  resetLanderForStage(0);
                }}
                className="px-6 py-3 rounded-xl bg-[#C6A36B] hover:bg-[#d8b57d] text-[#080D16] font-sans text-xs font-bold tracking-widest uppercase transition-all shadow-lg cursor-pointer"
              >
                PLAY CAMPAIGN AGAIN ➔
              </button>
              <button
                onClick={onBackToHub}
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-[#F0E8D9] border border-white/20 text-xs font-mono uppercase tracking-wider cursor-pointer"
              >
                RETURN TO ARCADE HUB
              </button>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* On-Screen Touch Controls for Mobile */}
      <div className="mt-1 flex sm:hidden items-center justify-between gap-2 shrink-0">
        <div className="flex gap-2">
          <button
            onPointerDown={() => { stateRef.current.keys.left = true; }}
            onPointerUp={() => { stateRef.current.keys.left = false; }}
            className="w-12 h-10 rounded-xl bg-[#111A35] border border-white/20 active:bg-[#58D9FF] active:text-[#080B1D] text-lg font-bold flex items-center justify-center"
          >
            ↶
          </button>
          <button
            onPointerDown={() => { stateRef.current.keys.right = true; }}
            onPointerUp={() => { stateRef.current.keys.right = false; }}
            className="w-12 h-10 rounded-xl bg-[#111A35] border border-white/20 active:bg-[#58D9FF] active:text-[#080B1D] text-lg font-bold flex items-center justify-center"
          >
            ↷
          </button>
        </div>

        <button
          onPointerDown={() => { stateRef.current.keys.thrust = true; }}
          onPointerUp={() => { stateRef.current.keys.thrust = false; }}
          className="flex-1 h-10 rounded-xl bg-gradient-to-r from-[#FFC66D] to-[#FF8D7B] text-[#080B1D] font-sans font-bold text-xs uppercase tracking-wider flex items-center justify-center shadow-lg active:scale-95"
        >
          FIRE THRUSTER 🚀
        </button>
      </div>
    </div>
  );
};
