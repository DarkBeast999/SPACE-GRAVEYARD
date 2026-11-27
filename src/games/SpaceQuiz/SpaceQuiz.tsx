import React, { useState, useMemo } from 'react';
import { QuizQuestion } from '../types';
import {
  playSignalPing,
  playSuccessChime,
  playErrorBuzz,
} from '../../utils/audio';

const QUESTION_BANK: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'Which Mars rover was designed for a 90-sol mission but operated for over 14 years, driving an off-world marathon of 45.16 kilometers?',
    options: ['Curiosity', 'Opportunity (MER-B)', 'Sojourner', 'Spirit (MER-A)'],
    correctIndex: 1,
    explanation: 'Opportunity landed in Meridiani Planum in 2004 with a 90-sol nominal lifespan, surviving for 5,111 sols until the 2018 global Martian dust storm.',
    category: 'Mars',
  },
  {
    id: 'q2',
    question: 'Which human-made spacecraft was the first to cross the heliopause into interstellar space in August 2012?',
    options: ['Pioneer 10', 'New Horizons', 'Voyager 1', 'Voyager 2'],
    correctIndex: 2,
    explanation: 'Voyager 1 crossed into interstellar space at 121 AU in August 2012, detecting a sudden drop in solar particles and a 100-fold spike in galactic cosmic rays.',
    category: 'Deep Space',
  },
  {
    id: 'q3',
    question: 'What extraordinary event occurred on the Moon when Apollo 12 Commander Pete Conrad and Alan Bean landed in November 1969?',
    options: [
      'They walked 180 meters over to the robotic lander Surveyor 3 and retrieved its camera',
      'They discovered liquid water ice in Oceanus Procellarum',
      'They drove the first motorized lunar rover up Stone Mountain',
      'They witnessed a volcanic eruption in Copernicus crater',
    ],
    correctIndex: 0,
    explanation: 'Apollo 12 proved pinpoint landing accuracy by touching down 183 meters from Surveyor 3, allowing Conrad and Bean to inspect the probe and return its camera to Earth.',
    category: 'Moon',
  },
  {
    id: 'q4',
    question: 'How did the robotic rover Spirit uncover evidence of ancient hydrothermal volcanic hot springs on Mars?',
    options: [
      'By drilling with a diamond-tipped core bit into Mount Sharp',
      'By dragging its seized right-front wheel backward, which scraped away topsoil to expose pure silica',
      'By deploying an infrared radar sounder through the permafrost',
      'By analyzing dust dropped onto its solar array panels',
    ],
    correctIndex: 1,
    explanation: 'When Spirit’s front wheel jammed in 2006, the rover drove backward, plowing a trench at Home Plate that exposed 90% pure amorphous silica formed by volcanic fumaroles.',
    category: 'Mars',
  },
  {
    id: 'q5',
    question: 'What do the Lunar Laser Ranging Retroreflectors placed by Apollo 11, 14, 15 and Soviet Lunokhod rovers prove about the Moon?',
    options: [
      'The Moon is falling toward Earth by 1 meter per century',
      'The Moon recedes from Earth at approximately 3.8 centimeters per year due to tidal deceleration',
      'The Moon has an active molten core of pure uranium',
      'The Moon’s surface reflects 99% of ambient solar radiation',
    ],
    correctIndex: 1,
    explanation: 'Continuous laser pulses fired from Earth observatories bounce off these quartz prism arrays, measuring distance to millimeter precision and proving tidal drift.',
    category: 'Moon',
  },
  {
    id: 'q6',
    question: 'Which aircraft made history in April 2021 by achieving humanity’s first powered, controlled aerodynamic flight on another planet?',
    options: ['Dragonfly Rotorcraft', 'Sojourner Flyer', 'Ingenuity Mars Helicopter', 'Vega Balloon Probe'],
    correctIndex: 2,
    explanation: 'Ingenuity flew 72 historic flights across Jezero Crater, proving rotorcraft flight is possible in Mars’s 1% air density using twin counter-rotating carbon blades.',
    category: 'Mars',
  },
  {
    id: 'q7',
    question: 'What is the "Pale Blue Dot," photographed by Voyager 1 on February 14, 1990?',
    options: [
      'A massive atmospheric storm discovered on Neptune',
      'A photograph of Earth taken from 6 billion kilometers away, showing our planet as a fraction of a single pixel',
      'The first close-up portrait of the icy surface of Pluto',
      'The glow of ionized plasma at the solar system termination shock',
    ],
    correctIndex: 1,
    explanation: 'Suggested by Carl Sagan, Voyager 1 looked backward to capture Earth suspended in a scattered sunbeam as a tiny speck of light in the vast cosmic dark.',
    category: 'Deep Space',
  },
  {
    id: 'q8',
    question: 'Which Apollo mission carried the first professional geologist to walk on the Moon, discovering orange volcanic glass beads in Taurus-Littrow?',
    options: ['Apollo 11', 'Apollo 14', 'Apollo 15', 'Apollo 17'],
    correctIndex: 3,
    explanation: 'Apollo 17 carried Dr. Harrison "Jack" Schmitt, who discovered 3.6-billion-year-old pyroclastic glass beads erupted from ancient lunar fire fountains.',
    category: 'Moon',
  },
  {
    id: 'q9',
    question: 'What revolutionary landing architecture was developed to safely lower the one-ton Curiosity rover to the floor of Gale Crater in 2012?',
    options: ['Inflatable giant multi-layer airbags', 'The rocket-powered Sky Crane descent stage', 'A gliding parafoil wing', 'A massive crushable aluminum honeycomb cylinder'],
    correctIndex: 1,
    explanation: 'Curiosity was too heavy for airbags; the Sky Crane hovered on rocket thrusters 20 meters above the ground and lowered the rover on nylon bridles.',
    category: 'Mars',
  },
  {
    id: 'q10',
    question: 'Which mission executed humanity’s first soft landing on the permanently hidden far side of the Moon in January 2019?',
    options: ['Luna 24', 'Apollo 18', 'Chang’e 4', 'Chandrayaan-2'],
    correctIndex: 2,
    explanation: 'Chang’e 4 touched down inside Von Kármán crater in the South Pole-Aitken basin, communicating via the Queqiao relay satellite at the Earth-Moon L2 point.',
    category: 'Moon',
  },
  {
    id: 'q11',
    question: 'Why did NASA choose to plunge the Cassini spacecraft into Saturn’s atmosphere at the end of its mission in September 2017?',
    options: [
      'To test how deep a spacecraft could penetrate before burning up',
      'To prevent an accidental collision that might contaminate the pristine subsurface oceans of Enceladus or Titan with Earth microbes',
      'Because its high-gain antenna snapped off in the rings',
      'To create a bright flash visible to Earth telescopes',
    ],
    correctIndex: 1,
    explanation: 'Under planetary protection guidelines, Cassini performed the Grand Finale plunge to permanently protect Enceladus’s habitable ocean from biological contamination.',
    category: 'Saturn',
  },
  {
    id: 'q12',
    question: 'What world-record distance was set by the Soviet Lunokhod 2 rover in 1973, which remained unbeaten for over forty years?',
    options: ['12.4 kilometers', '24.8 kilometers', '39 kilometers', '68 kilometers'],
    correctIndex: 2,
    explanation: 'Lunokhod 2 drove 39 kilometers across Le Monnier crater in just four months, setting an off-world distance record until Opportunity broke it on Mars in 2014.',
    category: 'Moon',
  },
  {
    id: 'q13',
    question: 'What did the Phoenix lander discover beneath the dirt in the northern arctic plains of Mars in 2008?',
    options: [
      'Pure water ice that sublimated directly into vapor when exposed to sunlight',
      'A deep underground pool of liquid petroleum',
      'Fossilized microbial mats in sandstone',
      'A dense layer of volcanic graphite',
    ],
    correctIndex: 0,
    explanation: 'Phoenix’s robotic trenching arm scraped into the permafrost, uncovering bright white crumbs of pure water ice that vaporized over four days in the sun.',
    category: 'Mars',
  },
  {
    id: 'q14',
    question: 'What did the MOXIE instrument on the Perseverance rover successfully demonstrate in Jezero Crater?',
    options: [
      'Extracting drinkable liquid water from Martian rocks',
      'Producing pure, breathable oxygen directly from Mars’s carbon dioxide atmosphere',
      'Generating electricity from geothermal vents',
      'Growing potatoes in sealed Martian soil chambers',
    ],
    correctIndex: 1,
    explanation: 'MOXIE (Mars Oxygen ISRU Experiment) extracted breathable oxygen 16 times using solid oxide electrolysis, producing 122 grams of pure O2.',
    category: 'Mars',
  },
  {
    id: 'q15',
    question: 'Which spacecraft is the only probe in human history to have visited all four outer gas and ice giants: Jupiter, Saturn, Uranus, and Neptune?',
    options: ['Voyager 1', 'Voyager 2', 'Pioneer 11', 'Cassini-Huygens'],
    correctIndex: 1,
    explanation: 'Voyager 2 completed the historic Grand Tour, flying past Jupiter (1979), Saturn (1981), Uranus (1986), and Neptune (1989) before heading into interstellar space.',
    category: 'Deep Space',
  },
  {
    id: 'q16',
    question: 'What famous experiment did Apollo 15 Commander David Scott perform on the Moon in July 1971 to prove Galileo’s law of gravity?',
    options: [
      'He rolled two rocks of different weights down a steep crater slope',
      'He dropped a heavy geological hammer and a light falcon feather simultaneously in the lunar vacuum',
      'He bounced a golf ball off the fender of the lunar rover',
      'He fired an arrow horizontally across the Hadley Rille canyon',
    ],
    correctIndex: 1,
    explanation: 'In the vacuum of the Moon, both the 1.3-lb steel hammer and the 0.06-lb falcon feather struck the regolith at the exact same instant, validating Galileo.',
    category: 'Moon',
  },
  {
    id: 'q17',
    question: 'What did the New Horizons spacecraft discover on Pluto during its flyby in July 2015?',
    options: [
      'A dead, crater-pocked world identical to the Moon',
      'An active world featuring a vast heart-shaped glacier of nitrogen ice and bedrock mountains of water ice',
      'A global ocean of liquid methane with active waves',
      'A dense ring system resembling Saturn’s rings',
    ],
    correctIndex: 1,
    explanation: 'New Horizons revealed Sputnik Planitia—a craterless, convecting nitrogen glacier inside Tombaugh Regio, flanked by water-ice mountains rising 3,500 meters.',
    category: 'Deep Space',
  },
  {
    id: 'q18',
    question: 'What surprising geological discovery did Apollo 16 make in the Descartes Highlands?',
    options: [
      'The highlands were formed by recent explosive volcanism',
      'The highlands were composed entirely of impact breccias formed by giant meteorite strikes, not volcanic rocks',
      'The rocks contained rich deposits of native copper and gold',
      'The lunar crust was composed of sedimentary limestone',
    ],
    correctIndex: 1,
    explanation: 'Geologists expected volcanic lavas, but John Young and Charlie Duke found shattered impact breccias, disproving the volcanic theory of the lunar highlands.',
    category: 'Moon',
  },
  {
    id: 'q19',
    question: 'Which instrument aboard the InSight lander detected over 1,300 "marsquakes" between 2018 and 2022?',
    options: ['The SEIS seismometer under its aerodynamic wind shield', 'The HP3 heat flow mole probe', 'The TWINS meteorological mast', 'The RISE X-band radio antenna'],
    correctIndex: 0,
    explanation: 'SEIS (Seismic Experiment for Interior Structure) was so sensitive it detected tremors smaller than a hydrogen atom, mapping Mars’s crust, mantle, and core.',
    category: 'Mars',
  },
  {
    id: 'q20',
    question: 'What did the Cassini spacecraft discover erupting from the "tiger stripe" fractures of Saturn’s tiny moon Enceladus in 2005?',
    options: [
      'Liquid methane rivers flowing into polar lakes',
      'Towering geysers of saltwater vapor and organic molecules erupting from a global subsurface ocean',
      'Volcanic basalt lavas at 1,200 degrees Celsius',
      'Clouds of sulfuric acid crystals',
    ],
    correctIndex: 1,
    explanation: 'Cassini flew directly through the plumes, detecting water, salts, methane, and molecular hydrogen indicative of active hydrothermal vents on the ocean floor.',
    category: 'Saturn',
  },
  {
    id: 'q21',
    question: 'What was the first rover to drive on Mars, deployed from the Mars Pathfinder lander in July 1997?',
    options: ['Curiosity', 'Spirit', 'Sojourner', 'Opportunity'],
    correctIndex: 2,
    explanation: 'The 10.6-kilogram Sojourner rover operated for 83 sols in Ares Vallis, analyzing rocks with its APXS spectrometer and captivating the world.',
    category: 'Mars',
  },
  {
    id: 'q22',
    question: 'What milestone did Soviet spacecraft Luna 2 achieve in September 1959?',
    options: [
      'It became the first human-made object to reach and impact the surface of another celestial body',
      'It beamed back the first television image of the lunar far side',
      'It soft-landed gently and returned lunar samples to Earth',
      'It carried the first dog into lunar orbit',
    ],
    correctIndex: 0,
    explanation: 'Luna 2 impacted the Moon east of Mare Serenitatis on September 13, 1959, delivering Soviet pennants and confirming the absence of a strong lunar magnetic field.',
    category: 'Moon',
  },
  {
    id: 'q23',
    question: 'How long does a radio signal traveling at the speed of light take to reach Voyager 1 from Earth today?',
    options: ['8 minutes', '1.3 seconds', 'Over 23 hours', '3 weeks'],
    correctIndex: 2,
    explanation: 'Because Voyager 1 is over 165 Astronomical Units away (>24 billion km), radio signals traveling at ~300,000 km/s take approximately 23 hours one-way.',
    category: 'Deep Space',
  },
  {
    id: 'q24',
    question: 'What was the Genesis Rock, discovered by Apollo 15 astronauts David Scott and James Irwin at Hadley-Apennine?',
    options: [
      'A piece of meteoritic iron that fell from the asteroid belt',
      'An ancient sample of pure anorthosite crust formed 4.1 billion years ago during the Moon’s primordial magma ocean',
      'The first fossilized microbial rock found outside Earth',
      'A volcanic basalt rock from the youngest lunar lava flow',
    ],
    correctIndex: 1,
    explanation: 'Sample 15415 (the Genesis Rock) verified the lunar magma ocean hypothesis, proving the early Moon was blanketed by molten rock where light anorthosite floated to the top.',
    category: 'Moon',
  },
  {
    id: 'q25',
    question: 'Which planet did Pioneer 11 reach in September 1979, becoming the first spacecraft to make a close flyby and discover its F-ring?',
    options: ['Mars', 'Saturn', 'Jupiter', 'Uranus'],
    correctIndex: 1,
    explanation: 'Pioneer 11 used a Jupiter gravity slingshot to reach Saturn in 1979, diving beneath the rings to test safe passage for the following Voyager probes.',
    category: 'Saturn',
  },
  {
    id: 'q26',
    question: 'What was found inside "Big Bertha," an Apollo 14 lunar rock brought back by Alan Shepard and Edgar Mitchell from Fra Mauro?',
    options: [
      'A 4.0-billion-year-old terrestrial granite fragment blasted from Earth by an ancient impact',
      'Liquid water droplets sealed in quartz crystals',
      'A meteorite from the core of Mars',
      'Microscopic diamonds formed in a supernova',
    ],
    correctIndex: 0,
    explanation: 'Studies in 2019 revealed Big Bertha contains a 4-billion-year-old fragment of Earth’s primordial crust that was blasted to the Moon during the Late Heavy Bombardment.',
    category: 'Moon',
  },
  {
    id: 'q27',
    question: 'What makes the landing of the Chang’e 3 mission in December 2013 historically significant?',
    options: [
      'It was the first soft landing on the Moon in nearly 38 years since Soviet Luna 24 in 1976',
      'It was the first mission to land humans on the Moon since 1972',
      'It discovered gold deposits on the lunar surface',
      'It returned the largest sample of lunar rock in history',
    ],
    correctIndex: 0,
    explanation: 'Chang’e 3 ended a 37-year global surface landing hiatus, touching down in Mare Imbrium with the Yutu rover and the first Moon-based astronomical UV telescope.',
    category: 'Moon',
  },
  {
    id: 'q28',
    question: 'What was the primary scientific objective of the Viking 1 and Viking 2 landers that touched down on Mars in 1976?',
    options: [
      'To build an underground human base for future astronauts',
      'To conduct robotic biology experiments searching for active microbial metabolism in the Martian soil',
      'To launch a return capsule carrying Martian soil to Earth',
      'To detonate seismic charges to measure tectonic rifts',
    ],
    correctIndex: 1,
    explanation: 'Both Viking landers carried three automated biological incubation chambers to test for metabolism and photosynthesis in the Martian regolith.',
    category: 'Mars',
  },
  {
    id: 'q29',
    question: 'What did the ESA Huygens probe discover when it touched down on Saturn’s giant moon Titan in January 2005?',
    options: [
      'A frozen, cratered landscape of pure water ice with no atmosphere',
      'A floodplain strewn with rounded water-ice pebbles and river channels carved by liquid methane rain',
      'Active molten sulfur volcanoes erupting into a vacuum',
      'A thick blanket of radioactive lead dust',
    ],
    correctIndex: 1,
    explanation: 'Huygens revealed an active alien hydrologic cycle where liquid methane rains from orange smoggy skies, carving river deltas and flooding lowland plains.',
    category: 'Saturn',
  },
  {
    id: 'q30',
    question: 'Which Kuiper Belt object, shaped like two contact pancakes fused together, was explored by New Horizons on January 1, 2019?',
    options: ['486958 Arrokoth', 'Sedna', 'Eris', 'Oumuamua'],
    correctIndex: 0,
    explanation: 'Arrokoth was the most distant flyby in history (over 4 billion miles from Earth), revealing a pristine primordial contact binary preserved since the solar system’s formation.',
    category: 'Deep Space',
  },
];

interface ShuffledQuestion {
  original: QuizQuestion;
  shuffledOptions: string[];
  newCorrectIndex: number;
}

interface SpaceQuizProps {
  onBackToHub: () => void;
  onUpdateScore?: (score: number) => void;
}

export const SpaceQuiz: React.FC<SpaceQuizProps> = ({ onBackToHub, onUpdateScore }) => {
  const [roundKey, setRoundKey] = useState(0); // For restarting with new questions

  // Round of 10 unique shuffled questions
  const roundQuestions: ShuffledQuestion[] = useMemo(() => {
    // 1. Pick 10 random questions from bank
    const shuffledBank = [...QUESTION_BANK].sort(() => Math.random() - 0.5).slice(0, 10);

    // 2. Shuffle options for each question without corrupting correct answer
    return shuffledBank.map((q) => {
      const correctText = q.options[q.correctIndex];
      const shuffledOpts = [...q.options].sort(() => Math.random() - 0.5);
      const newIndex = shuffledOpts.indexOf(correctText);
      return {
        original: q,
        shuffledOptions: shuffledOpts,
        newCorrectIndex: newIndex,
      };
    });
  }, [roundKey]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQ = roundQuestions[currentIndex];

  const handleSelectOption = (idx: number) => {
    if (selectedOption !== null || isCompleted) return;
    setSelectedOption(idx);
    setShowExplanation(true);

    if (idx === currentQ.newCorrectIndex) {
      playSuccessChime();
      const newScore = score + 100 + streak * 25; // Streak bonus
      setScore(newScore);
      setStreak((prev) => {
        const next = prev + 1;
        if (next > maxStreak) setMaxStreak(next);
        return next;
      });
    } else {
      playErrorBuzz();
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    playSignalPing(700);
    setSelectedOption(null);
    setShowExplanation(false);

    if (currentIndex + 1 < roundQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
      if (onUpdateScore) onUpdateScore(score);
    }
  };

  const handleRestart = () => {
    playSignalPing(800);
    setCurrentIndex(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setIsCompleted(false);
    setRoundKey((prev) => prev + 1);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-2 sm:py-3 h-[calc(100vh-68px)] max-h-[860px] flex flex-col justify-between overflow-hidden">
      {/* Top Navigation & Status Bar */}
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
          <span className="font-mono text-[11px] text-[#C8D8EA] hidden sm:inline">SPACE TRIVIA CHALLENGE</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Streak Indicator */}
          {streak > 1 && (
            <div className="px-2.5 py-0.5 rounded-full bg-[#FFC66D]/20 border border-[#FFC66D]/50 font-mono text-[10px] text-[#FFC66D] font-bold flex items-center gap-1 animate-pulse">
              <span>🔥</span>
              <span>{streak} STREAK (+{streak * 25} PTS)</span>
            </div>
          )}

          {/* Current Score */}
          <div className="bg-black/50 px-3 py-1 rounded-xl border border-white/10 text-right">
            <span className="text-[9px] font-mono text-[#C8D8EA] block uppercase leading-none">SCORE</span>
            <span className="font-display text-base text-[#F5F0E8] font-medium leading-none">
              {score.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {!isCompleted ? (
        <div className="flex-1 min-h-0 flex flex-col justify-between p-4 sm:p-6 rounded-2xl bg-[#111A35]/90 border border-white/10 shadow-2xl backdrop-blur-xl overflow-y-auto">
          {/* Progress Header */}
          <div className="shrink-0 flex items-center justify-between text-xs font-mono text-[#C8D8EA] mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[#FFC66D] font-bold">QUESTION {currentIndex + 1} OF {roundQuestions.length}</span>
              <span>•</span>
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-[#58D9FF] font-semibold">
                {currentQ.original.category.toUpperCase()}
              </span>
            </div>

            <span className="text-[11px]">{Math.round(((currentIndex) / roundQuestions.length) * 100)}% COMPLETE</span>
          </div>

          {/* Progress Bar */}
          <div className="shrink-0 w-full h-1 bg-black/50 rounded-full overflow-hidden border border-white/5 mb-4">
            <div
              className="h-full bg-gradient-to-r from-[#FFC66D] via-[#58D9FF] to-[#64E5C0] transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / roundQuestions.length) * 100}%` }}
            />
          </div>

          {/* Question Card Body */}
          <div className="my-auto space-y-4">
            <h2 className="font-display text-lg sm:text-2xl text-[#F5F0E8] font-normal leading-snug">
              {currentQ.original.question}
            </h2>

            {/* Answer Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {currentQ.shuffledOptions.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQ.newCorrectIndex;
                let optionClass = 'bg-black/40 border-white/10 text-[#F5F0E8] hover:bg-white/5 hover:border-[#58D9FF]/40';

                if (selectedOption !== null) {
                  if (isCorrect) {
                    optionClass = 'bg-emerald-950/70 border-emerald-400 text-emerald-200 shadow-[0_0_15px_rgba(100,229,192,0.25)]';
                  } else if (isSelected) {
                    optionClass = 'bg-red-950/70 border-red-400 text-red-200';
                  } else {
                    optionClass = 'bg-black/20 border-white/5 text-[#C8D8EA]/40';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    disabled={selectedOption !== null}
                    className={`p-3 rounded-xl border text-left font-sans text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer disabled:cursor-default ${optionClass}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-md bg-white/5 border border-white/10 font-mono text-[11px] font-semibold flex items-center justify-center shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="leading-snug">{option}</span>
                    </div>

                    {selectedOption !== null && (
                      <span className="text-base font-bold ml-2">
                        {isCorrect ? '✓' : isSelected ? '✕' : ''}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Explanation & Next Button */}
          {showExplanation ? (
            <div className="shrink-0 pt-3 mt-3 border-t border-white/10 space-y-2.5 animate-fadeIn">
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs text-[#C8D8EA] leading-relaxed">
                <span className="text-[#FFC66D] font-mono font-bold uppercase tracking-wider block mb-0.5 text-[10px]">
                  💡 HISTORICAL CONTEXT:
                </span>
                <p className="font-sans font-light text-xs sm:text-sm text-[#F5F0E8]/95 leading-snug">
                  {currentQ.original.explanation}
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleNextQuestion}
                  className="px-5 py-2 rounded-xl bg-[#FFC66D] hover:bg-[#ffe09e] text-[#080B1D] font-sans text-xs font-bold tracking-widest uppercase transition-all shadow-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{currentIndex + 1 < roundQuestions.length ? 'NEXT QUESTION ➔' : 'VIEW FINAL RESULTS ➔'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="shrink-0 pt-2 text-center text-[10px] font-mono text-[#C8D8EA]/50">
              SELECT AN ANSWER TO REVEAL HISTORICAL CONTEXT
            </div>
          )}
        </div>
      ) : (
        /* Results Screen */
        <div className="flex-1 min-h-0 flex flex-col justify-center items-center p-6 sm:p-10 rounded-2xl bg-[#111A35]/95 border border-[#FFC66D]/50 shadow-2xl backdrop-blur-xl text-center space-y-4 my-auto animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-[#FFC66D]/20 border border-[#FFC66D] flex items-center justify-center text-3xl mx-auto shadow-xl">
            🏆
          </div>

          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#FFC66D] font-semibold block mb-1">
              MISSION TRIVIA COMPLETE
            </span>
            <h2 className="font-display text-2xl sm:text-3xl text-[#F5F0E8] font-normal">
              Cosmic Knowledge Score
            </h2>
            <div className="font-display text-4xl sm:text-5xl text-[#FFC66D] font-medium my-2">
              {score.toLocaleString()} <span className="text-xl text-[#C8D8EA]">PTS</span>
            </div>
            <p className="text-xs sm:text-sm text-[#C8D8EA] max-w-md mx-auto font-light leading-relaxed">
              {score >= 800
                ? 'Outstanding performance! You possess master-level knowledge of humanity’s planetary explorers and cosmic history.'
                : score >= 500
                ? 'Great job, explorer! You have a solid grasp of space exploration milestones and famous robotic missions.'
                : 'Good effort! Exploring the museum dossiers will deepen your understanding of these extraordinary journeys.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto w-full">
            <div className="bg-black/50 p-3 rounded-xl border border-white/5">
              <span className="text-[9px] font-mono text-[#C8D8EA] block uppercase">LONGEST STREAK</span>
              <span className="font-display text-lg text-[#F5F0E8]">{maxStreak} In A Row</span>
            </div>
            <div className="bg-black/50 p-3 rounded-xl border border-white/5">
              <span className="text-[9px] font-mono text-[#C8D8EA] block uppercase">QUESTIONS</span>
              <span className="font-display text-lg text-[#F5F0E8]">{roundQuestions.length} Answered</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3 border-t border-white/10">
            <button
              onClick={handleRestart}
              className="px-5 py-2.5 rounded-xl bg-[#FFC66D] hover:bg-[#ffe09e] text-[#080B1D] font-sans text-xs font-bold tracking-widest uppercase transition-all shadow-lg cursor-pointer"
            >
              PLAY AGAIN (10 NEW QUESTIONS) ➔
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
