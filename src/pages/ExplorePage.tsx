import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { artifacts } from '../data/artifacts';
import { useAppStore } from '../store/useAppStore';
import { playSignalPing, playWhooshSound } from '../utils/audio';

export const ExplorePage: React.FC = () => {
  const navigate = useNavigate();
  const { visitedArtifacts } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDest, setSelectedDest] = useState<'all' | 'moon' | 'mars' | 'planetary' | 'deep-space'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const getHumanStatus = (status: string, destination: string) => {
    if (status === 'active') return { label: 'STILL OPERATING', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
    if (status === 'silent') {
      if (destination === 'deep-space') return { label: 'TRAVELLING DEEP SPACE', badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40' };
      return { label: 'RESTING ON SURFACE', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
    }
    return { label: 'MISSION COMPLETED', badge: 'bg-stone-500/20 text-stone-300 border-stone-500/40' };
  };

  const filtered = artifacts.filter((a) => {
    // Destination filter
    if (selectedDest === 'moon' && a.destination !== 'moon') return false;
    if (selectedDest === 'mars' && a.destination !== 'mars') return false;
    if (selectedDest === 'deep-space' && a.destination !== 'deep-space') return false;
    if (selectedDest === 'planetary' && (a.destination === 'moon' || a.destination === 'mars' || a.destination === 'deep-space')) return false;

    // Status filter
    if (selectedStatus === 'operating' && a.status !== 'active') return false;
    if (selectedStatus === 'completed' && a.status === 'active') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        a.name.toLowerCase().includes(q) ||
        a.designation.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q) ||
        a.funFact.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
      {/* Header */}
      <div className="mb-10 border-b border-[#F0E8D9]/10 pb-8">
        <div className="flex items-center gap-2 text-[11px] mono uppercase tracking-[0.25em] text-[#C6A36B] mb-2 font-medium">
          <span>✦</span>
          <span>THE PERMANENT COLLECTION // 28 CURATED EXPLORERS</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-[#F0E8D9] font-normal tracking-[0.03em]">
            The Explorers
          </h1>
          <div className="text-xs mono text-[#B6C0CC] bg-[#101A29] px-4 py-2 rounded-full border border-[#F0E8D9]/15 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C6A36B] animate-pulse" />
            <span>DISCOVERED:</span>
            <span className="text-[#F0E8D9] font-bold">{visitedArtifacts.length} / 28</span>
          </div>
        </div>
        <p className="text-sm sm:text-base text-[#B6C0CC] max-w-3xl mt-4 font-light leading-relaxed">
          From robotic rovers that rolled across Martian dunes to landers silent beneath the lunar stars,
          explore twenty-eight human-made machines that ventured into the cosmic dark and stayed there.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#101A29]/80 backdrop-blur-md p-5 rounded-2xl border border-[#F0E8D9]/10 mb-10 flex flex-col lg:flex-row gap-5 justify-between items-center shadow-xl">
        {/* Search */}
        <div className="w-full lg:w-80 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by rover, mission, or world..."
            className="w-full px-4 py-2.5 rounded-xl bg-[#080D16]/90 border border-[#F0E8D9]/15 focus:border-[#C6A36B] focus:outline-none text-xs font-sans text-[#F0E8D9] placeholder-[#B6C0CC]/50 transition-all"
          />
        </div>

        {/* Destination Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {[
            { id: 'all', label: 'All Explorers' },
            { id: 'moon', label: '🌕 Moon' },
            { id: 'mars', label: '🔴 Mars' },
            { id: 'deep-space', label: '🌌 Deep Space' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedDest(cat.id as any);
                playSignalPing(600);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-sans tracking-wide transition-all cursor-pointer ${
                selectedDest === cat.id
                  ? 'bg-[#FFC66D] text-[#080B1D] font-semibold shadow-md'
                  : 'bg-black/30 text-[#C8D8EA] hover:text-white border border-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
          <button
            onClick={() => {
              setSelectedStatus('all');
              playSignalPing(500);
            }}
            className={`px-3 py-1 rounded-lg text-[11px] mono transition-all ${
              selectedStatus === 'all'
                ? 'text-[#F0E8D9] border-b border-[#C6A36B]'
                : 'text-[#B6C0CC]/60 hover:text-[#B6C0CC]'
            }`}
          >
            ALL
          </button>
          <button
            onClick={() => {
              setSelectedStatus('operating');
              playSignalPing(500);
            }}
            className={`px-3 py-1 rounded-lg text-[11px] mono transition-all ${
              selectedStatus === 'operating'
                ? 'text-[#F0E8D9] border-b border-emerald-400 font-semibold'
                : 'text-[#B6C0CC]/60 hover:text-[#B6C0CC]'
            }`}
          >
            ⚡ STILL ACTIVE
          </button>
        </div>
      </div>

      {/* Grid of Large Approachable Explorer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((artifact) => {
          const isVisited = visitedArtifacts.includes(artifact.id);
          const statusInfo = getHumanStatus(artifact.status, artifact.destination);

          const isSaturn = artifact.id === 'cassini' || artifact.location.toLowerCase().includes('saturn');
          const destAccent =
            artifact.destination === 'mars'
              ? { border: 'hover:border-[#FF8D7B]/60', accent: '#FF8D7B', tagBg: 'bg-[#FF8D7B]/15 text-[#FF8D7B] border-[#FF8D7B]/40' }
              : artifact.destination === 'moon'
              ? { border: 'hover:border-[#C8D8EA]/60', accent: '#C8D8EA', tagBg: 'bg-[#C8D8EA]/15 text-[#C8D8EA] border-[#C8D8EA]/40' }
              : isSaturn
              ? { border: 'hover:border-[#FFC66D]/60', accent: '#FFC66D', tagBg: 'bg-[#FFC66D]/15 text-[#FFC66D] border-[#FFC66D]/40' }
              : { border: 'hover:border-[#58D9FF]/60', accent: '#58D9FF', tagBg: 'bg-[#58D9FF]/15 text-[#58D9FF] border-[#58D9FF]/40' };

          return (
            <motion.div
              key={artifact.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`group relative rounded-3xl bg-[#111A35]/80 border border-white/10 ${destAccent.border} p-6 flex flex-col justify-between transition-all duration-300 shadow-xl hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-sm`}
            >
              <div>
                {/* Header Badge Row */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`px-3 py-0.5 rounded-full text-[10px] mono font-semibold tracking-wider border ${statusInfo.badge}`}
                  >
                    ● {statusInfo.label}
                  </span>

                  <span className="mono text-[10px] text-[#C8D8EA]/75 flex items-center gap-1.5">
                    {isVisited ? '✓ EXPLORED' : '○ UNVIEWED'}
                  </span>
                </div>

                {/* Name & Destination */}
                <h3 className="font-display text-2xl text-[#F5F0E8] group-hover:text-white transition-colors mb-1 font-medium leading-snug">
                  {artifact.name}
                </h3>
                <div className="text-xs font-mono mb-4 flex items-center gap-1.5" style={{ color: destAccent.accent }}>
                  <span>📍</span>
                  <span>{artifact.location}</span>
                </div>

                {/* Engaging 1-Minute Narrative Excerpt */}
                <p className="font-serif italic text-sm text-[#F5F0E8]/90 leading-relaxed mb-6 border-l-2 pl-3.5 py-1 line-clamp-3 font-light" style={{ borderLeftColor: destAccent.accent }}>
                  "{artifact.narrativeIntro}"
                </p>

                {/* Fascinating Fact Box */}
                <div className="bg-black/40 rounded-xl p-3 border border-white/5 mb-6 text-xs text-[#C8D8EA] leading-relaxed">
                  <span className="font-semibold block text-[10px] mono uppercase mb-0.5" style={{ color: destAccent.accent }}>
                    💡 DID YOU KNOW?
                  </span>
                  {artifact.funFact}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
                <Link
                  to={`/ghost/${artifact.id}`}
                  onClick={() => playSignalPing(800)}
                  className="w-full py-2.5 rounded-xl text-center font-sans text-xs tracking-[0.2em] uppercase font-semibold bg-white/5 group-hover:bg-[#FFC66D] group-hover:text-[#080B1D] border border-white/15 group-hover:border-transparent transition-all block text-[#F5F0E8] shadow-sm cursor-pointer"
                >
                  DISCOVER ITS STORY →
                </Link>

                {/* Quick Link to 3D Globe */}
                {(artifact.destination === 'moon' || artifact.destination === 'mars' || artifact.destination === 'deep-space') && (
                  <button
                    onClick={() => {
                      playWhooshSound();
                      navigate(`/universe?planet=${artifact.destination}&target=${artifact.id}`);
                    }}
                    className="w-full py-1.5 text-center font-mono text-[11px] text-[#C8D8EA]/70 hover:text-[#58D9FF] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>🌐 Find in 3D Universe</span>
                    <span>↗</span>
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-24 text-[#B6C0CC] font-serif italic text-base">
          No explorers matched your criteria. Try adjusting your filters.
        </div>
      )}
    </div>
  );
};
