/* ═══════════════════════════════════════════════════════
   MANNERS — Product Detail Overlay
   Expands from grid to show full product info
   ═══════════════════════════════════════════════════════ */

import { useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { useCartStore } from '../../stores/cartStore';
import { getProductById, formatPrice, getPlaceholderGradient } from '../../data/products';
import type { ProductColor } from '../../data/products';
import './ProductDetail.css';

export default function ProductDetail() {
  const { selectedProductId, setSelectedProduct } = useAppStore();
  const addItem = useCartStore((s) => s.addItem);

  const product = selectedProductId ? getProductById(selectedProductId) : null;

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const gradient = getPlaceholderGradient(product.category, 0, product.images[0]);
  const showPlaceholder = imageError || !product.images[0];

  const handleAddToCart = () => {
    if (!selectedSize) return;
    const color = selectedColor || product.colors[0];
    addItem(product, selectedSize, color, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleClose = () => {
    setSelectedProduct(null);
    setSelectedSize(null);
    setSelectedColor(null);
    setQuantity(1);
    setCurrentImage(0);
    setAdded(false);
  };

  return (
    <div className="product-detail" id="product-detail">
      <div className="product-detail__backdrop" onClick={handleClose} />

      <div className="product-detail__panel">
        {/* Close Button */}
        <button className="product-detail__close" onClick={handleClose} aria-label="Go back">
          <ArrowLeft size={22} strokeWidth={1.5} />
        </button>

        {/* Image Gallery */}
        <div className="product-detail__gallery">
          {showPlaceholder ? (
            <div
              className="product-detail__placeholder"
              style={gradient}
            >
              <span className="product-detail__placeholder-text">{product.name}</span>
            </div>
          ) : (
            <img
              src={product.images[currentImage]}
              alt={product.name}
              className="product-detail__image"
              onError={() => setImageError(true)}
            />
          )}

          {/* Image nav arrows */}
          {product.images.length > 1 && !showPlaceholder && (
            <>
              <button
                className="product-detail__nav product-detail__nav--prev"
                onClick={() => setCurrentImage((prev) => (prev - 1 + product.images.length) % product.images.length)}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                className="product-detail__nav product-detail__nav--next"
                onClick={() => setCurrentImage((prev) => (prev + 1) % product.images.length)}
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* Image dots */}
          {product.images.length > 1 && (
            <div className="product-detail__dots">
              {product.images.map((_, i) => (
                <button
                  key={i}
                  className={`product-detail__dot ${i === currentImage ? 'product-detail__dot--active' : ''}`}
                  onClick={() => setCurrentImage(i)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="product-detail__info">
          <h2 className="product-detail__name">{product.name}</h2>
          <p className="product-detail__price">{formatPrice(product.price)}</p>
          <p className="product-detail__description">{product.description}</p>

          {/* Colors */}
          {product.colors.length > 0 && (
            <div className="product-detail__section">
              <label className="product-detail__label">Color</label>
              <div className="product-detail__colors">
                {product.colors.map((color) => (
                  <button
                    key={color.hex}
                    className={`product-detail__color-swatch ${
                      (selectedColor?.hex || product.colors[0].hex) === color.hex
                        ? 'product-detail__color-swatch--active'
                        : ''
                    }`}
                    style={{ background: color.hex }}
                    onClick={() => setSelectedColor(color)}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          <div className="product-detail__section">
            <label className="product-detail__label">
              Size {!selectedSize && <span className="product-detail__required">— Select a size</span>}
            </label>
            <div className="product-detail__sizes">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  className={`product-detail__size ${selectedSize === size ? 'product-detail__size--active' : ''}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="product-detail__section">
            <label className="product-detail__label">Quantity</label>
            <div className="product-detail__quantity">
              <button
                className="product-detail__qty-btn"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus size={14} />
              </button>
              <span className="product-detail__qty-value">{quantity}</span>
              <button
                className="product-detail__qty-btn"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Add to Cart */}
          <button
            className={`product-detail__add-btn ${!selectedSize ? 'product-detail__add-btn--disabled' : ''} ${added ? 'product-detail__add-btn--added' : ''}`}
            onClick={handleAddToCart}
            disabled={!selectedSize || !product.inStock}
          >
            <ShoppingBag size={16} strokeWidth={1.5} />
            {!product.inStock
              ? 'Sold Out'
              : added
              ? 'Added to Bag ✓'
              : selectedSize
              ? `Add to Bag — ${formatPrice(product.price * quantity)}`
              : 'Select a Size'}
          </button>
        </div>
      </div>
    </div>
  );
}
