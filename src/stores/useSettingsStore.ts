import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
}

interface SettingsState {
  addresses: Address[];
  addAddress: (address: Omit<Address, 'id'>) => void;
  updateAddress: (id: string, address: Omit<Address, 'id'>) => void;
  removeAddress: (id: string) => void;
  
  notifications: {
    orderUpdates: boolean;
    promotions: boolean;
  };
  toggleNotification: (key: 'orderUpdates' | 'promotions') => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      addresses: [
        {
          id: '1',
          name: 'Home',
          street: '123 Example Street, Apt 4B',
          city: 'New York, NY 10001'
        }
      ],
      addAddress: (address) => set((state) => ({ 
        addresses: [...state.addresses, { ...address, id: Math.random().toString(36).substr(2, 9) }] 
      })),
      updateAddress: (id, address) => set((state) => ({
        addresses: state.addresses.map(a => a.id === id ? { ...address, id } : a)
      })),
      removeAddress: (id) => set((state) => ({
        addresses: state.addresses.filter(a => a.id !== id)
      })),
      
      notifications: {
        orderUpdates: true,
        promotions: false,
      },
      toggleNotification: (key) => set((state) => ({
        notifications: {
          ...state.notifications,
          [key]: !state.notifications[key]
        }
      })),
    }),
    { name: 'bistro-settings-storage' }
  )
);
