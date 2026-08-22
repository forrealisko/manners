/* ═══════════════════════════════════════════════════════
   MANNERS — App Store (Zustand)
   Manual dark/light toggle + persistent filters
   ═══════════════════════════════════════════════════════ */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CategoryFilter = 'all' | 'caps' | 'tees' | 'jeans' | 'hoodies' | 'accessories';
export type Theme = 'dark' | 'light';

/* ─── System preference (no permission prompt) ─── */
function getSystemTheme(): Theme {
  if (typeof window === 'undefined' || !window.matchMedia) return 'dark';
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

interface AppState {
  /* Loading */
  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  /* Theme */
  theme: Theme;
  themeOverride: boolean; // true = user picked it manually, stop following the system
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  initTheme: () => void;

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

      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme, themeOverride: true });
      },

      toggleTheme: () =>
        set((s) => {
          const next: Theme = s.theme === 'dark' ? 'light' : 'dark';
          applyTheme(next);
          return { theme: next, themeOverride: true };
        }),

      /* Runs once on mount. Follows the OS setting until the user picks
         a side with the toggle — then their choice sticks. */
      initTheme: () => {
        const state = useAppStore.getState();
        const theme = state.themeOverride ? state.theme : getSystemTheme();
        applyTheme(theme);
        if (theme !== state.theme) set({ theme });
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
      partialize: (state) => ({
        activeFilter: state.activeFilter,
        theme: state.theme,
        themeOverride: state.themeOverride,
      }),
    }
  )
);
