/* ═══════════════════════════════════════════════════════
   MANNERS — Product Card
   Clean product image with name, price, badges on image
   ═══════════════════════════════════════════════════════ */

import { useState, useMemo } from 'react';
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

        {/* Badges — on the image only */}
        <div className="product-card__badges">
          {product.isBestseller && (
            <span className="product-card__badge product-card__badge--bestseller">Bestseller</span>
          )}
          {product.isRestocked && (
            <span className="product-card__badge product-card__badge--restocked">Restocked</span>
          )}
          {product.isNew && (
            <span className="product-card__badge product-card__badge--new">New In</span>
          )}
          {!product.inStock && (
            <span className="product-card__badge product-card__badge--sold-out">Sold Out</span>
          )}
        </div>
      </div>

      {/* Product Info — just name + price, nothing else */}
      <div className="product-card__info">
        <h3 className="product-card__name">{product.name}</h3>
        <span className="product-card__price">{formatPrice(product.price)}</span>
      </div>
    </article>
  );
}
