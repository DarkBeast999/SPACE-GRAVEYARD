import * as THREE from 'three';
import { LandingSite3D, MarsLandmark } from '../data/landingSites3D';

export type MonumentType = 'rover' | 'lander' | 'helicopter' | 'probe' | 'landmark';

/**
 * Determines the visual monument type based on mission characteristics.
 */
export function getMonumentType(item: LandingSite3D | MarsLandmark): MonumentType {
  if ('type' in item) {
    return 'landmark';
  }

  const id = item.id.toLowerCase();
  const name = item.name.toLowerCase();

  if (id.includes('ingenuity') || name.includes('helicopter')) {
    return 'helicopter';
  }

  if (
    id.includes('rover') ||
    id.includes('curiosity') ||
    id.includes('perseverance') ||
    id.includes('opportunity') ||
    id.includes('spirit') ||
    id.includes('sojourner') ||
    id.includes('lunokhod') ||
    id.includes('lrv') ||
    id.includes('yutu') ||
    id.includes('zhurong') ||
    name.includes('rover')
  ) {
    return 'rover';
  }

  if (
    item.body === 'deep-space' ||
    id === 'cassini' ||
    id === 'galileo' ||
    name.includes('voyager') ||
    name.includes('pioneer') ||
    name.includes('horizons')
  ) {
    return 'probe';
  }

  return 'lander';
}

/**
 * Returns an accessible emoji icon for the monument type.
 */
export function getMonumentIcon(type: MonumentType): string {
  switch (type) {
    case 'rover':
      return '🚙';
    case 'lander':
      return '🛸';
    case 'helicopter':
      return '🚁';
    case 'probe':
      return '🛰️';
    case 'landmark':
      return '🏔️';
  }
}

/**
 * Returns a visitor-friendly display label for the monument type.
 */
export function getMonumentTypeLabel(type: MonumentType): string {
  switch (type) {
    case 'rover':
      return 'Planetary Surface Rover';
    case 'lander':
      return 'Surface Lander / Monument';
    case 'helicopter':
      return 'Aerial Scout / Helicopter';
    case 'probe':
      return 'Deep Space Probe';
    case 'landmark':
      return 'Natural Geological Landmark';
  }
}

// Shared reusable materials for performance
const roverBodyMat = new THREE.MeshStandardMaterial({
  color: 0xd4af37, // Antique gold
  roughness: 0.6,
  metalness: 0.3,
});

const roverWheelMat = new THREE.MeshStandardMaterial({
  color: 0x222a36, // Deep slate
  roughness: 0.8,
});

const mastMat = new THREE.MeshStandardMaterial({
  color: 0xe2e8f0, // White / alloy
  roughness: 0.5,
});

const landerCoreMat = new THREE.MeshStandardMaterial({
  color: 0xf59e0b, // Gold foil
  roughness: 0.4,
  metalness: 0.4,
});

const landerLegMat = new THREE.MeshStandardMaterial({
  color: 0x94a3b8, // Titanium alloy
  roughness: 0.7,
});

const helicopterBodyMat = new THREE.MeshStandardMaterial({
  color: 0xffea00, // Vibrant yellow
  roughness: 0.5,
});

const helicopterBladeMat = new THREE.MeshStandardMaterial({
  color: 0x1e293b, // Carbon fiber
  roughness: 0.6,
});

const probeBodyMat = new THREE.MeshStandardMaterial({
  color: 0x38bdf8, // Electric blue/cyan
  roughness: 0.4,
  metalness: 0.5,
});

const landmarkMat = new THREE.MeshStandardMaterial({
  color: 0x00f0ff, // Cyan beacon for natural landmarks
  roughness: 0.6,
});

const selectionRingMat = new THREE.MeshBasicMaterial({
  color: 0xffd700,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.95,
});

const invisibleHitMat = new THREE.MeshBasicMaterial({
  visible: false,
});

/**
 * Builds a 3D recognizable monument symbol group.
 */
export function createMonumentSymbol(
  item: LandingSite3D | MarsLandmark,
  extraData?: Record<string, unknown>
): THREE.Group {
  const isLandmark = 'type' in item;
  const type = getMonumentType(item);
  const group = new THREE.Group();

  // Root data
  group.userData = {
    id: item.id,
    name: item.name,
    monumentType: type,
    isLandingSite: !isLandmark,
    isLandmark: isLandmark,
    siteData: !isLandmark ? item : undefined,
    landmarkData: isLandmark ? item : undefined,
    ...extraData,
  };

  // Base stem/riser
  const riser = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 0.35, 6),
    mastMat
  );
  riser.position.y = 0.175;
  group.add(riser);

  // Symbol construction by type
  if (type === 'rover') {
    // 1. Rover Chassis
    const chassis = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.18, 0.36),
      roverBodyMat
    );
    chassis.position.y = 0.45;
    group.add(chassis);

    // 2. Wheels (4 side wheels)
    const wheelGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.07, 8);
    wheelGeo.rotateZ(Math.PI / 2);

    const offsets = [
      [-0.26, 0.38, 0.16],
      [0.26, 0.38, 0.16],
      [-0.26, 0.38, -0.16],
      [0.26, 0.38, -0.16],
    ];
    offsets.forEach(([x, y, z]) => {
      const w = new THREE.Mesh(wheelGeo, roverWheelMat);
      w.position.set(x, y, z);
      group.add(w);
    });

    // 3. Camera Mast & Sensor Head
    const mast = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.35, 6),
      mastMat
    );
    mast.position.set(0.16, 0.68, 0);
    group.add(mast);

    const sensorHead = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.08, 0.12),
      roverBodyMat
    );
    sensorHead.position.set(0.16, 0.86, 0);
    group.add(sensorHead);
  } else if (type === 'helicopter') {
    // Ingenuity Helicopter
    const fuselage = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.24, 0.24),
      helicopterBodyMat
    );
    fuselage.position.y = 0.45;
    group.add(fuselage);

    // 4 Splayed legs
    const legGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.35, 4);
    const legAngles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
    legAngles.forEach((angle) => {
      const leg = new THREE.Mesh(legGeo, landerLegMat);
      leg.position.set(Math.cos(angle) * 0.15, 0.3, Math.sin(angle) * 0.15);
      leg.rotation.z = Math.cos(angle) * 0.35;
      leg.rotation.x = Math.sin(angle) * 0.35;
      group.add(leg);
    });

    // Mast + Dual Counter-rotating Blades
    const rotorMast = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.25, 4),
      mastMat
    );
    rotorMast.position.y = 0.68;
    group.add(rotorMast);

    const blade1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.02, 0.08),
      helicopterBladeMat
    );
    blade1.position.y = 0.76;
    group.add(blade1);

    const blade2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.02, 0.85),
      helicopterBladeMat
    );
    blade2.position.y = 0.82;
    group.add(blade2);
  } else if (type === 'probe') {
    // Deep space probe / orbiter
    const bus = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.38, 0.38),
      probeBodyMat
    );
    bus.position.y = 0.5;
    group.add(bus);

    // Parabolic High-gain Dish Antenna
    const dish = new THREE.Mesh(
      new THREE.ConeGeometry(0.36, 0.16, 12, 1, true),
      mastMat
    );
    dish.position.set(0, 0.76, 0);
    dish.rotation.x = Math.PI;
    group.add(dish);

    // Solar Wings / RTG booms
    const wing = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.03, 0.28),
      probeBodyMat
    );
    wing.position.set(0, 0.5, 0);
    group.add(wing);
  } else if (type === 'landmark') {
    // Natural Geological Landmark (Mountain peak / crater beacon)
    const peak = new THREE.Mesh(
      new THREE.ConeGeometry(0.42, 0.65, 5),
      landmarkMat
    );
    peak.position.y = 0.5;
    group.add(peak);

    // Glowing Summit Beacon
    const beaconLight = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.16, 0),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    beaconLight.position.y = 0.9;
    group.add(beaconLight);
  } else {
    // Default Lander (Apollo, Viking, Phoenix, InSight)
    const core = new THREE.Mesh(
      new THREE.CylinderGeometry(0.26, 0.4, 0.32, 6),
      landerCoreMat
    );
    core.position.y = 0.48;
    group.add(core);

    // 3 Tripod Landing Legs
    const legGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.45, 4);
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3;
      const leg = new THREE.Mesh(legGeo, landerLegMat);
      leg.position.set(Math.cos(angle) * 0.22, 0.3, Math.sin(angle) * 0.22);
      leg.rotation.z = Math.cos(angle) * 0.4;
      leg.rotation.x = Math.sin(angle) * 0.4;
      group.add(leg);
    }

    // Top Antenna / Sensor
    const topCap = new THREE.Mesh(
      new THREE.ConeGeometry(0.14, 0.12, 8),
      mastMat
    );
    topCap.position.y = 0.7;
    group.add(topCap);
  }

  // Selected Highlight Ring (Base Halo)
  const selRing = new THREE.Mesh(
    new THREE.RingGeometry(0.55, 0.8, 24),
    selectionRingMat
  );
  selRing.name = 'selectionRing';
  selRing.rotation.x = -Math.PI / 2;
  selRing.position.y = 0.02;
  selRing.visible = false;
  group.add(selRing);

  // Large Invisible Hit-Sphere for generous mouse/touch raycasting
  const hitSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.75, 8, 8),
    invisibleHitMat
  );
  hitSphere.position.y = 0.5;
  hitSphere.userData = group.userData;
  group.add(hitSphere);

  return group;
}

/**
 * Updates the visible selection highlight ring on the active monument across all groups.
 */
export function updateMonumentSelection(
  groups: (THREE.Group | null)[],
  selectedId: string | null
): void {
  groups.forEach((g) => {
    if (!g) return;
    g.traverse((obj) => {
      if (obj.name === 'selectionRing') {
        const parentId = obj.parent?.userData?.id;
        obj.visible = !!(selectedId && parentId === selectedId);
      }
    });
  });
}
