import React, { useRef, useEffect, useState } from 'react';
import {
  playLaserSound,
  playExplosionSound,
  playSignalPing,
  playErrorBuzz,
  playSuccessChime,
} from '../../utils/audio';

interface AsteroidDefenderProps {
  onBackToHub: () => void;
  onUpdateScore?: (score: number) => void;
}


interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface Asteroid {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rotation: number;
  vRot: number;
  hp: number;
  maxHp: number;
  points: number;
  pointsArray: { x: number; y: number }[];
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

interface PowerUp {
  x: number;
  y: number;
  vy: number;
  type: 'shield' | 'triple';
  radius: number;
}

export const AsteroidDefender: React.FC<AsteroidDefenderProps> = ({ onBackToHub, onUpdateScore }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // React UI state
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [shield, setShield] = useState(100);
  const [combo, setCombo] = useState(0);
  const [activePowerUp, setActivePowerUp] = useState<string>('Standard Lasers');

  // Game internal mutable refs for 60fps loop
  const stateRef = useRef({
    gameState: 'menu' as 'menu' | 'playing' | 'paused' | 'gameover',
    score: 0,
    wave: 1,
    combo: 0,
    comboTimer: 0,
    ship: {
      x: 300,
      y: 500,
      width: 36,
      height: 44,
      vx: 0,
      speed: 6.5,
      shield: 100,
      maxShield: 100,
      powerUp: 'none' as 'none' | 'triple' | 'rapid',
      powerUpTimer: 0,
    },
    projectiles: [] as Projectile[],
    asteroids: [] as Asteroid[],
    particles: [] as Particle[],
    powerUps: [] as PowerUp[],
    keys: { left: false, right: false, fire: false },
    lastShotTime: 0,
    spawnTimer: 0,
    waveAsteroidsSpawned: 0,
    waveTargetAsteroids: 15,
  });

  const createAsteroid = (x: number, y: number, radius: number): Asteroid => {
    const numPoints = Math.floor(8 + Math.random() * 5);
    const pointsArray: { x: number; y: number }[] = [];
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      const variation = 0.75 + Math.random() * 0.5;
      pointsArray.push({
        x: Math.cos(angle) * radius * variation,
        y: Math.sin(angle) * radius * variation,
      });
    }

    const currentWave = stateRef.current.wave;
    const baseSpeed = 1.2 + currentWave * 0.25;
    const hp = radius > 30 ? 3 : radius > 18 ? 2 : 1;
    const points = radius > 30 ? 50 : radius > 18 ? 100 : 150;

    return {
      x,
      y,
      vx: (Math.random() - 0.5) * 1.5,
      vy: baseSpeed * (0.7 + Math.random() * 0.6),
      radius,
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.04,
      hp,
      maxHp: hp,
      points,
      pointsArray,
    };
  };

  const createExplosion = (x: number, y: number, color: string, count = 12) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 4;
      stateRef.current.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 20 + Math.random() * 15,
        color,
      });
    }
  };

  const spawnWaveAsteroid = (width: number) => {
    const radius = 16 + Math.random() * 26; // 16 to 42
    const x = radius + Math.random() * (width - radius * 2);
    const y = -radius - 10;
    stateRef.current.asteroids.push(createAsteroid(x, y, radius));
    stateRef.current.waveAsteroidsSpawned++;
  };

  const shootLasers = () => {
    const s = stateRef.current;
    const now = Date.now();
    const cooldown = s.ship.powerUp === 'triple' ? 140 : 180;
    if (now - s.lastShotTime < cooldown) return;
    s.lastShotTime = now;
    playLaserSound();

    if (s.ship.powerUp === 'triple') {
      s.projectiles.push(
        { x: s.ship.x, y: s.ship.y - 20, vx: 0, vy: -12, radius: 3.5 },
        { x: s.ship.x - 12, y: s.ship.y - 12, vx: -2.5, vy: -11, radius: 3 },
        { x: s.ship.x + 12, y: s.ship.y - 12, vx: 2.5, vy: -11, radius: 3 }
      );
    } else {
      s.projectiles.push(
        { x: s.ship.x - 7, y: s.ship.y - 18, vx: 0, vy: -12, radius: 3 },
        { x: s.ship.x + 7, y: s.ship.y - 18, vx: 0, vy: -12, radius: 3 }
      );
    }
  };

  // Start game handler
  const handleStartGame = () => {
    playSignalPing(900);
    const s = stateRef.current;
    s.gameState = 'playing';
    s.score = 0;
    s.wave = 1;
    s.combo = 0;
    s.ship.shield = 100;
    s.ship.powerUp = 'none';
    s.ship.powerUpTimer = 0;
    s.projectiles = [];
    s.asteroids = [];
    s.particles = [];
    s.powerUps = [];
    s.waveAsteroidsSpawned = 0;
    s.waveTargetAsteroids = 15;

    setScore(0);
    setWave(1);
    setShield(100);
    setCombo(0);
    setActivePowerUp('Standard Lasers');
    setGameState('playing');
  };

  const handlePauseToggle = () => {
    if (stateRef.current.gameState === 'playing') {
      stateRef.current.gameState = 'paused';
      setGameState('paused');
    } else if (stateRef.current.gameState === 'paused') {
      stateRef.current.gameState = 'playing';
      setGameState('playing');
    }
  };

  // Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const updateAndDraw = () => {
      const s = stateRef.current;
      const width = canvas.width;
      const height = canvas.height;

      // 1. Clear Screen
      ctx.fillStyle = '#080D16';
      ctx.fillRect(0, 0, width, height);

      // Starfield background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let i = 0; i < 40; i++) {
        const starX = (Math.sin(i * 123.4 + Date.now() * 0.0001) * 0.5 + 0.5) * width;
        const starY = (Math.cos(i * 456.7 + Date.now() * 0.0002) * 0.5 + 0.5) * height;
        ctx.fillRect(starX, starY, (i % 3) + 1, (i % 3) + 1);
      }

      if (s.gameState === 'playing') {
        // --- SHIP UPDATE ---
        if (s.keys.left) s.ship.x -= s.ship.speed;
        if (s.keys.right) s.ship.x += s.ship.speed;
        if (s.keys.fire) shootLasers();

        // Screen wrap / clamp
        if (s.ship.x < 25) s.ship.x = 25;
        if (s.ship.x > width - 25) s.ship.x = width - 25;
        s.ship.y = height - 60;

        // Power-up timer countdown
        if (s.ship.powerUp !== 'none') {
          s.ship.powerUpTimer--;
          if (s.ship.powerUpTimer <= 0) {
            s.ship.powerUp = 'none';
            setActivePowerUp('Standard Lasers');
          }
        }

        // Combo decay timer
        if (s.combo > 0) {
          s.comboTimer--;
          if (s.comboTimer <= 0) {
            s.combo = 0;
            setCombo(0);
          }
        }

        // --- WAVE SPAWN LOGIC ---
        s.spawnTimer++;
        const spawnInterval = Math.max(25, 70 - s.wave * 6);
        if (s.spawnTimer > spawnInterval && s.waveAsteroidsSpawned < s.waveTargetAsteroids) {
          spawnWaveAsteroid(width);
          s.spawnTimer = 0;
        }

        // Advance wave if all asteroids cleared
        if (s.waveAsteroidsSpawned >= s.waveTargetAsteroids && s.asteroids.length === 0) {
          s.wave++;
          s.waveAsteroidsSpawned = 0;
          s.waveTargetAsteroids = 15 + s.wave * 4;
          s.ship.shield = Math.min(s.ship.maxShield, s.ship.shield + 20); // Wave recovery
          setShield(s.ship.shield);
          setWave(s.wave);
          playSuccessChime();
        }

        // --- PROJECTILES UPDATE ---
        for (let i = s.projectiles.length - 1; i >= 0; i--) {
          const p = s.projectiles[i];
          p.x += p.vx;
          p.y += p.vy;
          if (p.y < -10 || p.x < 0 || p.x > width) {
            s.projectiles.splice(i, 1);
          }
        }

        // --- POWER-UPS UPDATE ---
        for (let i = s.powerUps.length - 1; i >= 0; i--) {
          const pu = s.powerUps[i];
          pu.y += pu.vy;

          // Pickup collision with ship
          const dist = Math.hypot(pu.x - s.ship.x, pu.y - s.ship.y);
          if (dist < pu.radius + s.ship.width / 2) {
            playSignalPing(1200);
            if (pu.type === 'shield') {
              s.ship.shield = Math.min(s.ship.maxShield, s.ship.shield + 35);
              setShield(s.ship.shield);
              createExplosion(pu.x, pu.y, '#38bdf8', 15);
            } else if (pu.type === 'triple') {
              s.ship.powerUp = 'triple';
              s.ship.powerUpTimer = 400; // ~6.6 seconds
              setActivePowerUp('Triple Plasma Burst');
              createExplosion(pu.x, pu.y, '#C6A36B', 15);
            }
            s.powerUps.splice(i, 1);
            continue;
          }

          if (pu.y > height + 20) {
            s.powerUps.splice(i, 1);
          }
        }

        // --- ASTEROIDS UPDATE & COLLISIONS ---
        for (let i = s.asteroids.length - 1; i >= 0; i--) {
          const a = s.asteroids[i];
          a.x += a.vx;
          a.y += a.vy;
          a.rotation += a.vRot;

          // Check projectile collisions
          for (let j = s.projectiles.length - 1; j >= 0; j--) {
            const p = s.projectiles[j];
            const dist = Math.hypot(a.x - p.x, a.y - p.y);
            if (dist < a.radius + p.radius) {
              s.projectiles.splice(j, 1);
              a.hp--;
              createExplosion(p.x, p.y, '#e0be88', 6);

              if (a.hp <= 0) {
                playExplosionSound();
                createExplosion(a.x, a.y, '#C6A36B', 18);

                // Score & combo
                s.combo++;
                s.comboTimer = 120; // 2 seconds to keep combo
                const addedScore = a.points * (1 + Math.min(s.combo, 10) * 0.2);
                s.score += Math.round(addedScore);
                setScore(s.score);
                setCombo(s.combo);

                // Drop power-up randomly (12% chance)
                if (Math.random() < 0.14) {
                  s.powerUps.push({
                    x: a.x,
                    y: a.y,
                    vy: 2.2,
                    type: Math.random() > 0.5 ? 'shield' : 'triple',
                    radius: 12,
                  });
                }

                // Split larger asteroids
                if (a.radius > 26) {
                  s.asteroids.push(createAsteroid(a.x - 10, a.y, a.radius * 0.55));
                  s.asteroids.push(createAsteroid(a.x + 10, a.y, a.radius * 0.55));
                }

                s.asteroids.splice(i, 1);
                break;
              }
            }
          }

          // Check ship collision
          if (s.asteroids[i]) {
            const distShip = Math.hypot(a.x - s.ship.x, a.y - s.ship.y);
            if (distShip < a.radius + 18) {
              playErrorBuzz();
              createExplosion(s.ship.x, s.ship.y, '#ef4444', 24);
              s.ship.shield -= Math.round(a.radius * 1.2);
              setShield(Math.max(0, s.ship.shield));
              s.asteroids.splice(i, 1);

              if (s.ship.shield <= 0) {
                s.gameState = 'gameover';
                setGameState('gameover');
                if (onUpdateScore) onUpdateScore(s.score);
                break;
              }
            } else if (a.y > height + a.radius) {
              s.asteroids.splice(i, 1);
            }
          }
        }

        // --- PARTICLES UPDATE ---
        for (let i = s.particles.length - 1; i >= 0; i--) {
          const pt = s.particles[i];
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.life++;
          if (pt.life >= pt.maxLife) {
            s.particles.splice(i, 1);
          }
        }
      }

      // 2. RENDER EVERYTHING
      // Draw Particles
      for (const pt of s.particles) {
        const alpha = 1 - pt.life / pt.maxLife;
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = alpha;
        ctx.fillRect(pt.x, pt.y, 2.5, 2.5);
      }
      ctx.globalAlpha = 1.0;

      // Draw PowerUps
      for (const pu of s.powerUps) {
        ctx.save();
        ctx.translate(pu.x, pu.y);
        ctx.strokeStyle = pu.type === 'shield' ? '#38bdf8' : '#C6A36B';
        ctx.fillStyle = pu.type === 'shield' ? 'rgba(56, 189, 248, 0.25)' : 'rgba(198, 163, 107, 0.25)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, pu.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pu.type === 'shield' ? '🛡️' : '⚡', 0, 0);
        ctx.restore();
      }

      // Draw Asteroids
      for (const a of s.asteroids) {
        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.rotate(a.rotation);

        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;

        ctx.beginPath();
        if (a.pointsArray.length > 0) {
          ctx.moveTo(a.pointsArray[0].x, a.pointsArray[0].y);
          for (let p = 1; p < a.pointsArray.length; p++) {
            ctx.lineTo(a.pointsArray[p].x, a.pointsArray[p].y);
          }
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Health indicator if damaged
        if (a.hp < a.maxHp) {
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        ctx.restore();
      }

      // Draw Projectiles
      for (const p of s.projectiles) {
        ctx.fillStyle = s.ship.powerUp === 'triple' ? '#38bdf8' : '#C6A36B';
        ctx.shadowColor = s.ship.powerUp === 'triple' ? '#38bdf8' : '#C6A36B';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw Spaceship
      if (s.gameState === 'playing' || s.gameState === 'paused') {
        ctx.save();
        ctx.translate(s.ship.x, s.ship.y);

        // Shield aura
        if (s.ship.shield > 0) {
          const shieldAlpha = 0.2 + (s.ship.shield / 100) * 0.25;
          ctx.strokeStyle = s.ship.shield > 40 ? 'rgba(56, 189, 248, ' + shieldAlpha + ')' : 'rgba(239, 68, 68, ' + shieldAlpha + ')';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, 26, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Thruster plume animation
        ctx.fillStyle = Math.random() > 0.5 ? '#f59e0b' : '#ef4444';
        ctx.beginPath();
        ctx.moveTo(-6, 18);
        ctx.lineTo(0, 26 + Math.random() * 8);
        ctx.lineTo(6, 18);
        ctx.closePath();
        ctx.fill();

        // Hull
        ctx.fillStyle = '#F0E8D9';
        ctx.strokeStyle = '#C6A36B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -20); // nose
        ctx.lineTo(16, 16);  // right wing
        ctx.lineTo(6, 12);   // right inner
        ctx.lineTo(-6, 12);  // left inner
        ctx.lineTo(-16, 16); // left wing
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Cockpit window
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(0, -4, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      animId = requestAnimationFrame(updateAndDraw);
    };

    animId = requestAnimationFrame(updateAndDraw);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keys = stateRef.current.keys;
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'Spacebar'].includes(e.key) || e.code === 'Space') {
        e.preventDefault();
      }
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keys.left = true;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keys.right = true;
      } else if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.code === 'Space') {
        keys.fire = true;
      } else if (e.key === 'p' || e.key === 'P') {
        handlePauseToggle();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const keys = stateRef.current.keys;
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'Spacebar'].includes(e.key) || e.code === 'Space') {
        e.preventDefault();
      }
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keys.left = false;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keys.right = false;
      } else if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.code === 'Space') {
        keys.fire = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Touch & Pointer Drag for Mobile
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (stateRef.current.gameState !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const clientX = (e.clientX - rect.left) * scaleX;
    stateRef.current.ship.x = clientX;
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 py-2 h-[calc(100vh-68px)] max-h-[860px] flex flex-col justify-between overflow-hidden select-none">
      {/* Integrated Compact Top HUD Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-2xl bg-[#111A35]/90 border border-[#58D9FF]/20 backdrop-blur-md shadow-lg shrink-0 mb-1">
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToHub}
            className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#FFC66D] hover:text-[#F5F0E8] transition-colors uppercase tracking-wider cursor-pointer px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 hover:border-[#FFC66D]/40"
          >
            <span>←</span>
            <span>PLAY HUB</span>
          </button>

          {gameState === 'playing' && (
            <button
              onClick={handlePauseToggle}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-[11px] font-mono text-[#F5F0E8] uppercase tracking-wider cursor-pointer"
            >
              PAUSE (P)
            </button>
          )}
        </div>

        {/* Live Vitals HUD Strip */}
        <div className="flex items-center gap-3 sm:gap-5 font-mono text-xs">
          {/* Shield */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#C8D8EA] uppercase hidden sm:inline">SHIELD</span>
            <div className="w-20 sm:w-24 h-2 bg-black/60 rounded-full overflow-hidden border border-white/15">
              <div
                className={`h-full transition-all duration-200 ${
                  shield > 50 ? 'bg-[#64E5C0]' : shield > 25 ? 'bg-[#FFC66D]' : 'bg-[#FF8D7B]'
                }`}
                style={{ width: `${Math.max(0, shield)}%` }}
              />
            </div>
            <span className={`font-bold ${shield > 50 ? 'text-[#64E5C0]' : shield > 25 ? 'text-[#FFC66D]' : 'text-[#FF8D7B]'}`}>
              {shield}%
            </span>
          </div>

          {/* Wave */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-[#C8D8EA] uppercase hidden sm:inline">WAVE</span>
            <span className="px-2 py-0.5 rounded-full bg-[#58D9FF]/15 text-[#58D9FF] font-bold text-[11px] border border-[#58D9FF]/30">
              {wave}
            </span>
          </div>

          {/* Weapon / Combo */}
          <div className="hidden md:flex items-center gap-1.5 text-[11px] text-[#58D9FF]">
            <span>{activePowerUp}</span>
            {combo > 1 && (
              <span className="px-1.5 py-0.5 rounded bg-[#FFC66D]/20 text-[#FFC66D] font-bold text-[10px] animate-pulse">
                {combo}x
              </span>
            )}
          </div>

          {/* Score */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-[#C8D8EA] uppercase hidden sm:inline">SCORE</span>
            <span className="font-display text-lg text-[#FFC66D] font-medium leading-none">
              {score.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Main Game Screen Canvas Container (Fits Viewport Height Exactly) */}
      <div className="flex-1 min-h-0 relative flex items-center justify-center p-1">
        <div className="relative h-full w-auto aspect-[4/3] max-h-full max-w-full rounded-2xl overflow-hidden border border-[#58D9FF]/25 bg-black shadow-[0_0_35px_rgba(8,11,29,0.9)] flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            onPointerMove={handlePointerMove}
            className="w-full h-full block cursor-crosshair touch-none"
          />

        {/* Menu / Start Overlay */}
        {gameState === 'menu' && (
          <div className="absolute inset-0 bg-[#080D16]/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#C6A36B]/20 border border-[#C6A36B] flex items-center justify-center text-3xl shadow-xl">
              🛸
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#C6A36B] font-semibold block mb-1">
                ARCADE DEFENSE SIMULATION
              </span>
              <h2 className="font-display text-3xl sm:text-4xl text-[#F0E8D9] font-normal mb-2">
                Asteroid Defender
              </h2>
              <p className="text-xs sm:text-sm text-[#B6C0CC] max-w-md font-light leading-relaxed">
                Pilot your deep-space scout through hazardous asteroid belts. Fire lasers to obliterate incoming asteroids, collect shield &amp; plasma power-ups, and survive escalating waves.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-xs font-mono text-[#B6C0CC] space-y-1.5 max-w-sm text-left">
              <div>⌨️ <strong className="text-white">Desktop:</strong> A / D or Left / Right to move; Spacebar to fire</div>
              <div>📱 <strong className="text-white">Mobile:</strong> Drag on canvas to steer ship; use on-screen buttons</div>
            </div>

            <button
              onClick={handleStartGame}
              className="px-8 py-3.5 rounded-xl bg-[#C6A36B] hover:bg-[#d8b57d] text-[#080D16] font-sans text-xs font-bold tracking-widest uppercase transition-all shadow-xl cursor-pointer"
            >
              LAUNCH MISSION ➔
            </button>
          </div>
        )}

        {/* Pause Overlay */}
        {gameState === 'paused' && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center space-y-4">
            <h3 className="font-display text-3xl text-[#F0E8D9]">Mission Suspended</h3>
            <p className="text-xs font-mono text-[#B6C0CC]">Game paused. Press P or resume to continue.</p>
            <button
              onClick={handlePauseToggle}
              className="px-6 py-2.5 rounded-xl bg-[#C6A36B] text-[#080D16] font-sans text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              RESUME FLIGHT
            </button>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-red-950/85 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center space-y-6">
            <div className="text-4xl">💥</div>
            <div>
              <span className="text-xs font-mono text-red-300 uppercase tracking-widest block mb-1">
                HULL CRITICALLY BREACHED
              </span>
              <h2 className="font-display text-3xl sm:text-4xl text-[#F0E8D9]">
                Mission Terminated
              </h2>
              <div className="font-display text-4xl text-[#C6A36B] my-3">
                {score.toLocaleString()} <span className="text-xl text-[#B6C0CC]">PTS</span>
              </div>
              <p className="text-xs text-[#B6C0CC] font-mono">
                Survived until Wave {wave} in the deep-space asteroid belt.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleStartGame}
                className="px-6 py-3 rounded-xl bg-[#C6A36B] hover:bg-[#d8b57d] text-[#080D16] font-sans text-xs font-bold tracking-widest uppercase transition-all shadow-lg cursor-pointer"
              >
                REDEPLOY SCOUT ➔
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
            ◀
          </button>
          <button
            onPointerDown={() => { stateRef.current.keys.right = true; }}
            onPointerUp={() => { stateRef.current.keys.right = false; }}
            className="w-12 h-10 rounded-xl bg-[#111A35] border border-white/20 active:bg-[#58D9FF] active:text-[#080B1D] text-lg font-bold flex items-center justify-center"
          >
            ▶
          </button>
        </div>

        <button
          onPointerDown={() => {
            stateRef.current.keys.fire = true;
            shootLasers();
          }}
          onPointerUp={() => { stateRef.current.keys.fire = false; }}
          className="flex-1 h-10 rounded-xl bg-gradient-to-r from-[#58D9FF] to-[#64E5C0] text-[#080B1D] font-sans font-bold text-xs uppercase tracking-wider flex items-center justify-center shadow-lg active:scale-95"
        >
          FIRE LASERS 🔥
        </button>
      </div>
    </div>
  );
};
