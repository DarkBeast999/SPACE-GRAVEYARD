export interface SubLocation {
  name: string;
  locationName: string;
  lat: number;
  lon: number;
}

export interface LandingSite3D {
  id: string;
  name: string;
  designation: string;
  body: 'mars' | 'moon' | 'venus' | 'deep-space' | 'saturn';
  locationName: string;
  lat: number;
  lon: number;
  year: number;
  status: string;
  description: string;
  fascinatingFact: string;
  hasPanorama?: boolean;
  panoramaTitle?: string;
  distanceFromEarth?: string;
  approximateAu?: number; // Numeric AU distance for programmatic 3D scene placement
  lightDelaySeconds?: number; // for deep space
  isMultiLocation?: boolean;
  subLocations?: SubLocation[];
  sharedWith?: string;
  isSchematic?: boolean;
  elevationKm?: number;
  trajectoryAngle?: number;
  trajectoryDistance?: number;
  trajectoryColor?: number;
  trajectoryHeading?: string;
  referenceEpoch?: string;
}

export interface MarsLandmark {
  id: string;
  name: string;
  type: 'volcano' | 'canyon' | 'basin' | 'crater' | 'plain';
  lat: number;
  lon: number;
  elevationKm: number;
  description: string;
  funFact: string;
}

export const MARS_LANDMARKS: MarsLandmark[] = [
  {
    id: 'olympus-mons',
    name: 'Olympus Mons',
    type: 'volcano',
    lat: 18.65,
    lon: 226.2, // -133.8°W
    elevationKm: 21.9,
    description: 'The largest planetary volcano in the Solar System. Rising 21.9 km above the Martian datum, it is two and a half times the height of Mount Everest and as wide as France.',
    funFact: 'Its gentle slope (only 2 to 5 degrees) is so broad that an observer standing on its rim would not realize they are on a mountain—its slope disappears beyond the planetary horizon!'
  },
  {
    id: 'valles-marineris',
    name: 'Valles Marineris',
    type: 'canyon',
    lat: -13.9,
    lon: 300.8, // -59.2°W
    elevationKm: -7.0,
    description: 'The "Grand Canyon of Mars". Spanning over 4,000 km across the Martian equator and cutting up to 7 km deep, it would stretch from New York to San Francisco on Earth.',
    funFact: 'Formed as a colossal tectonic rift fracture when the nearby Tharsis volcanic bulge swelled billions of years ago, cracking open the planetary crust.'
  },
  {
    id: 'hellas-planitia',
    name: 'Hellas Planitia',
    type: 'basin',
    lat: -42.4,
    lon: 70.5,
    elevationKm: -7.15,
    description: 'An immense circular impact crater basin 2,300 km in diameter formed during the Late Heavy Bombardment. It is one of the deepest depressions in the entire Solar System.',
    funFact: 'The atmospheric pressure at the basin floor is 89% higher than at the Martian datum, occasionally allowing liquid water to remain thermodynamically stable at midday.'
  },
  {
    id: 'tharsis-montes',
    name: 'Tharsis Montes',
    type: 'volcano',
    lat: 2.8,
    lon: 247.2, // -112.8°W
    elevationKm: 15.0,
    description: 'A colossal volcanic plateau hosting three gigantic shield volcanoes: Ascraeus Mons (18 km), Pavonis Mons (14 km), and Arsia Mons (16 km), aligned along a northeast fracture.',
    funFact: 'The Tharsis bulge contains so much volcanic mass that its formation tilted the entire outer spin axis of Mars by 20 to 25 degrees billions of years ago.'
  },
  {
    id: 'gale-crater',
    name: 'Gale Crater (Mount Sharp)',
    type: 'crater',
    lat: -5.37,
    lon: 137.44,
    elevationKm: -4.5,
    description: 'A 154 km impact basin containing Aeolis Mons (Mount Sharp), a 5.5-km-tall mountain of stratified sedimentary layers chronicling Mars’s climatic transition from wet to dry.',
    funFact: 'Landing site of the Curiosity rover, which confirmed ancient freshwater lakebeds with clay minerals, organic carbon, and habitable conditions.'
  },
  {
    id: 'jezero-crater',
    name: 'Jezero Crater (River Delta)',
    type: 'crater',
    lat: 18.38,
    lon: 77.58,
    elevationKm: -2.5,
    description: 'An ancient 45 km paleolake basin fed by a prominent river channel and fan delta system billions of years ago. Landing site of Perseverance and Ingenuity.',
    funFact: 'Perseverance is currently drilling cores into Jezero’s river delta mudstones to seal in titanium sample tubes for future return to Earth.'
  },
  {
    id: 'gusev-crater',
    name: 'Gusev Crater (Columbia Hills)',
    type: 'crater',
    lat: -14.57,
    lon: 175.48,
    elevationKm: -1.9,
    description: 'A 166 km crater formed 3.7 billion years ago, breached by the ancient Ma’adim Vallis river channel. Landing site of the Spirit rover.',
    funFact: 'Spirit discovered pure 90% opaline silica deposits churned up by its disabled right-front wheel—hallmark evidence of ancient volcanic fumaroles or hot springs.'
  },
  {
    id: 'meridiani-planum',
    name: 'Meridiani Planum',
    type: 'plain',
    lat: 0.2,
    lon: 357.5, // -2.5°W
    elevationKm: -1.4,
    description: 'A vast, exceptionally flat plain situated at Mars’s prime meridian, characterized by widespread gray crystalline hematite ("blueberries"). Landing site of Opportunity.',
    funFact: 'Opportunity explored here for nearly 15 years and drove 45.16 km, confirming that acidic groundwater once repeatedly flooded and evaporated across these plains.'
  }
];

export const LANDING_SITES_3D: LandingSite3D[] = [
  // =========================================================================
  // --- MARS EXPLORERS (10 Artifacts Covered) ---
  // =========================================================================
  {
    id: 'opportunity',
    name: 'Opportunity Rover (MER-B)',
    designation: 'NASA / JPL Mars Exploration Rover',
    body: 'mars',
    locationName: 'Meridiani Planum (Perseverance Valley)',
    lat: -1.95,
    lon: 354.47, // 5.53°W
    elevationKm: -1.4,
    year: 2004,
    status: 'Mission Completed (Resting on Surface)',
    description: 'Designed to operate for 90 Martian days, Opportunity explored the red planet for nearly 15 years, confirming that liquid water once bathed the Martian surface.',
    fascinatingFact: 'Drove a marathon distance of 45.16 km (28.06 miles)—the longest off-world drive by any human-made machine in history.',
    hasPanorama: true,
    panoramaTitle: 'Perseverance Valley Sol 5000 Panorama (NASA PIA22222)'
  },
  {
    id: 'spirit',
    name: 'Spirit Rover (MER-A)',
    designation: 'NASA / JPL Mars Exploration Rover',
    body: 'mars',
    locationName: 'Gusev Crater (Columbia Hills)',
    lat: -14.571,
    lon: 175.479,
    elevationKm: -1.9,
    year: 2004,
    status: 'Mission Completed (Silent on Surface)',
    description: 'Twin sister of Opportunity, Spirit overcame a broken right-front wheel by driving backward, inadvertently churning up soil that revealed pure silica formed by ancient hot springs.',
    fascinatingFact: 'Its stuck wheel acted as a scientific trench tool, leading to one of the most significant discoveries of hydrothermal environments on Mars.',
    hasPanorama: false
  },
  {
    id: 'curiosity',
    name: 'Curiosity Rover (MSL)',
    designation: 'NASA Mars Science Laboratory',
    body: 'mars',
    locationName: 'Gale Crater (Mount Sharp)',
    lat: -4.589,
    lon: 137.441,
    elevationKm: -4.5,
    year: 2012,
    status: 'Still Operating (Active Explorer)',
    description: 'A nuclear-powered rolling laboratory exploring the sedimentary layers of Mount Sharp to uncover how the Martian climate shifted from warm and wet to cold and desolate.',
    fascinatingFact: 'Has discovered ancient organic carbon molecules and sulfur compounds preserved inside 3.5-billion-year-old lakebed mudstones.',
    hasPanorama: false
  },
  {
    id: 'perseverance',
    name: 'Perseverance Rover',
    designation: 'NASA Mars 2020 Mission',
    body: 'mars',
    locationName: 'Jezero Crater (River Delta)',
    lat: 18.444,
    lon: 77.451,
    elevationKm: -2.5,
    year: 2021,
    status: 'Still Operating (Sample Collection)',
    description: 'Searching for biosignatures of ancient microscopic life in the dried delta of Jezero Crater, accompanied by Ingenuity, collecting core samples for future return to Earth.',
    fascinatingFact: 'Carries MOXIE, which successfully produced breathable oxygen directly from Mars’s carbon-dioxide atmosphere, and 43 titanium sample tubes.',
    hasPanorama: false
  },
  {
    id: 'ingenuity',
    name: 'Ingenuity Helicopter',
    designation: 'NASA Mars Helicopter (Attached to Perseverance)',
    body: 'mars',
    locationName: 'Jezero Crater (Nerio Airfield / Flight 72 Site)',
    lat: 18.444,
    lon: 77.451,
    elevationKm: -2.5,
    year: 2021,
    status: 'Mission Concluded (Resting in Jezero)',
    sharedWith: 'perseverance',
    description: 'The first aircraft to achieve powered aerodynamic flight on another world. Deployed from the belly of Perseverance in Jezero Crater, proving flight is viable in 1% atmosphere.',
    fascinatingFact: 'Planned for 5 technology-demonstration flights over 30 days, it completed 72 flights across 17 km over 3 years before rotor tip damage ended operations.',
    hasPanorama: false
  },
  {
    id: 'viking-1',
    name: 'Viking 1 Lander',
    designation: 'NASA Viking Program',
    body: 'mars',
    locationName: 'Chryse Planitia',
    lat: 22.27,
    lon: -47.97, // 312.03°E
    elevationKm: -1.5,
    year: 1976,
    status: 'Mission Completed (Historical Landmark)',
    description: 'The first American spacecraft to safely land on Mars and operate successfully, beaming back the very first colour photographs ever taken on the Martian surface.',
    fascinatingFact: 'Operated uninterrupted for over 6 years (2,245 sols) until an inadvertent ground software update severed radio communication in November 1982.',
    hasPanorama: false
  },
  {
    id: 'viking-2',
    name: 'Viking 2 Lander',
    designation: 'NASA Viking Program',
    body: 'mars',
    locationName: 'Utopia Planitia',
    lat: 47.97,
    lon: -134.26, // 225.74°E
    elevationKm: -3.8,
    year: 1976,
    status: 'Mission Completed',
    description: 'Landed thousands of kilometers north of Viking 1 in a rock-strewn plain, measuring Martian quakes and atmosphere with its robotic arm sampler.',
    fascinatingFact: 'Recorded a winter temperature of -120°C as dry-ice frost formed directly on the red rocks around the lander.',
    hasPanorama: false
  },
  {
    id: 'pathfinder',
    name: 'Mars Pathfinder & Sojourner',
    designation: 'NASA Discovery Program',
    body: 'mars',
    locationName: 'Ares Vallis (Floodplain)',
    lat: 19.33,
    lon: -33.56, // 326.44°E
    elevationKm: -1.6,
    year: 1997,
    status: 'Mission Completed',
    description: 'Delivered Sojourner, humanity’s very first micro-rover on Mars, using an innovative airbag landing system that bounced safely across the catastrophic ancient outflow channel.',
    fascinatingFact: 'Sojourner was only the size of a microwave oven (11.5 kg) and communicated via radio relays directly through the Pathfinder base station.',
    hasPanorama: false
  },
  {
    id: 'phoenix',
    name: 'Phoenix Mars Lander',
    designation: 'NASA Scout Mission',
    body: 'mars',
    locationName: 'Green Valley (Vastitas Borealis)',
    lat: 68.22,
    lon: -125.74, // 234.26°E
    elevationKm: -4.1,
    year: 2008,
    status: 'Mission Completed (Frozen in Polar Ice)',
    description: 'Dug into the icy arctic plains of northern Mars, directly scraping and tasting subsurface water ice that sublimated into vapor before its cameras.',
    fascinatingFact: 'Confirmed the presence of perchlorate salts in Martian soil and observed snow falling from high clouds into the lower atmosphere.',
    hasPanorama: false
  },
  {
    id: 'insight',
    name: 'InSight Lander',
    designation: 'NASA Discovery Mission',
    body: 'mars',
    locationName: 'Elysium Planitia',
    lat: 4.502,
    lon: 135.623,
    elevationKm: -2.6,
    year: 2018,
    status: 'Mission Completed (Resting Silent)',
    description: 'Placed an ultra-sensitive dome seismometer on Mars to record interior tremors, detecting more than 1,300 Marsquakes and meteorite impacts.',
    fascinatingFact: 'Revealed that Mars has a molten metallic core and mapped the thickness of the Martian crust for the first time.',
    hasPanorama: false
  },

  // =========================================================================
  // --- MOON EXPLORERS (12 Artifacts Covered) ---
  // =========================================================================
  {
    id: 'eagle-descent-stage',
    name: 'Apollo 11 Eagle Descent Stage',
    designation: 'NASA Apollo Lunar Module LM-5',
    body: 'moon',
    locationName: 'Mare Tranquillitatis (Tranquility Base)',
    lat: 0.674,
    lon: 23.473,
    year: 1969,
    status: 'Permanent Historical Monument',
    description: 'The golden lower stage of the lunar module that carried Neil Armstrong and Buzz Aldrin to the lunar surface during humanity’s first crewed landing.',
    fascinatingFact: 'Bears a stainless steel plaque signed by the three astronauts and President Nixon: "Here men from the planet Earth first set foot upon the Moon, July 1969 A.D. We came in peace for all mankind."',
    hasPanorama: false
  },
  {
    id: 'surveyor-3',
    name: 'Surveyor 3',
    designation: 'NASA Robotic Lunar Lander',
    body: 'moon',
    locationName: 'Oceanus Procellarum (Surveyor Crater)',
    lat: -2.994,
    lon: -23.34,
    year: 1967,
    status: 'Examined by Human Astronauts',
    description: 'The only robotic spacecraft on another celestial body visited by human beings. In November 1969, Apollo 12 astronauts landed 180 meters away and retrieved its television camera for return to Earth.',
    fascinatingFact: 'Analysis of its retrieved camera back on Earth tested how long human bacterial spores can survive the vacuum and solar radiation of the lunar surface.',
    hasPanorama: true,
    panoramaTitle: 'Surveyor Crater Lunar Panorama (Apollo 12 AS12-48-7133)'
  },
  {
    id: 'apollo-12-descent',
    name: 'Apollo 12 Intrepid Descent Stage',
    designation: 'NASA Apollo Lunar Module LM-6',
    body: 'moon',
    locationName: 'Oceanus Procellarum (Surveyor Crater Rim)',
    lat: -3.012,
    lon: -23.42,
    year: 1969,
    status: 'Permanent Historical Monument',
    description: 'Landed within walking distance (183 meters) of the robotic Surveyor 3 lander, demonstrating precision pinpoint landing capability on another celestial body.',
    fascinatingFact: 'Astronauts Pete Conrad and Alan Bean dismantled Surveyor 3’s television camera and returned it to Earth to analyze how materials withstand the lunar environment.',
    hasPanorama: false
  },
  {
    id: 'lunokhod-1',
    name: 'Lunokhod 1',
    designation: 'Soviet Luna 17 Mission',
    body: 'moon',
    locationName: 'Mare Imbrium (Sea of Rains)',
    lat: 38.28,
    lon: -35.0,
    year: 1970,
    status: 'Silent Rover (Laser Target Active)',
    description: 'The world’s first successful planetary rover. Controlled remotely from Earth using a joystick by a crew in Crimea, it drove over 10.5 km across the lunar regolith.',
    fascinatingFact: 'Equipped with a corner-cube retroreflector that still reflects laser pulses from Earth observatories today to measure the exact distance to the Moon!',
    hasPanorama: false
  },
  {
    id: 'apollo-14-descent',
    name: 'Apollo 14 Antares Descent Stage',
    designation: 'NASA Apollo Lunar Module LM-8',
    body: 'moon',
    locationName: 'Fra Mauro Formation',
    lat: -3.645,
    lon: -17.471,
    year: 1971,
    status: 'Permanent Historical Monument',
    description: 'Carried Alan Shepard and Edgar Mitchell to the ancient highlands of Fra Mauro. Shepard famously struck two golf balls near the lander using an improvised six-iron.',
    fascinatingFact: 'Collected 42 kg of ancient impact breccias formed by the gigantic cataclysm that excavated the Mare Imbrium basin 3.85 billion years ago.',
    hasPanorama: false
  },
  {
    id: 'apollo-15-descent',
    name: 'Apollo 15 Falcon Descent Stage',
    designation: 'NASA Apollo Lunar Module LM-10',
    body: 'moon',
    locationName: 'Hadley Rille / Apennine Mountains',
    lat: 26.132,
    lon: 3.634,
    year: 1971,
    status: 'Permanent Historical Monument',
    description: 'First extended stay mission utilizing the Lunar Roving Vehicle. Commander Dave Scott dropped a geological hammer and a falcon feather simultaneously to verify Galileo’s gravity law in vacuum.',
    fascinatingFact: 'Astronauts discovered the famous "Genesis Rock" (anorthosite crystal), a 4.5-billion-year-old remnant of the Moon’s primordial magma ocean.',
    hasPanorama: false
  },
  {
    id: 'apollo-16-descent',
    name: 'Apollo 16 Orion Descent Stage',
    designation: 'NASA Apollo Lunar Module LM-11',
    body: 'moon',
    locationName: 'Descartes Highlands',
    lat: -8.973,
    lon: 15.498,
    year: 1972,
    status: 'Permanent Historical Monument',
    description: 'The only crewed landing in the central lunar highlands. Astronauts John Young and Charlie Duke drove 26.7 km exploring North Ray and South Ray craters.',
    fascinatingFact: 'Disproved the reigning theory that the lunar highlands were volcanic; rock analysis revealed they were formed by intense meteorite impact bombardment.',
    hasPanorama: false
  },
  {
    id: 'apollo-17-descent',
    name: 'Apollo 17 Challenger Descent Stage',
    designation: 'NASA Apollo Lunar Module LM-12',
    body: 'moon',
    locationName: 'Taurus-Littrow Valley',
    lat: 20.19,
    lon: 30.772,
    year: 1972,
    status: 'Permanent Historical Monument',
    description: 'The final crewed lunar module to touch down on the Moon. Astronauts Gene Cernan and geologist Harrison Schmitt spent 75 hours exploring the deep lunar valley.',
    fascinatingFact: 'Schmitt discovered famous "orange soil" consisting of volcanic glass beads erupted during explosive fire-fountain volcanoes on the ancient Moon 3.6 billion years ago.',
    hasPanorama: false
  },
  {
    id: 'lunokhod-2',
    name: 'Lunokhod 2',
    designation: 'Soviet Luna 21 Mission',
    body: 'moon',
    locationName: 'Le Monnier Crater (Mare Serenitatis Rim)',
    lat: 25.85,
    lon: 30.45,
    year: 1973,
    status: 'Silent Rover (Distance Record Holder for 40 Years)',
    description: 'Traversed 39.15 km across Le Monnier Crater and its deep rilles, surveying magnetic fields and mare-highland boundary rocks. Held the off-world driving record until 2014.',
    fascinatingFact: 'Carried a French corner-cube laser retroreflector array that still reflects ruby laser beams from Earth observatories with millimeter precision.',
    hasPanorama: false
  },
  {
    id: 'change-3-lander',
    name: "Chang'e 3 & Yutu (Jade Rabbit)",
    designation: 'CNSA Lunar Exploration Program',
    body: 'moon',
    locationName: 'Mare Imbrium (Sinus Iridum)',
    lat: 44.12,
    lon: -19.51,
    year: 2013,
    status: 'Mission Completed',
    description: 'China’s first lunar lander and rover, marking the first soft landing on the Moon since Luna 24 in 1976. Operated an ultraviolet telescope directly from the lunar surface.',
    fascinatingFact: 'Its ground-penetrating radar probed the subsurface basalt layers of Mare Imbrium down to a depth of nearly 400 meters.',
    hasPanorama: false
  },
  {
    id: 'change-4-lander',
    name: "Chang'e 4 & Yutu-2",
    designation: 'CNSA Lunar Exploration Program',
    body: 'moon',
    locationName: 'Von Kármán Crater (Far Side)',
    lat: -45.456,
    lon: 177.588,
    year: 2019,
    status: 'Still Operating (Lunar Far Side)',
    description: 'The historic first mission ever to land on the far side of the Moon, which never faces Earth. Communicates through the Queqiao relay satellite parked beyond the Moon.',
    fascinatingFact: 'Carried a miniature lunar biosphere experiment that successfully sprouted cotton seeds inside a sealed canister on the lunar surface.',
    hasPanorama: false
  },
  {
    id: 'lunar-retroreflectors',
    name: 'Lunar Laser Retroreflectors',
    designation: 'Apollo 11, 14, 15 & Lunokhod 1, 2 Network',
    body: 'moon',
    locationName: 'Multi-Site Network (Tranquility, Fra Mauro, Hadley, Imbrium, Le Monnier)',
    lat: 0.674,
    lon: 23.473,
    year: 1969,
    status: 'Continuously Active Passive Optical Arrays',
    isMultiLocation: true,
    subLocations: [
      { name: 'Apollo 11 Reflector', locationName: 'Mare Tranquillitatis', lat: 0.674, lon: 23.473 },
      { name: 'Apollo 14 Reflector', locationName: 'Fra Mauro Formation', lat: -3.645, lon: -17.471 },
      { name: 'Apollo 15 Reflector', locationName: 'Hadley Rille (Largest Array)', lat: 26.132, lon: 3.634 },
      { name: 'Lunokhod 1 Reflector', locationName: 'Mare Imbrium', lat: 38.28, lon: -35.0 },
      { name: 'Lunokhod 2 Reflector', locationName: 'Le Monnier Crater', lat: 25.85, lon: 30.45 },
    ],
    description: 'A distributed network of corner-cube prism reflectors deployed across the lunar near side. Because they require zero electrical power, they are the only Apollo experiments that operate to this day.',
    fascinatingFact: 'Laser pulses fired from Earth observatories bounce back in ~2.5 seconds, proving the Moon recedes from Earth at 3.8 cm per year due to tidal deceleration.',
    hasPanorama: false
  },

  // =========================================================================
  // --- DEEP SPACE VOYAGERS (6 Artifacts Covered - Single Source of Truth) ---
  // =========================================================================
  // DEEP-SPACE / INTERSTELLAR CRAFT (Escaping Heliocentric Trajectories)
  // Single Source of Truth for trajectory geometry, colors, headings, and epochs
  // Note: Cassini is NOT an escaping spacecraft; it is in body: 'saturn' below.
  // =========================================================================
  {
    id: 'voyager-1',
    name: 'Voyager 1',
    designation: 'NASA Interstellar Mission',
    body: 'deep-space',
    locationName: 'Interstellar Space (Heliocentric > 167 AU, Ophiuchus)',
    lat: 0,
    lon: 0,
    year: 1977,
    status: 'Operating in Interstellar Space',
    isSchematic: true,
    description: 'Humanity’s most distant machine. Having completed grand flybys of Jupiter and Saturn, it crossed the heliopause in 2012, escaping the solar wind into the true interstellar ocean.',
    fascinatingFact: 'Travelling at over 61,000 km/h (38,000 mph). A radio command travelling at the speed of light takes more than 23 hours to reach it!',
    distanceFromEarth: '~24.9 billion km (166.7 AU)',
    approximateAu: 166.7,
    lightDelaySeconds: 83200, // ~23.1 hours
    trajectoryAngle: 0.65,
    trajectoryDistance: 170,
    trajectoryColor: 0x38bdf8,
    trajectoryHeading: 'Ophiuchus / Ecliptic North (~35°)',
    referenceEpoch: 'Approximate 2024 Reference Distance'
  },
  {
    id: 'voyager-2',
    name: 'Voyager 2',
    designation: 'NASA Interstellar Mission',
    body: 'deep-space',
    locationName: 'Interstellar Space (Heliocentric > 138 AU, Pavo)',
    lat: 0,
    lon: 0,
    year: 1977,
    status: 'Operating in Interstellar Space',
    isSchematic: true,
    description: 'The only spacecraft ever to visit all four gas giant worlds: Jupiter, Saturn, Uranus, and Neptune. Crossed into interstellar space in November 2018.',
    fascinatingFact: 'Discovered 16 new moons and the unexpected Great Dark Spot in Neptune’s methane atmosphere.',
    distanceFromEarth: '~20.7 billion km (138.4 AU)',
    approximateAu: 138.4,
    lightDelaySeconds: 69200, // ~19.2 hours
    trajectoryAngle: 2.45,
    trajectoryDistance: 142,
    trajectoryColor: 0x818cf8,
    trajectoryHeading: 'Pavo / Ecliptic South (-48°)',
    referenceEpoch: 'Approximate 2024 Reference Distance'
  },
  {
    id: 'pioneer-10',
    name: 'Pioneer 10',
    designation: 'NASA Ames Pioneer Program',
    body: 'deep-space',
    locationName: 'Outer Heliosphere (> 135 AU, heading toward Aldebaran / Taurus)',
    lat: 0,
    lon: 0,
    year: 1972,
    status: 'Silent Ghost (Mission Completed)',
    isSchematic: true,
    description: 'The first spacecraft to transit the asteroid belt and fly by Jupiter. Transmitted humanity\'s first close-up images of the Jovian atmosphere before cruising into the outer heliosphere.',
    fascinatingFact: 'Carried the famous gold-anodized aluminium plaque designed by Carl Sagan and Frank Drake, showing pictorial figures of humans and galactic coordinates of our Sun.',
    distanceFromEarth: '~20.2 billion km (135.2 AU)',
    approximateAu: 135.2,
    lightDelaySeconds: 67300, // ~18.7 hours
    trajectoryAngle: 3.85,
    trajectoryDistance: 138,
    trajectoryColor: 0xf59e0b,
    trajectoryHeading: 'Taurus / Toward Aldebaran',
    referenceEpoch: 'Approximate Reference Distance'
  },
  {
    id: 'pioneer-11',
    name: 'Pioneer 11',
    designation: 'NASA Ames Pioneer Program',
    body: 'deep-space',
    locationName: 'Outer Heliosphere (> 115 AU, heading toward Scutum)',
    lat: 0,
    lon: 0,
    year: 1973,
    status: 'Silent Ghost (Mission Completed)',
    isSchematic: true,
    description: 'Pioneered the gravitational slingshot trajectory past Jupiter to become humanity’s first spacecraft to explore Saturn, discovering its delicate F Ring and two icy moons.',
    fascinatingFact: 'Last transmission received September 30, 1995, at ~44 AU. It is cruising into deep interstellar space in the opposite direction of Pioneer 10.',
    distanceFromEarth: '~17.2 billion km (115 AU)',
    approximateAu: 115.0,
    lightDelaySeconds: 57400, // ~15.9 hours
    trajectoryAngle: 4.65,
    trajectoryDistance: 120,
    trajectoryColor: 0xef4444,
    trajectoryHeading: 'Scutum / Galactic Center direction',
    referenceEpoch: 'Approximate Reference Distance'
  },
  {
    id: 'new-horizons',
    name: 'New Horizons',
    designation: 'NASA New Frontiers Mission',
    body: 'deep-space',
    locationName: 'Kuiper Belt (> 59 AU, Sagittarius)',
    lat: 0,
    lon: 0,
    year: 2006,
    status: 'Operating in Kuiper Belt',
    isSchematic: true,
    description: 'Flew past Pluto in July 2015, capturing the breathtaking heart-shaped nitrogen ice glacier Tombaugh Regio, before conducting humanity’s most distant flyby of Arrokoth.',
    fascinatingFact: 'Carried some of the cremated ashes of Clyde Tombaugh, the American astronomer who discovered Pluto in 1930.',
    distanceFromEarth: '~8.9 billion km (59.6 AU)',
    approximateAu: 59.6,
    lightDelaySeconds: 29800, // ~8.3 hours
    trajectoryAngle: 5.10,
    trajectoryDistance: 95,
    trajectoryColor: 0x10b981,
    trajectoryHeading: 'Sagittarius / Kuiper Belt',
    referenceEpoch: 'Approximate Reference Distance'
  },
  // =========================================================================
  // SATURN HISTORICAL MISSIONS (Grand Finale Atmospheric Entry)
  // Cassini concluded its mission on September 15, 2017 inside Saturn.
  // It is NOT on an outward escaping trajectory.
  // =========================================================================
  {
    id: 'cassini',
    name: 'Cassini-Huygens',
    designation: 'NASA / ESA / ASI Saturn Flagship Mission',
    body: 'saturn',
    locationName: 'Saturn Upper Atmosphere (Grand Finale Atmospheric Entry — Sept 15, 2017)',
    lat: 0,
    lon: 0,
    year: 1997,
    status: 'Historical Mission Event (Concluded September 15, 2017)',
    isSchematic: true,
    description: 'Orbited Saturn for 13 years, discovering liquid methane seas on Titan and geysers of salty water jetting into space from Enceladus. Unlike interstellar voyagers, its mission concluded on September 15, 2017, with a deliberate, historic plunge into Saturn’s atmosphere.',
    fascinatingFact: 'In September 2017, deliberately plunged into Saturn’s crushing upper atmosphere to protect potentially habitable ocean moons (Enceladus and Titan) from Earth microbes.',
    distanceFromEarth: '~1.5 billion km (~10 AU historical reference distance at Saturn)',
    lightDelaySeconds: 5000, // ~83 minutes historical one-way light time
    referenceEpoch: 'Historical Reference Epoch: September 15, 2017 (Grand Finale)'
  }
];

/**
 * Central Resolution Engine:
 * Predictably maps ANY artifact ID from Explore, Timeline, or URL query parameters
 * to its exact 3D landing site representation, parent planet mode, and multi-location metadata.
 */
export function resolve3DArtifact(artifactId: string): {
  site: LandingSite3D;
  targetMode: 'MARS' | 'MOON' | 'DEEP_SPACE' | 'SATURN';
  isMultiLocation?: boolean;
  sharedLocation?: boolean;
} | null {
  if (!artifactId) return null;
  const normalizedId = artifactId.toLowerCase().trim();

  const site = LANDING_SITES_3D.find((s) => s.id === normalizedId);
  if (!site) return null;

  let targetMode: 'MARS' | 'MOON' | 'DEEP_SPACE' | 'SATURN' = 'MARS';
  if (site.body === 'moon') targetMode = 'MOON';
  else if (site.body === 'deep-space') targetMode = 'DEEP_SPACE';
  else if (site.body === 'saturn') targetMode = 'SATURN';

  return {
    site,
    targetMode,
    isMultiLocation: Boolean(site.isMultiLocation),
    sharedLocation: Boolean(site.sharedWith),
  };
}
