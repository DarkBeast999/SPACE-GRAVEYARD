import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  createSunTexture,
  createMercuryTexture,
  createVenusTexture,
  createEarthTexture,
  createMoonTexture,
  createMarsVikingTexture,
  createJupiterTexture,
  createSaturnTexture,
  createSaturnRingTexture,
} from '../utils/planetTextures';
import {
  LANDING_SITES_3D,
  LandingSite3D,
  MARS_LANDMARKS,
  MarsLandmark,
  resolve3DArtifact,
} from '../data/landingSites3D';
import { getMissionStory } from '../data/missionStories';

import {
  createMonumentSymbol,
  updateMonumentSelection,
  MonumentIcon,
  getMonumentTypeLabel,
  getMonumentType,
  getLabelSpriteTexture,
} from '../utils/monumentSymbols';

import { playSignalPing, playWhooshSound } from '../utils/audio';
import { normalizeLongitude } from '../utils/coordinateUtils';

export const CRAFT_CHARACTERS: Record<string, string> = {
  'voyager-1': 'First to Interstellar Space · 162+ AU',
  'voyager-2': 'Grand Tour Pioneer · Visited 4 Gas Giants',
  'pioneer-10': 'First Through Asteroid Belt · Jupiter Flyby',
  'pioneer-11': 'Saturn Rings Pioneer · Radiation Survey',
  'new-horizons': 'Pluto & Kuiper Belt Edge Scout',
  'perseverance': 'Astrobiology Rover & Core Sample Cacher',
  'curiosity': 'Nuclear Geologist · 4,000+ Sols in Gale Crater',
  'ingenuity': 'First Powered Aerial Flight on Mars (72 Sols)',
  'opportunity': 'Marathon Rover · Found Ancient Water Minerals',
  'spirit': 'Columbia Hills Climber & Hydrothermal Pioneer',
  'sojourner': 'First Wheeled Rover on Mars (Ares Vallis)',
  'viking-1': 'First Long-Duration Mars Station (6+ Years)',
  'viking-2': 'Utopia Planitia Surface Station & Frost Vistas',
  'phoenix': 'Polar Arctic Scout · Sampled Water Ice',
  'insight': 'Geophysics Station · Detected 1,300+ Marsquakes',
  'zhurong': 'Subsurface Radar Explorer · Utopia Planitia',
  'apollo-11': 'Sea of Tranquility First Crewed Lunar Landing',
  'apollo-12': 'Ocean of Storms Precision Surveyor 3 Recovery',
  'apollo-14': 'Fra Mauro Ancient Cone Crater Imbrium Survey',
  'apollo-15': 'Hadley Rille Canyon & First Lunar Rover (LRV)',
  'apollo-16': 'Descartes Highlands Ancient Breccia Survey',
  'apollo-17': 'Taurus-Littrow Final Crewed Mission & Orange Soil',
  'lunar-retroreflectors': 'Ongoing Earth-Moon Millimeter Laser Arrays',
  'lunokhod-1': 'First Remote-Controlled Rover (10+ km Traversed)',
  'lunokhod-2': 'Le Monnier Long-Distance Crater Explorer (39 km)',
  'change-4': 'First Landing on the Lunar Far Side (Von Kármán)',
  'yutu-2': 'Far-Side Robotic Rover · Ancient Mantle Radar',
  'cassini': 'Lord of the Rings & Ocean Moons Grand Finale',
};

/**
 * Calculates 3D scene coordinates for escaping deep-space craft based on genuine
 * astronomical AU distance and documented galactic escape headings.
 */
export function getDeepSpaceCraftPosition(dc: LandingSite3D): THREE.Vector3 {
  const au = dc.approximateAu || 100;
  const auScale = 0.6; // 1 AU = 0.6 units in Deep Space schematic scene
  const dist = au * auScale;

  let decDeg = 0; // Declination from ecliptic
  let azRad = dc.trajectoryAngle ?? 0.7; // Ecliptic azimuth

  if (dc.id === 'voyager-1') {
    decDeg = 35; // Ophiuchus / north of ecliptic
    azRad = 0.65;
  } else if (dc.id === 'voyager-2') {
    decDeg = -48; // Pavo / south of ecliptic
    azRad = 2.45;
  } else if (dc.id === 'pioneer-10') {
    decDeg = 3; // Taurus / Aldebaran direction
    azRad = 3.85;
  } else if (dc.id === 'pioneer-11') {
    decDeg = 14; // Scutum / Galactic Center
    azRad = 4.65;
  } else if (dc.id === 'new-horizons') {
    decDeg = -2; // Sagittarius / Kuiper Belt
    azRad = 5.10;
  }

  const decRad = (decDeg * Math.PI) / 180;
  const rEcliptic = dist * Math.cos(decRad);
  const x = rEcliptic * Math.cos(azRad);
  const y = dist * Math.sin(decRad);
  const z = rEcliptic * Math.sin(azRad);

  return new THREE.Vector3(x, y, z);
}

export type ViewMode =
  | 'SOLAR_SYSTEM'
  | 'MERCURY'
  | 'VENUS'
  | 'EARTH'
  | 'MOON'
  | 'MARS'
  | 'JUPITER'
  | 'SATURN'
  | 'DEEP_SPACE';

interface DestinationConfig {
  mode: ViewMode;
  param: string;
  label: string;
  shortLabel: string;
}

const DESTINATIONS: DestinationConfig[] = [
  { mode: 'SOLAR_SYSTEM', param: 'solar-system', label: '☀️ SOLAR SYSTEM', shortLabel: '☀️ SYSTEM' },
  { mode: 'MERCURY', param: 'mercury', label: '🪨 MERCURY', shortLabel: '🪨 MERCURY' },
  { mode: 'VENUS', param: 'venus', label: '🟡 VENUS', shortLabel: '🟡 VENUS' },
  { mode: 'EARTH', param: 'earth', label: '🌍 EARTH', shortLabel: '🌍 EARTH' },
  { mode: 'MOON', param: 'moon', label: '🌕 MOON', shortLabel: '🌕 MOON' },
  { mode: 'MARS', param: 'mars', label: '🔴 MARS', shortLabel: '🔴 MARS' },
  { mode: 'JUPITER', param: 'jupiter', label: '🪐 JUPITER', shortLabel: '🪐 JUPITER' },
  { mode: 'SATURN', param: 'saturn', label: '🪐 SATURN', shortLabel: '🪐 SATURN' },
  { mode: 'DEEP_SPACE', param: 'deep-space', label: '🌌 DEEP SPACE', shortLabel: '🌌 DEEP' },
];

function parsePlanetParam(p: string | null): ViewMode {
  if (!p) return 'SOLAR_SYSTEM';
  switch (p.toLowerCase()) {
    case 'mercury': return 'MERCURY';
    case 'venus': return 'VENUS';
    case 'earth': return 'EARTH';
    case 'moon': return 'MOON';
    case 'mars': return 'MARS';
    case 'jupiter': return 'JUPITER';
    case 'saturn': return 'SATURN';
    case 'deep-space':
    case 'deepspace': return 'DEEP_SPACE';
    default: return 'SOLAR_SYSTEM';
  }
}

interface CameraTransition {
  startTime: number;
  duration: number;
  startPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  startTarget: THREE.Vector3;
  targetTarget: THREE.Vector3;
  onComplete?: () => void;
}

// Pure spherical coordinate conversion utility
const latLonToVector3 = (lat: number, lon: number, radius = 12.1): THREE.Vector3 => {
  const normLon = normalizeLongitude(lon);
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (normLon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
};

export const Universe3DPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const mountRef = useRef<HTMLDivElement>(null);

  const [webglError, setWebglError] = useState<string | null>(null);
  const [isContextLost, setIsContextLost] = useState(false);

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return parsePlanetParam(searchParams.get('planet'));
  });

  const [selectedSite, setSelectedSite] = useState<LandingSite3D | null>(() => {
    const targetId = searchParams.get('target');
    if (targetId) {
      const res = resolve3DArtifact(targetId);
      return res ? res.site : null;
    }
    return null;
  });

  const selectedSiteRef = useRef<LandingSite3D | null>(selectedSite);
  selectedSiteRef.current = selectedSite;

  const [selectedLandmark, setSelectedLandmark] = useState<MarsLandmark | null>(null);
  const [showLandmarks, setShowLandmarks] = useState(true);

  // Search & Navigation controls state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isLegendOpen, setIsLegendOpen] = useState(false);

  const [hoveredObject, setHoveredObject] = useState<string | null>(null);

  // Three.js internal refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const transitionRef = useRef<CameraTransition | null>(null);
  const isInteractingRef = useRef(false);
  const isContextLostRef = useRef(false);
  const prevTargetRef = useRef<string | null>(searchParams.get('target'));

  // Mars mesh and texture refs
  const marsGlobeMeshRef = useRef<THREE.Mesh | null>(null);
  const marsVikingTexRef = useRef<THREE.Texture | null>(null);
  const marsLandmarksGroupRef = useRef<THREE.Group | null>(null);

  // Globe groups
  const solarSystemGroupRef = useRef<THREE.Group | null>(null);
  const mercuryGlobeGroupRef = useRef<THREE.Group | null>(null);
  const venusGlobeGroupRef = useRef<THREE.Group | null>(null);
  const earthGlobeGroupRef = useRef<THREE.Group | null>(null);
  const moonGlobeGroupRef = useRef<THREE.Group | null>(null);
  const marsGlobeGroupRef = useRef<THREE.Group | null>(null);
  const jupiterGlobeGroupRef = useRef<THREE.Group | null>(null);
  const saturnGlobeGroupRef = useRef<THREE.Group | null>(null);
  const deepSpaceGroupRef = useRef<THREE.Group | null>(null);

  // Rotating meshes list
  const rotatingMeshesRef = useRef<THREE.Mesh[]>([]);

  // Smooth camera glide utility
  const glideCamera = useCallback(
    (
      targetPos: THREE.Vector3,
      targetLookAt: THREE.Vector3,
      duration = 1200,
      onComplete?: () => void
    ) => {
      if (!cameraRef.current || !controlsRef.current) return;
      const camera = cameraRef.current;
      const controls = controlsRef.current;

      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) {
        camera.position.copy(targetPos);
        controls.target.copy(targetLookAt);
        controls.update();
        if (onComplete) onComplete();
        return;
      }

      controls.enabled = false;
      transitionRef.current = {
        startTime: performance.now(),
        duration,
        startPos: camera.position.clone(),
        targetPos: targetPos.clone(),
        startTarget: controls.target.clone(),
        targetTarget: targetLookAt.clone(),
        onComplete: () => {
          if (controlsRef.current) {
            controlsRef.current.enabled = true;
          }
          if (onComplete) onComplete();
        },
      };
    },
    []
  );

  // Helper to focus camera on a landing site pin or landmark
  const focusLandingSite = useCallback(
    (lat: number, lon: number, smooth = true, distance = 28) => {
      const sitePos = latLonToVector3(lat, lon, 12.1);
      const normal = sitePos.clone().normalize();
      const targetCameraPos = normal.clone().multiplyScalar(distance);
      const targetLookAt = sitePos.clone().multiplyScalar(0.2);

      if (smooth) {
        glideCamera(targetCameraPos, targetLookAt, 1200);
      } else if (cameraRef.current && controlsRef.current) {
        cameraRef.current.position.copy(targetCameraPos);
        controlsRef.current.target.copy(targetLookAt);
        controlsRef.current.update();
      }
    },
    [glideCamera]
  );

  // Handle switching view mode (visibility + camera target)
  const applyViewMode = useCallback(
    (mode: ViewMode, focusSiteId?: string | null) => {
      if (!cameraRef.current || !controlsRef.current) return;
      const controls = controlsRef.current;

      setHoveredObject(null);

      // Hide all groups first
      const groups = [
        solarSystemGroupRef.current,
        mercuryGlobeGroupRef.current,
        venusGlobeGroupRef.current,
        earthGlobeGroupRef.current,
        moonGlobeGroupRef.current,
        marsGlobeGroupRef.current,
        jupiterGlobeGroupRef.current,
        saturnGlobeGroupRef.current,
        deepSpaceGroupRef.current,
      ];
      groups.forEach((g) => {
        if (g) g.visible = false;
      });

      // Target positions for each mode
      let targetPos = new THREE.Vector3(0, 85, 170);
      let targetLookAt = new THREE.Vector3(0, 0, 0);
      let minDist = 25;
      let maxDist = 600;

      switch (mode) {
        case 'SOLAR_SYSTEM':
          if (solarSystemGroupRef.current) solarSystemGroupRef.current.visible = true;
          targetPos.set(0, 85, 170);
          minDist = 25;
          maxDist = 600;
          break;

        case 'MERCURY':
          if (mercuryGlobeGroupRef.current) mercuryGlobeGroupRef.current.visible = true;
          targetPos.set(0, 6, 28);
          minDist = 14;
          maxDist = 60;
          break;

        case 'VENUS':
          if (venusGlobeGroupRef.current) venusGlobeGroupRef.current.visible = true;
          targetPos.set(0, 8, 30);
          minDist = 14;
          maxDist = 65;
          break;

        case 'EARTH':
          if (earthGlobeGroupRef.current) earthGlobeGroupRef.current.visible = true;
          targetPos.set(0, 8, 32);
          minDist = 14;
          maxDist = 65;
          break;

        case 'MOON':
          if (moonGlobeGroupRef.current) moonGlobeGroupRef.current.visible = true;
          targetPos.set(0, 8, 30);
          minDist = 14;
          maxDist = 65;
          break;

        case 'MARS':
          if (marsGlobeGroupRef.current) marsGlobeGroupRef.current.visible = true;
          targetPos.set(0, 8, 30);
          minDist = 14;
          maxDist = 65;
          break;

        case 'JUPITER':
          if (jupiterGlobeGroupRef.current) jupiterGlobeGroupRef.current.visible = true;
          targetPos.set(0, 10, 36);
          minDist = 16;
          maxDist = 80;
          break;

        case 'SATURN':
          if (saturnGlobeGroupRef.current) saturnGlobeGroupRef.current.visible = true;
          targetPos.set(0, 18, 48);
          minDist = 20;
          maxDist = 120;
          break;

        case 'DEEP_SPACE':
          if (deepSpaceGroupRef.current) deepSpaceGroupRef.current.visible = true;
          if (solarSystemGroupRef.current) solarSystemGroupRef.current.visible = false;
          targetPos.set(0, 95, 175);
          targetLookAt.set(0, 0, 0);
          minDist = 20;
          maxDist = 600;
          break;
      }

      controls.minDistance = minDist;
      controls.maxDistance = maxDist;

      // Check if a target needs focus
      if (focusSiteId) {
        const resolved = resolve3DArtifact(focusSiteId);
        if (resolved) {
          setSelectedSite(resolved.site);
          if (mode === 'MARS' || mode === 'MOON') {
            focusLandingSite(resolved.site.lat, resolved.site.lon, true);
            return;
          } else if (mode === 'DEEP_SPACE') {
            setSelectedSite(resolved.site);
            const pos = getDeepSpaceCraftPosition(resolved.site);
            glideCamera(
              new THREE.Vector3(pos.x + 18, pos.y + 12, pos.z + 24),
              pos,
              1200
            );
            return;
          } else if (mode === 'SATURN') {
            setSelectedSite(resolved.site);
            glideCamera(new THREE.Vector3(12, 10, 32), new THREE.Vector3(5, 1, 2), 1200);
            return;
          }
        }
      }

      glideCamera(targetPos, targetLookAt, 1200);
    },
    [focusLandingSite, glideCamera]
  );

  // User selects view mode from UI
  const handleSelectViewMode = useCallback(
    (newMode: ViewMode, preserveSiteId?: string) => {
      playWhooshSound();
      setViewMode(newMode);
      if (!preserveSiteId) {
        setSelectedSite(null);
        prevTargetRef.current = null;
      } else {
        prevTargetRef.current = preserveSiteId;
      }
      setSelectedLandmark(null);

      const dest = DESTINATIONS.find((d) => d.mode === newMode);
      if (dest && dest.mode !== 'SOLAR_SYSTEM') {
        if (preserveSiteId) {
          setSearchParams({ planet: dest.param, target: preserveSiteId });
        } else {
          setSearchParams({ planet: dest.param });
        }
      } else {
        setSearchParams({});
      }
      applyViewMode(newMode, preserveSiteId);
    },
    [applyViewMode, setSearchParams]
  );

  // Bug Fix: Clean drawer close and URL synchronization with smooth camera return
  const handleCloseDrawer = useCallback(() => {
    prevTargetRef.current = null;
    setSelectedSite(null);
    setSelectedLandmark(null);
    const params = new URLSearchParams(searchParams);
    params.delete('target');
    setSearchParams(params, { replace: true });

    // Smoothly reset camera back to the planetary/deep-space overview
    if (cameraRef.current && controlsRef.current) {
      if (viewMode === 'DEEP_SPACE') {
        glideCamera(new THREE.Vector3(0, 95, 175), new THREE.Vector3(0, 0, 0), 1000);
      } else if (viewMode === 'SOLAR_SYSTEM') {
        glideCamera(new THREE.Vector3(0, 75, 175), new THREE.Vector3(0, 0, 0), 1000);
      } else if (viewMode === 'MARS') {
        glideCamera(new THREE.Vector3(0, 3.5, 9), new THREE.Vector3(0, 0, 0), 1000);
      } else if (viewMode === 'MOON') {
        glideCamera(new THREE.Vector3(0, 3, 7.5), new THREE.Vector3(0, 0, 0), 1000);
      } else if (viewMode === 'SATURN') {
        glideCamera(new THREE.Vector3(0, 5, 13), new THREE.Vector3(0, 0, 0), 1000);
      }
    }
  }, [searchParams, setSearchParams, viewMode, glideCamera]);

  // URL search params sync listener (Back/forward buttons & deep links)
  useEffect(() => {
    const p = searchParams.get('planet');
    const target = searchParams.get('target');
    let resolvedMode = parsePlanetParam(p);

    if (target && !p) {
      const match = resolve3DArtifact(target);
      if (match) {
        if (match.targetMode === 'MARS') resolvedMode = 'MARS';
        else if (match.targetMode === 'MOON') resolvedMode = 'MOON';
        else if (match.targetMode === 'DEEP_SPACE') resolvedMode = 'DEEP_SPACE';
        else if (match.targetMode === 'SATURN') resolvedMode = 'SATURN';
      }
    }

    if (resolvedMode !== viewMode) {
      setViewMode(resolvedMode);
      applyViewMode(resolvedMode, target);
      prevTargetRef.current = target;
    } else if (target && target !== prevTargetRef.current) {
      prevTargetRef.current = target;
      const match = resolve3DArtifact(target);
      if (match) {
        setSelectedSite(match.site);
        if (match.site.body === 'mars' || match.site.body === 'moon') {
          focusLandingSite(match.site.lat, match.site.lon, true);
        } else if (match.site.body === 'deep-space') {
          const pos = getDeepSpaceCraftPosition(match.site);
          glideCamera(
            new THREE.Vector3(pos.x + 18, pos.y + 12, pos.z + 24),
            pos,
            1200
          );
        } else if (match.site.body === 'saturn') {
          setSelectedSite(match.site);
        }
      }
    } else if (!target && prevTargetRef.current !== null) {
      prevTargetRef.current = null;
      setSelectedSite(null);
    }
  }, [searchParams, viewMode, applyViewMode, focusLandingSite, glideCamera]);

  // Reset View helper to return to default camera orbit
  const handleResetView = useCallback(() => {
    playWhooshSound();
    prevTargetRef.current = null;
    setSelectedSite(null);
    setSelectedLandmark(null);
    const dest = DESTINATIONS.find((d) => d.mode === viewMode);
    if (dest && dest.mode !== 'SOLAR_SYSTEM') {
      setSearchParams({ planet: dest.param });
    } else {
      setSearchParams({});
    }
    if (!cameraRef.current || !controlsRef.current) return;
    if (viewMode === 'SOLAR_SYSTEM') {
      glideCamera(new THREE.Vector3(0, 75, 175), new THREE.Vector3(0, 0, 0), 1000);
    } else if (viewMode === 'DEEP_SPACE') {
      glideCamera(new THREE.Vector3(0, 95, 175), new THREE.Vector3(0, 0, 0), 1000);
    } else {
      glideCamera(new THREE.Vector3(0, 8, 38), new THREE.Vector3(0, 0, 0), 1000);
    }
  }, [viewMode, glideCamera, setSearchParams]);

  // Real-time search query matching across all missions and landmarks
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    const siteMatches = LANDING_SITES_3D.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.designation.toLowerCase().includes(q) ||
        s.locationName.toLowerCase().includes(q) ||
        s.body.toLowerCase().includes(q)
    );
    const landmarkMatches = MARS_LANDMARKS.filter(
      (lm) =>
        lm.name.toLowerCase().includes(q) ||
        lm.type.toLowerCase().includes(q) ||
        lm.description.toLowerCase().includes(q)
    );
    return [
      ...siteMatches.map((s) => ({ type: 'site' as const, data: s })),
      ...landmarkMatches.map((lm) => ({ type: 'landmark' as const, data: lm })),
    ].slice(0, 8);
  }, [searchQuery]);

  const handleSelectSearchResult = useCallback(
    (result: { type: 'site'; data: LandingSite3D } | { type: 'landmark'; data: MarsLandmark }) => {
      setSearchQuery('');
      setIsSearchFocused(false);
      if (result.type === 'site') {
        const site = result.data;
        const targetPlanet = parsePlanetParam(site.body);
        prevTargetRef.current = site.id;
        setSelectedLandmark(null);
        setSelectedSite(site);
        handleSelectViewMode(targetPlanet, site.id);
        if (site.body === 'mars' || site.body === 'moon') {
          focusLandingSite(site.lat, site.lon, true);
        } else if (site.body === 'deep-space') {
          const pos = getDeepSpaceCraftPosition(site);
          glideCamera(
            new THREE.Vector3(pos.x + 18, pos.y + 12, pos.z + 24),
            pos,
            1200
          );
        }
        setSearchParams({ planet: site.body, target: site.id });
      } else {
        const lm = result.data;
        prevTargetRef.current = null;
        handleSelectViewMode('MARS');
        setSelectedSite(null);
        setSelectedLandmark(lm);
        focusLandingSite(lm.lat, lm.lon, true, 30);
      }
    },
    [handleSelectViewMode, focusLandingSite, setSearchParams]
  );

  // Synchronize selection highlight ring on active 3D monument
  useEffect(() => {
    const activeId = selectedSite?.id || selectedLandmark?.id || null;
    updateMonumentSelection(
      [
        marsGlobeGroupRef.current,
        moonGlobeGroupRef.current,
        saturnGlobeGroupRef.current,
        deepSpaceGroupRef.current,
        solarSystemGroupRef.current,
      ],
      activeId
    );
  }, [selectedSite, selectedLandmark]);

  // Main Three.js Scene Setup & Lifecycle
  useEffect(() => {
    if (!mountRef.current) return;
    const mountEl = mountRef.current;
    const width = mountEl.clientWidth;
    const height = mountEl.clientHeight;

    // Check WebGL availability
    try {
      const canvasCheck = document.createElement('canvas');
      const gl = canvasCheck.getContext('webgl') || canvasCheck.getContext('experimental-webgl');
      if (!gl) {
        setWebglError('WebGL is not supported by your current browser or graphics hardware.');
        return;
      }
    } catch {
      setWebglError('Unable to initialize WebGL graphics context.');
      return;
    }

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x060911);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 3000);
    camera.position.set(0, 85, 170);
    cameraRef.current = camera;

    // 2. Renderer
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch (e: unknown) {
      const err = e as Error;
      setWebglError(err?.message || 'WebGL initialization error.');
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    rendererRef.current = renderer;
    (window as unknown as { __THREE_RENDERER__?: THREE.WebGLRenderer }).__THREE_RENDERER__ = renderer;
    mountEl.appendChild(renderer.domElement);

    // 3. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 600;
    controls.minDistance = 25;
    controls.addEventListener('start', () => { isInteractingRef.current = true; });
    controls.addEventListener('end', () => { isInteractingRef.current = false; });
    controlsRef.current = controls;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const sunPointLight = new THREE.PointLight(0xfffaed, 2.5, 900);
    sunPointLight.position.set(0, 0, 0);
    scene.add(sunPointLight);

    const directionalFill = new THREE.DirectionalLight(0xffffff, 0.65);
    directionalFill.position.set(50, 40, 50);
    scene.add(directionalFill);

    // 5. Starfield background
    const starCount = 2200;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      const r = 800 + Math.random() * 400;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      starPositions[i] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i + 2] = r * Math.cos(phi);
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0xe2e8f0,
      size: 1.5,
      transparent: true,
      opacity: 0.85,
    });
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // 6. BUILD SOLAR SYSTEM GROUP
    const solarSystemGroup = new THREE.Group();
    solarSystemGroupRef.current = solarSystemGroup;
    scene.add(solarSystemGroup);

    // Sun Mesh
    const sunTex = createSunTexture();
    const sunMesh = new THREE.Mesh(
      new THREE.SphereGeometry(9, 32, 32),
      new THREE.MeshBasicMaterial({ map: sunTex })
    );
    sunMesh.userData = { name: 'The Sun', type: 'star' };
    solarSystemGroup.add(sunMesh);

    // Sun Glow Halo
    const haloGeo = new THREE.SphereGeometry(9.6, 24, 24);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xffaa22,
      transparent: true,
      opacity: 0.25,
      side: THREE.BackSide,
    });
    solarSystemGroup.add(new THREE.Mesh(haloGeo, haloMat));

    // Helper for Orbits
    const createOrbitLine = (radius: number, color = 0x3d4b60) => {
      const pts = [];
      const segs = 96;
      for (let i = 0; i <= segs; i++) {
        const theta = (i / segs) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.45 });
      return new THREE.Line(geo, mat);
    };

    // Scaled planets for Solar System Overview (Authentic Viking map for Mars!)
    const marsVikingTex = createMarsVikingTexture();
    marsVikingTexRef.current = marsVikingTex;

    const planetsConfig = [
      { name: 'Mercury', radius: 1.4, dist: 18, mode: 'MERCURY' as ViewMode, tex: createMercuryTexture },
      { name: 'Venus', radius: 2.2, dist: 28, mode: 'VENUS' as ViewMode, tex: createVenusTexture },
      { name: 'Earth', radius: 2.6, dist: 42, mode: 'EARTH' as ViewMode, tex: createEarthTexture, hasMoon: true },
      { name: 'Mars', radius: 1.9, dist: 58, mode: 'MARS' as ViewMode, customTex: marsVikingTex },
      { name: 'Jupiter', radius: 5.2, dist: 88, mode: 'JUPITER' as ViewMode, tex: createJupiterTexture },
      { name: 'Saturn', radius: 4.2, dist: 122, mode: 'SATURN' as ViewMode, tex: createSaturnTexture, hasRings: true },
    ];

    const solarPlanetTargets: THREE.Object3D[] = [];
    const solarSpacecraftTargets: THREE.Object3D[] = [];

    planetsConfig.forEach((p, idx) => {
      solarSystemGroup.add(createOrbitLine(p.dist));

      const texture = p.customTex || (p.tex ? p.tex() : null);
      const pMesh = new THREE.Mesh(
        new THREE.SphereGeometry(p.radius, 32, 32),
        new THREE.MeshStandardMaterial({ map: texture, roughness: 0.75 })
      );
      const angle = idx * 1.05 + 0.4;
      pMesh.position.set(Math.cos(angle) * p.dist, 0, Math.sin(angle) * p.dist);
      pMesh.userData = { name: p.name, mode: p.mode, type: 'planet' };
      solarSystemGroup.add(pMesh);
      solarPlanetTargets.push(pMesh);

      // Dedicated Moon Mesh around Earth
      if (p.hasMoon) {
        const moonMesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.7, 16, 16),
          new THREE.MeshStandardMaterial({ map: createMoonTexture(), roughness: 0.9 })
        );
        moonMesh.position.set(pMesh.position.x + 4.5, 0.8, pMesh.position.z + 2.5);
        moonMesh.userData = { name: 'The Moon', mode: 'MOON' as ViewMode, type: 'moon' };
        solarSystemGroup.add(moonMesh);
        solarPlanetTargets.push(moonMesh);
      }

      // Saturn Rings
      if (p.hasRings) {
        const ringGeo = new THREE.RingGeometry(p.radius * 1.35, p.radius * 2.3, 48);
        ringGeo.rotateX(Math.PI / 2.3);
        const ringMat = new THREE.MeshBasicMaterial({
          map: createSaturnRingTexture(),
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.copy(pMesh.position);
        solarSystemGroup.add(ringMesh);
      }
    });

    // Escaping deep space probe markers in Solar System view (No Sun-to-craft connector lines)
    // Note: Cassini is NOT an escaping spacecraft; it is positioned in Saturn's historical context.
    const deepSpaceCraft = LANDING_SITES_3D.filter((s) => s.body === 'deep-space');

    deepSpaceCraft.forEach((dc) => {
      const angle = dc.trajectoryAngle ?? 0.7;
      const dist = dc.trajectoryDistance ?? 150;
      const pos = new THREE.Vector3(
        Math.cos(angle) * dist,
        Math.sin(angle * 0.3) * 15,
        Math.sin(angle) * dist
      );

      // Deep space probe marker using authentic vector symbol + readable name label
      const probeSymbol = createMonumentSymbol(dc, {
        name: `${dc.name} (Interstellar Bound)`,
        craftId: dc.id,
        mode: 'DEEP_SPACE' as ViewMode,
        type: 'deep-craft',
        showLabel: true,
        labelText: dc.name,
        labelSubtitle: dc.approximateAu ? `~${dc.approximateAu} AU` : undefined,
        labelScale: [18.0, 4.5, 1.0],
        labelOffsetY: -3.8,
        hitRadius: 4.5,
      });
      probeSymbol.position.copy(pos);
      probeSymbol.scale.set(2.4, 2.4, 2.4);
      solarSystemGroup.add(probeSymbol);
      solarSpacecraftTargets.push(probeSymbol);
    });

    // 7. BUILD INDEPENDENT GLOBES
    const createGlobe = (
      texture: THREE.Texture,
      radius = 12,
      roughness = 0.8
    ): { group: THREE.Group; mesh: THREE.Mesh } => {
      const group = new THREE.Group();
      group.visible = false;
      scene.add(group);

      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 64, 64),
        new THREE.MeshStandardMaterial({
          map: texture,
          roughness,
          metalness: 0.05,
        })
      );
      group.add(mesh);
      return { group, mesh };
    };

    // 7a. Mercury — Authentic NASA MESSENGER Global Mosaic
    const mercury = createGlobe(createMercuryTexture(), 12, 0.85);
    mercuryGlobeGroupRef.current = mercury.group;

    // 7b. Venus — Realistic Swirling Cloud Deck & Atmospheric Halo
    const venus = createGlobe(createVenusTexture(), 12, 0.65);
    venusGlobeGroupRef.current = venus.group;
    const venusAtmo = new THREE.Mesh(
      new THREE.SphereGeometry(12.22, 32, 32),
      new THREE.MeshBasicMaterial({
        color: 0xf5d078,
        transparent: true,
        opacity: 0.18,
        side: THREE.BackSide,
      })
    );
    venus.group.add(venusAtmo);

    // 7c. Earth — Authentic NASA Blue Marble with Oceans & Dynamic Clouds
    const earth = createGlobe(createEarthTexture(), 12, 0.6);
    earthGlobeGroupRef.current = earth.group;
    const earthAtmo = new THREE.Mesh(
      new THREE.SphereGeometry(12.2, 32, 32),
      new THREE.MeshBasicMaterial({
        color: 0x4aa9ff,
        transparent: true,
        opacity: 0.18,
        side: THREE.BackSide,
      })
    );
    earth.group.add(earthAtmo);

    // 7d. Moon — Authentic NASA Lunar Reconnaissance Orbiter (LRO) Mosaic
    const moon = createGlobe(createMoonTexture(), 12, 0.95);
    moonGlobeGroupRef.current = moon.group;

    // 7e. Mars — Standard Smooth Planetary Globe with Viking Map (Matches Mercury, Venus, Earth)
    const mars = createGlobe(marsVikingTex, 12, 0.85);
    marsGlobeGroupRef.current = mars.group;
    marsGlobeMeshRef.current = mars.mesh;
    const marsGroup = mars.group;

    // Thin Martian carbon-dioxide atmosphere halo
    const marsAtmo = new THREE.Mesh(
      new THREE.SphereGeometry(12.22, 32, 32),
      new THREE.MeshBasicMaterial({
        color: 0xe88a55,
        transparent: true,
        opacity: 0.16,
        side: THREE.BackSide,
      })
    );
    marsGroup.add(marsAtmo);

    // Interactive Raycast Target Collections (Pre-computed to eliminate group.traverse allocations)
    const marsLandingTargets: THREE.Object3D[] = [];
    const marsInteractiveTargets: THREE.Object3D[] = [];
    const moonInteractiveTargets: THREE.Object3D[] = [];
    const saturnInteractiveTargets: THREE.Object3D[] = [];

    // Mars Landmarks Group (Olympus Mons, Valles Marineris, Hellas, etc.)
    const marsLandmarksGroup = new THREE.Group();
    marsLandmarksGroupRef.current = marsLandmarksGroup;
    marsGroup.add(marsLandmarksGroup);

    MARS_LANDMARKS.forEach((lm) => {
      const pos = latLonToVector3(lm.lat, lm.lon, 12.0);
      const symbol = createMonumentSymbol(lm);
      symbol.position.copy(pos);
      symbol.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize());
      marsLandmarksGroup.add(symbol);
      marsInteractiveTargets.push(symbol);
    });

    // 7f. Jupiter
    const jupiter = createGlobe(createJupiterTexture(), 12, 0.7);
    jupiterGlobeGroupRef.current = jupiter.group;

    // 7g. Saturn (Globe + Rings + Cassini Grand Finale Historical Marker)
    const saturn = createGlobe(createSaturnTexture(), 11, 0.7);
    saturnGlobeGroupRef.current = saturn.group;
    const saturnRingGeo = new THREE.RingGeometry(15.4, 25.3, 64);
    saturnRingGeo.rotateX(Math.PI / 2.3);
    const saturnRingMat = new THREE.MeshBasicMaterial({
      map: createSaturnRingTexture(),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
    const saturnRing = new THREE.Mesh(saturnRingGeo, saturnRingMat);
    saturn.group.add(saturnRing);

    // Cassini Grand Finale Historical Mission Event Marker (Sept 15, 2017)
    const cassiniData = LANDING_SITES_3D.find((s) => s.id === 'cassini');
    if (cassiniData) {
      const cassiniSymbol = createMonumentSymbol(cassiniData);
      cassiniSymbol.position.set(11.2, 2.4, 3.8);
      saturn.group.add(cassiniSymbol);
      saturnInteractiveTargets.push(cassiniSymbol);
    }

    // 7h. Deep Space Group (Schematic Heliosphere & Interstellar Space)
    const deepSpaceGroup = new THREE.Group();
    deepSpaceGroupRef.current = deepSpaceGroup;
    scene.add(deepSpaceGroup);
    deepSpaceGroup.visible = false;

    // 1. Sun & Inner Planetary Core Origin at (0, 0, 0)
    const sunCore = new THREE.Mesh(
      new THREE.SphereGeometry(1.5, 24, 24),
      new THREE.MeshBasicMaterial({ color: 0xffd166 })
    );
    deepSpaceGroup.add(sunCore);

    const originLabel = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: getLabelSpriteTexture('SUN / INNER SYSTEM', 'Origin (0 AU)'),
        transparent: true,
        depthTest: false,
      })
    );
    originLabel.position.set(0, -2.4, 0);
    originLabel.scale.set(10.0, 2.5, 1.0);
    deepSpaceGroup.add(originLabel);

    // 2. Kuiper Belt (~30-50 AU): Subtle translucent toroidal ring
    const kuiperGeo = new THREE.RingGeometry(18, 30, 96);
    kuiperGeo.rotateX(Math.PI / 2);
    const kuiperMesh = new THREE.Mesh(
      kuiperGeo,
      new THREE.MeshBasicMaterial({
        color: 0x93c5fd,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.08,
      })
    );
    deepSpaceGroup.add(kuiperMesh);

    const kuiperLabel = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: getLabelSpriteTexture('KUIPER BELT', '~30–50 AU · Debris Disk'),
        transparent: true,
        depthTest: false,
      })
    );
    kuiperLabel.position.set(24, 0.4, 0);
    kuiperLabel.scale.set(11.0, 2.75, 1.0);
    deepSpaceGroup.add(kuiperLabel);

    // 3. Termination Shock (~90 AU / 54 units): Where solar wind abruptly drops
    const termShockGeo = new THREE.RingGeometry(53.6, 54.4, 128);
    termShockGeo.rotateX(Math.PI / 2);
    const termShockMesh = new THREE.Mesh(
      termShockGeo,
      new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.35,
      })
    );
    deepSpaceGroup.add(termShockMesh);

    const termWashGeo = new THREE.RingGeometry(30, 53.6, 64);
    termWashGeo.rotateX(Math.PI / 2);
    deepSpaceGroup.add(
      new THREE.Mesh(
        termWashGeo,
        new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.025,
        })
      )
    );

    const termLabel = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: getLabelSpriteTexture('TERMINATION SHOCK', '~90 AU · Schematic Boundary'),
        transparent: true,
        depthTest: false,
      })
    );
    termLabel.position.set(0, 0.4, 54);
    termLabel.scale.set(12.0, 3.0, 1.0);
    deepSpaceGroup.add(termLabel);

    // 4. Heliopause (~120 AU / 72 units): Theoretical edge of solar magnetic field
    const heliopauseGeo = new THREE.RingGeometry(71.4, 72.6, 128);
    heliopauseGeo.rotateX(Math.PI / 2);
    const heliopauseMesh = new THREE.Mesh(
      heliopauseGeo,
      new THREE.MeshBasicMaterial({
        color: 0x818cf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.45,
      })
    );
    deepSpaceGroup.add(heliopauseMesh);

    const heliopauseLabel = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: getLabelSpriteTexture('HELIOPAUSE', '~120 AU · Interstellar Frontier'),
        transparent: true,
        depthTest: false,
      })
    );
    heliopauseLabel.position.set(0, 0.4, -72);
    heliopauseLabel.scale.set(12.0, 3.0, 1.0);
    deepSpaceGroup.add(heliopauseLabel);

    // 5. Interstellar Space Label beyond Heliopause
    const interstellarLabel = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: getLabelSpriteTexture('INTERSTELLAR SPACE', '>120 AU · Pristine Interstellar Ocean'),
        transparent: true,
        depthTest: false,
      })
    );
    interstellarLabel.position.set(0, 0.4, 96);
    interstellarLabel.scale.set(14.0, 3.5, 1.0);
    deepSpaceGroup.add(interstellarLabel);

    // 6. Escaping deep space probes in deepSpaceGroup (Positioned by genuine AU distance & heading)
    const deepSpaceInteractiveTargets: THREE.Object3D[] = [];
    deepSpaceCraft.forEach((dc) => {
      const pos = getDeepSpaceCraftPosition(dc);
      const symbol = createMonumentSymbol(dc, {
        name: `${dc.name} (Interstellar Explorer)`,
        craftId: dc.id,
        showLabel: true,
        labelText: dc.name,
        labelSubtitle: dc.approximateAu ? `~${dc.approximateAu} AU` : undefined,
        labelScale: [11.0, 2.75, 1.0],
        labelOffsetY: -2.2,
        hitRadius: 3.5,
      });
      symbol.position.copy(pos);
      symbol.scale.set(2.0, 2.0, 2.0);
      deepSpaceGroup.add(symbol);
      deepSpaceInteractiveTargets.push(symbol);
    });

    // Store rotating meshes
    rotatingMeshesRef.current = [
      sunMesh,
      mercury.mesh,
      venus.mesh,
      earth.mesh,
      moon.mesh,
      mars.mesh,
      jupiter.mesh,
      saturn.mesh,
    ];

    // 8. POPULATE RECOGNISABLE 3D MONUMENT SYMBOLS (Rovers, Landers, Helicopters)
    LANDING_SITES_3D.forEach((site) => {
      if (site.body !== 'mars' && site.body !== 'moon') return;

      const isMars = site.body === 'mars';
      const targetGroup = isMars ? marsGroup : moon.group;

      if (site.isMultiLocation && site.subLocations) {
        site.subLocations.forEach((subLoc) => {
          const pos = latLonToVector3(subLoc.lat, subLoc.lon, 12.0);
          const symbol = createMonumentSymbol(site, {
            subLocation: subLoc,
            name: `${site.name} — ${subLoc.name}`,
          });
          symbol.position.copy(pos);
          symbol.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize());
          targetGroup.add(symbol);
          if (isMars) {
            marsLandingTargets.push(symbol);
            marsInteractiveTargets.push(symbol);
          } else {
            moonInteractiveTargets.push(symbol);
          }
        });
        return;
      }

      const pos = latLonToVector3(site.lat, site.lon, 12.0);
      const symbol = createMonumentSymbol(site);
      symbol.position.copy(pos);
      symbol.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize());
      targetGroup.add(symbol);

      if (isMars) {
        marsLandingTargets.push(symbol);
        marsInteractiveTargets.push(symbol);
      } else {
        moonInteractiveTargets.push(symbol);
      }
    });

    // 9. RAYCASTER & INTERACTION (Optimized with pre-computed targets & throttled raycasting)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let lastRaycastTime = 0;
    let cachedRect: DOMRect | null = null;
    let lastHoveredName: string | null = null;

    const getActiveTargets = (): THREE.Object3D[] => {
      if (marsGlobeGroupRef.current?.visible) {
        return showLandmarks ? marsInteractiveTargets : marsLandingTargets;
      }
      if (moonGlobeGroupRef.current?.visible) {
        return moonInteractiveTargets;
      }
      if (saturnGlobeGroupRef.current?.visible) {
        return saturnInteractiveTargets;
      }
      if (deepSpaceGroupRef.current?.visible) {
        return deepSpaceInteractiveTargets;
      }
      return [];
    };

    let hoveredMarkerRoot: THREE.Object3D | null = null;

    const handlePointerMove = (event: MouseEvent) => {
      const now = performance.now();
      if (now - lastRaycastTime < 35) return;
      lastRaycastTime = now;

      if (!cachedRect) {
        cachedRect = renderer.domElement.getBoundingClientRect();
      }

      mouse.x = ((event.clientX - cachedRect.left) / cachedRect.width) * 2 - 1;
      mouse.y = -((event.clientY - cachedRect.top) / cachedRect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      let newHovered: string | null = null;
      let newHoveredRoot: THREE.Object3D | null = null;

      if (solarSystemGroup.visible) {
        // Priority 1: Escaping deep-space spacecraft targets (strictly prioritized over planets)
        const craftIntersects = raycaster.intersectObjects(solarSpacecraftTargets, true);
        if (craftIntersects.length > 0) {
          let root: THREE.Object3D | null = craftIntersects[0].object;
          while (root && !root.userData?.craftId) {
            root = root.parent;
          }
          const craftId = root?.userData?.craftId as string | undefined;
          if (craftId) {
            const matched = LANDING_SITES_3D.find((s) => s.id === craftId);
            if (matched) {
              newHovered = `${matched.name} (Interstellar Bound)`;
              newHoveredRoot = root;
            }
          }
        }

        // Priority 2: Only when no spacecraft is hovered, raycast planetary targets
        if (!newHovered) {
          const planetIntersects = raycaster.intersectObjects(solarPlanetTargets, true);
          if (planetIntersects.length > 0) {
            let root: THREE.Object3D | null = planetIntersects[0].object;
            while (root && !root.userData?.mode) {
              root = root.parent;
            }
            if (root?.userData?.name) {
              newHovered = root.userData.name;
            }
          }
        }
      } else {
        const targets = getActiveTargets();
        if (targets.length > 0) {
          const intersects = raycaster.intersectObjects(targets, true);
          if (intersects.length > 0) {
            let root: THREE.Object3D | null = intersects[0].object;
            while (root && !root.userData?.isMarkerRoot && root.parent) {
              root = root.parent;
            }
            if (root?.userData?.siteData) {
              const label = getMonumentTypeLabel(root.userData.monumentType || getMonumentType(root.userData.siteData));
              newHovered = `${root.userData.siteData.name} (${label})`;
              newHoveredRoot = root;
            } else if (root?.userData?.landmarkData) {
              newHovered = `${root.userData.landmarkData.name} (Geological Landmark)`;
              newHoveredRoot = root;
            }
          }
        }
      }

      if (newHoveredRoot !== hoveredMarkerRoot) {
        if (hoveredMarkerRoot) {
          const oldLabel = hoveredMarkerRoot.getObjectByName('labelSprite') as THREE.Sprite | undefined;
          if (oldLabel && !oldLabel.userData?.alwaysVisible && hoveredMarkerRoot.userData?.id !== selectedSiteRef.current?.id) {
            oldLabel.visible = false;
          }
        }
        if (newHoveredRoot) {
          const newLabel = newHoveredRoot.getObjectByName('labelSprite') as THREE.Sprite | undefined;
          if (newLabel) {
            newLabel.visible = true;
          }
        }
        hoveredMarkerRoot = newHoveredRoot;
      }

      if (newHovered !== lastHoveredName) {
        lastHoveredName = newHovered;
        setHoveredObject(newHovered);
        mountEl.style.cursor = newHovered ? 'pointer' : 'default';
      }
    };

    const handleClick = (event: MouseEvent) => {
      if (!cachedRect) {
        cachedRect = renderer.domElement.getBoundingClientRect();
      }
      mouse.x = ((event.clientX - cachedRect.left) / cachedRect.width) * 2 - 1;
      mouse.y = -((event.clientY - cachedRect.top) / cachedRect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      if (solarSystemGroup.visible) {
        // Priority 1: Escaping deep-space spacecraft targets (strictly prioritized over planets)
        const craftIntersects = raycaster.intersectObjects(solarSpacecraftTargets, true);
        if (craftIntersects.length > 0) {
          let root: THREE.Object3D | null = craftIntersects[0].object;
          while (root && !root.userData?.craftId) {
            root = root.parent;
          }
          const craftId = root?.userData?.craftId as string | undefined;
          if (craftId) {
            const matched = LANDING_SITES_3D.find((s) => s.id === craftId);
            if (matched) {
              playSignalPing(750);
              prevTargetRef.current = matched.id;
              setSelectedSite(matched);
              handleSelectViewMode('DEEP_SPACE', matched.id);
              return; // Crucial: terminate immediately so no planetary navigation can run
            }
          }
        }

        // Priority 2: Only when no spacecraft marker is hit, raycast planetary targets
        const planetIntersects = raycaster.intersectObjects(solarPlanetTargets, true);
        if (planetIntersects.length > 0) {
          let root: THREE.Object3D | null = planetIntersects[0].object;
          while (root && !root.userData?.mode) {
            root = root.parent;
          }
          const targetMode = root?.userData?.mode as ViewMode | undefined;
          if (targetMode) {
            playWhooshSound();
            handleSelectViewMode(targetMode);
            return;
          }
        }
        return;
      } else {
        const targets = getActiveTargets();
        if (targets.length > 0) {
          const intersects = raycaster.intersectObjects(targets, true);
          if (intersects.length > 0) {
            let root: THREE.Object3D | null = intersects[0].object;
            while (root && !root.userData?.isMarkerRoot && root.parent) {
              root = root.parent;
            }
            if (root?.userData?.siteData) {
              const site = root.userData.siteData as LandingSite3D;
              playSignalPing(720);
              prevTargetRef.current = site.id;
              setSelectedLandmark(null);
              setSelectedSite(site);
              if (site.body === 'mars' || site.body === 'moon') {
                focusLandingSite(site.lat, site.lon, true);
              } else if (site.body === 'deep-space') {
                const pos = getDeepSpaceCraftPosition(site);
                glideCamera(
                  new THREE.Vector3(pos.x + 18, pos.y + 12, pos.z + 24),
                  pos,
                  1000
                );
              } else if (site.body === 'saturn') {
                glideCamera(new THREE.Vector3(12, 10, 32), new THREE.Vector3(5, 1, 2), 1200);
              }
              setSearchParams({ planet: site.body, target: site.id });
            } else if (root?.userData?.landmarkData) {
              const lm = root.userData.landmarkData as MarsLandmark;
              playSignalPing(500);
              setSelectedSite(null);
              setSelectedLandmark(lm);
              focusLandingSite(lm.lat, lm.lon, true, 30);
            }
          }
        }
      }
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousemove', handlePointerMove);
    domEl.addEventListener('click', handleClick);

    // Robust WebGL context loss & recovery lifecycle
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      isContextLostRef.current = true;
      setIsContextLost(true);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };

    const handleContextRestored = () => {
      isContextLostRef.current = false;
      setIsContextLost(false);
      animate();
    };

    domEl.addEventListener('webglcontextlost', handleContextLost, false);
    domEl.addEventListener('webglcontextrestored', handleContextRestored, false);

    // 10. ANIMATION TICK LOOP (Optimized: zero per-frame vector allocations & idle frame-budgeting)
    let lastAnimateTime = performance.now();

    const animate = () => {
      if (isContextLostRef.current) return;
      animFrameRef.current = requestAnimationFrame(animate);

      if (document.hidden) return;

      const now = performance.now();
      const isGliding = !!transitionRef.current;
      const isInteracting = isInteractingRef.current;
      const isActive = isGliding || isInteracting;

      // When settled & idle, pace frame-budget to ~35 FPS to conserve CPU/GPU
      if (!isActive && now - lastAnimateTime < 28) {
        return;
      }
      lastAnimateTime = now;

      // Rotate sun and active globes smoothly
      sunMesh.rotation.y += 0.002;
      rotatingMeshesRef.current.forEach((m) => {
        if (m.parent && m.parent.visible && m !== sunMesh) {
          m.rotation.y += 0.0006;
        }
      });

      // Ref-driven camera transition
      if (transitionRef.current) {
        const { startTime, duration, startPos, targetPos, startTarget, targetTarget, onComplete } =
          transitionRef.current;
        const elapsed = performance.now() - startTime;
        const t = Math.min(1, Math.max(0, elapsed / duration));

        const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

        camera.position.lerpVectors(startPos, targetPos, ease);
        controls.target.lerpVectors(startTarget, targetTarget, ease);
        controls.update();

        if (t >= 1) {
          camera.position.copy(targetPos);
          controls.target.copy(targetTarget);
          controls.update();
          transitionRef.current = null;
          if (onComplete) onComplete();
        }
      } else {
        controls.update();
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!mountEl) return;
      const w = mountEl.clientWidth;
      const h = mountEl.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      cachedRect = renderer.domElement.getBoundingClientRect();
    };
    window.addEventListener('resize', handleResize);
    domEl.addEventListener('pointerenter', () => {
      cachedRect = renderer.domElement.getBoundingClientRect();
    });

    // Initial view mode activation
    applyViewMode(viewMode, searchParams.get('target'));

    // Comprehensive Resource Disposal Cleanup on Unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      domEl.removeEventListener('mousemove', handlePointerMove);
      domEl.removeEventListener('click', handleClick);
      domEl.removeEventListener('webglcontextlost', handleContextLost);
      domEl.removeEventListener('webglcontextrestored', handleContextRestored);

      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

      const disposedGeos = new Set<THREE.BufferGeometry>();
      const disposedMats = new Set<THREE.Material>();
      const disposedTexs = new Set<THREE.Texture>();

      const disposeMaterial = (mat: THREE.Material) => {
        if (disposedMats.has(mat)) return;
        disposedMats.add(mat);

        const m = mat as unknown as Record<string, unknown>;
        const textureKeys = [
          'map',
          'bumpMap',
          'normalMap',
          'displacementMap',
          'roughnessMap',
          'metalnessMap',
          'alphaMap',
          'lightMap',
        ];
        textureKeys.forEach((key) => {
          const val = m[key];
          if (val && typeof val === 'object' && 'dispose' in val) {
            const tex = val as THREE.Texture;
            if (!disposedTexs.has(tex)) {
              disposedTexs.add(tex);
              tex.dispose();
            }
          }
        });
        mat.dispose();
      };

      scene.traverse((obj) => {
        const meshObj = obj as unknown as { geometry?: THREE.BufferGeometry; material?: THREE.Material | THREE.Material[] };
        if (meshObj.geometry && !disposedGeos.has(meshObj.geometry)) {
          disposedGeos.add(meshObj.geometry);
          meshObj.geometry.dispose();
        }
        if (meshObj.material) {
          if (Array.isArray(meshObj.material)) {
            meshObj.material.forEach(disposeMaterial);
          } else {
            disposeMaterial(meshObj.material);
          }
        }
      });

      controls.dispose();
      renderer.dispose();
      delete (window as unknown as { __THREE_RENDERER__?: THREE.WebGLRenderer }).__THREE_RENDERER__;
      if (mountEl.contains(domEl)) {
        mountEl.removeChild(domEl);
      }
    };
  }, []);

  // Sync Mars landmarks visibility
  useEffect(() => {
    if (marsLandmarksGroupRef.current) {
      marsLandmarksGroupRef.current.visible = showLandmarks;
    }
  }, [showLandmarks]);

  // Graceful WebGL Fallback UI for terminal failure
  if (webglError) {
    return (
      <div className="relative w-full min-h-[calc(100vh-70px)] bg-[#080B1D] flex items-center justify-center p-6 text-center select-none">
        <div className="max-w-md p-8 rounded-3xl bg-[#111A35]/90 border border-[#FFC66D]/40 shadow-2xl backdrop-blur-xl">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#FFC66D]/15 border border-[#FFC66D] flex items-center justify-center text-2xl">
            🪐
          </div>
          <h2 className="font-display text-2xl text-[#F5F0E8] mb-2">3D Universe Unavailable</h2>
          <p className="text-xs text-[#C8D8EA] font-sans leading-relaxed mb-6 font-light">
            {webglError} You can still explore the full archive of abandoned spacecraft, mission records, and scientific dossiers in 2D mode.
          </p>
          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => navigate('/explore')}
              className="w-full py-2.5 rounded-xl bg-[#FFC66D] text-[#080B1D] text-xs font-mono font-bold tracking-wider hover:brightness-110 transition-all uppercase cursor-pointer shadow-lg shadow-[#FFC66D]/20"
            >
              EXPLORE ARTIFACT ARCHIVE →
            </button>
            <button
              onClick={() => navigate('/timeline')}
              className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-[#F5F0E8] text-xs font-mono tracking-wider hover:bg-white/10 transition-all uppercase cursor-pointer"
            >
              VIEW COSMIC TIMELINE
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[calc(100vh-70px)] bg-[#05080E] overflow-hidden select-none">
      {/* 3D WebGL Canvas Mount */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* WebGL Context Loss Banner Overlay */}
      {isContextLost && (
        <div className="absolute inset-0 z-50 bg-[#080D16]/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="max-w-sm p-6 rounded-2xl bg-[#101A29] border border-[#C6A36B] text-center">
            <div className="text-xl mb-2 animate-spin">⏳</div>
            <h3 className="font-display text-lg text-[#F0E8D9] mb-1">Graphics Context Paused</h3>
            <p className="text-xs text-[#B6C0CC]">
              Waiting for GPU hardware recovery. Rendering will resume automatically.
            </p>
          </div>
        </div>
      )}

      {/* Top Controls: Search, Back & Quick Actions */}
      <div className="absolute top-16 left-4 z-20 flex flex-col gap-2 max-w-[320px] sm:max-w-[360px]">
        {/* Navigation & Search Bar */}
        <div className="flex items-center gap-2">
          {viewMode !== 'SOLAR_SYSTEM' && (
            <button
              onClick={() => handleSelectViewMode('SOLAR_SYSTEM')}
              aria-label="Back to Solar System Overview"
              className="px-3.5 py-2 rounded-full bg-[#111A35]/95 hover:bg-[#58D9FF] text-[#F5F0E8] hover:text-[#080B1D] border border-[#58D9FF]/40 hover:border-transparent transition-all shadow-xl font-mono text-xs font-semibold tracking-wider flex items-center gap-1.5 group backdrop-blur-md shrink-0 cursor-pointer"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              <span className="hidden sm:inline">SOLAR SYSTEM</span>
            </button>
          )}

          {/* Real-time Mission and Place Search Bar */}
          <div className="relative flex-1">
            <div className="flex items-center rounded-full bg-[#111A35]/95 border border-[#58D9FF]/30 focus-within:border-[#58D9FF] px-3 py-1.5 backdrop-blur-md shadow-xl transition-all">
              <span className="text-[#58D9FF] mr-2 text-xs">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="Find mission or place..."
                className="bg-transparent border-none outline-none text-xs text-[#F5F0E8] placeholder-[#C8D8EA]/60 w-full font-sans"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-[#C8D8EA] hover:text-white text-xs ml-1 cursor-pointer"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Real-time Search Dropdown */}
            {isSearchFocused && searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-1.5 max-h-64 overflow-y-auto rounded-2xl bg-[#080B1D]/98 border border-[#58D9FF]/40 shadow-2xl backdrop-blur-xl p-1.5 z-40">
                {searchResults.length === 0 ? (
                  <div className="p-3 text-center text-xs font-mono text-[#C8D8EA]/70">
                    No matching missions or landmarks found
                  </div>
                ) : (
                  searchResults.map((res, idx) => {
                    const isSite = res.type === 'site';
                    const type = getMonumentType(res.data);
                    const name = res.data.name;
                    const sub = isSite
                      ? `${res.data.body.toUpperCase()} • ${res.data.locationName}`
                      : `MARS • ${res.data.type.toUpperCase()}`;
                    return (
                      <button
                        key={idx}
                        onMouseDown={() => handleSelectSearchResult(res)}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#58D9FF]/15 transition-all flex items-center gap-2.5 group cursor-pointer"
                      >
                        <MonumentIcon type={type} className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-display text-[#F5F0E8] truncate group-hover:text-[#58D9FF]">
                            {name}
                          </div>
                          <div className="text-[10px] font-mono text-[#C8D8EA]/70 truncate">{sub}</div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Exploration Utility Bar: Reset View, Visual Legend & Landmarks */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Reset View Button */}
          <button
            onClick={handleResetView}
            title="Smoothly reset camera to default orbit view"
            className="px-3 py-1.5 rounded-full bg-[#101A29]/90 hover:bg-white/10 border border-white/15 text-[11px] font-mono text-[#B6C0CC] hover:text-[#F0E8D9] backdrop-blur-md shadow-md transition-all flex items-center gap-1.5"
          >
            <span>↺</span>
            <span>RESET VIEW</span>
          </button>

          {/* Marker Guide Toggle */}
          <button
            onClick={() => setIsLegendOpen(!isLegendOpen)}
            title="Visual guide to astronomical cartography markers"
            className={`px-3 py-1.5 rounded-full border text-[11px] font-mono backdrop-blur-md shadow-md transition-all flex items-center gap-1.5 ${
              isLegendOpen
                ? 'bg-[#58D9FF] text-[#080B1D] font-semibold border-[#58D9FF] shadow-[0_0_12px_rgba(88,217,255,0.3)]'
                : 'bg-[#111A35]/90 border-white/15 text-[#C8D8EA] hover:text-white hover:border-[#58D9FF]/40'
            }`}
          >
            <span>🧭</span>
            <span>MARKER GUIDE</span>
          </button>

          {/* Mars Landmarks Toggle (visible only on Mars) */}
          {viewMode === 'MARS' && (
            <button
              onClick={() => setShowLandmarks(!showLandmarks)}
              title="Toggle visibility of Martian mountains and craters"
              className={`px-3 py-1.5 rounded-full border text-[11px] font-mono backdrop-blur-md shadow-md transition-all flex items-center gap-1.5 ${
                showLandmarks
                  ? 'bg-[#58D9FF]/20 border-[#58D9FF]/60 text-[#58D9FF]'
                  : 'bg-[#111A35]/90 border-white/15 text-[#C8D8EA]'
              }`}
            >
              <span>🏔️</span>
              <span>LANDMARKS: {showLandmarks ? 'ON' : 'OFF'}</span>
            </button>
          )}
        </div>

        {/* Hover Target Badge */}
        {hoveredObject && (
          <div className="px-3.5 py-1.5 rounded-lg bg-[#080B1D]/95 border border-[#58D9FF]/60 text-xs font-display text-[#F5F0E8] tracking-wider shadow-[0_0_15px_rgba(88,217,255,0.2)] animate-fadeIn">
            TARGET: <span className="text-[#58D9FF] font-semibold">{hoveredObject}</span>
            <span className="block text-[10px] font-mono text-[#C8D8EA]/70">CLICK TO EXAMINE EXHIBIT</span>
          </div>
        )}
      </div>

      {/* Marker Guide Dialog */}
      {isLegendOpen && (
        <div className="absolute top-[148px] left-4 z-40 w-72 sm:w-80 p-4 rounded-2xl bg-[#080B1D]/98 border border-[#58D9FF]/40 shadow-2xl backdrop-blur-xl animate-fadeIn">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-base">🧭</span>
              <h4 className="font-display text-sm text-[#F5F0E8]">Marker Guide</h4>
            </div>
            <button
              onClick={() => setIsLegendOpen(false)}
              className="text-xs p-1 rounded-full text-[#C8D8EA] hover:text-white"
              aria-label="Close Marker Guide"
            >
              ✕
            </button>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3">
              <MonumentIcon type="rover" body="mars" className="w-7 h-7 shrink-0" />
              <div>
                <div className="font-semibold text-[#F5F0E8]">Rover</div>
                <div className="text-[11px] text-[#C8D8EA] font-light">Wheeled robotic explorer (e.g. Curiosity, Perseverance, Opportunity)</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MonumentIcon type="lander" body="mars" className="w-7 h-7 shrink-0" />
              <div>
                <div className="font-semibold text-[#F5F0E8]">Lander</div>
                <div className="text-[11px] text-[#C8D8EA] font-light">Stationary surface scientific station (e.g. Viking, InSight, Phoenix)</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MonumentIcon type="probe" body="deep-space" className="w-7 h-7 shrink-0" />
              <div>
                <div className="font-semibold text-[#F5F0E8]">Orbiter / Deep-Space Probe</div>
                <div className="text-[11px] text-[#C8D8EA] font-light">Atmospheric entry, orbital, or escaping probe (e.g. Cassini, Voyager)</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MonumentIcon type="helicopter" body="mars" className="w-7 h-7 shrink-0" />
              <div>
                <div className="font-semibold text-[#F5F0E8]">Helicopter</div>
                <div className="text-[11px] text-[#C8D8EA] font-light">Aerial rotorcraft scout (e.g. Ingenuity)</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MonumentIcon type="landmark" className="w-7 h-7 shrink-0" />
              <div>
                <div className="font-semibold text-[#38BDF8]">Geological Landmark</div>
                <div className="text-[11px] text-[#C8D8EA] font-light">Major volcanic peak, canyon, or crater (e.g. Olympus Mons)</div>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-white/10 text-[10px] font-mono text-[#58D9FF] text-center">
            Click or tap any 3D monument to inspect its museum exhibit
          </div>
        </div>
      )}

      {/* Top Center Responsive Destination Bar */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 max-w-[92vw] overflow-x-auto no-scrollbar p-1 rounded-full bg-[#080B1D]/90 border border-white/15 backdrop-blur-md shadow-2xl flex items-center gap-1">
        {DESTINATIONS.map((item) => (
          <button
            key={item.mode}
            onClick={() => handleSelectViewMode(item.mode)}
            aria-label={`Switch view to ${item.label}`}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wider whitespace-nowrap transition-all font-sans flex items-center gap-1 min-h-[36px] ${
              viewMode === item.mode
                ? item.mode === 'MARS'
                  ? 'bg-[#FF8D7B] text-[#080B1D] font-bold shadow-[0_0_14px_rgba(255,141,123,0.4)]'
                  : item.mode === 'MOON'
                  ? 'bg-[#C8D8EA] text-[#080B1D] font-bold shadow-[0_0_14px_rgba(200,216,234,0.4)]'
                  : item.mode === 'SATURN'
                  ? 'bg-[#FFC66D] text-[#080B1D] font-bold shadow-[0_0_14px_rgba(255,198,109,0.4)]'
                  : 'bg-[#58D9FF] text-[#080B1D] font-bold shadow-[0_0_14px_rgba(88,217,255,0.4)]'
                : 'text-[#C8D8EA]/80 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Scientific Transparency & Disclaimer Badges */}
      <div className="absolute bottom-4 right-4 z-20 hidden md:block max-w-sm pointer-events-none">
        {viewMode === 'SOLAR_SYSTEM' && (
          <div className="text-[10px] font-mono text-[#B6C0CC]/60 bg-[#080D16]/75 px-3 py-1.5 rounded-xl border border-white/5 backdrop-blur-sm">
            ℹ️ Solar System overview is an illustrative representation; planetary sizes and orbital distances are not to scale.
          </div>
        )}
        {viewMode === 'MERCURY' && (
          <div className="text-[10px] font-mono text-[#C8D8EA]/90 bg-[#080B1D]/85 px-3 py-1.5 rounded-xl border border-white/10 backdrop-blur-sm">
            🪨 Mercury: Authentic NASA MESSENGER Global Color Mosaic & cratered terrain.
          </div>
        )}
        {viewMode === 'VENUS' && (
          <div className="text-[10px] font-mono text-[#FFC66D] bg-[#080B1D]/85 px-3 py-1.5 rounded-xl border border-[#FFC66D]/30 backdrop-blur-sm">
            🟡 Venus: Dense golden sulfuric acid cloud decks observed by Pioneer Venus & Akatsuki.
          </div>
        )}
        {viewMode === 'EARTH' && (
          <div className="text-[10px] font-mono text-[#58D9FF] bg-[#080B1D]/85 px-3 py-1.5 rounded-xl border border-[#58D9FF]/30 backdrop-blur-sm">
            🌍 Earth: Authentic NASA Blue Marble with dynamic clouds, deep oceans, and coastlines.
          </div>
        )}
        {viewMode === 'MOON' && (
          <div className="text-[10px] font-mono text-[#C8D8EA] bg-[#080B1D]/85 px-3 py-1.5 rounded-xl border border-[#C8D8EA]/30 backdrop-blur-sm">
            🌑 Moon: Authentic NASA Lunar Reconnaissance Orbiter (LRO) global albedo mosaic.
          </div>
        )}
        {viewMode === 'MARS' && (
          <div className="text-[10px] font-mono text-[#FF8D7B] bg-[#080B1D]/90 px-3 py-1.5 rounded-xl border border-[#FF8D7B]/40 backdrop-blur-sm">
            🔴 Mars Surface: Authentic NASA Viking MDIM 2.1 Global Color Mosaic on spherical globe.
          </div>
        )}
        {viewMode === 'JUPITER' && (
          <div className="text-[10px] font-mono text-[#FFC66D] bg-[#080B1D]/85 px-3 py-1.5 rounded-xl border border-[#FFC66D]/30 backdrop-blur-sm">
            🪐 Jupiter: Authentic NASA Cassini / Voyager Global Mosaic & Great Red Spot.
          </div>
        )}
        {viewMode === 'SATURN' && (
          <div className="text-[10px] font-mono text-[#FFC66D] bg-[#080B1D]/85 px-3 py-1.5 rounded-xl border border-[#FFC66D]/30 backdrop-blur-sm">
            🪐 Saturn & Rings: Authentic NASA Cassini Cylindrical Mosaic & concentric ring divisions.
          </div>
        )}
        {viewMode === 'DEEP_SPACE' && (
          <div className="text-[10px] font-mono text-[#38bdf8]/90 bg-[#080D16]/90 px-3.5 py-2 rounded-xl border border-[#38bdf8]/40 backdrop-blur-sm">
            🌌 Deep Space: Schematic astronomical regions & boundaries (~30–50 AU Kuiper Belt, ~90 AU Termination Shock, ~120 AU Heliopause). Distances are approximate historical baselines.
          </div>
        )}
      </div>

      {/* Bottom Controls / Interaction Hint */}
      <div className="absolute bottom-4 left-4 z-20 hidden md:flex items-center gap-4 text-[11px] font-mono text-[#B6C0CC]/80 bg-[#080D16]/80 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
        <span>LEFT CLICK + DRAG: ROTATE</span>
        <span>•</span>
        <span>SCROLL: ZOOM IN / OUT</span>
        <span>•</span>
        <span>CLICK MONUMENT OR LANDMARK TO ENTER</span>
      </div>

      {/* Mobile Touch Guidance Banner */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none md:hidden bg-[#080D16]/90 border border-white/10 px-3.5 py-1.5 rounded-full backdrop-blur-md shadow-xl text-[10px] sm:text-[11px] font-mono text-[#F0E8D9]/90 text-center whitespace-nowrap">
        👆 Drag to rotate • Pinch to zoom • Tap monument
      </div>

      {/* Mars Landmark Information Drawer */}
      {selectedLandmark && (
        <div className="absolute top-16 right-3 sm:right-6 bottom-4 z-30 w-[calc(100vw-24px)] max-w-[420px] sm:w-[420px] bg-[#080D16]/95 border border-[#38bdf8]/60 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between overflow-y-auto animate-slideInRight">
          <div>
            <div className="flex items-start justify-between mb-4 pb-3 border-b border-white/10">
              <div className="flex items-start gap-3">
                <MonumentIcon type="landmark" className="w-9 h-9 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-mono font-semibold tracking-widest text-[#38bdf8] uppercase block">
                    MARTIAN GEOLOGICAL LANDMARK
                  </span>
                  <h2 className="font-display text-2xl text-[#F0E8D9] font-medium leading-tight mt-0.5">
                    {selectedLandmark.name}
                  </h2>
                  <div className="text-xs text-[#B6C0CC]/80 font-mono mt-0.5 capitalize">
                    {selectedLandmark.type} on Mars
                  </div>
                </div>
              </div>
              <button
                onClick={handleCloseDrawer}
                className="text-xs p-1.5 rounded-full border border-white/15 text-[#B6C0CC] hover:text-white hover:border-white/40 transition-colors"
                aria-label="Close Landmark Inspector"
              >
                ✕
              </button>
            </div>

            {/* Quick Fact Strip */}
            <div className="bg-[#101A29]/80 rounded-2xl p-3.5 border border-white/5 mb-5 space-y-1.5 text-xs font-sans">
              <div className="flex items-center justify-between">
                <span className="text-[#B6C0CC] font-mono text-[11px]">LOCATION:</span>
                <span className="text-[#F0E8D9] font-medium">Martian Surface</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#B6C0CC] font-mono text-[11px]">PEAK ELEVATION:</span>
                <span className="text-[#38bdf8] font-mono font-semibold">
                  {selectedLandmark.elevationKm > 0 ? `+${selectedLandmark.elevationKm} km` : `${selectedLandmark.elevationKm} km`}
                </span>
              </div>
              <div className="text-[11px] text-[#B6C0CC]/70 italic pt-1 border-t border-white/5">
                {selectedLandmark.elevationKm > 10 ? 'Nearly 3× the height of Earth\'s Mount Everest' : 'Prominent planetary geological feature'}
              </div>
            </div>

            {/* Geological Story */}
            <div className="mb-5">
              <h3 className="text-xs font-mono tracking-wider text-[#38bdf8] uppercase mb-1.5">
                THE GEOLOGICAL STORY
              </h3>
              <p className="text-sm font-sans text-[#F0E8D9]/90 leading-relaxed font-light">
                {selectedLandmark.description}
              </p>
            </div>

            {/* Fascinating Discovery */}
            <div className="bg-[#38bdf8]/10 border-l-2 border-[#38bdf8] p-3.5 rounded-r-xl mb-6">
              <span className="text-[10px] font-mono font-bold text-[#38bdf8] tracking-wider uppercase block mb-1">
                💡 WHY IT MATTERS
              </span>
              <p className="text-xs font-serif italic text-[#F0E8D9] leading-relaxed">
                "{selectedLandmark.funFact}"
              </p>
            </div>
          </div>

          <button
            onClick={handleCloseDrawer}
            className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-[#F0E8D9] border border-white/20 transition-all text-xs font-sans tracking-[0.18em] uppercase font-medium text-center"
          >
            RETURN TO PLANET VIEW
          </button>
        </div>
      )}

      {/* Site Inspector Drawer (When Landing Site is Clicked) */}
      {selectedSite && !selectedLandmark && (() => {
        const story = getMissionStory(selectedSite.id);
        const bodyAccent = selectedSite.body === 'mars'
          ? { text: 'text-[#FF8D7B]', bg: 'bg-[#FF8D7B]/15', border: 'border-[#FF8D7B]/50', drawerBorder: 'border-[#FF8D7B]/60 shadow-[0_0_35px_rgba(255,141,123,0.2)]', btnGrad: 'from-[#FF8D7B] to-[#FFC66D]' }
          : selectedSite.body === 'moon'
          ? { text: 'text-[#C8D8EA]', bg: 'bg-[#C8D8EA]/15', border: 'border-[#C8D8EA]/50', drawerBorder: 'border-[#C8D8EA]/60 shadow-[0_0_35px_rgba(200,216,234,0.2)]', btnGrad: 'from-[#C8D8EA] to-[#58D9FF]' }
          : selectedSite.body === 'saturn'
          ? { text: 'text-[#FFC66D]', bg: 'bg-[#FFC66D]/15', border: 'border-[#FFC66D]/50', drawerBorder: 'border-[#FFC66D]/60 shadow-[0_0_35px_rgba(255,198,109,0.2)]', btnGrad: 'from-[#FFC66D] to-[#FF8D7B]' }
          : { text: 'text-[#58D9FF]', bg: 'bg-[#58D9FF]/15', border: 'border-[#58D9FF]/50', drawerBorder: 'border-[#58D9FF]/60 shadow-[0_0_35px_rgba(88,217,255,0.25)]', btnGrad: 'from-[#58D9FF] to-[#64E5C0]' };

        return (
          <div className={`absolute top-16 right-3 sm:right-6 bottom-4 z-30 w-[calc(100vw-24px)] max-w-[400px] sm:w-[400px] bg-[#080B1D]/95 border ${bodyAccent.drawerBorder} rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between overflow-y-auto animate-slideInRight`}>
            <div>
              {/* Header info */}
              <div className="flex items-start justify-between mb-4 pb-3 border-b border-white/10">
                <div className="flex items-start gap-3">
                  <MonumentIcon type={getMonumentType(selectedSite)} body={selectedSite.body} className="w-10 h-10 shrink-0 mt-0.5" />
                  <div>
                    <span className={`text-[10px] font-mono font-medium tracking-widest uppercase inline-block px-2.5 py-0.5 rounded-full border ${bodyAccent.bg} ${bodyAccent.border} ${bodyAccent.text} mb-1`}>
                      {selectedSite.body.toUpperCase()} · {getMonumentTypeLabel(getMonumentType(selectedSite))}
                    </span>
                    <h2 className="font-display text-2xl sm:text-3xl text-[#F5F0E8] font-normal leading-tight">
                      {selectedSite.name}
                    </h2>
                    <div className="text-xs text-[#58D9FF] font-mono mt-0.5">
                      {CRAFT_CHARACTERS[selectedSite.id] || selectedSite.designation}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleCloseDrawer}
                  className="text-xs p-1.5 rounded-full border border-white/15 text-[#C8D8EA] hover:text-white hover:border-[#58D9FF]/50 transition-colors"
                  aria-label="Close Inspector"
                >
                  ✕
                </button>
              </div>

              {/* Plain Language Museum Dossier */}
              <div className="bg-[#111A35]/80 rounded-2xl p-4 border border-white/10 mb-5 space-y-2.5 text-xs font-sans">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[#C8D8EA]/75 font-mono text-[11px] whitespace-nowrap">LOCATION:</span>
                  <div className="text-right">
                    <span className="text-[#F5F0E8] font-medium block">{selectedSite.locationName}</span>
                    {selectedSite.lat !== undefined && selectedSite.lon !== undefined && (selectedSite.lat !== 0 || selectedSite.lon !== 0) && (
                      <span className="text-[10px] font-mono text-[#58D9FF] block mt-0.5">
                        {Math.abs(selectedSite.lat).toFixed(2)}°{selectedSite.lat >= 0 ? 'N' : 'S'}, {Math.abs(selectedSite.lon).toFixed(2)}°{selectedSite.lon >= 0 ? 'E' : 'W'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#C8D8EA]/75 font-mono text-[11px]">TIMELINE:</span>
                  <span className="text-[#F5F0E8] font-mono font-medium">
                    {selectedSite.body === 'deep-space'
                      ? `Launch: ${selectedSite.year}`
                      : selectedSite.year
                      ? `Touchdown: ${selectedSite.year}`
                      : 'Historical Flight'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#C8D8EA]/75 font-mono text-[11px]">STATUS:</span>
                  <span className="text-[#64E5C0] font-mono font-semibold">
                    {selectedSite.status}
                  </span>
                </div>
                {selectedSite.distanceFromEarth && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#C8D8EA]/75 font-mono text-[11px]">DISTANCE FROM EARTH:</span>
                    <span className="text-[#58D9FF] font-mono text-[11px] font-semibold">{selectedSite.distanceFromEarth}</span>
                  </div>
                )}
                {selectedSite.lightDelaySeconds && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#C8D8EA]/75 font-mono text-[11px]">ONE-WAY LIGHT DELAY:</span>
                    <span className="text-[#58D9FF] font-mono text-[11px] font-semibold">
                      ~{Math.round(selectedSite.lightDelaySeconds / 3600)}h {Math.round((selectedSite.lightDelaySeconds % 3600) / 60)}m (Theoretical)
                    </span>
                  </div>
                )}
                {selectedSite.referenceEpoch && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#C8D8EA]/75 font-mono text-[11px]">REFERENCE EPOCH:</span>
                    <span className="text-[#C8D8EA]/70 font-mono text-[10px]">{selectedSite.referenceEpoch}</span>
                  </div>
                )}
              </div>

              {/* Educational Deep Space Calculation Disclaimer */}
              {selectedSite.body === 'deep-space' && (
                <div className="mb-4 p-3.5 rounded-xl bg-[#58D9FF]/10 border border-[#58D9FF]/30 text-xs font-sans text-[#C8D8EA]">
                  <div className="font-semibold text-[#58D9FF] mb-0.5 flex items-center gap-1.5">
                    <span>📡</span>
                    <span>Theoretical Signal Travel Time</span>
                  </div>
                  Calculated based on speed of light and documented astronomical distances. This is a mathematical educational demonstration, not an active radio link.
                </div>
              )}

              {/* Special Saturn / Cassini atmospheric plunge notice */}
              {selectedSite.body === 'saturn' && (
                <div className="mb-4 p-3.5 rounded-xl bg-[#FFC66D]/15 border border-[#FFC66D]/40 text-xs font-sans text-[#F5F0E8]">
                  <div className="font-semibold text-[#FFC66D] mb-1 flex items-center gap-1.5">
                    <span>🪐</span>
                    <span>The Grand Finale Plunge</span>
                  </div>
                  Cassini completed 22 daring dives between Saturn and its rings before intentional atmospheric entry on September 15, 2017, transmitting atmospheric data until its final seconds.
                </div>
              )}

              {/* Multi-Location Stations Listing (for Lunar Retroreflectors) */}
              {selectedSite.isMultiLocation && selectedSite.subLocations && (
                <div className="mb-4 p-3.5 rounded-xl bg-[#111A35]/90 border border-[#58D9FF]/30">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#58D9FF] font-bold block mb-2">
                    📡 DISTRIBUTED REFLECTOR STATIONS ({selectedSite.subLocations.length})
                  </span>
                  <div className="space-y-1.5">
                    {selectedSite.subLocations.map((sub, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => focusLandingSite(sub.lat, sub.lon, true)}
                        className="w-full text-left p-2.5 rounded-lg bg-black/40 hover:bg-[#58D9FF]/20 border border-white/5 transition-all text-xs font-sans flex items-center justify-between"
                      >
                        <span className="text-[#F5F0E8] font-medium">{sub.name}</span>
                        <span className="text-[#58D9FF] text-[10px] font-mono">View Site →</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Shared Location Notice (e.g. Ingenuity with Perseverance) */}
              {selectedSite.sharedWith && (
                <div className="mb-4 p-3.5 rounded-xl bg-[#FF8D7B]/10 border border-[#FF8D7B]/30 text-xs font-sans">
                  <span className="text-[#FF8D7B] font-bold block mb-0.5">🔗 SHARED EXPLORATION SITE</span>
                  <span className="text-[#C8D8EA]">
                    Operated in conjunction with {selectedSite.sharedWith.toUpperCase()} across the Jezero Crater ancient river delta.
                  </span>
                </div>
              )}

              {/* Accessible Narrative Story (leveraging rich missionStories summary if available) */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-mono tracking-wider text-[#58D9FF] uppercase font-semibold">
                    {story ? '📖 MISSION CHRONICLE PREVIEW' : 'THE STORY'}
                  </h3>
                  {story && (
                    <span className="text-[10px] font-mono text-[#C8D8EA]/60">
                      FULL STORY IN DOSSIER
                    </span>
                  )}
                </div>
                <p className="text-sm font-sans text-[#F5F0E8]/95 leading-relaxed font-light">
                  {story ? story.summary : selectedSite.description}
                </p>
              </div>

              {/* Why It Matters / Fascinating Discovery */}
              <div className="bg-[#111A35]/90 border-l-4 border-[#58D9FF] p-4 rounded-r-2xl mb-6 shadow-md">
                <span className="text-[10px] font-mono font-bold text-[#58D9FF] tracking-wider uppercase block mb-1">
                  💡 WHY IT MATTERS
                </span>
                <p className="text-xs sm:text-sm font-serif italic text-[#F5F0E8] leading-relaxed">
                  "{selectedSite.fascinatingFact}"
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-4 border-t border-white/10">
              <button
                onClick={() => {
                  playSignalPing(800);
                  navigate(`/ghost/${selectedSite.id}`);
                }}
                className={`w-full py-3 rounded-xl bg-gradient-to-r ${bodyAccent.btnGrad} hover:brightness-110 text-[#080B1D] font-sans text-xs tracking-[0.16em] uppercase font-bold text-center block shadow-lg transition-all`}
              >
                EXPLORE FULL MISSION STORY →
              </button>

              <button
                onClick={handleCloseDrawer}
                className="w-full py-2 rounded-xl bg-transparent hover:bg-white/5 text-[#C8D8EA] hover:text-[#F5F0E8] transition-all text-[11px] font-mono tracking-wider uppercase text-center"
              >
                {['DEEP_SPACE', 'MARS', 'MOON', 'SATURN'].includes(viewMode)
                  ? 'RETURN TO MISSION DIRECTORY'
                  : 'RETURN TO PLANET'}
              </button>
            </div>
          </div>
        );
      })()}

      {/* Planetary Mission Directory (When in Mars, Moon, or Saturn and No Site/Landmark is Selected) */}
      {['MARS', 'MOON', 'SATURN'].includes(viewMode) && !selectedSite && !selectedLandmark && (() => {
        const dirBorder =
          viewMode === 'MARS'
            ? 'border-[#FF8D7B]/50 shadow-[0_0_35px_rgba(255,141,123,0.18)]'
            : viewMode === 'MOON'
            ? 'border-[#C8D8EA]/50 shadow-[0_0_35px_rgba(200,216,234,0.18)]'
            : 'border-[#FFC66D]/50 shadow-[0_0_35px_rgba(255,198,109,0.18)]';
        const dirAccentColor =
          viewMode === 'MARS' ? '#FF8D7B' : viewMode === 'MOON' ? '#C8D8EA' : '#FFC66D';

        return (
          <div className={`absolute top-16 right-3 sm:right-6 bottom-4 z-30 w-[calc(100vw-24px)] max-w-[420px] sm:w-[420px] bg-[#080B1D]/95 border ${dirBorder} rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between overflow-y-auto animate-slideInRight`}>
            <div>
              {/* Header info */}
              <div className="flex items-start justify-between mb-4 pb-3 border-b border-white/10">
                <div className="flex items-start gap-3">
                  <span className="text-3xl mt-0.5">
                    {viewMode === 'MARS' ? '🔴' : viewMode === 'MOON' ? '🌑' : '🪐'}
                  </span>
                  <div>
                    <span className="text-[10px] font-mono font-semibold tracking-widest uppercase block" style={{ color: dirAccentColor }}>
                      {viewMode === 'MARS'
                        ? 'MARTIAN SURFACE FLEET'
                        : viewMode === 'MOON'
                        ? 'LUNAR EXPLORATION SITES'
                        : 'SATURN SYSTEM EXPEDITION'}
                    </span>
                    <h2 className="font-display text-2xl sm:text-3xl text-[#F5F0E8] font-normal leading-tight mt-0.5">
                      Mission Directory
                    </h2>
                    <div className="text-xs text-[#C8D8EA] font-mono mt-0.5">
                      {viewMode === 'MARS'
                        ? `${LANDING_SITES_3D.filter((s) => s.body === 'mars').length} Historic & Active Surface Explorers`
                        : viewMode === 'MOON'
                        ? `${LANDING_SITES_3D.filter((s) => s.body === 'moon').length} Historic Landers & Robotic Stations`
                        : `${LANDING_SITES_3D.filter((s) => s.body === 'saturn').length} Flagship Planetary Explorer`}
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#C8D8EA] mb-5 font-light leading-relaxed">
                {viewMode === 'MARS' &&
                  "Humanity has deployed an armada of robotic explorers across the Martian sands. Select an explorer below or tap any 3D monument on the globe to inspect its landing site, discoveries, and mission dossier."}
                {viewMode === 'MOON' &&
                  "Trace humanity's first footsteps and robotic scouts across the lunar maria and highlands. Select a mission below or tap any 3D monument on the Moon to inspect its landing site and artifacts."}
                {viewMode === 'SATURN' &&
                  "Explore the historic flagship mission that revolutionized our understanding of the ringed giant and its ocean moons before its final Grand Finale atmospheric entry on September 15, 2017."}
              </p>

              {/* Selectable Spacecraft Exhibition Cards */}
              <div className="space-y-3 mb-6">
                {LANDING_SITES_3D.filter((s) => s.body === (viewMode === 'MARS' ? 'mars' : viewMode === 'MOON' ? 'moon' : 'saturn')).map((craft) => {
                  const hoverBorder =
                    viewMode === 'MARS'
                      ? 'hover:border-[#FF8D7B]/80 hover:shadow-[0_0_20px_rgba(255,141,123,0.25)]'
                      : viewMode === 'MOON'
                      ? 'hover:border-[#C8D8EA]/80 hover:shadow-[0_0_20px_rgba(200,216,234,0.25)]'
                      : 'hover:border-[#FFC66D]/80 hover:shadow-[0_0_20px_rgba(255,198,109,0.25)]';
                  return (
                    <button
                      key={craft.id}
                      onClick={() => {
                        playSignalPing(750);
                        prevTargetRef.current = craft.id;
                        setSelectedLandmark(null);
                        setSelectedSite(craft);
                        setSearchParams({ planet: craft.body, target: craft.id });
                        if (craft.body === 'mars' || craft.body === 'moon') {
                          focusLandingSite(craft.lat, craft.lon, true);
                        } else if (craft.body === 'saturn') {
                          glideCamera(new THREE.Vector3(12, 10, 32), new THREE.Vector3(5, 1, 2), 1200);
                        }
                      }}
                      className={`w-full p-4 rounded-2xl bg-gradient-to-r from-[#111A35]/95 to-[#080B1D]/95 border border-white/10 ${hoverBorder} transition-all text-left flex flex-col gap-2 group cursor-pointer`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <MonumentIcon
                            type={getMonumentType(craft)}
                            body={craft.body}
                            className="w-8 h-8 shrink-0 group-hover:scale-105 transition-transform"
                          />
                          <div className="min-w-0">
                            <div className="font-display text-base text-[#F5F0E8] font-medium group-hover:text-white transition-colors truncate">
                              {craft.name}
                            </div>
                            <div className="text-[11px] font-mono text-[#58D9FF] truncate">
                              {CRAFT_CHARACTERS[craft.id] || craft.locationName}
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-full bg-white/5 border border-white/10" style={{ color: dirAccentColor }}>
                            {craft.year ? (craft.body === 'saturn' ? `Launch ${craft.year}` : craft.year) : ''}
                          </span>
                        </div>
                      </div>

                      {/* Story Hook Quote */}
                      <p className="text-xs font-serif italic text-[#C8D8EA]/85 line-clamp-2 leading-relaxed">
                        "{craft.fascinatingFact}"
                      </p>

                      <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px] font-mono">
                        <span className="text-[#64E5C0] font-medium">{craft.status}</span>
                        <span className="text-[#58D9FF] group-hover:translate-x-1 transition-transform font-medium">
                          Inspect Dossier →
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

            {/* Educational Planetary Exploration Summary */}
            <div className="p-4 rounded-2xl bg-[#111A35]/80 border border-white/10 space-y-2 text-xs">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#FFC66D] font-semibold block mb-1">
                {viewMode === 'MARS'
                  ? 'PLANETARY EXPLORATION SUMMARY'
                  : viewMode === 'MOON'
                  ? 'LUNAR EXPLORATION SUMMARY'
                  : 'SATURN SYSTEM SUMMARY'}
              </span>
              {viewMode === 'MARS' && (
                <>
                  <div className="flex justify-between text-[11px] font-mono text-[#C8D8EA]">
                    <span>Documented Sites:</span>
                    <span className="text-[#F5F0E8] font-medium">{LANDING_SITES_3D.filter((s) => s.body === 'mars').length} Surface Locations</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-[#C8D8EA]">
                    <span>Active Rovers:</span>
                    <span className="text-[#58D9FF] font-medium">Curiosity & Perseverance</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-[#C8D8EA]">
                    <span>Rotorcraft Scout:</span>
                    <span className="text-[#FF8D7B] font-medium">Ingenuity Mars Helicopter</span>
                  </div>
                </>
              )}
              {viewMode === 'MOON' && (
                <>
                  <div className="flex justify-between text-[11px] font-mono text-[#C8D8EA]">
                    <span>Documented Sites:</span>
                    <span className="text-[#F5F0E8] font-medium">{LANDING_SITES_3D.filter((s) => s.body === 'moon').length} Historic Stations</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-[#C8D8EA]">
                    <span>Laser Retroreflectors:</span>
                    <span className="text-[#58D9FF] font-medium">Apollo & Lunokhod Arrays</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-[#C8D8EA]">
                    <span>Far Side Pioneer:</span>
                    <span className="text-[#FFC66D] font-medium">Chang'e 4 (Von Kármán Basin)</span>
                  </div>
                </>
              )}
              {viewMode === 'SATURN' && (
                <>
                  <div className="flex justify-between text-[11px] font-mono text-[#C8D8EA]">
                    <span>Mission Duration:</span>
                    <span className="text-[#F5F0E8] font-medium">1997–2017 (20 Years)</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-[#C8D8EA]">
                    <span>Grand Finale Dives:</span>
                    <span className="text-[#A18BFF] font-medium">22 Ring-Gap Orbits</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-[#C8D8EA]">
                    <span>Atmospheric Plunge:</span>
                    <span className="text-[#FFC66D] font-medium">Sept 15, 2017 (Concluded)</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Bottom Return Action */}
          <div className="pt-4 border-t border-white/10 mt-4">
            <button
              onClick={() => handleSelectViewMode('SOLAR_SYSTEM')}
              className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-[#F5F0E8] border border-white/15 transition-all text-xs font-mono tracking-wider uppercase text-center cursor-pointer"
            >
              ← RETURN TO SOLAR SYSTEM
            </button>
          </div>
        </div>
      );
    })()}

      {/* Deep Space Mission Directory (When in Deep Space and No Craft is Selected) */}
      {viewMode === 'DEEP_SPACE' && !selectedSite && (
        <div className="absolute top-16 right-3 sm:right-6 bottom-4 z-30 w-[calc(100vw-24px)] max-w-[420px] sm:w-[420px] bg-[#080B1D]/95 border border-[#58D9FF]/50 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between overflow-y-auto animate-slideInRight">
          <div>
            {/* Header info */}
            <div className="flex items-start justify-between mb-4 pb-3 border-b border-white/10">
              <div className="flex items-start gap-3">
                <span className="text-3xl mt-0.5">🌌</span>
                <div>
                  <span className="text-[10px] font-mono font-semibold tracking-widest text-[#58D9FF] uppercase block">
                    INTERSTELLAR FLEET
                  </span>
                  <h2 className="font-display text-2xl sm:text-3xl text-[#F5F0E8] font-normal leading-tight mt-0.5">
                    Mission Directory
                  </h2>
                  <div className="text-xs text-[#C8D8EA] font-mono mt-0.5">
                    Five Escaping Interstellar Artifacts
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#C8D8EA] mb-5 font-light leading-relaxed">
              Humanity has launched five robotic messengers on hyperbolic escape trajectories that will never return. Select an explorer below or tap its 3D marker to inspect its distance, mission dossier, and light delay.
            </p>

            {/* 5 Selectable Spacecraft Exhibition Cards */}
            <div className="space-y-3 mb-6">
              {LANDING_SITES_3D.filter((s) => s.body === 'deep-space').map((craft) => (
                <button
                  key={craft.id}
                  onClick={() => {
                    playSignalPing(750);
                    prevTargetRef.current = craft.id;
                    setSelectedSite(craft);
                    setSearchParams({ planet: 'deep-space', target: craft.id });
                    const pos = getDeepSpaceCraftPosition(craft);
                    glideCamera(
                      new THREE.Vector3(pos.x + 18, pos.y + 12, pos.z + 24),
                      pos,
                      1200
                    );
                  }}
                  className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#111A35]/95 to-[#080B1D]/95 border border-white/10 hover:border-[#58D9FF]/80 hover:shadow-[0_0_20px_rgba(88,217,255,0.25)] transition-all text-left flex flex-col gap-2 group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <MonumentIcon type="probe" body="deep-space" className="w-8 h-8 shrink-0 group-hover:scale-105 transition-transform" />
                      <div className="min-w-0">
                        <div className="font-display text-base text-[#F5F0E8] font-medium group-hover:text-white transition-colors truncate">
                          {craft.name}
                        </div>
                        <div className="text-[11px] font-mono text-[#58D9FF] truncate">
                          {CRAFT_CHARACTERS[craft.id]}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <span className="font-mono text-xs font-semibold text-[#58D9FF] px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 block">
                        ~{craft.approximateAu} AU
                      </span>
                    </div>
                  </div>

                  {/* Story Hook Quote */}
                  <p className="text-xs font-serif italic text-[#C8D8EA]/85 line-clamp-2 leading-relaxed">
                    "{craft.fascinatingFact}"
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px] font-mono">
                    <span className="text-[#64E5C0] font-medium">{craft.status}</span>
                    <span className="text-[#58D9FF] group-hover:translate-x-1 transition-transform font-medium">
                      Inspect Dossier →
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Educational Spatial Boundary Legend */}
            <div className="p-4 rounded-2xl bg-[#111A35]/80 border border-white/10 space-y-2 text-xs">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#58D9FF] font-semibold block mb-1">
                ASTRONOMICAL BOUNDARIES (APPROXIMATE)
              </span>
              <div className="flex justify-between text-[11px] font-mono text-[#C8D8EA]">
                <span>Kuiper Belt:</span>
                <span className="text-[#F5F0E8]">~30–50 AU (Debris Disk)</span>
              </div>
              <div className="flex justify-between text-[11px] font-mono text-[#C8D8EA]">
                <span>Termination Shock:</span>
                <span className="text-[#58D9FF]">~90 AU (Subsonic Wind)</span>
              </div>
              <div className="flex justify-between text-[11px] font-mono text-[#C8D8EA]">
                <span>Heliopause:</span>
                <span className="text-[#A18BFF]">~120 AU (Interstellar Edge)</span>
              </div>
              <div className="flex justify-between text-[11px] font-mono text-[#C8D8EA]">
                <span>Interstellar Space:</span>
                <span className="text-purple-300">&gt;120 AU (Pristine ISM)</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 mt-4">
            <button
              onClick={() => handleSelectViewMode('SOLAR_SYSTEM')}
              className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-[#F0E8D9] border border-white/15 transition-all text-xs font-mono tracking-wider uppercase text-center cursor-pointer"
            >
              ← RETURN TO SOLAR SYSTEM
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
