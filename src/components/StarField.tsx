import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  alpha: number;
  speed: number;
  phase: number;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  life: number;
}

export const StarField: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Create static stars with warm, restrained values
    const starCount = Math.min(200, Math.floor((width * height) / 6000));
    const stars: Star[] = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.3 + 0.3,
      alpha: Math.random() * 0.45 + 0.15,
      speed: Math.random() * 0.012 + 0.003,
      phase: Math.random() * Math.PI * 2,
    }));

    // Shooting stars
    const shootingStars: ShootingStar[] = [];

    const spawnShootingStar = () => {
      if (shootingStars.length < 1 && Math.random() < 0.008) {
        shootingStars.push({
          x: Math.random() * width * 0.8,
          y: Math.random() * height * 0.35,
          length: Math.random() * 70 + 30,
          speed: Math.random() * 5 + 3,
          angle: Math.PI / 4 + (Math.random() - 0.5) * 0.15,
          opacity: 0.6,
          life: 0,
        });
      }
    };

    let t = 0;
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Deep space background gradient
      const bgGradient = ctx.createRadialGradient(
        width * 0.35,
        height * 0.4,
        80,
        width * 0.5,
        height * 0.5,
        Math.max(width, height)
      );
      bgGradient.addColorStop(0, '#101A29');
      bgGradient.addColorStop(0.55, '#0C1320');
      bgGradient.addColorStop(1, '#080D16');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // Draw faint, elegant nebula clouds
      const nebula = ctx.createRadialGradient(
        width * 0.8,
        height * 0.25,
        30,
        width * 0.8,
        height * 0.25,
        Math.min(width, height) * 0.6
      );
      nebula.addColorStop(0, 'rgba(168, 150, 197, 0.05)');
      nebula.addColorStop(0.5, 'rgba(120, 156, 184, 0.02)');
      nebula.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nebula;
      ctx.fillRect(0, 0, width, height);

      // Draw warm twinkling stars
      t += 0.016;
      stars.forEach((star) => {
        const twinkle = Math.sin(t * star.speed * 60 + star.phase);
        const currentAlpha = Math.max(0.08, Math.min(0.65, star.alpha + twinkle * 0.18));

        ctx.fillStyle = `rgba(240, 232, 217, ${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Subtle antique gold tint for select stars
        if (star.size > 1.2 && star.phase > 4) {
          ctx.fillStyle = `rgba(198, 163, 107, ${currentAlpha * 0.7})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 1.1, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Spawn and draw shooting stars
      spawnShootingStar();
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        ss.x += Math.cos(ss.angle) * ss.speed;
        ss.y += Math.sin(ss.angle) * ss.speed;
        ss.life += 1;
        ss.opacity = Math.max(0, 0.6 - ss.life / 50);

        const tailX = ss.x - Math.cos(ss.angle) * ss.length;
        const tailY = ss.y - Math.sin(ss.angle) * ss.length;

        const grad = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
        grad.addColorStop(0, 'rgba(198, 163, 107, 0)');
        grad.addColorStop(1, `rgba(240, 232, 217, ${ss.opacity * 0.6})`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(ss.x, ss.y);
        ctx.stroke();

        if (ss.opacity <= 0) {
          shootingStars.splice(i, 1);
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ display: 'block' }}
    />
  );
};
