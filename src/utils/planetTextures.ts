import * as THREE from 'three';
import marsVikingMap from '../assets/mars-viking-2048.jpg';
import marsMolaMap from '../assets/mars-mola-topography.jpg';
import mercuryMap from '../assets/planets/mercury.jpg';
import venusAtmosphereMap from '../assets/planets/venus_atmosphere.jpg';
import earthCloudsMap from '../assets/planets/earth_with_clouds.jpg';
import moonMap from '../assets/planets/moon.jpg';
import jupiterMap from '../assets/planets/jupiter.jpg';
import saturnMap from '../assets/planets/saturn.jpg';

/**
 * Authentic NASA Planetary Map Loaders & Ring Generators
 * Guarantees 100% offline functionality, zero external network dependencies,
 * and authentic planetary appearances matching the quality of the Mars Viking globe.
 */

// Helper to configure imported equirectangular textures consistently
function loadPlanetTexture(assetUrl: string): THREE.Texture {
  const loader = new THREE.TextureLoader();
  const texture = loader.load(assetUrl);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  return texture;
}

/**
 * Authentic NASA Viking Orbiter MDIM 2.1 Global Color Mosaic Texture for Mars.
 * Preserved exactly as established.
 */
export function createMarsVikingTexture(): THREE.Texture {
  return loadPlanetTexture(marsVikingMap);
}

/**
 * Authentic NASA MGS MOLA Topographic Shaded Relief Visual Texture.
 */
export function createMarsMolaTexture(): THREE.Texture {
  return loadPlanetTexture(marsMolaMap);
}

/**
 * Authentic NASA MESSENGER Global Color Mosaic for Mercury.
 * Features heavily cratered surface, Caloris Basin, lobate scarps, and bright ray systems.
 */
export function createMercuryTexture(): THREE.Texture {
  return loadPlanetTexture(mercuryMap);
}

/**
 * Realistic dense golden-yellow and cream cloud atmosphere for Venus.
 * Represents the natural swirling cloud decks observed by Pioneer Venus and Akatsuki.
 */
export function createVenusTexture(): THREE.Texture {
  return loadPlanetTexture(venusAtmosphereMap);
}

/**
 * Authentic NASA Blue Marble Earth with rich blue oceans, recognizable continents,
 * coastlines, polar ice caps, and convincing swirling atmospheric clouds.
 */
export function createEarthTexture(): THREE.Texture {
  return loadPlanetTexture(earthCloudsMap);
}

/**
 * Authentic NASA Lunar Reconnaissance Orbiter (LRO) Clementine albedo mosaic for the Moon.
 * Features basaltic dark maria (Oceanus Procellarum, Sea of Tranquility), highland craters, and Tycho rays.
 */
export function createMoonTexture(): THREE.Texture {
  return loadPlanetTexture(moonMap);
}

/**
 * Authentic NASA Cassini / Voyager Global Mosaic for Jupiter.
 * Depicts dynamic atmospheric zonal cloud belts, turbulent vortex eddies, and the prominent Great Red Spot.
 */
export function createJupiterTexture(): THREE.Texture {
  return loadPlanetTexture(jupiterMap);
}

/**
 * Authentic NASA Cassini Cylindrical Mosaic for Saturn.
 * Natural pale golden atmospheric bands and subtle cloud variations.
 */
export function createSaturnTexture(): THREE.Texture {
  return loadPlanetTexture(saturnMap);
}

/**
 * High-fidelity Saturn Rings texture featuring authentic concentric divisions:
 * C Ring (Crepe ring), B Ring, Cassini Division (sharp dark gap), A Ring with Encke gap, and F Ring.
 */
export function createSaturnRingTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;
  const cx = 512;
  const cy = 512;

  // Planar RingGeometry maps (x, y) normalized across the square [-outerRadius, outerRadius]
  // Outer radius corresponds to ~500px, Inner radius ~304px (15.4 / 25.3 * 500 = 304.3px)
  const maxR = 500;
  const minR = 304;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Helper to draw concentric ring bands with anti-aliasing
  const drawBand = (r1: number, r2: number, fillStyle: string) => {
    ctx.fillStyle = fillStyle;
    ctx.beginPath();
    ctx.arc(cx, cy, r2, 0, Math.PI * 2, false);
    ctx.arc(cx, cy, r1, 0, Math.PI * 2, true);
    ctx.fill();
  };

  // C Ring (Crepe ring) - faint translucent inner ring
  drawBand(minR, minR + 42, 'rgba(165, 142, 105, 0.35)');

  // B Ring - Dense, wide, high-albedo creamy gold
  drawBand(minR + 45, minR + 115, 'rgba(215, 192, 150, 0.88)');
  drawBand(minR + 115, minR + 125, 'rgba(195, 172, 130, 0.75)');

  // Cassini Division - sharp, dark gap (near transparent)
  drawBand(minR + 126, minR + 142, 'rgba(8, 13, 22, 0.05)');

  // A Ring - Distinct outer ring with fine Encke division
  drawBand(minR + 143, minR + 180, 'rgba(198, 175, 135, 0.82)');
  // Encke Gap
  drawBand(minR + 181, minR + 185, 'rgba(8, 13, 22, 0.08)');
  drawBand(minR + 186, maxR - 8, 'rgba(185, 160, 122, 0.72)');

  // F Ring - thin faint thread at the outer edge
  drawBand(maxR - 5, maxR, 'rgba(175, 150, 115, 0.45)');

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  return texture;
}

/**
 * Sun self-luminous procedural corona texture.
 */
export function createSunTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#FFF5D0');
  gradient.addColorStop(0.2, '#FFA020');
  gradient.addColorStop(0.5, '#FF6B00');
  gradient.addColorStop(0.8, '#FFA020');
  gradient.addColorStop(1, '#FFF5D0');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Solar flares / granules
  ctx.fillStyle = 'rgba(255, 230, 150, 0.2)';
  for (let i = 0; i < 400; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const r = Math.random() * 25 + 5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Dark sunspots
  ctx.fillStyle = 'rgba(120, 30, 0, 0.4)';
  for (let i = 0; i < 15; i++) {
    const x = Math.random() * canvas.width;
    const y = canvas.height * 0.3 + Math.random() * (canvas.height * 0.4);
    const r = Math.random() * 12 + 3;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}
