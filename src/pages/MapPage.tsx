import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { artifacts } from '../data/artifacts';
import type { ArtifactData } from '../types';
import { useAppStore } from '../store/useAppStore';
import { playSignalPing } from '../utils/audio';
import { formatCoordinates, getCoordinateSemanticLabel } from '../utils/coordinateUtils';

interface CanvasArtifact extends ArtifactData {
  orbitRadius: number;
  angle: number;
  renderX?: number;
  renderY?: number;
}

export const MapPage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const navigate = useNavigate();
  const { markVisited } = useAppStore();

  const [filterDest, setFilterDest] = useState<'all' | 'moon' | 'mars' | 'deep-space'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'silent' | 'ghost'>('all');
  const [hoveredArtifact, setHoveredArtifact] = useState<ArtifactData | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [viewMode, setViewMode] = useState<'radar' | 'table'>('radar');

  // Map each artifact to an orbital radius and fixed angular position for visualization
  const mapArtifacts: CanvasArtifact[] = artifacts.map((art, index) => {
    let orbitRadius = 120;
    if (art.destination === 'moon') {
      orbitRadius = 130 + (index % 3) * 15;
    } else if (art.destination === 'mars') {
      orbitRadius = 260 + (index % 4) * 20;
    } else {
      orbitRadius = 400 + (index % 3) * 35;
    }

    const angle = ((index * 137.5) % 360) * (Math.PI / 180);
    return {
      ...art,
      orbitRadius,
      angle,
    };
  });

  const filteredArtifacts = mapArtifacts.filter((item) => {
    if (filterDest !== 'all' && item.destination !== filterDest) return false;
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    return true;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 650);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || 650;
    };
    window.addEventListener('resize', handleResize);

    let t = 0;
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Save transform
      ctx.save();
      const cx = width / 2 + panOffset.x;
      const cy = height / 2 + panOffset.y;

      ctx.translate(cx, cy);
      ctx.scale(zoomLevel, zoomLevel);

      // Deep space radial glow at center (midnight navy to near-black)
      const centerGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 500);
      centerGrad.addColorStop(0, 'rgba(16, 26, 41, 0.7)');
      centerGrad.addColorStop(0.5, 'rgba(8, 13, 22, 0.4)');
      centerGrad.addColorStop(1, 'rgba(8, 13, 22, 0)');
      ctx.fillStyle = centerGrad;
      ctx.fillRect(-600, -600, 1200, 1200);

      // Draw Orbit Rings with labels
      const rings = [
        { r: 140, label: 'LUNAR DOMAIN (384,400 KM)', color: 'rgba(182, 192, 204, 0.2)' },
        { r: 280, label: 'MARTIAN ORBIT (~225M KM)', color: 'rgba(198, 163, 107, 0.25)' },
        { r: 440, label: 'DEEP SPACE & INTERSTELLAR (>6B KM)', color: 'rgba(120, 156, 184, 0.25)' },
      ];

      rings.forEach((ring) => {
        ctx.beginPath();
        ctx.arc(0, 0, ring.r, 0, Math.PI * 2);
        ctx.strokeStyle = ring.color;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 8]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Label on ring
        ctx.fillStyle = ring.color.replace('0.25', '0.7').replace('0.2', '0.6');
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillText(ring.label, ring.r + 8, -4);
      });

      // Central Sol
      const sunPulse = 1 + 0.03 * Math.sin(t * 1.5);
      const sunGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 45 * sunPulse);
      sunGrad.addColorStop(0, '#FFFBE0');
      sunGrad.addColorStop(0.3, '#C6A36B');
      sunGrad.addColorStop(0.7, 'rgba(198, 163, 107, 0.2)');
      sunGrad.addColorStop(1, 'rgba(198, 163, 107, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 45 * sunPulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFDF0';
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#C6A36B';
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw Artifacts
      filteredArtifacts.forEach((item) => {
        const wobble = Math.sin(t * 0.4 + item.angle) * 0.012;
        const currentAngle = item.angle + wobble;

        const x = Math.cos(currentAngle) * item.orbitRadius;
        const y = Math.sin(currentAngle) * item.orbitRadius;

        item.renderX = cx + x * zoomLevel;
        item.renderY = cy + y * zoomLevel;

        const isHovered = hoveredArtifact?.id === item.id;
        const itemColor =
          item.status === 'active'
            ? '#789CB8'
            : item.status === 'silent'
            ? '#C6A36B'
            : '#B6C0CC';

        // Subtle gold trail for silent relics
        if (item.status === 'silent') {
          for (let trailStep = 1; trailStep <= 4; trailStep++) {
            const trailAngle = currentAngle - trailStep * 0.035;
            const tx = Math.cos(trailAngle) * item.orbitRadius;
            const ty = Math.sin(trailAngle) * item.orbitRadius;
            ctx.beginPath();
            ctx.arc(tx, ty, 2 - trailStep * 0.35, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(198, 163, 107, ${0.25 - trailStep * 0.05})`;
            ctx.fill();
          }
        }

        // Pulse radar for active spacecraft
        if (item.status === 'active') {
          const pulse = (Math.sin(t * 2.5 + item.angle * 3) + 1) / 2;
          ctx.beginPath();
          ctx.arc(x, y, 5 + pulse * 12, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(120, 156, 184, ${0.5 - pulse * 0.4})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }

        // Relic node
        ctx.save();
        ctx.shadowBlur = isHovered ? 20 : item.status === 'active' ? 10 : 6;
        ctx.shadowColor = itemColor;
        ctx.fillStyle = itemColor;
        ctx.beginPath();
        ctx.arc(x, y, isHovered ? 5.5 : item.status === 'active' ? 4 : 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Label for hovered or key artifacts
        if (isHovered || ['opportunity-rover', 'voyager-1', 'eagle-descent-stage'].includes(item.id)) {
          ctx.font = isHovered ? 'bold 11px Inter, sans-serif' : '10px JetBrains Mono, monospace';
          ctx.fillStyle = isHovered ? '#F0E8D9' : 'rgba(182, 192, 204, 0.7)';
          ctx.fillText(item.name, x + 8, y + 3);
        }
      });

      ctx.restore();
      t += 0.016;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [filteredArtifacts, zoomLevel, panOffset, hoveredArtifact]);

  // Mouse interaction
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isDragging) {
      setPanOffset({
        x: panOffset.x + (mouseX - dragStart.x),
        y: panOffset.y + (mouseY - dragStart.y),
      });
      setDragStart({ x: mouseX, y: mouseY });
      return;
    }

    // Hit test artifacts
    let matched: ArtifactData | null = null;
    for (const item of filteredArtifacts) {
      if (item.renderX !== undefined && item.renderY !== undefined) {
        const dist = Math.hypot(mouseX - item.renderX, mouseY - item.renderY);
        if (dist <= 14) {
          matched = item;
          break;
        }
      }
    }
    setHoveredArtifact(matched);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 0) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (isDragging && e.touches.length > 0) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const touchX = e.touches[0].clientX - rect.left;
      const touchY = e.touches[0].clientY - rect.top;
      setPanOffset({
        x: panOffset.x + (touchX - dragStart.x),
        y: panOffset.y + (touchY - dragStart.y),
      });
      setDragStart({ x: touchX, y: touchY });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredArtifacts.length === 0) return;
    const currentIndex = hoveredArtifact ? filteredArtifacts.findIndex((a) => a.id === hoveredArtifact.id) : -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % filteredArtifacts.length;
      setHoveredArtifact(filteredArtifacts[nextIndex]);
      playSignalPing(700);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + filteredArtifacts.length) % filteredArtifacts.length;
      setHoveredArtifact(filteredArtifacts[prevIndex]);
      playSignalPing(700);
    } else if (e.key === 'Enter' && hoveredArtifact) {
      e.preventDefault();
      playSignalPing(900);
      markVisited(hoveredArtifact.id);
      navigate(`/ghost/${hoveredArtifact.id}`);
    }
  };

  const handleCanvasClick = () => {
    if (hoveredArtifact) {
      playSignalPing(900);
      markVisited(hoveredArtifact.id);
      navigate(`/ghost/${hoveredArtifact.id}`);
    }
  };

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-80px)] flex flex-col">
      {/* Title & Filter bar */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-6 pb-6 border-b border-white/10">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="font-mono text-xs text-[var(--antique-gold)] tracking-widest uppercase font-semibold">
              // HELIOCENTRIC PROJECTION // NASA NSSDCA ARCHIVE
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[var(--mist-grey)] border border-white/10">
              SCHEMATIC MODEL
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-normal text-[var(--warm-ivory)]">
            Solar Graveyard Radar
          </h1>
          <p className="text-xs sm:text-sm text-[var(--mist-grey)] mt-2 font-sans font-light max-w-2xl leading-relaxed">
            A stylized schematic projection of 28 curated landmarks across lunar, Martian, and deep-space orbits. 
            Exact planetary surface coordinates (latitude / longitude) are cataloged in each artifact's archival dossier.
          </p>
        </div>

        {/* View mode toggle and filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Radar vs Table toggle */}
          <div className="flex rounded-xl bg-black/40 p-1 border border-white/10">
            <button
              onClick={() => {
                setViewMode('radar');
                playSignalPing(700);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-sans font-medium transition-all ${
                viewMode === 'radar'
                  ? 'bg-[var(--antique-gold)] text-[var(--near-black)] font-semibold shadow-sm'
                  : 'text-[var(--mist-grey)] hover:text-[var(--warm-ivory)]'
              }`}
            >
              🌐 RADAR
            </button>
            <button
              onClick={() => {
                setViewMode('table');
                playSignalPing(700);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-sans font-medium transition-all ${
                viewMode === 'table'
                  ? 'bg-[var(--antique-gold)] text-[var(--near-black)] font-semibold shadow-sm'
                  : 'text-[var(--mist-grey)] hover:text-[var(--warm-ivory)]'
              }`}
            >
              📋 DATA TABLE
            </button>
          </div>

          {/* Destination tabs */}
          <div className="flex rounded-xl bg-white/5 p-1 border border-white/10">
            {(['all', 'moon', 'mars', 'deep-space'] as const).map((dest) => (
              <button
                key={dest}
                onClick={() => {
                  setFilterDest(dest);
                  playSignalPing(700);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-sans transition-all ${
                  filterDest === dest
                    ? 'bg-white/15 text-[var(--warm-ivory)] font-medium'
                    : 'text-[var(--mist-grey)] hover:text-white'
                }`}
              >
                {dest === 'all'
                  ? 'ALL'
                  : dest === 'moon'
                  ? 'MOON'
                  : dest === 'mars'
                  ? 'MARS'
                  : 'DEEP SPACE'}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex rounded-xl bg-white/5 p-1 border border-white/10">
            {(['all', 'active', 'silent', 'ghost'] as const).map((status) => (
              <button
                key={status}
                onClick={() => {
                  setFilterStatus(status);
                  playSignalPing(600);
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono uppercase transition-all ${
                  filterStatus === status
                    ? 'bg-white/20 text-white font-medium'
                    : 'text-[var(--mist-grey)] hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Zoom controls */}
          {viewMode === 'radar' && (
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setZoomLevel((z) => Math.min(2.2, z + 0.2))}
                className="px-2 py-1 text-xs text-[var(--warm-ivory)] hover:bg-white/10 rounded"
                title="Zoom In"
              >
                ➕
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.2))}
                className="px-2 py-1 text-xs text-[var(--warm-ivory)] hover:bg-white/10 rounded"
                title="Zoom Out"
              >
                ➖
              </button>
              <button
                onClick={() => {
                  setZoomLevel(1);
                  setPanOffset({ x: 0, y: 0 });
                }}
                className="px-2 py-1 text-xs font-mono text-[var(--mist-grey)] hover:text-white"
                title="Reset View"
              >
                RESET
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'radar' ? (
        <div
          tabIndex={0}
          onKeyDown={handleKeyDown}
          className="relative flex-1 min-h-[580px] w-full glass rounded-3xl border border-white/10 overflow-hidden shadow-2xl focus:outline-none focus:ring-1 focus:ring-[var(--antique-gold)] bg-[var(--midnight-navy)]/30"
        >
          <canvas
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={handleCanvasClick}
            className={`w-full h-full block ${isDragging ? 'cursor-grabbing' : hoveredArtifact ? 'cursor-pointer' : 'cursor-grab'}`}
          />

          {/* Top-left Telemetry Info */}
          <div className="absolute top-5 left-5 pointer-events-none glass px-4 py-2.5 rounded-xl border border-white/10 text-[11px] font-mono text-[var(--mist-grey)] space-y-0.5 bg-black/40">
            <div>PROJECTION: HELIOCENTRIC SCHEMATIC</div>
            <div>RECORDED HARDWARE: {filteredArtifacts.length} OF 28</div>
            <div className="text-[var(--antique-gold)]">NAVIGATE: Drag or use Arrow Keys + Enter</div>
          </div>

          {/* Legend */}
          <div className="absolute bottom-5 left-5 glass px-4 py-2.5 rounded-xl border border-white/10 flex flex-wrap items-center gap-4 text-xs font-mono bg-black/40">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--muted-blue)]" />
              <span className="text-[var(--warm-ivory)]">Active Signal</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--antique-gold)]" />
              <span className="text-[var(--warm-ivory)]">Silent Monument</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--mist-grey)]" />
              <span className="text-[var(--warm-ivory)]">Drifting Relic</span>
            </div>
          </div>

          {/* Hovered Artifact Peek Card */}
          {hoveredArtifact && (
            <div className="absolute bottom-5 right-5 glass p-5 rounded-2xl border border-[var(--antique-gold)]/40 max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-150 bg-[var(--midnight-navy)]/90">
              <div className="flex items-center justify-between mb-2">
                <span className="font-display font-medium text-base text-[var(--warm-ivory)]">{hoveredArtifact.name}</span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/10 text-[var(--antique-gold)] font-medium uppercase">
                  {hoveredArtifact.status}
                </span>
              </div>
              <div className="font-mono text-[11px] text-[var(--mist-grey)] mb-2">
                📍 {hoveredArtifact.location}
              </div>
              {hoveredArtifact.coordinates ? (
                <div className="font-mono text-[10px] text-[var(--antique-gold)] mb-2">
                  {getCoordinateSemanticLabel(hoveredArtifact.destination, true).toUpperCase()}: {formatCoordinates(hoveredArtifact.coordinates)}
                </div>
              ) : (
                <div className="font-mono text-[10px] text-[var(--mist-grey)] mb-2">
                  DOMAIN: {getCoordinateSemanticLabel(hoveredArtifact.destination, false).toUpperCase()}
                </div>
              )}
              <p className="text-xs text-[var(--mist-grey)] italic mb-3 line-clamp-2 font-sans font-light">
                "{hoveredArtifact.narrativeIntro}"
              </p>
              <div className="flex items-center justify-between pt-2.5 border-t border-white/10 text-[11px] font-mono text-[var(--antique-gold)]">
                <span>CLICK OR PRESS ENTER TO INSPECT</span>
                <span>➔</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Accessible Table View */
        <div className="glass rounded-3xl border border-white/10 overflow-hidden bg-[var(--midnight-navy)]/30">
          <div className="p-5 border-b border-white/10 flex justify-between items-center bg-black/40">
            <span className="font-mono text-xs text-[var(--antique-gold)] font-semibold">
              SOLAR SYSTEM RELIC CATALOG ({filteredArtifacts.length} HARDWARE OBJECTS)
            </span>
            <span className="font-mono text-xs text-[var(--mist-grey)]">
              Screen reader &amp; keyboard accessible
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-white/5 border-b border-white/10 text-[var(--mist-grey)] uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Artifact Name</th>
                  <th className="py-3.5 px-5">Domain</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5">Coordinates / Location</th>
                  <th className="py-3.5 px-5">Power Source</th>
                  <th className="py-3.5 px-5">Duration</th>
                  <th className="py-3.5 px-5 text-right">Archival Record</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredArtifacts.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-5 font-normal text-[var(--warm-ivory)]">
                      <span className="font-display text-base block">{item.name}</span>
                      <span className="block font-mono text-[10px] text-[var(--mist-grey)]">
                        {item.designation}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-[var(--mist-grey)] uppercase">
                      {item.destination}
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-medium font-mono ${
                          item.status === 'active'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : item.status === 'silent'
                            ? 'bg-[var(--antique-gold)]/15 text-[var(--antique-gold)] border border-[var(--antique-gold)]/30'
                            : 'bg-[var(--deep-slate)] text-[var(--mist-grey)] border border-white/10'
                        }`}
                      >
                        {item.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-[var(--mist-grey)]">
                      <div>{item.location}</div>
                      {item.coordinates ? (
                        <div className="text-[10px] text-[var(--antique-gold)] font-mono">
                          [{formatCoordinates(item.coordinates)}]
                        </div>
                      ) : (
                        <div className="text-[10px] text-[var(--mist-grey)]/70 font-mono">
                          [{getCoordinateSemanticLabel(item.destination, false)}]
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-5 text-[var(--mist-grey)] uppercase">
                      {item.powerSource}
                    </td>
                    <td className="py-4 px-5 text-[var(--mist-grey)]">
                      {item.actualDurationDays} days
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => {
                          playSignalPing(900);
                          markVisited(item.id);
                          navigate(`/ghost/${item.id}`);
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-[var(--antique-gold)] text-[var(--near-black)] font-sans font-semibold hover:bg-[#d8b57d] transition-all text-xs"
                      >
                        DOSSIER ➔
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
