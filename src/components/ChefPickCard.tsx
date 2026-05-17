import React from 'react';
import { motion } from 'framer-motion';
import { MenuItem } from '../data/menu';
import { FoodImage } from './ui/FoodImage';
import { Plus, Heart } from 'lucide-react';
import { useCartStore } from '../stores/useCartStore';
import { useFavoriteStore } from '../stores/useFavoriteStore';

interface ChefPickCardProps {
  key?: string | number;
  item: MenuItem;
  onClick: (item: MenuItem) => void;
}

export function ChefPickCard({ item, onClick }: ChefPickCardProps) {
  const addItem = useCartStore(state => state.addItem);
  const { toggleFavorite, isFavorite } = useFavoriteStore();
  const favorited = isFavorite(item.id);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(item, 1);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(item.id);
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(item)}
      className="group relative w-[280px] h-[340px] rounded-[32px] overflow-hidden cursor-pointer shadow-premium-soft flex-shrink-0 mx-2 first:ml-6 last:mr-6"
    >
      <FoodImage
        src={item.imageUrl}
        alt={item.name}
        containerClassName="absolute inset-0 w-full h-full bg-black/10"
        className="group-hover:scale-105 transition-transform duration-1000 object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
      
      {/* Top Badges */}
      <div className="absolute top-4 left-4 flex gap-2">
        <span className="bg-black/40 backdrop-blur-md text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-full border border-white/10">
          Chef's Pick
        </span>
      </div>

      <button 
        onClick={handleFavorite}
        className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-md transition-all border border-white/10 ${
          favorited ? 'bg-white/90 text-red-500 shadow-sm' : 'bg-black/40 text-white hover:bg-black/60'
        }`}
      >
        <Heart size={16} fill={favorited ? 'currentColor' : 'none'} />
      </button>

      <div className="absolute bottom-0 inset-x-0 p-6 flex flex-col justify-end">
        <h3 className="font-serif text-white text-2xl leading-tight mb-2 drop-shadow-md">
          {item.name}
        </h3>
        
        <div className="flex items-center justify-between mt-1">
          <span className="text-white/90 font-medium text-[17px] drop-shadow-md">
            ${item.price.toFixed(2)}
          </span>
          <button
            onClick={handleAdd}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white hover:bg-white hover:text-black transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
