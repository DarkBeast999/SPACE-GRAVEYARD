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
