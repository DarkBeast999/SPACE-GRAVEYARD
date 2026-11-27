import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  playSignalPing,
  playSuccessChime,
  playTypewriterClick,
} from '../../utils/audio';

interface MissionRepairProps {
  onBackToHub: () => void;
  onComplete?: () => void;
}

// ----------------------------------------------------------------------------
// STAGE 1: POWER CIRCUIT DATA & SOLVER (3x3 ROTATION GRID)
// ----------------------------------------------------------------------------
// Each tile has 4 connection ports: [North, East, South, West] (boolean)
// Rotating 90° clockwise shifts ports: [W, N, E, S]

interface CircuitTile {
  id: number;
  row: number;
  col: number;
  basePorts: [boolean, boolean, boolean, boolean]; // N, E, S, W
  rotation: number; // 0, 1, 2, 3 (each is 90 deg)
}

export const MissionRepair: React.FC<MissionRepairProps> = ({ onBackToHub, onComplete }) => {
  const [stage, setStage] = useState<1 | 2 | 3>(1);
  const [showHint, setShowHint] = useState(false);
  const [stagePassed, setStagePassed] = useState(false);
  const [missionComplete, setMissionComplete] = useState(false);

  // --------------------------------------------------------------------------
  // STAGE 1 STATE: CIRCUIT PUZZLE
  // --------------------------------------------------------------------------
  // Handcrafted 3x3 layout with unique solution
  // Start is (0,0) from West. End is (2,2) to East.
  const [tiles, setTiles] = useState<CircuitTile[]>([
    { id: 0, row: 0, col: 0, basePorts: [false, true, true, false], rotation: 1 }, // corner (needs E & W or E & S)
    { id: 1, row: 0, col: 1, basePorts: [false, true, false, true], rotation: 1 }, // straight (E & W)
    { id: 2, row: 0, col: 2, basePorts: [false, false, true, true], rotation: 2 }, // corner (S & W)
    { id: 3, row: 1, col: 0, basePorts: [true, false, true, false], rotation: 0 }, // straight (N & S)
    { id: 4, row: 1, col: 1, basePorts: [true, true, true, false], rotation: 3 },  // tee
    { id: 5, row: 1, col: 2, basePorts: [true, false, true, false], rotation: 0 }, // straight (N & S)
    { id: 6, row: 2, col: 0, basePorts: [true, true, false, false], rotation: 2 }, // corner (N & E)
    { id: 7, row: 2, col: 1, basePorts: [false, true, false, true], rotation: 1 }, // straight (E & W)
    { id: 8, row: 2, col: 2, basePorts: [true, true, false, true], rotation: 1 },  // tee (needs N or W to E)
  ]);

  const [activeCircuitPath, setActiveCircuitPath] = useState<number[]>([]);

  // Rotate tile 90°
  const handleRotateTile = (idx: number) => {
    if (stagePassed) return;
    playTypewriterClick();
    setTiles((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], rotation: (copy[idx].rotation + 1) % 4 };
      return copy;
    });
  };

  // Check circuit continuity
  const getActivePorts = (tile: CircuitTile): [boolean, boolean, boolean, boolean] => {
    const r = tile.rotation % 4;
    const [n, e, s, w] = tile.basePorts;
    if (r === 0) return [n, e, s, w];
    if (r === 1) return [w, n, e, s];
    if (r === 2) return [s, w, n, e];
    return [e, s, w, n];
  };

  useEffect(() => {
    if (stage !== 1) return;

    // Traverse from (0,0) with inlet at West
    const visited = new Set<number>();
    const path: number[] = [];

    const startTile = tiles[0];
    const startPorts = getActivePorts(startTile);

    // Inlet enters at (0,0) from the West
    if (!startPorts[3]) {
      setActiveCircuitPath([]);
      return;
    }

    let curr = 0;
    visited.add(curr);
    path.push(curr);

    // Iterative step check
    let moved = true;
    while (moved) {
      moved = false;
      const cTile = tiles[curr];
      const cPorts = getActivePorts(cTile);
      const r = cTile.row;
      const c = cTile.col;

      // Directions: 0=N, 1=E, 2=S, 3=W
      const neighbors = [
        { dir: 0, oppDir: 2, row: r - 1, col: c },
        { dir: 1, oppDir: 3, row: r, col: c + 1 },
        { dir: 2, oppDir: 0, row: r + 1, col: c },
        { dir: 3, oppDir: 1, row: r, col: c - 1 },
      ];

      for (const n of neighbors) {
        if (n.row >= 0 && n.row < 3 && n.col >= 0 && n.col < 3) {
          const nIdx = n.row * 3 + n.col;
          if (!visited.has(nIdx) && cPorts[n.dir]) {
            const nPorts = getActivePorts(tiles[nIdx]);
            if (nPorts[n.oppDir]) {
              visited.add(nIdx);
              path.push(nIdx);
              curr = nIdx;
              moved = true;
              break;
            }
          }
        }
      }
    }

    setActiveCircuitPath(path);

    // Win condition: path reaches tile 8 (2,2) and outlet port to East is open!
    if (path.includes(8) && getActivePorts(tiles[8])[1]) {
      if (!stagePassed) {
        setStagePassed(true);
        playSuccessChime();
      }
    }
  }, [tiles, stage, stagePassed]);

  // --------------------------------------------------------------------------
  // STAGE 2 STATE: ANTENNA ALIGNMENT CHALLENGE
  // --------------------------------------------------------------------------
  const [azimuth, setAzimuth] = useState(120);
  const [elevation, setElevation] = useState(15);
  const targetAzimuth = 214;
  const targetElevation = 46;
  const [signalStrength, setSignalStrength] = useState(0);
  const [lockedTime, setLockedTime] = useState(0);

  useEffect(() => {
    if (stage !== 2) return;
    const dAz = Math.abs(azimuth - targetAzimuth);
    const dEl = Math.abs(elevation - targetElevation);
    const totalDiff = Math.sqrt(dAz * dAz + dEl * dEl);

    // Max error is ~180. Calculate percentage
    const rawStrength = Math.max(0, 100 - totalDiff * 2.2);
    const noise = Math.random() * 3;
    const finalStrength = Math.min(100, Math.round(rawStrength + noise));
    setSignalStrength(finalStrength);

    let interval: ReturnType<typeof setInterval>;
    if (finalStrength >= 94) {
      interval = setInterval(() => {
        setLockedTime((prev) => {
          if (prev >= 15 && !stagePassed) {
            setStagePassed(true);
            playSuccessChime();
          }
          return prev + 1;
        });
      }, 100);
    } else {
      setLockedTime(0);
    }

    return () => clearInterval(interval);
  }, [azimuth, elevation, stage, stagePassed]);

  // --------------------------------------------------------------------------
  // STAGE 3 STATE: SOLAR PANEL DUST CLEANING CANVAS
  // --------------------------------------------------------------------------
  const dustCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cleanPercentage, setCleanPercentage] = useState(0);
  const isCleaningRef = useRef(false);

  const initDustCanvas = useCallback(() => {
    const canvas = dustCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw deep blue solar cells background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw solar grid lines
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    for (let x = 40; x < canvas.width; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 30; y < canvas.height; y += 45) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Now overlay Martian red dust layer with globalCompositeOperation
    const dustLayer = document.createElement('canvas');
    dustLayer.width = canvas.width;
    dustLayer.height = canvas.height;
    const dCtx = dustLayer.getContext('2d');
    if (!dCtx) return;

    // Rich reddish-ochre dust texture
    dCtx.fillStyle = '#993d22';
    dCtx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < 4000; i++) {
      const rx = Math.random() * canvas.width;
      const ry = Math.random() * canvas.height;
      const s = 1 + Math.random() * 3;
      dCtx.fillStyle = Math.random() > 0.5 ? '#b85435' : '#732a15';
      dCtx.fillRect(rx, ry, s, s);
    }

    ctx.drawImage(dustLayer, 0, 0);
    setCleanPercentage(0);
  }, []);

  useEffect(() => {
    if (stage === 3) {
      setTimeout(initDustCanvas, 50);
    }
  }, [stage, initDustCanvas]);

  const cleanAtPoint = (x: number, y: number) => {
    const canvas = dustCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Erase circular patch of dust by drawing underlying solar cell pattern
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, 26, 0, Math.PI * 2);
    ctx.clip();

    // Redraw solar cell blue background in clipped area
    ctx.fillStyle = '#0f2442';
    ctx.fillRect(x - 30, y - 30, 60, 60);

    // Subtle grid lines
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 20, y - 20, 40, 40);

    ctx.restore();

    // Estimate cleared percentage
    setCleanPercentage((prev) => {
      const next = Math.min(100, prev + 1.2);
      if (next >= 85 && !stagePassed) {
        setStagePassed(true);
        playSuccessChime();
        if (onComplete) onComplete();
      }
      return Math.round(next);
    });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isCleaningRef.current = true;
    const canvas = dustCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    cleanAtPoint((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isCleaningRef.current) return;
    const canvas = dustCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    cleanAtPoint((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
  };

  const handlePointerUp = () => {
    isCleaningRef.current = false;
  };

  const handleNextStage = () => {
    playSignalPing(800);
    setStagePassed(false);
    setShowHint(false);

    if (stage === 1) {
      setStage(2);
    } else if (stage === 2) {
      setStage(3);
    } else if (stage === 3) {
      setMissionComplete(true);
    }
  };

  const handleRestartMission = () => {
    playSignalPing(750);
    setStage(1);
    setStagePassed(false);
    setShowHint(false);
    setMissionComplete(false);
    setAzimuth(120);
    setElevation(15);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 py-2 sm:py-3 h-[calc(100vh-68px)] max-h-[860px] flex flex-col justify-between overflow-hidden">
      {/* Top Header & Stage Tabs */}
      <div className="shrink-0 flex items-center justify-between gap-3 pb-2.5 mb-2 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHub}
            className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#FFC66D] hover:text-[#F5F0E8] transition-colors uppercase tracking-wider cursor-pointer"
          >
            <span>←</span>
            <span>PLAY HUB</span>
          </button>
          <span className="text-white/20 hidden sm:inline">|</span>
          <span className="font-mono text-[11px] text-[#C8D8EA] hidden sm:inline">MISSION REPAIR CONSOLE</span>
        </div>

        {/* Stage Progress Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {[
            { num: 1, title: 'Power Circuit' },
            { num: 2, title: 'Comms Carrier' },
            { num: 3, title: 'Solar Array' },
          ].map((s) => (
            <div
              key={s.num}
              className={`px-2.5 py-1 rounded-lg border text-center transition-all ${
                stage === s.num
                  ? 'bg-[#1B284A] border-[#FFC66D] text-[#F5F0E8] shadow-md'
                  : stage > s.num
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                  : 'bg-black/30 border-white/5 text-[#C8D8EA]/40'
              }`}
            >
              <div className="font-mono text-[9px] uppercase font-bold tracking-wider">
                {stage > s.num ? `✓ 0${s.num}` : `0${s.num}`}
                <span className="hidden md:inline ml-1 font-normal font-sans text-[10px]">{s.title}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
            missionComplete
              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500'
              : 'bg-[#FFC66D]/20 text-[#FFC66D] border border-[#FFC66D]/50'
          }`}>
            {missionComplete ? '● NOMINAL' : `● STAGE ${stage}/3`}
          </span>
        </div>
      </div>

      {!missionComplete ? (
        <div className="flex-1 min-h-0 flex flex-col justify-center p-4 sm:p-6 rounded-2xl bg-[#111A35]/90 border border-white/10 shadow-2xl backdrop-blur-xl overflow-y-auto">
          {/* ------------------------------------------------------------- */}
          {/* STAGE 1: CIRCUIT ROTATION PUZZLE */}
          {/* ------------------------------------------------------------- */}
          {stage === 1 && (
            <div className="max-w-2xl mx-auto w-full flex flex-col justify-between h-full">
              <div className="flex items-center justify-between gap-2 shrink-0 mb-2">
                <div>
                  <span className="font-mono text-[10px] text-[#FFC66D] uppercase tracking-widest font-bold">
                    STAGE 1 // ELECTRICAL ENGINEERING
                  </span>
                  <h2 className="font-display text-xl sm:text-2xl text-[#F5F0E8] leading-tight">Restore the Power Circuit</h2>
                  <p className="text-xs text-[#C8D8EA] font-light mt-0.5">
                    Rotate tiles to connect the <strong>Inlet (Top-Left)</strong> to the <strong>Computer Bus (Bottom-Right)</strong>.
                  </p>
                </div>

                <button
                  onClick={() => setShowHint(!showHint)}
                  className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-[#FFC66D] cursor-pointer shrink-0"
                >
                  💡 {showHint ? 'Hide' : 'Hint'}
                </button>
              </div>

              {showHint && (
                <div className="mb-2 p-2.5 rounded-xl bg-[#FFC66D]/10 border border-[#FFC66D]/30 text-[11px] text-[#F5F0E8] font-light leading-snug shrink-0">
                  <strong>Engineering Hint:</strong> Current enters tile 0 from the left. Route through adjacent junctions until wires connect to tile 8’s right bus output.
                </div>
              )}

              {/* 3x3 Tile Grid */}
              <div className="relative max-w-[270px] sm:max-w-[300px] mx-auto p-3.5 rounded-2xl bg-black/70 border border-white/15 shadow-inner my-auto">
                <div className="absolute -left-5 top-6 px-1.5 py-0.5 bg-[#FFC66D] text-[#080B1D] font-mono text-[8px] font-bold rounded uppercase">
                  IN ➔
                </div>
                <div className="absolute -right-5 bottom-6 px-1.5 py-0.5 bg-emerald-400 text-[#080B1D] font-mono text-[8px] font-bold rounded uppercase">
                  BUS ➔
                </div>

                <div className="grid grid-cols-3 gap-2 aspect-square">
                  {tiles.map((tile, idx) => {
                    const isActive = activeCircuitPath.includes(tile.id);
                    const ports = getActivePorts(tile);

                    return (
                      <button
                        key={tile.id}
                        onClick={() => handleRotateTile(idx)}
                        className={`relative rounded-xl border flex items-center justify-center p-1.5 transition-all cursor-pointer aspect-square ${
                          isActive
                            ? 'bg-[#FFC66D]/20 border-[#FFC66D] shadow-[0_0_12px_rgba(255,198,109,0.35)]'
                            : 'bg-black/50 border-white/10 hover:border-white/30'
                        }`}
                      >
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="12"
                            fill={isActive ? '#FFC66D' : '#475569'}
                          />
                          {ports[0] && (
                            <rect
                              x="44"
                              y="0"
                              width="12"
                              height="50"
                              fill={isActive ? '#FFC66D' : '#475569'}
                            />
                          )}
                          {ports[1] && (
                            <rect
                              x="50"
                              y="44"
                              width="50"
                              height="12"
                              fill={isActive ? '#FFC66D' : '#475569'}
                            />
                          )}
                          {ports[2] && (
                            <rect
                              x="44"
                              y="50"
                              width="12"
                              height="50"
                              fill={isActive ? '#FFC66D' : '#475569'}
                            />
                          )}
                          {ports[3] && (
                            <rect
                              x="0"
                              y="44"
                              width="50"
                              height="12"
                              fill={isActive ? '#FFC66D' : '#475569'}
                            />
                          )}
                        </svg>

                        <span className="absolute bottom-0.5 right-1 text-[8px] font-mono text-[#C8D8EA]/40">
                          ↻
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-2 text-center shrink-0">
                {stagePassed ? (
                  <div className="space-y-1.5 animate-fadeIn">
                    <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-500 text-emerald-200 text-xs font-mono">
                      ⚡ POWER CONTINUITY ESTABLISHED // MAIN COMPUTER ONLINE
                    </div>
                    <button
                      onClick={handleNextStage}
                      className="px-5 py-2 rounded-xl bg-[#FFC66D] hover:bg-[#ffe09e] text-[#080B1D] font-sans text-xs font-bold uppercase tracking-wider shadow-lg cursor-pointer"
                    >
                      ADVANCE TO STAGE 2: COMMS LOCK ➔
                    </button>
                  </div>
                ) : (
                  <div className="text-xs font-mono text-[#C8D8EA]">
                    ACTIVE CONDUIT NODES: <span className="text-[#FFC66D] font-bold">{activeCircuitPath.length}/9</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* STAGE 2: ANTENNA ALIGNMENT CHALLENGE */}
          {/* ------------------------------------------------------------- */}
          {stage === 2 && (
            <div className="max-w-3xl mx-auto w-full flex flex-col justify-between h-full">
              <div className="flex items-center justify-between gap-2 shrink-0 mb-2">
                <div>
                  <span className="font-mono text-[10px] text-[#58D9FF] uppercase tracking-widest font-bold">
                    STAGE 2 // TELECOMMUNICATIONS
                  </span>
                  <h2 className="font-display text-xl sm:text-2xl text-[#F5F0E8] leading-tight">Align the Radio Antenna</h2>
                  <p className="text-xs text-[#C8D8EA] font-light mt-0.5">
                    Adjust <strong>Azimuth</strong> and <strong>Elevation</strong> to calibrate dish lock onto Deep Space Network carrier wave.
                  </p>
                </div>

                <button
                  onClick={() => setShowHint(!showHint)}
                  className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-[#58D9FF] cursor-pointer shrink-0"
                >
                  💡 {showHint ? 'Hide' : 'Target'}
                </button>
              </div>

              {showHint && (
                <div className="mb-2 p-2.5 rounded-xl bg-[#58D9FF]/10 border border-[#58D9FF]/30 text-[11px] text-[#F5F0E8] font-light leading-snug shrink-0">
                  <strong>DSN Ephemeris:</strong> Target Azimuth is ~<strong>214°</strong>, Elevation is ~<strong>46°</strong>. Hold lock &gt;95%.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center my-auto">
                {/* Oscilloscope */}
                <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2 text-center">
                  <span className="font-mono text-[9px] uppercase text-[#58D9FF] block tracking-wider font-bold">
                    CARRIER WAVE OSCILLOSCOPE
                  </span>

                  <div className="h-20 rounded-xl bg-black border border-emerald-500/30 flex items-center justify-center p-2 relative overflow-hidden">
                    <svg className="w-full h-full" viewBox="0 0 200 60">
                      <path
                        d={`M 0 30 Q 25 ${30 - signalStrength * 0.25}, 50 30 T 100 30 T 150 30 T 200 30`}
                        fill="none"
                        stroke={signalStrength > 90 ? '#64E5C0' : signalStrength > 50 ? '#58D9FF' : '#475569'}
                        strokeWidth="2.5"
                      />
                    </svg>
                    <span className="absolute bottom-1.5 right-2 font-mono text-[9px] text-emerald-400">
                      {signalStrength}% SYNC
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-mono text-[11px] text-[#C8D8EA]">
                      <span>SIGNAL LOCK:</span>
                      <span className={`font-bold ${signalStrength > 90 ? 'text-emerald-400' : 'text-[#58D9FF]'}`}>
                        {signalStrength}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden border border-white/10">
                      <div
                        className={`h-full transition-all duration-150 ${
                          signalStrength > 90 ? 'bg-emerald-400' : 'bg-[#58D9FF]'
                        }`}
                        style={{ width: `${signalStrength}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Sliders */}
                <div className="space-y-4 p-4 rounded-2xl bg-black/40 border border-white/10">
                  <div>
                    <div className="flex justify-between font-mono text-xs text-[#F5F0E8] mb-1">
                      <span>AZIMUTH (0° – 360°)</span>
                      <span className="text-[#58D9FF] font-bold">{azimuth}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={azimuth}
                      onChange={(e) => setAzimuth(Number(e.target.value))}
                      disabled={stagePassed}
                      className="w-full accent-[#58D9FF] cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-mono text-xs text-[#F5F0E8] mb-1">
                      <span>ELEVATION (0° – 90°)</span>
                      <span className="text-[#58D9FF] font-bold">{elevation}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="90"
                      value={elevation}
                      onChange={(e) => setElevation(Number(e.target.value))}
                      disabled={stagePassed}
                      className="w-full accent-[#58D9FF] cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-2 text-center shrink-0">
                {stagePassed ? (
                  <div className="space-y-1.5 animate-fadeIn">
                    <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-500 text-emerald-200 text-xs font-mono">
                      📡 DSN CARRIER SYNCHRONIZED // DOWNLINK TELEMETRY SECURED
                    </div>
                    <button
                      onClick={handleNextStage}
                      className="px-5 py-2 rounded-xl bg-[#FFC66D] hover:bg-[#ffe09e] text-[#080B1D] font-sans text-xs font-bold uppercase tracking-wider shadow-lg cursor-pointer"
                    >
                      ADVANCE TO STAGE 3: SOLAR SWEEP ➔
                    </button>
                  </div>
                ) : (
                  <div className="text-xs font-mono text-[#C8D8EA]">
                    LOCK HOLD TIME: <span className="text-[#58D9FF] font-bold">{Math.min(100, Math.round((lockedTime / 15) * 100))}%</span> (Hold at 95%+ to complete)
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* STAGE 3: SOLAR PANEL DUST SWEEP */}
          {/* ------------------------------------------------------------- */}
          {stage === 3 && (
            <div className="max-w-2xl mx-auto w-full flex flex-col justify-between h-full">
              <div className="flex items-center justify-between gap-2 shrink-0 mb-2">
                <div>
                  <span className="font-mono text-[10px] text-[#FF8D7B] uppercase tracking-widest font-bold">
                    STAGE 3 // SURFACE OPERATIONS
                  </span>
                  <h2 className="font-display text-xl sm:text-2xl text-[#F5F0E8] leading-tight">Sweep the Solar Array</h2>
                  <p className="text-xs text-[#C8D8EA] font-light mt-0.5">
                    Drag across the canvas to clear iron oxide dust and restore photovoltaic current.
                  </p>
                </div>

                <div className="bg-black/50 px-3 py-1 rounded-xl border border-white/10 text-right shrink-0">
                  <span className="text-[9px] font-mono text-[#C8D8EA] uppercase block">CLEARED</span>
                  <span className="font-display text-lg text-[#FFC66D] leading-none font-bold">
                    {cleanPercentage}%
                  </span>
                </div>
              </div>

              {/* Dust Canvas */}
              <div className="max-w-[340px] sm:max-w-[380px] mx-auto rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black relative touch-none select-none my-auto">
                <canvas
                  ref={dustCanvasRef}
                  width={400}
                  height={260}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  className="w-full h-auto block cursor-crosshair"
                />
                <div className="absolute top-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[9px] font-mono text-[#C8D8EA] pointer-events-none">
                  🧹 Drag across to wipe away dust
                </div>
              </div>

              <div className="mt-2 text-center shrink-0">
                {stagePassed ? (
                  <div className="space-y-1.5 animate-fadeIn">
                    <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-500 text-emerald-200 text-xs font-mono">
                      ☀️ SOLAR PANELS UNCOVERED // POWER CHARGED TO 100%
                    </div>
                    <button
                      onClick={handleNextStage}
                      className="px-5 py-2 rounded-xl bg-[#FFC66D] hover:bg-[#ffe09e] text-[#080B1D] font-sans text-xs font-bold uppercase tracking-wider shadow-lg cursor-pointer"
                    >
                      CONCLUDE MISSION REPAIR ➔
                    </button>
                  </div>
                ) : (
                  <div className="text-xs font-mono text-[#C8D8EA]">
                    RESTORATION THRESHOLD: <span className="text-[#FFC66D] font-bold">85% Required</span> ({cleanPercentage}% Cleared)
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Final Victory Screen */
        <div className="flex-1 min-h-0 flex flex-col justify-center items-center p-6 sm:p-10 rounded-2xl bg-[#111A35]/95 border border-emerald-500/50 shadow-2xl backdrop-blur-xl text-center space-y-4 my-auto animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-3xl mx-auto shadow-xl">
            🛠️
          </div>

          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold block mb-1">
              ALL THREE ENGINEERING REPAIRS VERIFIED
            </span>
            <h2 className="font-display text-2xl sm:text-3xl text-[#F5F0E8]">
              Spacecraft Fully Restored
            </h2>
            <p className="text-xs sm:text-sm text-[#C8D8EA] max-w-md mx-auto font-light leading-relaxed mt-2">
              Congratulations! You successfully re-routed the circuit bus, locked telemetry onto the Deep Space Network carrier wave, and wiped clean the photovoltaic array. The explorer is once again transmitting active science data back to Earth.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3 border-t border-white/10">
            <button
              onClick={handleRestartMission}
              className="px-5 py-2.5 rounded-xl bg-[#FFC66D] hover:bg-[#ffe09e] text-[#080B1D] font-sans text-xs font-bold tracking-widest uppercase transition-all shadow-lg cursor-pointer"
            >
              PLAY REPAIR CHALLENGE AGAIN ➔
            </button>
            <button
              onClick={onBackToHub}
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-[#F5F0E8] border border-white/10 transition-all font-sans text-xs font-medium uppercase tracking-wider cursor-pointer"
            >
              RETURN TO ARCADE HUB
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
