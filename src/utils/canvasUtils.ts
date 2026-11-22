export function drawGlowCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
  glowIntensity = 10
): void {
  ctx.save();
  ctx.shadowBlur = glowIntensity;
  ctx.shadowColor = color;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawPulseRing(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
  t: number
): void {
  const pulse = (Math.sin(t * 3) + 1) / 2;
  const outerR = r + pulse * 8;
  const alpha = 0.6 - pulse * 0.5;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, y, outerR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

export function drawGhostTrail(
  ctx: CanvasRenderingContext2D,
  points: Array<{ x: number; y: number }>,
  color: string,
  opacity: number
): void {
  if (points.length < 2) return;
  ctx.save();
  for (let i = 1; i < points.length; i++) {
    const alpha = (i / points.length) * opacity;
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(points[i - 1].x, points[i - 1].y);
    ctx.lineTo(points[i].x, points[i].y);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawOrbitRing(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  color = 'rgba(255,255,255,0.08)'
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 8]);
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

export function drawSun(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  t: number
): void {
  const pulse = 1 + 0.05 * Math.sin(t * 2);
  ctx.save();
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, r * pulse * 3);
  gradient.addColorStop(0, 'rgba(255, 240, 180, 1)');
  gradient.addColorStop(0.3, 'rgba(255, 200, 50, 0.8)');
  gradient.addColorStop(0.7, 'rgba(255, 150, 0, 0.3)');
  gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, r * pulse * 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 40;
  ctx.shadowColor = '#FFB347';
  ctx.fillStyle = '#FFF5C0';
  ctx.beginPath();
  ctx.arc(x, y, r * pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
