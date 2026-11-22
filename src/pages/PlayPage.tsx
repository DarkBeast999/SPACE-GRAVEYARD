import React, { useState, useEffect, useRef } from 'react';
import {
  playSignalPing,
  playLaserSound,
  playExplosionSound,
  playSuccessChime,
  playErrorBuzz,
} from '../utils/audio';

type ActiveGame = 'hub' | 'quiz' | 'defender' | 'repair';

// --- GAME 1: SPACE QUIZ DATA ---
interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  destination: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: 'Which Mars rover was designed for a 90-day mission but operated for nearly 15 years, driving over 45 kilometers?',
    options: ['Curiosity', 'Opportunity (MER-B)', 'Sojourner', 'Spirit'],
    correctIndex: 1,
    explanation: 'Opportunity landed in 2004 with a planned 90-sol lifespan, surviving until a massive global Martian dust storm covered its solar arrays in 2018.',
    destination: 'Mars',
  },
  {
    question: 'Which human-made spacecraft has travelled the furthest distance from Earth, currently in interstellar space?',
    options: ['New Horizons', 'Apollo 11', 'Voyager 1', 'Cassini'],
    correctIndex: 2,
    explanation: 'Voyager 1 crossed the heliopause in 2012 into interstellar space and is currently over 24 billion kilometers from Earth.',
    destination: 'Deep Space',
  },
  {
    question: 'What is unique about the robotic lander Surveyor 3 on the Moon?',
    options: [
      'It was visited by Apollo 12 astronauts who brought pieces back to Earth',
      'It was the heaviest rocket ever built',
      'It discovered gold on the lunar surface',
      'It returned to Earth completely on its own',
    ],
    correctIndex: 0,
    explanation: 'In November 1969, Apollo 12 astronauts Pete Conrad and Alan Bean landed 180 meters away and retrieved Surveyor 3’s camera to study how space exposure affected its parts.',
    destination: 'The Moon',
  },
  {
    question: 'How long does a radio signal traveling at the speed of light take to reach Voyager 1 from Earth today?',
    options: ['8 minutes', '1 hour', 'Over 23 hours', '3 days'],
    correctIndex: 2,
    explanation: 'Because Voyager 1 is over 166 Astronomical Units away, radio waves travelling at 300,000 km/s take approximately 23 hours and 12 minutes one-way.',
    destination: 'Deep Space',
  },
  {
    question: 'Which aircraft made history in 2021 by achieving the first powered, controlled flight on another planet?',
    options: ['Sojourner', 'Ingenuity Helicopter', 'Viking 1', 'Dragonfly'],
    correctIndex: 1,
    explanation: 'Ingenuity completed 72 historic flights across the thin Martian atmosphere before landing damage in 2024 concluded its mission.',
    destination: 'Mars',
  },
  {
    question: 'What do the Lunar Laser Ranging retroreflectors left on the Moon by Apollo and Lunokhod missions do?',
    options: [
      'They transmit radio music',
      'They bounce laser pulses from Earth to measure the Moon’s exact distance',
      'They collect solar electricity for future cities',
      'They melt lunar ice',
    ],
    correctIndex: 1,
    explanation: 'Earth observatories fire laser pulses that bounce off these corner-cube prism reflectors, measuring the Moon’s distance to within millimeters and proving it drifts away by 3.8 cm per year.',
    destination: 'The Moon',
  },
];

export const PlayPage: React.FC = () => {
  const [activeGame, setActiveGame] = useState<ActiveGame>('hub');

  // --- QUIZ STATE ---
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);

  // --- DEFENDER STATE (Canvas) ---
  const defenderCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [defenderScore, setDefenderScore] = useState(0);
  const [defenderHealth, setDefenderHealth] = useState(100);
  const [defenderGameOver, setDefenderGameOver] = useState(false);

  // --- REPAIR PUZZLE STATE ---
  const [repairStage, setRepairStage] = useState<1 | 2 | 3>(1);
  const [circuitConnected, setCircuitConnected] = useState(false);
  const [antennaAngle, setAntennaAngle] = useState(45);
  const [dustCleanPercent, setDustCleanPercent] = useState(0);
  const [repairComplete, setRepairComplete] = useState(false);

  // Handle Quiz Answer
  const handleSelectQuizAnswer = (idx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    setShowExplanation(true);

    if (idx === QUIZ_QUESTIONS[quizIndex].correctIndex) {
      playSuccessChime();
      setQuizScore((prev) => prev + 1);
    } else {
      playErrorBuzz();
    }
  };

  const handleNextQuizQuestion = () => {
    setSelectedAnswer(null);
    setShowExplanation(false);
    if (quizIndex + 1 < QUIZ_QUESTIONS.length) {
      setQuizIndex((prev) => prev + 1);
      playSignalPing(750);
    } else {
      setQuizComplete(true);
      playSuccessChime();
    }
  };

  const resetQuiz = () => {
    setQuizIndex(0);
    setQuizScore(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setQuizComplete(false);
  };

  // --- ASTEROID DEFENDER LOOP ---
  useEffect(() => {
    if (activeGame !== 'defender') return;
    const canvas = defenderCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    let animId: number;
    let health = 100;
    let scoreCount = 0;
    let isOver = false;

    // Canvas size
    canvas.width = 800;
    canvas.height = 450;

    interface Asteroid {
      x: number;
      y: number;
      radius: number;
      speedX: number;
      speedY: number;
    }

    const asteroids: Asteroid[] = [];
    const ship = { x: 90, y: canvas.height / 2, radius: 24 };

    const spawnAsteroid = () => {
      asteroids.push({
        x: canvas.width + 30,
        y: Math.random() * (canvas.height - 60) + 30,
        radius: Math.random() * 18 + 14,
        speedX: -(Math.random() * 2.5 + 2.0),
        speedY: (Math.random() - 0.5) * 1.5,
      });
    };

    let spawnTimer = setInterval(spawnAsteroid, 900);

    // Click handler to shoot/deflect asteroid
    const handleCanvasClick = (e: MouseEvent) => {
      if (isOver) return;
      const rect = canvas.getBoundingClientRect();
      const clickX = ((e.clientX - rect.left) / rect.width) * canvas.width;
      const clickY = ((e.clientY - rect.top) / rect.height) * canvas.height;

      playLaserSound();

      // Check hits
      for (let i = asteroids.length - 1; i >= 0; i--) {
        const a = asteroids[i];
        const dist = Math.hypot(clickX - a.x, clickY - a.y);
        if (dist < a.radius + 20) {
          playExplosionSound();
          asteroids.splice(i, 1);
          scoreCount += 100;
          setDefenderScore(scoreCount);
          break;
        }
      }
    };
    canvas.addEventListener('click', handleCanvasClick);

    const loop = () => {
      if (isOver) return;
      ctx.fillStyle = '#060a12';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw background stars
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let i = 0; i < 40; i++) {
        const sx = ((i * 37 + scoreCount * 0.2) % canvas.width);
        const sy = (i * 29) % canvas.height;
        ctx.fillRect(canvas.width - sx, sy, 1.5, 1.5);
      }

      // Draw Player Spacecraft
      ctx.fillStyle = '#C6A36B';
      ctx.beginPath();
      ctx.moveTo(ship.x + 20, ship.y);
      ctx.lineTo(ship.x - 16, ship.y - 14);
      ctx.lineTo(ship.x - 8, ship.y);
      ctx.lineTo(ship.x - 16, ship.y + 14);
      ctx.closePath();
      ctx.fill();

      // Shield aura
      ctx.strokeStyle = health > 30 ? 'rgba(56, 189, 248, 0.6)' : 'rgba(239, 68, 68, 0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(ship.x, ship.y, ship.radius + 6, 0, Math.PI * 2);
      ctx.stroke();

      // Update and Draw Asteroids
      for (let i = asteroids.length - 1; i >= 0; i--) {
        const a = asteroids[i];
        a.x += a.speedX;
        a.y += a.speedY;

        // Draw rock
        ctx.fillStyle = '#8a94a6';
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Check collision with ship
        const dist = Math.hypot(ship.x - a.x, ship.y - a.y);
        if (dist < ship.radius + a.radius) {
          playExplosionSound();
          asteroids.splice(i, 1);
          health -= 25;
          setDefenderHealth(Math.max(0, health));
          if (health <= 0) {
            isOver = true;
            setDefenderGameOver(true);
            playErrorBuzz();
          }
          continue;
        }

        // Out of bounds
        if (a.x < -40) {
          asteroids.splice(i, 1);
          scoreCount += 25;
          setDefenderScore(scoreCount);
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      clearInterval(spawnTimer);
      cancelAnimationFrame(animId);
      canvas.removeEventListener('click', handleCanvasClick);
    };
  }, [activeGame]);

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      {/* Top Header */}
      <div className="mb-8 border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#C6A36B] mb-2 font-semibold">
            <span>🎮</span>
            <span>SPACE EXPLORATION PLAY HUB</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl text-[#F0E8D9]">
            Play &amp; Learn
          </h1>
          <p className="text-sm text-[#B6C0CC] mt-2 font-light max-w-2xl leading-relaxed">
            Short, interactive space games designed for all ages. Test your knowledge, defend deep-space probes, or solve realistic robotic engineering puzzles.
          </p>
        </div>

        {activeGame !== 'hub' && (
          <button
            onClick={() => {
              playSignalPing(600);
              setActiveGame('hub');
            }}
            className="px-4 py-2 rounded-full border border-white/20 bg-white/5 hover:bg-[#C6A36B] hover:text-[#080D16] text-[#F0E8D9] font-mono text-xs font-semibold tracking-wider transition-all"
          >
            ← BACK TO GAME HUB
          </button>
        )}
      </div>

      {/* ================= HUB VIEW (3 GAME CARDS) ================= */}
      {activeGame === 'hub' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Game 1: Space Quiz */}
          <div className="p-7 rounded-3xl bg-[#101A29]/80 border border-white/10 hover:border-[#C6A36B]/50 flex flex-col justify-between shadow-2xl transition-all group backdrop-blur-md">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#C6A36B]/15 border border-[#C6A36B]/30 flex items-center justify-center text-3xl mb-5 group-hover:scale-105 transition-transform">
                🧠
              </div>
              <span className="text-[10px] mono text-[#C6A36B] uppercase tracking-widest font-semibold block mb-1">
                GAME 01 // KNOWLEDGE
              </span>
              <h2 className="font-display text-2xl text-[#F0E8D9] mb-2 font-medium">
                Space Quiz
              </h2>
              <p className="text-xs text-[#B6C0CC] leading-relaxed mb-6 font-light">
                Answer curious questions about the Moon, Mars rovers, speed of light, and historic breakthroughs.
              </p>

              <div className="space-y-1.5 text-[11px] mono text-[#B6C0CC]/80 mb-6">
                <div>DIFFICULTY: <span className="text-[#F0E8D9]">ALL AGES</span></div>
                <div>PLAY TIME: <span className="text-[#F0E8D9]">~3 MINUTES</span></div>
                <div>FORMAT: <span className="text-[#C6A36B]">INSTANT FEEDBACK</span></div>
              </div>
            </div>

            <button
              onClick={() => {
                resetQuiz();
                playSignalPing(800);
                setActiveGame('quiz');
              }}
              className="w-full py-3 rounded-xl bg-[#C6A36B] hover:bg-[#d8b57d] text-[#080D16] font-sans text-xs font-bold tracking-[0.2em] uppercase transition-all shadow-md"
            >
              START SPACE QUIZ →
            </button>
          </div>

          {/* Game 2: Asteroid Defender */}
          <div className="p-7 rounded-3xl bg-[#101A29]/80 border border-white/10 hover:border-[#38bdf8]/50 flex flex-col justify-between shadow-2xl transition-all group backdrop-blur-md">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#38bdf8]/15 border border-[#38bdf8]/30 flex items-center justify-center text-3xl mb-5 group-hover:scale-105 transition-transform">
                ☄️
              </div>
              <span className="text-[10px] mono text-[#38bdf8] uppercase tracking-widest font-semibold block mb-1">
                GAME 02 // REACTION
              </span>
              <h2 className="font-display text-2xl text-[#F0E8D9] mb-2 font-medium">
                Asteroid Defender
              </h2>
              <p className="text-xs text-[#B6C0CC] leading-relaxed mb-6 font-light">
                Click or tap approaching asteroids to deflect and vaporize them before they damage your spacecraft shield.
              </p>

              <div className="space-y-1.5 text-[11px] mono text-[#B6C0CC]/80 mb-6">
                <div>DIFFICULTY: <span className="text-[#F0E8D9]">ACTION / REFLEX</span></div>
                <div>PLAY TIME: <span className="text-[#F0E8D9]">~2 MINUTES</span></div>
                <div>CONTROLS: <span className="text-[#38bdf8]">CLICK / TAP</span></div>
              </div>
            </div>

            <button
              onClick={() => {
                setDefenderScore(0);
                setDefenderHealth(100);
                setDefenderGameOver(false);
                playLaserSound();
                setActiveGame('defender');
              }}
              className="w-full py-3 rounded-xl bg-[#38bdf8] hover:bg-[#7dd3fc] text-[#080D16] font-sans text-xs font-bold tracking-[0.2em] uppercase transition-all shadow-md"
            >
              START DEFENDER →
            </button>
          </div>

          {/* Game 3: Mission Repair */}
          <div className="p-7 rounded-3xl bg-[#101A29]/80 border border-white/10 hover:border-emerald-400/50 flex flex-col justify-between shadow-2xl transition-all group backdrop-blur-md">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-3xl mb-5 group-hover:scale-105 transition-transform">
                🔧
              </div>
              <span className="text-[10px] mono text-emerald-400 uppercase tracking-widest font-semibold block mb-1">
                GAME 03 // ENGINEERING PUZZLE
              </span>
              <h2 className="font-display text-2xl text-[#F0E8D9] mb-2 font-medium">
                Mission Repair
              </h2>
              <p className="text-xs text-[#B6C0CC] leading-relaxed mb-6 font-light">
                Help a disabled robotic rover solve real engineering challenges: reconnect power, align dish antennas, and clear solar dust.
              </p>

              <div className="space-y-1.5 text-[11px] mono text-[#B6C0CC]/80 mb-6">
                <div>DIFFICULTY: <span className="text-[#F0E8D9]">PUZZLE</span></div>
                <div>STAGES: <span className="text-[#F0E8D9]">3 CHALLENGES</span></div>
                <div>THEME: <span className="text-emerald-400">REAL ENGINEERING</span></div>
              </div>
            </div>

            <button
              onClick={() => {
                setRepairStage(1);
                setCircuitConnected(false);
                setAntennaAngle(45);
                setDustCleanPercent(0);
                setRepairComplete(false);
                playSignalPing(800);
                setActiveGame('repair');
              }}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#080D16] font-sans text-xs font-bold tracking-[0.2em] uppercase transition-all shadow-md"
            >
              START MISSION REPAIR →
            </button>
          </div>
        </div>
      )}

      {/* ================= GAME 1: SPACE QUIZ ================= */}
      {activeGame === 'quiz' && (
        <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-[#101A29]/90 border border-white/15 shadow-2xl backdrop-blur-xl">
          {!quizComplete ? (
            <div>
              {/* Question Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10 text-xs font-mono">
                <span className="text-[#C6A36B] font-bold">
                  QUESTION {quizIndex + 1} OF {QUIZ_QUESTIONS.length}
                </span>
                <span className="text-[#B6C0CC]">
                  SCORE: <span className="text-[#F0E8D9] font-bold">{quizScore}</span>
                </span>
              </div>

              {/* Question Text */}
              <h2 className="font-display text-xl sm:text-2xl text-[#F0E8D9] font-medium leading-snug mb-6">
                {QUIZ_QUESTIONS[quizIndex].question}
              </h2>

              {/* Multiple Choice Options */}
              <div className="space-y-3 mb-6">
                {QUIZ_QUESTIONS[quizIndex].options.map((opt, idx) => {
                  let btnStyle = 'border-white/15 bg-white/5 text-[#F0E8D9] hover:border-[#C6A36B]/60';
                  if (selectedAnswer !== null) {
                    if (idx === QUIZ_QUESTIONS[quizIndex].correctIndex) {
                      btnStyle = 'border-emerald-400 bg-emerald-500/20 text-emerald-200 font-bold';
                    } else if (idx === selectedAnswer) {
                      btnStyle = 'border-rose-400 bg-rose-500/20 text-rose-200';
                    } else {
                      btnStyle = 'border-white/5 bg-black/20 text-[#B6C0CC]/40';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectQuizAnswer(idx)}
                      disabled={selectedAnswer !== null}
                      className={`w-full p-4 rounded-xl text-left border transition-all text-sm font-sans flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {selectedAnswer !== null && idx === QUIZ_QUESTIONS[quizIndex].correctIndex && (
                        <span className="text-emerald-400 font-bold">✓ CORRECT</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Card */}
              {showExplanation && (
                <div className="p-4 rounded-xl bg-black/40 border border-[#C6A36B]/40 mb-6 animate-fadeIn">
                  <span className="text-[10px] mono text-[#C6A36B] uppercase font-bold block mb-1">
                    WHY THIS MATTERS:
                  </span>
                  <p className="text-xs text-[#B6C0CC] leading-relaxed font-sans">
                    {QUIZ_QUESTIONS[quizIndex].explanation}
                  </p>
                </div>
              )}

              {/* Next Button */}
              {selectedAnswer !== null && (
                <button
                  onClick={handleNextQuizQuestion}
                  className="w-full py-3 rounded-xl bg-[#C6A36B] text-[#080D16] font-sans text-xs font-bold tracking-[0.2em] uppercase transition-all shadow-lg"
                >
                  {quizIndex + 1 < QUIZ_QUESTIONS.length ? 'NEXT QUESTION →' : 'SEE FINAL RESULTS →'}
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="text-5xl mb-4">🏆</div>
              <h2 className="font-display text-3xl text-[#F0E8D9] mb-2">Quiz Complete!</h2>
              <p className="text-base text-[#C6A36B] font-mono mb-6">
                You scored {quizScore} out of {QUIZ_QUESTIONS.length}!
              </p>
              <p className="text-xs text-[#B6C0CC] max-w-md mx-auto leading-relaxed mb-8 font-light">
                {quizScore >= 5
                  ? 'Outstanding knowledge! You are an honorary deep-space flight director.'
                  : 'Well done! Keep exploring the 3D Universe and permanent collection to learn more.'}
              </p>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={resetQuiz}
                  className="px-6 py-2.5 rounded-xl bg-[#C6A36B] text-[#080D16] font-sans text-xs font-bold uppercase tracking-wider"
                >
                  PLAY AGAIN
                </button>
                <button
                  onClick={() => setActiveGame('hub')}
                  className="px-6 py-2.5 rounded-xl border border-white/20 text-[#F0E8D9] font-sans text-xs uppercase tracking-wider"
                >
                  RETURN TO HUB
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= GAME 2: ASTEROID DEFENDER ================= */}
      {activeGame === 'defender' && (
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          {/* Top HUD */}
          <div className="w-full max-w-[800px] flex items-center justify-between p-4 bg-[#080D16] rounded-t-2xl border-t border-x border-white/10 text-xs font-mono">
            <div>
              SHIELD HEALTH:{' '}
              <span className={defenderHealth > 30 ? 'text-[#38bdf8] font-bold' : 'text-rose-400 font-bold'}>
                {defenderHealth}%
              </span>
            </div>
            <div>
              SCORE: <span className="text-[#F0E8D9] font-bold">{defenderScore}</span>
            </div>
            <div className="text-[#B6C0CC]/70">CLICK ASTEROIDS TO DEFLECT</div>
          </div>

          {/* Canvas */}
          <div className="relative w-full max-w-[800px] border border-white/15 rounded-b-2xl overflow-hidden shadow-2xl bg-black">
            <canvas ref={defenderCanvasRef} className="w-full h-auto block cursor-crosshair" />

            {defenderGameOver && (
              <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
                <div className="text-4xl mb-3">💥</div>
                <h3 className="font-display text-2xl text-[#F0E8D9] mb-2 font-medium">Shield Depleted!</h3>
                <p className="text-xs text-[#B6C0CC] font-mono mb-4">Final Score: {defenderScore}</p>
                <button
                  onClick={() => {
                    setDefenderScore(0);
                    setDefenderHealth(100);
                    setDefenderGameOver(false);
                    playLaserSound();
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#38bdf8] text-[#080D16] font-sans text-xs font-bold uppercase tracking-wider"
                >
                  RETRY MISSION
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= GAME 3: MISSION REPAIR ================= */}
      {activeGame === 'repair' && (
        <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-[#101A29]/90 border border-white/15 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs font-mono mb-6">
            <span className="text-emerald-400 font-bold">STAGE {repairStage} OF 3</span>
            <span className="text-[#B6C0CC]">ROBOTIC HEALTH CHECK</span>
          </div>

          {/* STAGE 1: Solar Circuit Connect */}
          {repairStage === 1 && (
            <div>
              <h2 className="font-display text-2xl text-[#F0E8D9] mb-2 font-medium">
                Stage 1: Reconnect the Solar Circuit
              </h2>
              <p className="text-xs text-[#B6C0CC] mb-6 leading-relaxed font-light">
                Extreme cold fractured the main battery power bus. Connect the solar wire terminal to restore life support.
              </p>

              <div className="p-6 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center gap-6 mb-6">
                <div className="px-4 py-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-xs font-mono text-amber-300">
                  ☀️ SOLAR ARRAY (28V)
                </div>

                <div className="text-2xl text-white">⸺⸺</div>

                <button
                  onClick={() => {
                    playSuccessChime();
                    setCircuitConnected(true);
                  }}
                  className={`px-5 py-3 rounded-xl text-xs font-mono font-bold transition-all ${
                    circuitConnected
                      ? 'bg-emerald-500 text-[#080D16]'
                      : 'bg-white/10 text-[#F0E8D9] border border-dashed border-white/30 hover:border-emerald-400 animate-pulse'
                  }`}
                >
                  {circuitConnected ? '✓ BUS CONNECTED' : '⚡ CLICK TO SOLDER BREAKER'}
                </button>

                <div className="text-2xl text-white">⸺⸺</div>

                <div className="px-4 py-3 rounded-xl bg-sky-500/20 border border-sky-500/40 text-xs font-mono text-sky-300">
                  🔋 MAIN BATTERY
                </div>
              </div>

              {circuitConnected && (
                <div className="space-y-4 animate-fadeIn">
                  <p className="text-xs text-emerald-400 font-mono">
                    ✓ Power flow restored: 28 Volts flowing into battery cells.
                  </p>
                  <button
                    onClick={() => {
                      playSignalPing(750);
                      setRepairStage(2);
                    }}
                    className="w-full py-3 rounded-xl bg-emerald-500 text-[#080D16] font-sans text-xs font-bold uppercase tracking-wider"
                  >
                    PROCEED TO STAGE 2 →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STAGE 2: High Gain Antenna Alignment */}
          {repairStage === 2 && (
            <div>
              <h2 className="font-display text-2xl text-[#F0E8D9] mb-2 font-medium">
                Stage 2: Align the High-Gain Antenna
              </h2>
              <p className="text-xs text-[#B6C0CC] mb-6 leading-relaxed font-light">
                Earth is located at azimuth angle <span className="text-[#C6A36B] font-bold">180°</span>. Adjust the gimbal slider until the radio lock turns green.
              </p>

              <div className="p-6 rounded-2xl bg-black/40 border border-white/10 mb-6 space-y-4 text-center">
                <div className="text-3xl">{antennaAngle === 180 ? '📡' : '🛰️'}</div>
                <div className="text-sm font-mono text-[#F0E8D9]">
                  CURRENT AZIMUTH: <span className="text-[#C6A36B] font-bold">{antennaAngle}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="5"
                  value={antennaAngle}
                  onChange={(e) => setAntennaAngle(Number(e.target.value))}
                  className="w-full accent-[#C6A36B]"
                />
                <div className="text-xs font-mono">
                  {antennaAngle === 180 ? (
                    <span className="text-emerald-400 font-bold">✓ 100% SIGNAL LOCK WITH GOLDSTONE DSN</span>
                  ) : (
                    <span className="text-rose-400">NO CARRIER — MOVE SLIDER TOWARD 180°</span>
                  )}
                </div>
              </div>

              {antennaAngle === 180 && (
                <button
                  onClick={() => {
                    playSuccessChime();
                    setRepairStage(3);
                  }}
                  className="w-full py-3 rounded-xl bg-emerald-500 text-[#080D16] font-sans text-xs font-bold uppercase tracking-wider animate-fadeIn"
                >
                  PROCEED TO STAGE 3 →
                </button>
              )}
            </div>
          )}

          {/* STAGE 3: Clear Martian Solar Dust */}
          {repairStage === 3 && (
            <div>
              <h2 className="font-display text-2xl text-[#F0E8D9] mb-2 font-medium">
                Stage 3: Clear Martian Dust from Solar Panels
              </h2>
              <p className="text-xs text-[#B6C0CC] mb-6 leading-relaxed font-light">
                Martian dust devils settled an opaque layer of red iron-oxide silt across the photovoltaic cells. Tap repeatedly to activate the pneumatic wiper and clear the panels.
              </p>

              <div className="p-6 rounded-2xl bg-black/40 border border-white/10 mb-6 text-center space-y-4">
                <div className="text-xs font-mono text-[#B6C0CC]">
                  SOLAR EFFICIENCY: <span className="text-[#C6A36B] font-bold">{dustCleanPercent}%</span>
                </div>

                <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-200"
                    style={{ width: `${dustCleanPercent}%` }}
                  />
                </div>

                <button
                  onClick={() => {
                    playSignalPing(900);
                    const next = Math.min(100, dustCleanPercent + 20);
                    setDustCleanPercent(next);
                    if (next >= 100) {
                      setRepairComplete(true);
                      playSuccessChime();
                    }
                  }}
                  disabled={repairComplete}
                  className="px-6 py-3 rounded-xl bg-[#C6A36B] text-[#080D16] font-sans text-xs font-bold uppercase tracking-wider"
                >
                  {repairComplete ? '✓ PANELS 100% CLEAN' : '🧹 TAP TO WIPE DUST (+20%)'}
                </button>
              </div>

              {repairComplete && (
                <div className="space-y-4 animate-fadeIn text-center">
                  <div className="text-4xl">🚀</div>
                  <h3 className="font-display text-xl text-[#F0E8D9]">All Systems Nominal!</h3>
                  <p className="text-xs text-[#B6C0CC] font-light max-w-sm mx-auto">
                    The rover's power, communications, and solar systems are fully restored.
                  </p>
                  <button
                    onClick={() => setActiveGame('hub')}
                    className="px-6 py-2.5 rounded-xl bg-[#C6A36B] text-[#080D16] font-sans text-xs font-bold uppercase"
                  >
                    RETURN TO PLAY HUB
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
