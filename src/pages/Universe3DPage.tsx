import React, { useEffect, useRef, useState, useCallback } from 'react';
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
  createMarsMolaTexture,
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

// Regional high-resolution Mars exploration tiles
import regionalOpportunity from '../assets/mars/regional/opportunity.jpg';
import regionalSpirit from '../assets/mars/regional/spirit.jpg';
import regionalCuriosity from '../assets/mars/regional/curiosity.jpg';
import regionalPerseverance from '../assets/mars/regional/perseverance.jpg';
import regionalIngenuity from '../assets/mars/regional/ingenuity.jpg';
import regionalViking1 from '../assets/mars/regional/viking-1.jpg';
import regionalViking2 from '../assets/mars/regional/viking-2.jpg';
import regionalPathfinder from '../assets/mars/regional/pathfinder.jpg';
import regionalPhoenix from '../assets/mars/regional/phoenix.jpg';
import regionalInsight from '../assets/mars/regional/insight.jpg';
import jezeroCtx from '../assets/mars/regional/jezero-ctx.png';
import curiosityCtx from '../assets/mars/regional/curiosity-ctx.png';

import { playSignalPing, playWhooshSound, playSuccessChime } from '../utils/audio';
import { formatCoordinates, normalizeLongitude } from '../utils/coordinateUtils';

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

const REGIONAL_IMAGES: Record<string, string> = {
  opportunity: regionalOpportunity,
  spirit: regionalSpirit,
  curiosity: regionalCuriosity,
  perseverance: regionalPerseverance,
  ingenuity: regionalIngenuity,
  'viking-1': regionalViking1,
  'viking-2': regionalViking2,
  pathfinder: regionalPathfinder,
  phoenix: regionalPhoenix,
  insight: regionalInsight,
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
  const [marsSurfaceMode, setMarsSurfaceMode] = useState<'VIKING_COLOR' | 'MOLA_TOPOGRAPHY'>('VIKING_COLOR');
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [showMapSourcesModal, setShowMapSourcesModal] = useState(false);

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
  const isContextLostRef = useRef(false);

  // Mars mesh and texture refs
  const marsGlobeMeshRef = useRef<THREE.Mesh | null>(null);
  const marsVikingTexRef = useRef<THREE.Texture | null>(null);
  const marsMolaTexRef = useRef<THREE.Texture | null>(null);
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

  // Helper: Spherical coordinate conversion with normalized longitude
  const latLonToVector3 = useCallback((lat: number, lon: number, radius = 12.1): THREE.Vector3 => {
    const normLon = normalizeLongitude(lon);
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (normLon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  }, []);

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
    [latLonToVector3, glideCamera]
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
    const resolvedMode = parsePlanetParam(p);

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
        }
      }
    } else if (!target && selectedSite) {
      setSelectedSite(null);
    }
  }, [searchParams, viewMode, applyViewMode, selectedSite, focusLandingSite]);

  // Handle Mars texture mode toggle (Viking Color vs MOLA Topography)
  const handleToggleMarsSurfaceMode = useCallback(() => {
    if (!marsGlobeMeshRef.current || !marsVikingTexRef.current || !marsMolaTexRef.current) return;
    const nextMode = marsSurfaceMode === 'VIKING_COLOR' ? 'MOLA_TOPOGRAPHY' : 'VIKING_COLOR';
    setMarsSurfaceMode(nextMode);

    const mat = marsGlobeMeshRef.current.material as THREE.MeshStandardMaterial;
    if (nextMode === 'MOLA_TOPOGRAPHY') {
      mat.map = marsMolaTexRef.current;
    } else {
      mat.map = marsVikingTexRef.current;
    }
    mat.needsUpdate = true;
    playSignalPing(600);
  }, [marsSurfaceMode]);

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
    mountEl.appendChild(renderer.domElement);

    // 3. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 600;
    controls.minDistance = 25;
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
    const marsMolaTex = createMarsMolaTexture();
    marsVikingTexRef.current = marsVikingTex;
    marsMolaTexRef.current = marsMolaTex;

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

    // Deep Space craft trajectories & markers in Solar System view
    const deepCraftsConfig = [
      { id: 'voyager-1', name: 'Voyager 1', angle: 0.7, dist: 165, color: 0x38bdf8 },
      { id: 'voyager-2', name: 'Voyager 2', angle: 2.4, dist: 145, color: 0x38bdf8 },
      { id: 'pioneer-10', name: 'Pioneer 10', angle: 5.2, dist: 135, color: 0xec4899 },
      { id: 'pioneer-11', name: 'Pioneer 11', angle: 4.6, dist: 115, color: 0xec4899 },
      { id: 'new-horizons', name: 'New Horizons', angle: 3.9, dist: 135, color: 0xf59e0b },
      { id: 'cassini', name: 'Cassini (Saturn)', angle: 5.85, dist: 122, color: 0xa855f7 },
    ];

    deepCraftsConfig.forEach((dc) => {
      const trajPts = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(Math.cos(dc.angle) * dc.dist, Math.sin(dc.angle * 0.3) * 15, Math.sin(dc.angle) * dc.dist),
      ];
      const trajGeo = new THREE.BufferGeometry().setFromPoints(trajPts);
      const trajMat = new THREE.LineDashedMaterial({
        color: dc.color,
        dashSize: 4,
        gapSize: 3,
        transparent: true,
        opacity: 0.6,
      });
      const line = new THREE.Line(trajGeo, trajMat);
      line.computeLineDistances();
      solarSystemGroup.add(line);

      // Marker diamond
      const markGeo = new THREE.OctahedronGeometry(1.3, 0);
      const markMat = new THREE.MeshBasicMaterial({ color: dc.color, wireframe: true });
      const marker = new THREE.Mesh(markGeo, markMat);
      marker.position.copy(trajPts[1]);
      marker.userData = {
        name: dc.name,
        craftId: dc.id,
        mode: 'DEEP_SPACE' as ViewMode,
        type: 'deep-craft',
      };
      solarSystemGroup.add(marker);
      solarMeshes.push(marker);
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

    // 7a. Mercury
    const mercury = createGlobe(createMercuryTexture(), 12, 0.85);
    mercuryGlobeGroupRef.current = mercury.group;

    // 7b. Venus
    const venus = createGlobe(createVenusTexture(), 12, 0.65);
    venusGlobeGroupRef.current = venus.group;

    // 7c. Earth
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

    // 7d. Moon
    const moon = createGlobe(createMoonTexture(), 12, 0.95);
    moonGlobeGroupRef.current = moon.group;

    // 7e. Mars — AUTHENTIC NASA VIKING 2048x1024 MAP + MOLA RELIEF!
    const marsGroup = new THREE.Group();
    marsGroup.visible = false;
    scene.add(marsGroup);
    marsGlobeGroupRef.current = marsGroup;

    // Mars spherical geometry with 128x128 subdivision for topographic displacement
    const marsGeo = new THREE.SphereGeometry(12, 128, 128);
    const marsMat = new THREE.MeshStandardMaterial({
      map: marsVikingTex,
      displacementMap: marsMolaTex,
      displacementScale: 0.35, // 1.5x subtle planetary vertical relief
      displacementBias: -0.15,
      roughness: 0.85,
      metalness: 0.05,
    });
    const marsGlobeMesh = new THREE.Mesh(marsGeo, marsMat);
    marsGroup.add(marsGlobeMesh);
    marsGlobeMeshRef.current = marsGlobeMesh;

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

    // Mars Landmarks Group (Olympus Mons, Valles Marineris, Hellas, etc.)
    const marsLandmarksGroup = new THREE.Group();
    marsLandmarksGroupRef.current = marsLandmarksGroup;
    marsGroup.add(marsLandmarksGroup);

    MARS_LANDMARKS.forEach((lm) => {
      const pos = latLonToVector3(lm.lat, lm.lon, 12.25);

      // Landmark diamond beacon
      const dGeo = new THREE.OctahedronGeometry(0.35, 0);
      const dMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const beacon = new THREE.Mesh(dGeo, dMat);
      beacon.position.copy(pos);
      beacon.userData = {
        isLandmark: true,
        landmarkData: lm,
      };
      marsLandmarksGroup.add(beacon);
    });

    // 7f. Jupiter
    const jupiter = createGlobe(createJupiterTexture(), 12, 0.7);
    jupiterGlobeGroupRef.current = jupiter.group;

    // 7g. Saturn (Globe + Rings)
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

    // Store rotating meshes
    rotatingMeshesRef.current = [
      sunMesh,
      mercury.mesh,
      venus.mesh,
      earth.mesh,
      moon.mesh,
      marsGlobeMesh,
      jupiter.mesh,
      saturn.mesh,
    ];

    // 8. POPULATE LANDING PINS & MULTI-LOCATION REFLECTORS
    LANDING_SITES_3D.forEach((site) => {
      if (site.body !== 'mars' && site.body !== 'moon') return;

      const isMars = site.body === 'mars';
      const targetGroup = isMars ? marsGroup : moon.group;

      // Handle multi-location artifacts (e.g. Lunar Laser Retroreflectors)
      if (site.isMultiLocation && site.subLocations) {
        site.subLocations.forEach((subLoc) => {
          const pos = latLonToVector3(subLoc.lat, subLoc.lon, 12.2);
          const prismGeo = new THREE.OctahedronGeometry(0.3, 0);
          const prismMat = new THREE.MeshBasicMaterial({ color: 0x67e8f9 });
          const prism = new THREE.Mesh(prismGeo, prismMat);
          prism.position.copy(pos);
          prism.userData = {
            isLandingSite: true,
            siteData: site,
            subLocation: subLoc,
          };
          targetGroup.add(prism);
        });
        return;
      }

      const pos = latLonToVector3(site.lat, site.lon, 12.2);

      // Pin stem
      const stemGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8);
      stemGeo.translate(0, 0.6, 0);
      const pinMat = new THREE.MeshBasicMaterial({
        color: isMars ? (site.id === 'ingenuity' ? 0xffea00 : 0xffb703) : 0x00f0ff,
      });
      const stem = new THREE.Mesh(stemGeo, pinMat);

      // Pin head sphere
      const headGeo = new THREE.SphereGeometry(0.35, 12, 12);
      const headMat = new THREE.MeshBasicMaterial({
        color: isMars ? (site.id === 'ingenuity' ? 0xffea00 : 0xffffff) : 0xffffff,
      });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.set(0, 1.2, 0);
      stem.add(head);

      // Align pin perpendicular to globe surface
      stem.position.copy(pos);
      stem.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize());

      stem.userData = {
        isLandingSite: true,
        siteData: site,
      };

      targetGroup.add(stem);
    });

    // 9. RAYCASTER & INTERACTION
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      if (solarSystemGroup.visible) {
        const intersects = raycaster.intersectObjects(solarMeshes, true);
        if (intersects.length > 0) {
          const obj = intersects[0].object;
          setHoveredObject(obj.userData?.name || null);
          mountEl.style.cursor = 'pointer';
        } else {
          setHoveredObject(null);
          mountEl.style.cursor = 'default';
        }
      } else if (marsGlobeGroupRef.current?.visible || moonGlobeGroupRef.current?.visible) {
        const group = marsGlobeGroupRef.current?.visible
          ? marsGlobeGroupRef.current
          : moonGlobeGroupRef.current!;

        const targets: THREE.Object3D[] = [];
        group.traverse((c) => {
          if (c.userData?.isLandingSite || (c.userData?.isLandmark && showLandmarks)) {
            targets.push(c);
          }
        });

        const intersects = raycaster.intersectObjects(targets, true);
        if (intersects.length > 0) {
          let root = intersects[0].object;
          while (root.parent && !root.userData?.isLandingSite && !root.userData?.isLandmark) {
            root = root.parent;
          }
          if (root.userData?.siteData) {
            setHoveredObject(root.userData.siteData.name);
            mountEl.style.cursor = 'pointer';
            return;
          } else if (root.userData?.landmarkData) {
            setHoveredObject(`🏔️ ${root.userData.landmarkData.name}`);
            mountEl.style.cursor = 'pointer';
            return;
          }
        }
        setHoveredObject(null);
        mountEl.style.cursor = 'default';
      }
    };

    const handleClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

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
      } else if (marsGlobeGroupRef.current?.visible || moonGlobeGroupRef.current?.visible) {
        const group = marsGlobeGroupRef.current?.visible
          ? marsGlobeGroupRef.current
          : moonGlobeGroupRef.current!;

        const targets: THREE.Object3D[] = [];
        group.traverse((c) => {
          if (c.userData?.isLandingSite || (c.userData?.isLandmark && showLandmarks)) {
            targets.push(c);
          }
        });

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
            focusLandingSite(site.lat, site.lon, true);
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

    // 10. ANIMATION TICK LOOP
    const animate = () => {
      if (isContextLostRef.current) return;
      animFrameRef.current = requestAnimationFrame(animate);

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
    };
    window.addEventListener('resize', handleResize);

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

      {/* Top Left Navigation Bar & Back Button */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 max-w-[280px]">
        {viewMode !== 'SOLAR_SYSTEM' ? (
          <button
            onClick={() => handleSelectViewMode('SOLAR_SYSTEM')}
            aria-label="Back to Solar System Overview"
            className="px-4 py-2 rounded-full bg-[#101A29]/95 hover:bg-[#C6A36B] text-[#F0E8D9] hover:text-[#080D16] border border-[#C6A36B]/60 hover:border-transparent transition-all shadow-xl font-mono text-xs font-semibold tracking-wider flex items-center gap-2 group backdrop-blur-md"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            <span>BACK TO SOLAR SYSTEM</span>
          </button>
        ) : (
          <div className="px-3.5 py-1.5 rounded-full bg-[#101A29]/80 border border-white/10 text-[11px] font-mono text-[#B6C0CC] backdrop-blur-md">
            <span>EXPLORATION MODE:</span>{' '}
            <span className="text-[#C6A36B] font-semibold">SOLAR SYSTEM OVERVIEW</span>
          </div>
        )}

        {/* Hover Target Badge */}
        {hoveredObject && (
          <div className="px-3.5 py-1.5 rounded-lg bg-[#080D16]/90 border border-[#C6A36B] text-xs font-display text-[#F0E8D9] tracking-wider shadow-xl animate-fadeIn">
            TARGET: <span className="text-[#C6A36B] font-semibold">{hoveredObject}</span>
            <span className="block text-[10px] font-mono text-[#B6C0CC]/70">CLICK TO EXAMINE</span>
          </div>
        )}
      </div>

      {/* Top Center Responsive Destination Bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 max-w-[92vw] overflow-x-auto no-scrollbar p-1 rounded-full bg-[#080D16]/90 border border-white/10 backdrop-blur-md shadow-2xl flex items-center gap-1">
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

      {/* Mars-Specific Explorer Toolbar */}
      {viewMode === 'MARS' && (
        <div className="absolute top-16 left-4 z-20 flex flex-wrap items-center gap-2">
          {/* Surface Mode Toggle */}
          <button
            onClick={handleToggleMarsSurfaceMode}
            className="px-3 py-1.5 rounded-xl bg-[#101A29]/90 hover:bg-[#C6A36B] text-[#F0E8D9] hover:text-[#080D16] border border-white/15 text-[11px] font-mono transition-all backdrop-blur-md flex items-center gap-1.5"
            title="Toggle between NASA Viking optical color and MGS MOLA elevation topography"
          >
            <span>🗺️ MAP:</span>
            <span className="font-bold text-[#C6A36B] group-hover:text-[#080D16]">
              {marsSurfaceMode === 'VIKING_COLOR' ? 'VIKING TRUE COLOR' : 'MOLA TOPOGRAPHY'}
            </span>
          </button>

          {/* Landmarks Toggle */}
          <button
            onClick={() => setShowLandmarks(!showLandmarks)}
            className={`px-3 py-1.5 rounded-xl border text-[11px] font-mono transition-all backdrop-blur-md flex items-center gap-1.5 ${
              showLandmarks
                ? 'bg-[#38bdf8]/15 border-[#38bdf8]/60 text-[#38bdf8]'
                : 'bg-[#101A29]/90 border-white/15 text-[#B6C0CC]'
            }`}
          >
            <span>🏔️ LANDMARKS:</span>
            <span className="font-bold">{showLandmarks ? 'ON' : 'OFF'}</span>
          </button>

          {/* Map Provenance Information Button */}
          <button
            onClick={() => setShowMapSourcesModal(true)}
            className="px-3 py-1.5 rounded-xl bg-[#101A29]/90 hover:bg-white/10 border border-white/15 text-[11px] font-mono text-[#B6C0CC] transition-all backdrop-blur-md"
          >
            ℹ️ DATA PROVENANCE
          </button>
        </div>
      )}

      {/* Scientific Transparency & Disclaimer Badges */}
      <div className="absolute bottom-4 right-4 z-20 hidden md:block max-w-sm pointer-events-none">
        {viewMode === 'SOLAR_SYSTEM' && (
          <div className="text-[10px] font-mono text-[#B6C0CC]/60 bg-[#080D16]/75 px-3 py-1.5 rounded-xl border border-white/5 backdrop-blur-sm">
            ℹ️ Solar System overview is an illustrative representation; planetary sizes and orbital distances are not to scale.
          </div>
        )}
        {viewMode === 'MERCURY' && (
          <div className="text-[10px] font-mono text-[#B6C0CC]/70 bg-[#080D16]/85 px-3 py-1.5 rounded-xl border border-[#C6A36B]/30 backdrop-blur-sm">
            🪨 Mercury: Procedural illustrative model informed by surface features documented by NASA's MESSENGER mission. Not a spacecraft image or scientific surface mosaic.
          </div>
        )}
        {viewMode === 'VENUS' && (
          <div className="text-[10px] font-mono text-[#B6C0CC]/70 bg-[#080D16]/85 px-3 py-1.5 rounded-xl border border-[#C6A36B]/30 backdrop-blur-sm">
            🟡 Venus: Procedural atmospheric haze model representing dense sulfuric acid cloud decks documented by Pioneer Venus and Magellan radar.
          </div>
        )}
        {viewMode === 'MARS' && (
          <div className="text-[10px] font-mono text-[#B6C0CC]/80 bg-[#080D16]/90 px-3 py-1.5 rounded-xl border border-[#C6A36B]/40 backdrop-blur-sm">
            🔴 Mars Surface: Authentic NASA Viking MDIM 2.1 Global Color Mosaic (232 m/px) & MGS MOLA elevation topography (1.5× vertical relief).
          </div>
        )}
        {viewMode === 'JUPITER' && (
          <div className="text-[10px] font-mono text-[#B6C0CC]/70 bg-[#080D16]/85 px-3 py-1.5 rounded-xl border border-[#C6A36B]/30 backdrop-blur-sm">
            🪐 Jupiter: Procedural illustrative model depicting dynamic zonal belts and Great Red Spot anticyclone informed by NASA Juno and Cassini observations.
          </div>
        )}
        {viewMode === 'SATURN' && (
          <div className="text-[10px] font-mono text-[#B6C0CC]/70 bg-[#080D16]/85 px-3 py-1.5 rounded-xl border border-[#C6A36B]/30 backdrop-blur-sm">
            🪐 Saturn & Rings: Procedural illustrative model depicting atmospheric bands and Cassini Division ring gap informed by Voyager and Cassini imagery.
          </div>
        )}
      </div>

      {/* Bottom Controls / Interaction Hint */}
      <div className="absolute bottom-4 left-4 z-20 hidden md:flex items-center gap-4 text-[11px] font-mono text-[#B6C0CC]/80 bg-[#080D16]/80 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
        <span>LEFT CLICK + DRAG: ROTATE</span>
        <span>•</span>
        <span>SCROLL: ZOOM IN / OUT</span>
        <span>•</span>
        <span>CLICK LANDMARK OR LANDING SITE TO ENTER</span>
      </div>

      {/* Mars Landmark Information Drawer */}
      {selectedLandmark && (
        <div className="absolute top-16 right-4 sm:right-6 bottom-4 z-30 w-[92%] sm:w-[420px] bg-[#080D16]/95 border border-[#38bdf8]/60 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between overflow-y-auto animate-slideInRight">
          <div>
            <div className="flex items-start justify-between mb-4 pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] mono font-semibold tracking-widest text-[#38bdf8] uppercase block">
                  GEOLOGICAL FEATURE // {selectedLandmark.type.toUpperCase()}
                </span>
                <h2 className="font-display text-2xl text-[#F0E8D9] font-medium leading-tight mt-1">
                  {selectedLandmark.name}
                </h2>
              </div>
              <button
                onClick={handleCloseDrawer}
                className="text-xs p-1.5 rounded-full border border-white/15 text-[#B6C0CC] hover:text-white hover:border-white/40 transition-colors"
                aria-label="Close Landmark Inspector"
              >
                ✕
              </button>
            </div>

            {/* Coordinates & Elevation */}
            <div className="bg-[#101A29]/80 rounded-xl p-3 border border-white/5 mb-4 text-xs font-mono">
              <div className="text-[#38bdf8] font-medium mb-1">
                📍 MARTIAN COORDINATES: {formatCoordinates({ lat: selectedLandmark.lat, lon: selectedLandmark.lon })}
              </div>
              <div className="text-[#B6C0CC]">
                ELEVATION:{' '}
                <span className="text-[#F0E8D9]">
                  {selectedLandmark.elevationKm > 0 ? `+${selectedLandmark.elevationKm}` : selectedLandmark.elevationKm} km above Martian datum
                </span>
              </div>
            </div>

            {/* Geological Description */}
            <div className="mb-5">
              <h3 className="text-xs font-mono tracking-wider text-[#38bdf8] uppercase mb-1.5">
                GEOLOGICAL SIGNIFICANCE
              </h3>
              <p className="text-sm font-sans text-[#F0E8D9]/90 leading-relaxed font-light">
                {selectedLandmark.description}
              </p>
            </div>

            {/* Discovery Quote */}
            <div className="bg-[#38bdf8]/10 border-l-2 border-[#38bdf8] p-3.5 rounded-r-xl mb-6">
              <span className="text-[10px] mono font-bold text-[#38bdf8] tracking-wider uppercase block mb-1">
                💡 GEOLOGICAL DISCOVERY
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
            RETURN TO PLANETARY VIEW
          </button>
        </div>
      )}

      {/* Site Inspector Drawer (When Landing Site is Clicked) */}
      {selectedSite && !selectedLandmark && (
        <div className="absolute top-16 right-4 sm:right-6 bottom-4 z-30 w-[92%] sm:w-[420px] bg-[#080D16]/95 border border-[#C6A36B]/60 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between overflow-y-auto animate-slideInRight">
          <div>
            {/* Header info */}
            <div className="flex items-start justify-between mb-4 pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] mono font-semibold tracking-widest text-[#C6A36B] uppercase block">
                  EXPLORATION DOSSIER // {selectedSite.body.toUpperCase()}
                </span>
                <h2 className="font-display text-2xl text-[#F0E8D9] font-medium leading-tight mt-1">
                  {selectedSite.name}
                </h2>
                <div className="text-xs text-[#B6C0CC]/80 font-mono mt-0.5">
                  {selectedSite.designation}
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

            {/* Coordinates & Location */}
            <div className="bg-[#101A29]/80 rounded-xl p-3 border border-white/5 mb-4 text-xs font-mono">
              <div className="text-[#C6A36B] font-medium mb-1">
                📍 {selectedSite.locationName}
              </div>
              <div className="text-[#B6C0CC]">
                COORDINATES:{' '}
                <span className="text-[#F0E8D9]">
                  {formatCoordinates({ lat: selectedSite.lat, lon: selectedSite.lon })}
                </span>
              </div>
              {selectedSite.elevationKm !== undefined && (
                <div className="text-[#B6C0CC] mt-1">
                  DATUM ELEVATION: <span className="text-[#F0E8D9]">{selectedSite.elevationKm} km</span>
                </div>
              )}
              <div className="text-[#B6C0CC] mt-1">
                TOUCHDOWN YEAR: <span className="text-[#F0E8D9]">{selectedSite.year}</span>
              </div>
              <div className="text-[#B6C0CC] mt-1">
                STATUS: <span className="text-[#C6A36B]">{selectedSite.status}</span>
              </div>
            </div>

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
                      className="w-full text-left p-1.5 rounded-lg bg-black/40 hover:bg-[#67e8f9]/20 border border-white/5 transition-all text-[11px] font-mono flex items-center justify-between"
                    >
                      <span className="text-[#F0E8D9]">{sub.name}</span>
                      <span className="text-[#67e8f9] text-[10px]">
                        {formatCoordinates({ lat: sub.lat, lon: sub.lon })}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Shared Location Notice (e.g. Ingenuity with Perseverance) */}
            {selectedSite.sharedWith && (
              <div className="mb-4 p-3 rounded-xl bg-[#C6A36B]/10 border border-[#C6A36B]/30 text-xs font-mono">
                <span className="text-[#C6A36B] font-bold block mb-0.5">🔗 SHARED MISSION AREA</span>
                <span className="text-[#B6C0CC]">
                  Operated in conjunction with the {selectedSite.sharedWith.toUpperCase()} exploration site at Jezero Crater.
                </span>
              </div>
            )}

            {/* Regional High-Resolution Orbital Reconnaissance (Part B) */}
            {selectedSite.body === 'mars' && REGIONAL_IMAGES[selectedSite.id] && (
              <div className="mb-4 rounded-xl overflow-hidden border border-white/10 bg-[#101A29]">
                <div className="p-2 border-b border-white/10 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[#C6A36B] font-semibold">
                    🛰️ REGIONAL RECONNAISSANCE ({selectedSite.id === 'perseverance' ? 'MRO CTX 6 m/px' : 'NASA Viking MDIM 2.1'})
                  </span>
                  <span className="text-[#B6C0CC]">FOV ~300 KM</span>
                </div>
                <div className="relative h-36 w-full overflow-hidden">
                  <img
                    src={selectedSite.id === 'perseverance' ? jezeroCtx : (selectedSite.id === 'curiosity' ? curiosityCtx : REGIONAL_IMAGES[selectedSite.id])}
                    alt={`${selectedSite.name} regional reconnaissance`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                    <span className="text-[10px] font-mono text-[#F0E8D9] bg-black/60 px-2 py-0.5 rounded">
                      Authentic orbital tile: {selectedSite.locationName}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Accessible Narrative Story */}
            <div className="mb-5">
              <h3 className="text-xs font-mono tracking-wider text-[#C6A36B] uppercase mb-1.5">
                WHAT HAPPENED TO IT?
              </h3>
              <p className="text-sm font-sans text-[#F0E8D9]/90 leading-relaxed font-light">
                {selectedSite.description}
              </p>
            </div>

            {/* Fascinating Discovery */}
            <div className="bg-[#C6A36B]/10 border-l-2 border-[#C6A36B] p-3.5 rounded-r-xl mb-6">
              <span className="text-[10px] mono font-bold text-[#C6A36B] tracking-wider uppercase block mb-1">
                💡 FASCINATING DISCOVERY
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
          </div>
        </div>
      )}

      {/* Deep Space: "Signal Travel Simulation" Drawer (Part A Fix) */}
      {viewMode === 'DEEP_SPACE' && !selectedSite && (
        <div className="absolute top-16 right-4 sm:right-6 z-30 w-[92%] sm:w-[420px] bg-[#080D16]/95 border border-[#38bdf8]/50 rounded-3xl p-6 shadow-2xl backdrop-blur-xl animate-fadeIn">
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
            selectedDeepCraft.id === 'pioneer-11' ||
            selectedDeepCraft.id === 'cassini') && (
            <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] font-mono text-amber-300">
              ⚠️ MISSION CONCLUDED // NO OPERATIONAL RECEIVER
              <div className="text-[10px] text-[#B6C0CC] mt-0.5 font-sans">
                {selectedDeepCraft.id === 'cassini'
                  ? 'Spacecraft disintegrated into Saturn upper atmosphere on September 15, 2017.'
                  : 'Spacecraft power depleted; no signals received since final decommissioning.'}
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
                <span>REFERENCE DISTANCE: JPL HORIZONS EPHEMERIS</span>
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

      {/* Map Data Provenance & Sources Modal (Part B & C) */}
      {showMapSourcesModal && (
        <div className="absolute inset-0 z-50 bg-[#080D16]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-[#101A29] border border-[#C6A36B]/60 rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[85vh]">
            <div className="flex items-start justify-between pb-3 border-b border-white/10 mb-4">
              <div>
                <span className="text-[10px] font-mono text-[#C6A36B] tracking-wider uppercase block">
                  SCIENTIFIC DATA PROVENANCE //
                </span>
                <h3 className="font-display text-2xl text-[#F0E8D9]">Mars Planetary Map Sources</h3>
              </div>
              <button
                onClick={() => setShowMapSourcesModal(false)}
                className="text-xs p-1.5 rounded-full border border-white/15 text-[#B6C0CC] hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs font-sans text-[#B6C0CC] leading-relaxed">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <span className="font-mono text-[#C6A36B] font-bold block mb-1">
                  1. GLOBAL SURFACE COLOR MOSAIC
                </span>
                <p>
                  <strong className="text-[#F0E8D9]">Product:</strong> Mars Viking MDIM 2.1 Color Mosaic (NASA / USGS Astrogeology).
                  <br />
                  <strong className="text-[#F0E8D9]">Resolution:</strong> 232 meters/pixel (downsampled to 2048×1024 equirectangular projection for real-time 60fps performance).
                  <br />
                  <strong className="text-[#F0E8D9]">Projection:</strong> Simple Cylindrical (Equirectangular, Center Longitude = 0°).
                  <br />
                  <strong className="text-[#F0E8D9]">License / Source:</strong> Public Domain / NASA Solar System Treks.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <span className="font-mono text-[#C6A36B] font-bold block mb-1">
                  2. TOPOGRAPHY & 3D TERRAIN RELIEF
                </span>
                <p>
                  <strong className="text-[#F0E8D9]">Product:</strong> Mars Global Surveyor MOLA (Mars Orbiter Laser Altimeter) Global DEM & Color Hillshade.
                  <br />
                  <strong className="text-[#F0E8D9]">Resolution:</strong> 463 meters/pixel.
                  <br />
                  <strong className="text-[#F0E8D9]">Vertical Exaggeration:</strong> 1.5× vertical relief displacement applied to the 128×128 vertex sphere mesh to reveal authentic geological elevations (Olympus Mons, Tharsis, Valles Marineris, Hellas Basin).
                </p>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <span className="font-mono text-[#C6A36B] font-bold block mb-1">
                  3. REGIONAL RECONNAISSANCE MOSAICS
                </span>
                <p>
                  <strong className="text-[#F0E8D9]">Jezero Crater:</strong> MRO CTX Orthorctified Mosaic (6 meters/pixel) covering river delta and Perseverance traverse.
                  <br />
                  <strong className="text-[#F0E8D9]">Gale Crater:</strong> MRO CTX Curiosity Roving Site Mosaic (6 meters/pixel).
                  <br />
                  <strong className="text-[#F0E8D9]">Meridiani, Gusev, Chryse, Elysium:</strong> NASA Viking / MRO regional orthomosaics.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <span className="font-mono text-[#C6A36B] font-bold block mb-1">
                  4. OFFLINE BUNDLE INTEGRITY
                </span>
                <p>
                  All planetary map textures and regional reconnaissance mosaics are self-contained within the application build, enabling complete offline exploration in the standalone single-file distribution without external network dependencies.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-white/10 text-right">
              <button
                onClick={() => setShowMapSourcesModal(false)}
                className="px-5 py-2 rounded-xl bg-[#C6A36B] text-[#080D16] font-mono text-xs font-bold uppercase hover:brightness-110"
              >
                CLOSE
              </button>
            </div>
          </div>
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
