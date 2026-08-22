/* ═══════════════════════════════════════════════════════
   MANNERS — Main App
   ═══════════════════════════════════════════════════════ */

import { useCallback, useEffect, useRef } from 'react';
import { useAppStore } from './stores/appStore';
import LoadingScreen from './components/LoadingScreen/LoadingScreen';
import Header from './components/Header/Header';
import ProductGrid from './components/ProductGrid/ProductGrid';
import ProductDetail from './components/ProductDetail/ProductDetail';
import './styles/index.css';
import './styles/glass.css';
import './styles/animations.css';

/* ─── Subtle Dot Grid Background ─── */
function DotGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let scrollY = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const SPACING = 40;
    const DOT_RADIUS = 0.8;
    const LINE_DISTANCE = 80;

    const draw = () => {
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      const dotColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
      const lineColor = isDark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.02)';

      // Offset by scroll for parallax feel
      const offsetY = (scrollY * 0.15) % SPACING;

      const dots: [number, number][] = [];

      for (let x = 0; x < w + SPACING; x += SPACING) {
        for (let y = -SPACING; y < h + SPACING; y += SPACING) {
          const dy = y - offsetY;
          dots.push([x, dy]);

          ctx.beginPath();
          ctx.arc(x, dy, DOT_RADIUS, 0, Math.PI * 2);
          ctx.fillStyle = dotColor;
          ctx.fill();
        }
      }

      // Draw connections between nearby dots
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 0.5;
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i][0] - dots[j][0];
          const dy = dots[i][1] - dots[j][1];
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINE_DISTANCE && dist > SPACING * 0.9) {
            ctx.beginPath();
            ctx.moveTo(dots[i][0], dots[i][1]);
            ctx.lineTo(dots[j][0], dots[j][1]);
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };

    const onScroll = () => {
      const grid = document.getElementById('product-grid');
      scrollY = grid ? grid.scrollTop : window.scrollY;
    };

    resize();
    window.addEventListener('resize', resize);

    // Listen to the snap container scroll
    const grid = document.getElementById('product-grid');
    if (grid) grid.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
      if (grid) grid.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}

export default function App() {
  const { isLoading, setLoading, selectedProductId, theme, initTheme } = useAppStore();

  // Apply stored theme (or the OS preference) on mount — no location prompt
  useEffect(() => {
    initTheme();
  }, []);

  // Keep data-theme in sync when user toggles
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleLoadComplete = useCallback(() => {
    setLoading(false);
  }, [setLoading]);

  return (
    <>
      {/* Loading Screen — X expand animation */}
      {isLoading && <LoadingScreen onComplete={handleLoadComplete} />}

      {/* Subtle dot grid bg */}
      {!isLoading && <DotGrid />}

      {/* Main App */}
      <div
        className="app"
        style={{
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.4s ease',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Header />
        <main>
          <ProductGrid />
        </main>
      </div>

      {/* Product Detail Overlay */}
      {selectedProductId && <ProductDetail />}
    </>
  );
}
