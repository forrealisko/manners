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

/* ─── Responsive column count: 4 across on desktop, 2 on mobile/tablet ─── */
const DESKTOP_QUERY = '(min-width: 1024px)';

/* Products shown on the "all" view — two full rows on desktop */
const HOME_PRODUCT_COUNT = 8;

function useColumns(): number {
  const [cols, setCols] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia(DESKTOP_QUERY).matches ? 4 : 2
  );

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const sync = () => setCols(mq.matches ? 4 : 2);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return cols;
}

/* ═══════════════════════════════════════════════════════
   Discovery title

   A plain typewriter reads as a machine: constant speed, no
   intent. This one varies its cadence — a beat at word breaks,
   a longer one after punctuation, jitter in between — and
   cycles three phrasings of the same question, each in its own
   voice. It performs the cycle once, then settles back on the
   opening question and rests.
   ═══════════════════════════════════════════════════════ */

type Voice = 'plain' | 'loud' | 'soft';
type Phase = 'idle' | 'typing' | 'holding' | 'erasing' | 'done';

interface Phrase {
  text: string;
  voice: Voice;
  /* A false start: type something, think better of it, delete it. */
  rethink?: { at: number; wrong: string };
  hold: number;
}

const PHRASES: Phrase[] = [
  { text: 'What are you looking for?', voice: 'plain', hold: 2600 },
  { text: 'Something loud?', voice: 'loud', rethink: { at: 10, wrong: 'qui' }, hold: 2000 },
  { text: "Something you'll keep?", voice: 'soft', hold: 2400 },
];

/* Uneven by design — the unevenness is what stops it feeling mechanical. */
function typeDelay(ch: string): number {
  if (ch === ' ') return 95 + Math.random() * 70;      // a beat between words
  if (/[?.!,]/.test(ch)) return 280 + Math.random() * 140; // punctuation lands
  if (/['’]/.test(ch)) return 60 + Math.random() * 40;
  return 32 + Math.random() * 50;
}

function DiscoveryTitle({ trigger }: { trigger: boolean }) {
  const [displayed, setDisplayed] = useState('');
  const [voice, setVoice] = useState<Voice>(PHRASES[0].voice);
  const [phase, setPhase] = useState<Phase>('idle');

  useEffect(() => {
    if (!trigger) {
      setDisplayed('');
      setPhase('idle');
      return;
    }

    /* Respect a reduced-motion preference: show the question, skip the show. */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVoice(PHRASES[0].voice);
      setDisplayed(PHRASES[0].text);
      setPhase('done');
      return;
    }

    let cancelled = false;
    const timers: number[] = [];
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timers.push(window.setTimeout(resolve, ms));
      });

    const run = async () => {
      /* Run the cycle, then return to the opening question and stop there —
         the resting state should be the real question above the categories. */
      const sequence = [...PHRASES, PHRASES[0]];

      for (let s = 0; s < sequence.length; s++) {
        const phrase = sequence[s];
        const isLast = s === sequence.length - 1;

        if (cancelled) return;
        setVoice(phrase.voice);
        setPhase('typing');

        let shown = '';
        for (let i = 0; i < phrase.text.length; i++) {
          if (phrase.rethink && i === phrase.rethink.at) {
            for (const ch of phrase.rethink.wrong) {
              if (cancelled) return;
              shown += ch;
              setDisplayed(shown);
              await wait(typeDelay(ch));
            }
            await wait(520);                       // the pause where it reconsiders
            setPhase('erasing');
            for (let k = 0; k < phrase.rethink.wrong.length; k++) {
              if (cancelled) return;
              shown = shown.slice(0, -1);
              setDisplayed(shown);
              await wait(34);
            }
            setPhase('typing');
            await wait(180);
          }

          if (cancelled) return;
          shown += phrase.text[i];
          setDisplayed(shown);
          await wait(typeDelay(phrase.text[i]));
        }

        if (cancelled) return;
        if (isLast) {
          setPhase('done');
          return;
        }

        setPhase('holding');
        await wait(phrase.hold);

        if (cancelled) return;
        setPhase('erasing');
        while (shown.length) {
          if (cancelled) return;
          shown = shown.slice(0, -1);
          setDisplayed(shown);
          await wait(22);
        }
        await wait(260);
      }
    };

    run();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [trigger]);

  /* Solid while it is actively writing, blinking only while it waits. */
  const cursorState =
    phase === 'typing' || phase === 'erasing'
      ? 'discovery-footer__cursor--solid'
      : phase === 'done'
      ? 'discovery-footer__cursor--slow'
      : phase === 'idle'
      ? 'discovery-footer__cursor--hidden'
      : 'discovery-footer__cursor--blink';

  return (
    <h2 className={`discovery-footer__title discovery-footer__title--${voice}`}>
      {displayed}
      <span className={`discovery-footer__cursor ${cursorState}`}>|</span>
    </h2>
  );
}

export default function ProductGrid() {
  const { activeFilter, setActiveFilter } = useAppStore();
  const columns = useColumns();
  const footerRef = useRef<HTMLDivElement>(null);
  const [footerVisible, setFooterVisible] = useState(false);

  const displayProducts = useMemo((): Product[] => {
    if (activeFilter !== 'all') {
      return products.filter((p) => p.category === (activeFilter as Category));
    }

    /* Only products with real photography. Most of the catalog is still
       placeholder entries with no image, which would render as empty cards. */
    const shot = products.filter((p) => p.images.length > 0);

    /* The opening four, unchanged. */
    const cap = shot.find((p) => p.category === 'caps');
    const tee = shot.find((p) => p.category === 'tees');
    const jeans = shot.find((p) => p.category === 'jeans');
    const jeans2 = shot.find((p) => p.category === 'jeans' && p.id !== jeans?.id);
    const opening = [cap, tee, jeans, jeans2].filter(Boolean) as Product[];

    /* Fill the remaining slots round-robin across categories, so the second
       row is a mix rather than four caps in a line. */
    const remaining = new Map<Category, Product[]>();
    for (const product of shot) {
      if (opening.some((o) => o.id === product.id)) continue;
      remaining.set(product.category, [...(remaining.get(product.category) ?? []), product]);
    }

    const picked = [...opening];
    let progressed = true;
    while (progressed && picked.length < HOME_PRODUCT_COUNT) {
      progressed = false;
      for (const list of remaining.values()) {
        const next = list.shift();
        if (!next) continue;
        picked.push(next);
        progressed = true;
        if (picked.length === HOME_PRODUCT_COUNT) break;
      }
    }
    return picked;
  }, [activeFilter]);

  // Group into rows of `columns`
  const rows = useMemo(() => {
    const result: Product[][] = [];
    for (let i = 0; i < displayProducts.length; i += columns) {
      result.push(displayProducts.slice(i, i + columns));
    }
    return result;
  }, [displayProducts, columns]);

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
        {/* Hero banner — only on "All" view */}
        {showBanner && (
          <div className="hero-banner">
            <video
              ref={(el) => {
                if (el) {
                  el.defaultMuted = true;
                  el.muted = true;
                  el.play().catch(() => {});
                }
              }}
              src="/media/hero-loop.mp4"
              className="hero-banner__video"
              autoPlay
              muted
              loop
              playsInline
            />
          </div>
        )}

        {rows.map((row, rowIdx) => (
          <div
            className="product-row"
            key={`row-${activeFilter}-${columns}-${rowIdx}`}
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {row.map((product, colIdx) => (
              <ProductCard
                key={product.id}
                product={product}
                index={rowIdx * columns + colIdx}
              />
            ))}
            {Array.from({ length: columns - row.length }).map((_, i) => (
              <div className="product-row__empty" key={`empty-${i}`} />
            ))}
          </div>
        ))}

        {/* ─── Discovery Footer ─── */}
        <div className="discovery-footer" ref={footerRef}>
          <div className="discovery-footer__content">
            <DiscoveryTitle trigger={footerVisible} />
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
