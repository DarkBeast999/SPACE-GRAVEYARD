import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { playSignalPing, playWhooshSound } from '../utils/audio';
import heroSurveyor3 from '../assets/hero-surveyor3.jpg';
import heroOpportunity from '../assets/hero-opportunity.jpg';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const featuredList = [
    {
      id: 'opportunity',
      name: 'Opportunity Rover',
      destination: 'Mars (Meridiani Planum)',
      tag: 'Martian Rover',
      fact: 'Designed for a 90-day mission, Opportunity operated for nearly 15 years and drove a marathon 45 km across Mars.',
      img: heroOpportunity,
    },
    {
      id: 'voyager-1',
      name: 'Voyager 1',
      destination: 'Interstellar Space (> 24B km)',
      tag: 'Interstellar Explorer',
      fact: 'Humanity’s most distant machine has left our Solar System; radio messages from Earth take over 23 hours to reach it.',
      img: null,
    },
    {
      id: 'eagle-descent-stage',
      name: 'Apollo 11 Eagle Descent Stage',
      destination: 'The Moon (Sea of Tranquility)',
      tag: 'Lunar Historic Monument',
      fact: 'The golden base of humanity’s first crewed landing still rests in the lunar dust, its plaque reading "We came in peace for all mankind."',
      img: null,
    },
    {
      id: 'surveyor-3',
      name: 'Surveyor 3',
      destination: 'The Moon (Ocean of Storms)',
      tag: 'Lunar Robotic Pioneer',
      fact: 'The only robotic craft visited by humans on another world: Apollo 12 astronauts examined it and retrieved its camera in 1969.',
      img: heroSurveyor3,
    },
  ];

  return (
    <div className="relative z-10 min-h-screen">
      {/* ================= 1. CINEMATIC PHOTOGRAPHIC HERO ================= */}
      <section className="relative min-h-[95vh] flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 pt-20 pb-24 overflow-hidden">
        {/* Archival Photography Foundation */}
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden bg-[#080D16]">
          <img
            src={heroSurveyor3}
            alt="NASA Apollo 12 archival photograph (AS12-48-7133) showing astronaut Pete Conrad visiting Surveyor 3 on the Moon"
            className="w-full h-full object-cover object-[center_35%] filter brightness-[0.70] contrast-[1.15]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#080D16]/75 via-[#080D16]/50 to-[#080D16]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080D16] via-transparent to-[#080D16]/60" />

          {/* Photo attribution badge */}
          <div className="absolute bottom-6 right-6 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#080D16]/85 border border-[#F0E8D9]/15 text-[10px] font-mono text-[#B6C0CC]/90 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C6A36B]" />
            <span>NASA Apollo 12 (AS12-48-7133) // Surveyor 3 on the Moon</span>
          </div>
        </div>

        {/* Museum Pill */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#101A29]/80 border border-[#F0E8D9]/15 mb-6 backdrop-blur-md"
        >
          <span className="w-2 h-2 rounded-full bg-[#C6A36B] animate-pulse" />
          <span className="text-[11px] font-mono tracking-[0.25em] text-[#C6A36B] uppercase font-semibold">
            INTERACTIVE 3D DIGITAL SPACE MUSEUM
          </span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15 }}
          className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-[0.2em] text-[#F0E8D9] font-normal max-w-5xl leading-[1.08] mb-4 drop-shadow-xl"
        >
          SPACE GRAVEYARD
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="font-serif italic text-2xl sm:text-3xl text-[#C6A36B] tracking-wide mb-6 font-light drop-shadow-md"
        >
          They Never Came Home.
        </motion.p>

        {/* Lead Narrative */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="text-base sm:text-lg text-[#B6C0CC] max-w-2xl mx-auto leading-relaxed mb-10 font-sans font-light drop-shadow"
        >
          Explore the machines humanity sent into space and the worlds where they remain.
        </motion.p>

        {/* Primary Call to Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6"
        >
          {/* Dominant Gold 3D Universe Action */}
          <Link
            to="/universe"
            onClick={() => playWhooshSound()}
            className="w-full sm:w-auto px-10 py-4 rounded-xl text-xs font-sans tracking-[0.24em] uppercase text-[#080D16] bg-[#C6A36B] hover:bg-[#d8b57d] hover:shadow-[0_0_30px_rgba(198,163,107,0.4)] transition-all font-bold flex items-center justify-center gap-2"
          >
            <span>🌐 ENTER THE 3D UNIVERSE</span>
            <span>→</span>
          </Link>

          <Link
            to="/explore"
            onClick={() => playSignalPing(750)}
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-xs font-sans tracking-[0.24em] uppercase text-[#F0E8D9] bg-[#101A29]/90 border border-white/20 hover:border-[#C6A36B] hover:text-[#C6A36B] transition-all backdrop-blur-md"
          >
            EXPLORE THE MISSIONS
          </Link>
        </motion.div>
      </section>

      {/* ================= 2. CHOOSE A DESTINATION (3D DIRECT PORTALS) ================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#FFC66D] block mb-2 font-semibold">
            SELECT A DESTINATION IN 3D
          </span>
          <h2 className="font-display text-3xl sm:text-4xl text-[#F5F0E8] font-medium">
            Where Would You Like to Go?
          </h2>
          <p className="text-xs sm:text-sm text-[#C8D8EA] mt-2 font-light">
            Step directly onto interactive 3D planetary globes to discover historical landing sites and rover trails.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              planet: 'moon',
              name: 'The Moon',
              icon: '🌕',
              desc: 'Tranquility Base, Ocean of Storms, and Apollo lunar monuments.',
              tag: '12 Historical Landmarks',
              accent: '#C8D8EA',
              border: 'hover:border-[#C8D8EA]/60 hover:shadow-[0_0_25px_rgba(200,216,234,0.15)]',
            },
            {
              planet: 'mars',
              name: 'Mars',
              icon: '🔴',
              desc: 'Meridiani Planum, Gale Crater, and 15 years of rover discoveries.',
              tag: '10 Surface Explorers',
              accent: '#FF8D7B',
              border: 'hover:border-[#FF8D7B]/60 hover:shadow-[0_0_25px_rgba(255,141,123,0.15)]',
            },
            {
              planet: 'saturn',
              name: 'Saturn',
              icon: '🪐',
              desc: 'Majestic rings, Enceladus geysers, and Cassini’s Grand Finale plunge.',
              tag: 'Cassini & Rings',
              accent: '#FFC66D',
              border: 'hover:border-[#FFC66D]/60 hover:shadow-[0_0_25px_rgba(255,198,109,0.15)]',
            },
            {
              planet: 'deep-space',
              name: 'Deep Space',
              icon: '🌌',
              desc: 'Voyagers escaping the solar wind into the true interstellar ocean.',
              tag: 'Interstellar Pioneers',
              accent: '#58D9FF',
              border: 'hover:border-[#58D9FF]/60 hover:shadow-[0_0_25px_rgba(88,217,255,0.15)]',
            },
          ].map((dest) => (
            <div
              key={dest.planet}
              onClick={() => {
                playWhooshSound();
                navigate(`/universe?planet=${dest.planet}`);
              }}
              className={`p-6 rounded-3xl bg-[#111A35]/80 border border-white/10 ${dest.border} cursor-pointer transition-all duration-300 flex flex-col justify-between group backdrop-blur-sm`}
            >
              <div>
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{dest.icon}</div>
                <h3 className="font-display text-2xl text-[#F5F0E8] group-hover:text-white transition-colors mb-2">
                  {dest.name}
                </h3>
                <p className="text-xs text-[#C8D8EA] leading-relaxed mb-4 font-light">
                  {dest.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono" style={{ color: dest.accent }}>
                <span>{dest.tag}</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= 3. DISCOVER THE FORGOTTEN EXPLORERS ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 pb-4 border-b border-white/10">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#C6A36B] block mb-2 font-semibold">
              FEATURED DISCOVERIES
            </span>
            <h2 className="font-display text-3xl sm:text-4xl text-[#F0E8D9] font-medium">
              Forgotten Pioneers
            </h2>
          </div>
          <Link
            to="/explore"
            onClick={() => playSignalPing(700)}
            className="mt-4 sm:mt-0 text-xs font-sans tracking-[0.2em] text-[#C6A36B] hover:text-[#F0E8D9] transition-colors flex items-center gap-1.5 uppercase font-semibold"
          >
            <span>View All 28 Explorers</span>
            <span>➔</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featuredList.map((item) => (
            <div
              key={item.id}
              className="p-8 rounded-3xl bg-[#101A29]/70 border border-white/10 hover:border-[#C6A36B]/50 transition-all flex flex-col justify-between shadow-xl backdrop-blur-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-3 text-xs font-mono">
                  <span className="text-[#C6A36B] font-semibold">{item.tag}</span>
                  <span className="text-[#B6C0CC]">📍 {item.destination}</span>
                </div>

                <h3 className="font-display text-2xl sm:text-3xl text-[#F0E8D9] mb-3 font-medium">
                  {item.name}
                </h3>

                <p className="font-serif italic text-sm sm:text-base text-[#F0E8D9]/90 leading-relaxed mb-6 border-l-2 border-[#C6A36B]/40 pl-4 py-1">
                  "{item.fact}"
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <Link
                  to={`/ghost/${item.id}`}
                  onClick={() => playSignalPing(800)}
                  className="font-sans text-xs tracking-wider uppercase font-semibold text-[#C6A36B] hover:text-white transition-colors"
                >
                  DISCOVER ITS STORY ➔
                </Link>

                <button
                  onClick={() => {
                    playWhooshSound();
                    navigate(`/universe?planet=${item.id === 'opportunity' ? 'mars' : item.id === 'voyager-1' ? 'deep-space' : 'moon'}&target=${item.id}`);
                  }}
                  className="text-xs font-mono text-[#B6C0CC]/70 hover:text-[#C6A36B] transition-colors"
                >
                  Find on 3D Globe ↗
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= 4. A SHORT INTRODUCTION TO THE PROJECT ================= */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/10">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#C6A36B] block font-semibold">
            ABOUT THE PROJECT
          </span>
          <h2 className="font-display text-3xl sm:text-4xl text-[#F0E8D9] font-medium">
            Preserving Off-World Heritage
          </h2>
          <p className="text-sm sm:text-base text-[#B6C0CC] leading-relaxed font-light">
            When humanity launches a deep-space probe, there is no return voyage. When batteries drain and solar panels are engulfed by dust, these machines remain exactly where they finished their missions—as permanent monuments to human courage and curiosity.
          </p>
          <p className="text-xs sm:text-sm text-[#B6C0CC]/80 leading-relaxed font-light">
            SPACE GRAVEYARD was created to transform archival planetary science into an approachable digital museum. Whether you are a student exploring Mars for the first time or an educator seeking verified mission history, this platform makes our off-world heritage accessible to everyone.
          </p>
        </div>
      </section>

      {/* ================= 5. CONTINUE EXPLORING (TIMELINE & PLAY) ================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/10 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card: Timeline */}
          <div className="p-8 rounded-3xl bg-[#101A29]/80 border border-white/10 flex flex-col justify-between shadow-xl">
            <div>
              <div className="text-3xl mb-3">⏳</div>
              <span className="text-[10px] font-mono text-[#C6A36B] uppercase tracking-widest block mb-1">
                HISTORICAL CHRONOLOGY
              </span>
              <h3 className="font-display text-2xl text-[#F0E8D9] mb-2 font-medium">
                The Cosmic Timeline
              </h3>
              <p className="text-xs sm:text-sm text-[#B6C0CC] font-light leading-relaxed mb-6">
                Travel from the dawn of Sputnik in 1957 through the Apollo moon landings, outer planet flybys, and modern 2026 missions.
              </p>
            </div>
            <Link
              to="/timeline"
              onClick={() => playSignalPing(750)}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-[#C6A36B] text-[#F0E8D9] hover:text-[#080D16] font-sans text-xs font-semibold tracking-wider uppercase transition-all text-center"
            >
              EXPLORE TIMELINE →
            </Link>
          </div>

          {/* Card: Play Hub */}
          <div className="p-8 rounded-3xl bg-[#101A29]/80 border border-white/10 flex flex-col justify-between shadow-xl">
            <div>
              <div className="text-3xl mb-3">🎮</div>
              <span className="text-[10px] font-mono text-[#38bdf8] uppercase tracking-widest block mb-1">
                INTERACTIVE GAMES
              </span>
              <h3 className="font-display text-2xl text-[#F0E8D9] mb-2 font-medium">
                Space Play Hub
              </h3>
              <p className="text-xs sm:text-sm text-[#B6C0CC] font-light leading-relaxed mb-6">
                Take the Space Quiz, defend a deep-space probe from incoming asteroids, or solve realistic rover repair puzzles.
              </p>
            </div>
            <Link
              to="/play"
              onClick={() => playSignalPing(750)}
              className="px-6 py-3 rounded-xl bg-[#38bdf8] hover:bg-[#7dd3fc] text-[#080D16] font-sans text-xs font-bold tracking-wider uppercase transition-all text-center"
            >
              ENTER PLAY HUB →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
