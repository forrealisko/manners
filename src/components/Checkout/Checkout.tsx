/* ═══════════════════════════════════════════════════════
   MANNERS — Checkout Overlay
   Premium checkout with free shipping progress,
   Apple Pay / Google Pay placeholders, order summary
   ═══════════════════════════════════════════════════════ */

import { useState } from 'react';
import { ArrowLeft, X, Check, Truck, Lock, CreditCard, ChevronDown } from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';
import { formatPrice, getPlaceholderGradient } from '../../data/products';
import './Checkout.css';

const FREE_SHIPPING_THRESHOLD = 96;
const SHIPPING_COST = 8;

interface CheckoutProps {
  onClose: () => void;
}

export default function Checkout({ onClose }: CheckoutProps) {
  const { items, getTotal } = useCartStore();
  const [step, setStep] = useState<'summary' | 'shipping' | 'payment' | 'confirmed'>('summary');

  const subtotal = getTotal();
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingCost = isFreeShipping ? 0 : SHIPPING_COST;
  const total = subtotal + shippingCost;
  const freeShippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const amountToFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;

  if (items.length === 0 && step !== 'confirmed') {
    onClose();
    return null;
  }

  return (
    <div className="checkout" id="checkout-overlay">
      <div className="checkout__backdrop" onClick={onClose} />

      <div className="checkout__panel">
        {/* ─── Header ─── */}
        <div className="checkout__header">
          {step !== 'summary' && step !== 'confirmed' ? (
            <button
              className="checkout__back"
              onClick={() => setStep(step === 'payment' ? 'shipping' : 'summary')}
            >
              <ArrowLeft size={20} strokeWidth={1.5} />
            </button>
          ) : (
            <div style={{ width: 36 }} />
          )}
          <h2 className="checkout__header-title">
            {step === 'summary' && 'Order Summary'}
            {step === 'shipping' && 'Shipping'}
            {step === 'payment' && 'Payment'}
            {step === 'confirmed' && 'Confirmed'}
          </h2>
          <button className="checkout__close" onClick={onClose}>
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* ─── Step Indicators ─── */}
        {step !== 'confirmed' && (
          <div className="checkout__steps">
            <div className={`checkout__step-dot ${step === 'summary' ? 'checkout__step-dot--active' : ''} ${['shipping', 'payment'].includes(step) ? 'checkout__step-dot--done' : ''}`} />
            <div className="checkout__step-line" />
            <div className={`checkout__step-dot ${step === 'shipping' ? 'checkout__step-dot--active' : ''} ${step === 'payment' ? 'checkout__step-dot--done' : ''}`} />
            <div className="checkout__step-line" />
            <div className={`checkout__step-dot ${step === 'payment' ? 'checkout__step-dot--active' : ''}`} />
          </div>
        )}

        {/* ─── Content ─── */}
        <div className="checkout__content">
          {step === 'summary' && (
            <SummaryStep
              items={items}
              subtotal={subtotal}
              shippingCost={shippingCost}
              total={total}
              isFreeShipping={isFreeShipping}
              freeShippingProgress={freeShippingProgress}
              amountToFreeShipping={amountToFreeShipping}
              onContinue={() => setStep('shipping')}
            />
          )}

          {step === 'shipping' && (
            <ShippingStep onContinue={() => setStep('payment')} />
          )}

          {step === 'payment' && (
            <PaymentStep
              total={total}
              onConfirm={() => setStep('confirmed')}
            />
          )}

          {step === 'confirmed' && (
            <ConfirmedStep onClose={onClose} />
          )}
        </div>
      </div>
    </div>
  );
}


/* ─── Step 1: Order Summary ─── */
function SummaryStep({
  items,
  subtotal,
  shippingCost,
  total,
  isFreeShipping,
  freeShippingProgress,
  amountToFreeShipping,
  onContinue,
}: {
  items: ReturnType<typeof useCartStore.getState>['items'];
  subtotal: number;
  shippingCost: number;
  total: number;
  isFreeShipping: boolean;
  freeShippingProgress: number;
  amountToFreeShipping: number;
  onContinue: () => void;
}) {
  return (
    <div className="checkout-step">
      {/* Free Shipping Progress */}
      <div className="shipping-progress">
        <div className="shipping-progress__bar-track">
          <div
            className="shipping-progress__bar-fill"
            style={{ width: `${freeShippingProgress}%` }}
          />
          <div
            className="shipping-progress__bar-marker"
            style={{ left: `${freeShippingProgress}%` }}
          >
            <Truck size={14} />
          </div>
        </div>
        <p className="shipping-progress__text">
          {isFreeShipping ? (
            <>
              <Check size={13} className="shipping-progress__check" />
              <span>Free shipping unlocked!</span>
            </>
          ) : (
            <span>Add <strong>{formatPrice(amountToFreeShipping)}</strong> more for free shipping</span>
          )}
        </p>
      </div>

      {/* Cart Items */}
      <div className="checkout-items">
        {items.map((item, idx) => (
          <div key={`${item.product.id}-${item.size}-${item.color.hex}`} className="checkout-item">
            <div
              className="checkout-item__thumb"
              style={{
                ...getPlaceholderGradient(item.product.category, idx, item.product.images[0]),
                backgroundImage: item.product.images[0] ? `url(${item.product.images[0]})` : 'none',
                backgroundPosition: 'center',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
              }}
            />
            <div className="checkout-item__info">
              <span className="checkout-item__name">{item.product.name}</span>
              <span className="checkout-item__meta">
                {item.size} · {item.color.name} · Qty {item.quantity}
              </span>
            </div>
            <span className="checkout-item__price">
              {formatPrice(item.product.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="checkout-totals">
        <div className="checkout-totals__row">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="checkout-totals__row">
          <span>Shipping</span>
          <span className={isFreeShipping ? 'checkout-totals__free' : ''}>
            {isFreeShipping ? 'Free' : formatPrice(shippingCost)}
          </span>
        </div>
        <div className="checkout-totals__divider" />
        <div className="checkout-totals__row checkout-totals__row--total">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      {/* Continue Button */}
      <button className="checkout-btn checkout-btn--primary" onClick={onContinue}>
        Continue to Shipping
      </button>
    </div>
  );
}


/* ─── Step 2: Shipping ─── */
function ShippingStep({ onContinue }: { onContinue: () => void }) {
  const [formValid, setFormValid] = useState(false);

  const handleInputChange = (e: React.FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget;
    setFormValid(form.checkValidity());
  };

  return (
    <div className="checkout-step">
      <form
        className="checkout-form"
        onChange={handleInputChange}
        onSubmit={(e) => { e.preventDefault(); if (formValid) onContinue(); }}
      >
        <div className="checkout-form__group">
          <label className="checkout-form__label">Email</label>
          <input
            type="email"
            className="checkout-form__input"
            placeholder="your@email.com"
            required
            autoComplete="email"
          />
        </div>

        <div className="checkout-form__row">
          <div className="checkout-form__group">
            <label className="checkout-form__label">First Name</label>
            <input
              type="text"
              className="checkout-form__input"
              placeholder="First"
              required
              autoComplete="given-name"
            />
          </div>
          <div className="checkout-form__group">
            <label className="checkout-form__label">Last Name</label>
            <input
              type="text"
              className="checkout-form__input"
              placeholder="Last"
              required
              autoComplete="family-name"
            />
          </div>
        </div>

        <div className="checkout-form__group">
          <label className="checkout-form__label">Address</label>
          <input
            type="text"
            className="checkout-form__input"
            placeholder="Street address"
            required
            autoComplete="street-address"
          />
        </div>

        <div className="checkout-form__row">
          <div className="checkout-form__group">
            <label className="checkout-form__label">City</label>
            <input
              type="text"
              className="checkout-form__input"
              placeholder="City"
              required
              autoComplete="address-level2"
            />
          </div>
          <div className="checkout-form__group checkout-form__group--small">
            <label className="checkout-form__label">Postal Code</label>
            <input
              type="text"
              className="checkout-form__input"
              placeholder="00000"
              required
              autoComplete="postal-code"
            />
          </div>
        </div>

        <div className="checkout-form__group">
          <label className="checkout-form__label">Country</label>
          <div className="checkout-form__select-wrap">
            <select className="checkout-form__select" required autoComplete="country" defaultValue="">
              <option value="" disabled>Select country</option>
              <option value="SK">Slovakia</option>
              <option value="CZ">Czech Republic</option>
              <option value="DE">Germany</option>
              <option value="AT">Austria</option>
              <option value="PL">Poland</option>
              <option value="HU">Hungary</option>
              <option value="FR">France</option>
              <option value="IT">Italy</option>
              <option value="ES">Spain</option>
              <option value="NL">Netherlands</option>
              <option value="GB">United Kingdom</option>
              <option value="US">United States</option>
            </select>
            <ChevronDown size={14} className="checkout-form__select-icon" />
          </div>
        </div>

        <div className="checkout-form__group">
          <label className="checkout-form__label">Phone <span className="checkout-form__optional">(optional)</span></label>
          <input
            type="tel"
            className="checkout-form__input"
            placeholder="+421 ..."
            autoComplete="tel"
          />
        </div>

        <button
          type="submit"
          className={`checkout-btn checkout-btn--primary ${!formValid ? 'checkout-btn--disabled' : ''}`}
          disabled={!formValid}
        >
          Continue to Payment
        </button>
      </form>
    </div>
  );
}


/* ─── Step 3: Payment ─── */
function PaymentStep({ total, onConfirm }: { total: number; onConfirm: () => void }) {
  const [selectedMethod, setSelectedMethod] = useState<'apple' | 'google' | 'card'>('apple');

  return (
    <div className="checkout-step">
      {/* Express Checkout */}
      <div className="payment-express">
        <span className="payment-express__label">Express checkout</span>
        <div className="payment-express__buttons">
          <button
            className={`payment-express__btn payment-express__btn--apple ${selectedMethod === 'apple' ? 'payment-express__btn--selected' : ''}`}
            onClick={() => setSelectedMethod('apple')}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            <span>Pay</span>
          </button>
          <button
            className={`payment-express__btn payment-express__btn--google ${selectedMethod === 'google' ? 'payment-express__btn--selected' : ''}`}
            onClick={() => setSelectedMethod('google')}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Pay</span>
          </button>
        </div>
      </div>

      <div className="payment-divider">
        <span className="payment-divider__line" />
        <span className="payment-divider__text">or pay with card</span>
        <span className="payment-divider__line" />
      </div>

      {/* Card Form */}
      <div className="payment-card">
        <div className="checkout-form__group">
          <label className="checkout-form__label">Card Number</label>
          <div className="payment-card__input-wrap">
            <input
              type="text"
              className="checkout-form__input"
              placeholder="4242 4242 4242 4242"
              maxLength={19}
            />
            <CreditCard size={16} className="payment-card__icon" />
          </div>
        </div>

        <div className="checkout-form__row">
          <div className="checkout-form__group">
            <label className="checkout-form__label">Expiry</label>
            <input
              type="text"
              className="checkout-form__input"
              placeholder="MM / YY"
              maxLength={7}
            />
          </div>
          <div className="checkout-form__group">
            <label className="checkout-form__label">CVC</label>
            <input
              type="text"
              className="checkout-form__input"
              placeholder="123"
              maxLength={4}
            />
          </div>
        </div>
      </div>

      {/* Pay Button */}
      <button className="checkout-btn checkout-btn--pay" onClick={onConfirm}>
        <Lock size={14} strokeWidth={2} />
        <span>Pay {formatPrice(total)}</span>
      </button>

      <p className="payment-secure">
        <Lock size={11} />
        <span>Secured with 256-bit SSL encryption</span>
      </p>
    </div>
  );
}


/* ─── Step 4: Confirmed ─── */
function ConfirmedStep({ onClose }: { onClose: () => void }) {
  const clearCart = useCartStore((s) => s.clearCart);
  const orderNumber = `MNR-${Date.now().toString(36).toUpperCase().slice(-6)}`;

  const handleContinue = () => {
    clearCart();
    onClose();
  };

  return (
    <div className="checkout-step checkout-step--confirmed">
      <div className="confirmed__icon">
        <div className="confirmed__circle">
          <Check size={32} strokeWidth={2} />
        </div>
      </div>

      <h3 className="confirmed__title">Thank you</h3>
      <p className="confirmed__subtitle">Your order has been placed</p>

      <div className="confirmed__order-id">
        <span className="confirmed__order-label">Order</span>
        <span className="confirmed__order-number">{orderNumber}</span>
      </div>

      <p className="confirmed__note">
        A confirmation email will be sent to your inbox with tracking details.
      </p>

      <button className="checkout-btn checkout-btn--primary" onClick={handleContinue}>
        Continue Shopping
      </button>
    </div>
  );
}
