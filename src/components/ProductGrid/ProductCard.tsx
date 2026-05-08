/* ═══════════════════════════════════════════════════════
   MANNERS — Product Card (Racer-style)
   Clean product image with name, price, quick-add
   ═══════════════════════════════════════════════════════ */

import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import type { Product } from '../../data/products';
import { getPlaceholderGradient, formatPrice } from '../../data/products';
import { useAppStore } from '../../stores/appStore';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
  index: number;
}

export default function ProductCard({ product, index }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const setSelectedProduct = useAppStore((s) => s.setSelectedProduct);
  const gradient = useMemo(
    () => getPlaceholderGradient(product.category, index, product.images[0]),
    [product, index]
  );
  const showPlaceholder = imageError || !product.images[0];

  return (
    <article
      className={`product-card stagger-${(index % 6) + 1}`}
      id={`product-${product.id}`}
      onClick={() => setSelectedProduct(product.id)}
    >
      {/* Image Container */}
      <div className="product-card__media" style={gradient}>
        {showPlaceholder ? (
          <div className="product-card__placeholder">
            <span className="product-card__placeholder-text">
              {product.name}
            </span>
          </div>
        ) : (
          <>
            {!imageLoaded && (
              <div className="product-card__placeholder product-card__placeholder--loading" />
            )}
            <img
              src={product.images[0]}
              alt={product.name}
              className={`product-card__image ${imageLoaded ? 'product-card__image--loaded' : ''}`}
              loading="lazy"
              onError={() => setImageError(true)}
              onLoad={() => setImageLoaded(true)}
            />
          </>
        )}

        {/* Quick Add Button */}
        <button
          className="product-card__quick-add"
          aria-label={`Quick add ${product.name}`}
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Quick add to cart with default size/color
          }}
        >
          <Plus size={16} strokeWidth={2} />
        </button>

        {/* Badges */}
        <div className="product-card__badges">
          {product.isBestseller && (
            <span className="product-card__badge product-card__badge--bestseller">Bestseller</span>
          )}
          {product.isNew && (
            <span className="product-card__badge product-card__badge--new">New In</span>
          )}
          {!product.inStock && (
            <span className="product-card__badge product-card__badge--sold-out">Sold Out</span>
          )}
          {product.isSale && (
            <span className="product-card__badge product-card__badge--sale">Sale</span>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="product-card__info">
        <h3 className="product-card__name">{product.name}</h3>
        <div className="product-card__pricing">
          <span className="product-card__price">{formatPrice(product.price)}</span>
          {product.isSale && product.salePrice && (
            <span className="product-card__original-price">
              {formatPrice(product.salePrice)}
            </span>
          )}
          {product.isBestseller && (
            <span className="product-card__tag">Bestseller</span>
          )}
          {product.isNew && (
            <span className="product-card__tag">New In</span>
          )}
          {!product.inStock && (
            <span className="product-card__tag product-card__tag--sold-out">Sold Out</span>
          )}
        </div>
      </div>
    </article>
  );
}
