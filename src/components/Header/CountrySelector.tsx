/* ═══════════════════════════════════════════════════════
   MANNERS — Country / Currency Selector
   Glass dropdown from globe icon
   ═══════════════════════════════════════════════════════ */

import { useAppStore } from '../../stores/appStore';
import { Check } from 'lucide-react';
import './CountrySelector.css';

const regions = [
  { code: 'EU', label: 'Europe', currency: 'EUR', symbol: '€' },
  { code: 'US', label: 'United States', currency: 'USD', symbol: '$' },
  { code: 'GB', label: 'United Kingdom', currency: 'GBP', symbol: '£' },
  { code: 'JP', label: 'Japan', currency: 'JPY', symbol: '¥' },
  { code: 'CA', label: 'Canada', currency: 'CAD', symbol: 'CA$' },
  { code: 'AU', label: 'Australia', currency: 'AUD', symbol: 'A$' },
];

export default function CountrySelector() {
  const { selectedCountry, setCountry, toggleCountrySelector } = useAppStore();

  return (
    <>
      <div className="country-backdrop" onClick={toggleCountrySelector} />
      <div className="country-selector glass glass--strong glass-shadow--elevated" id="country-selector">
        <div className="country-selector__header">
          <span className="country-selector__title">Region & Currency</span>
        </div>
        <ul className="country-selector__list">
          {regions.map((region) => (
            <li key={region.code}>
              <button
                className={`country-selector__item ${
                  selectedCountry === region.code ? 'country-selector__item--active' : ''
                }`}
                onClick={() => setCountry(region.code, region.currency)}
              >
                <span className="country-selector__label">{region.label}</span>
                <span className="country-selector__currency">
                  {region.symbol} {region.currency}
                </span>
                {selectedCountry === region.code && (
                  <Check size={14} className="country-selector__check" />
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
