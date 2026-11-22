import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { playSignalPing, playWhooshSound } from '../utils/audio';

type TopicCategory = 'engineering' | 'worlds' | 'science' | 'missions' | 'communication';

export const KnowledgeCentrePage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<TopicCategory>('engineering');

  const categories = [
    { id: 'engineering' as TopicCategory, label: 'Spacecraft Engineering', icon: '🛠️' },
    { id: 'worlds' as TopicCategory, label: 'Worlds We Explore', icon: '🪐' },
    { id: 'science' as TopicCategory, label: 'Science & Discoveries', icon: '🔬' },
    { id: 'missions' as TopicCategory, label: 'Famous Missions Explained', icon: '🚀' },
    { id: 'communication' as TopicCategory, label: 'Space Communication', icon: '📡' },
  ];

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
      {/* Top Breadcrumb & Header */}
      <div className="mb-10 pb-8 border-b border-white/10">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#C6A36B] mb-2 font-semibold">
          <span>✦</span>
          <span>COMPREHENSIVE SPACE KNOWLEDGE CENTRE // FOR EDUCATORS &amp; CURIOUS MINDS</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-[#F0E8D9] font-normal tracking-tight">
          How Space Exploration Works
        </h1>
        <p className="text-sm sm:text-base text-[#B6C0CC] mt-3 font-light max-w-3xl leading-relaxed">
          A structured educational guide exploring how robotic spacecraft survive the vacuum of space, how rovers navigate off-world terrain, why communication takes hours, and what humanity has discovered across the Solar System.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2.5 mb-10 pb-4 border-b border-white/10">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              playSignalPing(700);
              setActiveCategory(cat.id);
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-sans font-medium transition-all flex items-center gap-2 shadow-sm ${
              activeCategory === cat.id
                ? 'bg-[#C6A36B] text-[#080D16] font-bold shadow-md'
                : 'bg-[#101A29] text-[#B6C0CC] hover:text-[#F0E8D9] border border-white/10'
            }`}
          >
            <span className="text-sm">{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* ================= SECTION A: SPACECRAFT ENGINEERING ================= */}
      {activeCategory === 'engineering' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Intro Card */}
          <div className="p-8 rounded-3xl bg-[#101A29]/80 border border-white/10 shadow-xl backdrop-blur-md">
            <h2 className="font-display text-2xl sm:text-3xl text-[#F0E8D9] mb-3 font-medium">
              Designing Machines for the Cosmic Vacuum
            </h2>
            <p className="text-sm text-[#B6C0CC] leading-relaxed font-light">
              Unlike cars or airplanes on Earth, spacecraft cannot rely on atmospheric air for combustion, cooling, or aerodynamic lift. Every robotic explorer must carry its own power generation, thermal management, autonomous computing, and directional antennas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Topic 1: How Rovers Move */}
            <div className="p-7 rounded-2xl bg-[#080D16]/90 border border-white/10 shadow-lg space-y-3">
              <div className="text-2xl">🚜</div>
              <h3 className="font-display text-xl text-[#F0E8D9]">The Rocker-Bogie Mobility System</h3>
              <p className="text-xs text-[#B6C0CC] leading-relaxed font-light">
                Rovers like Spirit, Opportunity, Curiosity, and Perseverance do not have traditional springs or shock absorbers, which would freeze or snap in extreme Martian cold. Instead, they use a mechanical linkage called the <strong>rocker-bogie system</strong>.
              </p>
              <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-[11px] font-mono text-[#C6A36B]">
                KEY ADVANTAGE: Distributes the rover's weight equally across all six wheels, allowing it to climb over obstacles larger than the wheel diameter without tipping over.
              </div>
            </div>

            {/* Topic 2: Generating Electricity */}
            <div className="p-7 rounded-2xl bg-[#080D16]/90 border border-white/10 shadow-lg space-y-3">
              <div className="text-2xl">⚡</div>
              <h3 className="font-display text-xl text-[#F0E8D9]">Power: Solar vs. Nuclear RTGs</h3>
              <p className="text-xs text-[#B6C0CC] leading-relaxed font-light">
                Close to the Sun (Mercury, Moon, Mars), spacecraft generate power using silicon or gallium-arsenide <strong>photovoltaic solar panels</strong>. But in the outer Solar System where sunlight is weak, or on dust-prone planets, engineers use <strong>Radioisotope Thermoelectric Generators (RTGs)</strong>.
              </p>
              <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-[11px] font-mono text-[#38bdf8]">
                RTG PRINCIPLE: Plutonium-238 natural radioactive decay generates heat, which thermocouples convert directly into electricity for 40+ years without sunlight!
              </div>
            </div>

            {/* Topic 3: Surviving Thermal Extremes */}
            <div className="p-7 rounded-2xl bg-[#080D16]/90 border border-white/10 shadow-lg space-y-3">
              <div className="text-2xl">🌡️</div>
              <h3 className="font-display text-xl text-[#F0E8D9]">Surviving -150°C to +120°C Extremes</h3>
              <p className="text-xs text-[#B6C0CC] leading-relaxed font-light">
                On the Moon and in deep space, there is no air to moderate temperature. Surfaces baking in direct sunlight can reach +120°C (+250°F), while shaded surfaces plunge to -150°C (-238°F).
              </p>
              <p className="text-xs text-[#B6C0CC] leading-relaxed font-light">
                Engineers wrap spacecraft in gold or amber multi-layer insulation (MLI) blankets and install internal electrical survival heaters to keep sensitive electronics warm.
              </p>
            </div>

            {/* Topic 4: Why Off-World Repair is Impossible */}
            <div className="p-7 rounded-2xl bg-[#080D16]/90 border border-white/10 shadow-lg space-y-3">
              <div className="text-2xl">🛡️</div>
              <h3 className="font-display text-xl text-[#F0E8D9]">Redundancy &amp; Autonomous Recovery</h3>
              <p className="text-xs text-[#B6C0CC] leading-relaxed font-light">
                Once a probe leaves Earth orbit, no mechanic can reach it. Spacecraft are designed with dual redundant computers (Side-A and Side-B), backup gyroscopes, and autonomous "safe mode" software that automatically points solar panels at the Sun if an anomaly occurs.
              </p>
              <Link
                to="/universe?planet=mars"
                onClick={() => playWhooshSound()}
                className="text-xs font-mono text-[#C6A36B] hover:underline inline-block pt-1"
              >
                Inspect Martian Rovers in 3D Universe →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ================= SECTION B: WORLDS WE EXPLORE ================= */}
      {activeCategory === 'worlds' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="p-8 rounded-3xl bg-[#101A29]/80 border border-white/10 shadow-xl backdrop-blur-md">
            <h2 className="font-display text-2xl sm:text-3xl text-[#F0E8D9] mb-3 font-medium">
              Environments Across the Solar System
            </h2>
            <p className="text-sm text-[#B6C0CC] leading-relaxed font-light">
              Each destination presents completely unique gravitational, atmospheric, and radiation challenges for human engineering.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* The Moon */}
            <div className="p-6 rounded-2xl bg-[#080D16]/90 border border-white/10 shadow-lg space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-2xl">🌕</span>
                <span className="text-[10px] font-mono text-[#C6A36B] bg-white/5 px-2 py-0.5 rounded">0.166 G (1/6 Earth)</span>
              </div>
              <h3 className="font-display text-xl text-[#F0E8D9]">The Moon</h3>
              <p className="text-xs text-[#B6C0CC] leading-relaxed font-light">
                Airless vacuum covered by razor-sharp, electrostatic lunar regolith (pulverized volcanic glass and basalt). Night lasts 14 Earth days with temperatures falling to -170°C.
              </p>
              <Link
                to="/universe?planet=moon"
                onClick={() => playWhooshSound()}
                className="text-xs font-mono text-[#C6A36B] hover:underline inline-block pt-2"
              >
                Explore 3D Moon Globe →
              </Link>
            </div>

            {/* Mars */}
            <div className="p-6 rounded-2xl bg-[#080D16]/90 border border-white/10 shadow-lg space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-2xl">🔴</span>
                <span className="text-[10px] font-mono text-[#C6A36B] bg-white/5 px-2 py-0.5 rounded">0.38 G (38% Earth)</span>
              </div>
              <h3 className="font-display text-xl text-[#F0E8D9]">Mars</h3>
              <p className="text-xs text-[#B6C0CC] leading-relaxed font-light">
                Thin carbon dioxide atmosphere (under 1% Earth sea-level pressure). Cold desert plagued by regional and planet-encircling dust storms that block sunlight for months.
              </p>
              <Link
                to="/universe?planet=mars"
                onClick={() => playWhooshSound()}
                className="text-xs font-mono text-[#C6A36B] hover:underline inline-block pt-2"
              >
                Explore 3D Mars Globe →
              </Link>
            </div>

            {/* Venus */}
            <div className="p-6 rounded-2xl bg-[#080D16]/90 border border-white/10 shadow-lg space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-2xl">🟡</span>
                <span className="text-[10px] font-mono text-[#C6A36B] bg-white/5 px-2 py-0.5 rounded">0.90 G (90% Earth)</span>
              </div>
              <h3 className="font-display text-xl text-[#F0E8D9]">Venus</h3>
              <p className="text-xs text-[#B6C0CC] leading-relaxed font-light">
                Runaway greenhouse effect. Crushing carbon dioxide atmosphere 92 times heavier than Earth, with sulfuric acid clouds and surface temperatures of +465°C—hot enough to melt lead!
              </p>
              <Link
                to="/universe?planet=venus"
                onClick={() => playWhooshSound()}
                className="text-xs font-mono text-[#C6A36B] hover:underline inline-block pt-2"
              >
                Explore 3D Venus Globe →
              </Link>
            </div>

            {/* Outer Gas Giants */}
            <div className="p-6 rounded-2xl bg-[#080D16]/90 border border-white/10 shadow-lg space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-2xl">🪐</span>
                <span className="text-[10px] font-mono text-[#C6A36B] bg-white/5 px-2 py-0.5 rounded">Gas &amp; Ice Giants</span>
              </div>
              <h3 className="font-display text-xl text-[#F0E8D9]">Jupiter &amp; Saturn</h3>
              <p className="text-xs text-[#B6C0CC] leading-relaxed font-light">
                No solid surfaces; swirling hydrogen-helium atmospheres harboring oceans of liquid metallic hydrogen, intense radiation belts, and fascinating icy moons like Europa and Enceladus.
              </p>
            </div>

            {/* Deep Interstellar Space */}
            <div className="p-6 rounded-2xl bg-[#080D16]/90 border border-white/10 shadow-lg space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-2xl">🌌</span>
                <span className="text-[10px] font-mono text-[#C6A36B] bg-white/5 px-2 py-0.5 rounded">&gt; 120 AU</span>
              </div>
              <h3 className="font-display text-xl text-[#F0E8D9]">Interstellar Space</h3>
              <p className="text-xs text-[#B6C0CC] leading-relaxed font-light">
                Beyond the heliopause where the Sun's solar wind halts against the interstellar medium of our galaxy. Traversed only by Voyager 1 and Voyager 2.
              </p>
              <Link
                to="/universe?planet=deep-space"
                onClick={() => playWhooshSound()}
                className="text-xs font-mono text-[#C6A36B] hover:underline inline-block pt-2"
              >
                Explore Deep Space in 3D →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ================= SECTION C: SCIENCE & DISCOVERIES ================= */}
      {activeCategory === 'science' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="p-8 rounded-3xl bg-[#101A29]/80 border border-white/10 shadow-xl backdrop-blur-md">
            <h2 className="font-display text-2xl sm:text-3xl text-[#F0E8D9] mb-3 font-medium">
              Transforming Human Science Through Robotic Pioneers
            </h2>
            <p className="text-sm text-[#B6C0CC] leading-relaxed font-light">
              Every robotic machine was built with scientific instruments—spectrometers, seismometers, microscopes, and cameras—that answered fundamental questions about our origins.
            </p>
          </div>

          <div className="space-y-6">
            {/* Discovery 1: Liquid Water on Mars */}
            <div className="p-7 rounded-2xl bg-[#080D16]/90 border border-white/10 space-y-3">
              <span className="text-xs font-mono text-[#38bdf8] uppercase tracking-wider font-semibold">
                DISCOVERY 01 // MARTIAN HYDROLOGY
              </span>
              <h3 className="font-display text-2xl text-[#F0E8D9]">Proof of Ancient Liquid Water on Mars</h3>
              <p className="text-sm text-[#B6C0CC] leading-relaxed font-light">
                <strong>What scientists wanted to know:</strong> Was Mars always a frozen, dead desert, or was it once warm and wet enough to support life?
              </p>
              <p className="text-sm text-[#B6C0CC] leading-relaxed font-light">
                <strong>How rovers solved it:</strong> Opportunity discovered hematite spherules (nicknamed "blueberries") that only crystallize inside standing liquid water, and Curiosity discovered rounded river pebbles in ancient lakebed mudstones.
              </p>
              <div className="p-3.5 bg-black/40 rounded-xl border border-white/5 text-xs text-[#F0E8D9] font-serif italic">
                Why this matters: Confirmed that Mars had habitable lakes and rivers for hundreds of millions of years in its ancient past.
              </div>
            </div>

            {/* Discovery 2: The Moon's Cataclysmic Origin */}
            <div className="p-7 rounded-2xl bg-[#080D16]/90 border border-white/10 space-y-3">
              <span className="text-xs font-mono text-[#C6A36B] uppercase tracking-wider font-semibold">
                DISCOVERY 02 // LUNAR FORMATION
              </span>
              <h3 className="font-display text-2xl text-[#F0E8D9]">The Giant Impact Hypothesis</h3>
              <p className="text-sm text-[#B6C0CC] leading-relaxed font-light">
                <strong>What scientists wanted to know:</strong> How did Earth obtain such an unusually large Moon?
              </p>
              <p className="text-sm text-[#B6C0CC] leading-relaxed font-light">
                <strong>How lunar missions solved it:</strong> Analysis of 382 kg of lunar rocks retrieved by Apollo missions showed identical oxygen isotope ratios to Earth's mantle, yet an almost total absence of volatile water or iron core.
              </p>
              <div className="p-3.5 bg-black/40 rounded-xl border border-white/5 text-xs text-[#F0E8D9] font-serif italic">
                Why this matters: Proved the Moon formed 4.5 billion years ago when a Mars-sized protoplanet (Theia) collided with the young Earth.
              </div>
            </div>

            {/* Discovery 3: Ocean Moons */}
            <div className="p-7 rounded-2xl bg-[#080D16]/90 border border-white/10 space-y-3">
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-semibold">
                DISCOVERY 03 // ASTROBIOLOGY
              </span>
              <h3 className="font-display text-2xl text-[#F0E8D9]">Subsurface Oceans Beneath Outer Moons</h3>
              <p className="text-sm text-[#B6C0CC] leading-relaxed font-light">
                Cassini flew directly through water-ice vapor geysers erupting from Saturn's moon Enceladus, tasting complex organic molecules and hydrothermal salts. This revealed that the most habitable environments in the Solar System might be dark oceans trapped beneath outer icy crusts.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= SECTION D: FAMOUS MISSIONS EXPLAINED ================= */}
      {activeCategory === 'missions' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="p-8 rounded-3xl bg-[#101A29]/80 border border-white/10 shadow-xl backdrop-blur-md">
            <h2 className="font-display text-2xl sm:text-3xl text-[#F0E8D9] mb-3 font-medium">
              Historic Mission Case Studies
            </h2>
            <p className="text-sm text-[#B6C0CC] leading-relaxed font-light">
              Detailed examinations of milestone missions that revolutionized spaceflight architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Voyager */}
            <div className="p-7 rounded-2xl bg-[#080D16]/90 border border-white/10 shadow-lg space-y-3">
              <div className="flex justify-between items-baseline">
                <h3 className="font-display text-2xl text-[#F0E8D9]">Voyager 1 &amp; 2</h3>
                <span className="font-mono text-xs text-[#C6A36B]">1977 — PRESENT</span>
              </div>
              <p className="text-xs text-[#B6C0CC] leading-relaxed font-light">
                Took advantage of a rare planetary alignment occurring once every 175 years to execute a four-planet "Grand Tour" using gravitational slingshots without consuming massive rocket fuel.
              </p>
              <Link
                to="/ghost/voyager-1"
                onClick={() => playSignalPing(800)}
                className="text-xs font-mono text-[#C6A36B] hover:underline inline-block pt-1"
              >
                Read Voyager 1 Full Dossier →
              </Link>
            </div>

            {/* Spirit & Opportunity */}
            <div className="p-7 rounded-2xl bg-[#080D16]/90 border border-white/10 shadow-lg space-y-3">
              <div className="flex justify-between items-baseline">
                <h3 className="font-display text-2xl text-[#F0E8D9]">Spirit &amp; Opportunity</h3>
                <span className="font-mono text-xs text-[#C6A36B]">2004 — 2018</span>
              </div>
              <p className="text-xs text-[#B6C0CC] leading-relaxed font-light">
                Bounced onto Mars inside cocoon airbags, deploying solar arrays to embark on a 90-day mission that expanded into nearly 15 years of continuous off-world exploration.
              </p>
              <Link
                to="/ghost/opportunity"
                onClick={() => playSignalPing(800)}
                className="text-xs font-mono text-[#C6A36B] hover:underline inline-block pt-1"
              >
                Read Opportunity Full Dossier →
              </Link>
            </div>

            {/* Apollo Lunar Gear */}
            <div className="p-7 rounded-2xl bg-[#080D16]/90 border border-white/10 shadow-lg space-y-3">
              <div className="flex justify-between items-baseline">
                <h3 className="font-display text-2xl text-[#F0E8D9]">Apollo Lunar Modules</h3>
                <span className="font-mono text-xs text-[#C6A36B]">1969 — 1972</span>
              </div>
              <p className="text-xs text-[#B6C0CC] leading-relaxed font-light">
                Six golden descent stages remain on the Moon. Serving as launch pads for the upper crew ascent stage, they carried the earliest robotic experiments, rover buggies, and retroreflectors left on the lunar surface.
              </p>
              <Link
                to="/ghost/eagle-descent-stage"
                onClick={() => playSignalPing(800)}
                className="text-xs font-mono text-[#C6A36B] hover:underline inline-block pt-1"
              >
                Read Apollo 11 Eagle Dossier →
              </Link>
            </div>

            {/* Cassini-Huygens */}
            <div className="p-7 rounded-2xl bg-[#080D16]/90 border border-white/10 shadow-lg space-y-3">
              <div className="flex justify-between items-baseline">
                <h3 className="font-display text-2xl text-[#F0E8D9]">Cassini-Huygens</h3>
                <span className="font-mono text-xs text-[#C6A36B]">1997 — 2017</span>
              </div>
              <p className="text-xs text-[#B6C0CC] leading-relaxed font-light">
                Delivered ESA's Huygens probe to parachute onto the frozen shores of Titan's methane lakes, completing 22 suicidal dives between Saturn and its rings before plunging into the planet.
              </p>
              <Link
                to="/ghost/cassini"
                onClick={() => playSignalPing(800)}
                className="text-xs font-mono text-[#C6A36B] hover:underline inline-block pt-1"
              >
                Read Cassini Full Dossier →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ================= SECTION E: HOW WE COMMUNICATE WITH SPACE ================= */}
      {activeCategory === 'communication' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="p-8 rounded-3xl bg-[#101A29]/80 border border-white/10 shadow-xl backdrop-blur-md">
            <h2 className="font-display text-2xl sm:text-3xl text-[#F0E8D9] mb-3 font-medium">
              Whispering Across Billions of Kilometers
            </h2>
            <p className="text-sm text-[#B6C0CC] leading-relaxed font-light">
              By the time a radio signal from Mars or Saturn reaches Earth, its power is measured in billionths of a billionth of a watt (attowatts)—far weaker than the electrical signal in a wristwatch battery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-7 rounded-2xl bg-[#080D16]/90 border border-white/10 space-y-3">
              <div className="text-2xl">📡</div>
              <h3 className="font-display text-xl text-[#F0E8D9]">The NASA Deep Space Network (DSN)</h3>
              <p className="text-xs text-[#B6C0CC] leading-relaxed font-light">
                To capture these unimaginably faint signals, NASA maintains three giant ground station complexes spaced 120° apart around the globe: Goldstone (California), Madrid (Spain), and Canberra (Australia).
              </p>
              <p className="text-xs text-[#B6C0CC] leading-relaxed font-light">
                As Earth rotates, communication hands off smoothly from one station to the next, guaranteeing 24/7 continuous tracking of deep-space probes.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-[#080D16]/90 border border-white/10 space-y-3">
              <div className="text-2xl">⏳</div>
              <h3 className="font-display text-xl text-[#F0E8D9]">Speed-of-Light Time Delays</h3>
              <p className="text-xs text-[#B6C0CC] leading-relaxed font-light">
                Nothing travels faster than light (<span className="text-[#38bdf8] font-mono">299,792 km/s</span>). This introduces inescapable delay:
              </p>
              <ul className="text-xs font-mono space-y-1 text-[#B6C0CC] bg-black/40 p-3 rounded-xl border border-white/5">
                <li>• Moon: ~1.3 seconds each way</li>
                <li>• Mars: 4 to 24 minutes each way (depends on orbits)</li>
                <li>• Jupiter: 33 to 53 minutes each way</li>
                <li>• Voyager 1: Over 23 hours each way!</li>
              </ul>
              <p className="text-xs text-[#B6C0CC] leading-relaxed font-light">
                Because of this delay, rovers cannot be driven with real-time joysticks. They must use autonomous stereo hazard cameras to drive themselves safely.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer Navigation Back to 3D Universe */}
      <div className="mt-14 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
        <Link to="/explore" className="text-[#B6C0CC] hover:text-white transition-colors">
          ← VIEW ALL 28 MONUMENTS
        </Link>
        <Link
          to="/universe"
          onClick={() => playWhooshSound()}
          className="text-[#C6A36B] hover:underline flex items-center gap-1 font-semibold"
        >
          <span>ENTER THE 3D UNIVERSE</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
};
