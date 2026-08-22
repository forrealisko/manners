/* ═══════════════════════════════════════════════════════
   MANNERS — Product Detail
   Hero image → scrolling gallery → features → measurements → size → add to bag
   ═══════════════════════════════════════════════════════ */

import { useState, useMemo, useEffect, useRef } from 'react';
import { ArrowLeft, Minus, Plus, ShoppingBag, ChevronDown } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { useCartStore } from '../../stores/cartStore';
import {
  getProductById,
  formatPrice,
  getPlaceholderGradient,
  categoryFeatures,
  categoryMeasurements,
} from '../../data/products';
import type { ProductColor, MeasurementRow } from '../../data/products';
import './ProductDetail.css';

export default function ProductDetail() {
  const { selectedProductId, setSelectedProduct } = useAppStore();
  const addItem = useCartStore((s) => s.addItem);

  const product = selectedProductId ? getProductById(selectedProductId) : null;

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);
  const [added, setAdded] = useState(false);
  const [showMeasurements, setShowMeasurements] = useState(false);

  const gradient = useMemo(
    () => product ? getPlaceholderGradient(product.category, 0, product.images[0]) : {},
    [product]
  );

  /* Opening pushes a history entry so browser back / edge-swipe closes the
     product instead of leaving the site. The grid stays mounted underneath,
     so closing lands exactly where the user left off. */
  const pushedRef = useRef(false);
  useEffect(() => {
    if (!selectedProductId) return;
    // Guarded: StrictMode invokes effects twice in dev, and two pushes would
    // need two backs to escape.
    if (!pushedRef.current) {
      window.history.pushState({ mannersProduct: selectedProductId }, '');
      pushedRef.current = true;
    }

    const onPop = () => {
      pushedRef.current = false;
      setSelectedProduct(null);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [selectedProductId, setSelectedProduct]);

  if (!product) return null;

  const showPlaceholder = imageError || !product.images[0];
  const features = product.features || categoryFeatures[product.category] || [];
  const measurements = categoryMeasurements[product.category];

  const handleAddToCart = () => {
    if (!selectedSize) return;
    const color = selectedColor || product.colors[0];
    addItem(product, selectedSize, color, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleClose = () => {
    if (pushedRef.current) {
      pushedRef.current = false;
      window.history.back();   // popstate handler clears the selection
    } else {
      setSelectedProduct(null);
    }
  };

  // Get measurement value by key
  const getMeasurement = (row: MeasurementRow, key: string): string => {
    const k = key.toLowerCase() as keyof MeasurementRow;
    return (row[k] as string) || '—';
  };

  return (
    <div className="pd" id="product-detail">
      <div className="pd__backdrop" onClick={handleClose} />

      <div className="pd__panel">
        {/* Back — floats over the media column, always reachable */}
        <button className="pd__close" onClick={handleClose} aria-label="Go back">
          <ArrowLeft size={22} strokeWidth={1.5} />
        </button>

        {/* ─── Scrollable Content ─── */}
        <div className="pd__scroll">
          <div className="pd__layout">

            {/* ═══ Media column ═══ */}
            <div className="pd__media">

          {/* ─── Hero Image (will be 3D later) ─── */}
          <div className="pd__hero" style={gradient}>
            {showPlaceholder ? (
              <div className="pd__hero-placeholder">
                <span className="pd__hero-placeholder-text">{product.name}</span>
              </div>
            ) : (
              <img
                src={product.images[0]}
                alt={product.name}
                className="pd__hero-image"
                onError={() => setImageError(true)}
              />
            )}
          </div>

          {/* ─── Gallery (additional images scroll vertically) ─── */}
          {product.images.length > 1 && (
            <div className="pd__gallery">
              {product.images.slice(1).map((img, i) => (
                <div key={i} className="pd__gallery-item">
                  <img
                    src={img}
                    alt={`${product.name} view ${i + 2}`}
                    className="pd__gallery-image"
                  />
                </div>
              ))}
            </div>
          )}

            </div>{/* /pd__media */}

            {/* ═══ Info column ═══ */}
            <div className="pd__aside">

          {/* ─── Product Info ─── */}
          <div className="pd__info">
            <div className="pd__info-header">
              <h2 className="pd__name">{product.name}</h2>
              <span className="pd__price">{formatPrice(product.price)}</span>
            </div>
            <p className="pd__description">{product.description}</p>
          </div>

          {/* ─── Features Bullets ─── */}
          {features.length > 0 && (
            <div className="pd__features">
              {features.map((f, i) => (
                <div key={i} className="pd__feature">
                  <span className="pd__feature-dot" />
                  <span className="pd__feature-text">{f}</span>
                </div>
              ))}
            </div>
          )}

          {/* ─── Measurements Accordion ─── */}
          {measurements && measurements.headers.length > 1 && (
            <div className="pd__measurements">
              <button
                className={`pd__measurements-toggle ${showMeasurements ? 'pd__measurements-toggle--open' : ''}`}
                onClick={() => setShowMeasurements(!showMeasurements)}
              >
                <span>Size Guide</span>
                <ChevronDown size={16} />
              </button>

              {showMeasurements && (
                <div className="pd__measurements-table-wrap">
                  <table className="pd__measurements-table">
                    <thead>
                      <tr>
                        {measurements.headers.map((h) => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {measurements.rows.map((row) => (
                        <tr
                          key={row.size}
                          className={selectedSize === row.size ? 'pd__measurements-row--active' : ''}
                        >
                          {measurements.headers.map((h) => (
                            <td key={h}>
                              {h === 'Size' ? row.size : getMeasurement(row, h)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <span className="pd__measurements-unit">All measurements in cm</span>
                </div>
              )}
            </div>
          )}

          {/* ─── Colors ─── */}
          {product.colors.length > 1 && (
            <div className="pd__section">
              <label className="pd__label">Color</label>
              <div className="pd__colors">
                {product.colors.map((color) => (
                  <button
                    key={color.hex}
                    className={`pd__color-swatch ${
                      (selectedColor?.hex || product.colors[0].hex) === color.hex
                        ? 'pd__color-swatch--active'
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

          {/* ─── Sizes ─── */}
          <div className="pd__section">
            <label className="pd__label">
              Size
              {!selectedSize && <span className="pd__required"> — Select</span>}
            </label>
            <div className="pd__sizes">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  className={`pd__size ${selectedSize === size ? 'pd__size--active' : ''}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* ─── Quantity ─── */}
          <div className="pd__section">
            <label className="pd__label">Quantity</label>
            <div className="pd__quantity">
              <button
                className="pd__qty-btn"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus size={14} />
              </button>
              <span className="pd__qty-value">{quantity}</span>
              <button
                className="pd__qty-btn"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* ─── Add to Bag — sticks to the bottom of the info column ─── */}
          <div className="pd__sticky-bar">
          <button
            className={`pd__add-btn ${!selectedSize ? 'pd__add-btn--disabled' : ''} ${added ? 'pd__add-btn--added' : ''}`}
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

            </div>{/* /pd__aside */}
          </div>{/* /pd__layout */}
        </div>{/* /pd__scroll */}
      </div>
    </div>
  );
}
