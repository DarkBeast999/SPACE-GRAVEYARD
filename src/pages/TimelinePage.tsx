import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { timelineEvents } from '../data/timeline';
import { playSignalPing } from '../utils/audio';

type EraKey = 'all' | 'era1' | 'era2' | 'era3' | 'era4';

interface EraDef {
  key: EraKey;
  label: string;
  range: string;
  minYear: number;
  maxYear: number;
  description: string;
}

const ERAS: EraDef[] = [
  {
    key: 'all',
    label: 'All Eras',
    range: '1957 — Present',
    minYear: 1950,
    maxYear: 2030,
    description: 'The complete chronicle of human and robotic exploration across the solar system and beyond.',
  },
  {
    key: 'era1',
    label: 'Dawn of the Space Age',
    range: '1957 — 1969',
    minYear: 1957,
    maxYear: 1969,
    description: 'From Sputnik’s first orbit to the monumental landing of Apollo 11 in the Sea of Tranquility.',
  },
  {
    key: 'era2',
    label: 'Moon & Outer Planets',
    range: '1970 — 1989',
    minYear: 1970,
    maxYear: 1989,
    description: 'Human lunar science expeditions, Soviet Lunokhod rovers, the Viking Mars landings, and the Voyager Grand Tour.',
  },
  {
    key: 'era3',
    label: 'Robotic Renaissance',
    range: '1990 — 2009',
    minYear: 1990,
    maxYear: 2009,
    description: 'Hubble’s cosmic gaze, the return to Mars with Pathfinder and the MER rovers, Cassini at Saturn, and New Horizons launch.',
  },
  {
    key: 'era4',
    label: 'Modern Frontiers',
    range: '2010 — Present',
    minYear: 2010,
    maxYear: 2030,
    description: 'Curiosity and Perseverance, the first extraterrestrial flight by Ingenuity, lunar far-side landings, and interstellar voyages.',
  },
];

// Landmark events that receive enhanced visual treatment
const MAJOR_MILESTONES = new Set([
  'sputnik-1',
  'luna-2',
  'mariner-4',
  'surveyor-3-landing',
  'apollo-11-landing',
  'lunokhod-1-landing',
  'pioneer-10-launch',
  'apollo-15-landing',
  'apollo-17-landing',
  'viking-1-landing',
  'voyager-1-launch',
  'voyager-2-launch',
  'pioneer-11-saturn',
  'hubble-launch',
  'pathfinder-sojourner',
  'cassini-arrival',
  'opportunity-spirit-landing',
  'new-horizons-launch',
  'phoenix-landing',
  'curiosity-landing',
  'voyager-1-interstellar',
  'new-horizons-pluto',
  'cassini-grand-finale',
  'change-4-farside',
  'perseverance-ingenuity-landing',
  'jwst-first-images',
]);

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const TimelinePage: React.FC = () => {
  const [selectedEra, setSelectedEra] = useState<EraKey>('all');
  const [filterDest, setFilterDest] = useState<'all' | 'moon' | 'mars' | 'deep-space' | 'earth'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const currentEra = ERAS.find((e) => e.key === selectedEra) || ERAS[0];

  // Calculate event counts per era
  const eraCounts = useMemo(() => {
    const counts: Record<EraKey, number> = { all: 0, era1: 0, era2: 0, era3: 0, era4: 0 };
    counts.all = timelineEvents.length;
    timelineEvents.forEach((ev) => {
      if (ev.year >= 1957 && ev.year <= 1969) counts.era1++;
      else if (ev.year >= 1970 && ev.year <= 1989) counts.era2++;
      else if (ev.year >= 1990 && ev.year <= 2009) counts.era3++;
      else if (ev.year >= 2010) counts.era4++;
    });
    return counts;
  }, []);

  // Filtered timeline events
  const filteredEvents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return timelineEvents.filter((ev) => {
      // Era filter
      if (selectedEra !== 'all') {
        if (ev.year < currentEra.minYear || ev.year > currentEra.maxYear) return false;
      }
      // Destination filter
      if (filterDest !== 'all') {
        if (ev.destination !== filterDest) return false;
      }
      // Search query filter
      if (query) {
        const titleMatch = ev.title.toLowerCase().includes(query);
        const descMatch = ev.description.toLowerCase().includes(query);
        const earthMatch = ev.earthEvent ? ev.earthEvent.toLowerCase().includes(query) : false;
        const yearMatch = ev.year.toString().includes(query);
        const destMatch = ev.destination ? ev.destination.toLowerCase().includes(query) : false;
        if (!titleMatch && !descMatch && !earthMatch && !yearMatch && !destMatch) return false;
      }
      return true;
    });
  }, [selectedEra, filterDest, searchQuery, currentEra]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'landing':
        return '🛬';
      case 'launch':
        return '🚀';
      case 'discovery':
        return '🔬';
      case 'orbit':
        return '🛰️';
      case 'farewell':
        return '🌟';
      default:
        return '✦';
    }
  };

  const getDestinationBadge = (dest?: string) => {
    switch (dest) {
      case 'moon':
        return { label: 'MOON', color: 'bg-slate-700/40 text-slate-200 border-slate-500/40' };
      case 'mars':
        return { label: 'MARS', color: 'bg-[#d97736]/20 text-[#fbd38d] border-[#d97736]/50' };
      case 'saturn':
        return { label: 'SATURN', color: 'bg-purple-900/30 text-purple-200 border-purple-500/40' };
      case 'deep-space':
        return { label: 'DEEP SPACE', color: 'bg-[#38bdf8]/20 text-[#38bdf8] border-[#38bdf8]/50' };
      case 'earth':
        return { label: 'EARTH', color: 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40' };
      default:
        return { label: 'COSMIC', color: 'bg-white/10 text-[#F0E8D9] border-white/20' };
    }
  };

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen flex flex-col">
      {/* 1. CINEMATIC HERO SECTION */}
      <header className="relative mb-12 p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#101A29]/95 via-[#080D16]/95 to-[#080D16]/98 border border-white/10 shadow-2xl backdrop-blur-xl overflow-hidden">
        {/* Subtle decorative orbit glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFC66D]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-[#58D9FF]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#FFC66D] animate-pulse" />
            <span className="font-mono text-xs text-[#FFC66D] tracking-widest uppercase font-semibold">
              CHRONICLES OF EXPLORATION // 1957 — PRESENT
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl font-normal text-[#F5F0E8] tracking-tight mb-4">
            The Cosmic Timeline
          </h1>

          <p className="text-sm sm:text-base text-[#C8D8EA] font-sans font-light leading-relaxed mb-8">
            Humanity’s outward reach across nearly seven decades. Traverse fifty defining moments of planetary discovery,
            from the faint beeps of Sputnik 1 to interstellar crossings and active rovers traversing alien basins,
            interwoven with cultural and terrestrial milestones.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-6 border-t border-white/10 text-left">
            <div className="bg-black/40 p-3.5 rounded-xl border border-white/5">
              <span className="font-mono text-[10px] text-[#C8D8EA] uppercase tracking-wider block mb-0.5">TIME HORIZON</span>
              <span className="font-display text-xl sm:text-2xl text-[#F5F0E8]">69 Years</span>
            </div>
            <div className="bg-black/40 p-3.5 rounded-xl border border-white/5">
              <span className="font-mono text-[10px] text-[#C8D8EA] uppercase tracking-wider block mb-0.5">CHRONICLED EVENTS</span>
              <span className="font-display text-xl sm:text-2xl text-[#FFC66D]">{timelineEvents.length} Milestones</span>
            </div>
            <div className="bg-black/40 p-3.5 rounded-xl border border-white/5">
              <span className="font-mono text-[10px] text-[#C8D8EA] uppercase tracking-wider block mb-0.5">HISTORIC ERAS</span>
              <span className="font-display text-xl sm:text-2xl text-[#F5F0E8]">4 Epochs</span>
            </div>
            <div className="bg-black/40 p-3.5 rounded-xl border border-white/5">
              <span className="font-mono text-[10px] text-[#C8D8EA] uppercase tracking-wider block mb-0.5">FILTERED EVENTS</span>
              <span className="font-display text-xl sm:text-2xl text-[#58D9FF]">{filteredEvents.length} Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. ERA NAVIGATOR & SEARCH FILTERS */}
      <div className="mb-12 space-y-4">
        {/* Era Tabs with Counts */}
        <div className="flex flex-wrap items-center gap-2">
          {ERAS.map((era) => {
            const isActive = selectedEra === era.key;
            return (
              <button
                key={era.key}
                onClick={() => {
                  setSelectedEra(era.key);
                  playSignalPing(650);
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-sans transition-all flex items-center gap-2.5 cursor-pointer ${
                  isActive
                    ? 'bg-[#FFC66D] text-[#080B1D] font-semibold shadow-lg shadow-[#FFC66D]/20'
                    : 'bg-[#111A35]/90 text-[#C8D8EA] hover:text-white border border-white/10 hover:border-[#FFC66D]/40'
                }`}
              >
                <span>{era.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  isActive ? 'bg-[#080B1D]/20 text-[#080B1D]' : 'bg-white/10 text-[#FFC66D]'
                }`}>
                  {eraCounts[era.key]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Destination Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-2xl bg-[#101A29]/80 border border-white/10 backdrop-blur-md">
          {/* Live Search Input */}
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B6C0CC] text-sm">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 50 milestones by mission, world, discovery, Earth event..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/40 border border-white/10 focus:border-[#FFC66D] focus:outline-none text-[#F5F0E8] placeholder-[#C8D8EA]/50 text-xs font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#B6C0CC] hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Destination Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {(['all', 'moon', 'mars', 'deep-space', 'earth'] as const).map((dest) => (
              <button
                key={dest}
                onClick={() => {
                  setFilterDest(dest);
                  playSignalPing(600);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-sans whitespace-nowrap transition-all cursor-pointer ${
                  filterDest === dest
                    ? 'bg-white/20 text-[#F0E8D9] border border-white/30 font-medium'
                    : 'text-[#B6C0CC] hover:text-white border border-transparent'
                }`}
              >
                {dest === 'all'
                  ? 'All Destinations'
                  : dest === 'moon'
                  ? '🌑 Moon'
                  : dest === 'mars'
                  ? '🔴 Mars'
                  : dest === 'deep-space'
                  ? '🌌 Deep Space'
                  : '🌍 Earth'}
              </button>
            ))}
          </div>
        </div>

        {/* Active Era Description */}
        <div className="px-3 py-2 text-xs font-sans text-[#C8D8EA]/80 flex items-center gap-2">
          <span className="font-mono text-[#FFC66D]">{currentEra.range}:</span>
          <span>{currentEra.description}</span>
        </div>
      </div>

      {/* 3. VERTICAL CHRONOLOGY ARCHITECTURE */}
      <main className="relative flex-1">
        {filteredEvents.length === 0 ? (
          <div className="p-16 rounded-3xl bg-[#111A35]/60 border border-white/10 text-center">
            <span className="text-3xl block mb-2">🔭</span>
            <h3 className="font-display text-xl text-[#F5F0E8] mb-1">No Milestones Found</h3>
            <p className="text-xs text-[#C8D8EA] max-w-sm mx-auto mb-4 font-light">
              No historical records matched your search query or filter combination.
            </p>
            <button
              onClick={() => {
                setSelectedEra('all');
                setFilterDest('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-[#FFC66D] text-[#080B1D] text-xs font-semibold uppercase tracking-wider shadow-lg shadow-[#FFC66D]/20 cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="relative py-6">
            {/* Illuminated Central Timeline Spine */}
            {/* Desktop: Centered down middle. Mobile: Aligned left at 20px */}
            <div className="absolute left-5 md:left-1/2 top-4 bottom-4 w-0.5 bg-gradient-to-b from-[#FFC66D]/20 via-[#FFC66D]/70 to-[#FFC66D]/20 -translate-x-1/2 pointer-events-none" />

            <div className="space-y-10 md:space-y-16">
              <AnimatePresence>
                {filteredEvents.map((ev, idx) => {
                  const isMajor = MAJOR_MILESTONES.has(ev.id);
                  const isEven = idx % 2 === 0;
                  const destBadge = getDestinationBadge(ev.destination);
                  const monthName = ev.month ? MONTH_NAMES[ev.month - 1] : '';

                  return (
                    <motion.article
                      key={ev.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.35, delay: Math.min(idx * 0.04, 0.4) }}
                      className={`relative flex flex-col md:flex-row items-start ${
                        isEven ? 'md:flex-row-reverse' : ''
                      }`}
                    >
                      {/* Timeline Central Node Icon */}
                      <div className="absolute left-5 md:left-1/2 -translate-x-1/2 z-20 flex items-center justify-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm shadow-xl transition-all ${
                          isMajor
                            ? 'bg-[#FFC66D] text-[#080B1D] border-2 border-white ring-4 ring-[#FFC66D]/30'
                            : 'bg-[#111A35] text-[#F5F0E8] border border-[#FFC66D]/60'
                        }`}>
                          {getTypeIcon(ev.type)}
                        </div>
                      </div>

                      {/* Event Card Content Container */}
                      <div className={`w-full md:w-1/2 pl-14 md:pl-0 ${
                        isEven ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left'
                      }`}>
                        <div className={`p-6 sm:p-7 rounded-3xl transition-all shadow-xl backdrop-blur-md relative overflow-hidden group ${
                          isMajor
                            ? 'bg-gradient-to-br from-[#111A35]/95 via-[#162244]/90 to-[#1F170A]/90 border border-[#FFC66D]/60 hover:border-[#FFC66D] shadow-[0_0_25px_rgba(255,198,109,0.15)]'
                            : 'bg-[#111A35]/80 border border-white/10 hover:border-[#FFC66D]/40'
                        }`}>
                          {/* Highlight Glow for Major Milestones */}
                          {isMajor && (
                            <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#FFC66D]/10 rounded-full blur-2xl pointer-events-none" />
                          )}

                          {/* Top Badges & Date */}
                          <div className={`flex flex-wrap items-center gap-2 mb-2 ${
                            isEven ? 'md:justify-end' : 'md:justify-start'
                          }`}>
                            <span className="font-mono text-xs font-bold text-[#FFC66D] tracking-widest uppercase">
                              {monthName ? `${monthName.toUpperCase()} ` : ''}{ev.year}
                            </span>
                            <span className="text-[#C8D8EA]/40">•</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border font-medium ${destBadge.color}`}>
                              {destBadge.label} // {ev.type.toUpperCase()}
                            </span>
                            {isMajor && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-[#FFC66D]/20 text-[#FFC66D] border border-[#FFC66D]/50 font-bold">
                                ✦ MAJOR MILESTONE
                              </span>
                            )}
                          </div>

                          {/* Title */}
                          <h2 className="font-display text-xl sm:text-2xl text-[#F5F0E8] font-normal leading-snug mb-3 group-hover:text-white transition-colors">
                            {ev.title}
                          </h2>

                          {/* Description */}
                          <p className="text-sm text-[#F5F0E8]/90 leading-relaxed font-sans font-light mb-4">
                            {ev.description}
                          </p>

                          {/* Terrestrial Earth Context */}
                          {ev.earthEvent && (
                            <div className="mt-4 p-3.5 rounded-2xl bg-black/40 border border-white/5 text-xs text-[#C8D8EA] flex items-start gap-2.5 text-left">
                              <span className="text-[#FFC66D] font-mono text-[11px] uppercase tracking-wider shrink-0 font-semibold mt-0.5">
                                🌍 ON EARTH:
                              </span>
                              <span className="font-sans italic leading-relaxed text-[#C8D8EA]/95 font-light">
                                {ev.earthEvent}
                              </span>
                            </div>
                          )}

                          {/* Explorer Profile Link Button */}
                          {ev.artifactId && (
                            <div className={`mt-5 pt-4 border-t border-white/10 flex ${
                              isEven ? 'md:justify-end' : 'md:justify-start'
                            }`}>
                              <Link
                                to={`/ghost/${ev.artifactId}`}
                                onClick={() => playSignalPing(700)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FFC66D]/15 hover:bg-[#FFC66D] text-[#FFC66D] hover:text-[#080B1D] border border-[#FFC66D]/40 transition-all font-sans text-xs font-semibold tracking-wider uppercase group/link"
                              >
                                <span>EXPLORE MISSION DOSSIER</span>
                                <span className="group-hover/link:translate-x-1 transition-transform">→</span>
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
