export interface LandingSite3D {
  id: string;
  name: string;
  designation: string;
  body: 'mars' | 'moon' | 'venus' | 'deep-space';
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
  lightDelaySeconds?: number; // for deep space
}

export const LANDING_SITES_3D: LandingSite3D[] = [
  // --- MARS EXPLORERS ---
  {
    id: 'opportunity',
    name: 'Opportunity Rover (MER-B)',
    designation: 'NASA / JPL Mars Exploration Rover',
    body: 'mars',
    locationName: 'Meridiani Planum (Perseverance Valley)',
    lat: -1.95,
    lon: 354.47,
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
    year: 2012,
    status: 'Still Operating (Active Explorer)',
    description: 'A nuclear-powered rolling laboratory exploring the layers of Mount Sharp to uncover how the Martian climate shifted from warm and wet to cold and desolate.',
    fascinatingFact: 'Has discovered ancient organic carbon molecules and sulfur compounds preserved inside 3.5-billion-year-old lakebed mudstones.',
    hasPanorama: false
  },
  {
    id: 'perseverance',
    name: 'Perseverance Rover & Ingenuity',
    designation: 'NASA Mars 2020 Mission',
    body: 'mars',
    locationName: 'Jezero Crater Delta',
    lat: 18.444,
    lon: 77.451,
    year: 2021,
    status: 'Still Operating (Sample Collection)',
    description: 'Searching for signs of ancient microscopic life in the dried delta of Jezero Crater, accompanied by Ingenuity, the first aircraft to achieve powered flight on another planet.',
    fascinatingFact: 'Ingenuity was planned for 5 test flights; it completed 72 flights across Martian skies before its rotor tips were damaged during landing sol 1045.',
    hasPanorama: false
  },
  {
    id: 'viking-1',
    name: 'Viking 1 Lander',
    designation: 'NASA Viking Program',
    body: 'mars',
    locationName: 'Chryse Planitia',
    lat: 22.27,
    lon: -47.97,
    year: 1976,
    status: 'Mission Completed (Historical Landmark)',
    description: 'The first American spacecraft to safely land on Mars and operate successfully, beaming back the very first colour photographs ever taken on the Martian surface.',
    fascinatingFact: 'Operated uninterrupted for over 6 years (2,245 sols) until an inadvertent software command accidentally severed radio communication in November 1982.',
    hasPanorama: false
  },
  {
    id: 'viking-2',
    name: 'Viking 2 Lander',
    designation: 'NASA Viking Program',
    body: 'mars',
    locationName: 'Utopia Planitia',
    lat: 47.97,
    lon: -134.26,
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
    locationName: 'Ares Vallis',
    lat: 19.33,
    lon: -33.56,
    year: 1997,
    status: 'Mission Completed',
    description: 'Delivered Sojourner, humanity’s very first micro-rover on Mars, using an innovative airbag landing system that bounced safely across the floodplain.',
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
    lon: -125.74,
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
    year: 2018,
    status: 'Mission Completed (Resting Silent)',
    description: 'Placed an ultra-sensitive dome seismometer on Mars to record interior tremors, detecting more than 1,300 Marsquakes and meteorite impacts.',
    fascinatingFact: 'Revealed that Mars has a molten metallic core and mapped the thickness of the Martian crust for the first time.',
    hasPanorama: false
  },

  // --- MOON EXPLORERS ---
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

  // --- DEEP SPACE VOYAGERS ---
  {
    id: 'voyager-1',
    name: 'Voyager 1',
    designation: 'NASA Interstellar Mission',
    body: 'deep-space',
    locationName: 'Interstellar Space (Heliocentric > 167 AU)',
    lat: 0,
    lon: 0,
    year: 1977,
    status: 'Still Operating in Interstellar Space',
    description: 'Humanity’s most distant machine. Having completed grand flybys of Jupiter and Saturn, it crossed the heliopause in 2012, escaping the solar wind into the true interstellar ocean.',
    fascinatingFact: 'Travelling at over 61,000 km/h (38,000 mph). A radio command travelling at the speed of light takes more than 23 hours to reach it!',
    distanceFromEarth: '~24.9 billion km (166.7 AU)',
    lightDelaySeconds: 83200 // ~23.1 hours
  },
  {
    id: 'voyager-2',
    name: 'Voyager 2',
    designation: 'NASA Interstellar Mission',
    body: 'deep-space',
    locationName: 'Interstellar Space (Heliocentric > 138 AU)',
    lat: 0,
    lon: 0,
    year: 1977,
    status: 'Still Operating in Interstellar Space',
    description: 'The only spacecraft ever to visit all four gas giant worlds: Jupiter, Saturn, Uranus, and Neptune. Crossed into interstellar space in November 2018.',
    fascinatingFact: 'Discovered 16 new moons and the unexpected Great Dark Spot in Neptune’s methane atmosphere.',
    distanceFromEarth: '~20.7 billion km (138.4 AU)',
    lightDelaySeconds: 69200 // ~19.2 hours
  },
  {
    id: 'new-horizons',
    name: 'New Horizons',
    designation: 'NASA New Frontiers Mission',
    body: 'deep-space',
    locationName: 'Kuiper Belt (> 59 AU)',
    lat: 0,
    lon: 0,
    year: 2006,
    status: 'Still Operating in Kuiper Belt',
    description: 'Flew past Pluto in July 2015, capturing the breathtaking heart-shaped nitrogen ice glacier Tombaugh Regio, before conducting humanity’s most distant flyby of Arrokoth.',
    fascinatingFact: 'Carried some of the cremated ashes of Clyde Tombaugh, the American astronomer who discovered Pluto in 1930.',
    distanceFromEarth: '~8.9 billion km (59.6 AU)',
    lightDelaySeconds: 29800 // ~8.3 hours
  },
  {
    id: 'pioneer-10',
    name: 'Pioneer 10',
    designation: 'NASA Ames Pioneer Program',
    body: 'deep-space',
    locationName: 'Outer Heliosphere (> 135 AU, heading toward Aldebaran)',
    lat: 0,
    lon: 0,
    year: 1972,
    status: 'Silent Ghost (Mission Completed)',
    description: 'The first spacecraft to transit the asteroid belt and fly by Jupiter. Transmitted humanity\'s first close-up images of the Jovian atmosphere before cruising into the outer heliosphere.',
    fascinatingFact: 'Carried the famous gold-anodized aluminium plaque designed by Carl Sagan and Frank Drake, showing pictorial figures of humans and galactic coordinates of our Sun.',
    distanceFromEarth: '~20.2 billion km (135 AU)',
    lightDelaySeconds: 67300 // ~18.7 hours
  },
  {
    id: 'cassini',
    name: 'Cassini-Huygens',
    designation: 'NASA / ESA / ASI Saturn Mission',
    body: 'deep-space',
    locationName: 'Saturn Atmosphere (Grand Finale Impact)',
    lat: 0,
    lon: 0,
    year: 1997,
    status: 'Vaporized into Saturn Atmosphere (Grand Finale 2017)',
    description: 'Orbited Saturn for 13 years, discovering liquid methane seas on Titan and geysers of salty water jetting into space from Enceladus. Unlike interstellar voyagers, its journey concluded inside Saturn itself.',
    fascinatingFact: 'In September 2017, deliberately plunged into Saturn’s crushing upper atmosphere to protect potentially habitable ocean moons (Enceladus and Titan) from Earth microbes.',
    distanceFromEarth: '~1.5 billion km (~10 AU at Saturn)',
    lightDelaySeconds: 5000 // ~83 minutes
  }
];
