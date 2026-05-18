import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '../lib/mmkv';

interface NotificationSettings {
  orderUpdates: boolean;
  promotions: boolean;
  newMenu: boolean;
}

interface SettingsState {
  notifications: NotificationSettings;
  toggleNotification: (key: keyof NotificationSettings) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      notifications: {
        orderUpdates: true,
        promotions: true,
        newMenu: false,
      },
      toggleNotification: (key) =>
        set((state) => ({
          notifications: {
            ...state.notifications,
            [key]: !state.notifications[key],
          },
        })),
    }),
    {
      name: 'settings-store',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
