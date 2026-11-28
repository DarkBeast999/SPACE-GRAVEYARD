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
      destination: 'Mars · Meridiani Planum',
      tag: 'Martian Surface Rover',
      fact: 'Designed for a 90-day mission, Opportunity operated for nearly 15 years and drove a marathon 45 km across Mars, uncovering ancient hematite blueberries and aqueous minerals.',
      img: heroOpportunity,
      accent: '#FF8D7B',
      border: 'hover:border-[#FF8D7B]/70 hover:shadow-[0_0_25px_rgba(255,141,123,0.2)]',
    },
    {
      id: 'voyager-1',
      name: 'Voyager 1',
      destination: 'Interstellar Space (> 24B km)',
      tag: 'Interstellar Messenger',
      fact: 'Humanity’s most distant machine has departed the heliosphere and travels through pristine interstellar plasma, carrying the Golden Record toward the constellation Ophiuchus.',
      img: null,
      accent: '#58D9FF',
      border: 'hover:border-[#58D9FF]/70 hover:shadow-[0_0_25px_rgba(88,217,255,0.2)]',
    },
    {
      id: 'eagle-descent-stage',
      name: 'Apollo 11 Eagle Descent Stage',
      destination: 'The Moon · Sea of Tranquility',
      tag: 'Historic Lunar Landmark',
      fact: 'The golden descent stage of humanity’s first crewed landing remains standing in the tranquil lunar regolith, its immortal plaque reading: "We came in peace for all mankind."',
      img: null,
      accent: '#C8D8EA',
      border: 'hover:border-[#C8D8EA]/70 hover:shadow-[0_0_25px_rgba(200,216,234,0.2)]',
    },
    {
      id: 'surveyor-3',
      name: 'Surveyor 3',
      destination: 'The Moon · Ocean of Storms',
      tag: 'Lunar Robotic Pioneer',
      fact: 'The only robotic craft ever visited by human beings on another celestial body: Apollo 12 astronauts Pete Conrad and Alan Bean landed within walking distance and retrieved its camera in 1969.',
      img: heroSurveyor3,
      accent: '#FFC66D',
      border: 'hover:border-[#FFC66D]/70 hover:shadow-[0_0_25px_rgba(255,198,109,0.2)]',
    },
  ];

  return (
    <div className="relative z-10 min-h-screen">
      {/* ================= 1. CINEMATIC PHOTOGRAPHIC HERO ================= */}
      <section className="relative min-h-[95vh] flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 pt-20 pb-24 overflow-hidden">
        {/* Archival Photography Foundation */}
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden bg-[#080B1D]">
          <img
            src={heroSurveyor3}
            alt="Apollo 12 astronaut Pete Conrad examining the Surveyor 3 robotic lander in Ocean of Storms on the Moon"
            className="w-full h-full object-cover object-[center_35%] filter brightness-[0.70] contrast-[1.12]"
          />
          {/* Layered cinematic gradients */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#080B1D]/80 via-[#080B1D]/45 to-[#080B1D]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080B1D] via-transparent to-[#080B1D]/60" />
        </div>

        {/* Clean, Impactful Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-[0.2em] text-[#F5F0E8] font-normal max-w-5xl leading-[1.05] mb-4 drop-shadow-2xl"
        >
          SPACE GRAVEYARD
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.25 }}
          className="font-serif italic text-2xl sm:text-4xl text-[#FFC66D] tracking-wide mb-6 font-light drop-shadow-lg"
        >
          They Never Came Home.
        </motion.p>

        {/* Lead Narrative */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-base sm:text-xl text-[#C8D8EA] max-w-2xl mx-auto leading-relaxed mb-10 font-sans font-light drop-shadow"
        >
          Explore the machines humanity sent into deep space and the off-world resting grounds where they remain.
        </motion.p>

        {/* Primary Call to Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55 }}
          className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6"
        >
          {/* Dominant 3D Universe Action */}
          <Link
            to="/universe"
            onClick={() => playWhooshSound()}
            className="w-full sm:w-auto px-10 py-4 rounded-xl text-xs font-sans tracking-[0.22em] uppercase text-[#080B1D] bg-gradient-to-r from-[#58D9FF] to-[#64E5C0] hover:brightness-110 shadow-[0_0_24px_rgba(88,217,255,0.4)] transition-all font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>🌐 ENTER THE 3D UNIVERSE</span>
            <span>→</span>
          </Link>

          <Link
            to="/explore"
            onClick={() => playSignalPing(750)}
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-xs font-sans tracking-[0.22em] uppercase text-[#F5F0E8] bg-[#111A35]/90 border border-white/20 hover:border-[#58D9FF] hover:text-[#58D9FF] transition-all backdrop-blur-md font-semibold cursor-pointer"
          >
            EXPLORE THE MISSIONS
          </Link>
        </motion.div>
      </section>

      {/* ================= 2. CHOOSE A DESTINATION (3D DIRECT PORTALS) ================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#58D9FF] block mb-2 font-semibold">
            OFF-WORLD EXPEDITION GATEWAYS
          </span>
          <h2 className="font-display text-3xl sm:text-4xl text-[#F5F0E8] font-medium">
            Choose Your Destination
          </h2>
          <p className="text-xs sm:text-sm text-[#C8D8EA] mt-2 font-light leading-relaxed">
            Step directly onto interactive 3D planetary environments to explore historical landing sites, rover traverses, and escaping messengers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              planet: 'moon',
              name: 'The Moon',
              icon: '🌕',
              desc: 'Tranquility Base, Ocean of Storms, and Apollo lunar monuments resting in permanent lunar silence.',
              tag: '12 Historical Landmarks',
              accent: '#C8D8EA',
              border: 'hover:border-[#C8D8EA]/80 hover:shadow-[0_0_30px_rgba(200,216,234,0.22)]',
              bg: 'bg-gradient-to-b from-[#111A35]/90 via-[#0C1328]/90 to-[#080B1D]/90',
            },
            {
              planet: 'mars',
              name: 'Mars',
              icon: '🔴',
              desc: 'Meridiani Planum, Gale Crater, and decades of intrepid robotic rover discoveries across red sands.',
              tag: '10 Surface Explorers',
              accent: '#FF8D7B',
              border: 'hover:border-[#FF8D7B]/80 hover:shadow-[0_0_30px_rgba(255,141,123,0.22)]',
              bg: 'bg-gradient-to-b from-[#1D1B35]/90 via-[#151124]/90 to-[#080B1D]/90',
            },
            {
              planet: 'saturn',
              name: 'Saturn',
              icon: '🪐',
              desc: 'Majestic ice rings, icy ocean moons, and Cassini’s daring Grand Finale plunge into the gas giant.',
              tag: 'Cassini & Rings',
              accent: '#FFC66D',
              border: 'hover:border-[#FFC66D]/80 hover:shadow-[0_0_30px_rgba(255,198,109,0.22)]',
              bg: 'bg-gradient-to-b from-[#1C2235]/90 via-[#171826]/90 to-[#080B1D]/90',
            },
            {
              planet: 'deep-space',
              name: 'Deep Space',
              icon: '🌌',
              desc: 'Voyagers and Pioneers escaping the solar wind into the boundless dark of the interstellar ocean.',
              tag: 'Interstellar Fleet',
              accent: '#58D9FF',
              border: 'hover:border-[#58D9FF]/80 hover:shadow-[0_0_30px_rgba(88,217,255,0.25)]',
              bg: 'bg-gradient-to-b from-[#11223E]/90 via-[#0C162B]/90 to-[#080B1D]/90',
            },
          ].map((dest) => (
            <div
              key={dest.planet}
              onClick={() => {
                playWhooshSound();
                navigate(`/universe?planet=${dest.planet}`);
              }}
              className={`p-6 rounded-3xl ${dest.bg} border border-white/10 ${dest.border} cursor-pointer transition-all duration-300 flex flex-col justify-between group backdrop-blur-sm shadow-xl`}
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

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono font-medium" style={{ color: dest.accent }}>
                <span>{dest.tag}</span>
                <span className="group-hover:translate-x-1 transition-transform">Enter Gateway →</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= 3. DISCOVER THE FORGOTTEN EXPLORERS ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 pb-4 border-b border-white/10">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#FFC66D] block mb-2 font-semibold">
              FEATURED DISCOVERIES
            </span>
            <h2 className="font-display text-3xl sm:text-4xl text-[#F5F0E8] font-medium">
              Curated Museum Exhibits
            </h2>
          </div>
          <Link
            to="/explore"
            onClick={() => playSignalPing(700)}
            className="mt-4 sm:mt-0 text-xs font-sans tracking-[0.2em] text-[#58D9FF] hover:text-white transition-colors flex items-center gap-1.5 uppercase font-semibold cursor-pointer"
          >
            <span>View All 28 Explorers</span>
            <span>→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featuredList.map((item) => (
            <div
              key={item.id}
              className={`p-8 rounded-3xl bg-[#111A35]/80 border border-white/10 ${item.border} transition-all duration-300 flex flex-col justify-between shadow-xl backdrop-blur-sm group`}
            >
              <div>
                <div className="flex items-center justify-between mb-3 text-xs font-mono">
                  <span className="font-semibold text-xs tracking-wider" style={{ color: item.accent }}>
                    {item.tag}
                  </span>
                  <span className="text-[#C8D8EA]/80 font-mono text-[11px]">📍 {item.destination}</span>
                </div>

                <h3 className="font-display text-2xl sm:text-3xl text-[#F5F0E8] group-hover:text-white transition-colors mb-3 font-medium">
                  {item.name}
                </h3>

                <p className="font-serif italic text-sm sm:text-base text-[#F5F0E8]/90 leading-relaxed mb-6 border-l-2 pl-4 py-1 font-light" style={{ borderLeftColor: item.accent }}>
                  "{item.fact}"
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <Link
                  to={`/ghost/${item.id}`}
                  onClick={() => playSignalPing(800)}
                  className="font-sans text-xs tracking-wider uppercase font-semibold text-[#FFC66D] hover:text-white transition-colors cursor-pointer"
                >
                  DISCOVER ITS STORY →
                </Link>

                <button
                  onClick={() => {
                    playWhooshSound();
                    navigate(`/universe?planet=${item.id === 'opportunity' ? 'mars' : item.id === 'voyager-1' ? 'deep-space' : 'moon'}&target=${item.id}`);
                  }}
                  className="text-xs font-mono text-[#C8D8EA]/75 hover:text-[#58D9FF] transition-colors cursor-pointer"
                >
                  Find in 3D Universe ↗
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= 4. A SHORT INTRODUCTION TO THE PROJECT ================= */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/10">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#58D9FF] block font-semibold">
            ABOUT THE PROJECT
          </span>
          <h2 className="font-display text-3xl sm:text-4xl text-[#F5F0E8] font-medium">
            Preserving Off-World Heritage
          </h2>
          <p className="text-sm sm:text-base text-[#C8D8EA] leading-relaxed font-light">
            When humanity launches a deep-space probe, there is no return voyage. When batteries drain and solar panels are engulfed by Martian dust or frozen in interstellar vacuum, these machines remain exactly where they finished their missions—as permanent monuments to human courage and scientific curiosity.
          </p>
          <p className="text-xs sm:text-sm text-[#C8D8EA]/75 leading-relaxed font-light">
            SPACE GRAVEYARD was created to transform archival planetary science into an approachable digital museum. Whether you are a student exploring Mars for the first time or an educator seeking verified mission history, this platform makes our off-world heritage accessible to everyone.
          </p>
        </div>
      </section>

      {/* ================= 5. CONTINUE EXPLORING (TIMELINE & PLAY) ================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/10 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card: Timeline */}
          <div className="p-8 rounded-3xl bg-[#111A35]/80 border border-white/10 hover:border-[#FFC66D]/50 transition-all flex flex-col justify-between shadow-xl">
            <div>
              <div className="text-3xl mb-3">⏳</div>
              <span className="text-[10px] font-mono text-[#FFC66D] uppercase tracking-widest block mb-1 font-semibold">
                HISTORICAL CHRONOLOGY
              </span>
              <h3 className="font-display text-2xl text-[#F5F0E8] mb-2 font-medium">
                The Cosmic Timeline
              </h3>
              <p className="text-xs sm:text-sm text-[#C8D8EA] font-light leading-relaxed mb-6">
                Travel from the dawn of Sputnik in 1957 through the Apollo moon landings, outer planet flybys, and modern 2026 missions.
              </p>
            </div>
            <Link
              to="/timeline"
              onClick={() => playSignalPing(750)}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-[#FFC66D] text-[#F5F0E8] hover:text-[#080B1D] font-sans text-xs font-semibold tracking-wider uppercase transition-all text-center cursor-pointer"
            >
              EXPLORE TIMELINE →
            </Link>
          </div>

          {/* Card: Play Hub */}
          <div className="p-8 rounded-3xl bg-[#111A35]/80 border border-white/10 hover:border-[#58D9FF]/50 transition-all flex flex-col justify-between shadow-xl">
            <div>
              <div className="text-3xl mb-3">🎮</div>
              <span className="text-[10px] font-mono text-[#58D9FF] uppercase tracking-widest block mb-1 font-semibold">
                INTERACTIVE ARCADE
              </span>
              <h3 className="font-display text-2xl text-[#F5F0E8] mb-2 font-medium">
                Space Play Hub
              </h3>
              <p className="text-xs sm:text-sm text-[#C8D8EA] font-light leading-relaxed mb-6">
                Test your astronautics skills across four challenging simulations: Lunar Lander, Asteroid Defender, Mission Repair, and the Space Quiz.
              </p>
            </div>
            <Link
              to="/play"
              onClick={() => playSignalPing(750)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#58D9FF] to-[#64E5C0] hover:brightness-110 text-[#080B1D] font-sans text-xs font-bold tracking-wider uppercase transition-all text-center cursor-pointer shadow-[0_0_15px_rgba(88,217,255,0.3)]"
            >
              ENTER PLAY HUB →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
