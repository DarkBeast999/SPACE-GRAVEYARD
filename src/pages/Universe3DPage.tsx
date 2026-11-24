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
  createMarsTexture,
  createJupiterTexture,
  createSaturnTexture,
  createSaturnRingTexture,
} from '../utils/planetTextures';
import { LANDING_SITES_3D, LandingSite3D } from '../data/landingSites3D';
import { PanoramaViewer } from '../components/PanoramaViewer';
import heroOpportunity from '../assets/hero-opportunity.jpg';
import heroSurveyor3 from '../assets/hero-surveyor3.jpg';
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

export const Universe3DPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const mountRef = useRef<HTMLDivElement>(null);

  const [webglError, setWebglError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return parsePlanetParam(searchParams.get('planet'));
  });

  const [selectedSite, setSelectedSite] = useState<LandingSite3D | null>(() => {
    const targetId = searchParams.get('target');
    if (targetId) {
      return LANDING_SITES_3D.find((s) => s.id === targetId) || null;
    }
    return null;
  });

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

  // Helper to focus camera on a landing site pin
  const focusLandingSite = useCallback(
    (site: LandingSite3D, smooth = true) => {
      const sitePos = latLonToVector3(site.lat, site.lon, 12.1);
      const normal = sitePos.clone().normalize();
      const targetCameraPos = normal.clone().multiplyScalar(28);
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

      // Reset hover
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

      // If a specific site is requested on Mars or Moon, focus directly to it
      if (focusSiteId && (mode === 'MARS' || mode === 'MOON')) {
        const site = LANDING_SITES_3D.find((s) => s.id === focusSiteId);
        if (site && site.body === mode.toLowerCase()) {
          setSelectedSite(site);
          focusLandingSite(site, true);
          return;
        }
      }

      // Otherwise glide to the standard view position
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

  // URL search params sync listener (Back/forward buttons & deep links)
  useEffect(() => {
    const p = searchParams.get('planet');
    const target = searchParams.get('target');
    const resolvedMode = parsePlanetParam(p);

    if (resolvedMode !== viewMode) {
      setViewMode(resolvedMode);
      applyViewMode(resolvedMode, target);
    } else if (target) {
      const match = LANDING_SITES_3D.find((s) => s.id === target);
      if (match && (!selectedSite || selectedSite.id !== match.id)) {
        setSelectedSite(match);
        if (match.body === 'mars' || match.body === 'moon') {
          focusLandingSite(match, true);
        }
      }
    }
  }, [searchParams, viewMode, applyViewMode, selectedSite, focusLandingSite]);

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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    const sunPointLight = new THREE.PointLight(0xfffaed, 2.4, 900);
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

    // Scaled planets for Solar System Overview (All 6 planets + Moon independent)
    const planetsConfig = [
      { name: 'Mercury', radius: 1.4, dist: 18, mode: 'MERCURY' as ViewMode, tex: createMercuryTexture },
      { name: 'Venus', radius: 2.2, dist: 28, mode: 'VENUS' as ViewMode, tex: createVenusTexture },
      { name: 'Earth', radius: 2.6, dist: 42, mode: 'EARTH' as ViewMode, tex: createEarthTexture, hasMoon: true },
      { name: 'Mars', radius: 1.9, dist: 58, mode: 'MARS' as ViewMode, tex: createMarsTexture },
      { name: 'Jupiter', radius: 5.2, dist: 88, mode: 'JUPITER' as ViewMode, tex: createJupiterTexture },
      { name: 'Saturn', radius: 4.2, dist: 122, mode: 'SATURN' as ViewMode, tex: createSaturnTexture, hasRings: true },
    ];

    const solarMeshes: THREE.Object3D[] = [];

    planetsConfig.forEach((p, idx) => {
      solarSystemGroup.add(createOrbitLine(p.dist));

      const pMesh = new THREE.Mesh(
        new THREE.SphereGeometry(p.radius, 32, 32),
        new THREE.MeshStandardMaterial({ map: p.tex(), roughness: 0.75 })
      );
      const angle = idx * 1.05 + 0.4;
      pMesh.position.set(Math.cos(angle) * p.dist, 0, Math.sin(angle) * p.dist);
      pMesh.userData = { name: p.name, mode: p.mode, type: 'planet' };
      solarSystemGroup.add(pMesh);
      solarMeshes.push(pMesh);

      // Dedicated Moon Mesh around Earth (Clickable directly to switch to MOON mode)
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

      // Saturn Rings in Overview
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
      { id: 'new-horizons', name: 'New Horizons', angle: 3.9, dist: 135, color: 0xf59e0b },
      { id: 'pioneer-10', name: 'Pioneer 10', angle: 5.2, dist: 125, color: 0xec4899 },
      { id: 'cassini', name: 'Cassini (Saturn)', angle: 5.85, dist: 122, color: 0xa855f7 },
    ];

    deepCraftsConfig.forEach((dc) => {
      // Dotted trajectory line
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
    // Helper to construct a standard globe group
    const createGlobe = (
      textureFn: () => THREE.CanvasTexture,
      radius = 12,
      roughness = 0.8
    ): { group: THREE.Group; mesh: THREE.Mesh } => {
      const group = new THREE.Group();
      group.visible = false;
      scene.add(group);

      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 64, 64),
        new THREE.MeshStandardMaterial({
          map: textureFn(),
          roughness,
          metalness: 0.05,
        })
      );
      group.add(mesh);
      return { group, mesh };
    };

    // 7a. Mercury
    const mercury = createGlobe(createMercuryTexture, 12, 0.85);
    mercuryGlobeGroupRef.current = mercury.group;

    // 7b. Venus
    const venus = createGlobe(createVenusTexture, 12, 0.65);
    venusGlobeGroupRef.current = venus.group;

    // 7c. Earth
    const earth = createGlobe(createEarthTexture, 12, 0.6);
    earthGlobeGroupRef.current = earth.group;
    // Atmosphere rim on Earth
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
    const moon = createGlobe(createMoonTexture, 12, 0.95);
    moonGlobeGroupRef.current = moon.group;

    // 7e. Mars
    const mars = createGlobe(createMarsTexture, 12, 0.85);
    marsGlobeGroupRef.current = mars.group;
    // Atmosphere rim on Mars
    const marsAtmo = new THREE.Mesh(
      new THREE.SphereGeometry(12.2, 32, 32),
      new THREE.MeshBasicMaterial({
        color: 0xe88a55,
        transparent: true,
        opacity: 0.14,
        side: THREE.BackSide,
      })
    );
    mars.group.add(marsAtmo);

    // 7f. Jupiter
    const jupiter = createGlobe(createJupiterTexture, 12, 0.7);
    jupiterGlobeGroupRef.current = jupiter.group;

    // 7g. Saturn (Globe + Rings)
    const saturn = createGlobe(createSaturnTexture, 11, 0.7);
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

    // Store rotating meshes for animation tick
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

    // 8. POPULATE LANDING PINS ON MARS & MOON
    LANDING_SITES_3D.forEach((site) => {
      if (site.body !== 'mars' && site.body !== 'moon') return;

      const pos = latLonToVector3(site.lat, site.lon, 12.15);

      // Pin stem
      const stemGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8);
      stemGeo.translate(0, 0.6, 0);
      const isMars = site.body === 'mars';
      const pinMat = new THREE.MeshBasicMaterial({
        color: isMars ? 0xffb703 : 0x00f0ff,
      });
      const stem = new THREE.Mesh(stemGeo, pinMat);

      // Pin head sphere
      const headGeo = new THREE.SphereGeometry(0.35, 12, 12);
      const headMat = new THREE.MeshBasicMaterial({
        color: isMars ? 0xffea00 : 0xffffff,
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

      if (isMars) {
        mars.group.add(stem);
      } else {
        moon.group.add(stem);
      }
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
        const pins: THREE.Object3D[] = [];
        group.traverse((c) => {
          if (c.userData?.isLandingSite) pins.push(c);
        });
        const intersects = raycaster.intersectObjects(pins, true);
        if (intersects.length > 0) {
          let root = intersects[0].object;
          while (root.parent && !root.userData?.isLandingSite) {
            root = root.parent;
          }
          if (root.userData?.siteData) {
            setHoveredObject(root.userData.siteData.name);
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
        const pins: THREE.Object3D[] = [];
        group.traverse((c) => {
          if (c.userData?.isLandingSite) pins.push(c);
        });
        const intersects = raycaster.intersectObjects(pins, true);
        if (intersects.length > 0) {
          let root = intersects[0].object;
          while (root.parent && !root.userData?.isLandingSite) {
            root = root.parent;
          }
          if (root.userData?.siteData) {
            const site = root.userData.siteData as LandingSite3D;
            playSignalPing(720);
            setSelectedSite(site);
            focusLandingSite(site, true);
            setSearchParams({ planet: site.body, target: site.id });
          }
        }
      }
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousemove', handlePointerMove);
    domEl.addEventListener('click', handleClick);

    // WebGL context loss listener
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      setWebglError('WebGL context was lost by your browser or graphics card.');
    };
    const handleContextRestored = () => {
      setWebglError(null);
    };
    domEl.addEventListener('webglcontextlost', handleContextLost, false);
    domEl.addEventListener('webglcontextrestored', handleContextRestored, false);

    // 10. ANIMATION TICK LOOP
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      // Rotate sun and active globes smoothly
      sunMesh.rotation.y += 0.002;
      rotatingMeshesRef.current.forEach((m) => {
        if (m.parent && m.parent.visible && m !== sunMesh) {
          m.rotation.y += 0.0006;
        }
      });

      // Handle ref-driven camera transition
      if (transitionRef.current) {
        const { startTime, duration, startPos, targetPos, startTarget, targetTarget, onComplete } =
          transitionRef.current;
        const elapsed = performance.now() - startTime;
        const t = Math.min(1, Math.max(0, elapsed / duration));

        // Ease-in-out cubic interpolation
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

    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      domEl.removeEventListener('mousemove', handlePointerMove);
      domEl.removeEventListener('click', handleClick);
      domEl.removeEventListener('webglcontextlost', handleContextLost);
      domEl.removeEventListener('webglcontextrestored', handleContextRestored);

      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

      // Deep disposal of scene objects, textures, and renderer
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          if (obj.geometry) obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((mat) => {
              if (mat.map) mat.map.dispose();
              mat.dispose();
            });
          } else if (obj.material) {
            if (obj.material.map) obj.material.map.dispose();
            obj.material.dispose();
          }
        }
      });

      renderer.dispose();
      if (mountEl.contains(domEl)) {
        mountEl.removeChild(domEl);
      }
    };
  }, []);

  // Handle Radio Packet send in "Can You Reach It?"
  const handleSendRadio = () => {
    if (!radioInput.trim()) return;
    playSuccessChime();
    setRadioSent(true);
  };

  // Graceful WebGL Fallback UI
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

      {/* Top Center Responsive Quick Destination Bar (Horizontally scrollable on mobile) */}
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

      {/* Scientific Transparency & Disclaimer Badge */}
      <div className="absolute bottom-4 right-4 z-20 hidden md:block max-w-sm pointer-events-none">
        {viewMode === 'SOLAR_SYSTEM' && (
          <div className="text-[10px] font-mono text-[#B6C0CC]/60 bg-[#080D16]/75 px-3 py-1.5 rounded-xl border border-white/5 backdrop-blur-sm">
            ℹ️ Solar System overview is an illustrative representation; planetary sizes and orbital distances are not to scale.
          </div>
        )}
        {viewMode === 'MERCURY' && (
          <div className="text-[10px] font-mono text-[#B6C0CC]/70 bg-[#080D16]/85 px-3 py-1.5 rounded-xl border border-[#C6A36B]/30 backdrop-blur-sm">
            🪨 Mercury Globe: Illustrative model generated via procedural texturing based on NASA MESSENGER imagery.
          </div>
        )}
        {viewMode === 'VENUS' && (
          <div className="text-[10px] font-mono text-[#B6C0CC]/70 bg-[#080D16]/85 px-3 py-1.5 rounded-xl border border-[#C6A36B]/30 backdrop-blur-sm">
            🟡 Venus Atmosphere: Dense cloud deck obscures surface (465°C, 92 bar). Venera landers crushed after transmission.
          </div>
        )}
        {viewMode === 'JUPITER' && (
          <div className="text-[10px] font-mono text-[#B6C0CC]/70 bg-[#080D16]/85 px-3 py-1.5 rounded-xl border border-[#C6A36B]/30 backdrop-blur-sm">
            🪐 Jupiter Globe: Illustrative model depicting atmospheric zonal bands and the Great Red Spot anticyclone.
          </div>
        )}
        {viewMode === 'SATURN' && (
          <div className="text-[10px] font-mono text-[#B6C0CC]/70 bg-[#080D16]/85 px-3 py-1.5 rounded-xl border border-[#C6A36B]/30 backdrop-blur-sm">
            🪐 Saturn & Rings: Illustrative model showing Cassini Division. Cassini plunged into atmosphere in Sept 2017.
          </div>
        )}
      </div>

      {/* Bottom Controls / Interaction Hint */}
      <div className="absolute bottom-4 left-4 z-20 hidden md:flex items-center gap-4 text-[11px] font-mono text-[#B6C0CC]/80 bg-[#080D16]/80 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
        <span>LEFT CLICK + DRAG: ROTATE</span>
        <span>•</span>
        <span>SCROLL: ZOOM IN / OUT</span>
        <span>•</span>
        <span>CLICK PLANET OR MARKER TO ENTER</span>
      </div>

      {/* Site Inspector Drawer (When Landing Site is Clicked) */}
      {selectedSite && (
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
                onClick={() => setSelectedSite(null)}
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
              <div className="text-[#B6C0CC] mt-1">
                TOUCHDOWN YEAR: <span className="text-[#F0E8D9]">{selectedSite.year}</span>
              </div>
              <div className="text-[#B6C0CC] mt-1">
                STATUS: <span className="text-[#C6A36B]">{selectedSite.status}</span>
              </div>
            </div>

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

      {/* Deep Space: "Can You Reach It?" Experience Drawer */}
      {viewMode === 'DEEP_SPACE' && !selectedSite && (
        <div className="absolute top-16 right-4 sm:right-6 z-30 w-[92%] sm:w-[420px] bg-[#080D16]/95 border border-[#38bdf8]/50 rounded-3xl p-6 shadow-2xl backdrop-blur-xl animate-fadeIn">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8] animate-ping" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#38bdf8]">
              RADIO DELAY EXPERIMENT //
            </span>
          </div>

          <h2 className="font-display text-2xl text-[#F0E8D9] font-medium leading-snug">
            Can You Reach It?
          </h2>
          <p className="text-xs text-[#B6C0CC] mt-1 leading-relaxed font-light">
            Even at the speed of light (300,000 km/s), electromagnetic radio messages take immense time to bridge the deep solar abyss.
          </p>

          {/* Spacecraft Target Selector */}
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
                  <div className="text-[10px] text-[#38bdf8]">{craft.distanceFromEarth?.split(' ')[0]}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Transmit Message Input */}
          <div className="mt-4">
            <label className="text-[11px] font-mono text-[#B6C0CC] block mb-1">
              TRANSMIT A MESSAGE TO {selectedDeepCraft.name.toUpperCase()}:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={radioInput}
                onChange={(e) => setRadioInput(e.target.value)}
                placeholder="e.g. Humanity remembers your journey..."
                className="flex-1 bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-[#F0E8D9] focus:outline-none focus:border-[#38bdf8]"
              />
              <button
                onClick={handleSendRadio}
                className="px-4 py-2 bg-[#38bdf8] text-[#080D16] font-mono text-xs font-bold rounded-xl hover:brightness-110 transition-all uppercase"
              >
                TRANSMIT
              </button>
            </div>
          </div>

          {/* Delay Result Output */}
          {radioSent && (
            <div className="mt-4 p-4 rounded-xl bg-[#38bdf8]/10 border border-[#38bdf8]/40 animate-fadeIn">
              <div className="text-[11px] font-mono text-[#38bdf8] font-bold mb-1">
                ✓ RADIO PACKET PROPAGATING THROUGH SPACE
              </div>
              <div className="text-sm font-display text-[#F0E8D9]">
                Your message takes{' '}
                <span className="text-[#38bdf8] font-semibold">
                  {Math.round((selectedDeepCraft.lightDelaySeconds || 7200) / 3600)} hours{' '}
                  {Math.round(((selectedDeepCraft.lightDelaySeconds || 7200) % 3600) / 60)} minutes
                </span>{' '}
                to reach {selectedDeepCraft.name}.
              </div>
              <p className="text-xs text-[#B6C0CC] mt-2 font-serif italic leading-relaxed">
                "{selectedDeepCraft.fascinatingFact}"
              </p>
              <div className="mt-3 pt-2 border-t border-white/10 flex justify-between items-center text-[10px] mono text-[#B6C0CC]">
                <span>GROUND STATIONS: NASA DSN</span>
                <a
                  href="https://eyes.nasa.gov/dsn/dsn.html"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#38bdf8] underline hover:text-white"
                >
                  NASA DSN Now ↗
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
