import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '../lib/mmkv';

interface FavoritesState {
  favoriteIds: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteIds: [],
      toggleFavorite: (id) => {
        const current = get().favoriteIds;
        if (current.includes(id)) {
          set({ favoriteIds: current.filter(fid => fid !== id) });
        } else {
          set({ favoriteIds: [...current, id] });
        }
      },
      isFavorite: (id) => get().favoriteIds.includes(id)
    }),
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
