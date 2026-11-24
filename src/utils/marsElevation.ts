import * as THREE from 'three';
import molaHeightUrl from '../assets/mars/mars-mola-height-2048x1024.u16?url';
import molaMetadata from '../assets/mars/mars-mola-height-metadata.json';
import { normalizeLongitude } from './coordinateUtils';
import { RegionalMarsLayer } from '../data/marsRegionalLayers';

export interface MolaDemInfo {
  width: number;
  height: number;
  minElevationMeters: number;
  maxElevationMeters: number;
  verticalExaggeration: number;
  marsRadiusKm: number;
  isLoaded: boolean;
}

let cachedHeightData: Uint16Array | null = null;
let loadPromise: Promise<Uint16Array> | null = null;

export const MOLA_METADATA: MolaDemInfo = {
  width: molaMetadata.width,
  height: molaMetadata.height,
  minElevationMeters: molaMetadata.minElevationMeters,
  maxElevationMeters: molaMetadata.maxElevationMeters,
  verticalExaggeration: molaMetadata.verticalExaggerationFactor || 1.5,
  marsRadiusKm: molaMetadata.referenceRadiusKm || 3396.19,
  isLoaded: false,
};

/**
 * Loads the 2048x1024 numerical MOLA elevation dataset.
 * Cached in memory once decoded.
 */
export async function loadMolaHeightData(): Promise<Uint16Array> {
  if (cachedHeightData) return cachedHeightData;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      const res = await fetch(molaHeightUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status} loading MOLA height dataset`);
      const buf = await res.arrayBuffer();
      cachedHeightData = new Uint16Array(buf);
      MOLA_METADATA.isLoaded = true;
      return cachedHeightData;
    } catch (err) {
      console.error('Failed to load MOLA height array:', err);
      // Fallback zero array if load fails
      cachedHeightData = new Uint16Array(2048 * 1024);
      return cachedHeightData;
    }
  })();

  return loadPromise;
}

/**
 * Samples the numerical elevation in meters at any planetary latitude and longitude.
 */
export function getMarsElevation(
  lat: number,
  lon: number,
  heightData: Uint16Array | null = cachedHeightData
): number {
  if (!heightData || heightData.length === 0) return 0;

  const normLon = normalizeLongitude(lon); // [-180, 180]
  // Equirectangular mapping:
  // Col 0 = -180°, Col 1024 = 0° (Prime Meridian), Col 2047 = +180°
  const u = (normLon + 180) / 360;
  const col = Math.min(2047, Math.max(0, Math.round(u * 2047)));

  // Row 0 = +90°N (North Pole), Row 1023 = -90°S (South Pole)
  const v = (90 - lat) / 180;
  const row = Math.min(1023, Math.max(0, Math.round(v * 1023)));

  const u16 = heightData[row * 2048 + col];
  // Lossless mapping formula: elevationMeters = uint16 - 32768
  return u16 - 32768;
}

/**
 * Constructs a height-displaced Mars BufferGeometry using genuine MOLA numerical elevation.
 *
 * For a model sphere radius Rmodel, Mars radius Rmars (3,396.19 km),
 * elevation h in kilometres, and vertical exaggeration factor VE:
 * radialOffset = (h / Rmars) * Rmodel * VE
 * 
 * Target resolution: 512 x 256 for desktop, 256 x 128 for mobile.
 */
export function createMolaMarsGeometry(
  heightData: Uint16Array,
  radius = 12,
  widthSegments = 512,
  heightSegments = 256,
  verticalExaggeration = 1.5,
  marsRadiusKm = 3396.19
): THREE.BufferGeometry {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let j = 0; j <= heightSegments; j++) {
    const vNorm = j / heightSegments;
    const phi = vNorm * Math.PI; // 0 (North Pole) to PI (South Pole)
    const rowInDem = Math.min(1023, Math.max(0, Math.round(vNorm * 1023)));

    for (let i = 0; i <= widthSegments; i++) {
      const uNorm = i / widthSegments; // 0 to 1
      const normLon = -180 + uNorm * 360;
      const theta = (normLon + 180) * (Math.PI / 180); // 0 at -180°, PI at 0°, 2*PI at +180°
      const colInDem = Math.min(2047, Math.max(0, Math.round(uNorm * 2047)));

      // Fetch genuine elevation in meters from MOLA DEM
      const u16 = heightData[rowInDem * 2048 + colInDem];
      const elevMeters = u16 - 32768;
      const elevKm = elevMeters / 1000;

      // Mathematically grounded radial offset
      const radialOffset = (elevKm / marsRadiusKm) * radius * verticalExaggeration;
      const r = radius + radialOffset;

      // Three.js spherical coordinate orientation consistent with latLonToVector3
      const x = -(r * Math.sin(phi) * Math.cos(theta));
      const z = r * Math.sin(phi) * Math.sin(theta);
      const y = r * Math.cos(phi);

      positions.push(x, y, z);
      uvs.push(uNorm, 1.0 - vNorm);
    }
  }

  // Generate triangle indices
  for (let j = 0; j < heightSegments; j++) {
    for (let i = 0; i < widthSegments; i++) {
      const a = j * (widthSegments + 1) + i;
      const b = j * (widthSegments + 1) + (i + 1);
      const c = (j + 1) * (widthSegments + 1) + i;
      const d = (j + 1) * (widthSegments + 1) + (i + 1);

      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

/**
 * Constructs a geographically registered spherical surface patch for regional LOD imagery (e.g. Jezero, Gale).
 * Vertices are positioned on the curved surface conforming to MOLA elevation,
 * with a slight radial bias (+0.015) to guarantee zero z-fighting against the underlying globe.
 */
export function createRegionalSurfacePatchGeometry(
  layer: RegionalMarsLayer,
  heightData: Uint16Array,
  marsSphereRadius = 12,
  gridSegments = 32,
  verticalExaggeration = 1.5,
  marsRadiusKm = 3396.19
): THREE.BufferGeometry {
  const { west, east, south, north } = layer.bounds;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let j = 0; j <= gridSegments; j++) {
    const vNorm = j / gridSegments;
    const lat = north - vNorm * (north - south);
    const phi = (90 - lat) * (Math.PI / 180);

    for (let i = 0; i <= gridSegments; i++) {
      const uNorm = i / gridSegments;
      const lon = west + uNorm * (east - west);
      const normLon = normalizeLongitude(lon);
      const theta = (normLon + 180) * (Math.PI / 180);

      // Sample height from MOLA DEM
      const col = Math.min(2047, Math.max(0, Math.round(((normLon + 180) / 360) * 2047)));
      const row = Math.min(1023, Math.max(0, Math.round(((90 - lat) / 180) * 1023)));
      const u16 = heightData[row * 2048 + col];
      const hMeters = u16 - 32768;
      const hKm = hMeters / 1000;

      // Radial offset with subtle elevation following + slight bias to prevent z-fighting
      const radialOffset = (hKm / marsRadiusKm) * marsSphereRadius * verticalExaggeration;
      const r = marsSphereRadius + radialOffset + 0.015;

      const x = -(r * Math.sin(phi) * Math.cos(theta));
      const z = r * Math.sin(phi) * Math.sin(theta);
      const y = r * Math.cos(phi);

      positions.push(x, y, z);
      // Regional CTX tiles are North-up equirectangular: (0,0) is bottom-left, (1,1) is top-right in Three.js UV
      uvs.push(uNorm, 1.0 - vNorm);
    }
  }

  for (let j = 0; j < gridSegments; j++) {
    for (let i = 0; i < gridSegments; i++) {
      const a = j * (gridSegments + 1) + i;
      const b = j * (gridSegments + 1) + (i + 1);
      const c = (j + 1) * (gridSegments + 1) + i;
      const d = (j + 1) * (gridSegments + 1) + (i + 1);

      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}
