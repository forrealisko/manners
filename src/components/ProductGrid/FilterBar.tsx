/* ═══════════════════════════════════════════════════════
   MANNERS — Filter Bar (Minimal)
   Just category pills, no title, no "Filter" text
   ═══════════════════════════════════════════════════════ */

import { useAppStore, type CategoryFilter } from '../../stores/appStore';
import './FilterBar.css';

const filters: { key: CategoryFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'caps', label: 'Caps' },
  { key: 'tees', label: 'Tees' },
  { key: 'jeans', label: 'Jeans' },
  { key: 'hoodies', label: 'Hoodies' },
  { key: 'accessories', label: 'Accessories' },
];

export default function FilterBar() {
  const { activeFilter, setActiveFilter } = useAppStore();

  return (
    <div className="filter-bar" id="filter-bar">
      <div className="filter-bar__pills">
        {filters.map((f) => (
          <button
            key={f.key}
            className={`filter-bar__pill ${activeFilter === f.key ? 'filter-bar__pill--active' : ''}`}
            onClick={() => setActiveFilter(f.key)}
            id={`filter-${f.key}`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
