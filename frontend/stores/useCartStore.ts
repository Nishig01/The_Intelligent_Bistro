import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '../lib/mmkv';
import { MenuItem } from '../data/menu';

export type CartItem = MenuItem & {
  quantity: number;
  selectedModifiers: string[];
  spiceLevel?: number;
  instructions?: string;
};

interface CartState {
  items: CartItem[];
  addItem: (item: MenuItem, quantity?: number, modifiers?: string[], spiceLevel?: number, instructions?: string) => void;
  removeItem: (itemId: string, quantity?: number) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item, quantity = 1, modifiers = [], spiceLevel, instructions) => {
        set((state) => {
          const existingItem = state.items.find(i => 
            i.id === item.id && 
            JSON.stringify(i.selectedModifiers.sort()) === JSON.stringify(modifiers.sort()) &&
            i.spiceLevel === spiceLevel &&
            i.instructions === instructions
          );

          if (existingItem) {
            return {
              items: state.items.map(i => 
                i === existingItem ? { ...i, quantity: i.quantity + quantity } : i
              )
            };
          }

          return {
            items: [...state.items, { ...item, quantity, selectedModifiers: modifiers, spiceLevel, instructions }]
          };
        });
      },
      removeItem: (itemId, quantity) => {
        set((state) => {
          if (quantity === undefined) {
            return { items: state.items.filter(i => i.id !== itemId) };
          }
          
          const updatedItems = state.items.map(item => {
            if (item.id === itemId) {
              return { ...item, quantity: Math.max(0, item.quantity - quantity) };
            }
            return item;
          }).filter(item => item.quantity > 0);

          return { items: updatedItems };
        });
      },
      updateItemQuantity: (itemId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter(i => i.id !== itemId) };
          }
          return {
            items: state.items.map(item => item.id === itemId ? { ...item, quantity } : item)
          };
        });
      },
      clearCart: () => set({ items: [] }),
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      }
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
