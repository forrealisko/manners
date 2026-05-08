/* ═══════════════════════════════════════════════════════
   MANNERS — Product Grid
   Snap-scrolling 2x2 pages that fit perfectly to any phone.
   Filter bar auto-hides on scroll down.
   
   "All" view: Cap (top-left), Tee (top-right), Jeans (bottom-left), Chain (bottom-right)
   Filtered view: all products from that category in 2x2 pages
   ═══════════════════════════════════════════════════════ */

import { useMemo, useRef, useCallback, useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { products, type Product, type Category } from '../../data/products';
import ProductCard from './ProductCard';
import FilterBar from './FilterBar';
import './ProductGrid.css';

export default function ProductGrid() {
  const { activeFilter } = useAppStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const displayProducts = useMemo((): Product[] => {
    if (activeFilter === 'all') {
      // Specific layout: cap (top-left), tee (top-right), jeans (bottom-left), jeans2 (bottom-right)
      const cap = products.find((p) => p.category === 'caps');
      const tee = products.find((p) => p.category === 'tees');
      const jeans = products.find((p) => p.category === 'jeans');
      const jeans2 = products.find((p) => p.category === 'jeans' && p.id !== jeans?.id);
      return [cap, tee, jeans, jeans2].filter(Boolean) as Product[];
    }
    return products.filter((p) => p.category === (activeFilter as Category));
  }, [activeFilter]);

  // Update active page dot based on scroll
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    
    // We can track the active row index for the dots
    const cards = el.querySelectorAll('.product-card');
    let bestIdx = 0;
    let minDiff = Infinity;
    
    // Header height is the offset we care about
    const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 60;
    
    cards.forEach((card, idx) => {
      // We only check the first card of each row (even indices)
      if (idx % 2 !== 0) return;
      
      const rect = card.getBoundingClientRect();
      const diff = Math.abs(rect.top - offset);
      if (diff < minDiff) {
        minDiff = diff;
        bestIdx = idx / 2;
      }
    });
    
    if (minDiff < window.innerHeight / 3) {
      setCurrentPage(bestIdx);
    }
  }, []);

  const totalRows = Math.ceil(displayProducts.length / 2);

  return (
    <section className="product-grid-section" id="product-grid-section">
      <div
        className="snap-scroll-container"
        ref={scrollRef}
        onScroll={handleScroll}
        id="product-grid"
      >
        <div className="filter-snap-point">
          <FilterBar />
        </div>

        <div className="continuous-grid">
          {displayProducts.map((product, idx) => (
            <ProductCard
              key={product.id}
              product={product}
              index={idx}
            />
          ))}
        </div>
      </div>

      {/* Row indicator dots */}
      {totalRows > 1 && (
        <div className="page-dots">
          {Array.from({ length: totalRows }).map((_, i) => (
            <button
              key={i}
              className={`page-dot ${i === currentPage ? 'page-dot--active' : ''}`}
              onClick={() => {
                const el = scrollRef.current;
                if (el) {
                  const cards = el.querySelectorAll('.product-card');
                  const targetCard = cards[i * 2];
                  if (targetCard) {
                    targetCard.scrollIntoView({ behavior: 'smooth' });
                  }
                }
              }}
              aria-label={`Go to row ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
