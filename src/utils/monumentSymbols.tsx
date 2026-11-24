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
 * High-precision React SVG Vector Icon Component.
 * Shared across Search, Visual Legend, Dossier Headers, and UI Badges.
 */
export const MonumentIcon: React.FC<{
  type: MonumentType;
  className?: string;
  size?: number;
}> = ({ type, className = 'w-6 h-6', size = 28 }) => {
  const isLandmark = type === 'landmark';
  const rimColor = isLandmark ? '#38BDF8' : '#C6A36B';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer circular badge background */}
      <circle cx="64" cy="64" r="60" fill="#080D16" fillOpacity="0.92" />
      <circle cx="64" cy="64" r="59" stroke={rimColor} strokeWidth="2" strokeOpacity="0.8" />
      <circle cx="64" cy="64" r="54" stroke={rimColor} strokeWidth="0.8" strokeDasharray="3 4" strokeOpacity="0.35" />

      {/* Cardinal tick marks */}
      <line x1="64" y1="4" x2="64" y2="10" stroke={rimColor} strokeWidth="1.5" strokeOpacity="0.6" />
      <line x1="64" y1="118" x2="64" y2="124" stroke={rimColor} strokeWidth="1.5" strokeOpacity="0.6" />
      <line x1="4" y1="64" x2="10" y2="64" stroke={rimColor} strokeWidth="1.5" strokeOpacity="0.6" />
      <line x1="118" y1="64" x2="124" y2="64" stroke={rimColor} strokeWidth="1.5" strokeOpacity="0.6" />

      {/* Icon Specific Artwork */}
      {type === 'rover' && (
        <g id="rover-symbol">
          {/* Suspension Rocker-Bogie Linkages */}
          <path d="M42 74L30 92H44L56 74" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M56 74L68 94H82L86 74" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M86 74L98 90H108" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* 6 Clearly Distinguishable Wheels */}
          {[
            { cx: 28, cy: 92 },
            { cx: 44, cy: 94 },
            { cx: 66, cy: 94 },
            { cx: 82, cy: 94 },
            { cx: 98, cy: 90 },
            { cx: 108, cy: 88 },
          ].map((w, idx) => (
            <g key={idx}>
              <circle cx={w.cx} cy={w.cy} r="6.5" fill="#1E293B" stroke="#E2E8F0" strokeWidth="1.8" />
              <circle cx={w.cx} cy={w.cy} r="2.5" fill="#C6A36B" />
            </g>
          ))}

          {/* Central Scientific Chassis Body */}
          <path d="M38 60H92L88 74H36L38 60Z" fill="#C6A36B" stroke="#F0E8D9" strokeWidth="2" strokeLinejoin="round" />
          {/* Chassis top equipment details */}
          <rect x="42" y="55" width="22" height="5" rx="1.5" fill="#F0E8D9" />
          <rect x="68" y="56" width="16" height="4" rx="1" fill="#94A3B8" />

          {/* Rear RTG Generator / High-gain UHF Antenna */}
          <path d="M42 55L34 44" stroke="#F0E8D9" strokeWidth="2" strokeLinecap="round" />
          <circle cx="34" cy="44" r="3.5" fill="#C6A36B" stroke="#F0E8D9" strokeWidth="1.2" />

          {/* Front Camera Mast & Dual Stereo Sensor Head */}
          <line x1="84" y1="55" x2="84" y2="34" stroke="#F0E8D9" strokeWidth="2.8" strokeLinecap="round" />
          <rect x="76" y="28" width="16" height="8" rx="2" fill="#1E293B" stroke="#C6A36B" strokeWidth="1.8" />
          <circle cx="80" cy="32" r="2" fill="#38BDF8" />
          <circle cx="88" cy="32" r="2" fill="#38BDF8" />

          {/* Robotic Instrument Arm extending forward */}
          <path d="M88 68L100 76L108 80" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}

      {type === 'lander' && (
        <g id="lander-symbol">
          {/* 3 Splayed Landing Legs with Footpads */}
          {/* Left leg */}
          <path d="M44 74L26 98" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="20" y1="98" x2="32" y2="98" stroke="#F0E8D9" strokeWidth="2.8" strokeLinecap="round" />
          {/* Center leg */}
          <path d="M64 78L64 104" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="58" y1="104" x2="70" y2="104" stroke="#F0E8D9" strokeWidth="2.8" strokeLinecap="round" />
          {/* Right leg */}
          <path d="M84 74L102 98" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="96" y1="98" x2="108" y2="98" stroke="#F0E8D9" strokeWidth="2.8" strokeLinecap="round" />

          {/* Core Octagonal Scientific Deck (Gold Thermal Foil) */}
          <path d="M42 58L52 50H76L86 58L84 76L76 80H52L44 76L42 58Z" fill="#C6A36B" stroke="#F0E8D9" strokeWidth="2" strokeLinejoin="round" />
          {/* Equipment bay panels */}
          <rect x="52" y="56" width="24" height="18" rx="1.5" fill="#1E293B" stroke="#C6A36B" strokeWidth="1.2" />
          <line x1="64" y1="56" x2="64" y2="74" stroke="#C6A36B" strokeWidth="1" />

          {/* Parabolic High-Gain Dish Antenna */}
          <path d="M48 44Q64 36 80 44" stroke="#F0E8D9" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <line x1="64" y1="40" x2="64" y2="50" stroke="#F0E8D9" strokeWidth="2" />
          <circle cx="64" cy="34" r="2.5" fill="#C6A36B" />

          {/* Meteorology Mast & Sample Arm */}
          <line x1="46" y1="54" x2="38" y2="38" stroke="#94A3B8" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="38" cy="38" r="1.8" fill="#F0E8D9" />
          <path d="M82 72L96 78L104 86" stroke="#94A3B8" strokeWidth="1.8" strokeLinecap="round" />
        </g>
      )}

      {type === 'probe' && (
        <g id="probe-symbol">
          {/* Two Distinct Extended Solar Panel Wings */}
          {/* Left Solar Array */}
          <g>
            <rect x="12" y="52" width="36" height="24" rx="2" fill="#1E293B" stroke="#38BDF8" strokeWidth="1.8" />
            <line x1="24" y1="52" x2="24" y2="76" stroke="#38BDF8" strokeWidth="1" strokeOpacity="0.7" />
            <line x1="36" y1="52" x2="36" y2="76" stroke="#38BDF8" strokeWidth="1" strokeOpacity="0.7" />
            <line x1="12" y1="64" x2="48" y2="64" stroke="#C6A36B" strokeWidth="1" />
          </g>
          {/* Right Solar Array */}
          <g>
            <rect x="80" y="52" width="36" height="24" rx="2" fill="#1E293B" stroke="#38BDF8" strokeWidth="1.8" />
            <line x1="92" y1="52" x2="92" y2="76" stroke="#38BDF8" strokeWidth="1" strokeOpacity="0.7" />
            <line x1="104" y1="52" x2="104" y2="76" stroke="#38BDF8" strokeWidth="1" strokeOpacity="0.7" />
            <line x1="80" y1="64" x2="116" y2="64" stroke="#C6A36B" strokeWidth="1" />
          </g>

          {/* Symmetrical Solar Booms connecting to bus */}
          <line x1="48" y1="64" x2="52" y2="64" stroke="#F0E8D9" strokeWidth="2.5" />
          <line x1="76" y1="64" x2="80" y2="64" stroke="#F0E8D9" strokeWidth="2.5" />

          {/* Central Spacecraft Bus */}
          <rect x="52" y="48" width="24" height="32" rx="3" fill="#C6A36B" stroke="#F0E8D9" strokeWidth="2" />
          <circle cx="64" cy="64" r="5" fill="#1E293B" stroke="#F0E8D9" strokeWidth="1.2" />

          {/* High-Gain Parabolic Dish Antenna (Top) */}
          <path d="M42 42Q64 24 86 42" stroke="#F0E8D9" strokeWidth="3" strokeLinecap="round" fill="none" />
          <line x1="64" y1="33" x2="64" y2="48" stroke="#F0E8D9" strokeWidth="2" />
          <circle cx="64" cy="24" r="3" fill="#C6A36B" stroke="#F0E8D9" strokeWidth="1.5" />

          {/* Magnetometer Boom / Sensor Tip (Bottom) */}
          <line x1="64" y1="80" x2="64" y2="104" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
          <circle cx="64" cy="104" r="2.5" fill="#38BDF8" />
        </g>
      )}

      {type === 'helicopter' && (
        <g id="helicopter-symbol">
          {/* 4 Carbon-Composite Splayed Landing Legs */}
          <path d="M54 74L34 102" stroke="#94A3B8" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="34" cy="102" r="2.2" fill="#F0E8D9" />
          <path d="M58 76L46 104" stroke="#94A3B8" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="46" cy="104" r="2.2" fill="#F0E8D9" />
          <path d="M70 76L82 104" stroke="#94A3B8" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="82" cy="104" r="2.2" fill="#F0E8D9" />
          <path d="M74 74L94 102" stroke="#94A3B8" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="94" cy="102" r="2.2" fill="#F0E8D9" />

          {/* Compact Avionics Fuselage Cube */}
          <rect x="52" y="58" width="24" height="20" rx="3" fill="#C6A36B" stroke="#F0E8D9" strokeWidth="2" />
          <rect x="56" y="62" width="16" height="12" rx="1.5" fill="#1E293B" />
          <circle cx="64" cy="68" r="2.5" fill="#38BDF8" />

          {/* Central Vertical Rotor Mast */}
          <line x1="64" y1="58" x2="64" y2="28" stroke="#F0E8D9" strokeWidth="2.5" strokeLinecap="round" />

          {/* Lower Rotor Blade Pair */}
          <rect x="20" y="46" width="88" height="4.5" rx="2" fill="#E2E8F0" stroke="#1E293B" strokeWidth="1" />
          {/* Upper Counter-Rotating Rotor Blade Pair */}
          <rect x="24" y="35" width="80" height="4.5" rx="2" fill="#F0E8D9" stroke="#1E293B" strokeWidth="1" />

          {/* Solar Panel Top Plate */}
          <rect x="54" y="24" width="20" height="4" rx="1" fill="#C6A36B" stroke="#F0E8D9" strokeWidth="1" />
        </g>
      )}

      {type === 'landmark' && (
        <g id="landmark-symbol">
          {/* Twin Geological Planetary Mountain Peaks / Caldera Ridges */}
          <path
            d="M24 96L58 32L74 62L88 44L104 96H24Z"
            fill="#0F1F38"
            stroke="#38BDF8"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Topographical Contour Ridges */}
          <path d="M38 78Q58 72 78 78" stroke="#38BDF8" strokeWidth="1.5" strokeOpacity="0.8" fill="none" />
          <path d="M48 62Q58 58 68 62" stroke="#38BDF8" strokeWidth="1.5" strokeOpacity="0.8" fill="none" />
          <path d="M78 68Q88 64 96 70" stroke="#38BDF8" strokeWidth="1.5" strokeOpacity="0.8" fill="none" />

          {/* Caldera / Summit Rim Highlight */}
          <path d="M50 46L58 32L66 46Z" fill="#38BDF8" fillOpacity="0.35" stroke="#F0E8D9" strokeWidth="1.2" />

          {/* Summit Beacon Diamond */}
          <polygon points="58,16 63,23 58,30 53,23" fill="#38BDF8" stroke="#F0E8D9" strokeWidth="1.5" />
          <circle cx="58" cy="23" r="1.5" fill="#FFFFFF" />
        </g>
      )}
    </svg>
  );
};

// Cached textures for 3D Sprites
const spriteTextureCache = new Map<MonumentType, THREE.CanvasTexture>();

/**
 * Renders the crisp vector icon onto an HTML5 Canvas and returns a cached THREE.CanvasTexture.
 */
export function getMonumentSpriteTexture(type: MonumentType): THREE.CanvasTexture {
  if (spriteTextureCache.has(type)) {
    return spriteTextureCache.get(type)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  const isLandmark = type === 'landmark';
  const rimColor = isLandmark ? '#38BDF8' : '#C6A36B';

  ctx.clearRect(0, 0, 128, 128);

  // 1. Dark circular backing shield
  ctx.beginPath();
  ctx.arc(64, 64, 60, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(8, 13, 22, 0.92)';
  ctx.fill();

  // 2. Outer hairline border
  ctx.lineWidth = 2.2;
  ctx.strokeStyle = rimColor;
  ctx.stroke();

  // Inner dashed rim
  ctx.beginPath();
  ctx.arc(64, 64, 54, 0, Math.PI * 2);
  ctx.lineWidth = 0.8;
  ctx.setLineDash([3, 4]);
  ctx.strokeStyle = isLandmark ? 'rgba(56, 189, 248, 0.4)' : 'rgba(198, 163, 107, 0.4)';
  ctx.stroke();
  ctx.setLineDash([]); // Reset dash

  // Cardinal tick marks
  ctx.strokeStyle = rimColor;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(64, 4); ctx.lineTo(64, 10);
  ctx.moveTo(64, 118); ctx.lineTo(64, 124);
  ctx.moveTo(4, 64); ctx.lineTo(10, 64);
  ctx.moveTo(118, 64); ctx.lineTo(124, 64);
  ctx.stroke();

  // 3. Draw Category-Specific Vector Silhouette
  if (type === 'rover') {
    // Suspension struts
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(42, 74); ctx.lineTo(30, 92); ctx.lineTo(44, 92); ctx.lineTo(56, 74);
    ctx.moveTo(56, 74); ctx.lineTo(68, 94); ctx.lineTo(82, 94); ctx.lineTo(86, 74);
    ctx.moveTo(86, 74); ctx.lineTo(98, 90); ctx.lineTo(108, 90);
    ctx.stroke();

    // 6 Wheels
    const wheels = [
      { cx: 28, cy: 92 },
      { cx: 44, cy: 94 },
      { cx: 66, cy: 94 },
      { cx: 82, cy: 94 },
      { cx: 98, cy: 90 },
      { cx: 108, cy: 88 },
    ];
    wheels.forEach((w) => {
      ctx.beginPath();
      ctx.arc(w.cx, w.cy, 6.5, 0, Math.PI * 2);
      ctx.fillStyle = '#1E293B';
      ctx.fill();
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1.8;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(w.cx, w.cy, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#C6A36B';
      ctx.fill();
    });

    // Scientific Chassis Deck
    ctx.beginPath();
    ctx.moveTo(38, 60); ctx.lineTo(92, 60); ctx.lineTo(88, 74); ctx.lineTo(36, 74); ctx.closePath();
    ctx.fillStyle = '#C6A36B';
    ctx.fill();
    ctx.strokeStyle = '#F0E8D9';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Rear Antenna / RTG
    ctx.beginPath();
    ctx.moveTo(42, 55); ctx.lineTo(34, 44);
    ctx.strokeStyle = '#F0E8D9';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(34, 44, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#C6A36B';
    ctx.fill();
    ctx.stroke();

    // Camera Mast & Stereo Head
    ctx.beginPath();
    ctx.moveTo(84, 55); ctx.lineTo(84, 34);
    ctx.strokeStyle = '#F0E8D9';
    ctx.lineWidth = 2.8;
    ctx.stroke();

    ctx.beginPath();
    ctx.roundRect(76, 28, 16, 8, 2);
    ctx.fillStyle = '#1E293B';
    ctx.fill();
    ctx.strokeStyle = '#C6A36B';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(80, 32, 2, 0, Math.PI * 2);
    ctx.arc(88, 32, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#38BDF8';
    ctx.fill();
  } else if (type === 'lander') {
    // 3 Splayed Legs with Footpads
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(44, 74); ctx.lineTo(26, 98);
    ctx.moveTo(64, 78); ctx.lineTo(64, 104);
    ctx.moveTo(84, 74); ctx.lineTo(102, 98);
    ctx.stroke();

    ctx.strokeStyle = '#F0E8D9';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(20, 98); ctx.lineTo(32, 98);
    ctx.moveTo(58, 104); ctx.lineTo(70, 104);
    ctx.moveTo(96, 98); ctx.lineTo(108, 98);
    ctx.stroke();

    // Core Octagonal Body
    ctx.beginPath();
    ctx.moveTo(42, 58); ctx.lineTo(52, 50); ctx.lineTo(76, 50); ctx.lineTo(86, 58);
    ctx.lineTo(84, 76); ctx.lineTo(76, 80); ctx.lineTo(52, 80); ctx.lineTo(44, 76); ctx.closePath();
    ctx.fillStyle = '#C6A36B';
    ctx.fill();
    ctx.strokeStyle = '#F0E8D9';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Central Instrument Bay
    ctx.beginPath();
    ctx.roundRect(52, 56, 24, 18, 2);
    ctx.fillStyle = '#1E293B';
    ctx.fill();
    ctx.strokeStyle = '#C6A36B';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Parabolic High-Gain Dish (Top)
    ctx.beginPath();
    ctx.arc(64, 34, 16, 0.4, Math.PI - 0.4);
    ctx.strokeStyle = '#F0E8D9';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(64, 40); ctx.lineTo(64, 50);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(64, 34, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#C6A36B';
    ctx.fill();
  } else if (type === 'probe') {
    // Solar Array Wings
    // Left
    ctx.beginPath();
    ctx.roundRect(12, 52, 36, 24, 2);
    ctx.fillStyle = '#1E293B';
    ctx.fill();
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(24, 52); ctx.lineTo(24, 76);
    ctx.moveTo(36, 52); ctx.lineTo(36, 76);
    ctx.moveTo(12, 64); ctx.lineTo(48, 64);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Right
    ctx.beginPath();
    ctx.roundRect(80, 52, 36, 24, 2);
    ctx.fillStyle = '#1E293B';
    ctx.fill();
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(92, 52); ctx.lineTo(92, 76);
    ctx.moveTo(104, 52); ctx.lineTo(104, 76);
    ctx.moveTo(80, 64); ctx.lineTo(116, 64);
    ctx.stroke();

    // Symmetrical Booms
    ctx.strokeStyle = '#F0E8D9';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(48, 64); ctx.lineTo(52, 64);
    ctx.moveTo(76, 64); ctx.lineTo(80, 64);
    ctx.stroke();

    // Central Spacecraft Bus
    ctx.beginPath();
    ctx.roundRect(52, 48, 24, 32, 3);
    ctx.fillStyle = '#C6A36B';
    ctx.fill();
    ctx.strokeStyle = '#F0E8D9';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(64, 64, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#1E293B';
    ctx.fill();
    ctx.strokeStyle = '#F0E8D9';
    ctx.stroke();

    // Parabolic High-Gain Dish (Top)
    ctx.beginPath();
    ctx.arc(64, 24, 22, 0.5, Math.PI - 0.5);
    ctx.strokeStyle = '#F0E8D9';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(64, 33); ctx.lineTo(64, 48);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(64, 24, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#C6A36B';
    ctx.fill();
  } else if (type === 'helicopter') {
    // 4 Splayed Legs
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(54, 74); ctx.lineTo(34, 102);
    ctx.moveTo(58, 76); ctx.lineTo(46, 104);
    ctx.moveTo(70, 76); ctx.lineTo(82, 104);
    ctx.moveTo(74, 74); ctx.lineTo(94, 102);
    ctx.stroke();

    // Fuselage Box
    ctx.beginPath();
    ctx.roundRect(52, 58, 24, 20, 3);
    ctx.fillStyle = '#C6A36B';
    ctx.fill();
    ctx.strokeStyle = '#F0E8D9';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.roundRect(56, 62, 16, 12, 1.5);
    ctx.fillStyle = '#1E293B';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(64, 68, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#38BDF8';
    ctx.fill();

    // Rotor Mast
    ctx.beginPath();
    ctx.moveTo(64, 58); ctx.lineTo(64, 28);
    ctx.strokeStyle = '#F0E8D9';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Twin Rotor Blades
    ctx.beginPath();
    ctx.roundRect(20, 46, 88, 4.5, 2);
    ctx.fillStyle = '#E2E8F0';
    ctx.fill();
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.roundRect(24, 35, 80, 4.5, 2);
    ctx.fillStyle = '#F0E8D9';
    ctx.fill();
    ctx.stroke();

    // Solar Panel Cap
    ctx.beginPath();
    ctx.roundRect(54, 24, 20, 4, 1);
    ctx.fillStyle = '#C6A36B';
    ctx.fill();
    ctx.strokeStyle = '#F0E8D9';
    ctx.stroke();
  } else if (type === 'landmark') {
    // Mountain Peaks / Caldera
    ctx.beginPath();
    ctx.moveTo(24, 96); ctx.lineTo(58, 32); ctx.lineTo(74, 62); ctx.lineTo(88, 44); ctx.lineTo(104, 96);
    ctx.closePath();
    ctx.fillStyle = '#0F1F38';
    ctx.fill();
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Contour Lines
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(38, 78); ctx.quadraticCurveTo(58, 72, 78, 78);
    ctx.moveTo(48, 62); ctx.quadraticCurveTo(58, 58, 68, 62);
    ctx.moveTo(78, 68); ctx.quadraticCurveTo(88, 64, 96, 70);
    ctx.stroke();

    // Summit Beacon
    ctx.beginPath();
    ctx.moveTo(58, 16); ctx.lineTo(63, 23); ctx.lineTo(58, 30); ctx.lineTo(53, 23); ctx.closePath();
    ctx.fillStyle = '#38BDF8';
    ctx.fill();
    ctx.strokeStyle = '#F0E8D9';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  spriteTextureCache.set(type, texture);
  return texture;
}

// Materials for Selection Ring and Hit Target
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
 * Builds a clean, recognizable vector sprite monument billboard group.
 */
export function createMonumentSymbol(
  item: LandingSite3D | MarsLandmark,
  extraData?: Record<string, unknown>
): THREE.Group {
  const isLandmark = 'type' in item;
  const type = getMonumentType(item);
  const group = new THREE.Group();

  // Root data preserved for interactions
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

  // 1. Crisp Vector Sprite Billboard
  const texture = getMonumentSpriteTexture(type);
  const spriteMat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: true,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.name = 'monumentSprite';
  // Positioned slightly above the planet surface
  sprite.position.y = 0.55;
  sprite.scale.set(1.35, 1.35, 1.0);
  sprite.userData = group.userData;
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
  group.add(selRing);

  // 3. Generous Invisible Hit-Sphere for effortless touch / mouse raycasting
  const hitSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.85, 8, 8),
    invisibleHitMat
  );
  hitSphere.position.y = 0.55;
  hitSphere.userData = group.userData;
  group.add(hitSphere);

  return group;
}

/**
 * Synchronizes the visible golden selection highlight on the active monument across all groups.
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
      if (obj.name === 'monumentSprite') {
        const parentId = obj.parent?.userData?.id;
        const isSelected = !!(selectedId && parentId === selectedId);
        const sprite = obj as THREE.Sprite;
        if (isSelected) {
          sprite.scale.set(1.65, 1.65, 1.0);
        } else {
          sprite.scale.set(1.35, 1.35, 1.0);
        }
      }
    });
  });
}
