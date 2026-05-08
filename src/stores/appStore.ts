/* ═══════════════════════════════════════════════════════
   MANNERS — App Store (Zustand)
   Persistent filter + theme via localStorage
   ═══════════════════════════════════════════════════════ */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CategoryFilter = 'all' | 'caps' | 'tees' | 'jeans' | 'hoodies' | 'accessories';
export type Theme = 'dark' | 'light';

interface AppState {
  /* Loading */
  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  /* Theme */
  theme: Theme;
  toggleTheme: () => void;

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
      toggleTheme: () =>
        set((s) => {
          const next = s.theme === 'dark' ? 'light' : 'dark';
          document.documentElement.setAttribute('data-theme', next);
          return { theme: next };
        }),

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
      // Only persist theme and activeFilter
      partialize: (state) => ({
        theme: state.theme,
        activeFilter: state.activeFilter,
      }),
      onRehydrateStorage: () => (state) => {
        // Apply persisted theme on load
        if (state?.theme) {
          document.documentElement.setAttribute('data-theme', state.theme);
        }
      },
    }
  )
);
