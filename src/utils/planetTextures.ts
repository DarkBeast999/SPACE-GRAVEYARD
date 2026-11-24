import * as THREE from 'three';

/**
 * Procedural planet texture generator using Offscreen/Canvas2D.
 * Guarantees 100% offline functionality, instantaneous load, zero network dependencies.
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

export function createMercuryTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Warm grey-brown heavily cratered regolith base
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#756D65');
  grad.addColorStop(0.3, '#948B80');
  grad.addColorStop(0.5, '#877E73');
  grad.addColorStop(0.7, '#6E665E');
  grad.addColorStop(1, '#7A7269');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Caloris Basin / smooth plains albedo patches
  ctx.fillStyle = 'rgba(50, 46, 42, 0.4)';
  const plains = [
    { x: 0.3 * canvas.width, y: 0.45 * canvas.height, rx: 110, ry: 75 },
    { x: 0.7 * canvas.width, y: 0.35 * canvas.height, rx: 85, ry: 60 },
    { x: 0.52 * canvas.width, y: 0.62 * canvas.height, rx: 130, ry: 80 },
  ];
  plains.forEach((p) => {
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, p.rx, p.ry, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  // Lobate Scarps (wrinkle ridges / fault cliffs)
  ctx.strokeStyle = 'rgba(40, 36, 32, 0.5)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 6; i++) {
    const sx = (0.15 + i * 0.14) * canvas.width;
    const sy = 0.2 * canvas.height;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.bezierCurveTo(
      sx + (Math.random() - 0.5) * 60,
      sy + 100,
      sx + (Math.random() - 0.5) * 60,
      sy + 200,
      sx + (Math.random() - 0.5) * 40,
      sy + 300
    );
    ctx.stroke();
  }

  // Kuiper / Degas Crater bright ray systems
  const rayCraters = [
    { x: 0.62 * canvas.width, y: 0.42 * canvas.height, rays: 16, len: 140 },
    { x: 0.25 * canvas.width, y: 0.68 * canvas.height, rays: 12, len: 110 },
  ];
  rayCraters.forEach((rc) => {
    ctx.strokeStyle = 'rgba(235, 230, 220, 0.45)';
    ctx.lineWidth = 1.5;
    for (let a = 0; a < Math.PI * 2; a += (Math.PI * 2) / rc.rays) {
      ctx.beginPath();
      ctx.moveTo(rc.x, rc.y);
      ctx.lineTo(rc.x + Math.cos(a) * rc.len, rc.y + Math.sin(a) * rc.len);
      ctx.stroke();
    }
  });

  // Dense impact crater field
  for (let i = 0; i < 110; i++) {
    const cx = Math.random() * canvas.width;
    const cy = Math.random() * canvas.height;
    const r = Math.random() * 10 + 2;

    ctx.strokeStyle = 'rgba(225, 220, 210, 0.35)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(35, 32, 28, 0.35)';
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.75, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export function createJupiterTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Dynamic atmospheric zonal cloud belts
  const bands = [
    { stop: 0.0, color: '#967B5C' }, // North Polar Region
    { stop: 0.12, color: '#C8B291' },
    { stop: 0.22, color: '#8F5E38' }, // North Temperate Belt
    { stop: 0.32, color: '#E4D5BA' }, // North Tropical Zone
    { stop: 0.40, color: '#A65329' }, // North Equatorial Belt
    { stop: 0.48, color: '#EBDDC3' }, // Equatorial Zone
    { stop: 0.52, color: '#E2CEAA' },
    { stop: 0.60, color: '#9E4E28' }, // South Equatorial Belt
    { stop: 0.70, color: '#DECDB0' }, // South Tropical Zone
    { stop: 0.78, color: '#7E4C27' }, // South Temperate Belt
    { stop: 0.88, color: '#B5A082' },
    { stop: 1.0, color: '#887055' }, // South Polar Region
  ];

  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bands.forEach((b) => grad.addColorStop(b.stop, b.color));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Atmospheric turbulence and eddy waves
  ctx.lineWidth = 5;
  for (let y = 30; y < canvas.height - 30; y += 24) {
    ctx.strokeStyle = y % 48 === 0 ? 'rgba(255, 245, 230, 0.25)' : 'rgba(90, 40, 15, 0.25)';
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= canvas.width; x += 80) {
      const cy = y + Math.sin(x * 0.02 + y) * 7;
      ctx.lineTo(x, cy);
    }
    ctx.stroke();
  }

  // The Great Red Spot (at ~0.65 Y, ~22° South)
  const grsX = 0.58 * canvas.width;
  const grsY = 0.64 * canvas.height;
  const grsRx = 55;
  const grsRy = 32;

  // Outer turbulent hollow
  ctx.fillStyle = 'rgba(240, 225, 200, 0.6)';
  ctx.beginPath();
  ctx.ellipse(grsX, grsY, grsRx + 12, grsRy + 8, -0.05, 0, Math.PI * 2);
  ctx.fill();

  // Core brick-red anticyclonic oval
  const grsGrad = ctx.createRadialGradient(grsX, grsY, 5, grsX, grsY, grsRx);
  grsGrad.addColorStop(0, '#B3381B');
  grsGrad.addColorStop(0.6, '#C44E28');
  grsGrad.addColorStop(1, '#8C2B14');
  ctx.fillStyle = grsGrad;
  ctx.beginPath();
  ctx.ellipse(grsX, grsY, grsRx, grsRy, -0.05, 0, Math.PI * 2);
  ctx.fill();

  // Inner vortex eye swirl
  ctx.strokeStyle = 'rgba(255, 200, 180, 0.45)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(grsX + 4, grsY - 2, grsRx * 0.55, grsRy * 0.5, -0.05, 0, Math.PI * 2);
  ctx.stroke();

  // Oval BA (Red Spot Jr) nearby
  ctx.fillStyle = '#C25D38';
  ctx.beginPath();
  ctx.ellipse(0.32 * canvas.width, 0.74 * canvas.height, 22, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export function createMarsTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Base Martian red/ochre gradient
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#E88655');
  grad.addColorStop(0.5, '#C45729');
  grad.addColorStop(1, '#B3461D');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Dark albedo regions (Syrtis Major, Acidalia, Sinus Sabaeus)
  ctx.fillStyle = 'rgba(70, 32, 20, 0.45)';
  const darkRegions = [
    { x: 0.65 * canvas.width, y: 0.45 * canvas.height, rx: 90, ry: 60 }, // Syrtis Major
    { x: 0.35 * canvas.width, y: 0.35 * canvas.height, rx: 140, ry: 50 }, // Acidalia
    { x: 0.5 * canvas.width, y: 0.55 * canvas.height, rx: 180, ry: 40 },  // Sinus Sabaeus / Meridiani
    { x: 0.15 * canvas.width, y: 0.52 * canvas.height, rx: 80, ry: 45 },  // Mare Sirenum
  ];
  darkRegions.forEach(reg => {
    ctx.beginPath();
    ctx.ellipse(reg.x, reg.y, reg.rx, reg.ry, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  // Valles Marineris canyon scratch
  ctx.strokeStyle = 'rgba(45, 18, 10, 0.6)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(0.25 * canvas.width, 0.55 * canvas.height);
  ctx.bezierCurveTo(0.35 * canvas.width, 0.57 * canvas.height, 0.45 * canvas.width, 0.53 * canvas.height, 0.55 * canvas.width, 0.56 * canvas.height);
  ctx.stroke();

  // Subtle crater rims
  ctx.strokeStyle = 'rgba(230, 160, 120, 0.35)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 60; i++) {
    const cx = Math.random() * canvas.width;
    const cy = 0.15 * canvas.height + Math.random() * (0.7 * canvas.height);
    const cr = Math.random() * 16 + 4;
    ctx.beginPath();
    ctx.arc(cx, cy, cr, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Polar Ice Caps (Planum Boreum and Planum Australe)
  ctx.fillStyle = 'rgba(245, 248, 255, 0.9)';
  // North Pole
  ctx.beginPath();
  ctx.ellipse(canvas.width / 2, 8, canvas.width * 0.45, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  // South Pole
  ctx.beginPath();
  ctx.ellipse(canvas.width / 2, canvas.height - 8, canvas.width * 0.4, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export function createMoonTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Bright lunar anorthosite highlands base
  ctx.fillStyle = '#C8C9CE';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Basaltic Dark Maria (Ocean of Storms, Sea of Tranquility, etc.)
  ctx.fillStyle = 'rgba(75, 78, 86, 0.65)';
  const maria = [
    { x: 0.38 * canvas.width, y: 0.45 * canvas.height, rx: 130, ry: 90 }, // Oceanus Procellarum
    { x: 0.58 * canvas.width, y: 0.48 * canvas.height, rx: 65, ry: 45 },  // Mare Tranquillitatis
    { x: 0.55 * canvas.width, y: 0.36 * canvas.height, rx: 60, ry: 45 },  // Mare Serenitatis
    { x: 0.42 * canvas.width, y: 0.32 * canvas.height, rx: 75, ry: 50 },  // Mare Imbrium
    { x: 0.68 * canvas.width, y: 0.44 * canvas.height, rx: 45, ry: 45 },  // Mare Crisium
    { x: 0.45 * canvas.width, y: 0.60 * canvas.height, rx: 70, ry: 40 },  // Mare Nubium
  ];
  maria.forEach(m => {
    ctx.beginPath();
    ctx.ellipse(m.x, m.y, m.rx, m.ry, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  // Tycho Crater Rays (bright splash radiating out from southern crater)
  const tychoX = 0.48 * canvas.width;
  const tychoY = 0.75 * canvas.height;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1.5;
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 12) {
    ctx.beginPath();
    ctx.moveTo(tychoX, tychoY);
    ctx.lineTo(tychoX + Math.cos(a) * 160, tychoY + Math.sin(a) * 160);
    ctx.stroke();
  }

  // Scattered impact craters
  for (let i = 0; i < 90; i++) {
    const cx = Math.random() * canvas.width;
    const cy = Math.random() * canvas.height;
    const r = Math.random() * 12 + 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(40, 42, 48, 0.3)';
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.7, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export function createVenusTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Dense sulfuric golden haze
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#E8C582');
  grad.addColorStop(0.3, '#D4A855');
  grad.addColorStop(0.5, '#F0D598');
  grad.addColorStop(0.7, '#C89740');
  grad.addColorStop(1, '#E2BC72');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Atmospheric swirl bands
  ctx.strokeStyle = 'rgba(255, 245, 210, 0.3)';
  ctx.lineWidth = 8;
  for (let y = 50; y < canvas.height; y += 45) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(canvas.width * 0.3, y - 20, canvas.width * 0.7, y + 20, canvas.width, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export function createEarthTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Deep oceanic blue
  ctx.fillStyle = '#103058';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Continents approximate shapes
  ctx.fillStyle = '#2D6B3C';
  // North & South America
  ctx.beginPath();
  ctx.ellipse(0.28 * canvas.width, 0.38 * canvas.height, 60, 45, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0.33 * canvas.width, 0.65 * canvas.height, 45, 60, 0.2, 0, Math.PI * 2);
  ctx.fill();
  // Eurasia & Africa
  ctx.beginPath();
  ctx.ellipse(0.58 * canvas.width, 0.35 * canvas.height, 90, 45, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0.54 * canvas.width, 0.58 * canvas.height, 45, 60, 0, 0, Math.PI * 2);
  ctx.fill();
  // Australia
  ctx.beginPath();
  ctx.ellipse(0.80 * canvas.width, 0.70 * canvas.height, 35, 25, 0, 0, Math.PI * 2);
  ctx.fill();

  // White swirl clouds
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    ctx.beginPath();
    ctx.ellipse(x, y, 40 + Math.random() * 40, 15 + Math.random() * 15, Math.random() * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Polar ice caps
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.fillRect(0, 0, canvas.width, 20);
  ctx.fillRect(0, canvas.height - 25, canvas.width, 25);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export function createSaturnTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#D6C098');
  grad.addColorStop(0.2, '#BF9E6A');
  grad.addColorStop(0.4, '#E5CCA0');
  grad.addColorStop(0.6, '#C4A875');
  grad.addColorStop(0.8, '#DDC7A0');
  grad.addColorStop(1, '#B0905F');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export function createSaturnRingTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(0.1, 'rgba(195, 170, 130, 0.8)');
  grad.addColorStop(0.45, 'rgba(180, 155, 115, 0.7)');
  grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.05)'); // Cassini Division gap!
  grad.addColorStop(0.55, 'rgba(160, 135, 95, 0.6)');
  grad.addColorStop(0.9, 'rgba(140, 115, 75, 0.4)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}
