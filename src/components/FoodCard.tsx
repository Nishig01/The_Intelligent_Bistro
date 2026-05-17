import React from 'react';
import { useCartStore } from '../stores/useCartStore';
import { useFavoriteStore } from '../stores/useFavoriteStore';
import { MenuItem } from '../data/menu';
import { Plus, Heart } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
import { FoodImage } from './ui/FoodImage';

interface FoodCardProps {
  item: MenuItem;
  onClick: (item: MenuItem) => void;
}

export function FoodCard({ item, onClick }: FoodCardProps) {
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

  const getDietaryIconContext = (diet: string) => {
    const lower = diet.toLowerCase();
    if (lower.includes('vegan')) return { bg: 'bg-green-100/50', text: 'text-green-700', border: 'border-green-200' };
    if (lower.includes('vegetarian')) return { bg: 'bg-emerald-100/50', text: 'text-emerald-700', border: 'border-emerald-200' };
    if (lower.includes('protein')) return { bg: 'bg-red-100/50', text: 'text-red-700', border: 'border-red-200' };
    if (lower.includes('gluten-free')) return { bg: 'bg-amber-100/50', text: 'text-amber-700', border: 'border-amber-200' };
    return { bg: 'bg-[#FAFAFA]', text: 'text-gray-500', border: 'border-gray-100' };
  };

  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(item)}
      className="group bg-white rounded-3xl p-4 flex gap-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_30px_rgb(0,0,0,0.08)] transition-all cursor-pointer border border-gray-50/50"
    >
      <div className="flex-1 py-1">
        <h3 className="font-serif text-[20px] leading-tight text-[#111] mb-1.5">{item.name}</h3>
        <p className="text-gray-500 text-[13px] leading-relaxed line-clamp-2 font-light mb-3">{item.description}</p>
        
        <div className="flex gap-1.5 mb-3 flex-wrap">
          {item.calories ? (
            <span className="text-[10px] uppercase font-medium tracking-wider bg-gray-50 border border-gray-100 text-gray-400 px-2.5 py-1 rounded-full">
              {item.calories} Cal
            </span>
          ) : null}
          {item.dietary?.map(diet => {
             const style = getDietaryIconContext(diet);
             return (
               <span key={diet} className={`text-[10px] uppercase font-medium tracking-wide ${style.bg} ${style.border} border ${style.text} px-2.5 py-1 rounded-full`}>
                 {diet}
               </span>
             );
          })}
        </div>

        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="font-medium text-[16px] text-[#111]">${item.price.toFixed(2)}</span>
          <button 
            onClick={handleAdd}
            className="w-9 h-9 rounded-full bg-[#FAFAFA] flex items-center justify-center border border-gray-100 hover:bg-[#1A1A1A] hover:text-white hover:border-[#1A1A1A] transition-colors group-hover:bg-[#1A1A1A] text-gray-400 group-hover:text-white shadow-sm"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
      <div className="w-[124px] h-[124px] rounded-2xl overflow-hidden flex-shrink-0 relative shadow-sm bg-gray-100">
        <FoodImage 
          src={item.imageUrl} 
          alt={item.name} 
          className="group-hover:scale-110 transition-transform duration-700" 
          containerClassName="w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <button 
          onClick={handleFavorite}
          className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-all ${
            favorited ? 'bg-white/90 text-red-500 shadow-sm' : 'bg-black/20 text-white hover:bg-black/40'
          }`}
        >
          <Heart size={14} fill={favorited ? 'currentColor' : 'none'} />
        </button>
      </div>
    </motion.div>
  );
}
