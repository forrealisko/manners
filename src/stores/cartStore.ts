/* ═══════════════════════════════════════════════════════
   MANNERS — Cart Store (Zustand)
   Persistent cart with full CRUD operations
   ═══════════════════════════════════════════════════════ */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, ProductColor } from '../data/products';

interface CartItem {
  product: Product;
  size: string;
  color: ProductColor;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, size: string, color: ProductColor, quantity?: number) => void;
  removeItem: (productId: string, size: string, colorHex: string) => void;
  updateQuantity: (productId: string, size: string, colorHex: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, size, color, quantity = 1) =>
        set((state) => {
          const existingIdx = state.items.findIndex(
            (item) =>
              item.product.id === product.id &&
              item.size === size &&
              item.color.hex === color.hex
          );

          if (existingIdx >= 0) {
            // Increment existing item
            const updated = [...state.items];
            updated[existingIdx] = {
              ...updated[existingIdx],
              quantity: updated[existingIdx].quantity + quantity,
            };
            return { items: updated };
          }

          // Add new item
          return {
            items: [...state.items, { product, size, color, quantity }],
          };
        }),

      removeItem: (productId, size, colorHex) =>
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(item.product.id === productId &&
                item.size === size &&
                item.color.hex === colorHex)
          ),
        })),

      updateQuantity: (productId, size, colorHex, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter(
                (item) =>
                  !(item.product.id === productId &&
                    item.size === size &&
                    item.color.hex === colorHex)
              ),
            };
          }

          return {
            items: state.items.map((item) =>
              item.product.id === productId &&
              item.size === size &&
              item.color.hex === colorHex
                ? { ...item, quantity }
                : item
            ),
          };
        }),

      clearCart: () => set({ items: [] }),

      getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

      getTotal: () =>
        get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    }),
    {
      name: 'manners-cart',
    }
  )
);
