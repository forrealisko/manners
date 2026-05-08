/* ═══════════════════════════════════════════════════════
   MANNERS — Header Component
   Logo click = dark/light toggle
   Live search with real-time results
   Cart slide-out panel
   ═══════════════════════════════════════════════════════ */

import { useState, useRef, useEffect } from 'react';
import { Search, User, ShoppingBag, Menu, X, Trash2, Plus, Minus, Sun, Moon } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { useCartStore } from '../../stores/cartStore';
import { searchProducts, formatPrice, getPlaceholderGradient } from '../../data/products';
import type { Product } from '../../data/products';
import Checkout from '../Checkout/Checkout';
import './Header.css';

export default function Header() {
  const { isMenuOpen, toggleMenu, isSearchOpen, toggleSearch } = useAppStore();
  const itemCount = useCartStore((s) => s.getItemCount());
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

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
              onClick={() => setIsAccountOpen(true)}
              aria-label="Customer portal"
              id="account-btn"
            >
              <User size={20} strokeWidth={1.5} />
            </button>
          </div>

          {/* Center: Brand */}
          <div className="header__brand" id="brand-logo">
            <span className="header__brand-text">m a n n e r s</span>
          </div>

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
      {isCartOpen && (
        <CartOverlay
          onClose={() => setIsCartOpen(false)}
          onCheckout={() => {
            setIsCartOpen(false);
            setIsCheckoutOpen(true);
          }}
        />
      )}

      {/* Checkout Overlay */}
      {isCheckoutOpen && <Checkout onClose={() => setIsCheckoutOpen(false)} />}

      {/* Account Overlay */}
      {isAccountOpen && <AccountOverlay onClose={() => setIsAccountOpen(false)} />}
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
                              ...getPlaceholderGradient(product.category, 0, product.images[0]),
                              backgroundImage: product.images[0] ? `url(${product.images[0]})` : 'none',
                              backgroundPosition: 'center',
                              backgroundSize: 'contain',
                              backgroundRepeat: 'no-repeat'
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
function CartOverlay({ onClose, onCheckout }: { onClose: () => void; onCheckout: () => void }) {
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
                      ...getPlaceholderGradient(item.product.category, idx, item.product.images[0]),
                      backgroundImage: item.product.images[0] ? `url(${item.product.images[0]})` : 'none',
                      backgroundPosition: 'center',
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat'
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
              <button className="cart-overlay__checkout" onClick={onCheckout}>
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
  const { setMenuOpen, setActiveFilter, theme, toggleTheme } = useAppStore();

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
          <button className="menu-overlay__theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
          </button>
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

/* ─── Account Overlay ─── */
function AccountOverlay({ onClose }: { onClose: () => void }) {
  const [view, setView] = useState<'login' | 'register' | 'forgot' | 'profile'>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (isLoggedIn) {
    return (
      <div className="account-overlay" id="account-overlay">
        <div className="account-overlay__backdrop" onClick={onClose} />
        <div className="account-overlay__panel">
          <div className="account-overlay__header">
            <h2 className="account-overlay__title">My Account</h2>
            <button className="account-overlay__close" onClick={onClose}>
              <X size={22} strokeWidth={1.5} />
            </button>
          </div>

          <div className="account-overlay__profile">
            <div className="account-overlay__avatar">
              <User size={32} strokeWidth={1} />
            </div>
            <div className="account-overlay__profile-info">
              <span className="account-overlay__profile-name">Member</span>
              <span className="account-overlay__profile-points">0 Points</span>
            </div>
          </div>

          <div className="account-overlay__sections">
            <div className="account-overlay__section">
              <label className="account-overlay__label">Birthday</label>
              <input type="date" className="account-overlay__input" />
            </div>

            <div className="account-overlay__section">
              <label className="account-overlay__label">Phone</label>
              <input type="tel" className="account-overlay__input" placeholder="+421..." />
            </div>

            <div className="account-overlay__menu-list">
              <button className="account-overlay__menu-item">Order History</button>
              <button className="account-overlay__menu-item">Saved Addresses</button>
              <button className="account-overlay__menu-item">Wishlist</button>
              <button className="account-overlay__menu-item">Preferences</button>
            </div>

            <button
              className="account-overlay__logout"
              onClick={() => setIsLoggedIn(false)}
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="account-overlay" id="account-overlay">
      <div className="account-overlay__backdrop" onClick={onClose} />
      <div className="account-overlay__panel">
        <div className="account-overlay__header">
          <h2 className="account-overlay__title">
            {view === 'login' && 'Sign In'}
            {view === 'register' && 'Create Account'}
            {view === 'forgot' && 'Reset Password'}
          </h2>
          <button className="account-overlay__close" onClick={onClose}>
            <X size={22} strokeWidth={1.5} />
          </button>
        </div>

        <div className="account-overlay__content">
          {view === 'login' && (
            <form className="account-form" onSubmit={(e) => { e.preventDefault(); setIsLoggedIn(true); }}>
              <div className="account-form__group">
                <label className="account-form__label">Email</label>
                <input type="email" className="account-form__input" placeholder="your@email.com" required />
              </div>
              <div className="account-form__group">
                <label className="account-form__label">Password</label>
                <input type="password" className="account-form__input" placeholder="••••••••" required />
              </div>
              <button type="submit" className="account-form__submit">Sign In</button>
              <div className="account-form__links">
                <button type="button" className="account-form__link" onClick={() => setView('forgot')}>
                  Forgot password?
                </button>
                <button type="button" className="account-form__link" onClick={() => setView('register')}>
                  Create account
                </button>
              </div>
            </form>
          )}

          {view === 'register' && (
            <form className="account-form" onSubmit={(e) => { e.preventDefault(); setIsLoggedIn(true); }}>
              <div className="account-form__row">
                <div className="account-form__group">
                  <label className="account-form__label">First Name</label>
                  <input type="text" className="account-form__input" placeholder="First" required />
                </div>
                <div className="account-form__group">
                  <label className="account-form__label">Last Name</label>
                  <input type="text" className="account-form__input" placeholder="Last" required />
                </div>
              </div>
              <div className="account-form__group">
                <label className="account-form__label">Email</label>
                <input type="email" className="account-form__input" placeholder="your@email.com" required />
              </div>
              <div className="account-form__group">
                <label className="account-form__label">Password</label>
                <input type="password" className="account-form__input" placeholder="Min 8 characters" required minLength={8} />
              </div>
              <div className="account-form__group">
                <label className="account-form__label">Birthday <span className="account-form__optional">(for rewards)</span></label>
                <input type="date" className="account-form__input" />
              </div>
              <button type="submit" className="account-form__submit">Create Account</button>
              <div className="account-form__links">
                <button type="button" className="account-form__link" onClick={() => setView('login')}>
                  Already have an account? Sign in
                </button>
              </div>
            </form>
          )}

          {view === 'forgot' && (
            <form className="account-form" onSubmit={(e) => { e.preventDefault(); setView('login'); }}>
              <p className="account-form__hint">Enter your email and we'll send you a reset link.</p>
              <div className="account-form__group">
                <label className="account-form__label">Email</label>
                <input type="email" className="account-form__input" placeholder="your@email.com" required />
              </div>
              <button type="submit" className="account-form__submit">Send Reset Link</button>
              <div className="account-form__links">
                <button type="button" className="account-form__link" onClick={() => setView('login')}>
                  Back to sign in
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
