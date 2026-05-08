/* ═══════════════════════════════════════════════════════
   MANNERS — Header Component
   Logo click = dark/light toggle
   Live search with real-time results
   Cart slide-out panel
   ═══════════════════════════════════════════════════════ */

import { useState, useRef, useEffect } from 'react';
import { Search, User, ShoppingBag, Menu, X, Trash2, Plus, Minus } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { useCartStore } from '../../stores/cartStore';
import { searchProducts, formatPrice, getPlaceholderGradient } from '../../data/products';
import type { Product } from '../../data/products';
import './Header.css';

export default function Header() {
  const { isMenuOpen, toggleMenu, isSearchOpen, toggleSearch, toggleTheme } = useAppStore();
  const itemCount = useCartStore((s) => s.getItemCount());
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <>
      <header className="header" id="main-header">
        <div className="header__inner">
          {/* Left: Search + Account */}
          <div className="header__left">
            <button
              className="header__action"
              onClick={toggleSearch}
              aria-label="Search"
              id="search-btn"
            >
              <Search size={20} strokeWidth={1.5} />
            </button>
            <button
              className="header__action"
              aria-label="Customer portal"
              id="account-btn"
            >
              <User size={20} strokeWidth={1.5} />
            </button>
          </div>

          {/* Center: Brand — click to toggle theme */}
          <button className="header__brand" onClick={toggleTheme} id="brand-logo" aria-label="Toggle dark/light mode">
            <span className="header__brand-text">m a n n e r s</span>
          </button>

          {/* Right: Cart + Menu */}
          <div className="header__right">
            <button
              className="header__action header__cart-btn"
              aria-label={`Shopping bag (${itemCount} items)`}
              id="cart-btn"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              {itemCount > 0 && (
                <span className="header__cart-count">{itemCount}</span>
              )}
            </button>
            <button
              className="header__action"
              onClick={toggleMenu}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              id="menu-btn"
            >
              {isMenuOpen ? (
                <X size={22} strokeWidth={1.5} />
              ) : (
                <Menu size={22} strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      {isSearchOpen && <SearchOverlay />}

      {/* Menu Overlay */}
      {isMenuOpen && <MenuOverlay />}

      {/* Cart Overlay */}
      {isCartOpen && <CartOverlay onClose={() => setIsCartOpen(false)} />}
    </>
  );
}

/* ─── Search Overlay with Live Results ─── */
function SearchOverlay() {
  const { toggleSearch, setActiveFilter, setSelectedProduct } = useAppStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (value.trim().length > 0) {
      setResults(searchProducts(value));
    } else {
      setResults([]);
    }
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product.id);
    toggleSearch();
  };

  const handleSelectCategory = (category: string) => {
    setActiveFilter(category as any);
    toggleSearch();
  };

  return (
    <div className="search-overlay" id="search-overlay">
      <div className="search-overlay__backdrop" onClick={toggleSearch} />
      <div className="search-overlay__panel">
        <div className="search-overlay__input-wrap">
          <Search size={18} strokeWidth={1.5} className="search-overlay__icon" />
          <input
            ref={inputRef}
            type="text"
            className="search-overlay__input"
            placeholder="Search products..."
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            id="search-input"
          />
          {query && (
            <button className="search-overlay__clear" onClick={() => handleQueryChange('')}>
              <X size={16} strokeWidth={1.5} />
            </button>
          )}
          <button className="search-overlay__close" onClick={toggleSearch}>
            Cancel
          </button>
        </div>

        {/* Live Results */}
        {query.trim().length > 0 && (
          <div className="search-results">
            {results.length === 0 ? (
              <div className="search-results__empty">
                <span className="search-results__empty-text">No results for "{query}"</span>
              </div>
            ) : (
              <>
                {/* Category matches */}
                {['caps', 'tees', 'jeans', 'hoodies', 'accessories'].filter(c => c.includes(query.toLowerCase())).length > 0 && (
                  <div className="search-results__section">
                    <span className="search-results__section-title">Categories</span>
                    <div className="search-results__categories">
                      {['caps', 'tees', 'jeans', 'hoodies', 'accessories']
                        .filter(c => c.includes(query.toLowerCase()))
                        .map(c => (
                          <button
                            key={c}
                            className="search-results__category-pill"
                            onClick={() => handleSelectCategory(c)}
                          >
                            {c.charAt(0).toUpperCase() + c.slice(1)}
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {/* Product matches */}
                <div className="search-results__section">
                  <span className="search-results__section-title">
                    Products ({results.length})
                  </span>
                  <ul className="search-results__list">
                    {results.slice(0, 8).map((product) => (
                      <li key={product.id}>
                        <button
                          className="search-results__item"
                          onClick={() => handleSelectProduct(product)}
                        >
                          <div
                            className="search-results__thumb"
                            style={{
                              background: product.images[0]
                                ? `url(${product.images[0]}) center/contain no-repeat`
                                : getPlaceholderGradient(product.category, 0),
                            }}
                          />
                          <div className="search-results__info">
                            <span className="search-results__name">{product.name}</span>
                            <span className="search-results__meta">
                              {product.category} · {formatPrice(product.price)}
                            </span>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        )}

        {/* Default suggestions when no query */}
        {query.trim().length === 0 && (
          <div className="search-overlay__suggestions">
            <span className="search-overlay__hint">Try: caps, tees, jeans, hoodies</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Cart Slide-out Panel ─── */
function CartOverlay({ onClose }: { onClose: () => void }) {
  const { items, removeItem, updateQuantity, getTotal, getItemCount, clearCart } = useCartStore();

  return (
    <div className="cart-overlay" id="cart-overlay">
      <div className="cart-overlay__backdrop" onClick={onClose} />
      <div className="cart-overlay__panel">
        {/* Cart Header */}
        <div className="cart-overlay__header">
          <h2 className="cart-overlay__title">
            Bag ({getItemCount()})
          </h2>
          <button className="cart-overlay__close" onClick={onClose}>
            <X size={22} strokeWidth={1.5} />
          </button>
        </div>

        {/* Cart Items */}
        {items.length === 0 ? (
          <div className="cart-overlay__empty">
            <ShoppingBag size={48} strokeWidth={1} className="cart-overlay__empty-icon" />
            <p className="cart-overlay__empty-text">Your bag is empty</p>
            <button className="cart-overlay__continue" onClick={onClose}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <ul className="cart-overlay__items">
              {items.map((item, idx) => (
                <li key={`${item.product.id}-${item.size}-${item.color.hex}`} className="cart-item">
                  <div
                    className="cart-item__thumb"
                    style={{
                      background: item.product.images[0]
                        ? `url(${item.product.images[0]}) center/contain no-repeat`
                        : getPlaceholderGradient(item.product.category, idx),
                    }}
                  />
                  <div className="cart-item__details">
                    <span className="cart-item__name">{item.product.name}</span>
                    <span className="cart-item__meta">
                      {item.size} · {item.color.name}
                    </span>
                    <span className="cart-item__price">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                  <div className="cart-item__actions">
                    <div className="cart-item__qty">
                      <button
                        className="cart-item__qty-btn"
                        onClick={() => {
                          if (item.quantity <= 1) {
                            removeItem(item.product.id, item.size, item.color.hex);
                          } else {
                            updateQuantity(item.product.id, item.size, item.color.hex, item.quantity - 1);
                          }
                        }}
                      >
                        {item.quantity <= 1 ? <Trash2 size={12} /> : <Minus size={12} />}
                      </button>
                      <span className="cart-item__qty-num">{item.quantity}</span>
                      <button
                        className="cart-item__qty-btn"
                        onClick={() => updateQuantity(item.product.id, item.size, item.color.hex, item.quantity + 1)}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Cart Footer */}
            <div className="cart-overlay__footer">
              <div className="cart-overlay__total">
                <span className="cart-overlay__total-label">Total</span>
                <span className="cart-overlay__total-amount">{formatPrice(getTotal())}</span>
              </div>
              <button className="cart-overlay__checkout">
                Checkout — {formatPrice(getTotal())}
              </button>
              <button className="cart-overlay__clear" onClick={clearCart}>
                Clear Bag
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Full-screen Menu ─── */
function MenuOverlay() {
  const { setMenuOpen, setActiveFilter } = useAppStore();

  const handleNav = (filter: string | null) => {
    if (filter !== null) {
      setActiveFilter(filter as any);
    }
    setMenuOpen(false);
  };

  const menuItems = [
    { label: 'Shop All', action: () => handleNav('all') },
    { label: 'Caps', action: () => handleNav('caps') },
    { label: 'Tees', action: () => handleNav('tees') },
    { label: 'Jeans', action: () => handleNav('jeans') },
    { label: 'Hoodies', action: () => handleNav('hoodies') },
    { label: 'Accessories', action: () => handleNav('accessories') },
  ];

  const secondaryItems = [
    { label: 'About', href: '#' },
    { label: 'Contact', href: '#' },
    { label: 'Shipping & Returns', href: '#' },
    { label: 'FAQ', href: '#' },
  ];

  return (
    <div className="menu-overlay" id="menu-overlay">
      <div className="menu-overlay__backdrop" onClick={() => setMenuOpen(false)} />
      <nav className="menu-overlay__panel">
        <div className="menu-overlay__header">
          <button className="menu-overlay__close" onClick={() => setMenuOpen(false)}>
            <X size={22} strokeWidth={1.5} />
          </button>
        </div>

        <ul className="menu-overlay__list">
          {menuItems.map((item, i) => (
            <li
              key={item.label}
              className="menu-overlay__item"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <button className="menu-overlay__link" onClick={item.action}>
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="menu-overlay__divider" />

        <ul className="menu-overlay__secondary">
          {secondaryItems.map((item, i) => (
            <li
              key={item.label}
              className="menu-overlay__item menu-overlay__item--secondary"
              style={{ animationDelay: `${(menuItems.length + i) * 50}ms` }}
            >
              <a href={item.href} className="menu-overlay__link menu-overlay__link--secondary">
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="menu-overlay__footer">
          <a href="https://instagram.com" target="_blank" rel="noopener" className="menu-overlay__social">Instagram</a>
          <a href="https://tiktok.com" target="_blank" rel="noopener" className="menu-overlay__social">TikTok</a>
        </div>
      </nav>
    </div>
  );
}
