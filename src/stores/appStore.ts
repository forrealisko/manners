/* ═══════════════════════════════════════════════════════
   MANNERS — App Store (Zustand)
   Auto sunrise/sunset theme + persistent filters
   ═══════════════════════════════════════════════════════ */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CategoryFilter = 'all' | 'caps' | 'tees' | 'jeans' | 'hoodies' | 'accessories';
export type Theme = 'dark' | 'light';

/* ─── Sunrise/Sunset Calculator ─── */
function getSunTimes(lat: number, lng: number): { sunrise: number; sunset: number } {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  // Simple sunrise/sunset approximation
  const zenith = 90.833;
  const D2R = Math.PI / 180;
  const R2D = 180 / Math.PI;

  const lngHour = lng / 15;

  // Sunrise
  const tRise = dayOfYear + (6 - lngHour) / 24;
  const mRise = 0.9856 * tRise - 3.289;
  let lRise = mRise + 1.916 * Math.sin(mRise * D2R) + 0.02 * Math.sin(2 * mRise * D2R) + 282.634;
  lRise = ((lRise % 360) + 360) % 360;
  let raRise = R2D * Math.atan(0.91764 * Math.tan(lRise * D2R));
  raRise = ((raRise % 360) + 360) % 360;
  const lqRise = Math.floor(lRise / 90) * 90;
  const raqRise = Math.floor(raRise / 90) * 90;
  raRise = raRise + (lqRise - raqRise);
  raRise = raRise / 15;
  const sinDecRise = 0.39782 * Math.sin(lRise * D2R);
  const cosDecRise = Math.cos(Math.asin(sinDecRise));
  const cosHRise = (Math.cos(zenith * D2R) - sinDecRise * Math.sin(lat * D2R)) / (cosDecRise * Math.cos(lat * D2R));
  const hRise = 360 - R2D * Math.acos(cosHRise);
  const tFinalRise = hRise / 15 + raRise - 0.06571 * tRise - 6.622;
  let utRise = ((tFinalRise - lngHour) % 24 + 24) % 24;

  // Sunset
  const tSet = dayOfYear + (18 - lngHour) / 24;
  const mSet = 0.9856 * tSet - 3.289;
  let lSet = mSet + 1.916 * Math.sin(mSet * D2R) + 0.02 * Math.sin(2 * mSet * D2R) + 282.634;
  lSet = ((lSet % 360) + 360) % 360;
  let raSet = R2D * Math.atan(0.91764 * Math.tan(lSet * D2R));
  raSet = ((raSet % 360) + 360) % 360;
  const lqSet = Math.floor(lSet / 90) * 90;
  const raqSet = Math.floor(raSet / 90) * 90;
  raSet = raSet + (lqSet - raqSet);
  raSet = raSet / 15;
  const sinDecSet = 0.39782 * Math.sin(lSet * D2R);
  const cosDecSet = Math.cos(Math.asin(sinDecSet));
  const cosHSet = (Math.cos(zenith * D2R) - sinDecSet * Math.sin(lat * D2R)) / (cosDecSet * Math.cos(lat * D2R));
  const hSet = R2D * Math.acos(cosHSet);
  const tFinalSet = hSet / 15 + raSet - 0.06571 * tSet - 6.622;
  let utSet = ((tFinalSet - lngHour) % 24 + 24) % 24;

  // Convert UTC hours to local hours
  const tzOffset = -now.getTimezoneOffset() / 60;
  const sunrise = (utRise + tzOffset) % 24;
  const sunset = (utSet + tzOffset) % 24;

  return { sunrise, sunset };
}

function getAutoTheme(lat: number, lng: number): Theme {
  const { sunrise, sunset } = getSunTimes(lat, lng);
  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;
  return currentHour >= sunrise && currentHour < sunset ? 'light' : 'dark';
}

/* Default fallback: Central Europe ~48.1°N, 17.1°E (Bratislava) */
const DEFAULT_LAT = 48.15;
const DEFAULT_LNG = 17.11;

interface AppState {
  /* Loading */
  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  /* Theme */
  theme: Theme;
  themeOverride: boolean; // true = user manually toggled
  toggleTheme: () => void;
  initAutoTheme: () => void;

  /* Navigation */
  isMenuOpen: boolean;
  toggleMenu: () => void;
  setMenuOpen: (open: boolean) => void;

  /* Search */
  isSearchOpen: boolean;
  searchQuery: string;
  toggleSearch: () => void;
  setSearchQuery: (query: string) => void;

  /* Filters — persisted so category is remembered */
  activeFilter: CategoryFilter;
  setActiveFilter: (filter: CategoryFilter) => void;

  /* Product detail */
  selectedProductId: string | null;
  setSelectedProduct: (id: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      /* Loading */
      isLoading: true,
      setLoading: (loading) => set({ isLoading: loading }),

      /* Theme */
      theme: 'dark',
      themeOverride: false,
      toggleTheme: () =>
        set((s) => {
          const next = s.theme === 'dark' ? 'light' : 'dark';
          document.documentElement.setAttribute('data-theme', next);
          return { theme: next, themeOverride: true };
        }),

      initAutoTheme: () => {
        // Only auto-set if user hasn't manually toggled this session
        const state = useAppStore.getState();
        if (state.themeOverride) return;

        const applyTheme = (lat: number, lng: number) => {
          const autoTheme = getAutoTheme(lat, lng);
          document.documentElement.setAttribute('data-theme', autoTheme);
          set({ theme: autoTheme });
        };

        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            (pos) => applyTheme(pos.coords.latitude, pos.coords.longitude),
            () => applyTheme(DEFAULT_LAT, DEFAULT_LNG),
            { timeout: 3000 }
          );
        } else {
          applyTheme(DEFAULT_LAT, DEFAULT_LNG);
        }
      },

      /* Navigation */
      isMenuOpen: false,
      toggleMenu: () => set((s) => ({ isMenuOpen: !s.isMenuOpen })),
      setMenuOpen: (open) => set({ isMenuOpen: open }),

      /* Search */
      isSearchOpen: false,
      searchQuery: '',
      toggleSearch: () => set((s) => ({ isSearchOpen: !s.isSearchOpen })),
      setSearchQuery: (query) => set({ searchQuery: query }),

      /* Filters */
      activeFilter: 'all',
      setActiveFilter: (filter) => set({ activeFilter: filter }),

      /* Product detail */
      selectedProductId: null,
      setSelectedProduct: (id) => set({ selectedProductId: id }),
    }),
    {
      name: 'manners-app',
      // Only persist activeFilter. Theme is auto-detected on each load.
      partialize: (state) => ({
        activeFilter: state.activeFilter,
      }),
      onRehydrateStorage: () => () => {
        // Auto theme is triggered from App.tsx on mount
      },
    }
  )
);
