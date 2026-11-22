import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  createSunTexture,
  createMarsTexture,
  createMoonTexture,
  createVenusTexture,
  createEarthTexture,
  createSaturnTexture,
  createSaturnRingTexture,
} from '../utils/planetTextures';
import { LANDING_SITES_3D, LandingSite3D } from '../data/landingSites3D';
import { PanoramaViewer } from '../components/PanoramaViewer';
import heroOpportunity from '../assets/hero-opportunity.jpg';
import heroSurveyor3 from '../assets/hero-surveyor3.jpg';
import { playSignalPing, playWhooshSound, playSuccessChime } from '../utils/audio';
import { formatCoordinates } from '../utils/coordinateUtils';

type ViewMode = 'SOLAR_SYSTEM' | 'MARS' | 'MOON' | 'VENUS' | 'DEEP_SPACE';

export const Universe3DPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const mountRef = useRef<HTMLDivElement>(null);

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const p = searchParams.get('planet');
    if (p === 'mars') return 'MARS';
    if (p === 'moon') return 'MOON';
    if (p === 'venus') return 'VENUS';
    if (p === 'deep-space') return 'DEEP_SPACE';
    return 'SOLAR_SYSTEM';
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
  const markersGroupRef = useRef<THREE.Group | null>(null);
  const solarSystemGroupRef = useRef<THREE.Group | null>(null);
  const marsGlobeGroupRef = useRef<THREE.Group | null>(null);
  const moonGlobeGroupRef = useRef<THREE.Group | null>(null);
  const venusGlobeGroupRef = useRef<THREE.Group | null>(null);
  const deepSpaceGroupRef = useRef<THREE.Group | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Sync url param
  useEffect(() => {
    const p = searchParams.get('planet');
    const target = searchParams.get('target');
    if (p === 'mars' && viewMode !== 'MARS') setViewMode('MARS');
    else if (p === 'moon' && viewMode !== 'MOON') setViewMode('MOON');
    else if (p === 'deep-space' && viewMode !== 'DEEP_SPACE') setViewMode('DEEP_SPACE');
    if (target) {
      const match = LANDING_SITES_3D.find((s) => s.id === target);
      if (match) setSelectedSite(match);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!mountRef.current) return;
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x060911);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 3000);
    camera.position.set(0, 85, 170);
    cameraRef.current = camera;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // 3. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 600;
    controls.minDistance = 14;
    controlsRef.current = controls;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const sunPointLight = new THREE.PointLight(0xfffaed, 2.2, 800);
    sunPointLight.position.set(0, 0, 0);
    scene.add(sunPointLight);

    const directionalFill = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalFill.position.set(50, 40, 50);
    scene.add(directionalFill);

    // 5. Starfield background
    const starCount = 2000;
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
    sunMesh.userData = { name: 'Sun', type: 'star' };
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

    // Planets data for Solar System View
    const planetsConfig = [
      { name: 'Mercury', radius: 1.4, dist: 18, color: 0x9e9e9e, mode: null },
      { name: 'Venus', radius: 2.2, dist: 28, color: 0xe8c582, mode: 'VENUS' as ViewMode },
      { name: 'Earth', radius: 2.6, dist: 42, color: 0x3b82f6, mode: 'MOON' as ViewMode, hasMoon: true },
      { name: 'Mars', radius: 1.9, dist: 58, color: 0xc45729, mode: 'MARS' as ViewMode },
      { name: 'Jupiter', radius: 5.2, dist: 88, color: 0xd97706, mode: null },
      { name: 'Saturn', radius: 4.2, dist: 122, color: 0xd4a855, mode: null, hasRings: true },
    ];

    const planetMeshes: THREE.Mesh[] = [];

    planetsConfig.forEach((p, idx) => {
      solarSystemGroup.add(createOrbitLine(p.dist));

      let mat: THREE.Material;
      if (p.name === 'Mars') {
        mat = new THREE.MeshStandardMaterial({ map: createMarsTexture(), roughness: 0.8 });
      } else if (p.name === 'Venus') {
        mat = new THREE.MeshStandardMaterial({ map: createVenusTexture(), roughness: 0.7 });
      } else if (p.name === 'Earth') {
        mat = new THREE.MeshStandardMaterial({ map: createEarthTexture(), roughness: 0.6 });
      } else if (p.name === 'Saturn') {
        mat = new THREE.MeshStandardMaterial({ map: createSaturnTexture(), roughness: 0.7 });
      } else {
        mat = new THREE.MeshStandardMaterial({ color: p.color, roughness: 0.8 });
      }

      const pMesh = new THREE.Mesh(new THREE.SphereGeometry(p.radius, 32, 32), mat);
      // Stagger initial positions along orbit
      const angle = (idx * 1.05) + 0.4;
      pMesh.position.set(Math.cos(angle) * p.dist, 0, Math.sin(angle) * p.dist);
      pMesh.userData = { name: p.name, mode: p.mode, type: 'planet' };
      solarSystemGroup.add(pMesh);
      planetMeshes.push(pMesh);

      // Moon around Earth
      if (p.hasMoon) {
        const moonMesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.7, 16, 16),
          new THREE.MeshStandardMaterial({ map: createMoonTexture(), roughness: 0.9 })
        );
        moonMesh.position.set(pMesh.position.x + 4.5, 0.8, pMesh.position.z + 2.5);
        moonMesh.userData = { name: 'The Moon', mode: 'MOON', type: 'moon' };
        solarSystemGroup.add(moonMesh);
        planetMeshes.push(moonMesh);
      }

      // Saturn Rings
      if (p.hasRings) {
        const ringGeo = new THREE.RingGeometry(p.radius * 1.4, p.radius * 2.3, 48);
        // Rotate flat
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

    // Deep Space craft trajectory lines in Solar System view
    const deepCrafts = [
      { name: 'Voyager 1', angle: 0.7, dist: 165, color: 0x38bdf8 },
      { name: 'Voyager 2', angle: 2.4, dist: 145, color: 0x38bdf8 },
      { name: 'New Horizons', angle: 3.9, dist: 135, color: 0xf59e0b },
      { name: 'Pioneer 10', angle: 5.2, dist: 125, color: 0xec4899 },
    ];
    deepCrafts.forEach((dc) => {
      // Dotted trajectory
      const trajPts = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(Math.cos(dc.angle) * dc.dist, Math.sin(dc.angle * 0.3) * 15, Math.sin(dc.angle) * dc.dist),
      ];
      const trajGeo = new THREE.BufferGeometry().setFromPoints(trajPts);
      const trajMat = new THREE.LineDashedMaterial({ color: dc.color, dashSize: 4, gapSize: 3, transparent: true, opacity: 0.6 });
      const line = new THREE.Line(trajGeo, trajMat);
      line.computeLineDistances();
      solarSystemGroup.add(line);

      // Marker diamond
      const markGeo = new THREE.OctahedronGeometry(1.2, 0);
      const markMat = new THREE.MeshBasicMaterial({ color: dc.color, wireframe: true });
      const marker = new THREE.Mesh(markGeo, markMat);
      marker.position.copy(trajPts[1]);
      marker.userData = { name: dc.name, mode: 'DEEP_SPACE', type: 'deep-craft' };
      solarSystemGroup.add(marker);
      planetMeshes.push(marker);
    });

    // 7. BUILD MARS GLOBE GROUP
    const marsGlobeGroup = new THREE.Group();
    marsGlobeGroupRef.current = marsGlobeGroup;
    scene.add(marsGlobeGroup);
    marsGlobeGroup.visible = false;

    const marsGlobeMesh = new THREE.Mesh(
      new THREE.SphereGeometry(12, 64, 64),
      new THREE.MeshStandardMaterial({
        map: createMarsTexture(),
        roughness: 0.85,
        metalness: 0.1,
      })
    );
    marsGlobeGroup.add(marsGlobeMesh);

    // 8. BUILD MOON GLOBE GROUP
    const moonGlobeGroup = new THREE.Group();
    moonGlobeGroupRef.current = moonGlobeGroup;
    scene.add(moonGlobeGroup);
    moonGlobeGroup.visible = false;

    const moonGlobeMesh = new THREE.Mesh(
      new THREE.SphereGeometry(12, 64, 64),
      new THREE.MeshStandardMaterial({
        map: createMoonTexture(),
        roughness: 0.95,
      })
    );
    moonGlobeGroup.add(moonGlobeMesh);

    // 9. BUILD VENUS GLOBE GROUP
    const venusGlobeGroup = new THREE.Group();
    venusGlobeGroupRef.current = venusGlobeGroup;
    scene.add(venusGlobeGroup);
    venusGlobeGroup.visible = false;

    const venusGlobeMesh = new THREE.Mesh(
      new THREE.SphereGeometry(12, 48, 48),
      new THREE.MeshStandardMaterial({
        map: createVenusTexture(),
        roughness: 0.6,
      })
    );
    venusGlobeGroup.add(venusGlobeMesh);

    // 10. BUILD DEEP SPACE GROUP
    const deepSpaceGroup = new THREE.Group();
    deepSpaceGroupRef.current = deepSpaceGroup;
    scene.add(deepSpaceGroup);
    deepSpaceGroup.visible = false;

    // Outer heliosphere representation in Deep Space view
    const helioGeo = new THREE.SphereGeometry(30, 24, 24);
    const helioMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });
    deepSpaceGroup.add(new THREE.Mesh(helioGeo, helioMat));

    // Markers group for surface landing sites
    const markersGroup = new THREE.Group();
    markersGroupRef.current = markersGroup;
    scene.add(markersGroup);

    // Helper: place pin on globe (radius 12)
    const latLonToVector3 = (lat: number, lon: number, radius = 12.1): THREE.Vector3 => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);
      return new THREE.Vector3(x, y, z);
    };

    // Populate Pins on Globes
    LANDING_SITES_3D.forEach((site) => {
      if (site.body !== 'mars' && site.body !== 'moon') return;

      const pos = latLonToVector3(site.lat, site.lon, 12.2);

      // Pin stem
      const stemGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8);
      stemGeo.translate(0, 0.6, 0);
      const pinMat = new THREE.MeshBasicMaterial({
        color: site.body === 'mars' ? 0xffb703 : 0x00f0ff,
      });
      const stem = new THREE.Mesh(stemGeo, pinMat);

      // Pin head sphere
      const headGeo = new THREE.SphereGeometry(0.35, 12, 12);
      const headMat = new THREE.MeshBasicMaterial({
        color: site.body === 'mars' ? 0xffea00 : 0xffffff,
      });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.set(0, 1.2, 0);
      stem.add(head);

      // Orient pin outward perpendicular to sphere surface
      stem.position.copy(pos);
      stem.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize());

      stem.userData = {
        isLandingSite: true,
        siteData: site,
      };

      if (site.body === 'mars') {
        marsGlobeGroup.add(stem);
      } else if (site.body === 'moon') {
        moonGlobeGroup.add(stem);
      }
    });

    // 11. Raycaster for Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      if (solarSystemGroup.visible) {
        const intersects = raycaster.intersectObjects(planetMeshes, true);
        if (intersects.length > 0) {
          const obj = intersects[0].object;
          setHoveredObject(obj.userData?.name || null);
          document.body.style.cursor = 'pointer';
        } else {
          setHoveredObject(null);
          document.body.style.cursor = 'default';
        }
      } else if (marsGlobeGroup.visible || moonGlobeGroup.visible) {
        const group = marsGlobeGroup.visible ? marsGlobeGroup : moonGlobeGroup;
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
            document.body.style.cursor = 'pointer';
            return;
          }
        }
        setHoveredObject(null);
        document.body.style.cursor = 'default';
      }
    };

    const handleClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      if (solarSystemGroup.visible) {
        const intersects = raycaster.intersectObjects(planetMeshes, true);
        if (intersects.length > 0) {
          const obj = intersects[0].object;
          const targetMode = obj.userData?.mode as ViewMode | null;
          if (targetMode) {
            playWhooshSound();
            switchViewMode(targetMode);
          }
        }
      } else if (marsGlobeGroup.visible || moonGlobeGroup.visible) {
        const group = marsGlobeGroup.visible ? marsGlobeGroup : moonGlobeGroup;
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
            playSignalPing(720);
            setSelectedSite(root.userData.siteData);
          }
        }
      }
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousemove', handlePointerMove);
    domEl.addEventListener('click', handleClick);

    // 12. Animation Loop
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      // Rotate Sun and globes
      sunMesh.rotation.y += 0.002;
      if (marsGlobeGroup.visible) marsGlobeMesh.rotation.y += 0.0006;
      if (moonGlobeGroup.visible) moonGlobeMesh.rotation.y += 0.0004;
      if (venusGlobeGroup.visible) venusGlobeMesh.rotation.y += 0.0008;

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      domEl.removeEventListener('mousemove', handlePointerMove);
      domEl.removeEventListener('click', handleClick);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      renderer.dispose();
      if (mountRef.current && domEl) mountRef.current.removeChild(domEl);
    };
  }, []);

  // Switch View Mode Handler
  const switchViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    setHoveredObject(null);

    if (
      !solarSystemGroupRef.current ||
      !marsGlobeGroupRef.current ||
      !moonGlobeGroupRef.current ||
      !venusGlobeGroupRef.current ||
      !deepSpaceGroupRef.current ||
      !cameraRef.current ||
      !controlsRef.current
    )
      return;

    const camera = cameraRef.current;
    const controls = controlsRef.current;

    // Hide all
    solarSystemGroupRef.current.visible = false;
    marsGlobeGroupRef.current.visible = false;
    moonGlobeGroupRef.current.visible = false;
    venusGlobeGroupRef.current.visible = false;
    deepSpaceGroupRef.current.visible = false;

    if (mode === 'SOLAR_SYSTEM') {
      solarSystemGroupRef.current.visible = true;
      camera.position.set(0, 85, 170);
      controls.target.set(0, 0, 0);
      controls.maxDistance = 600;
      controls.minDistance = 25;
      setSearchParams({});
    } else if (mode === 'MARS') {
      marsGlobeGroupRef.current.visible = true;
      camera.position.set(0, 8, 32);
      controls.target.set(0, 0, 0);
      controls.maxDistance = 65;
      controls.minDistance = 14;
      setSearchParams({ planet: 'mars' });
    } else if (mode === 'MOON') {
      moonGlobeGroupRef.current.visible = true;
      camera.position.set(0, 8, 32);
      controls.target.set(0, 0, 0);
      controls.maxDistance = 65;
      controls.minDistance = 14;
      setSearchParams({ planet: 'moon' });
    } else if (mode === 'VENUS') {
      venusGlobeGroupRef.current.visible = true;
      camera.position.set(0, 8, 32);
      controls.target.set(0, 0, 0);
      controls.maxDistance = 65;
      controls.minDistance = 14;
      setSearchParams({ planet: 'venus' });
    } else if (mode === 'DEEP_SPACE') {
      deepSpaceGroupRef.current.visible = true;
      solarSystemGroupRef.current.visible = true; // also keep scaled solar system visible
      camera.position.set(120, 60, 160);
      controls.target.set(0, 0, 0);
      controls.maxDistance = 700;
      controls.minDistance = 40;
      setSearchParams({ planet: 'deep-space' });
    }
  };

  // Sync mode changes to 3D visibility
  useEffect(() => {
    switchViewMode(viewMode);
  }, [viewMode]);

  // Handle Radio Packet send in "Can You Reach It?"
  const handleSendRadio = () => {
    if (!radioInput.trim()) return;
    playSuccessChime();
    setRadioSent(true);
  };

  return (
    <div className="relative w-full h-[calc(100vh-70px)] bg-[#05080E] overflow-hidden select-none">
      {/* 3D WebGL Canvas Mount */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left Navigation Bar & Back Button */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        {viewMode !== 'SOLAR_SYSTEM' ? (
          <button
            onClick={() => {
              playWhooshSound();
              switchViewMode('SOLAR_SYSTEM');
            }}
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

      {/* Top Center Quick Destination Bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 hidden sm:flex items-center gap-1.5 p-1 rounded-full bg-[#080D16]/85 border border-white/10 backdrop-blur-md shadow-2xl">
        {[
          { mode: 'SOLAR_SYSTEM' as ViewMode, label: '☀️ SOLAR SYSTEM' },
          { mode: 'MARS' as ViewMode, label: '🔴 MARS GLOBE' },
          { mode: 'MOON' as ViewMode, label: '🌕 MOON GLOBE' },
          { mode: 'VENUS' as ViewMode, label: '🟡 VENUS' },
          { mode: 'DEEP_SPACE' as ViewMode, label: '🌌 DEEP SPACE' },
        ].map((item) => (
          <button
            key={item.mode}
            onClick={() => {
              playSignalPing(750);
              switchViewMode(item.mode);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wider transition-all font-sans ${
              viewMode === item.mode
                ? 'bg-[#C6A36B] text-[#080D16] font-semibold shadow-lg'
                : 'text-[#B6C0CC] hover:text-white hover:bg-white/5'
            }`}
          >
            {item.label}
          </button>
        ))}
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
          <p className="text-xs text-[#B6C0CC] mt-1 leading-relaxed">
            Even at the speed of light (300,000 km/s), messages take immense time to travel across the gulf of deep space.
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
                "Space is so unimaginably vast that even electromagnetic signals moving at the speed of light feel slow."
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
