/* ═══════════════════════════════════════════════════════
   MANNERS — Product Grid
   Full-viewport 2x2 pages. Category via burger menu.
   "All" view has a hero banner + discovery footer.
   ═══════════════════════════════════════════════════════ */

import { useMemo } from 'react';
import { useAppStore } from '../../stores/appStore';
import { products, type Product, type Category } from '../../data/products';
import ProductCard from './ProductCard';
import './ProductGrid.css';

export default function ProductGrid() {
  const { activeFilter, setActiveFilter } = useAppStore();

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

  const handleCategoryNav = (cat: string) => {
    setActiveFilter(cat as Category);
    // Scroll back to top
    const container = document.getElementById('product-grid');
    if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="product-grid-section" id="product-grid-section">
      <div className="snap-scroll-container" id="product-grid">
        {/* Hero banner — only on "All" view */}
        {showBanner && (
          <div className="hero-banner">
            <img
              src="/images/banner.webp"
              alt="manners SS26 Collection"
              className="hero-banner__image"
            />
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
        <div className="discovery-footer">
          <div className="discovery-footer__content">
            <h2 className="discovery-footer__title">What are you looking for?</h2>
            <div className="discovery-footer__line" />
            <nav className="discovery-footer__nav">
              {[
                { key: 'caps', label: 'Caps', price: '€32' },
                { key: 'tees', label: 'Tees', price: '€64' },
                { key: 'jeans', label: 'Jeans', price: '€128' },
                { key: 'hoodies', label: 'Hoodies', price: '€256' },
                { key: 'accessories', label: 'Accessories', price: 'from €28' },
              ].map((cat) => (
                <button
                  key={cat.key}
                  className="discovery-footer__item"
                  onClick={() => handleCategoryNav(cat.key)}
                >
                  <span className="discovery-footer__item-label">{cat.label}</span>
                  <span className="discovery-footer__item-price">{cat.price}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </section>
  );
}
