import React, { useState } from 'react';
import { ActiveGameId, GameMetadata } from '../games/types';
import { SpaceQuiz } from '../games/SpaceQuiz/SpaceQuiz';
import { AsteroidDefender } from '../games/AsteroidDefender/AsteroidDefender';
import { MissionRepair } from '../games/MissionRepair/MissionRepair';
import { LunarLander } from '../games/LunarLander/LunarLander';
import { playSignalPing, playWhooshSound } from '../utils/audio';

const GAMES: GameMetadata[] = [
  {
    id: 'quiz',
    title: 'Space Quiz',
    subtitle: 'Cosmic Knowledge & Trivia Challenge',
    genre: 'Knowledge / Trivia',
    difficulty: 'Moderate',
    estimatedTime: '3–5 Minutes',
    description: 'Test your mastery of seventy years of interplanetary exploration across 30+ verified historical questions spanning Apollo, Curiosity, Voyager, and beyond.',
    instructions: [
      'Answer 10 randomized multiple-choice questions drawn from authentic historical archives.',
      'Maintain consecutive correct answers to build multiplier streaks and bonus points.',
      'Study rich historical context explanations revealed after every response.',
    ],
    controls: [
      { key: 'Mouse / Touch', action: 'Select from four answers' },
      { key: 'Keypad A–D', action: 'Keyboard answer selection' },
    ],
    accentColor: '#C6A36B',
    icon: '🏆',
  },
  {
    id: 'defender',
    title: 'Asteroid Defender',
    subtitle: 'Deep-Space Reflex & Survival Combat',
    genre: 'Arcade / Reflex',
    difficulty: 'Challenging',
    estimatedTime: '2–4 Minutes',
    description: 'Pilot your deep-space scout through treacherous asteroid fields. Blast incoming space rocks, collect plasma power-ups and shield restores, and survive escalating waves.',
    instructions: [
      'Steer your ship to evade incoming asteroids and collect dropped power-ups.',
      'Fire high-frequency plasma bolts to fragment and destroy dense rocks.',
      'Chain rapid destructions to build score combo multipliers before your shield collapses.',
    ],
    controls: [
      { key: 'A / D or Arrow Keys', action: 'Steer ship left / right' },
      { key: 'Spacebar / W / Up', action: 'Fire laser cannons' },
      { key: 'Touch / Pointer Drag', action: 'Direct touch steering on mobile' },
    ],
    accentColor: '#38bdf8',
    icon: '🛸',
  },
  {
    id: 'repair',
    title: 'Mission Repair',
    subtitle: 'Spacecraft Engineering Simulator',
    genre: 'Engineering / Puzzle',
    difficulty: 'Moderate',
    estimatedTime: '4–6 Minutes',
    description: 'A stranded explorer has suffered multiple subsystem failures. Rotate power conduits, calibrate high-gain dish antennas, and wipe clean solar arrays to restore active telemetry.',
    instructions: [
      'Stage 1: Click tiles to rotate wire conduits and route power to the main computer bus.',
      'Stage 2: Adjust azimuth and elevation angles to lock onto NASA’s Deep Space Network carrier.',
      'Stage 3: Drag across the Martian solar array to sweep away accumulated iron-oxide dust.',
    ],
    controls: [
      { key: 'Click / Tap', action: 'Rotate circuit tiles & adjust sliders' },
      { key: 'Pointer Drag', action: 'Wipe away Martian surface dust' },
    ],
    accentColor: '#10b981',
    icon: '🛠️',
  },
  {
    id: 'lander',
    title: 'Lunar Lander: Touchdown',
    subtitle: 'Precision Gravity & Thruster Simulation',
    genre: 'Arcade / Skill',
    difficulty: 'Challenging',
    estimatedTime: '3–5 Minutes',
    description: 'Pilot the Apollo Lunar Module descent stage down to marked landing pads. Balance limited hypergolic fuel, control vertical descent speed, and master lunar inertia.',
    instructions: [
      'Fire main thrusters to counteract constant 1/6th lunar gravity.',
      'Use RCS steering thrusters to eliminate horizontal drift and maintain vertical alignment.',
      'Touch down on the marked pad with vertical speed &le; 2.2 m/s and tilt angle &le; &plusmn;12°.',
    ],
    controls: [
      { key: 'W / Up / Spacebar', action: 'Fire main rocket thruster' },
      { key: 'A / D or Left / Right', action: 'RCS attitude rotation' },
      { key: 'On-Screen Buttons', action: 'Mobile touch thrusters' },
    ],
    accentColor: '#f59e0b',
    icon: '🌕',
  },
];

export const PlayPage: React.FC = () => {
  const [activeGame, setActiveGame] = useState<ActiveGameId>('hub');
  const [inspectingGame, setInspectingGame] = useState<GameMetadata | null>(null);

  // Persistent user scores in localStorage
  const [quizScore, setQuizScore] = useState<number>(() => {
    return Number(localStorage.getItem('space_graveyard_quiz_score') || 0);
  });
  const [defenderScore, setDefenderScore] = useState<number>(() => {
    return Number(localStorage.getItem('space_graveyard_defender_score') || 0);
  });
  const [repairPassed, setRepairPassed] = useState<boolean>(() => {
    return localStorage.getItem('space_graveyard_repair_passed') === 'true';
  });
  const [landerStages, setLanderStages] = useState<number>(() => {
    return Number(localStorage.getItem('space_graveyard_lander_stages') || 0);
  });

  const handleUpdateQuizScore = (s: number) => {
    if (s > quizScore) {
      setQuizScore(s);
      localStorage.setItem('space_graveyard_quiz_score', String(s));
    }
  };

  const handleUpdateDefenderScore = (s: number) => {
    if (s > defenderScore) {
      setDefenderScore(s);
      localStorage.setItem('space_graveyard_defender_score', String(s));
    }
  };

  const handleCompleteRepair = () => {
    setRepairPassed(true);
    localStorage.setItem('space_graveyard_repair_passed', 'true');
  };

  const handleLanderStageClear = (st: number) => {
    if (st > landerStages) {
      setLanderStages(st);
      localStorage.setItem('space_graveyard_lander_stages', String(st));
    }
  };

  const handleSelectGame = (id: ActiveGameId) => {
    playWhooshSound();
    setActiveGame(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHub = () => {
    playSignalPing(700);
    setActiveGame('hub');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --------------------------------------------------------------------------
  // GAME RENDER SWITCH
  // --------------------------------------------------------------------------
  if (activeGame === 'quiz') {
    return <SpaceQuiz onBackToHub={handleBackToHub} onUpdateScore={handleUpdateQuizScore} />;
  }
  if (activeGame === 'defender') {
    return <AsteroidDefender onBackToHub={handleBackToHub} onUpdateScore={handleUpdateDefenderScore} />;
  }
  if (activeGame === 'repair') {
    return <MissionRepair onBackToHub={handleBackToHub} onComplete={handleCompleteRepair} />;
  }
  if (activeGame === 'lander') {
    return <LunarLander onBackToHub={handleBackToHub} onStageClear={handleLanderStageClear} />;
  }

  // --------------------------------------------------------------------------
  // ARCADE ENTRANCE HUB
  // --------------------------------------------------------------------------
  return (
    <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen flex flex-col">
      {/* Editorial Header */}
      <header className="relative mb-12 p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#111A35]/95 via-[#080B1D]/95 to-[#080B1D]/98 border border-white/10 shadow-2xl backdrop-blur-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFC66D]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-[#58D9FF]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#FFC66D] animate-pulse" />
            <span className="font-mono text-xs text-[#FFC66D] tracking-widest uppercase font-semibold">
              INTERACTIVE ARCADE // FOUR EXPEDITION SIMULATIONS
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl font-normal text-[#F5F0E8] tracking-tight mb-4">
            The Play Hub
          </h1>

          <p className="text-sm sm:text-base text-[#C8D8EA] font-sans font-light leading-relaxed mb-8">
            Experience the challenges, physics, and knowledge of space exploration through four fully playable mini-games.
            Test your planetary trivia, navigate deep-space asteroid belts, execute spacecraft engineering repairs, or master a 2D lunar descent.
          </p>

          {/* Player Personal Bests Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-6 border-t border-white/10 text-left">
            <div className="bg-black/40 p-3.5 rounded-xl border border-white/5">
              <span className="font-mono text-[10px] text-[#C8D8EA] uppercase tracking-wider block mb-0.5">TRIVIA BEST</span>
              <span className="font-display text-lg sm:text-xl text-[#FFC66D]">
                {quizScore > 0 ? `${quizScore} PTS` : 'Unplayed'}
              </span>
            </div>
            <div className="bg-black/40 p-3.5 rounded-xl border border-white/5">
              <span className="font-mono text-[10px] text-[#C8D8EA] uppercase tracking-wider block mb-0.5">DEFENDER RECORD</span>
              <span className="font-display text-lg sm:text-xl text-[#58D9FF]">
                {defenderScore > 0 ? `${defenderScore} PTS` : 'Unplayed'}
              </span>
            </div>
            <div className="bg-black/40 p-3.5 rounded-xl border border-white/5">
              <span className="font-mono text-[10px] text-[#C8D8EA] uppercase tracking-wider block mb-0.5">ENGINEERING REPAIR</span>
              <span className="font-display text-lg sm:text-xl text-emerald-400">
                {repairPassed ? '✓ Complete' : 'Pending'}
              </span>
            </div>
            <div className="bg-black/40 p-3.5 rounded-xl border border-white/5">
              <span className="font-mono text-[10px] text-[#C8D8EA] uppercase tracking-wider block mb-0.5">LUNAR LANDINGS</span>
              <span className="font-display text-lg sm:text-xl text-amber-400">
                {landerStages > 0 ? `${landerStages}/3 Stages` : 'Unplayed'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Four Game Cards Grid */}
      <main className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-12">
        {GAMES.map((game, idx) => {
          return (
            <article
              key={game.id}
              className="p-8 sm:p-9 rounded-3xl bg-gradient-to-br from-[#101A29]/95 via-[#0e1624]/90 to-[#080D16]/95 border border-white/10 hover:border-[#C6A36B]/60 transition-all shadow-xl backdrop-blur-md flex flex-col justify-between group hover:shadow-2xl"
            >
              <div>
                {/* Top Badges & Genre */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                      {game.icon}
                    </span>
                    <div>
                      <span className="font-mono text-[10px] text-[#C6A36B] uppercase tracking-widest font-bold block">
                        GAME 0{idx + 1} // {game.genre.toUpperCase()}
                      </span>
                      <span className="text-xs text-[#B6C0CC] font-mono">
                        Difficulty: {game.difficulty} • ~{game.estimatedTime}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setInspectingGame(game)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-[#B6C0CC] hover:text-white transition-colors cursor-pointer"
                    title="View Instructions & Controls"
                  >
                    ℹ️ Help
                  </button>
                </div>

                {/* Title */}
                <h2 className="font-display text-2xl sm:text-3xl text-[#F0E8D9] font-normal leading-tight group-hover:text-white transition-colors mb-2">
                  {game.title}
                </h2>
                <div className="font-mono text-xs text-[#C6A36B]/90 tracking-wider uppercase mb-4">
                  {game.subtitle}
                </div>

                {/* Description */}
                <p className="text-sm text-[#F0E8D9]/90 font-sans font-light leading-relaxed mb-6">
                  {game.description}
                </p>

                {/* Bullet Highlights */}
                <div className="space-y-1.5 p-3.5 rounded-2xl bg-black/40 border border-white/5 text-xs font-mono text-[#B6C0CC] mb-6">
                  {game.instructions.slice(0, 2).map((inst, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-[#C6A36B]">▸</span>
                      <span>{inst}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                <button
                  onClick={() => handleSelectGame(game.id)}
                  className="flex-1 py-3.5 px-6 rounded-xl bg-[#C6A36B] hover:bg-[#d8b57d] text-[#080D16] font-sans text-xs font-bold tracking-widest uppercase transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>LAUNCH GAME ➔</span>
                </button>
                <button
                  onClick={() => setInspectingGame(game)}
                  className="py-3.5 px-4 rounded-xl bg-white/5 hover:bg-white/15 text-[#F0E8D9] border border-white/10 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer"
                >
                  HOW TO PLAY
                </button>
              </div>
            </article>
          );
        })}
      </main>

      {/* Instructions & Controls Modal Drawer */}
      {inspectingGame && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full p-8 rounded-3xl bg-[#101A29] border border-[#C6A36B]/60 shadow-2xl space-y-6 animate-fadeIn">
            <div className="flex items-start justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{inspectingGame.icon}</span>
                <div>
                  <h3 className="font-display text-2xl text-[#F0E8D9]">
                    {inspectingGame.title}
                  </h3>
                  <span className="font-mono text-xs text-[#C6A36B] uppercase tracking-wider">
                    {inspectingGame.genre} • {inspectingGame.difficulty}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setInspectingGame(null)}
                className="text-xs p-1.5 rounded-full border border-white/15 text-[#B6C0CC] hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Detailed Instructions */}
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#C6A36B] font-bold block mb-2">
                MISSION OBJECTIVES
              </span>
              <ul className="space-y-2 text-xs sm:text-sm text-[#F0E8D9]/90 font-light leading-relaxed">
                {inspectingGame.instructions.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-mono text-[#C6A36B] font-bold">{idx + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Controls Mapping */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest text-[#38bdf8] font-bold block mb-1">
                PILOT CONTROLS
              </span>
              {inspectingGame.controls.map((ctrl, i) => (
                <div key={i} className="flex justify-between text-xs font-mono text-[#B6C0CC]">
                  <span className="text-[#F0E8D9] font-medium">{ctrl.key}:</span>
                  <span className="text-[#38bdf8]">{ctrl.action}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => {
                  const target = inspectingGame.id;
                  setInspectingGame(null);
                  handleSelectGame(target);
                }}
                className="flex-1 py-3 rounded-xl bg-[#C6A36B] hover:bg-[#d8b57d] text-[#080D16] font-sans text-xs font-bold uppercase tracking-wider shadow-lg"
              >
                PLAY NOW ➔
              </button>
              <button
                onClick={() => setInspectingGame(null)}
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-[#F0E8D9] text-xs font-mono uppercase tracking-wider"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
