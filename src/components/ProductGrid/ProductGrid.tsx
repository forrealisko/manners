/* ═══════════════════════════════════════════════════════
   MANNERS — Product Grid
   Full-viewport 2x2 pages. Category via burger menu.
   "All" view has a hero banner + discovery footer.
   ═══════════════════════════════════════════════════════ */

import { useMemo, useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../stores/appStore';
import { products, type Product, type Category } from '../../data/products';
import ProductCard from './ProductCard';
import './ProductGrid.css';

/* ─── Category icons (inline SVG for crisp rendering) ─── */
const CategoryIcon = ({ cat }: { cat: string }) => {
  const size = 20;
  const style = { strokeWidth: 1.5, fill: 'none', stroke: 'currentColor' };

  switch (cat) {
    case 'caps':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" {...style}>
          <path d="M4 16c0-4 3.5-8 8-8s8 4 8 8" strokeLinecap="round" />
          <path d="M2 16h20" strokeLinecap="round" />
          <circle cx="12" cy="8" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'tees':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" {...style}>
          <path d="M6 4l-4 4 3 1 1 11h12l1-11 3-1-4-4" strokeLinejoin="round" strokeLinecap="round" />
          <path d="M9 4a3 3 0 006 0" strokeLinecap="round" />
        </svg>
      );
    case 'jeans':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" {...style}>
          <path d="M6 2h12v6l-2 14H14l-2-8-2 8H8L6 8V2z" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      );
    case 'hoodies':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" {...style}>
          <path d="M5 8l-3 4 3 1v7h14v-7l3-1-3-4" strokeLinejoin="round" strokeLinecap="round" />
          <path d="M9 4a3 3 0 016 0" strokeLinecap="round" />
          <path d="M5 8c0-2 2.5-4 7-4s7 2 7 4" strokeLinecap="round" />
          <path d="M10 13v3h4v-3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'accessories':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" {...style}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" strokeLinecap="round" />
          <path d="M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
};

/* ─── Typewriter Effect ─── */
function TypewriterTitle({ text, trigger }: { text: string; trigger: boolean }) {
  const [displayed, setDisplayed] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (!trigger) {
      setDisplayed('');
      return;
    }

    let i = 0;
    setDisplayed('');
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        // Blink cursor a few times then hide
        setTimeout(() => setShowCursor(false), 1500);
      }
    }, 55);

    return () => clearInterval(interval);
  }, [trigger, text]);

  return (
    <h2 className="discovery-footer__title">
      {displayed}
      <span className={`discovery-footer__cursor ${showCursor && trigger ? 'discovery-footer__cursor--blink' : 'discovery-footer__cursor--hidden'}`}>|</span>
    </h2>
  );
}

export default function ProductGrid() {
  const { activeFilter, setActiveFilter } = useAppStore();
  const footerRef = useRef<HTMLDivElement>(null);
  const [footerVisible, setFooterVisible] = useState(false);

  /* ─── Ambient Audio ─── */
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioReady, setAudioReady] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const maxVolume = 0.35; // Gallery ambiance — never full blast

  // Create persistent audio element (survives re-renders)
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio('/media/ambient.mp3');
      audio.loop = true;
      audio.volume = maxVolume;
      audio.preload = 'auto';
      audioRef.current = audio;
      audio.addEventListener('canplaythrough', () => setAudioReady(true), { once: true });
    }
    return () => {
      // Don't destroy on unmount — keep playing
    };
  }, []);

  // Start playback on first user interaction (browser autoplay policy)
  useEffect(() => {
    if (!audioReady) return;

    const startAudio = () => {
      const audio = audioRef.current;
      if (audio && audio.paused) {
        audio.play().catch(() => {});
        setHasInteracted(true);
      }
    };

    // Listen for any interaction
    const events = ['click', 'touchstart', 'scroll'];
    events.forEach((e) => window.addEventListener(e, startAudio, { once: true, passive: true }));

    // Also listen on the grid container for scroll
    const grid = document.getElementById('product-grid');
    if (grid) grid.addEventListener('scroll', startAudio, { once: true, passive: true });

    return () => {
      events.forEach((e) => window.removeEventListener(e, startAudio));
      if (grid) grid.removeEventListener('scroll', startAudio);
    };
  }, [audioReady]);

  // Scroll-based volume: fade out as user scrolls away from hero
  useEffect(() => {
    const grid = document.getElementById('product-grid');
    if (!grid || !audioRef.current) return;

    const handleScroll = () => {
      const audio = audioRef.current;
      if (!audio || isMuted) return;

      const scrollTop = grid.scrollTop;
      const heroHeight = grid.querySelector('.hero-banner')?.clientHeight || window.innerHeight * 0.45;
      // Full volume when at top, fades to 0 over ~2 hero heights
      const fadeDistance = heroHeight * 2.5;
      const factor = Math.max(0, 1 - scrollTop / fadeDistance);
      audio.volume = maxVolume * factor * factor; // Quadratic easing for smoother fade
    };

    grid.addEventListener('scroll', handleScroll, { passive: true });
    return () => grid.removeEventListener('scroll', handleScroll);
  }, [isMuted]);

  // Mute toggle
  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isMuted) {
      audio.volume = maxVolume;
      audio.muted = false;
      setIsMuted(false);
    } else {
      audio.muted = true;
      setIsMuted(true);
    }
  };

  const displayProducts = useMemo((): Product[] => {
    if (activeFilter === 'all') {
      const cap = products.find((p) => p.category === 'caps');
      const tee = products.find((p) => p.category === 'tees');
      const jeans = products.find((p) => p.category === 'jeans');
      const jeans2 = products.find((p) => p.category === 'jeans' && p.id !== jeans?.id);
      return [cap, tee, jeans, jeans2].filter(Boolean) as Product[];
    }
    return products.filter((p) => p.category === (activeFilter as Category));
  }, [activeFilter]);

  // Group into rows of 2
  const rows = useMemo(() => {
    const result: Product[][] = [];
    for (let i = 0; i < displayProducts.length; i += 2) {
      result.push(displayProducts.slice(i, i + 2));
    }
    return result;
  }, [displayProducts]);

  const showBanner = activeFilter === 'all';

  // Observe footer visibility for typewriter trigger
  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setFooterVisible(true);
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Reset typewriter when filter changes
  useEffect(() => {
    setFooterVisible(false);
  }, [activeFilter]);

  const handleCategoryNav = (cat: string) => {
    setActiveFilter(cat as Category);
    const container = document.getElementById('product-grid');
    if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="product-grid-section" id="product-grid-section">
      <div className="snap-scroll-container" id="product-grid">
        {/* Hero Video Banner — only on "All" view */}
        {showBanner && (
          <div className="hero-banner">
            <video
              src="/media/hero.mp4"
              className="hero-banner__video"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            />
            {/* Audio control — appears after first interaction */}
            {hasInteracted && (
              <button
                className={`hero-banner__audio-toggle ${isMuted ? 'hero-banner__audio-toggle--muted' : ''}`}
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute ambient audio' : 'Mute ambient audio'}
              >
                {isMuted ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 5L6 9H2v6h4l5 4V5z" />
                    <line x1="23" y1="9" x2="17" y2="15" />
                    <line x1="17" y1="9" x2="23" y2="15" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 5L6 9H2v6h4l5 4V5z" />
                    <path d="M15.54 8.46a5 5 0 010 7.07" />
                    <path d="M19.07 4.93a10 10 0 010 14.14" />
                  </svg>
                )}
              </button>
            )}
          </div>
        )}

        {rows.map((row, rowIdx) => (
          <div className="product-row" key={`row-${activeFilter}-${rowIdx}`}>
            {row.map((product, colIdx) => (
              <ProductCard
                key={product.id}
                product={product}
                index={rowIdx * 2 + colIdx}
              />
            ))}
            {row.length < 2 && <div className="product-row__empty" />}
          </div>
        ))}

        {/* ─── Discovery Footer ─── */}
        <div className="discovery-footer" ref={footerRef}>
          <div className="discovery-footer__content">
            <TypewriterTitle text="What are you looking for?" trigger={footerVisible} />
            <div className="discovery-footer__line" />
            <nav className="discovery-footer__nav">
              {[
                { key: 'caps', label: 'Cap' },
                { key: 'tees', label: 'Tee' },
                { key: 'jeans', label: 'Jeans' },
                { key: 'hoodies', label: 'Hoodie' },
                { key: 'accessories', label: 'Accessories' },
              ].map((cat) => (
                <button
                  key={cat.key}
                  className="discovery-footer__item"
                  onClick={() => handleCategoryNav(cat.key)}
                >
                  <span className="discovery-footer__item-label">{cat.label}</span>
                  <span className="discovery-footer__item-icon">
                    <CategoryIcon cat={cat.key} />
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </section>
  );
}

