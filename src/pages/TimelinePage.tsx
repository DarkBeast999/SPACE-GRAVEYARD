import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { timelineEvents } from '../data/timeline';
import { playSignalPing } from '../utils/audio';

type EraKey = 'all' | 'era1' | 'era2' | 'era3' | 'era4';

interface EraDef {
  key: EraKey;
  label: string;
  range: string;
  minYear: number;
  maxYear: number;
}

const ERAS: EraDef[] = [
  { key: 'all', label: 'All Eras', range: '1957 — Present', minYear: 1950, maxYear: 2030 },
  { key: 'era1', label: 'The Beginning of the Space Age', range: '1957 — 1969', minYear: 1957, maxYear: 1969 },
  { key: 'era2', label: 'Moon & Outer Planets', range: '1970 — 1989', minYear: 1970, maxYear: 1989 },
  { key: 'era3', label: 'New Era of Robotic Exploration', range: '1990 — 2009', minYear: 1990, maxYear: 2009 },
  { key: 'era4', label: 'Modern Space Explorers', range: '2010 — Present', minYear: 2010, maxYear: 2030 },
];

export const TimelinePage: React.FC = () => {
  const [selectedEra, setSelectedEra] = useState<EraKey>('all');
  const [filterDest, setFilterDest] = useState<'all' | 'moon' | 'mars' | 'deep-space'>('all');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const currentEra = ERAS.find((e) => e.key === selectedEra) || ERAS[0];

  const filtered = timelineEvents.filter((ev) => {
    if (selectedEra !== 'all') {
      if (ev.year < currentEra.minYear || ev.year > currentEra.maxYear) return false;
    }
    if (filterDest !== 'all' && ev.destination !== filterDest) return false;
    return true;
  });

  const scrollByAmount = (amount: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
      playSignalPing(700);
    }
  };

  // Keyboard navigation for Left/Right arrows
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        scrollByAmount(-450);
      } else if (e.key === 'ArrowRight') {
        scrollByAmount(450);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen flex flex-col">
      {/* Editorial Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 pb-6 border-b border-white/10">
        <div>
          <div className="font-mono text-xs text-[#C6A36B] tracking-widest uppercase mb-2 font-semibold">
            // CHRONICLES OF EXPLORATION // 1957 — PRESENT
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-normal text-[#F0E8D9]">
            The Cosmic Timeline
          </h1>
          <p className="text-sm text-[#B6C0CC] mt-2 font-sans font-light max-w-2xl leading-relaxed">
            Humanity's deep space voyages placed alongside cultural and terrestrial milestones.
            Traverse nearly seven decades of interplanetary discovery across four historic eras.
          </p>
        </div>

        {/* Destination Filter */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10">
          {(['all', 'moon', 'mars', 'deep-space'] as const).map((dest) => (
            <button
              key={dest}
              onClick={() => {
                setFilterDest(dest);
                playSignalPing(600);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-sans transition-all ${
                filterDest === dest
                  ? 'bg-[#C6A36B] text-[#080D16] font-semibold shadow-sm'
                  : 'text-[#B6C0CC] hover:text-white'
              }`}
            >
              {dest === 'all' ? 'All' : dest === 'moon' ? 'Moon' : dest === 'mars' ? 'Mars' : 'Deep Space'}
            </button>
          ))}
        </div>
      </div>

      {/* Historical Era Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-8 pb-4 border-b border-white/10">
        {ERAS.map((era) => (
          <button
            key={era.key}
            onClick={() => {
              setSelectedEra(era.key);
              playSignalPing(650);
              if (scrollRef.current) scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
            }}
            className={`px-4 py-2 rounded-xl text-xs font-sans transition-all flex items-center gap-2 ${
              selectedEra === era.key
                ? 'bg-[#C6A36B]/20 text-[#F0E8D9] border border-[#C6A36B] font-semibold shadow-md'
                : 'bg-black/20 text-[#B6C0CC] hover:text-white border border-white/5'
            }`}
          >
            <span className="font-mono text-[#C6A36B]">{era.range}</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">{era.label}</span>
          </button>
        ))}
      </div>

      {/* Main Timeline Section with Left & Right Edge Positioned Controls */}
      <div className="relative flex-1 flex items-center">
        {/* Left Edge Control Button */}
        <button
          onClick={() => scrollByAmount(-500)}
          className="hidden md:flex absolute -left-5 z-20 w-12 h-12 rounded-full bg-[#101A29]/90 hover:bg-[#C6A36B] text-[#F0E8D9] hover:text-[#080D16] border border-[#C6A36B]/50 hover:border-transparent items-center justify-center shadow-2xl transition-all group backdrop-blur-md"
          title="Scroll earlier in time (Left Arrow)"
          aria-label="Scroll Earlier in Time"
        >
          <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
        </button>

        {/* Right Edge Control Button */}
        <button
          onClick={() => scrollByAmount(500)}
          className="hidden md:flex absolute -right-5 z-20 w-12 h-12 rounded-full bg-[#101A29]/90 hover:bg-[#C6A36B] text-[#F0E8D9] hover:text-[#080D16] border border-[#C6A36B]/50 hover:border-transparent items-center justify-center shadow-2xl transition-all group backdrop-blur-md"
          title="Scroll later in time (Right Arrow)"
          aria-label="Scroll Later in Time"
        >
          <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
        </button>

        {/* Desktop Horizontal Scroll Track */}
        <div
          ref={scrollRef}
          className="hidden md:flex flex-1 gap-6 overflow-x-auto pb-8 pt-2 timeline-scroll scroll-smooth select-none px-4"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {filtered.map((item) => (
            <div
              key={item.id}
              style={{ scrollSnapAlign: 'start' }}
              className="flex-shrink-0 w-[360px] lg:w-[400px] p-7 rounded-3xl border border-white/10 hover:border-[#C6A36B]/50 transition-all flex flex-col justify-between group relative bg-[#101A29]/75 shadow-xl backdrop-blur-sm"
            >
              {/* Year Stamp */}
              <div className="flex items-baseline justify-between mb-4 pb-4 border-b border-white/10">
                <span className="font-display text-4xl font-normal text-[#C6A36B]">
                  {item.year}
                </span>
                <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-white/5 text-[#B6C0CC] border border-white/10">
                  {item.destination ? item.destination.toUpperCase() : 'DEEP SPACE'}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="font-display text-xl text-[#F0E8D9] group-hover:text-[#C6A36B] transition-colors mb-3 leading-snug">
                  {item.title}
                </h3>

                <p className="text-sm text-[#B6C0CC] leading-relaxed mb-6 font-sans font-light">
                  {item.description}
                </p>
              </div>

              {/* Earth Cultural Context & Artifact Link */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                {item.earthEvent && (
                  <div className="bg-black/35 p-3 rounded-xl border border-white/5 text-[11px] font-mono text-[#B6C0CC] leading-relaxed">
                    <span className="text-[#C6A36B] font-medium">ON EARTH:</span> {item.earthEvent}
                  </div>
                )}

                {item.artifactId && (
                  <Link
                    to={`/ghost/${item.artifactId}`}
                    onClick={() => playSignalPing(800)}
                    className="block text-center py-2.5 rounded-xl font-sans text-xs font-semibold text-[#080D16] bg-[#C6A36B] hover:bg-[#d8b57d] transition-all uppercase tracking-wider shadow-sm"
                  >
                    EXPLORE MISSION STORY →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Vertical Chronological Stack */}
        <div className="md:hidden flex flex-col gap-6 w-full py-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-2xl border border-white/10 bg-[#101A29]/80 shadow-lg"
            >
              <div className="flex items-baseline justify-between mb-3 pb-3 border-b border-white/10">
                <span className="font-display text-3xl text-[#C6A36B]">{item.year}</span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/5 text-[#B6C0CC]">
                  {item.destination ? item.destination.toUpperCase() : 'DEEP SPACE'}
                </span>
              </div>
              <h3 className="font-display text-lg text-[#F0E8D9] mb-2">{item.title}</h3>
              <p className="text-xs text-[#B6C0CC] leading-relaxed mb-4">{item.description}</p>
              {item.earthEvent && (
                <div className="bg-black/30 p-2.5 rounded-lg border border-white/5 text-[10px] font-mono text-[#B6C0CC] mb-3">
                  <span className="text-[#C6A36B]">ON EARTH:</span> {item.earthEvent}
                </div>
              )}
              {item.artifactId && (
                <Link
                  to={`/ghost/${item.artifactId}`}
                  onClick={() => playSignalPing(800)}
                  className="block text-center py-2 rounded-lg font-sans text-xs font-semibold bg-[#C6A36B] text-[#080D16]"
                >
                  EXPLORE MISSION STORY →
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Navigation Tip */}
      <div className="font-mono text-xs text-[#B6C0CC]/70 text-center pt-6 hidden md:block">
        TIP: Use Left/Right Arrow Keys or Edge Navigation Arrows to traverse the timeline
      </div>
    </div>
  );
};
