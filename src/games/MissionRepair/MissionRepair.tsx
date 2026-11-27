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
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-6 mb-8 border-b border-white/10">
        <button
          onClick={onBackToHub}
          className="inline-flex items-center gap-2 font-mono text-xs text-[#C6A36B] hover:text-[#F0E8D9] transition-colors uppercase tracking-wider cursor-pointer"
        >
          <span>←</span>
          <span>RETURN TO PLAY HUB</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-[#B6C0CC]">SYSTEM STATUS:</span>
          <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
            missionComplete
              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500'
              : 'bg-[#C6A36B]/20 text-[#C6A36B] border border-[#C6A36B]/50'
          }`}>
            {missionComplete ? '● ALL SYSTEMS NOMINAL' : `● REPAIR IN PROGRESS (STAGE ${stage}/3)`}
          </span>
        </div>
      </div>

      {!missionComplete ? (
        <div className="space-y-6">
          {/* Stage Progress Tabs */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { num: 1, title: 'Power Circuit Routing' },
              { num: 2, title: 'Comms Carrier Lock' },
              { num: 3, title: 'Solar Array Dust Sweep' },
            ].map((s) => (
              <div
                key={s.num}
                className={`p-3.5 rounded-2xl border text-center transition-all ${
                  stage === s.num
                    ? 'bg-[#101A29] border-[#C6A36B] text-[#F0E8D9] shadow-lg'
                    : stage > s.num
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-black/20 border-white/5 text-[#B6C0CC]/50'
                }`}
              >
                <div className="font-mono text-[10px] uppercase font-bold">
                  {stage > s.num ? '✓ PASSED' : `STAGE 0${s.num}`}
                </div>
                <div className="font-sans text-xs sm:text-sm font-medium mt-0.5">{s.title}</div>
              </div>
            ))}
          </div>

          {/* Active Stage Box */}
          <div className="p-8 sm:p-10 rounded-3xl bg-[#101A29]/90 border border-white/10 shadow-2xl backdrop-blur-xl">
            {/* ------------------------------------------------------------- */}
            {/* STAGE 1: CIRCUIT ROTATION PUZZLE */}
            {/* ------------------------------------------------------------- */}
            {stage === 1 && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                  <div>
                    <span className="font-mono text-[10px] text-[#C6A36B] uppercase tracking-widest font-bold">
                      STAGE 1 // ELECTRICAL ENGINEERING
                    </span>
                    <h2 className="font-display text-2xl text-[#F0E8D9]">Restore the Power Circuit</h2>
                    <p className="text-xs text-[#B6C0CC] font-light mt-1">
                      Click or tap the tiles to rotate junction conduits. Connect the <strong>Solar Generator (Top-Left)</strong> to the <strong>Main Computer Bus (Bottom-Right)</strong>.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-[#C6A36B] cursor-pointer"
                  >
                    💡 {showHint ? 'Hide Hint' : 'Show Hint'}
                  </button>
                </div>

                {showHint && (
                  <div className="mb-6 p-4 rounded-2xl bg-[#C6A36B]/10 border border-[#C6A36B]/30 text-xs text-[#F0E8D9] font-light leading-relaxed">
                    <strong>Engineering Hint:</strong> Current enters tile 0 from the left (West). Trace the pathway through the outer perimeter or center tee junction until wire lines seamlessly connect to tile 8’s right exit.
                  </div>
                )}

                {/* 3x3 Tile Grid */}
                <div className="relative max-w-sm mx-auto p-4 rounded-3xl bg-black/60 border border-white/15 shadow-inner">
                  {/* Power Inlet Indicator */}
                  <div className="absolute -left-6 top-8 px-2 py-1 bg-[#C6A36B] text-[#080D16] font-mono text-[9px] font-bold rounded uppercase">
                    INLET ➔
                  </div>
                  {/* Bus Outlet Indicator */}
                  <div className="absolute -right-6 bottom-8 px-2 py-1 bg-emerald-500 text-[#080D16] font-mono text-[9px] font-bold rounded uppercase">
                    BUS ➔
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 aspect-square">
                    {tiles.map((tile, idx) => {
                      const isActive = activeCircuitPath.includes(tile.id);
                      const ports = getActivePorts(tile);

                      return (
                        <button
                          key={tile.id}
                          onClick={() => handleRotateTile(idx)}
                          className={`relative rounded-2xl border flex items-center justify-center p-2 transition-all cursor-pointer aspect-square ${
                            isActive
                              ? 'bg-[#C6A36B]/20 border-[#C6A36B] shadow-[0_0_15px_rgba(198,163,107,0.3)]'
                              : 'bg-black/50 border-white/10 hover:border-white/30'
                          }`}
                        >
                          <svg className="w-full h-full" viewBox="0 0 100 100">
                            {/* Base center hub */}
                            <circle
                              cx="50"
                              cy="50"
                              r="12"
                              fill={isActive ? '#C6A36B' : '#475569'}
                            />
                            {/* North Wire */}
                            {ports[0] && (
                              <rect
                                x="44"
                                y="0"
                                width="12"
                                height="50"
                                fill={isActive ? '#C6A36B' : '#475569'}
                              />
                            )}
                            {/* East Wire */}
                            {ports[1] && (
                              <rect
                                x="50"
                                y="44"
                                width="50"
                                height="12"
                                fill={isActive ? '#C6A36B' : '#475569'}
                              />
                            )}
                            {/* South Wire */}
                            {ports[2] && (
                              <rect
                                x="44"
                                y="50"
                                width="12"
                                height="50"
                                fill={isActive ? '#C6A36B' : '#475569'}
                              />
                            )}
                            {/* West Wire */}
                            {ports[3] && (
                              <rect
                                x="0"
                                y="44"
                                width="50"
                                height="12"
                                fill={isActive ? '#C6A36B' : '#475569'}
                              />
                            )}
                          </svg>

                          <span className="absolute bottom-1 right-1.5 text-[9px] font-mono text-[#B6C0CC]/40">
                            ↻
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-8 text-center">
                  {stagePassed ? (
                    <div className="space-y-3 animate-fadeIn">
                      <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500 text-emerald-200 text-xs font-mono">
                        ⚡ POWER CONTINUITY ESTABLISHED // MAIN COMPUTER ONLINE
                      </div>
                      <button
                        onClick={handleNextStage}
                        className="px-6 py-3 rounded-xl bg-[#C6A36B] hover:bg-[#d8b57d] text-[#080D16] font-sans text-xs font-bold uppercase tracking-wider shadow-lg cursor-pointer"
                      >
                        ADVANCE TO STAGE 2: COMMS LOCK ➔
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs font-mono text-[#B6C0CC]">
                      ACTIVE CONDUIT NODES: <span className="text-[#C6A36B] font-bold">{activeCircuitPath.length}/9</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STAGE 2: ANTENNA ALIGNMENT CHALLENGE */}
            {/* ------------------------------------------------------------- */}
            {stage === 2 && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                  <div>
                    <span className="font-mono text-[10px] text-[#38bdf8] uppercase tracking-widest font-bold">
                      STAGE 2 // TELECOMMUNICATIONS
                    </span>
                    <h2 className="font-display text-2xl text-[#F0E8D9]">Align the Radio Antenna</h2>
                    <p className="text-xs text-[#B6C0CC] font-light mt-1">
                      Adjust <strong>Azimuth</strong> and <strong>Elevation</strong> to calibrate the parabolic high-gain dish onto NASA’s Deep Space Network carrier wave.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-[#38bdf8] cursor-pointer"
                  >
                    💡 {showHint ? 'Hide Coordinates' : 'Show Ephemeris Target'}
                  </button>
                </div>

                {showHint && (
                  <div className="mb-6 p-4 rounded-2xl bg-[#38bdf8]/10 border border-[#38bdf8]/30 text-xs text-[#F0E8D9] font-light leading-relaxed">
                    <strong>DSN Goldstone Ephemeris:</strong> Target Azimuth is approximately <strong>214°</strong>, Elevation is approximately <strong>46°</strong>. Tune dials until signal lock exceeds 95%.
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  {/* Signal Oscilloscope & Lock Meter */}
                  <div className="p-6 rounded-3xl bg-black/60 border border-white/10 space-y-4 text-center">
                    <span className="font-mono text-[10px] uppercase text-[#38bdf8] block tracking-wider font-bold">
                      CARRIER WAVE OSCILLOSCOPE
                    </span>

                    {/* Simulated Waveform Box */}
                    <div className="h-28 rounded-2xl bg-black border border-emerald-500/30 flex items-center justify-center p-3 relative overflow-hidden">
                      <svg className="w-full h-full" viewBox="0 0 200 60">
                        <path
                          d={`M 0 30 Q 25 ${30 - signalStrength * 0.25}, 50 30 T 100 30 T 150 30 T 200 30`}
                          fill="none"
                          stroke={signalStrength > 90 ? '#10b981' : signalStrength > 50 ? '#38bdf8' : '#64748b'}
                          strokeWidth="2.5"
                        />
                      </svg>
                      <span className="absolute bottom-2 right-3 font-mono text-[10px] text-emerald-400">
                        {signalStrength}% CARRIER SYNC
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between font-mono text-xs text-[#B6C0CC]">
                        <span>SIGNAL LOCK:</span>
                        <span className={`font-bold ${signalStrength > 90 ? 'text-emerald-400' : 'text-[#38bdf8]'}`}>
                          {signalStrength}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden border border-white/10">
                        <div
                          className={`h-full transition-all duration-150 ${
                            signalStrength > 90 ? 'bg-emerald-400' : 'bg-[#38bdf8]'
                          }`}
                          style={{ width: `${signalStrength}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dual Sliders / Dials */}
                  <div className="space-y-5 p-6 rounded-3xl bg-black/40 border border-white/10">
                    <div>
                      <div className="flex justify-between font-mono text-xs text-[#F0E8D9] mb-1.5">
                        <span>AZIMUTH ANGLE (0° – 360°)</span>
                        <span className="text-[#38bdf8] font-bold">{azimuth}°</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={azimuth}
                        onChange={(e) => setAzimuth(Number(e.target.value))}
                        disabled={stagePassed}
                        className="w-full accent-[#38bdf8] cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs text-[#F0E8D9] mb-1.5">
                        <span>ELEVATION ANGLE (0° – 90°)</span>
                        <span className="text-[#38bdf8] font-bold">{elevation}°</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="90"
                        value={elevation}
                        onChange={(e) => setElevation(Number(e.target.value))}
                        disabled={stagePassed}
                        className="w-full accent-[#38bdf8] cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  {stagePassed ? (
                    <div className="space-y-3 animate-fadeIn">
                      <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500 text-emerald-200 text-xs font-mono">
                        📡 DSN CARRIER SYNCHRONIZED // DOWNLINK TELEMETRY SECURED
                      </div>
                      <button
                        onClick={handleNextStage}
                        className="px-6 py-3 rounded-xl bg-[#C6A36B] hover:bg-[#d8b57d] text-[#080D16] font-sans text-xs font-bold uppercase tracking-wider shadow-lg cursor-pointer"
                      >
                        ADVANCE TO STAGE 3: SOLAR SWEEP ➔
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs font-mono text-[#B6C0CC]">
                      LOCK HOLD TIME: <span className="text-[#38bdf8] font-bold">{Math.min(100, Math.round((lockedTime / 15) * 100))}%</span> (Hold at 95%+ to complete)
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STAGE 3: SOLAR PANEL DUST SWEEP */}
            {/* ------------------------------------------------------------- */}
            {stage === 3 && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                  <div>
                    <span className="font-mono text-[10px] text-[#f59e0b] uppercase tracking-widest font-bold">
                      STAGE 3 // SURFACE OPERATIONS
                    </span>
                    <h2 className="font-display text-2xl text-[#F0E8D9]">Sweep the Solar Array</h2>
                    <p className="text-xs text-[#B6C0CC] font-light mt-1">
                      A global Martian dust storm covered the photovoltaic panels in red iron oxide. <strong>Click, drag, or swipe</strong> across the canvas to clear the dust and restore solar power.
                    </p>
                  </div>

                  <div className="bg-black/40 px-4 py-2 rounded-xl border border-white/10 text-right">
                    <span className="text-[10px] font-mono text-[#B6C0CC] uppercase block">CLEARED AREA</span>
                    <span className="font-display text-xl text-[#C6A36B] leading-none font-bold">
                      {cleanPercentage}%
                    </span>
                  </div>
                </div>

                {/* Dust Canvas */}
                <div className="max-w-md mx-auto rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-black relative touch-none select-none">
                  <canvas
                    ref={dustCanvasRef}
                    width={400}
                    height={280}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    className="w-full h-auto block cursor-crosshair"
                  />
                  <div className="absolute top-3 left-3 bg-black/60 px-2.5 py-1 rounded-md text-[10px] font-mono text-[#B6C0CC] pointer-events-none">
                    🧹 Drag across to wipe away dust
                  </div>
                </div>

                <div className="mt-8 text-center">
                  {stagePassed ? (
                    <div className="space-y-3 animate-fadeIn">
                      <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500 text-emerald-200 text-xs font-mono">
                        ☀️ SOLAR PANELS UNCOVERED // POWER CHARGED TO 100%
                      </div>
                      <button
                        onClick={handleNextStage}
                        className="px-6 py-3 rounded-xl bg-[#C6A36B] hover:bg-[#d8b57d] text-[#080D16] font-sans text-xs font-bold uppercase tracking-wider shadow-lg cursor-pointer"
                      >
                        CONCLUDE MISSION REPAIR ➔
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs font-mono text-[#B6C0CC]">
                      RESTORATION THRESHOLD: <span className="text-[#C6A36B] font-bold">85% Required</span> ({cleanPercentage}% Cleared)
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Final Victory Screen */
        <div className="p-10 sm:p-14 rounded-3xl bg-[#101A29]/95 border border-emerald-500/50 shadow-2xl backdrop-blur-xl text-center space-y-8 animate-fadeIn">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-4xl mx-auto shadow-xl">
            🛠️
          </div>

          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold block mb-2">
              ALL THREE ENGINEERING REPAIRS VERIFIED
            </span>
            <h2 className="font-display text-3xl sm:text-4xl text-[#F0E8D9]">
              Spacecraft Fully Restored
            </h2>
            <p className="text-sm text-[#B6C0CC] max-w-lg mx-auto font-light leading-relaxed mt-3">
              Congratulations! You successfully re-routed the circuit bus, locked telemetry onto the Deep Space Network carrier wave, and wiped clean the photovoltaic array. The explorer is once again transmitting active science data back to Earth.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-white/10">
            <button
              onClick={handleRestartMission}
              className="px-6 py-3 rounded-xl bg-[#C6A36B] hover:bg-[#d8b57d] text-[#080D16] font-sans text-xs font-bold tracking-widest uppercase transition-all shadow-lg cursor-pointer"
            >
              PLAY REPAIR CHALLENGE AGAIN ➔
            </button>
            <button
              onClick={onBackToHub}
              className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/15 text-[#F0E8D9] border border-white/10 transition-all font-sans text-xs font-medium uppercase tracking-wider cursor-pointer"
            >
              RETURN TO ARCADE HUB
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
