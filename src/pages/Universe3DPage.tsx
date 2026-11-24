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
import { PanoramaViewer } from '../components/PanoramaViewer';
import heroOpportunity from '../assets/hero-opportunity.jpg';
import heroSurveyor3 from '../assets/hero-surveyor3.jpg';

import {
  createMonumentSymbol,
  updateMonumentSelection,
  MonumentIcon,
  getMonumentTypeLabel,
  getMonumentType,
} from '../utils/monumentSymbols';

import { playSignalPing, playWhooshSound, playSuccessChime } from '../utils/audio';
import { normalizeLongitude } from '../utils/coordinateUtils';

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

  const [selectedLandmark, setSelectedLandmark] = useState<MarsLandmark | null>(null);
  const [showLandmarks, setShowLandmarks] = useState(true);

  // Search & Navigation controls state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isLegendOpen, setIsLegendOpen] = useState(false);

  const [hoveredObject, setHoveredObject] = useState<string | null>(null);
  const [isPanoramaOpen, setIsPanoramaOpen] = useState(false);
  const [radioInput, setRadioInput] = useState('');
  const [radioSent, setRadioSent] = useState(false);
  const [selectedDeepCraft, setSelectedDeepCraft] = useState<LandingSite3D>(
    LANDING_SITES_3D.find((s) => s.id === 'voyager-1') || LANDING_SITES_3D[15]
  );

  // Three.js internal refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const transitionRef = useRef<CameraTransition | null>(null);
  const isInteractingRef = useRef(false);
  const isContextLostRef = useRef(false);

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
          if (solarSystemGroupRef.current) solarSystemGroupRef.current.visible = true;
          targetPos.set(120, 60, 160);
          minDist = 40;
          maxDist = 700;
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
            setSelectedDeepCraft(resolved.site);
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
    (newMode: ViewMode) => {
      playWhooshSound();
      setViewMode(newMode);
      setSelectedSite(null);
      setSelectedLandmark(null);

      const dest = DESTINATIONS.find((d) => d.mode === newMode);
      if (dest && dest.mode !== 'SOLAR_SYSTEM') {
        setSearchParams({ planet: dest.param });
      } else {
        setSearchParams({});
      }
      applyViewMode(newMode);
    },
    [applyViewMode, setSearchParams]
  );

  // Bug Fix: Clean drawer close and URL synchronization
  const handleCloseDrawer = useCallback(() => {
    setSelectedSite(null);
    setSelectedLandmark(null);
    const params = new URLSearchParams(searchParams);
    params.delete('target');
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

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
    } else if (target) {
      const match = resolve3DArtifact(target);
      if (match && (!selectedSite || selectedSite.id !== match.site.id)) {
        setSelectedSite(match.site);
        if (match.site.body === 'mars' || match.site.body === 'moon') {
          focusLandingSite(match.site.lat, match.site.lon, true);
        } else if (match.site.body === 'deep-space') {
          setSelectedDeepCraft(match.site);
        } else if (match.site.body === 'saturn') {
          setSelectedSite(match.site);
        }
      }
    } else if (!target && selectedSite) {
      setSelectedSite(null);
    }
  }, [searchParams, viewMode, applyViewMode, selectedSite, focusLandingSite]);

  // Reset View helper to return to default camera orbit
  const handleResetView = useCallback(() => {
    playWhooshSound();
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
        handleSelectViewMode(targetPlanet);
        setSelectedLandmark(null);
        setSelectedSite(site);
        if (site.body === 'mars' || site.body === 'moon') {
          focusLandingSite(site.lat, site.lon, true);
        } else if (site.body === 'deep-space') {
          setSelectedDeepCraft(site);
        }
        setSearchParams({ planet: site.body, target: site.id });
      } else {
        const lm = result.data;
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

    const solarMeshes: THREE.Object3D[] = [];

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
      solarMeshes.push(pMesh);

      // Dedicated Moon Mesh around Earth
      if (p.hasMoon) {
        const moonMesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.7, 16, 16),
          new THREE.MeshStandardMaterial({ map: createMoonTexture(), roughness: 0.9 })
        );
        moonMesh.position.set(pMesh.position.x + 4.5, 0.8, pMesh.position.z + 2.5);
        moonMesh.userData = { name: 'The Moon', mode: 'MOON' as ViewMode, type: 'moon' };
        solarSystemGroup.add(moonMesh);
        solarMeshes.push(moonMesh);
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

    // Deep Space craft trajectories & markers in Solar System view (Single Source of Truth)
    // Note: Cassini is NOT an escaping spacecraft; it is positioned in Saturn's historical context.
    const deepSpaceCraft = LANDING_SITES_3D.filter((s) => s.body === 'deep-space');

    deepSpaceCraft.forEach((dc) => {
      const angle = dc.trajectoryAngle ?? 0.7;
      const dist = dc.trajectoryDistance ?? 140;
      const color = dc.trajectoryColor ?? 0x38bdf8;

      const trajPts = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(Math.cos(angle) * dist, Math.sin(angle * 0.3) * 15, Math.sin(angle) * dist),
      ];
      const trajGeo = new THREE.BufferGeometry().setFromPoints(trajPts);
      const trajMat = new THREE.LineDashedMaterial({
        color: color,
        dashSize: 4,
        gapSize: 3,
        transparent: true,
        opacity: 0.6,
      });
      const line = new THREE.Line(trajGeo, trajMat);
      line.computeLineDistances();
      solarSystemGroup.add(line);

      // Escaping deep space probe marker using the authentic probe vector symbol
      const probeSymbol = createMonumentSymbol(dc, {
        name: `${dc.name} (Escaping Fleet)`,
        craftId: dc.id,
        mode: 'DEEP_SPACE' as ViewMode,
        type: 'deep-craft',
      });
      probeSymbol.position.copy(trajPts[1]);
      probeSymbol.scale.set(1.5, 1.5, 1.5);
      solarSystemGroup.add(probeSymbol);
      solarMeshes.push(probeSymbol);
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

    // 7h. Deep Space Group
    const deepSpaceGroup = new THREE.Group();
    deepSpaceGroupRef.current = deepSpaceGroup;
    scene.add(deepSpaceGroup);
    deepSpaceGroup.visible = false;

    // Outer heliosphere bubble
    const helioGeo = new THREE.SphereGeometry(30, 24, 24);
    const helioMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });
    deepSpaceGroup.add(new THREE.Mesh(helioGeo, helioMat));

    // Escaping deep space probes in deepSpaceGroup
    const deepSpaceInteractiveTargets: THREE.Object3D[] = [];
    deepSpaceCraft.forEach((dc) => {
      const angle = dc.trajectoryAngle ?? 0.7;
      const dist = 22;
      const pos = new THREE.Vector3(Math.cos(angle) * dist, Math.sin(angle * 0.3) * 6, Math.sin(angle) * dist);
      const symbol = createMonumentSymbol(dc);
      symbol.position.copy(pos);
      symbol.scale.set(1.4, 1.4, 1.4);
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

      if (solarSystemGroup.visible) {
        const intersects = raycaster.intersectObjects(solarMeshes, true);
        if (intersects.length > 0) {
          const obj = intersects[0].object;
          newHovered = obj.userData?.name || null;
        }
      } else {
        const targets = getActiveTargets();
        if (targets.length > 0) {
          const intersects = raycaster.intersectObjects(targets, true);
          if (intersects.length > 0) {
            let root = intersects[0].object;
            while (root.parent && !root.userData?.isLandingSite && !root.userData?.isLandmark) {
              root = root.parent;
            }
            if (root.userData?.siteData) {
              const label = getMonumentTypeLabel(root.userData.monumentType || getMonumentType(root.userData.siteData));
              newHovered = `${root.userData.siteData.name} (${label})`;
            } else if (root.userData?.landmarkData) {
              newHovered = `${root.userData.landmarkData.name} (Geological Landmark)`;
            }
          }
        }
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
        const intersects = raycaster.intersectObjects(solarMeshes, true);
        if (intersects.length > 0) {
          const obj = intersects[0].object;
          const targetMode = obj.userData?.mode as ViewMode | undefined;
          if (targetMode) {
            playWhooshSound();
            if (obj.userData?.craftId) {
              const matched = LANDING_SITES_3D.find((s) => s.id === obj.userData.craftId);
              if (matched) setSelectedDeepCraft(matched);
            }
            handleSelectViewMode(targetMode);
          }
        }
      } else {
        const targets = getActiveTargets();
        if (targets.length > 0) {
          const intersects = raycaster.intersectObjects(targets, true);
          if (intersects.length > 0) {
            let root = intersects[0].object;
            while (root.parent && !root.userData?.isLandingSite && !root.userData?.isLandmark) {
              root = root.parent;
            }
            if (root.userData?.siteData) {
              const site = root.userData.siteData as LandingSite3D;
              playSignalPing(720);
              setSelectedLandmark(null);
              setSelectedSite(site);
              if (site.body === 'mars' || site.body === 'moon') {
                focusLandingSite(site.lat, site.lon, true);
              } else if (site.body === 'deep-space') {
                setSelectedDeepCraft(site);
              }
              setSearchParams({ planet: site.body, target: site.id });
            } else if (root.userData?.landmarkData) {
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

  // Handle Radio Packet send in "Signal Travel Simulation"
  const handleSendRadio = () => {
    if (!radioInput.trim()) return;
    playSuccessChime();
    setRadioSent(true);
  };

  // Graceful WebGL Fallback UI for terminal failure
  if (webglError) {
    return (
      <div className="relative w-full min-h-[calc(100vh-70px)] bg-[#080D16] flex items-center justify-center p-6 text-center select-none">
        <div className="max-w-md p-8 rounded-3xl bg-[#101A29]/90 border border-[#C6A36B]/40 shadow-2xl backdrop-blur-xl">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#C6A36B]/15 border border-[#C6A36B] flex items-center justify-center text-2xl">
            🪐
          </div>
          <h2 className="font-display text-2xl text-[#F0E8D9] mb-2">3D Universe Unavailable</h2>
          <p className="text-xs text-[#B6C0CC] font-sans leading-relaxed mb-6 font-light">
            {webglError} You can still explore the full archive of abandoned spacecraft, photographic panoramas, and scientific dossiers in 2D mode.
          </p>
          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => navigate('/explore')}
              className="w-full py-2.5 rounded-xl bg-[#C6A36B] text-[#080D16] text-xs font-mono font-bold tracking-wider hover:brightness-110 transition-all uppercase"
            >
              EXPLORE ARTIFACT ARCHIVE →
            </button>
            <button
              onClick={() => navigate('/timeline')}
              className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-[#F0E8D9] text-xs font-mono tracking-wider hover:bg-white/10 transition-all uppercase"
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
          {viewMode !== 'SOLAR_SYSTEM' ? (
            <button
              onClick={() => handleSelectViewMode('SOLAR_SYSTEM')}
              aria-label="Back to Solar System Overview"
              className="px-3.5 py-2 rounded-full bg-[#101A29]/95 hover:bg-[#C6A36B] text-[#F0E8D9] hover:text-[#080D16] border border-[#C6A36B]/60 hover:border-transparent transition-all shadow-xl font-mono text-xs font-semibold tracking-wider flex items-center gap-1.5 group backdrop-blur-md shrink-0"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              <span className="hidden sm:inline">SOLAR SYSTEM</span>
            </button>
          ) : (
            <div className="px-3 py-1.5 rounded-full bg-[#101A29]/80 border border-white/10 text-[11px] font-mono text-[#B6C0CC] backdrop-blur-md hidden sm:block shrink-0">
              <span className="text-[#C6A36B] font-semibold">SOLAR SYSTEM</span>
            </div>
          )}

          {/* Real-time Mission and Place Search Bar */}
          <div className="relative flex-1">
            <div className="flex items-center rounded-full bg-[#101A29]/95 border border-[#C6A36B]/40 focus-within:border-[#C6A36B] px-3 py-1.5 backdrop-blur-md shadow-xl transition-all">
              <span className="text-[#C6A36B] mr-2 text-xs">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="Find mission or place..."
                className="bg-transparent border-none outline-none text-xs text-[#F0E8D9] placeholder-[#B6C0CC]/60 w-full font-sans"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-[#B6C0CC] hover:text-white text-xs ml-1"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Real-time Search Dropdown */}
            {isSearchFocused && searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-1.5 max-h-64 overflow-y-auto rounded-2xl bg-[#080D16]/98 border border-[#C6A36B]/60 shadow-2xl backdrop-blur-xl p-1.5 z-40">
                {searchResults.length === 0 ? (
                  <div className="p-3 text-center text-xs font-mono text-[#B6C0CC]/70">
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
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#C6A36B]/20 transition-all flex items-center gap-2.5 group"
                      >
                        <MonumentIcon type={type} className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-display text-[#F0E8D9] truncate group-hover:text-[#C6A36B]">
                            {name}
                          </div>
                          <div className="text-[10px] font-mono text-[#B6C0CC]/70 truncate">{sub}</div>
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

          {/* Visual Legend Toggle */}
          <button
            onClick={() => setIsLegendOpen(!isLegendOpen)}
            title="Visual guide to spacecraft symbols"
            className={`px-3 py-1.5 rounded-full border text-[11px] font-mono backdrop-blur-md shadow-md transition-all flex items-center gap-1.5 ${
              isLegendOpen
                ? 'bg-[#C6A36B] text-[#080D16] font-semibold border-[#C6A36B]'
                : 'bg-[#101A29]/90 border-white/15 text-[#B6C0CC] hover:text-[#F0E8D9]'
            }`}
          >
            <span>🧭</span>
            <span>LEGEND</span>
          </button>

          {/* Mars Landmarks Toggle (visible only on Mars) */}
          {viewMode === 'MARS' && (
            <button
              onClick={() => setShowLandmarks(!showLandmarks)}
              title="Toggle visibility of Martian mountains and craters"
              className={`px-3 py-1.5 rounded-full border text-[11px] font-mono backdrop-blur-md shadow-md transition-all flex items-center gap-1.5 ${
                showLandmarks
                  ? 'bg-[#38bdf8]/20 border-[#38bdf8]/60 text-[#38bdf8]'
                  : 'bg-[#101A29]/90 border-white/15 text-[#B6C0CC]'
              }`}
            >
              <span>🏔️</span>
              <span>LANDMARKS: {showLandmarks ? 'ON' : 'OFF'}</span>
            </button>
          )}
        </div>

        {/* Hover Target Badge */}
        {hoveredObject && (
          <div className="px-3.5 py-1.5 rounded-lg bg-[#080D16]/95 border border-[#C6A36B] text-xs font-display text-[#F0E8D9] tracking-wider shadow-xl animate-fadeIn">
            TARGET: <span className="text-[#C6A36B] font-semibold">{hoveredObject}</span>
            <span className="block text-[10px] font-mono text-[#B6C0CC]/70">CLICK TO EXAMINE EXHIBIT</span>
          </div>
        )}
      </div>

      {/* Visual Legend Dialog */}
      {isLegendOpen && (
        <div className="absolute top-[148px] left-4 z-40 w-72 sm:w-80 p-4 rounded-2xl bg-[#080D16]/98 border border-[#C6A36B]/60 shadow-2xl backdrop-blur-xl animate-fadeIn">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-base">🧭</span>
              <h4 className="font-display text-sm text-[#F0E8D9]">Spacecraft & Landmark Symbols</h4>
            </div>
            <button
              onClick={() => setIsLegendOpen(false)}
              className="text-xs p-1 rounded-full text-[#B6C0CC] hover:text-white"
              aria-label="Close Legend"
            >
              ✕
            </button>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3">
              <MonumentIcon type="rover" className="w-7 h-7 shrink-0" />
              <div>
                <div className="font-semibold text-[#F0E8D9]">Rover</div>
                <div className="text-[11px] text-[#B6C0CC] font-light">Wheeled robotic explorer (e.g. Curiosity, Perseverance, Opportunity)</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MonumentIcon type="lander" className="w-7 h-7 shrink-0" />
              <div>
                <div className="font-semibold text-[#F0E8D9]">Lander</div>
                <div className="text-[11px] text-[#B6C0CC] font-light">Stationary surface scientific station (e.g. Viking, InSight, Phoenix)</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MonumentIcon type="probe" className="w-7 h-7 shrink-0" />
              <div>
                <div className="font-semibold text-[#F0E8D9]">Orbiter / Deep-Space Probe</div>
                <div className="text-[11px] text-[#B6C0CC] font-light">Atmospheric entry, orbital, or escaping probe (e.g. Cassini, Voyager)</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MonumentIcon type="helicopter" className="w-7 h-7 shrink-0" />
              <div>
                <div className="font-semibold text-[#F0E8D9]">Helicopter</div>
                <div className="text-[11px] text-[#B6C0CC] font-light">Aerial rotorcraft scout (e.g. Ingenuity)</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MonumentIcon type="landmark" className="w-7 h-7 shrink-0" />
              <div>
                <div className="font-semibold text-[#38bdf8]">Geological Landmark</div>
                <div className="text-[11px] text-[#B6C0CC] font-light">Major volcanic peak, canyon, or crater (e.g. Olympus Mons)</div>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-white/10 text-[10px] font-mono text-[#C6A36B] text-center">
            Click or tap any 3D monument to inspect its museum exhibit
          </div>
        </div>
      )}

      {/* Top Center Responsive Destination Bar */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 max-w-[92vw] overflow-x-auto no-scrollbar p-1 rounded-full bg-[#080D16]/90 border border-white/10 backdrop-blur-md shadow-2xl flex items-center gap-1">
        {DESTINATIONS.map((item) => (
          <button
            key={item.mode}
            onClick={() => handleSelectViewMode(item.mode)}
            aria-label={`Switch view to ${item.label}`}
            className={`px-3 py-1.5 rounded-full text-xs font-medium tracking-wider whitespace-nowrap transition-all font-sans flex items-center gap-1 min-h-[36px] ${
              viewMode === item.mode
                ? 'bg-[#C6A36B] text-[#080D16] font-semibold shadow-lg'
                : 'text-[#B6C0CC] hover:text-white hover:bg-white/5'
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
          <div className="text-[10px] font-mono text-[#B6C0CC]/70 bg-[#080D16]/85 px-3 py-1.5 rounded-xl border border-[#C6A36B]/30 backdrop-blur-sm">
            🪨 Mercury: Authentic NASA MESSENGER Global Color Mosaic & cratered terrain.
          </div>
        )}
        {viewMode === 'VENUS' && (
          <div className="text-[10px] font-mono text-[#B6C0CC]/70 bg-[#080D16]/85 px-3 py-1.5 rounded-xl border border-[#C6A36B]/30 backdrop-blur-sm">
            🟡 Venus: Dense golden sulfuric acid cloud decks observed by Pioneer Venus & Akatsuki.
          </div>
        )}
        {viewMode === 'EARTH' && (
          <div className="text-[10px] font-mono text-[#B6C0CC]/70 bg-[#080D16]/85 px-3 py-1.5 rounded-xl border border-[#C6A36B]/30 backdrop-blur-sm">
            🌍 Earth: Authentic NASA Blue Marble with dynamic clouds, deep oceans, and coastlines.
          </div>
        )}
        {viewMode === 'MOON' && (
          <div className="text-[10px] font-mono text-[#B6C0CC]/70 bg-[#080D16]/85 px-3 py-1.5 rounded-xl border border-[#C6A36B]/30 backdrop-blur-sm">
            🌑 Moon: Authentic NASA Lunar Reconnaissance Orbiter (LRO) global albedo mosaic.
          </div>
        )}
        {viewMode === 'MARS' && (
          <div className="text-[10px] font-mono text-[#B6C0CC]/80 bg-[#080D16]/90 px-3 py-1.5 rounded-xl border border-[#C6A36B]/40 backdrop-blur-sm">
            🔴 Mars Surface: Authentic NASA Viking MDIM 2.1 Global Color Mosaic on spherical globe.
          </div>
        )}
        {viewMode === 'JUPITER' && (
          <div className="text-[10px] font-mono text-[#B6C0CC]/70 bg-[#080D16]/85 px-3 py-1.5 rounded-xl border border-[#C6A36B]/30 backdrop-blur-sm">
            🪐 Jupiter: Authentic NASA Cassini / Voyager Global Mosaic & Great Red Spot.
          </div>
        )}
        {viewMode === 'SATURN' && (
          <div className="text-[10px] font-mono text-[#B6C0CC]/70 bg-[#080D16]/85 px-3 py-1.5 rounded-xl border border-[#C6A36B]/30 backdrop-blur-sm">
            🪐 Saturn & Rings: Authentic NASA Cassini Cylindrical Mosaic & concentric ring divisions.
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
      {selectedSite && !selectedLandmark && (
        <div className="absolute top-16 right-3 sm:right-6 bottom-4 z-30 w-[calc(100vw-24px)] max-w-[420px] sm:w-[420px] bg-[#080D16]/95 border border-[#C6A36B]/60 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between overflow-y-auto animate-slideInRight">
          <div>
            {/* Header info */}
            <div className="flex items-start justify-between mb-4 pb-3 border-b border-white/10">
              <div className="flex items-start gap-3">
                <MonumentIcon type={getMonumentType(selectedSite)} className="w-9 h-9 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-mono font-semibold tracking-widest text-[#C6A36B] uppercase block">
                    {selectedSite.body.toUpperCase()} // {getMonumentTypeLabel(getMonumentType(selectedSite)).toUpperCase()}
                  </span>
                  <h2 className="font-display text-2xl text-[#F0E8D9] font-medium leading-tight mt-0.5">
                    {selectedSite.name}
                  </h2>
                  <div className="text-xs text-[#B6C0CC]/80 font-mono mt-0.5">
                    {selectedSite.designation}
                  </div>
                </div>
              </div>
              <button
                onClick={handleCloseDrawer}
                className="text-xs p-1.5 rounded-full border border-white/15 text-[#B6C0CC] hover:text-white hover:border-white/40 transition-colors"
                aria-label="Close Inspector"
              >
                ✕
              </button>
            </div>

            {/* Plain Language Museum Dossier */}
            <div className="bg-[#101A29]/80 rounded-2xl p-3.5 border border-white/5 mb-5 space-y-2 text-xs font-sans">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[#B6C0CC] font-mono text-[11px] whitespace-nowrap">LOCATION:</span>
                <span className="text-[#F0E8D9] font-medium text-right">{selectedSite.locationName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#B6C0CC] font-mono text-[11px]">TIMELINE:</span>
                <span className="text-[#F0E8D9] font-mono font-medium">
                  {selectedSite.year ? `Touchdown: ${selectedSite.year}` : 'Historical Flight'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#B6C0CC] font-mono text-[11px]">STATUS:</span>
                <span className="text-[#C6A36B] font-mono font-semibold">
                  {selectedSite.status}
                </span>
              </div>
              {selectedSite.distanceFromEarth && (
                <div className="flex items-center justify-between">
                  <span className="text-[#B6C0CC] font-mono text-[11px]">DISTANCE FROM EARTH:</span>
                  <span className="text-[#B6C0CC] font-mono text-[11px]">{selectedSite.distanceFromEarth}</span>
                </div>
              )}
            </div>

            {/* Special Saturn / Cassini atmospheric plunge notice */}
            {selectedSite.body === 'saturn' && (
              <div className="mb-4 p-3 rounded-xl bg-purple-900/25 border border-purple-500/40 text-xs font-sans text-purple-200">
                <div className="font-semibold text-purple-300 mb-1 flex items-center gap-1.5">
                  <span>🪐</span>
                  <span>The Grand Finale Plunge</span>
                </div>
                Cassini completed 22 daring dives between Saturn and its rings before intentional atmospheric entry on September 15, 2017, transmitting atmospheric data until its final seconds.
              </div>
            )}

            {/* Multi-Location Stations Listing (for Lunar Retroreflectors) */}
            {selectedSite.isMultiLocation && selectedSite.subLocations && (
              <div className="mb-4 p-3 rounded-xl bg-[#101A29]/90 border border-[#67e8f9]/30">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#67e8f9] font-bold block mb-2">
                  📡 DISTRIBUTED REFLECTOR STATIONS ({selectedSite.subLocations.length})
                </span>
                <div className="space-y-1.5">
                  {selectedSite.subLocations.map((sub, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => focusLandingSite(sub.lat, sub.lon, true)}
                      className="w-full text-left p-2 rounded-lg bg-black/40 hover:bg-[#67e8f9]/20 border border-white/5 transition-all text-xs font-sans flex items-center justify-between"
                    >
                      <span className="text-[#F0E8D9] font-medium">{sub.name}</span>
                      <span className="text-[#67e8f9] text-[10px] font-mono">View Site →</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Shared Location Notice (e.g. Ingenuity with Perseverance) */}
            {selectedSite.sharedWith && (
              <div className="mb-4 p-3 rounded-xl bg-[#C6A36B]/10 border border-[#C6A36B]/30 text-xs font-sans">
                <span className="text-[#C6A36B] font-bold block mb-0.5">🔗 SHARED EXPLORATION SITE</span>
                <span className="text-[#B6C0CC]">
                  Operated in conjunction with {selectedSite.sharedWith.toUpperCase()} across the Jezero Crater ancient river delta.
                </span>
              </div>
            )}

            {/* Accessible Narrative Story */}
            <div className="mb-5">
              <h3 className="text-xs font-mono tracking-wider text-[#C6A36B] uppercase mb-1.5">
                THE STORY
              </h3>
              <p className="text-sm font-sans text-[#F0E8D9]/90 leading-relaxed font-light">
                {selectedSite.description}
              </p>
            </div>

            {/* Why It Matters / Fascinating Discovery */}
            <div className="bg-[#C6A36B]/10 border-l-2 border-[#C6A36B] p-3.5 rounded-r-xl mb-6">
              <span className="text-[10px] font-mono font-bold text-[#C6A36B] tracking-wider uppercase block mb-1">
                💡 WHY IT MATTERS
              </span>
              <p className="text-xs font-serif italic text-[#F0E8D9] leading-relaxed">
                "{selectedSite.fascinatingFact}"
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-4 border-t border-white/10">
            {selectedSite.hasPanorama && (
              <button
                onClick={() => setIsPanoramaOpen(true)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#C6A36B] to-[#e0be88] text-[#080D16] font-sans text-xs tracking-[0.2em] font-semibold uppercase shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2"
              >
                <span>🔭 LOOK AROUND (360° PANORAMA)</span>
              </button>
            )}

            <button
              onClick={() => {
                playSignalPing(800);
                navigate(`/ghost/${selectedSite.id}`);
              }}
              className="w-full py-2.5 rounded-xl bg-[#F0E8D9]/5 hover:bg-[#F0E8D9]/15 text-[#F0E8D9] border border-[#F0E8D9]/20 transition-all text-xs font-sans tracking-[0.18em] uppercase font-medium text-center block"
            >
              EXPLORE FULL MISSION STORY →
            </button>

            <button
              onClick={handleCloseDrawer}
              className="w-full py-2 rounded-xl bg-transparent hover:bg-white/5 text-[#B6C0CC] hover:text-[#F0E8D9] transition-all text-[11px] font-mono tracking-wider uppercase text-center"
            >
              RETURN TO PLANET
            </button>
          </div>
        </div>
      )}

      {/* Deep Space: "Signal Travel Simulation" Drawer (Part A Fix) */}
      {viewMode === 'DEEP_SPACE' && !selectedSite && (
        <div className="absolute top-16 right-3 sm:right-6 z-30 w-[calc(100vw-24px)] max-w-[420px] sm:w-[420px] bg-[#080D16]/95 border border-[#38bdf8]/50 rounded-3xl p-6 shadow-2xl backdrop-blur-xl animate-fadeIn">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8] animate-ping" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#38bdf8]">
              EDUCATIONAL SIMULATION // SPEED OF LIGHT
            </span>
          </div>

          <h2 className="font-display text-2xl text-[#F0E8D9] font-medium leading-snug">
            Signal Travel Simulation
          </h2>
          <p className="text-xs text-[#B6C0CC] mt-1 leading-relaxed font-light">
            Calculates electromagnetic light-travel time based on documented astronomical distances.
            <span className="block mt-1 text-[#F0E8D9]/70 italic">
              Note: This is an educational demonstration. No real transmission occurs and this tool is not connected to NASA's Deep Space Network.
            </span>
          </p>

          {/* Spacecraft Target Selector (Single Source of Truth) */}
          <div className="mt-4">
            <label className="text-[11px] font-mono text-[#C6A36B] block mb-1">
              CHOOSE SPACECRAFT TARGET:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {LANDING_SITES_3D.filter((s) => s.body === 'deep-space').map((craft) => (
                <button
                  key={craft.id}
                  onClick={() => {
                    setSelectedDeepCraft(craft);
                    setRadioSent(false);
                  }}
                  className={`p-2 rounded-xl text-left border transition-all text-xs font-mono ${
                    selectedDeepCraft.id === craft.id
                      ? 'border-[#38bdf8] bg-[#38bdf8]/15 text-[#F0E8D9] font-bold'
                      : 'border-white/10 bg-white/5 text-[#B6C0CC] hover:border-white/20'
                  }`}
                >
                  <div className="truncate">{craft.name}</div>
                  <div className="text-[10px] text-[#38bdf8]">
                    {craft.distanceFromEarth?.split(' ')[0]}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Inactive Mission Receiver Status Banner */}
          {(selectedDeepCraft.id === 'pioneer-10' ||
            selectedDeepCraft.id === 'pioneer-11') && (
            <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] font-mono text-amber-300">
              ⚠️ MISSION CONCLUDED // NO OPERATIONAL RECEIVER
              <div className="text-[10px] text-[#B6C0CC] mt-0.5 font-sans">
                Spacecraft power depleted; no signals received since final decommissioning.
              </div>
            </div>
          )}

          {/* Transmit Message Input */}
          <div className="mt-4">
            <label className="text-[11px] font-mono text-[#B6C0CC] block mb-1">
              SIMULATE TRANSMISSION TO {selectedDeepCraft.name.toUpperCase()}:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={radioInput}
                onChange={(e) => setRadioInput(e.target.value)}
                placeholder="e.g. Humanity remembers your voyage..."
                className="flex-1 bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-[#F0E8D9] focus:outline-none focus:border-[#38bdf8]"
              />
              <button
                onClick={handleSendRadio}
                className="px-4 py-2 bg-[#38bdf8] text-[#080D16] font-mono text-xs font-bold rounded-xl hover:brightness-110 transition-all uppercase"
              >
                SIMULATE
              </button>
            </div>
          </div>

          {/* Delay Result Output */}
          {radioSent && (
            <div className="mt-4 p-4 rounded-xl bg-[#38bdf8]/10 border border-[#38bdf8]/40 animate-fadeIn">
              <div className="text-[11px] font-mono text-[#38bdf8] font-bold mb-1">
                ✓ SIMULATED RADIO PACKET PROPAGATING ACROSS SOLAR SYSTEM
              </div>
              <div className="text-sm font-display text-[#F0E8D9]">
                Theoretical one-way signal travel time:{' '}
                <span className="text-[#38bdf8] font-semibold">
                  {Math.round((selectedDeepCraft.lightDelaySeconds || 7200) / 3600)} hours{' '}
                  {Math.round(((selectedDeepCraft.lightDelaySeconds || 7200) % 3600) / 60)} minutes
                </span>{' '}
                across {selectedDeepCraft.distanceFromEarth}.
              </div>
              <p className="text-xs text-[#B6C0CC] mt-2 font-serif italic leading-relaxed">
                "{selectedDeepCraft.fascinatingFact}"
              </p>
              <div className="mt-3 pt-2 border-t border-white/10 flex justify-between items-center text-[10px] mono text-[#B6C0CC]">
                <span>
                  {selectedDeepCraft.referenceEpoch || 'APPROXIMATE REFERENCE DISTANCE // EDUCATIONAL DEMONSTRATION'}
                </span>
                <a
                  href="https://eyes.nasa.gov/dsn/dsn.html"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#38bdf8] underline hover:text-white"
                >
                  NASA DSN Live Status ↗
                </a>
              </div>
            </div>
          )}
        </div>
      )}



      {/* 360° Panorama Viewer Modal */}
      {selectedSite?.hasPanorama && (
        <PanoramaViewer
          isOpen={isPanoramaOpen}
          onClose={() => setIsPanoramaOpen(false)}
          title={selectedSite.panoramaTitle || `${selectedSite.name} Panoramic View`}
          subtitle={selectedSite.locationName}
          imageSrc={selectedSite.id === 'opportunity' ? heroOpportunity : heroSurveyor3}
          hotspots={
            selectedSite.id === 'opportunity'
              ? [
                  {
                    xPercent: 24,
                    yPercent: 62,
                    title: 'Perseverance Valley Descent Slope',
                    description: 'Opportunity traversed down this ancient water-carved valley rim into Endeavour Crater.',
                  },
                  {
                    xPercent: 54,
                    yPercent: 48,
                    title: 'Endeavour Crater Floor (Sol 5000)',
                    description: 'Looking across the vast 22-kilometer basin where clay minerals formed in neutral-pH liquid water.',
                  },
                  {
                    xPercent: 78,
                    yPercent: 70,
                    title: 'Rover Solar Array Tracks',
                    description: 'Wheel impressions etched into Martian dust during sol 5000 of the 90-day nominal mission.',
                  },
                ]
              : [
                  {
                    xPercent: 32,
                    yPercent: 55,
                    title: 'Surveyor 3 Television Camera',
                    description: 'Retrieved by Apollo 12 Commander Charles Conrad and returned to Earth for vacuum testing.',
                  },
                  {
                    xPercent: 65,
                    yPercent: 42,
                    title: 'Lunar Module Intrepid on Crater Rim',
                    description: 'Landed merely 180 meters away—the first pinpoint lunar landing in human history.',
                  },
                ]
          }
        />
      )}
    </div>
  );
};
