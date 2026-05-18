import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
    { name: 'settings-store' }
  )
);
