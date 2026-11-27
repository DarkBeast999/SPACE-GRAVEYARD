// ============================================================================
// SPACE GRAVEYARD — CURATED MISSION STORIES DATASET
// 28 Complete Historical Chronicles of Human Planetary & Deep-Space Explorers
// Grounded in NASA, ESA, NSSDCA, and Institutional Historical Archives
// ============================================================================

export interface StoryChapter {
  title: string;
  subtitle?: string;
  content: string;
}

export interface MissionStory {
  artifactId: string;
  title: string;
  subtitle: string;
  lead: string;
  summary: string; // Concise preview for 3D Universe sidebar (approx 80-120 words)
  highlightQuote: string;
  quoteAuthor?: string;
  verifiedStatus: string;
  restingLocation: string;
  chapters: {
    origin: StoryChapter;      // A. The reason it existed
    journey: StoryChapter;     // B. The voyage and arrival
    keyMoments: StoryChapter;  // C. The moments that mattered
    discoveries: StoryChapter; // D. What it revealed
    legacy: StoryChapter;      // E. The final chapter & legacy
  };
}

export const MISSION_STORIES: Record<string, MissionStory> = {
  // --------------------------------------------------------------------------
  // 1. EAGLE DESCENT STAGE
  // --------------------------------------------------------------------------
  'eagle-descent-stage': {
    artifactId: 'eagle-descent-stage',
    title: 'The Foothold at Tranquility',
    subtitle: 'Apollo 11 Lunar Module Descent Stage // Mare Tranquillitatis',
    lead: 'On July 20, 1969, an ungainly machine made of welded aluminum tubes and gold mylar foil served as humanity’s very first porch onto an alien world.',
    summary: 'The descent stage of Apollo 11’s Lunar Module Eagle powered humanity’s first touchdown on another celestial body. Firing its throttleable rocket engine for 12 harrowing minutes over boulder-strewn craters, it became the stationary launchpad from which Armstrong and Aldrin returned home, remaining forever at the Sea of Tranquility.',
    highlightQuote: 'Here men from the planet Earth first set foot upon the Moon. July 1969, A.D. We came in peace for all mankind.',
    quoteAuthor: 'Apollo 11 Lunar Plaque',
    verifiedStatus: 'Permanent Historical Monument (Intact at Mare Tranquillitatis)',
    restingLocation: 'Sea of Tranquility, Moon (0.674°N, 23.473°E)',
    chapters: {
      origin: {
        title: 'I. The Mandate for Tranquility',
        subtitle: 'A Decadal Race Culminates in a Fragile Spider',
        content: 'When President John F. Kennedy challenged the United States in 1961 to land humans on the Moon and return them safely before the decade was out, no spacecraft existed that could execute the landing. Grumman Aerospace in Bethpage, New York, had to design a vehicle that never needed to fly through an atmosphere. Engineers shaved metal skin down to the thickness of three sheets of aluminum foil, eliminating seats and streamlining structural weight. The lower half—the Descent Stage—was designed as an independent propulsion platform with four spider-like legs, housing a revolutionary throttleable rocket engine that would cushion humanity’s arrival on ancient lunar basalt.'
      },
      journey: {
        title: 'II. Twelve Harrowing Minutes',
        subtitle: 'Through Computer Alarms and Boulders',
        content: 'Eagle separated from the Command Module Columbia on July 20, 1969. As the descent engine fired to brake out of lunar orbit, the primitive guidance computer flashed unexpected 1202 and 1201 program alarms, overloaded with superfluous radar data. In Mission Control, 26-year-old guidance officer Steve Bales recognized the radar buffer overflow and gave the call to continue. Looking through the triangular window, Neil Armstrong noticed the automated targeting was guiding them into a football-field-sized crater carpeted with car-sized boulders. Armstrong clicked off automatic guidance, tilted the ship forward, and manually skimmed across the landscape searching for smooth soil.'
      },
      keyMoments: {
        title: 'III. Sixty Seconds of Fuel',
        subtitle: 'The Blue Contact Light',
        content: 'With heart rates climbing and fuel gauges dropping toward the critical 5% bingo limit, capsule communicator Charlie Duke counted down the seconds remaining before an abort was required. At less than 30 seconds of fuel, lunar dust kicked up in the exhaust nozzle, obscuring the ground. A five-foot probe hanging beneath the right landing footpad touched the surface, illuminating a small blue lamp on the instrument panel: "CONTACT LIGHT." Armstrong shut down the engine, let the stage settle gently into Mare Tranquillitatis, and announced to a stunned world: "Houston, Tranquility Base here. The Eagle has landed."'
      },
      discoveries: {
        title: 'IV. Treasures from the Sea',
        subtitle: 'Unlocking 4.5 Billion Years of Planetary History',
        content: 'The descent stage served as crew headquarters, antenna tower, and scientific equipment locker during the 21 hours on the surface. From its Modular Equipment Stowage Assembly (MESA), Armstrong and Aldrin deployed the Early Apollo Scientific Experiments Package (EASEP), which included a passive seismometer that immediately recorded the footsteps of astronauts vibrating the Moon, and an aluminum foil sheet that trapped direct solar wind ions. The crew packed 21.55 kilograms of rocks and regolith into sample boxes—pristine igneous rocks that proved the Moon was once blanketed in a global magma ocean.'
      },
      legacy: {
        title: 'V. The Eternal Monument',
        subtitle: 'A Silent Baseplate for Future Generations',
        content: 'At 17:54 UTC on July 21, the Ascent Stage fired its hypergolic engine, using the descent stage as a launch table and blasting away in a burst of invisible gas. The Descent Stage remained behind, its legs firmly planted in the grey dust. Attached to its front landing leg strut is a stainless steel commemorative plaque depicting Earth’s hemispheres and signed by the three astronauts and President Richard Nixon. Unprotected by any atmosphere, it stands unaltered in the vacuum of space, preserving humanity’s inaugural stepping stone for centuries to come.'
      }
    }
  },

  // --------------------------------------------------------------------------
  // 2. SURVEYOR 3
  // --------------------------------------------------------------------------
  'surveyor-3': {
    artifactId: 'surveyor-3',
    title: 'The Robot Visited by Humans',
    subtitle: 'Robotic Engineering Scout // Oceanus Procellarum',
    lead: 'Before humans could walk safely on the lunar surface, a triangular aluminum framework with three footpads bounced into a shallow crater to answer an existential question: would a spaceship sink into dust?',
    summary: 'Surveyor 3 soft-landed in the Ocean of Storms in April 1967, proving the lunar regolith could support the weight of an Apollo spacecraft. Two and a half years later, Apollo 12 astronauts Pete Conrad and Alan Bean made a pinpoint landing just 180 meters away, walking over to examine the robot and retrieving its camera for scientific return to Earth.',
    highlightQuote: 'Hey, there it is! Right on the edge of the crater! Just like we planned!',
    quoteAuthor: 'Pete Conrad, Apollo 12 Commander',
    verifiedStatus: 'Historical Landmark with Hardware Retrieved by Apollo 12',
    restingLocation: 'Oceanus Procellarum, Moon (2.994°S, 23.34°W)',
    chapters: {
      origin: {
        title: 'I. The Quicksand Myth',
        subtitle: 'Preparing the Way for Human Boots',
        content: 'In the mid-1960s, prominent astronomers warned that billions of years of micrometeorite bombardment might have ground the lunar surface into a low-density, quicksand-like dust layer several meters deep. If true, an Apollo Lunar Module would sink out of sight upon touchdown. NASA’s Jet Propulsion Laboratory initiated the Surveyor program: sophisticated robotic landers equipped with radar altimeters, throttleable vernier engines, and television cameras to execute the first controlled American soft landings and mechanically test the ground.'
      },
      journey: {
        title: 'II. Three Bounces into a Crater',
        subtitle: 'A Touchdown Controlled by Radar Reflections',
        content: 'Surveyor 3 launched aboard an Atlas-Centaur on April 17, 1967. As it approached the Ocean of Storms three days later, its Doppler radar locked onto highly reflective rocks, confusing the terminal deceleration computer. The thrusters failed to cut off at the scheduled 4-meter altitude. The lander touched down, rebounded twelve meters into the sky, bounced a second time, and finally settled on its third touchdown inside a 200-meter-wide crater sloping at a 14-degree angle.'
      },
      keyMoments: {
        title: 'III. Digging the First Off-World Trenches',
        subtitle: 'A Mechanical Arm with Soil Scoop',
        content: 'Over the next fourteen Earth days, ground operators remotely manipulated an articulated pantograph arm with a small mechanical scoop. Commands sent over radio pulses instructed the scoop to scrape, dig four trenches up to 18 centimeters deep, and press down on the lunar dirt. The television camera beamed back 6,315 clear images. Engineers measured the motor current required to slice through the regolith, calculating that the bearing strength was roughly 0.7 kilograms per square centimeter—more than adequate to support Apollo’s boots and landing pads.'
      },
      discoveries: {
        title: 'IV. Shadows of Sunset',
        subtitle: 'Surviving the -180°C Lunar Night',
        content: 'Surveyor 3 discovered that the lunar soil behaves like damp beach sand: cohesive, easily compressed, yet structurally solid beneath a fluffy top millimeter. It recorded a total eclipse of the Sun by Earth, observing the refracted ring of Earth’s atmosphere glowing in space. When the two-week lunar sunset plunged Oceanus Procellarum into freezing darkness on May 3, 1967, its batteries froze, and the probe fell permanently silent.'
      },
      legacy: {
        title: 'V. The Human Reunion',
        subtitle: 'Conrad, Bean, and the Smithsonian Artifact',
        content: 'Thirty-one months later, on November 19, 1969, Apollo 12 Commander Pete Conrad and Lunar Module Pilot Alan Bean steered their spacecraft Intrepid to a pinpoint landing merely 180 meters from Surveyor 3. The astronauts walked down into the crater, took photographs to assess how 31 months of solar radiation, micrometeorites, and vacuum had discolored the paint, and clipped off its television camera with bolt cutters. That camera was returned to Earth and now rests in the Smithsonian National Air and Space Museum—a tangible testament to human-robotic cooperation.'
      }
    }
  },

  // --------------------------------------------------------------------------
  // 3. LUNOKHOD 1
  // --------------------------------------------------------------------------
  'lunokhod-1': {
    artifactId: 'lunokhod-1',
    title: 'The Pioneer of Remote Wheels',
    subtitle: 'Luna 17 Lunar Rover // Mare Imbrium',
    lead: 'Shaped like a Victorian bathtub mounted on eight wire-mesh wheels, Lunokhod 1 trundled across the Sea of Rains in 1970, controlled by a team of pilots thousands of kilometers away in the Soviet Union.',
    summary: 'Delivered by the Soviet Luna 17 lander in November 1970, Lunokhod 1 was the first robotic rover to travel across another celestial body. Operating for 321 Earth days through extreme lunar nights using a radioactive polonium-210 heater, it traversed over 10.5 kilometers, returning thousands of television pictures and proving robotic mobility was viable.',
    highlightQuote: 'We drove by staring at black-and-white screens with a five-second delay between our commands and what the rover did.',
    quoteAuthor: 'Vyacheslav Dovgan, Lunokhod Crew Commander',
    verifiedStatus: 'Preserved Surface Artifact with Operational French Laser Retroreflector',
    restingLocation: 'Mare Imbrium, Moon (38.333°N, 35.037°W)',
    chapters: {
      origin: {
        title: 'I. The Automated Counterweight',
        subtitle: 'Soviet Ingenuity Amid the Space Race',
        content: 'Following the American Apollo 11 success, the Soviet space program channeled its top engineering talents at the Lavochkin Design Bureau into robotic exploration. Chief Designer Georgy Babakin conceived a rugged, self-contained mobile laboratory capable of surveying vast swaths of the lunar surface without risking human lives. Equipped with eight independently driven titanium-mesh wheels, conical chassis, and a hermetically sealed instrument bay filled with circulating nitrogen, Lunokhod was an unprecedented marvel of cybernetics and mechanical automation.'
      },
      journey: {
        title: 'II. Ramps Down on the Sea of Rains',
        subtitle: 'A Delicate Landing on Mare Imbrium',
        content: 'Luna 17 lifted off atop a Proton-K rocket on November 10, 1970, slipping into lunar orbit five days later. On November 17, descent engines fired over Mare Imbrium, guiding the four-legged lander to a gentle touchdown. Dual folding ramps deployed from the lander deck. Lunokhod rolled forward, cutting two ribbon-like tracks through the pristine regolith as television cameras beamed the moment back to the Crimean ground station in Simferopol.'
      },
      keyMoments: {
        title: 'III. Driving from Crimea with a Five-Second Delay',
        subtitle: 'The World’s First Tele-Robotic Operators',
        content: 'Piloting Lunokhod required superhuman patience. Radio signals took 1.3 seconds to reach the Moon and 1.3 seconds to return, with additional seconds required to build slow-scan TV frames. The five-man Soviet military crew—commander, driver, navigator, operator, and telemetry engineer—worked in high-stress four-hour shifts, navigating blind spots, boulders, and steep crater walls. When a wheel slipped or a tilt sensor exceeded 20 degrees, the commander slammed an emergency stop button. During the grueling 14-day lunar nights, when temperatures plunged to -150°C, the crew closed the convex solar lid, activating a polonium-210 isotopic heat decay source to keep the avionics alive.'
      },
      discoveries: {
        title: 'IV. Science Across Ten Kilometers',
        subtitle: 'Chemical Probes and Cosmic Rays',
        content: 'Originally engineered to survive 90 days, Lunokhod 1 functioned for 321 Earth days, spanning eleven full lunar cycles. Its RIFMA X-ray fluorescence spectrometer measured aluminum, silicon, iron, and magnesium concentrations in 25 different areas. A penetrometer cone stamped down into the soil hundreds of times to measure mechanical compaction. It returned over 20,000 television images, 206 high-resolution panoramic panoramas, and traversed 10,540 meters across the desolate plains of Mare Imbrium.'
      },
      legacy: {
        title: 'V. Lost and Found Under Laser Light',
        subtitle: 'A French Prism That Never Slept',
        content: 'On September 14, 1971, the polonium thermal source finally depleted, and internal temperatures dropped below freezing. Lunokhod was parked on an open plain with its French-built corner-cube laser retroreflector angled toward Earth. For nearly forty years, its exact coordinates remained uncertain until NASA’s Lunar Reconnaissance Orbiter photographed its tracks in March 2010. Within weeks, the Apache Point Observatory in New Mexico aimed a laser pulse at the coordinates, receiving back an immediate, crystalline photon return. Lunokhod’s mirrors continue to measure the Moon’s orbital drift to this day.'
      }
    }
  },

  // --------------------------------------------------------------------------
  // 4. LUNOKHOD 2
  // --------------------------------------------------------------------------
  'lunokhod-2': {
    artifactId: 'lunokhod-2',
    title: 'The Marathon Runner of Le Monnier',
    subtitle: 'Luna 21 Rover // Eastern Edge of Mare Serenitatis',
    lead: 'Equipped with upgraded cameras and higher transmission speeds, the second Soviet moonwalker set an off-world cross-country distance record that stood unbeaten for more than four decades.',
    summary: 'Delivered to the fractured terrain of Le Monnier crater in January 1973, Lunokhod 2 was an upgraded version of the first rover. Driving an astonishing 39 kilometers in just four months across boulder fields and volcanic rilles, its mission ended when an accidental collision with a crater rim showered dust over its radiators.',
    highlightQuote: 'We were pushing the machine hard because we had mastered the controls, but the Moon’s shadows are deceptive.',
    quoteAuthor: 'Soviet Rover Operations Log',
    verifiedStatus: 'Preserved Surface Artifact at Crater Le Monnier',
    restingLocation: 'Le Monnier Crater, Moon (25.850°N, 30.450°E)',
    chapters: {
      origin: {
        title: 'I. Faster Eyes, Better Wheels',
        subtitle: 'Refining the Autonomous Platform',
        content: 'Following the breakthrough success of Lunokhod 1, Soviet engineers at Lavochkin addressed operational bottlenecks. Drivers on Earth had complained that low-mounted cameras made navigation hazardous. Lunokhod 2 was upgraded with an elevated third television camera mounted at human eye-level, a higher frame-rate video transmission system, an improved magnetometer, and reinforced suspension. Its mission was to explore the transition zone between dark basaltic mare plains and bright highland hills inside the 60-kilometer ancient flooded crater Le Monnier.'
      },
      journey: {
        title: 'II. Into the Moonlit Shoreline',
        subtitle: 'Touching Down at Le Monnier',
        content: 'Luna 21 carried the rover into space on January 8, 1973. Touching down smoothly on January 15 in southeastern Mare Serenitatis, the craft opened its ramps and rolled into a landscape of stark geologic contrasts. Unlike the flat plains explored by its predecessor, Le Monnier was framed by rolling highland massifs and scarred by deep tectonic fractures known as Fossa Dstraight.'
      },
      keyMoments: {
        title: 'III. The Great Sprint Across the Rille',
        subtitle: 'A Forty-Year Distance Record',
        content: 'Operating with newfound confidence, the driving crew in Crimea pushed Lunokhod 2 to travel up to several kilometers in a single day. The rover investigated a 16-kilometer volcanic fissure named Dstraight Rille, approaching the rim to photograph sheer basalt cliffs and boulders rolled down slopes. Over four months, it completed a staggering traverse of 39 kilometers—a record for off-world driving that remained unmatched until NASA’s Opportunity rover surpassed it on Mars in 2014.'
      },
      discoveries: {
        title: 'IV. Magnetism and Regolith Chemistry',
        subtitle: 'Mapping the Mare-Highland Boundary',
        content: 'Lunokhod 2 was equipped with an astrophotometer to measure the lunar sky glow, confirming that no significant dust atmosphere exists during the lunar day. Its magnetometer surveyed local crustal magnetic fields, showing that impact heating had reset magnetization. It conducted 740 soil-mechanics tests, captured 86 panoramic landscapes, and collected over 80,000 television frames, vastly improving understanding of how volcanic lavas interfaced with crater walls.'
      },
      legacy: {
        title: 'V. The Fatal Scoop of Dust',
        subtitle: 'Overheating Under the Solar Noon',
        content: 'In May 1973, while descending into a fresh, steep-sided crater, the rover’s rear chassis slid down a loose slope. The open solar lid inadvertently touched the crater wall, scooping up a layer of powdery, dark regolith. Unaware of the trapped dirt, the crew closed the lid for the upcoming lunar night. When the lid was reopened during lunar sunrise, the collected dust dumped directly onto the radiators. Unable to shed heat, internal temperatures skyrocketed to over 47°C, frying the electronics on May 10, 1973. It remains parked quietly on the floor of Le Monnier.'
      }
    }
  },

  // --------------------------------------------------------------------------
  // 5. APOLLO 12 DESCENT STAGE
  // --------------------------------------------------------------------------
  'apollo-12-descent': {
    artifactId: 'apollo-12-descent',
    title: 'The Pinpoint Arrival at the Ocean of Storms',
    subtitle: 'Apollo 12 Lunar Module Intrepid // Oceanus Procellarum',
    lead: 'Struck by lightning twice during its launch from Cape Kennedy, Apollo 12 recovered to execute the most precise spacecraft landing in history, touching down within walking distance of an abandoned robotic scout.',
    summary: 'The descent stage of Apollo 12’s Lunar Module Intrepid served as the platform for the first pinpoint landing on another world in November 1969. Proving that humans could land at exact coordinates to explore specific geology, Commander Pete Conrad and Alan Bean deployed the first full scientific station and visited Surveyor 3.',
    highlightQuote: 'Whoopee! Man, that may have been a small one for Neil, but that’s a long one for me!',
    quoteAuthor: 'Pete Conrad, stepping onto the Moon',
    verifiedStatus: 'Permanent Historical Site at Surveyor Crater',
    restingLocation: 'Oceanus Procellarum, Moon (3.012°S, 23.422°W)',
    chapters: {
      origin: {
        title: 'I. The Challenge of Precision',
        subtitle: 'Moving from Survival to Scientific Exploration',
        content: 'While Apollo 11’s primary objective was merely landing safely anywhere on the Moon, Apollo 12 had an ambitious scientific goal: proving that astronauts could target a specific landmark and land right beside it. If human missions could not achieve pinpoint accuracy, exploration of rugged highlands and crater rims would be impossible. Mission planners targeted Surveyor Crater in Oceanus Procellarum, where the Surveyor 3 robotic probe had sat silent since May 1967.'
      },
      journey: {
        title: 'II. Lightning at Cape Kennedy',
        subtitle: 'John Aaron’s "SCE to AUX" Command',
        content: 'Thirty-six seconds after liftoff on November 14, 1969, during a torrential thunderstorm, lightning struck the Saturn V rocket, traveling down the ionized exhaust plume into the launch pad. The electrical surge knocked out telemetry, blinding the cockpit with warning lights. Thirty seconds later, lightning struck a second time. Back in Houston, 24-year-old flight controller John Aaron recalled a obscure simulation failure and called out: "Try SCE to AUX." Astronaut Alan Bean flipped the obscure signal conditioning equipment switch, immediately restoring power telemetry and saving the mission.'
      },
      keyMoments: {
        title: 'III. Landing Beside the Robot',
        subtitle: 'A Cloud of Swirling White Dust',
        content: 'Four days later, Intrepid separated from Yankee Clipper and descended toward Oceanus Procellarum. Pete Conrad peered through the reticle in his window: "I think I see it! Right on the nose!" As the descent engine blew sheets of lunar soil across the plains, Conrad manually guided Intrepid over the lip of Surveyor Crater and set down gently, exactly 183 meters from the sleeping Surveyor 3 probe. Pinpoint lunar landing had been mastered.'
      },
      discoveries: {
        title: 'IV. Nuclear Science on the Regolith',
        subtitle: 'The First Apollo Lunar Surface Experiments Package',
        content: 'Apollo 12 deployed the first full Apollo Lunar Surface Experiments Package (ALSEP), powered by a SNAP-27 radioisotope thermoelectric generator containing plutonium-238. The package included a solar wind spectrometer, a cold cathode ion gauge, and a passive seismometer. When Conrad and Bean discarded their Ascent Stage to crash into the Moon after rendezvous, the seismometer recorded the reverberation ringing like a bell for more than an hour, revealing a remarkably dry and fractured crust.'
      },
      legacy: {
        title: 'V. The Gold Baseplate on the Crater Rim',
        subtitle: 'The Foundation of Lunar Field Geology',
        content: 'Conrad and Bean conducted two spacewalks totaling nearly eight hours, collecting 34 kilograms of samples, including ancient KREEP-rich basalts that provided absolute dates for the Ocean of Storms. The Intrepid Descent Stage remains standing on the gentle northwestern slope of Surveyor Crater, its reflective thermal shielding glistening under the unyielding sun—a monument to human navigation, recovery under pressure, and scientific curiosity.'
      }
    }
  },

  // --------------------------------------------------------------------------
  // 6. APOLLO 14 DESCENT STAGE
  // --------------------------------------------------------------------------
  'apollo-14-descent': {
    artifactId: 'apollo-14-descent',
    title: 'The Redemption of Fra Mauro',
    subtitle: 'Apollo 14 Lunar Module Antares // Fra Mauro Highlands',
    lead: 'Carrying the oldest astronaut to walk on the Moon and salvaging the scientific goals lost in the near-disaster of Apollo 13, Apollo 14 touched down on the cratered ejecta blanket of an ancient planetary impact.',
    summary: 'The descent stage of Apollo 14’s Lunar Module Antares carried Alan Shepard and Edgar Mitchell to the rugged Fra Mauro formation in February 1971. Completing the mission intended for Apollo 13, the crew climbed Cone Crater, deployed a mobile equipment handcart, and retrieved primordial impact rocks formed 3.9 billion years ago.',
    highlightQuote: 'Miles and miles and miles...',
    quoteAuthor: 'Alan Shepard, hitting a makeshift golf ball at Fra Mauro',
    verifiedStatus: 'Permanent Historical Site at Fra Mauro Highlands',
    restingLocation: 'Fra Mauro, Moon (3.645°S, 17.471°W)',
    chapters: {
      origin: {
        title: 'I. The Mission That Had to Succeed',
        subtitle: 'In the Wake of the Apollo 13 Explosion',
        content: 'Ten months after an oxygen tank explosion crippled Apollo 13 and forced a desperate circumlunar abort, NASA returned to flight under intense public and political scrutiny. Another major failure could permanently end human spaceflight. The agency selected Alan Shepard—America’s first man in space, grounded for a decade by Ménière’s disease until surgery restored his inner ear—to command Apollo 14 and lead humanity back to the Moon.'
      },
      journey: {
        title: 'II. Two Near-Aborts Before Touchdown',
        subtitle: 'The Docking Probe and the Phantom Abort Switch',
        content: 'The mission encountered severe technical crises before even reaching the surface. First, the Command Module Kitty Hawk failed to dock with Lunar Module Antares five consecutive times in Earth orbit until Shepard manually slammed the docking latch home. Then, as Antares began its powered descent to the Moon, a loose solder ball inside the cockpit abort switch caused intermittent short-circuits. Had the computer read that signal as a valid abort command, it would have fired the ascent engine and aborted the landing. MIT software engineers radioed up a 60-keypad binary hack to bypass the abort circuitry in the guidance software with minutes to spare.'
      },
      keyMoments: {
        title: 'III. Climbing the Ridge of Cone Crater',
        subtitle: 'Lost in the Rolling Terrain of Ejecta',
        content: 'Antares touched down smoothly in Fra Mauro on February 5, 1971. Equipped with a two-wheeled equipment cart called the Modular Equipment Transporter (MET), Shepard and Mitchell set out on a grueling uphill trek toward the 300-meter-wide Cone Crater to sample debris excavated from deep inside the Moon. Without landmarks on the featureless, undulating horizon, their heart rates spiked and navigation proved disorienting. Unbeknownst to them, when ground control ordered them to turn back due to oxygen margins, they were standing merely 20 meters from the rim.'
      },
      discoveries: {
        title: 'IV. Unveiling the Imbrium Cataclysm',
        subtitle: 'Big Bertha and Ancient Impact Breccias',
        content: 'Shepard and Mitchell collected 42.8 kilograms of rock and regolith samples, including "Big Bertha," a 9-kilogram impact breccia. Decades later, planetary scientists discovered that Big Bertha contains an oxidized granite fragment that originated on the primordial Earth 4.0 billion years ago, blasted into space by an ancient asteroid impact and collected on the lunar surface—the oldest terrestrial rock known to science.'
      },
      legacy: {
        title: 'V. The Golf Swing and the Silent Base',
        subtitle: 'A Triumphant Return to the Heavens',
        content: 'Before climbing the ladder for the final time, Shepard attached a six-iron clubhead to a contingency sample handle, dropped two dimpled golf balls in the dust, and swung one-handed. In the one-sixth gravity and vacuum, the second ball sailed "miles and miles and miles." When the ascent stage launched to rejoin Mitchell in orbit, Antares’s Descent Stage stood silent among the tire tracks of the MET—a permanent symbol of resilience, technical brilliance, and scientific triumph.'
      }
    }
  },

  // --------------------------------------------------------------------------
  // 7. APOLLO 15 DESCENT STAGE
  // --------------------------------------------------------------------------
  'apollo-15-descent': {
    artifactId: 'apollo-15-descent',
    title: 'The Great Leap into Deep Geology',
    subtitle: 'Apollo 15 Lunar Module Falcon // Hadley-Apennine',
    lead: 'Landing beside a 1,200-foot chasm in the shadow of mountains taller than the Swiss Alps, Apollo 15 introduced the Lunar Roving Vehicle and transformed lunar exploration from short visits into expansive field expeditions.',
    summary: 'The descent stage of Apollo 15’s Falcon served as base camp for the first extended "J-series" expedition in July 1971. Driving the first battery-powered Lunar Roving Vehicle across Hadley Rille, Commander David Scott and James Irwin discovered the 4.1-billion-year-old Genesis Rock and proved Galileo’s gravitational equivalence in vacuum.',
    highlightQuote: 'Man must explore. And this is exploration at its greatest.',
    quoteAuthor: 'David Scott, Apollo 15 Commander',
    verifiedStatus: 'Permanent Historical Site at Hadley-Apennine',
    restingLocation: 'Hadley-Apennine, Moon (26.132°N, 3.634°E)',
    chapters: {
      origin: {
        title: 'I. The Scientific Renaissance',
        subtitle: 'Extending the Range of Exploration',
        content: 'Apollo 15 marked the debut of the upgraded "J-series" missions. Grumman redesigned the Lunar Module, adding larger propellant tanks and a heavier payload capacity that allowed crews to spend three full days on the surface. NASA partnered with Boeing and General Motors to create the Lunar Roving Vehicle (LRV)—a lightweight electric dune buggy with wire-mesh wheels that could expand an astronaut’s exploration radius from a few hundred meters to ten kilometers. The landing site chosen was daring: Hadley-Apennine, nestled between 4,500-meter peaks and an ancient canyon.'
      },
      journey: {
        title: 'II. Dropping into the Apennine Valley',
        subtitle: 'A Steep Approach Past Mount Hadley Delta',
        content: 'Falcon began its descent on July 30, 1971, flying down a steeper 25-degree trajectory to clear the towering Apennine mountain range. As Commander David Scott guided the lander through the narrow gorge, the rocket exhaust kicked up blinding dust. Falcon set down with a sharp thump on a 10-degree slope, buckling an engine nozzle extension bell against a boulder. When Scott opened the upper docking hatch for a stand-up reconnaissance, he was greeted by the sheer majesty of towering lunar mountains rising into a pitch-black sky.'
      },
      keyMoments: {
        title: 'III. Driving Along the Abyss of Hadley Rille',
        subtitle: 'Twenty-Eight Kilometers of Electric Wheels',
        content: 'Over three separate extravehicular activities, Scott and Irwin drove their rover across 27.9 kilometers of terrain. They drove along the precipitous edge of Hadley Rille—a winding, 1.5-kilometer-wide canyon formed by an ancient collapsed lava tube—peering down 300 meters into exposed basalt layers. The rover gave the crew the freedom to cross boulder fields, stop at crater rims, and load heavy sample bags without physical exhaustion.'
      },
      discoveries: {
        title: 'IV. The Genesis Rock and Galileo’s Feather',
        subtitle: 'Searching for the Moon’s Primordial Crust',
        content: 'On Mount Hadley Delta, Scott spotted a gleaming white specimen sitting atop a dark boulder: sample 15415, the legendary "Genesis Rock." Composed almost entirely of pure anorthosite, isotopic dating confirmed it crystallized 4.1 billion years ago, representing the primordial crust of the Moon formed from an early magma ocean. Before departing, Scott held up a 1.3-pound geological hammer and a 0.06-pound falcon feather, dropping them simultaneously. In the lunar vacuum, both struck the dust at the exact same instant, validating Galileo Galilei’s 350-year-old law of free fall.'
      },
      legacy: {
        title: 'V. The Fallen Astronaut at Falcon’s Feet',
        subtitle: 'A Quiet Memorial in the Shadow of the Mountains',
        content: 'Before stepping into Falcon for the last time, David Scott placed a small 8.5-centimeter aluminum sculpture entitled "Fallen Astronaut" into the soil, accompanied by a plaque bearing the names of fourteen American astronauts and Soviet cosmonauts who had died in the line of duty. When Falcon’s upper stage departed, its gold descent stage remained alone against the towering cliffs of Mount Hadley—a testament to human curiosity, scientific rigor, and shared exploration.'
      }
    }
  },

  // --------------------------------------------------------------------------
  // 8. APOLLO 16 DESCENT STAGE
  // --------------------------------------------------------------------------
  'apollo-16-descent': {
    artifactId: 'apollo-16-descent',
    title: 'The Great Surprise of the Lunar Highlands',
    subtitle: 'Apollo 16 Lunar Module Orion // Descartes Highlands',
    lead: 'Sent to prove that the Moon’s bright highlands were formed by ancient volcanic eruptions, Apollo 16 discovered instead that giant asteroid impacts had shattered and rebuilt the crust.',
    summary: 'The descent stage of Apollo 16’s Orion carried John Young and Charles Duke to the Descartes Highlands in April 1972. Exploring Stone Mountain and North Ray Crater with the Lunar Roving Vehicle, the crew revolutionized planetary science by disproving pre-mission volcanic theories and demonstrating the dominant role of impact cratering.',
    highlightQuote: 'There you go, sports fans! 26 kilometers an hour in the Grand Prix of the Moon!',
    quoteAuthor: 'John Young, testing the Lunar Roving Vehicle',
    verifiedStatus: 'Permanent Historical Site at Descartes Highlands',
    restingLocation: 'Descartes Highlands, Moon (8.973°S, 15.498°E)',
    chapters: {
      origin: {
        title: 'I. The Volcanic Hypothesis',
        subtitle: 'Targeting the Ancient Cayley Plains',
        content: 'Prior to Apollo 16, terrestrial geologists were convinced that the smooth, rolling Descartes Highlands were volcanic in origin. They theorized that viscous, rhyolitic lavas had oozed onto the surface, forming domes and plains similar to terrestrial volcanic fields. Apollo 16 was commissioned to test this hypothesis by sending Commander John Young, Command Module Pilot Ken Mattingly, and Lunar Module Pilot Charles Duke to the highest elevation landing site of the Apollo program.'
      },
      journey: {
        title: 'II. A Six-Hour Orbiting Crisis',
        subtitle: 'A Shaking Gimbal on the Service Propulsion Engine',
        content: 'As John Young and Charlie Duke prepared to land on April 20, 1972, Ken Mattingly fired the Service Propulsion System (SPS) on the command module Casper to adjust his orbit. The engine gimbal began vibrating violently due to a secondary control loop failure. Mission rules dictated an immediate abort: if the engine could not burn reliably, the crew could be stranded in lunar orbit. For six tense hours, engineers at Mission Control simulated the failure on Earth, determining the secondary system was safe to fire. Flight Director Gerry Griffin gave the green light, and Orion commenced its descent.'
      },
      keyMoments: {
        title: 'III. Driving Up Stone Mountain',
        subtitle: 'The Lunar Grand Prix and House Rock',
        content: 'Orion touched down smoothly on the Cayley Plains. Deploying their rover, Young and Duke drove up the steep, 18-degree flank of Stone Mountain, ascending 200 meters above the valley floor to examine fresh impact debris. During a rover calibration run, Young engaged in the famous "Grand Prix," drifting the rover around crater rims to test handling limits. On their third EVA, they drove to the edge of North Ray Crater, approaching "House Rock"—a monumental boulder the size of a four-story building blasted out from deep within the crust.'
      },
      discoveries: {
        title: 'IV. Shattering the Volcanic Theory',
        subtitle: 'Nothing but Impact Breccias',
        content: 'Every rock Young and Duke inspected told the same startling truth: there were no volcanic rhyolites or andesites at Descartes. Every sample was an impact breccia—crushed, shattered, and heat-fused fragments forged by colossal meteoritic impacts billions of years ago. The mission forced a fundamental rewrite of lunar geology textbooks, proving that impact gardening, rather than internal volcanism, had shaped the early lunar crust and formed the vast ejecta blankets covering the highlands.'
      },
      legacy: {
        title: 'V. The Family Portrait in the Dust',
        subtitle: 'A Quiet Human Touch on the Plain',
        content: 'Before returning to Orion, Charlie Duke dropped a small, shrink-wrapped color photograph of himself, his wife Dorothy, and their two young sons onto the lunar dust, where it remains today beneath the blinding sun. The crew collected 95.7 kilograms of samples and logged 27 kilometers of driving. When Orion’s ascent engine ignited, its sturdy gold-wrapped Descent Stage stayed anchored in the Descartes dust, standing as a monument to scientific honesty in the face of surprising physical evidence.'
      }
    }
  },

  // --------------------------------------------------------------------------
  // 9. APOLLO 17 DESCENT STAGE
  // --------------------------------------------------------------------------
  'apollo-17-descent': {
    artifactId: 'apollo-17-descent',
    title: 'The Golden Age Finale at Taurus-Littrow',
    subtitle: 'Apollo 17 Lunar Module Challenger // Taurus-Littrow Valley',
    lead: 'Carrying the first professional geologist to walk on the Moon, Apollo 17 pushed human exploration to its absolute limit, concluding humanity’s first era of lunar landings with extraordinary scientific discoveries.',
    summary: 'The descent stage of Apollo 17’s Lunar Module Challenger served as the scientific home for Eugene Cernan and Harrison Schmitt in December 1972. Exploring the dramatic Taurus-Littrow valley for over 22 hours across 35 kilometers, they discovered ancient orange pyroclastic volcanic soil and set lasting records for human spaceflight.',
    highlightQuote: 'We leave as we came and, God willing, as we shall return, with peace and hope for all mankind.',
    quoteAuthor: 'Eugene Cernan, last human to walk on the Moon in the 20th century',
    verifiedStatus: 'Permanent Historical Site at Taurus-Littrow Valley',
    restingLocation: 'Taurus-Littrow Valley, Moon (20.191°N, 30.772°E)',
    chapters: {
      origin: {
        title: 'I. The Geologist’s Moon',
        subtitle: 'The Climax of the Apollo Program',
        content: 'With Apollo 18, 19, and 20 canceled due to budget cutbacks, Apollo 17 was humanity’s final voyage to the Moon in the 20th century. Under immense pressure from the National Academy of Sciences, NASA assigned Dr. Harrison "Jack" Schmitt—a Harvard-trained geologist—to join seasoned commander Eugene Cernan and command module pilot Ron Evans. The destination chosen was Taurus-Littrow: a deep, narrow valley flanked by towering massifs taller than the Grand Canyon, featuring dark volcanic deposits and landslide debris.'
      },
      journey: {
        title: 'II. Night Launch of the Saturn V',
        subtitle: 'A Pillar of Fire into the Florida Night',
        content: 'Apollo 17 made history before even leaving Earth: it was the only night launch of the Saturn V rocket. At 12:33 AM on December 7, 1972, five F-1 engines ignited, turning the Florida coastline as bright as midday and rattling windows eighty miles away. Four days later, Challenger descended into the narrow Taurus-Littrow valley, skimming mere meters above the crest of the South Massif before landing smoothly on the valley floor.'
      },
      keyMoments: {
        title: 'III. The Fenders, the Massifs, and the Rover',
        subtitle: 'Fixing the Mudguard with Duct Tape and Maps',
        content: 'During their first EVA, Cernan accidentally caught his hammer pocket on the rover’s rear fiberglass fender, tearing it off. Without the fender, the wire wheels threw a relentless rooster-tail of abrasive lunar dust over the astronauts, coating instruments and radiators. Back on Earth, engineers devised a repair using laminated lunar maps, duct tape, and clamps from the command module. The improvised repair held for over 35 kilometers of driving across boulder fields and steep scree slopes.'
      },
      discoveries: {
        title: 'IV. The Orange Soil of Shorty Crater',
        subtitle: 'Pyroclastic Fountains from the Lunar Interior',
        content: 'At Shorty Crater, Jack Schmitt kicked up the soil and exclaimed: "Hey, there is orange soil here! It’s all over!" Laboratory analysis back on Earth confirmed that the orange beads were volcanic glass droplets erupted from fire fountains 3.6 billion years ago, brought up from deep within the lunar mantle. The crew collected 110.5 kilograms of rocks—the largest haul of the Apollo program—including Troctolite 76535, a pristine 4.2-billion-year-old plutonic rock that proved the Moon once had an internal dynamo.'
      },
      legacy: {
        title: 'V. The Final Footsteps',
        subtitle: 'A Fifty-Year Silence Awaiting Return',
        content: 'On December 14, 1972, Gene Cernan stepped onto Challenger’s ladder, leaving the final human footprint of the 20th century in the lunar dust. Before departing, the crew unveiled a commemorative plaque mounted on the descent stage: "Here man completed his first explorations of the Moon, December 1972 A.D." For more than half a century, the Challenger Descent Stage has stood undisturbed beneath the silent monoliths of the Taurus-Littrow valley, awaiting the next chapter of human footsteps.'
      }
    }
  },

  // --------------------------------------------------------------------------
  // 10. CHANG'E 3 LANDER
  // --------------------------------------------------------------------------
  'change-3-lander': {
    artifactId: 'change-3-lander',
    title: 'The Rebirth of Lunar Surface Science',
    subtitle: 'China National Space Administration // Mare Imbrium',
    lead: 'Nearly thirty-eight years after the last robotic craft touched down on the Moon, a gold-wrapped lander descended onto Mare Imbrium, inaugurating a modern robotic renaissance.',
    summary: 'Chang’e 3 executed China’s first robotic soft landing on the Moon in December 2013, ending a 37-year global hiatus in lunar surface landings. Deploying the Yutu rover and operating the first Moon-based astronomical ultraviolet telescope, its lander operated for years in the harsh lunar environment.',
    highlightQuote: 'We landed on Mare Imbrium not merely to repeat the past, but to establish a modern permanent laboratory on the Moon.',
    quoteAuthor: 'CNSA Lunar Exploration Program Statement',
    verifiedStatus: 'Preserved Surface Station at Mare Imbrium',
    restingLocation: 'Mare Imbrium, Moon (44.121°N, 19.512°W)',
    chapters: {
      origin: {
        title: 'I. The Thirty-Seven-Year Silence',
        subtitle: 'China’s Step-by-Step Lunar Odyssey',
        content: 'Following the departure of the Soviet Luna 24 sample return mission in August 1976, no spacecraft touched the surface of the Moon for almost four decades. The China National Space Administration (CNSA) methodically planned the Chang’e program, named after the mythical Chinese goddess of the Moon. After orbital mappers Chang’e 1 and 2 successfully surveyed the Moon from above, Chang’e 3 was built as an ambitious heavy soft-lander carrying a robotic rover, advanced variable-thrust engines, and long-term scientific instruments.'
      },
      journey: {
        title: 'II. Autonomous Descent by Optical Guidance',
        subtitle: 'Hovering Above Mare Imbrium',
        content: 'Chang’e 3 launched atop a Long March 3B rocket from Xichang on December 1, 2013. On December 14, the lander fired its single 7,500-Newton variable-thrust engine to brake from orbit. At 100 meters above the surface, the craft brought itself to a complete hover, using laser rangefinders and optical cameras to scan the ground for boulders and craters. Having identified a smooth patch between impact scars on northern Mare Imbrium, the guidance computer commanded a gentle touchdown, shutting down the engine four meters above the dust.'
      },
      keyMoments: {
        title: 'III. Yutu Rolls Down the Ramps',
        subtitle: 'The Jade Rabbit Explores Ancient Basalt Plains',
        content: 'Hours after landing, two motorized deployment ramps unfolded from the lander’s deck. The 140-kilogram, six-wheeled rover Yutu ("Jade Rabbit") rolled into the grey soil, turning around to take high-resolution color photographs of the lander’s Chinese national flag and instruments. The lander was powered by an advanced radioisotope heater unit (RHU) containing radioactive isotopes, designed to circulate warm fluid and protect critical avionics during the freezing -180°C two-week lunar nights.'
      },
      discoveries: {
        title: 'IV. Astronomy from the Moon',
        subtitle: 'The Lunar-Based Ultraviolet Telescope',
        content: 'Chang’e 3 carried the Moon-Based Ultraviolet Telescope (MUVT)—the first robotic astronomical observatory operated from the surface of another celestial body. Unencumbered by Earth’s thick ozone layer and atmospheric turbulence, the telescope observed variable stars, binary systems, and active galactic nuclei continuously for weeks at a time. The lander also operated an extreme ultraviolet camera that captured the first long-term, wide-angle views of Earth’s plasmasphere, studying how our planet interacts with the solar wind.'
      },
      legacy: {
        title: 'V. A New Era of Exploration',
        subtitle: 'Paving the Way for Far-Side and Sample Return Missions',
        content: 'The Chang’e 3 lander functioned for over five years, outlasting its nominal one-year design life and providing essential operational experience in autonomous hazard avoidance, thermal survival, and optical tracking. It proved that modern automated systems could reliably survive the harsh lunar environment, laying the direct technical foundation for Chang’e 4’s historic landing on the lunar far side and Chang’e 5’s sample return to Earth.'
      }
    }
  },

  // --------------------------------------------------------------------------
  // 11. CHANG'E 4 LANDER
  // --------------------------------------------------------------------------
  'change-4-lander': {
    artifactId: 'change-4-lander',
    title: 'The Unseen Horizon of the Far Side',
    subtitle: 'China National Space Administration // Von Kármán Crater',
    lead: 'For all of human history, the far side of the Moon remained permanently hidden from Earth view. In January 2019, a robotic probe touched down in an ancient impact basin where no spacecraft had ever landed before.',
    summary: 'Chang’e 4 achieved humanity’s first soft landing on the far side of the Moon in January 2019. Communicating via the Queqiao relay satellite at the Earth-Moon L2 Lagrangian point, it explored the South Pole-Aitken basin with the Yutu-2 rover, uncovering mantle-derived minerals and conducting radio astronomy free from Earth interference.',
    highlightQuote: 'This is a small step for a spacecraft, but a giant leap for our knowledge of the Moon’s hidden face.',
    quoteAuthor: 'CNSA Lunar Exploration Team',
    verifiedStatus: 'Active Scientific Station at Von Kármán Crater',
    restingLocation: 'Von Kármán Crater, Moon (45.457°S, 177.588°E)',
    chapters: {
      origin: {
        title: 'I. The Far-Side Communications Barrier',
        subtitle: 'Overcoming the Tidal Lock of the Moon',
        content: 'Because the Moon is tidally locked to Earth, completing one rotation on its axis in the exact time it takes to complete an orbit, the far side never faces our planet. This presented an impenetrable communications barrier: any lander on the far side would be shadowed by the Moon’s bulk, unable to send radio signals to Earth. To solve this, China launched Queqiao ("Magpie Bridge") in May 2018—a dedicated communications relay satellite stationed in a halo orbit around the Earth-Moon L2 Lagrangian point, 65,000 kilometers beyond the Moon, with line-of-sight to both the far side and Earth.'
      },
      journey: {
        title: 'II. Plunging into the South Pole-Aitken Basin',
        subtitle: 'Landing in a 2.5-Billion-Year-Old Impact Scar',
        content: 'Chang’e 4 launched on December 7, 2018. Its target was Von Kármán Crater, situated inside the colossal South Pole-Aitken Basin—the oldest, deepest, and largest confirmed impact structure on the Moon, spanning 2,500 kilometers. On January 3, 2019, guided by signals relayed through Queqiao, Chang’e 4 initiated autonomous descent, dodging crater rims and settling gently onto the lava-flooded floor of Von Kármán, transmitting the first close-up photograph of the lunar far side back to Earth.'
      },
      keyMoments: {
        title: 'III. Biological Seeds and the Yutu-2 Rover',
        subtitle: 'Germinating Cotton on Another World',
        content: 'Shortly after landing, Chang’e 4 deployed the Yutu-2 rover, which began trundling across the fine regolith. Inside the lander was a sealed 3-kilogram mini-biosphere containing air, water, soil, cotton seeds, potato seeds, and fruit-fly eggs. Days later, telemetry confirmed that a cotton seed had germinated—the first plant sprout ever grown on another celestial body, surviving until the freezing lunar night overwhelmed the unheated canister.'
      },
      discoveries: {
        title: 'IV. Mantle Rocks and Pristine Skies',
        subtitle: 'Probing Deep Crustal Composition and Low-Frequency Waves',
        content: 'Yutu-2’s visible and near-infrared spectrometer identified pyroxene and olivine minerals in the soil—dense minerals typical of the lunar mantle that were excavated from deep beneath the crust by the titanic Aitken impact. Furthermore, free from Earth’s overwhelming radio chatter, Chang’e 4 operated low-frequency radio spectrometers, pioneering a new window into low-frequency cosmic radio emissions.'
      },
      legacy: {
        title: 'V. The Longest-Lived Explorer of the Hidden Face',
        subtitle: 'A Modern Scientific Benchmark',
        content: 'Chang’e 4 and Yutu-2 have operated on the lunar far side for over five years, vastly exceeding their nominal three-month mission lifetime. Yutu-2 has driven over 1,500 meters across the undulating terrain, mapping subterranean soil layers down to 40 meters using ground-penetrating radar. The lander remains an active beacon on the Moon’s hidden face, illustrating how international relay networks and robotic persistence can open entirely new frontiers of science.'
      }
    }
  },

  // --------------------------------------------------------------------------
  // 12. LUNAR LASER RETROREFLECTORS
  // --------------------------------------------------------------------------
  'lunar-retroreflectors': {
    artifactId: 'lunar-retroreflectors',
    title: 'The Silent Mirrors That Measure the Void',
    subtitle: 'Distributed Passive Ranging Arrays // Multi-Site Lunar Network',
    lead: 'Small, unpowered arrays of high-purity glass prisms left by American astronauts and Soviet rovers continue to reflect laser pulses from Earth, providing fifty years of continuous gravitational science without a single battery.',
    summary: 'Deployed by Apollo 11, 14, 15 and Soviet Lunokhod rovers, the Lunar Laser Ranging Retroreflectors consist of corner-cube quartz prisms that reflect incoming photons back to their exact origin. Fired upon by Earth observatories for over five decades, they measure the Moon’s orbital drift to millimeter precision and test Einstein’s theory of General Relativity.',
    highlightQuote: 'A single pulse of light travels a quarter of a million miles, hits a mirror the size of a suitcase, and returns to tell us the Moon is slowly spiraling away.',
    quoteAuthor: 'NASA Lunar Laser Ranging Team',
    verifiedStatus: 'Operational Multi-Site Scientific Network (Five Stations Active)',
    restingLocation: 'Distributed across Tranquility, Fra Mauro, Hadley, Mare Imbrium & Le Monnier',
    chapters: {
      origin: {
        title: 'I. The Geometry of Corner Cubes',
        subtitle: 'Designing an Experiment for the Millennia',
        content: 'During the planning of Apollo scientific packages in the early 1960s, physicists realized that active electronic transmitters would eventually run out of battery or reactor power within months or years. Carroll Alley and a team of physicists proposed a brilliant passive alternative: an array of corner-cube retroreflectors made of optical-grade suprasil quartz. Like the reflectors on a bicycle pedal, a corner cube has three mutually perpendicular reflective faces that bounce an incoming photon 180 degrees back along its exact incident path, regardless of angle.'
      },
      journey: {
        title: 'II. Carried by Boots and Rover Decks',
        subtitle: 'Five Stations Across the Lunar Disk',
        content: 'The first array, containing 100 quartz prisms in an aluminum frame, was set up by Neil Armstrong in July 1969 at Tranquility Base. Apollo 14 added a second 100-prism array at Fra Mauro in February 1971. Apollo 15 deployed the largest array—containing 300 corner cubes—at Hadley-Apennine in July 1971. Concurrently, French scientists manufactured 14-prism arrays mounted atop the Soviet Lunokhod 1 and Lunokhod 2 rovers. Together, these five stations formed a broad geometric polygon spanning hundreds of kilometers across the lunar near side.'
      },
      keyMoments: {
        title: 'III. Bouncing Photons Across 770,000 Kilometers',
        subtitle: 'One Returning Photon from a Quadrillion Sent',
        content: 'Operating the experiment is a monumental technological challenge. Earth observatories—such as the McDonald Observatory in Texas, the Côte d’Azur Observatory in France, and the Apache Point Observatory in New Mexico—aim powerful pulsed lasers through giant telescope mirrors at the Apollo coordinates. A laser burst pulses out over 10^17 photons through the atmosphere. After traveling 385,000 kilometers, the beam spreads to over two kilometers wide. Only a few photons strike the small prism array, and after the return journey, detectors on Earth receive merely one or two returning photons per pulse.'
      },
      discoveries: {
        title: 'IV. Testing Einstein and Tidal Deceleration',
        subtitle: 'Measuring the Moon to Within a Millimeter',
        content: 'By clocking the light’s round-trip travel time (approximately 2.5 seconds) with picosecond atomic clocks, physicists measure the distance to the Moon with an accuracy of one millimeter. This continuous fifty-year data stream revealed that tidal friction causes Earth’s rotation to decelerate, while the Moon spirals outward into space at exactly 3.8 centimeters per year. It verified Einstein’s Equivalence Principle to unprecedented precision, proving that gravitational binding energy falls at the exact same rate in a gravitational field as ordinary mass.'
      },
      legacy: {
        title: 'V. The Longest-Running Experiments in Space History',
        subtitle: 'Immortal Monuments of Pure Optics',
        content: 'Because they contain no moving parts, no wires, and require zero electrical power, the Lunar Laser Retroreflectors are the only Apollo experiments still actively producing cutting-edge scientific data today. Over 50 years of solar wind sputtering and micrometeorite impacts have diminished their optical throughput, yet modern photon-counting detectors continue to range them routinely. They remain an immortal bridge of light between Earth and Moon, demonstrating the enduring elegance of passive physics.'
      }
    }
  },

  // --------------------------------------------------------------------------
  // 13. OPPORTUNITY
  // --------------------------------------------------------------------------
  'opportunity': {
    artifactId: 'opportunity',
    title: 'The Marathon Across Martian Sands',
    subtitle: 'Mars Exploration Rover B (MER-B) // Meridiani Planum',
    lead: 'Engineered to survive just ninety Martian days, a solar-powered golf-cart-sized rover drove for fourteen years and 45 kilometers, discovering that liquid water once drenched the ancient plains of Mars.',
    summary: 'Opportunity landed on Meridiani Planum in January 2004 with a 90-sol design lifespan. Over 14 years and 138 days, it survived sand traps, frozen winters, and mechanical failures, driving a record 45.16 kilometers. It proved that ancient Mars possessed standing liquid water suitable for life before a global dust storm ended its journey in 2018.',
    highlightQuote: 'My battery is low and it’s getting dark.',
    quoteAuthor: 'Poetic interpretation of Opportunity’s final telemetry, June 10, 2018',
    verifiedStatus: 'Mission Completed (Silent at Perseverance Valley, Endeavour Crater)',
    restingLocation: 'Perseverance Valley, Endeavour Crater, Mars (2.28°S, 354.71°E)',
    chapters: {
      origin: {
        title: 'I. The Mission of the Geologist Twin',
        subtitle: 'Follow the Water on the Red Planet',
        content: 'Following the tragic loss of the Mars Climate Orbiter and Mars Polar Lander in 1999, NASA needed a resilient, inspiring return to the surface of Mars. The Jet Propulsion Laboratory developed the twin Mars Exploration Rovers: Spirit and Opportunity. Each was a 185-kilogram robotic geologist armed with a Rock Abrasion Tool (RAT), microscopic imager, and Mössbauer spectrometer mounted on a dexterous robotic arm. Their primary scientific directive was straightforward yet historic: "Follow the water" to determine whether Mars was ever hospitable to life.'
      },
      journey: {
        title: 'II. A Hole-in-One at Eagle Crater',
        subtitle: 'Bouncing to a Halt in a Mineral Goldmine',
        content: 'Opportunity survived the fiery descent through Mars’s atmosphere cocooned inside airbags on January 25, 2004. Bouncing dozens of times across the smooth basaltic plains of Meridiani Planum, it rolled down into Eagle Crater—a small, 22-meter impact depression—executing what engineers called "an interplanetary hole-in-one." When the rover opened its solar petals and stood up, its panoramic cameras revealed outcroppings of bedrock right in front of its wheels—the first sedimentary bedrock ever photographed on Mars.'
      },
      keyMoments: {
        title: 'III. Escaping the Sand Trap at Purgatory Ripple',
        subtitle: 'Thirty-Eight Days of Wheels Spinning in Vain',
        content: 'Opportunity’s journey was a masterclass in engineering ingenuity. In April 2005, while driving across Meridiani, all six wheels dug deeply into a soft, undulating sand dune nicknamed "Purgatory Ripple." Back in Pasadena, JPL engineers built a sandbox filled with simulated Martian dirt, driving a test rover for weeks to script millimeter-scale escape maneuvers. After 38 agonizing days of backward rotations, Opportunity climbed out of the trap and resumed rolling, continuing across Victoria Crater and onward toward Endeavour Crater.'
      },
      discoveries: {
        title: 'IV. Blueberries and an Ancient Salty Sea',
        subtitle: 'Proving Liquid Water Once Bathed Mars',
        content: 'Within weeks of landing, Opportunity’s microscopic imager discovered millions of tiny, spherical grey nodules embedded in the rock, nicknamed "blueberries." Chemical spectroscopy revealed they were composed of hematite, which formed when acidic, mineral-rich groundwater slowly percolated through porous sediment billions of years ago. Later, on the rim of the 22-kilometer Endeavour Crater, Opportunity discovered bright veins of pure gypsum—unequivocal proof of neutral-pH liquid water flowing through underground fractures.'
      },
      legacy: {
        title: 'V. The Final Storm at Perseverance Valley',
        subtitle: 'A Marathon Champion Rests on the Rim',
        content: 'In 2015, Opportunity crossed the 42.195-kilometer mark, completing the first off-world marathon by any robotic vehicle. In June 2018, a catastrophic global dust storm blanketed Mars, blotting out 99% of sunlight over Perseverance Valley. With its solar panels starved of power, Opportunity sent its final transmission on Sol 5111 (June 10, 2018). For eight months, NASA beamed over a thousand recovery commands, including Billie Holiday’s "I’ll Be Seeing You." On February 13, 2019, NASA declared the mission complete. Opportunity rests forever overlooking Endeavour Crater—an enduring legend of exploration.'
      }
    }
  },

  // --------------------------------------------------------------------------
  // 14. SPIRIT
  // --------------------------------------------------------------------------
  'spirit': {
    artifactId: 'spirit',
    title: 'The Unyielding Sister at Gusev Crater',
    subtitle: 'Mars Exploration Rover A (MER-A) // Gusev Crater',
    lead: 'Facing harsh terrain, unexpected volcanic rocks, and a seized front wheel, Spirit turned mechanical adversity into one of the greatest hydrothermal discoveries on Mars.',
    summary: 'Spirit touched down in Gusev Crater in January 2004. Defying expectations after finding volcanic basalt instead of ancient lakebeds, it drove into the Columbia Hills, climbed Husband Hill, and discovered ancient silica-rich hot springs by dragging a broken wheel, operating for over six years until becoming trapped in soft sand.',
    highlightQuote: 'Spirit showed us that when one wheel stops turning, you drag it backward and keep exploring.',
    quoteAuthor: 'Steve Squyres, MER Principal Investigator',
    verifiedStatus: 'Mission Completed (Silent at Troy, Columbia Hills)',
    restingLocation: 'Troy, Gusev Crater, Mars (14.57°S, 175.47°E)',
    chapters: {
      origin: {
        title: 'I. The Search for an Ancient Lake',
        subtitle: 'Targeting the Mouth of Ma’adim Vallis',
        content: 'Spirit was the first of the two twin Mars Exploration Rovers launched in 2003. Mission scientists chose Gusev Crater—a massive 166-kilometer impact crater—because a prominent dried river canyon, Ma’adim Vallis, emptied directly into it. Orbital photos suggested Gusev had once held an ancient lake the size of Lake Erie. Spirit was sent to investigate the lakebed sediments, decode their depositional history, and search for ancient biosignatures.'
      },
      journey: {
        title: 'II. A Bouncing Arrival on Hard Basalt',
        subtitle: 'The Computer Crash on Sol 18',
        content: 'Spirit landed on January 4, 2004, cocooned inside protective airbags that bounced 28 times before coming to rest on a flat, rock-strewn volcanic plain. Just two weeks into the mission, Spirit suffered a catastrophic computer reboot loop that paralyzed communications, caused by a corrupted flash memory file system. Working around the clock, JPL software engineers rebooted the rover in safe RAM mode, wiped the flash memory, and restored full operations, allowing Spirit to begin rolling.'
      },
      keyMoments: {
        title: 'III. Dragging a Dead Wheel Backward',
        subtitle: 'Turning Mechanical Failure into Discovery',
        content: 'To the initial disappointment of scientists, Gusev Crater’s floor was blanketed with unweathered volcanic basalt; the ancient lake sediments had been buried or eroded away. Refusing to surrender, the team pointed Spirit toward the Columbia Hills, three kilometers away on the horizon. Spirit climbed 100 meters up Husband Hill, becoming the first mountaineering rover on another planet. In March 2006, its right front drive motor burned out. Unable to roll the wheel, engineers programmed Spirit to drive backward, dragging the dead wheel behind like a plow.'
      },
      discoveries: {
        title: 'IV. The Accidental Treasure of Silica',
        subtitle: 'Hydrothermal Hot Springs on Mars',
        content: 'As Spirit dragged its jammed wheel across a low plateau called "Home Plate" in 2007, the frozen wheel scraped away the top layer of rust-colored dust, churning up a bright white trench of soil. Analysis by Spirit’s APXS spectrometer revealed the trench was 90% pure amorphous silica—the kind formed on Earth only in volcanic fumaroles or boiling hydrothermal hot springs. The broken wheel had inadvertently uncovered ironclad proof that volcanic water systems, ideal for microbial life, had once bubbled vigorously on ancient Mars.'
      },
      legacy: {
        title: 'V. The Winter Trap at Troy',
        subtitle: 'A Six-Year Journey of Tenacity',
        content: 'In May 2009, while navigating a plateau dubbed "Troy," Spirit broke through a crust of bright sulfate soil and sank into soft, flour-like sand. With only four functional wheels and an unfavorable solar panel tilt, Spirit could not gather enough sunlight to survive the harsh Martian winter. On March 22, 2010, after 2,210 sols of operations (over 24 times its design life), Spirit sent its final transmission. It rests quietly beside Home Plate—a warrior that redefined tenacity in robotic exploration.'
      }
    }
  },

  // --------------------------------------------------------------------------
  // 15. CURIOSITY
  // --------------------------------------------------------------------------
  'curiosity': {
    artifactId: 'curiosity',
    title: 'The Nuclear Laboratory of Mount Sharp',
    subtitle: 'Mars Science Laboratory (MSL) // Gale Crater',
    lead: 'Delivered by an unprecedented rocket-powered sky crane, a one-ton robotic chemist has spent over a decade drilling into ancient lakebeds and climbing a three-mile-high mountain on Mars.',
    summary: 'Curiosity touched down inside Gale Crater in August 2012, deployed by the revolutionary sky crane system. Powered by a radioisotope thermoelectric generator, it discovered that Gale once hosted long-lived, neutral-pH freshwater lakes rich in organic molecules and chemical energy, establishing that ancient Mars was fully habitable for microbial life.',
    highlightQuote: 'We went to Mars to find out if it had ever been habitable. We found out the answer is yes.',
    quoteAuthor: 'John Grotzinger, MSL Project Scientist',
    verifiedStatus: 'Actively Exploring (Traversing Mount Sharp, Gale Crater)',
    restingLocation: 'Mount Sharp (Aeolis Mons), Gale Crater, Mars (4.589°S, 137.441°E)',
    chapters: {
      origin: {
        title: 'I. Beyond Water: The Quest for Habitability',
        subtitle: 'Designing the Ultimate Rover',
        content: 'While Spirit and Opportunity established that water once flowed on Mars, NASA’s Mars Science Laboratory (MSL) asked the next profound question: Did Mars ever possess the environmental conditions and chemical building blocks required to support life? To answer this, JPL engineers designed Curiosity—a 900-kilogram vehicle the size of an SUV, powered by a multi-mission radioisotope thermoelectric generator (MMRTG) carrying plutonium-238, free from the dust limitations of solar panels. Inside its belly sat SAM (Sample Analysis at Mars) and CheMin, two miniaturized analytical chemistry laboratories.'
      },
      journey: {
        title: 'II. Seven Minutes of Terror',
        subtitle: 'The Audacious Sky Crane Descent',
        content: 'Curiosity was too heavy to land using conventional airbags. Engineers devised an audacious landing system dubbed the "Sky Crane." On August 6, 2012, Curiosity slammed into the Martian atmosphere at 21,000 km/h. After decelerating with a 21-meter supersonic parachute, a rocket-powered descent stage dropped out, fired eight throttleable hydrazine engines, hovered 20 meters above the ground, and lowered Curiosity on three nylon tethers. As the wheels touched the floor of Gale Crater, the tethers pyrotechnically severed, and the descent stage flew away to crash safely in the distance.'
      },
      keyMoments: {
        title: 'III. Drilling into Yellowknife Bay',
        subtitle: 'The First Taste of an Ancient Lakebed',
        content: 'Instead of heading immediately toward the central peak of Mount Sharp, scientists noticed smooth, fine-grained mudstones in a low-lying depression called Yellowknife Bay. Curiosity drove down, engaged its rotary percussive drill, and became the first rover to bore into a Martian rock. The drill bit pulled up fine, grey powder—unoxidized minerals protected from cosmic radiation. The analysis sent shockwaves through the scientific community: this was not acidic water, but a calm, fresh lake with neutral pH and all essential bio-elements (carbon, hydrogen, nitrogen, oxygen, phosphorus, sulfur).'
      },
      discoveries: {
        title: 'IV. Organic Molecules and Shifting Climates',
        subtitle: 'Ancient Chemistry Preserved in Stone',
        content: 'Over twelve years and more than thirty kilometers of travel, Curiosity climbed the sedimentary layers of Mount Sharp (Aeolis Mons), driving through geological time like reading pages in an open book. SAM detected complex, long-chain organic molecules (thiophenes, aromatic rings, alkyl chains) preserved inside 3.5-billion-year-old mudstones. It observed seasonal fluctuations of methane in the atmosphere and discovered alternating layers of clays and sulfate salts, documenting how Mars transformed from a wet, balmy oasis into a freezing, barren desert.'
      },
      legacy: {
        title: 'V. The Enduring Mountain Climber',
        subtitle: 'A Decade of Continuous Science',
        content: 'Curiosity has functioned continuously on Mars for more than 4,200 Martian sols, outlasting its two-year prime mission by more than a decade. Despite battered aluminum wheels scarred by sharp basalt ventifacts, its nuclear power source continues to supply heat and electricity. It remains actively climbing the Gediz Vallis channel on Mount Sharp, uncovering secrets of ancient water torrents and paving the way for future human explorers.'
      }
    }
  },

  // --------------------------------------------------------------------------
  // 16. PERSEVERANCE
  // --------------------------------------------------------------------------
  'perseverance': {
    artifactId: 'perseverance',
    title: 'The Sample Collector of Jezero Delta',
    subtitle: 'Mars 2020 Mission // Jezero Crater',
    lead: 'Searching for fossilized signs of ancient microscopic life, a nuclear rover accompanied by a scout helicopter is collecting sealed core samples for humanity’s first return mission from another planet.',
    summary: 'Perseverance landed in Jezero Crater in February 2021 to explore a dried ancient river delta. Equipped with ultraviolet spectrometers, subsurface radar, and the MOXIE oxygen generator, it has gathered over twenty hermetically sealed titanium sample cores of clay mudstones and river conglomerates destined for future return to Earth.',
    highlightQuote: 'We are seeking signs of ancient life and collecting the first samples from another world to bring home to Earth.',
    quoteAuthor: 'Katie Stack Morgan, Mars 2020 Deputy Project Scientist',
    verifiedStatus: 'Actively Exploring & Caching Samples (Jezero Crater Rim)',
    restingLocation: 'Jezero Crater, Mars (18.38°N, 77.58°E)',
    chapters: {
      origin: {
        title: 'I. The Search for Biosignatures',
        subtitle: 'Building on Curiosity’s Chassis',
        content: 'Following Curiosity’s confirmation that Mars was once habitable, NASA designed Perseverance (the Mars 2020 rover) to take the ultimate scientific step: searching for direct biosignatures—physical or chemical evidence of ancient microbial life. Mission planners chose Jezero Crater, a 45-kilometer impact basin that hosted an open-basin lake 3.7 billion years ago, fed by a prominent river that laid down a fan-shaped delta of fine clay mudstones—ideal for preserving microfossils.'
      },
      journey: {
        title: 'II. Terrain Relative Navigation',
        subtitle: 'A Computer-Guided Landing on the Delta Front',
        content: 'Landing inside Jezero Crater was far too hazardous for previous entry systems; the delta front was surrounded by jagged cliffs, sand dunes, and boulder fields. Perseverance utilized Terrain-Relative Navigation (TRN), snapping downward photographs during parachute descent, matching visual landmarks against an onboard hazard map, and autonomously adjusting its rocket thrusters to steer toward a safe, flat landing zone. On February 18, 2021, the rover touched down with pinpoint precision near the delta scarp.'
      },
      keyMoments: {
        title: 'III. Drilling, Caching, and Stowing',
        subtitle: 'A Robotic Factory for Pristine Cores',
        content: 'Mounted on Perseverance’s two-meter robotic arm is a heavy-duty rotary-percussive coring drill. Inside its chassis sits the Adaptive Caching Assembly—a miniaturized robotic arm that transfers drill bits, inspects extracted rock cores with cameras, measures volume, and hermetically seals them inside ultra-clean titanium tubes. To date, Perseverance has filled and cached over twenty sample tubes, creating a backup sample depot on the crater floor at "Three Forks" and carrying primary samples inside its belly for the Mars Sample Return mission.'
      },
      discoveries: {
        title: 'IV. Oxygen from the Air and Ancient River Torrents',
        subtitle: 'MOXIE, SHERLOC, and Conglomerate Boulders',
        content: 'Perseverance carries MOXIE (Mars Oxygen ISRU Experiment), which successfully extracted breathable oxygen directly from Mars’s carbon dioxide atmosphere sixteen times, producing 122 grams of O2—equivalent to what a small dog breathes in ten hours. The rover’s SHERLOC ultraviolet spectrometer detected aromatics and organic compounds linked to sulfate minerals. High-resolution Mastcam-Z images of the delta scarp revealed massive, rounded boulders embedded in coarse sandstone, proving that ancient Jezero experienced violent, deep-water river torrents capable of sweeping boulders miles downstream.'
      },
      legacy: {
        title: 'V. The Gateway to Mars Sample Return',
        subtitle: 'A Treasure Awaiting Collection',
        content: 'Perseverance continues its journey, having scaled the steep delta front and now exploring the ancient fractured carbonate margin of Jezero Crater. The sealed titanium tubes it carries represent the most carefully selected, scientifically valuable geologic collection in history. When future international missions land to retrieve these tubes, they will unlock the question of whether life ever arose on another world.'
      }
    }
  },

  // --------------------------------------------------------------------------
  // 17. INGENUITY
  // --------------------------------------------------------------------------
  'ingenuity': {
    artifactId: 'ingenuity',
    title: 'The Aerial Scout of the Red Planet',
    subtitle: 'Mars Helicopter Technology Demonstration // Jezero Crater',
    lead: 'Tucked beneath the belly of a rover was a four-pound tissue of carbon-fiber blades and lithium batteries that proved humans could achieve powered aerodynamic flight in the razor-thin atmosphere of another world.',
    summary: 'Ingenuity executed the first powered, controlled flight on another planet in April 2021. Designed as a 30-day technology demonstration to fly five times, it shattered all expectations, completing 72 flights over nearly three years, flying 17 kilometers, and scouting ahead of Perseverance until rotor blade damage ended its historic aerial journey.',
    highlightQuote: 'Ingenuity has proved that powered flight is possible in the thin atmosphere of Mars, opening a whole new dimension of exploration.',
    quoteAuthor: 'MiMi Aung, Ingenuity Project Manager',
    verifiedStatus: 'Mission Concluded (Resting at Valinor Hills, Jezero Crater)',
    restingLocation: 'Valinor Hills, Jezero Crater, Mars (18.44°N, 77.45°E)',
    chapters: {
      origin: {
        title: 'I. The Aerodynamic Impossibility',
        subtitle: 'Flying in One Percent Atmosphere',
        content: 'Aerospace engineers had debated flying on Mars for decades, but the physics were brutal. Mars’s atmospheric pressure at the surface is less than one percent of Earth’s—equivalent to flying at 100,000 feet altitude on Earth, far higher than any conventional helicopter has ever flown. To generate lift, MiMi Aung and her team at JPL designed Ingenuity: a minimalist, 1.8-kilogram rotorcraft with dual counter-rotating carbon-fiber blades spinning at an astonishing 2,400 revolutions per minute—nearly five times faster than an Earth helicopter.'
      },
      journey: {
        title: 'II. Dropped into the Freezing Martian Night',
        subtitle: 'Surviving on Its Own Batteries',
        content: 'Ingenuity rode to Mars folded beneath the belly of the Perseverance rover, protected by a debris shield. In early April 2021, the rover unfolded the helicopter’s carbon legs, released its locking pins, and dropped it four inches onto the dirt. Perseverance backed away, exposing the helicopter’s postage-stamp solar panel to the sun. That first night was the critical survival hurdle: Ingenuity’s small internal battery had to power survival heaters to keep delicate electronics from cracking in the -90°C cold. At sunrise, telemetry beamed through: Ingenuity was alive.'
      },
      keyMoments: {
        title: 'III. The Wright Brothers Moment',
        subtitle: 'April 19, 2021: Flight Number One',
        content: 'On April 19, 2021, Ingenuity spooled its twin rotors to 2,500 RPM. Autonomous flight software adjusted blade pitch based on downward camera optical flow. The tiny helicopter lifted off, climbed to three meters, hovered rock-steady in the gusty Martian wind for 39.1 seconds, snapped a photograph of its own shadow on the dust, and touched down softly. Fixed beneath its solar panel was a tiny swatch of muslin fabric from the wing of Orville and Wilbur Wright’s 1903 Flyer—a symbolic bridge across 117 years of aviation history.'
      },
      discoveries: {
        title: 'IV. From Experiment to Operational Scout',
        subtitle: 'Seventy-Two Flights Across Sand and Rocks',
        content: 'Planned for five flights over thirty days, Ingenuity proved so resilient that NASA transitioned it into an active operational scout. For nearly three years, the helicopter flew ahead of Perseverance, scouting travel corridors, mapping treacherous sand dunes in Séítah, and photographing ancient delta rock outcrops from perspectives no rover could ever reach. It reached altitudes of 24 meters, speeds of 36 km/h, and completed 72 flights covering 17.0 kilometers across the Jezero landscape.'
      },
      legacy: {
        title: 'V. The Final Touchdown at Valinor Hills',
        subtitle: 'A Broken Blade and an Eternal Legacy',
        content: 'On January 18, 2024, during Flight 72, Ingenuity executed an emergency landing in featureless, sandy terrain that confused its visual navigation sensors. One of its rotor blades struck a sand ripple upon touchdown, tearing off a tip. Though unable to fly again, all avionics and computers remained fully operational. Ingenuity is permanently parked at "Valinor Hills," continuing to log daily weather and battery telemetry. It proved that the skies of other worlds are open to human exploration.'
      }
    }
  },

  // --------------------------------------------------------------------------
  // 18. INSIGHT
  // --------------------------------------------------------------------------
  'insight': {
    artifactId: 'insight',
    title: 'Listening to the Pulse of Mars',
    subtitle: 'Interior Exploration using Seismic Investigations // Elysium Planitia',
    lead: 'While other missions explored the surface rocks and dried riverbeds, a solitary lander placed an ultra-sensitive dome on the red dust and listened to the vibrations of Mars’s deep interior.',
    summary: 'InSight landed on the flat volcanic plains of Elysium Planitia in November 2018. Over four years of operations, its ultra-sensitive SEIS seismometer detected more than 1,300 marsquakes, revealing the thickness of the Martian crust, the consistency of its mantle, and confirming that Mars possesses a large liquid metallic core.',
    highlightQuote: 'We’ve mapped the interior of Mars for the very first time, from crust to core.',
    quoteAuthor: 'Bruce Banerdt, InSight Principal Investigator',
    verifiedStatus: 'Mission Completed (Dust-Covered at Elysium Planitia)',
    restingLocation: 'Elysium Planitia, Mars (4.502°N, 135.623°E)',
    chapters: {
      origin: {
        title: 'I. The Geophysics of a Terrestrial World',
        subtitle: 'Exploring Below the Surface',
        content: 'For decades, planetary orbiters and rovers had mapped every square meter of the Martian surface, but what lay beneath remained a mystery. Why had Mars lost its protective global magnetic field four billion years ago? Was the core solid or molten? How thick was the crust? Bruce Banerdt and a global team of geophysicists conceived InSight: a stationary lander designed to conduct the first comprehensive "check-up" of Mars’s deep interior using seismology, geodesy, and heat-transport measurements.'
      },
      journey: {
        title: 'II. A Velvet Touchdown on Elysium Planitia',
        subtitle: 'Targeting the Flat "Biggest Parking Lot on Mars"',
        content: 'InSight launched from Vandenberg Air Force Base in California on May 5, 2018—the first interplanetary launch from the U.S. West Coast. On November 26, 2018, the lander executed a flawless supersonic entry, firing pulsed thrusters to land on Elysium Planitia, a smooth, rock-free volcanic plain selected specifically because it lacked boulders that could obstruct robotic instrument placement.'
      },
      keyMoments: {
        title: 'III. Deploying SEIS Beneath the Wind Shield',
        subtitle: 'Sensors Sensitive Enough to Detect an Atom’s Vibration',
        content: 'Using its mechanical robotic arm, InSight lifted the SEIS (Seismic Experiment for Interior Structure) instrument—developed by France’s CNES—and placed it directly onto the Martian soil. The arm then placed a heavy, aerodynamic Wind and Thermal Shield (WTS) over the seismometer to insulate it from ferocious wind noise and the 100-degree daily temperature swings. SEIS was so phenomenally sensitive that it could detect vibrations smaller than the radius of a hydrogen atom.'
      },
      discoveries: {
        title: 'IV. Thirteen Hundred Marsquakes and a Molten Core',
        subtitle: 'Revealing the Layered Structure of Mars',
        content: 'Over four years, InSight detected 1,319 marsquakes, including a colossal magnitude-4.7 tremor on May 4, 2022, that reverberated through the planet for ten hours. It tracked seismic waves from massive meteoroid impacts that excavated fresh craters miles away. By analyzing how these seismic waves bent and reflected through the deep rocks, scientists discovered that Mars’s crust is 24 to 72 kilometers thick, its mantle is chemically enriched, and its liquid iron-nickel core is surprisingly large (radius ~1,830 km) and less dense than previously thought, containing light elements like sulfur, oxygen, and carbon.'
      },
      legacy: {
        title: 'V. The Slow Blanket of Rust',
        subtitle: 'A Final Farewell from Elysium Planitia',
        content: 'Unlike rovers that could tilt toward the wind, InSight was stationary. Over four years, fine atmospheric dust steadily accumulated on its twin 2.2-meter circular solar arrays, cutting power output from 5,000 watt-hours per day down to less than 400. In December 2022, after its batteries were completely depleted, NASA officially retired the lander. InSight stands silent in Elysium Planitia, having opened an entirely new scientific discipline: comparative extraterrestrial seismology.'
      }
    }
  },

  // --------------------------------------------------------------------------
  // 19. VIKING 1
  // --------------------------------------------------------------------------
  'viking-1': {
    artifactId: 'viking-1',
    title: 'The First American Sentry on Mars',
    subtitle: 'Viking 1 Lander // Chryse Planitia',
    lead: 'On July 20, 1976—seven years to the day after Apollo 11 touched the Moon—a three-legged automated laboratory sent back the first clear color panoramic photograph of the rust-red surface of Mars.',
    summary: 'Viking 1 was the first successful American landing on Mars, operating on Chryse Planitia for more than six years. Carrying robotic cameras, automated biology experiments, meteorology stations, and a gas chromatograph-mass spectrometer, it revolutionized our understanding of Martian chemistry and weather before an inadvertent command severed contact in 1982.',
    highlightQuote: 'This is not a dead desert world. It is an alien planet with wind, clouds, frost, and geological complexity beyond our imagining.',
    quoteAuthor: 'Gerry Soffen, Viking Project Scientist',
    verifiedStatus: 'Permanent Historical Landmark at Chryse Planitia (Silent)',
    restingLocation: 'Chryse Planitia, Mars (22.697°N, 48.222°W)',
    chapters: {
      origin: {
        title: 'I. The Bicentennial Ambition',
        subtitle: 'The Grandest Robotic Effort of the Cold War',
        content: 'In the early 1970s, NASA’s Langley Research Center spearheaded Project Viking: the most ambitious, complex, and expensive robotic planetary mission of its era. Each Viking mission consisted of a massive orbiter paired with a three-legged, nuclear-powered lander. The landers were sterilized in dry-heat ovens at 111°C for 40 hours to prevent Earth microbes from hitchhiking to Mars, carrying sophisticated biological mini-laboratories designed to detect active alien metabolism in the soil.'
      },
      journey: {
        title: 'II. Searching for a Safe Haven on Chryse',
        subtitle: 'Orbital Reconnaissance Delays Touchdown',
        content: 'Viking 1 launched atop a Titan IIIE-Centaur on August 20, 1975, arriving in Mars orbit ten months later. The original landing date of July 4, 1976 (the U.S. Bicentennial) was abandoned when orbital radar and cameras revealed that the intended landing site was treacherous and filled with craters. Flight controllers spent two weeks scouring alternative sites, finally selecting Chryse Planitia ("Plains of Gold"). On July 20, 1976, the lander separated, deployed its parachute, fired three terminal descent engines, and settled softly on the rust-colored plain.'
      },
      keyMoments: {
        title: 'III. The First Line of Light',
        subtitle: 'A Scanning Mirror Beams the Red Planet',
        content: 'Twenty-five seconds after touchdown, Viking 1’s scanning camera began rotating, building up a digital image strip by strip. Line by line, the image materialized on television screens in Pasadena: first, the lander’s own footpad resting firmly in the dirt, followed by a panoramic sweep of a rolling, rock-strewn desert beneath a salmon-pink sky. For the first time in human history, humanity gazed directly upon the surface of Mars in crystal-clear detail.'
      },
      discoveries: {
        title: 'IV. The Biology Paradox and Carbon Chemistry',
        subtitle: 'Gas Exchange, Labeled Release, and Pyrolytic Release',
        content: 'Viking 1’s mechanical boom scooped soil samples into three onboard biological incubators. The Labeled Release experiment gave an immediate positive signal, detecting radioactive carbon gas release when nutrient broth touched the soil. However, the Gas Chromatograph-Mass Spectrometer (GCMS) found no organic molecules whatsoever. Decades later, scientists realized that reactive perchlorate salts in the soil, activated by ultraviolet light, had chemically mimicked biological oxidation. Viking 1 established that Martian chemistry was fiercely oxidative, dry, and hostile to organic preservation.'
      },
      legacy: {
        title: 'V. The Accidental Silence',
        subtitle: 'Six Years of Vigil Ended by a Software Typo',
        content: 'Powered by twin SNAP-19 radioisotope thermoelectric generators (RTGs), Viking 1 operated for an astounding 2,245 sols (over six Earth years), logging daily meteorological weather reports. In November 1982, ground controllers attempted to upload a software patch to improve battery charging capacity. An inadvertent memory address overlap overwrote the radio transmitter antenna pointing parameters, turning the high-gain dish away from Earth. Despite months of listening, contact was never regained. Viking 1 remains permanently enshrined in Chryse Planitia—humanity’s first long-term outpost on Mars.'
      }
    }
  },

  // --------------------------------------------------------------------------
  // 20. VIKING 2
  // --------------------------------------------------------------------------
  'viking-2': {
    artifactId: 'viking-2',
    title: 'The Sentinel of the Northern Plains',
    subtitle: 'Viking 2 Lander // Utopia Planitia',
    lead: 'Landing four thousand miles away from its twin in the boulder-strewn expanse of the northern lowlands, Viking 2 documented the cycle of Martian winter and photographed water-ice frost on an alien world.',
    summary: 'Viking 2 touched down in Utopia Planitia in September 1976. Operating for nearly four Earth years, it analyzed the boulder-strewn northern plains, measured seasonal atmospheric pressure swings as polar dry ice froze and sublimated, and captured the first iconic photographs of white water-ice frost coating the red terrain.',
    highlightQuote: 'Mars is a planet of dynamic seasons—where winter coats the rocks in frost and spring sweeps it away.',
    quoteAuthor: 'Viking Imaging Team',
    verifiedStatus: 'Permanent Historical Landmark at Utopia Planitia (Silent)',
    restingLocation: 'Utopia Planitia, Mars (48.269°N, 225.99°W)',
    chapters: {
      origin: {
        title: 'I. The Northern Complement',
        subtitle: 'Exploring a Different Climate Zone',
        content: 'Launched three weeks after its twin in September 1975, Viking 2 was assigned to explore the far northern lowlands of Mars. Scientists wanted to investigate whether a higher latitude with greater atmospheric moisture and colder temperatures would yield different soil chemistry or active biology. Utopia Planitia was chosen for its vast, smooth appearance from orbit, suggesting a deep geological depositional basin.'
      },
      journey: {
        title: 'II. A Tilted Touchdown on Boulders',
        subtitle: 'Landing on Rock-Strewn Plains',
        content: 'Viking 2 separated from its orbiter on September 3, 1976. As the three terminal rocket engines shut down at 2.5 meters altitude, the lander settled with one footpad propped up on a large rock, tilting the craft 8.2 degrees. When the television cameras completed their initial 360-degree sweep, scientists gasped: Utopia Planitia was a dramatic, surreal plain densely carpeted with angular, vesicular volcanic rocks extending to the horizon.'
      },
      keyMoments: {
        title: 'III. Shoving the Rock Named "Mr. Badger"',
        subtitle: 'Digging for Protected Soil',
        content: 'To test whether microorganisms were hiding beneath rocks protected from harsh solar ultraviolet radiation, Viking 2’s mechanical collector arm shoved a 10-kilogram rock nicknamed "Mr. Badger," nudging it aside to scoop the shielded soil beneath. Like Viking 1, the biological experiments showed curious chemical reactivity but no organic molecules, confirming that the exotic oxidizing chemistry was a global planetary phenomenon.'
      },
      discoveries: {
        title: 'IV. Water-Ice Frost in the Northern Winter',
        subtitle: 'Photographing Frozen Water on Mars',
        content: 'In May 1979, as winter enveloped Utopia Planitia, Viking 2 captured one of the most famous images in planetary exploration: a delicate, glistening blanket of white water-ice frost coating the red rocks and dunes. The frost layer, merely fractions of a millimeter thick, persisted for nearly one hundred days before sublimating under the spring sun, demonstrating the active hydrological cycle of the Martian atmosphere.'
      },
      legacy: {
        title: 'V. Battery Depletion in the Arctic Quiet',
        subtitle: 'A Landmark Foundation for Future Missions',
        content: 'Viking 2 operated for 1,281 Martian sols (nearly four Earth years). In April 1980, its internal nickel-cadmium batteries finally failed, and flight controllers formally shut down the station. Forty-five years later, in May 2021, China’s Zhurong rover landed in southern Utopia Planitia, following in Viking 2’s pioneering footsteps. Viking 2 rests forever in the vast northern plain, an enduring monument to humanity’s inaugural survey of the Red Planet.'
      }
    }
  },

  // --------------------------------------------------------------------------
  // 21. PATHFINDER / SOJOURNER
  // --------------------------------------------------------------------------
  'pathfinder': {
    artifactId: 'pathfinder',
    title: 'The Scout and the Airbag Revolution',
    subtitle: 'Mars Pathfinder & Sojourner Rover // Ares Vallis',
    lead: 'On July 4, 1997, a pyramid-shaped lander wrapped in giant balloons bounced onto an ancient catastrophic flood plain and released a microwave-oven-sized rover that transformed the exploration of Mars.',
    summary: 'Mars Pathfinder proved NASA’s "faster, better, cheaper" paradigm in July 1997, using airbags to land in Ares Vallis. Deploying the 10.6-kilogram Sojourner rover—the first wheeled vehicle on Mars—it analyzed volcanic boulders with an Alpha Proton X-ray Spectrometer, captivating hundreds of millions of people on the burgeoning World Wide Web.',
    highlightQuote: 'It was the day humanity returned to Mars to stay—not with billions of dollars, but with audacity and clever engineering.',
    quoteAuthor: 'Matthew Golombek, Pathfinder Project Scientist',
    verifiedStatus: 'Preserved Surface Station at Ares Vallis (Silent)',
    restingLocation: 'Ares Vallis, Mars (19.33°N, 335.55°E)',
    chapters: {
      origin: {
        title: 'I. Faster, Better, Cheaper',
        subtitle: 'Reinventing Mars Exploration on a Shoestring',
        content: 'Following the costly loss of the $1-billion Mars Observer in 1993, NASA Administrator Daniel Goldin demanded a radical change in philosophy: "Faster, Better, Cheaper." Led by Tony Spear at JPL, Mars Pathfinder was conceived as a low-cost technology demonstration built for one-tenth the cost of Viking. Instead of expensive, heavy terminal descent rockets, Pathfinder would test an ingenious concept: free-fall under parachutes, inflate giant cocooning airbags, hit the ground, and bounce to a stop.'
      },
      journey: {
        title: 'II. Bouncing into the Mouth of Ares Vallis',
        subtitle: 'A Catastrophic Flood Channel Landfall',
        content: 'Pathfinder entered the Martian atmosphere directly from interplanetary trajectory on July 4, 1997. After supersonic parachute deployment, radar altimeters fired three solid-fuel retrorockets, decelerating the craft to a hover 10 meters above the surface. Tethers cut, and the multi-layered Kevlar airbag cluster dropped, bouncing 15 times up to 15 meters high across the rocky floor of Ares Vallis—a giant ancient catastrophic flood channel that had washed a diverse variety of highland rocks into one accessible basin.'
      },
      keyMoments: {
        title: 'III. Sojourner Rolls Down the Ramp',
        subtitle: 'Ten Kilograms of Pure Cybernetic Ingenuity',
        content: 'As the airbags deflated and retracted, Pathfinder’s three triangular solar petals opened, uprighting the station. Tucked on one petal was Sojourner: a 10.6-kilogram, six-wheeled rover equipped with a rocker-bogie suspension system and laser hazard-avoidance eyes. On July 5, Sojourner rolled down a fabric ramp, becoming the first wheeled mobile robot to drive on Mars. Named after abolitionist Sojourner Truth, the tiny rover captivated the world, generating the first viral internet traffic event in World Wide Web history.'
      },
      discoveries: {
        title: 'IV. Sniffing Rocks Named Barnacle Bill and Yogi',
        subtitle: 'The Alpha Proton X-ray Spectrometer at Work',
        content: 'Sojourner pressed its Alpha Proton X-ray Spectrometer (APXS) directly against nearby boulders nicknamed "Barnacle Bill" and "Yogi." It discovered that Barnacle Bill was an andesite—a silica-rich volcanic rock that required repeated melting and recycling, providing the first direct chemical evidence of crustal differentiation on Mars. The lander photographed rounded pebbles and imbricated boulders aligned in the direction of ancient water flow, proving catastrophic floods had once surged down Ares Vallis.'
      },
      legacy: {
        title: 'V. The Spark of Modern Surface Exploration',
        subtitle: 'The Sagan Memorial Station',
        content: 'Pathfinder and Sojourner operated for nearly three times their design lifespan before battery depletion and a communications loss on September 27, 1997. NASA formally designated the lander the "Carl Sagan Memorial Station." The mission validated the rocker-bogie suspension and airbag landing architecture that would directly deliver the twin Mars Exploration Rovers Spirit and Opportunity seven years later. Pathfinder proved that mobility was the future of planetary exploration.'
      }
    }
  },

  // --------------------------------------------------------------------------
  // 22. PHOENIX
  // --------------------------------------------------------------------------
  'phoenix': {
    artifactId: 'phoenix',
    title: 'The Ice Harvester of the Arctic Plains',
    subtitle: 'Mars Scout Mission // Vastitas Borealis',
    lead: 'Rising from the spare hardware of canceled missions, a three-legged lander descended onto the northern arctic plains of Mars, scraped away a trench of dirt, and touched water ice for the very first time.',
    summary: 'Phoenix landed in the northern arctic plains of Vastitas Borealis in May 2008. Using a backhoe-style robotic arm, it scraped through topsoil to uncover pure water ice that sublimated in the sun. It analyzed arctic soil with wet-chemistry ovens, discovering perchlorate salts and observing snow falling from clouds in the polar sky.',
    highlightQuote: 'We have touched the water ice of Mars, and we have seen snow fall through its atmosphere.',
    quoteAuthor: 'Peter Smith, Phoenix Principal Investigator',
    verifiedStatus: 'Mission Completed (Crushed by Polar Ice Winter)',
    restingLocation: 'Green Valley, Vastitas Borealis, Mars (68.22°N, 234.25°E)',
    chapters: {
      origin: {
        title: 'I. Rising from the Ashes of Defeat',
        subtitle: 'Reusing the Mars 2001 Surveyor Lander',
        content: 'Following the 1999 loss of the Mars Polar Lander, NASA mothballed its twin spacecraft, the Mars 2001 Surveyor lander, in cleanroom storage. In 2003, Dr. Peter Smith of the University of Arizona proposed reviving the mothballed hardware under the Mars Scout program. The mission was named Phoenix, after the mythical bird that rises rejuvenated from its own ashes. Its target was the high-latitude arctic desert of Vastitas Borealis, where orbital data from Mars Odyssey had detected immense underground reservoirs of hydrogen, indicating buried water ice.'
      },
      journey: {
        title: 'II. A Rocket-Powered Descent to the Arctic',
        subtitle: 'Pulsed Hydrazine Thrusters in Green Valley',
        content: 'Phoenix launched on an air-augmented Delta II rocket on August 4, 2007. On May 25, 2008, it bypassed airbags in favor of a classic, radar-guided pulsed-hydrazine thruster descent. Skimming through the thin northern atmosphere, its terminal thrusters cushioned touchdown in "Green Valley"—a flat, polygon-patterned permafrost terrain formed by freeze-thaw thermal contraction, resembling the permafrost tundra of northern Canada.'
      },
      keyMoments: {
        title: 'III. Digging into the Dodo-Goldilocks Trench',
        subtitle: 'The Ice That Vanished Before Human Eyes',
        content: 'Phoenix deployed a 2.3-meter articulated robotic arm equipped with a backhoe scoop and a motorized rasp. The arm began trenching into the soil, naming excavations after storybook characters like "Dodo-Goldilocks" and "Snow White." On Sol 20, the scoop scraped away two inches of dirt to expose bright white patches at the trench bottom. Four days later, panoramic camera photographs revealed the white crumbs had completely disappeared: they had sublimated directly into vapor when exposed to sunlight, confirming they were pure water ice rather than salt.'
      },
      discoveries: {
        title: 'IV. Perchlorate Chemistry and Snow in the Sky',
        subtitle: 'The TEGA Ovens and LiDAR Weather Observations',
        content: 'Phoenix scooped ice-rich regolith into its Thermal and Evolved-Gas Analyzer (TEGA) ovens, baking the samples to 1,000°C. Mass spectrometers detected water vapor and carbon dioxide. Its wet-chemistry laboratory discovered magnesium perchlorate salts—a compound that lowers the freezing point of water and acts as a potent chemical oxidant. The Canadian laser LiDAR detected cirrus ice clouds drifting across the midnight sun, photographing snowfall falling through the sky that vaporized before reaching the ground.'
      },
      legacy: {
        title: 'V. The Crushing Onset of the Polar Winter',
        subtitle: 'Encased in Frozen Carbon Dioxide',
        content: 'Because it was stationed at 68 degrees north latitude, Phoenix faced a seasonal death sentence. As autumn arrived in late 2008, the sun dipped lower, and daily solar energy dwindled. On November 2, 2008, Phoenix transmitted its final signal. During the brutal polar winter, a thick sheet of solid carbon dioxide ice (dry ice) blanketed the plain, crushing its solar arrays under hundreds of pounds of frozen gas. Orbital images in 2010 confirmed the collapse of its panels. Phoenix remains frozen in the arctic tundra—the mission that tasted water on Mars.'
      }
    }
  },

  // --------------------------------------------------------------------------
  // 23. VOYAGER 1
  // --------------------------------------------------------------------------
  'voyager-1': {
    artifactId: 'voyager-1',
    title: 'The Interstellar Emissary',
    subtitle: 'Voyager Interstellar Mission // Interstellar Space',
    lead: 'Carrying a golden phonograph record of Earth’s sounds and culture, humanity’s farthest traveler has crossed beyond the protective magnetic bubble of our Sun into the cold ocean between the stars.',
    summary: 'Launched in September 1977, Voyager 1 conducted breathtaking flybys of Jupiter and Saturn, discovering active sulfur volcanoes on Io and the complex nitrogen atmosphere of Titan. In August 2012, it became the first human-made object to cross the heliopause into interstellar space, currently transmitting data from over 24 billion kilometers away.',
    highlightQuote: 'Look again at that dot. That’s here. That’s home. That’s us.',
    quoteAuthor: 'Carl Sagan, reflecting on the Pale Blue Dot photograph',
    verifiedStatus: 'Actively Transmitting from Interstellar Space (Distance > 165 AU)',
    restingLocation: 'Interstellar Space (Constellation Ophiuchus)',
    chapters: {
      origin: {
        title: 'I. The Rare Alignment of the Giants',
        subtitle: 'A Planetary Opportunity Once Every 175 Years',
        content: 'In 1965, JPL trajectory specialist Gary Flandro discovered that in the late 1970s, the four outer gas giants—Jupiter, Saturn, Uranus, and Neptune—would align along a rare orbital configuration that occurs only once every 175 years. This alignment allowed a single spacecraft to slingshot from one planet to the next using gravitational assists, shortening a thirty-year voyage to just twelve. NASA developed the twin Voyager spacecraft: 720-kilogram robotic flagships equipped with 3.7-meter high-gain parabolic antennas, radioisotope thermoelectric generators (RTGs) fueled by plutonium-238, and magnetic tape recorders.'
      },
      journey: {
        title: 'II. Jupiter and Saturn Transformed',
        subtitle: 'Volcanoes on Io and Titan’s Enshrouded World',
        content: 'Voyager 1 launched on September 5, 1977. Arriving at Jupiter in March 1979, it discovered active sulfur volcanism on the moon Io—the first active extraterrestrial volcanoes ever witnessed—and revealed faint rings encircling Jupiter. In November 1980, it swept past Saturn, photographing complex braided structures in the rings and skimming close to giant moon Titan. Titan’s thick nitrogen smog blocked optical views, but the gravity assist hurled Voyager 1 northward out of the ecliptic plane at 17 kilometers per second, bound for deep space.'
      },
      keyMoments: {
        title: 'III. The Pale Blue Dot',
        subtitle: 'Turning the Camera Back Toward Home',
        content: 'On February 14, 1990, as Voyager 1 cruised six billion kilometers from Earth, engineers commanded the spacecraft to execute its final photographic sequence: turning its cameras backward to capture a "Family Portrait" of the solar system. In a frame captured through a scattered sunbeam, Earth appeared as a tiny, fragile speck of light occupying less than a single pixel. Carl Sagan famously christened it the "Pale Blue Dot"—a humbling reminder of humanity’s shared existence on a mote of dust suspended in a sunbeam.'
      },
      discoveries: {
        title: 'IV. Crossing the Heliopause',
        subtitle: 'The First Footstep Beyond the Sun',
        content: 'On August 25, 2012, at a distance of 121 Astronomical Units (18 billion kilometers), Voyager 1’s instruments recorded an abrupt drop in charged particles originating from the solar wind and a simultaneous 100-fold spike in galactic cosmic rays. Voyager 1 had breached the heliopause—the boundary where the solar wind is turned back by the interstellar medium. It had entered interstellar space: the cold, unshielded expanse between stars dominated by the exploded debris of ancient supernovae.'
      },
      legacy: {
        title: 'V. The Golden Record and the Silent Void',
        subtitle: 'A Message Traveling for Billions of Years',
        content: 'Bolted to Voyager 1’s side is a 12-inch gold-plated copper phonograph record containing 115 images, natural sounds, greetings in 55 languages, and 90 minutes of music from Bach to Chuck Berry. Now over 24 billion kilometers from Earth, light signals take more than 23 hours to travel one-way. Although its RTG power will dwindle to zero before 2030, silencing its instruments, Voyager 1 will drift silently through the Milky Way for billions of years, outlasting the continents of Earth as an immortal ambassador of humanity.'
      }
    }
  },

  // --------------------------------------------------------------------------
  // 24. VOYAGER 2
  // --------------------------------------------------------------------------
  'voyager-2': {
    artifactId: 'voyager-2',
    title: 'The Grand Tour of Four Giants',
    subtitle: 'Voyager Interstellar Mission // Interstellar Space',
    lead: 'The only spacecraft in history to visit Jupiter, Saturn, Uranus, and Neptune, this solitary explorer unveiled the outer solar system before crossing into interstellar space.',
    summary: 'Launched in August 1977, Voyager 2 completed the historic "Grand Tour" of the outer planets, flying past Jupiter (1979), Saturn (1981), Uranus (1986), and Neptune (1989). It discovered geysers on Triton, the tilted magnetic field of Uranus, and Neptune’s Great Dark Spot, before crossing into interstellar space in November 2018.',
    highlightQuote: 'Voyager 2 gave humanity its first, and still only, close-up look at the ice giants Uranus and Neptune.',
    quoteAuthor: 'Ed Stone, Voyager Project Scientist for 50 Years',
    verifiedStatus: 'Actively Transmitting from Interstellar Space (Distance > 138 AU)',
    restingLocation: 'Interstellar Space (Constellation Pavo)',
    chapters: {
      origin: {
        title: 'I. The Grand Tour Preserved',
        subtitle: 'Launching First on a Slower, Broader Arc',
        content: 'Although designated Voyager 2, this spacecraft launched sixteen days before Voyager 1 on August 20, 1977. Its trajectory was intentionally calculated along a slower, broader arc that preserved the option to continue beyond Saturn to Uranus and Neptune if the spacecraft remained healthy. Powered by three radioisotope thermoelectric generators, it carried high-resolution cameras, plasma wave spectrometers, and magnetometers mounted on a ten-meter fiberglass boom.'
      },
      journey: {
        title: 'II. Through Jupiter and Saturn',
        subtitle: 'Braided Rings and Oceanic Moons',
        content: 'Voyager 2 arrived at Jupiter in July 1979, four months after its twin, photographing fractured ice crusts on Europa that suggested a vast liquid water ocean beneath. At Saturn in August 1981, its photopolarimeter observed ring particles down to meter-scale precision. Using Saturn’s immense gravitational field as a slingshot, flight directors hurled Voyager 2 onto an unchartered five-year transit toward Uranus, deep in the frozen outer perimeter of the solar system.'
      },
      keyMoments: {
        title: 'III. The Blue Jewel of Uranus and Miranda’s Cliffs',
        subtitle: 'January 1986: Unlocking the Tilted Planet',
        content: 'On January 24, 1986, Voyager 2 made humanity’s first and only close encounter with Uranus. It discovered ten new moons and two new rings, revealing that Uranus rotates on its side with an 98-degree axial tilt and possesses a corkscrewed magnetic field tilted 60 degrees from its rotational axis. Skimming within 29,000 kilometers of the tiny moon Miranda, Voyager 2 photographed Verona Rupes—a sheer vertical cliff twenty kilometers high, the tallest sheer drop known in the solar system.'
      },
      discoveries: {
        title: 'IV. Neptune’s Winds and the Geysers of Triton',
        subtitle: 'August 1989: The Edge of the Planetary Realm',
        content: 'In August 1989, Voyager 2 reached Neptune, skimmed 4,950 kilometers above its north pole, and photographed the dynamic "Great Dark Spot"—a hurricane the size of Earth driven by 2,000-km/h winds. Flying past Neptune’s frozen moon Triton, it discovered active nitrogen ice geysers erupting eight kilometers into the atmosphere, proving that cryovolcanism could thrive at -235°C in the most remote depths of the solar system.'
      },
      legacy: {
        title: 'V. Crossing into the Cosmic Ocean',
        subtitle: 'A Second Traveler Leaves the Heliopause',
        content: 'On November 5, 2018, at 119 AU from Earth, Voyager 2 crossed the heliopause into interstellar space. Because its plasma spectrometer remained operational (unlike Voyager 1’s, which failed in 1980), Voyager 2 provided the first direct, in-situ measurements of interstellar plasma density and magnetic fields. Carrying its own copy of the Golden Record, Voyager 2 continues outward at 15 kilometers per second—a monumental testament to human engineering that explored four worlds in a single voyage.'
      }
    }
  },

  // --------------------------------------------------------------------------
  // 25. PIONEER 10
  // --------------------------------------------------------------------------
  'pioneer-10': {
    artifactId: 'pioneer-10',
    title: 'The Pathbreaker Through the Asteroid Belt',
    subtitle: 'Pioneer Deep Space Program // Outer Solar System',
    lead: 'Before Pioneer 10, no spacecraft had dared to traverse the asteroid belt or endure Jupiter’s lethal radiation belts. It forged the highway into deep space and carried humanity’s first pictorial message into the cosmos.',
    summary: 'Launched in March 1972, Pioneer 10 was the first spacecraft to navigate through the Asteroid Belt, the first to fly past Jupiter (1973), and the first to cross the orbit of Neptune. Carrying the iconic gold-anodized aluminum plaque designed by Carl Sagan, it opened the outer solar system before fading into silence in 2003.',
    highlightQuote: 'It was the brave little scout that tested whether anything could survive past Mars.',
    quoteAuthor: 'NASA Ames Research Center Pioneer Team',
    verifiedStatus: 'Mission Concluded (Silent, Drifting Toward Aldebaran at ~67 AU)',
    restingLocation: 'Deep Space (Trajectory toward Constellation Taurus / Aldebaran)',
    chapters: {
      origin: {
        title: 'I. The Mission into the Unknown',
        subtitle: 'Daring to Cross the Asteroid Belt',
        content: 'In the late 1960s, space scientists feared that the Asteroid Belt between Mars and Jupiter was an impenetrable barrier of high-velocity dust and boulders that would obliterate any spacecraft attempting to cross it. NASA Ames Research Center designed Pioneer 10 as a spartan, spin-stabilized probe weighing just 258 kilograms, powered by four SNAP-19 radioisotope thermoelectric generators. Its primary goal was to act as a scout: test the asteroid belt, investigate Jupiter’s magnetic environment, and pave the way for the complex Voyager missions.'
      },
      journey: {
        title: 'II. Piercing the Asteroid Belt and Jupiter’s Radiation',
        subtitle: 'Survival in the Most Hostile Environment',
        content: 'Pioneer 10 launched on March 3, 1972, atop an Atlas-Centaur, becoming the fastest human-made object at launch up to that time. In July 1972, it entered the Asteroid Belt, emerging seven months later completely unscathed, proving that space in the belt was predominantly empty. On December 4, 1973, Pioneer 10 flew within 132,000 kilometers of Jupiter’s cloud tops, surviving radiation belts ten thousand times stronger than Earth’s Van Allen belts, which saturated instruments and triggered false commands.'
      },
      keyMoments: {
        title: 'III. The Pioneer Plaque',
        subtitle: 'Humanity’s First Calling Card to the Stars',
        content: 'Bolted to Pioneer 10’s antenna support struts was a 6-by-9-inch gold-anodized aluminum plaque conceived by Carl Sagan and Frank Drake, with artwork by Linda Salzman Sagan. The plaque featured diagrams of the neutral hydrogen hyperfine transition as a universal clock and yardstick, the location of our Sun relative to 14 pulsars, a map of the solar system, and engraved silhouettes of a human man and woman raising a hand in greeting. It was humanity’s first deliberate cosmic calling card.'
      },
      discoveries: {
        title: 'IV. Discovering Jupiter’s Giant Magnetosphere',
        subtitle: 'A Magnetic Tail Extending to Saturn',
        content: 'Pioneer 10 mapped Jupiter’s colossal magnetosphere, discovering that its magnetic field was inverted compared to Earth’s and that its magnetotail stretched hundreds of millions of kilometers, past the orbit of Saturn. It took 300 close-up images of Jupiter’s turbulent bands and Great Red Spot, determined that Jupiter was primarily a fluid planet composed of hydrogen and helium, and discovered that the planet radiates more internal heat than it receives from the Sun.'
      },
      legacy: {
        title: 'V. The Final Faint Whisper',
        subtitle: 'Cruising Toward the Red Giant Aldebaran',
        content: 'In June 1983, Pioneer 10 crossed the orbit of Neptune, then the outermost known planet. NASA officially retired the mission in March 1997, but continued periodic tracking. On January 23, 2003, at a distance of 12.2 billion kilometers (82 AU), the Deep Space Network antenna in Madrid captured a faint, dying carrier signal—Pioneer 10’s final whisper to Earth. Silent and intact, Pioneer 10 is drifting through the constellation Taurus toward the red giant star Aldebaran, where it will arrive in two million years.'
      }
    }
  },

  // --------------------------------------------------------------------------
  // 26. PIONEER 11
  // --------------------------------------------------------------------------
  'pioneer-11': {
    artifactId: 'pioneer-11',
    title: 'The Pathfinder to the Rings of Saturn',
    subtitle: 'Pioneer Deep Space Program // Outer Solar System',
    lead: 'Using a high-risk polar trajectory past Jupiter to catapult itself across the solar system, Pioneer 11 became the first spacecraft to reach Saturn, skimming mere miles above its glistening rings.',
    summary: 'Launched in April 1973, Pioneer 11 executed a close polar flyby of Jupiter in 1974, using the giant’s gravity to fling itself across the solar system toward Saturn. In September 1979, it made the first historic flyby of Saturn, discovering its F-ring and confirming safe passage for the upcoming Voyager missions.',
    highlightQuote: 'Pioneer 11 dared to dive beneath the rings of Saturn to make sure Voyager would survive.',
    quoteAuthor: 'NASA Ames Pioneer Operations Log',
    verifiedStatus: 'Mission Concluded (Silent, Drifting Toward Aquila at ~44 AU)',
    restingLocation: 'Deep Space (Trajectory toward Constellation Aquila)',
    chapters: {
      origin: {
        title: 'I. The Slingshot Backup',
        subtitle: 'Rethinking a Mission in Mid-Flight',
        content: 'Pioneer 11 was built as an identical backup to Pioneer 10. Launched on April 6, 1973, its initial mission plan was simply to duplicate Pioneer 10’s Jupiter flyby in case its sister probe failed in the Asteroid Belt. But when Pioneer 10 proved that the Asteroid Belt was safe, trajectory designers at NASA Ames conceived a daring redirect: use Jupiter’s colossal gravity field to execute a high-speed orbital plane change, flinging Pioneer 11 entirely across the solar system to intercept Saturn.'
      },
      journey: {
        title: 'II. Diving Over Jupiter’s Poles',
        subtitle: 'A Slingshot Three Times Closer Than Pioneer 10',
        content: 'On December 2, 1974, Pioneer 11 dove within 42,828 kilometers of Jupiter’s cloud tops—three times closer than Pioneer 10. Flying in against the planet’s direction of rotation at a blistering 171,000 km/h, it skimmed over the heavily irradiated polar regions, capturing the first photographs of Jupiter’s swirling polar vortexes before being catapulted upward out of the ecliptic plane toward its rendezvous with the ringed planet.'
      },
      keyMoments: {
        title: 'III. Draping Beneath the Rings of Saturn',
        subtitle: 'September 1, 1979: The Ultimate Gamble',
        content: 'Approaching Saturn in August 1979, flight directors faced a critical dilemma. Should Pioneer 11 fly outside the rings, or should it dive directly through the ring plane to test if invisible ring debris would destroy the spacecraft? NASA chose the risky dive, using Pioneer 11 as a sacrificial scout to protect the multi-billion-dollar Voyager 1 and 2 probes following behind. On September 1, 1979, Pioneer 11 plunged through the ring plane at 114,000 km/h, emerging completely unscathed on the other side.'
      },
      discoveries: {
        title: 'IV. Discovering the F-Ring and Titan’s Frozen Atmosphere',
        subtitle: 'Mapping Saturn’s Magnetic Shield',
        content: 'During its close encounter, Pioneer 11 discovered Saturn’s narrow, outermost "F-ring" and the tiny shepherd moon Epimetheus. It measured Saturn’s magnetic field, discovering it was nearly perfectly aligned with its rotational axis, unlike Jupiter’s or Earth’s. It measured the temperature of giant moon Titan, showing that its surface was a frigid -180°C beneath an impenetrable nitrogen blanket, ruling out warm surface oceans.'
      },
      legacy: {
        title: 'V. The Fading Power of SNAP-19',
        subtitle: 'A Silent Ambassador to Aquila',
        content: 'Carrying its own gold Pioneer Plaque, Pioneer 11 continued outbound in the direction of the constellation Aquila. By September 1995, its aging SNAP-19 plutonium generators could no longer supply enough electrical power to operate a single scientific instrument or point its high-gain antenna at Earth. NASA ceased tracking on September 30, 1995. Now silent, Pioneer 11 will cruise through the interstellar dark for four million years before passing near a star in Aquila.'
      }
    }
  },

  // --------------------------------------------------------------------------
  // 27. NEW HORIZONS
  // --------------------------------------------------------------------------
  'new-horizons': {
    artifactId: 'new-horizons',
    title: 'The Reconnaissance of Pluto and the Kuiper Belt',
    subtitle: 'New Frontiers Program // Kuiper Belt & Interstellar Bound',
    lead: 'Launched on humanity’s fastest rocket directly toward the edge of the solar system, a piano-sized probe unveiled Pluto as a geologically active world of towering water-ice mountains and nitrogen glaciers.',
    summary: 'New Horizons blasted off at 58,536 km/h in January 2006 on the fastest launch in history. In July 2015, it executed the first close reconnaissance of Pluto and Charon, revealing smooth nitrogen glaciers in Sputnik Planitia and ice mountains. In 2019, it conducted the farthest flyby in history, exploring the contact binary Arrokoth.',
    highlightQuote: 'We have completed the initial reconnaissance of the classical solar system. Pluto is alive with geology.',
    quoteAuthor: 'Alan Stern, New Horizons Principal Investigator',
    verifiedStatus: 'Actively Exploring (Cruising through the Kuiper Belt at > 58 AU)',
    restingLocation: 'Kuiper Belt (Trajectory toward Constellation Sagittarius)',
    chapters: {
      origin: {
        title: 'I. The Last Unexplored Frontier',
        subtitle: 'A Decadal Fight for the Ninth Planet',
        content: 'For decades, Pluto remained a fuzzy pixel in the lenses of the Hubble Space Telescope. While every other classical planet had been surveyed by Mariner, Viking, or Voyager, Pluto—the gateway to the vast, icy Kuiper Belt—remained untouched. Planetary scientist Alan Stern led a relentless 16-year campaign to fund and build New Horizons under NASA’s New Frontiers program. Built by the Johns Hopkins Applied Physics Laboratory (APL), the 478-kilogram probe was designed as a compact, ultra-reliable flyby craft carrying a suite of seven scientific instruments, including the high-resolution LORRI camera and Ralph spectrometer.'
      },
      journey: {
        title: 'II. The Fastest Launch in History',
        subtitle: 'Reaching the Moon in Nine Hours',
        content: 'New Horizons launched atop an Atlas V 551 rocket reinforced with five solid strap-on boosters on January 19, 2006. Burning its Centaur upper stage and a Star-48B third stage, it left Earth at 58,536 km/h—the fastest launch speed ever imparted to a human-made vehicle, crossing the orbit of the Moon just nine hours after liftoff (compared to three days for Apollo). In February 2007, it executed a gravitational slingshot past Jupiter, shaving three years off its nine-year transit to Pluto and capturing spectacular views of volcanic plumes on Io.'
      },
      keyMoments: {
        title: 'III. July 14, 2015: The Heart of Pluto',
        subtitle: 'Twelve Thousand Kilometers Above Tombaugh Regio',
        content: 'On July 14, 2015, New Horizons flew within 12,500 kilometers of Pluto’s surface. Instead of a dead, cratered ball of ice, cameras revealed a geologically young, dazzling world dominated by "Tombaugh Regio"—a colossal, heart-shaped glacier of solid nitrogen and carbon monoxide ice. The western lobe, Sputnik Planitia, was completely devoid of impact craters, displaying convection cells where warm nitrogen ice bubbles up from below like a slow-motion lava lamp, replenishing the surface within millions of years.'
      },
      discoveries: {
        title: 'IV. Water-Ice Mountains and the Red Pole of Charon',
        subtitle: 'Methane Dunes and an Active Cryosphere',
        content: 'New Horizons photographed towering mountain ranges of bedrock water ice rising 3,500 meters into a blue, layered haze atmosphere, proving water ice behaves like granite in Pluto’s -230°C cold. It discovered methane ice dunes, dynamic glacier flows, and evidence of a deep subsurface liquid water ocean insulated by gas hydrates. Flying past Pluto’s giant moon Charon, it revealed "Mordor Macula"—a dark red polar cap composed of tholins captured from Pluto’s escaping atmosphere and processed by solar ultraviolet light.'
      },
      legacy: {
        title: 'V. The Flyby of Arrokoth and the Interstellar Frontier',
        subtitle: 'Exploring the Primordial Building Blocks',
        content: 'On January 1, 2019, New Horizons executed the most distant planetary flyby in human history, flying past 486958 Arrokoth—a 36-kilometer-long contact binary Kuiper Belt object resembling two flattened reddish pancakes fused together, preserving the pristine building blocks from which planets accreted 4.5 billion years ago. Powered by its radioisotope thermoelectric generator, New Horizons is currently over 58 AU from Earth, mapping Kuiper Belt dust and the outer heliosphere as it follows the Voyagers into interstellar space.'
      }
    }
  },

  // --------------------------------------------------------------------------
  // 28. CASSINI-HUYGENS
  // --------------------------------------------------------------------------
  'cassini': {
    artifactId: 'cassini',
    title: 'The Master of the Rings and Ocean Worlds',
    subtitle: 'Cassini-Huygens Mission // Saturn System',
    lead: 'For thirteen glorious years, a bus-sized flagship orbited Saturn, landing a robotic probe on the hydrocarbon shores of Titan and discovering global liquid oceans and erupting geysers on tiny Enceladus.',
    summary: 'A joint NASA/ESA/ASI mission, Cassini orbited Saturn from 2004 to 2017. It delivered ESA’s Huygens probe onto the surface of Titan, discovered geysers of saltwater erupting from Enceladus’s subsurface ocean, and ended in September 2017 with the "Grand Finale"—twenty-two daring dives between the rings before plunging into Saturn’s atmosphere.',
    highlightQuote: 'To the makers of this formidable machine, to the scientists who coaxed its wonders: thank you for thirteen years of pure discovery.',
    quoteAuthor: 'Earl Maize, Cassini Project Manager, at Loss of Signal',
    verifiedStatus: 'Mission Concluded (Intentional Atmospheric Entry, September 15, 2017)',
    restingLocation: 'Upper Atmosphere of Saturn (Vaporized / Dispersed into the Gas Giant)',
    chapters: {
      origin: {
        title: 'I. An International Masterpiece',
        subtitle: 'NASA, ESA, and ASI Unite for Saturn',
        content: 'Cassini-Huygens was the grandest planetary flagship of the modern era: a 5.7-ton spacecraft built through a partnership between NASA, the European Space Agency (ESA), and the Italian Space Agency (ASI). Powered by three radioisotope thermoelectric generators, Cassini carried 12 sophisticated instruments, while ESA built the Huygens probe—a 318-kilogram robotic capsule with a heat shield and parachutes designed to execute humanity’s first landing in the outer solar system on Saturn’s giant moon Titan.'
      },
      journey: {
        title: 'II. Seven Years Across the Void',
        subtitle: 'Gravity Assists from Venus, Earth, and Jupiter',
        content: 'Launched atop a Titan IVB rocket on October 15, 1997, Cassini executed four gravity-assist flybys (two past Venus, one past Earth, and one past Jupiter) to build orbital velocity. On July 1, 2004, Cassini fired its main engine to decelerate into Saturn’s orbit, diving through a gap between the F and G rings. In December 2004, Cassini released Huygens on a ballistic trajectory toward Titan. On January 14, 2005, Huygens descended through Titan’s opaque nitrogen-methane smog under orange parachutes, landing on a soft floodplain strewn with rounded water-ice pebbles and streaming methane rivers.'
      },
      keyMoments: {
        title: 'III. The Geysers of Enceladus',
        subtitle: 'A Global Ocean Spraying into Space',
        content: 'In 2005, Cassini flew past the tiny, 500-kilometer ice moon Enceladus and witnessed an astonishing sight: towering plumes of water vapor, ice crystals, and organic molecules erupting from prominent thermal fractures nicknamed "tiger stripes" near its south pole. Cassini dove directly through the geyser plumes at 30,000 km/h, sniffing the spray with its mass spectrometer. It found saltwater, simple organics, methane, and molecular hydrogen—evidence of active alkaline hydrothermal vents on an extraterrestrial ocean floor, making Enceladus a primary candidate for extraterrestrial life.'
      },
      discoveries: {
        title: 'IV. Hydrocarbon Seas and Hexagonal Storms',
        subtitle: 'Thirteen Years of Astonishing Science',
        content: 'Cassini mapped Saturn’s north polar hexagon—a jet stream storm wider than two Earths spinning with geometric precision. Using synthetic aperture radar, it pierced Titan’s haze to discover vast lakes and seas of liquid methane and ethane (Kraken Mare, Ligeia Mare), documenting an alien hydrologic cycle where liquid methane evaporates, forms clouds, rains down, and carves river deltas into frozen water-ice bedrock. It watched Saturn’s rings sprout propellers, spoke-like electrostatic structures, and gravitational waves sculpted by embedded moonlets.'
      },
      legacy: {
        title: 'V. The Grand Finale and the Final Plunge',
        subtitle: 'September 15, 2017: A Sacrifice to Protect Alien Oceans',
        content: 'By 2017, Cassini was running dangerously low on attitude-control propellant. If abandoned in orbit, it could eventually collide with Enceladus or Titan, potentially contaminating their pristine subsurface oceans with resilient Earth bacteria. NASA chose a spectacular, honorable conclusion: the "Grand Finale." Cassini executed 22 daring dives through the unexplored, 2,000-kilometer gap between Saturn’s upper atmosphere and its innermost rings. On September 15, 2017, Cassini plunged into Saturn’s atmosphere at 120,000 km/h, firing its thrusters to the last second to keep its antenna pointed at Earth, vaporizing in the golden sky like a shooting star.'
      }
    }
  }
};

/**
 * Normalizes an artifact ID or alias to ensure clean retrieval
 */
export function getMissionStory(id: string): MissionStory | undefined {
  if (!id) return undefined;
  const cleanId = id.toLowerCase().trim();

  // Direct match
  if (MISSION_STORIES[cleanId]) {
    return MISSION_STORIES[cleanId];
  }

  // Common aliases
  const aliasMap: Record<string, string> = {
    'eagle': 'eagle-descent-stage',
    'apollo-11': 'eagle-descent-stage',
    'apollo-12': 'apollo-12-descent',
    'apollo-14': 'apollo-14-descent',
    'apollo-15': 'apollo-15-descent',
    'apollo-16': 'apollo-16-descent',
    'apollo-17': 'apollo-17-descent',
    'change-3': 'change-3-lander',
    'change-4': 'change-4-lander',
    'lunar-retroreflector': 'lunar-retroreflectors',
    'retroreflectors': 'lunar-retroreflectors',
    'pathfinder-sojourner': 'pathfinder',
    'sojourner': 'pathfinder',
    'mer-a': 'spirit',
    'mer-b': 'opportunity',
    'msl': 'curiosity',
    'mars-2020': 'perseverance',
  };

  const mapped = aliasMap[cleanId];
  if (mapped && MISSION_STORIES[mapped]) {
    return MISSION_STORIES[mapped];
  }

  return undefined;
}
