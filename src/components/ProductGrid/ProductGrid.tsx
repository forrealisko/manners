/* ═══════════════════════════════════════════════════════
   MANNERS — Product Grid
   Row-by-row snap scrolling. Filter bar hides on scroll.
   "All" view: Cap, Tee, Jeans, Jeans2
   ═══════════════════════════════════════════════════════ */

import { useMemo } from 'react';
import { useAppStore } from '../../stores/appStore';
import { products, type Product, type Category } from '../../data/products';
import ProductCard from './ProductCard';
import FilterBar from './FilterBar';
import './ProductGrid.css';

export default function ProductGrid() {
  const { activeFilter } = useAppStore();

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

  // Group products into rows of 2
  const rows = useMemo(() => {
    const result: Product[][] = [];
    for (let i = 0; i < displayProducts.length; i += 2) {
      result.push(displayProducts.slice(i, i + 2));
    }
    return result;
  }, [displayProducts]);

  return (
    <section className="product-grid-section" id="product-grid-section">
      <div className="snap-scroll-container" id="product-grid">
        {/* Filter bar — first snap point, scrolls away */}
        <div className="filter-snap-point">
          <FilterBar />
        </div>

        {/* Product rows — each row snaps independently */}
        {rows.map((row, rowIdx) => (
          <div className="product-row" key={`row-${activeFilter}-${rowIdx}`}>
            {row.map((product, colIdx) => (
              <ProductCard
                key={product.id}
                product={product}
                index={rowIdx * 2 + colIdx}
              />
            ))}
            {/* Fill empty slot if odd number of products */}
            {row.length < 2 && <div className="product-row__empty" />}
          </div>
        ))}
      </div>
    </section>
  );
}
