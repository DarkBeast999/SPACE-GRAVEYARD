import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

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
  const { pathname } = useLocation();
  const isUniverse = pathname.startsWith('/universe');
  const isHome = pathname === '/';

  // Cached offscreen canvas for background gradient + nebula
  const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const starsRef = useRef<Star[]>([]);

  useEffect(() => {
    if (isUniverse) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number | null = null;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Build cached background gradient, nebula and star positions
    const generateCache = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;

      let offscreen = bgCanvasRef.current;
      if (!offscreen) {
        offscreen = document.createElement('canvas');
        bgCanvasRef.current = offscreen;
      }
      offscreen.width = width;
      offscreen.height = height;
      const offCtx = offscreen.getContext('2d');
      if (!offCtx) return;

      // Deep space background gradient
      const bgGradient = offCtx.createRadialGradient(
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
      offCtx.fillStyle = bgGradient;
      offCtx.fillRect(0, 0, width, height);

      // Draw faint, elegant nebula clouds
      const nebula = offCtx.createRadialGradient(
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
      offCtx.fillStyle = nebula;
      offCtx.fillRect(0, 0, width, height);

      // Create static stars with warm, restrained values
      const starCount = Math.min(200, Math.floor((width * height) / 6000));
      starsRef.current = Array.from({ length: starCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.3 + 0.3,
        alpha: Math.random() * 0.45 + 0.15,
        speed: Math.random() * 0.012 + 0.003,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    generateCache();

    const drawStatic = () => {
      if (!ctx || !bgCanvasRef.current) return;
      ctx.drawImage(bgCanvasRef.current, 0, 0);

      starsRef.current.forEach((star) => {
        ctx.fillStyle = `rgba(240, 232, 217, ${star.alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        if (star.size > 1.2 && star.phase > 4) {
          ctx.fillStyle = `rgba(198, 163, 107, ${star.alpha * 0.7})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 1.1, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    };

    const handleResize = () => {
      generateCache();
      if (!isHome) {
        drawStatic();
      }
    };
    window.addEventListener('resize', handleResize);

    // If NOT home (e.g. /explore, /timeline, /play, /knowledge):
    // Eliminate continuous per-frame repainting! Render static once.
    if (!isHome) {
      drawStatic();
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }

    // HOME: Warm twinkling stars + shooting stars with cached background
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
    let lastFrameTime = performance.now();

    const render = (now: number) => {
      // Frame pace on home to conserve CPU cycles
      if (now - lastFrameTime < 24) {
        animId = requestAnimationFrame(render);
        return;
      }
      lastFrameTime = now;

      // Instantaneous blit of pre-rendered background gradient & nebula
      if (bgCanvasRef.current) {
        ctx.drawImage(bgCanvasRef.current, 0, 0);
      }

      // Draw warm twinkling stars
      t += 0.024;
      starsRef.current.forEach((star) => {
        const twinkle = Math.sin(t * star.speed * 60 + star.phase);
        const currentAlpha = Math.max(0.08, Math.min(0.65, star.alpha + twinkle * 0.18));

        ctx.fillStyle = `rgba(240, 232, 217, ${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

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

    animId = requestAnimationFrame(render);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [pathname, isUniverse, isHome]);

  if (isUniverse) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ display: 'block' }}
    />
  );
};
