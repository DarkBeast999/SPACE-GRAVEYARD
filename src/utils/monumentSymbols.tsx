import React from 'react';
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
 * Returns a visitor-friendly display label for the monument type.
 */
export function getMonumentTypeLabel(type: MonumentType): string {
  switch (type) {
    case 'rover':
      return 'Planetary Surface Rover';
    case 'lander':
      return 'Surface Lander / Science Station';
    case 'helicopter':
      return 'Aerial Scout / Helicopter';
    case 'probe':
      return 'Orbiter / Deep-Space Probe';
    case 'landmark':
      return 'Geological Landmark';
  }
}

/**
 * Destination-specific astronomical cartography accent colors.
 */
export function getDestinationAccentColor(body?: string): {
  primary: string;
  glow: string;
  border: string;
  core: string;
} {
  switch (body) {
    case 'mars':
      return {
        primary: '#FF8D7B', // Coral rust
        glow: 'rgba(255, 141, 123, 0.45)',
        border: 'rgba(255, 141, 123, 0.85)',
        core: '#FFF2F0',
      };
    case 'moon':
      return {
        primary: '#C8D8EA', // Lunar silver
        glow: 'rgba(200, 216, 234, 0.45)',
        border: 'rgba(200, 216, 234, 0.85)',
        core: '#FFFFFF',
      };
    case 'saturn':
      return {
        primary: '#FFC66D', // Solar gold
        glow: 'rgba(255, 198, 109, 0.45)',
        border: 'rgba(255, 198, 109, 0.85)',
        core: '#FFFBF2',
      };
    case 'deep-space':
      return {
        primary: '#58D9FF', // Electric cyan
        glow: 'rgba(88, 217, 255, 0.5)',
        border: 'rgba(88, 217, 255, 0.9)',
        core: '#EDFCFF',
      };
    default:
      return {
        primary: '#38BDF8', // Azure cyan for landmarks & general celestial markers
        glow: 'rgba(56, 189, 248, 0.45)',
        border: 'rgba(56, 189, 248, 0.85)',
        core: '#F0F9FF',
      };
  }
}

/**
 * Premium Astronomical Cartography SVG Vector Icon Component.
 * Used across Search, Legend, Directory Cards, and Dossier Headers.
 */
export const MonumentIcon: React.FC<{
  type: MonumentType;
  body?: string;
  className?: string;
  size?: number;
}> = ({ type, body, className = 'w-6 h-6', size = 28 }) => {
  const isLandmark = type === 'landmark';
  const colors = getDestinationAccentColor(isLandmark ? 'landmark' : body);
  const accent = colors.primary;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 1. Deep cosmic observatory badge shield */}
      <circle cx="64" cy="64" r="60" fill="#080B1D" fillOpacity="0.94" />
      <circle cx="64" cy="64" r="59" stroke={accent} strokeWidth="1.6" strokeOpacity="0.8" />

      {/* 2. Concentric Astronomical Reticle Rings */}
      <circle cx="64" cy="64" r="51" stroke={accent} strokeWidth="0.8" strokeDasharray="3 4" strokeOpacity="0.4" />
      <circle cx="64" cy="64" r="41" stroke={accent} strokeWidth="0.6" strokeOpacity="0.25" />

      {/* 3. Cardinal Coordinate Ticks (Astronomical reticle) */}
      <line x1="64" y1="4" x2="64" y2="12" stroke={accent} strokeWidth="1.8" strokeOpacity="0.85" />
      <line x1="64" y1="116" x2="64" y2="124" stroke={accent} strokeWidth="1.8" strokeOpacity="0.85" />
      <line x1="4" y1="64" x2="12" y2="64" stroke={accent} strokeWidth="1.8" strokeOpacity="0.85" />
      <line x1="116" y1="64" x2="124" y2="64" stroke={accent} strokeWidth="1.8" strokeOpacity="0.85" />

      {/* Diagonal micro-ticks */}
      <circle cx="28" cy="28" r="1.5" fill={accent} fillOpacity="0.5" />
      <circle cx="100" cy="28" r="1.5" fill={accent} fillOpacity="0.5" />
      <circle cx="28" cy="100" r="1.5" fill={accent} fillOpacity="0.5" />
      <circle cx="100" cy="100" r="1.5" fill={accent} fillOpacity="0.5" />

      {/* Central Celestial Glow */}
      <circle cx="64" cy="64" r="22" fill={accent} fillOpacity="0.12" />

      {/* Category Specific Astronomical Reticle Glyphs */}
      {type === 'rover' && (
        <g id="carto-rover">
          {/* Planetary Surface Navigation Diamond with Axis Crosshair */}
          <line x1="36" y1="64" x2="92" y2="64" stroke={accent} strokeWidth="1.2" strokeOpacity="0.6" />
          <line x1="64" y1="36" x2="64" y2="92" stroke={accent} strokeWidth="1.2" strokeOpacity="0.6" />
          {/* Navigation Diamond */}
          <polygon
            points="64,38 90,64 64,90 38,64"
            stroke={accent}
            strokeWidth="2.2"
            fill="#111A35"
            fillOpacity="0.85"
            strokeLinejoin="round"
          />
          {/* Precision inner corner brackets */}
          <path d="M50 56H46V60" stroke="#F5F0E8" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M78 56H82V60" stroke="#F5F0E8" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M50 72H46V68" stroke="#F5F0E8" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M78 72H82V68" stroke="#F5F0E8" strokeWidth="1.5" strokeLinecap="round" />
          {/* Core Illuminated Beacon */}
          <circle cx="64" cy="64" r="5" fill={accent} />
          <circle cx="64" cy="64" r="2.2" fill="#FFFFFF" />
        </g>
      )}

      {type === 'lander' && (
        <g id="carto-lander">
          {/* Surface Landing Target Reticle & 3-Axis Station Legs */}
          <line x1="64" y1="64" x2="38" y2="88" stroke={accent} strokeWidth="2.0" strokeLinecap="round" />
          <line x1="64" y1="64" x2="90" y2="88" stroke={accent} strokeWidth="2.0" strokeLinecap="round" />
          <line x1="64" y1="64" x2="64" y2="34" stroke={accent} strokeWidth="2.0" strokeLinecap="round" />
          {/* Landing Target Hexagonal Station Ring */}
          <polygon
            points="64,48 78,56 78,72 64,80 50,72 50,56"
            stroke={accent}
            strokeWidth="2.0"
            fill="#111A35"
            fillOpacity="0.85"
            strokeLinejoin="round"
          />
          {/* Station Footpads */}
          <circle cx="38" cy="88" r="3.5" fill="#111A35" stroke={accent} strokeWidth="1.5" />
          <circle cx="90" cy="88" r="3.5" fill="#111A35" stroke={accent} strokeWidth="1.5" />
          <circle cx="64" cy="34" r="3.5" fill="#111A35" stroke={accent} strokeWidth="1.5" />
          {/* Core Beacon */}
          <circle cx="64" cy="64" r="4.5" fill={accent} />
          <circle cx="64" cy="64" r="2" fill="#FFFFFF" />
        </g>
      )}

      {type === 'probe' && (
        <g id="carto-probe">
          {/* Interstellar Trajectory Star Reticle */}
          {/* Radiant 8-point celestial beacon */}
          <line x1="64" y1="30" x2="64" y2="98" stroke={accent} strokeWidth="1.5" strokeOpacity="0.7" />
          <line x1="30" y1="64" x2="98" y2="64" stroke={accent} strokeWidth="1.5" strokeOpacity="0.7" />
          <line x1="40" y1="40" x2="88" y2="88" stroke={accent} strokeWidth="1" strokeOpacity="0.4" />
          <line x1="88" y1="40" x2="40" y2="88" stroke={accent} strokeWidth="1" strokeOpacity="0.4" />
          {/* Celestial Orbit Arcs */}
          <circle cx="64" cy="64" r="20" stroke={accent} strokeWidth="1.8" strokeDasharray="6 3" fill="none" />
          {/* Spacecraft Core Star */}
          <path
            d="M64 42L68 58L84 64L68 70L64 86L60 70L44 64L60 58Z"
            fill="#111A35"
            stroke={accent}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <circle cx="64" cy="64" r="4" fill={accent} />
          <circle cx="64" cy="64" r="1.8" fill="#FFFFFF" />
        </g>
      )}

      {type === 'helicopter' && (
        <g id="carto-helicopter">
          {/* Aerial Scout Beacon Reticle */}
          {/* Dual Altitude Winglets / Rotor Axis */}
          <line x1="28" y1="52" x2="100" y2="52" stroke={accent} strokeWidth="2.2" strokeLinecap="round" />
          <line x1="34" y1="44" x2="94" y2="44" stroke={accent} strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.7" />
          <line x1="64" y1="38" x2="64" y2="82" stroke={accent} strokeWidth="2.0" strokeLinecap="round" />
          {/* Aerial Quad Footprint */}
          <circle cx="44" cy="84" r="2.5" fill={accent} />
          <circle cx="84" cy="84" r="2.5" fill={accent} />
          <path d="M44 84L54 70H74L84 84" stroke={accent} strokeWidth="1.5" fill="none" />
          {/* Fuselage core box */}
          <rect x="54" y="60" width="20" height="14" rx="2" fill="#111A35" stroke={accent} strokeWidth="1.6" />
          <circle cx="64" cy="67" r="3.5" fill={accent} />
          <circle cx="64" cy="67" r="1.5" fill="#FFFFFF" />
        </g>
      )}

      {type === 'landmark' && (
        <g id="carto-landmark">
          {/* Geological Elevation Reticle */}
          {/* Contour elevation arcs */}
          <path d="M34 86C44 76 84 76 94 86" stroke={accent} strokeWidth="1.2" strokeOpacity="0.5" fill="none" />
          <path d="M40 74C48 66 80 66 88 74" stroke={accent} strokeWidth="1.4" strokeOpacity="0.7" fill="none" />
          {/* Summit Elevation Trigon */}
          <polygon
            points="64,32 94,88 34,88"
            stroke={accent}
            strokeWidth="2.2"
            fill="#111A35"
            fillOpacity="0.85"
            strokeLinejoin="round"
          />
          {/* Summit Crater / Apex Star */}
          <circle cx="64" cy="54" r="6" stroke={accent} strokeWidth="1.4" fill="none" />
          <circle cx="64" cy="32" r="3.5" fill={accent} />
          <circle cx="64" cy="32" r="1.5" fill="#FFFFFF" />
        </g>
      )}
    </svg>
  );
};

// Texture cache for 3D astronomical cartography sprites
const spriteTextureCache = new Map<string, THREE.CanvasTexture>();

/**
 * Renders an illuminated astronomical cartography reticle onto an HTML5 Canvas.
 * Generates an elegant, geospatially anchored surface reticle texture.
 */
export function getMonumentSpriteTexture(type: MonumentType, body?: string): THREE.CanvasTexture {
  const isLandmark = type === 'landmark';
  const resolvedBody = isLandmark ? 'landmark' : body || 'generic';
  const cacheKey = `${type}_${resolvedBody}`;

  if (spriteTextureCache.has(cacheKey)) {
    return spriteTextureCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  const colors = getDestinationAccentColor(resolvedBody);
  const accent = colors.primary;

  ctx.clearRect(0, 0, 128, 128);

  // 1. Subtle radial bloom halo for central illumination
  const haloGrad = ctx.createRadialGradient(64, 64, 6, 64, 64, 56);
  haloGrad.addColorStop(0, colors.glow);
  haloGrad.addColorStop(0.45, 'rgba(17, 26, 53, 0.4)');
  haloGrad.addColorStop(1, 'rgba(8, 11, 29, 0)');
  ctx.fillStyle = haloGrad;
  ctx.beginPath();
  ctx.arc(64, 64, 58, 0, Math.PI * 2);
  ctx.fill();

  // 2. Translucent dark cosmic observatory backing disc
  ctx.beginPath();
  ctx.arc(64, 64, 52, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(8, 11, 29, 0.90)';
  ctx.fill();

  // 3. Precision hairline outer ring
  ctx.lineWidth = 1.6;
  ctx.strokeStyle = accent;
  ctx.stroke();

  // 4. Inner dashed coordinate ring
  ctx.beginPath();
  ctx.arc(64, 64, 44, 0, Math.PI * 2);
  ctx.lineWidth = 0.8;
  ctx.setLineDash([3, 4]);
  ctx.strokeStyle = colors.glow;
  ctx.stroke();
  ctx.setLineDash([]); // Reset dash

  // 5. Cardinal coordinate ticks (Astronomical reticle)
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(64, 8); ctx.lineTo(64, 16);
  ctx.moveTo(64, 112); ctx.lineTo(64, 120);
  ctx.moveTo(8, 64); ctx.lineTo(16, 64);
  ctx.moveTo(112, 64); ctx.lineTo(120, 64);
  ctx.stroke();

  // Corner orientation micro-dots
  ctx.fillStyle = colors.glow;
  const corners = [
    { x: 34, y: 34 },
    { x: 94, y: 34 },
    { x: 34, y: 94 },
    { x: 94, y: 94 },
  ];
  corners.forEach((c) => {
    ctx.beginPath();
    ctx.arc(c.x, c.y, 1.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // 6. Draw Category-Specific Precision Astronomical Cartography Glyph
  ctx.save();
  ctx.fillStyle = '#111A35';
  ctx.strokeStyle = accent;

  if (type === 'rover') {
    // Navigation Diamond with axis crosshairs
    ctx.lineWidth = 1.0;
    ctx.strokeStyle = colors.glow;
    ctx.beginPath();
    ctx.moveTo(42, 64); ctx.lineTo(86, 64);
    ctx.moveTo(64, 42); ctx.lineTo(64, 86);
    ctx.stroke();

    // Diamond reticle
    ctx.lineWidth = 2.0;
    ctx.strokeStyle = accent;
    ctx.beginPath();
    ctx.moveTo(64, 42); ctx.lineTo(86, 64); ctx.lineTo(64, 86); ctx.lineTo(42, 64);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cardinal corner ticks
    ctx.strokeStyle = '#F5F0E8';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(52, 58); ctx.lineTo(50, 58); ctx.lineTo(50, 60);
    ctx.moveTo(76, 58); ctx.lineTo(78, 58); ctx.lineTo(78, 60);
    ctx.stroke();

    // Central beacon core
    ctx.beginPath();
    ctx.arc(64, 64, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = accent;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(64, 64, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
  } else if (type === 'lander') {
    // 3-axis landing station tripod
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = accent;
    ctx.beginPath();
    ctx.moveTo(64, 64); ctx.lineTo(42, 84);
    ctx.moveTo(64, 64); ctx.lineTo(86, 84);
    ctx.moveTo(64, 64); ctx.lineTo(64, 40);
    ctx.stroke();

    // Station central polygon
    ctx.beginPath();
    ctx.moveTo(64, 50); ctx.lineTo(76, 57); ctx.lineTo(76, 71);
    ctx.lineTo(64, 78); ctx.lineTo(52, 71); ctx.lineTo(52, 57);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Footpads
    ctx.beginPath();
    ctx.arc(42, 84, 3, 0, Math.PI * 2);
    ctx.arc(86, 84, 3, 0, Math.PI * 2);
    ctx.arc(64, 40, 3, 0, Math.PI * 2);
    ctx.fillStyle = accent;
    ctx.fill();

    // Core beacon
    ctx.beginPath();
    ctx.arc(64, 64, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
  } else if (type === 'probe') {
    // Interstellar 8-point celestial star & orbit arcs
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = colors.glow;
    ctx.beginPath();
    ctx.arc(64, 64, 18, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(64, 34); ctx.lineTo(64, 94);
    ctx.moveTo(34, 64); ctx.lineTo(94, 64);
    ctx.stroke();

    // Celestial Star polygon
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = accent;
    ctx.beginPath();
    ctx.moveTo(64, 44); ctx.lineTo(67, 59); ctx.lineTo(82, 64);
    ctx.lineTo(67, 69); ctx.lineTo(64, 84); ctx.lineTo(61, 69);
    ctx.lineTo(46, 64); ctx.lineTo(61, 59);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Core beacon
    ctx.beginPath();
    ctx.arc(64, 64, 4, 0, Math.PI * 2);
    ctx.fillStyle = accent;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(64, 64, 1.8, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
  } else if (type === 'helicopter') {
    // Aerial Scout Winglets & Mast
    ctx.lineWidth = 2.0;
    ctx.strokeStyle = accent;
    ctx.beginPath();
    ctx.moveTo(32, 52); ctx.lineTo(96, 52);
    ctx.moveTo(38, 44); ctx.lineTo(90, 44);
    ctx.moveTo(64, 40); ctx.lineTo(64, 80);
    ctx.stroke();

    // Aerial Fuselage
    ctx.beginPath();
    ctx.roundRect(54, 58, 20, 14, 2);
    ctx.fill();
    ctx.stroke();

    // Skids
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(46, 82); ctx.lineTo(54, 72); ctx.lineTo(74, 72); ctx.lineTo(82, 82);
    ctx.stroke();

    // Core beacon
    ctx.beginPath();
    ctx.arc(64, 65, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = accent;
    ctx.fill();
  } else if (type === 'landmark') {
    // Geological Elevation Trigon
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = colors.glow;
    ctx.beginPath();
    ctx.arc(64, 70, 20, Math.PI * 0.9, Math.PI * 0.1, true);
    ctx.stroke();

    ctx.lineWidth = 2.0;
    ctx.strokeStyle = accent;
    ctx.beginPath();
    ctx.moveTo(64, 34); ctx.lineTo(92, 86); ctx.lineTo(36, 86);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Summit Beacon
    ctx.beginPath();
    ctx.arc(64, 34, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = accent;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(64, 34, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
  }
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  spriteTextureCache.set(cacheKey, texture);
  return texture;
}

// Texture caches for labels and selection halos
const labelTextureCache = new Map<string, THREE.CanvasTexture>();
let selectionHaloTexture: THREE.CanvasTexture | null = null;

function getSelectionHaloTexture(): THREE.CanvasTexture {
  if (selectionHaloTexture) return selectionHaloTexture;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, 128, 128);

  // Concentric astronomical selection targeting reticle
  const grad = ctx.createRadialGradient(64, 64, 30, 64, 64, 62);
  grad.addColorStop(0, 'rgba(255, 198, 109, 0.25)');
  grad.addColorStop(0.8, 'rgba(88, 217, 255, 0.45)');
  grad.addColorStop(1, 'rgba(88, 217, 255, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(64, 64, 62, 0, Math.PI * 2);
  ctx.fill();

  // Outer glowing pulse ring
  ctx.beginPath();
  ctx.arc(64, 64, 58, 0, Math.PI * 2);
  ctx.strokeStyle = '#58D9FF';
  ctx.lineWidth = 2.4;
  ctx.stroke();

  // Concentric dashed inner reticle ring
  ctx.beginPath();
  ctx.arc(64, 64, 50, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255, 198, 109, 0.85)';
  ctx.lineWidth = 1.4;
  ctx.setLineDash([4, 4]);
  ctx.stroke();

  // Cardinal target ticks
  ctx.strokeStyle = '#58D9FF';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(64, 2); ctx.lineTo(64, 10);
  ctx.moveTo(64, 118); ctx.lineTo(64, 126);
  ctx.moveTo(2, 64); ctx.lineTo(10, 64);
  ctx.moveTo(118, 64); ctx.lineTo(126, 64);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  selectionHaloTexture = tex;
  return tex;
}

export function getLabelSpriteTexture(text: string, subtitle?: string): THREE.CanvasTexture {
  const cacheKey = `${text}_${subtitle || ''}`;
  if (labelTextureCache.has(cacheKey)) {
    return labelTextureCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, 512, 128);

  // Elegant astronomical cartography pill with dark cosmic backdrop
  ctx.beginPath();
  ctx.roundRect(16, 20, 480, 88, 24);
  ctx.fillStyle = 'rgba(8, 11, 29, 0.92)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(88, 217, 255, 0.65)';
  ctx.lineWidth = 2.0;
  ctx.stroke();

  // Subtle interior accent line
  ctx.beginPath();
  ctx.roundRect(20, 24, 472, 80, 20);
  ctx.strokeStyle = 'rgba(245, 240, 232, 0.12)';
  ctx.lineWidth = 1.0;
  ctx.stroke();

  if (subtitle) {
    // Two-line label (Name + Subtitle/Distance)
    ctx.font = 'bold 28px "Inter", "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#F5F0E8';
    ctx.fillText(text, 256, 56);

    ctx.font = '500 20px "JetBrains Mono", monospace';
    ctx.fillStyle = '#58D9FF';
    ctx.fillText(subtitle, 256, 90);
  } else {
    // Single line title
    ctx.font = 'bold 32px "Inter", "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#F5F0E8';
    ctx.fillText(text, 256, 64);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  labelTextureCache.set(cacheKey, tex);
  return tex;
}

// Materials for Selection Ring and Hit Target
const selectionRingMat = new THREE.MeshBasicMaterial({
  color: 0x58d9ff,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.95,
});

const invisibleHitMat = new THREE.MeshBasicMaterial({
  visible: false,
});

/**
 * Builds an illuminated, geospatially anchored astronomical cartography monument group.
 */
export function createMonumentSymbol(
  item: LandingSite3D | MarsLandmark,
  extraData?: Record<string, unknown>
): THREE.Group {
  const isLandmark = 'type' in item;
  const type = getMonumentType(item);
  const body = !isLandmark ? (item as LandingSite3D).body : 'mars';
  const group = new THREE.Group();

  // Root data preserved for interactions
  group.userData = {
    isMarkerRoot: true,
    id: item.id,
    name: item.name,
    body: body,
    monumentType: type,
    isLandingSite: !isLandmark,
    isLandmark: isLandmark,
    siteData: !isLandmark ? item : undefined,
    landmarkData: isLandmark ? item : undefined,
    ...extraData,
  };

  // 1. Crisp Astronomical Cartography Billboard Sprite
  const texture = getMonumentSpriteTexture(type, body);
  const spriteMat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: true,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.name = 'monumentSprite';
  sprite.position.y = 0.55;
  sprite.scale.set(1.35, 1.35, 1.0);
  sprite.userData = { markerRole: 'monumentSprite' };
  group.add(sprite);

  // 2. Base Highlight Selection Ring (Lies flush on planetary ground)
  const selRing = new THREE.Mesh(
    new THREE.RingGeometry(0.55, 0.85, 32),
    selectionRingMat
  );
  selRing.name = 'selectionRing';
  selRing.rotation.x = -Math.PI / 2;
  selRing.position.y = 0.02;
  selRing.visible = false;
  selRing.userData = { markerRole: 'selectionRing' };
  group.add(selRing);

  // 3. Billboard Selection Halo (For free-space and deep-space objects)
  const haloMat = new THREE.SpriteMaterial({
    map: getSelectionHaloTexture(),
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });
  const selHalo = new THREE.Sprite(haloMat);
  selHalo.name = 'selectionHalo';
  selHalo.position.y = 0.55;
  selHalo.scale.set(2.4, 2.4, 1.0);
  selHalo.visible = false;
  selHalo.userData = { markerRole: 'selectionHalo' };
  group.add(selHalo);

  // 4. Text Label Sprite (Always attached; visible dynamically on hover/selection for surface sites, permanently for deep space)
  const isDeepSpace = body === 'deep-space' || extraData?.showLabel === true;
  const labelText = (extraData?.labelText as string) || item.name;
  const labelSubtitle = extraData?.labelSubtitle as string | undefined;
  const labelMat = new THREE.SpriteMaterial({
    map: getLabelSpriteTexture(labelText, labelSubtitle),
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });
  const labelScale = (extraData?.labelScale as [number, number, number]) || [3.8, 0.95, 1.0];
  const labelOffsetY = (extraData?.labelOffsetY as number) ?? (isDeepSpace ? -2.2 : 1.7);
  const labelSprite = new THREE.Sprite(labelMat);
  labelSprite.name = 'labelSprite';
  labelSprite.position.set(0, labelOffsetY, 0);
  labelSprite.scale.set(labelScale[0], labelScale[1], labelScale[2]);
  // Surface labels start hidden so planetary surface is uncluttered; revealed on hover/selection
  labelSprite.visible = isDeepSpace;
  labelSprite.userData = {
    markerRole: 'labelSprite',
    originalScale: labelScale,
    alwaysVisible: isDeepSpace,
  };
  group.add(labelSprite);

  // 5. Generous Invisible Hit-Sphere for effortless touch / mouse raycasting
  const hitRadius = (extraData?.hitRadius as number) || 0.95;
  const hitSphere = new THREE.Mesh(
    new THREE.SphereGeometry(hitRadius, 8, 8),
    invisibleHitMat
  );
  hitSphere.position.y = 0.55;
  hitSphere.userData = { markerRole: 'hitSphere' };
  group.add(hitSphere);

  return group;
}

/**
 * Synchronizes the visible selection highlight and label scaling on the active monument across all groups.
 */
export function updateMonumentSelection(
  groups: (THREE.Group | null)[],
  selectedId: string | null
): void {
  groups.forEach((g) => {
    if (!g) return;
    g.traverse((obj) => {
      let markerRoot: THREE.Object3D | null = obj;
      while (markerRoot && !markerRoot.userData?.isMarkerRoot && markerRoot.parent) {
        markerRoot = markerRoot.parent;
      }
      const rootId = markerRoot?.userData?.id;
      const isSelected = !!(selectedId && rootId === selectedId);

      if (obj.name === 'selectionRing') {
        obj.visible = isSelected;
      }
      if (obj.name === 'selectionHalo') {
        obj.visible = isSelected;
      }
      if (obj.name === 'monumentSprite') {
        const sprite = obj as THREE.Sprite;
        if (isSelected) {
          sprite.scale.set(1.65, 1.65, 1.0);
        } else {
          sprite.scale.set(1.35, 1.35, 1.0);
        }
      }
      if (obj.name === 'labelSprite') {
        const sprite = obj as THREE.Sprite;
        const orig = sprite.userData?.originalScale as [number, number, number] | undefined;
        const alwaysVisible = !!sprite.userData?.alwaysVisible;
        const baseW = orig ? orig[0] : 3.8;
        const baseH = orig ? orig[1] : 0.95;
        const baseD = orig ? orig[2] : 1.0;

        if (isSelected) {
          sprite.visible = true;
          sprite.scale.set(baseW * 1.15, baseH * 1.15, baseD);
        } else {
          sprite.visible = alwaysVisible;
          sprite.scale.set(baseW, baseH, baseD);
        }
      }
    });
  });
}
