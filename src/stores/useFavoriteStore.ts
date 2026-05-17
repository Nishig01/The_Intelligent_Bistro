import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoriteState {
  favorites: string[]; // item ids
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set, get) => ({
      favorites: [],
      toggleFavorite: (id) => set((state) => ({
        favorites: state.favorites.includes(id) 
          ? state.favorites.filter(fid => fid !== id)
          : [...state.favorites, id]
      })),
      isFavorite: (id) => get().favorites.includes(id),
    }),
    { name: 'bistro-favorites-storage' }
  )
);
