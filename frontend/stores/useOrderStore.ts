import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '../lib/mmkv';
import { CartItem } from './useCartStore';
import { Address } from './useAddressStore';

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  tip: number;
  date: string;
  status: 'preparing' | 'ready' | 'on_the_way' | 'delivered';
  address: Address;
  paymentMethod: string;
  eta: string;
  orderType?: 'delivery' | 'pickup' | 'dine-in';
  tableNumber?: string;
}

interface OrderState {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      orders: [],
      addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
      updateOrderStatus: (id, status) => set((state) => ({
        orders: state.orders.map(o => o.id === id ? { ...o, status } : o)
      })),
    }),
    {
      name: 'bistro-order-storage',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
