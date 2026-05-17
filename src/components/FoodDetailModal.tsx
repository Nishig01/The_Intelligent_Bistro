import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, Check, Minus, Plus } from 'lucide-react';
import { MenuItem } from '../data/menu';
import { useCartStore } from '../stores/useCartStore';
import { FoodImage } from './ui/FoodImage';

interface FoodDetailModalProps {
  item: MenuItem | null;
  onClose: () => void;
}

export function FoodDetailModal({ item, onClose }: FoodDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const addItem = useCartStore(state => state.addItem);

  // Reset state when a new item opens
  React.useEffect(() => {
    if (item) {
      setQuantity(1);
      setSelectedOptions([]);
    }
  }, [item]);

  if (!item) return null;

  const handleToggleOption = (opt: string) => {
    setSelectedOptions(prev => 
      prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]
    );
  };

  const handleAddToCart = () => {
    addItem(item, quantity, selectedOptions);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div 
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-40 bg-black/40 backdrop-blur-sm shadow-2xl overflow-hidden"
        onClick={onClose}
      />
      
      <motion.div
        key="modal"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute inset-x-0 bottom-0 top-[10%] bg-white rounded-t-[32px] z-50 flex flex-col overflow-hidden shadow-2xl"
      >
        <div className="relative h-64 flex-shrink-0 bg-gray-100">
          <FoodImage src={item.imageUrl} alt={item.name} containerClassName="w-full h-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-white p-6 pb-32">
          <div className="flex justify-between items-start mb-2">
            <h2 className="font-serif text-3xl text-[#111]">{item.name}</h2>
            <span className="font-serif text-2xl text-[#C1A87D]">${item.price.toFixed(2)}</span>
          </div>
          
          <p className="text-gray-500 font-light leading-relaxed mb-6">
            {item.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-8">
            {item.calories ? (
              <span className="text-[11px] uppercase tracking-wider font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                {item.calories} Cal
              </span>
            ) : null}
            {item.dietary?.map(diet => (
              <span key={diet} className="text-[11px] uppercase tracking-wider font-medium text-[#C1A87D] bg-[#FDFBF7] border border-[#F5EEDF] px-3 py-1 rounded-full">
                {diet}
              </span>
            ))}
          </div>

          {item.options && item.options.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-medium uppercase tracking-widest text-[#111] mb-4">Customize</h3>
              <div className="space-y-3">
                {item.options.map(opt => {
                  const isSelected = selectedOptions.includes(opt);
                  return (
                    <button
                      key={opt}
                      onClick={() => handleToggleOption(opt)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        isSelected 
                          ? 'border-[#1A1A1A] bg-[#FAFAFA]' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className={`text-[15px] font-light ${isSelected ? 'text-[#1A1A1A] font-medium' : 'text-gray-600'}`}>{opt}</span>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                        isSelected ? 'bg-[#1A1A1A] border-[#1A1A1A]' : 'border-gray-300'
                      }`}>
                        {isSelected && <Check size={12} className="text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="absolute bottom-0 inset-x-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 p-6 flex items-center gap-4 pt-4 pb-8">
          <div className="flex items-center gap-4 bg-[#FAFAFA] rounded-full p-2 border border-gray-100">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm text-gray-500 hover:text-[#111] transition-colors"
            >
              <Minus size={18} />
            </button>
            <span className="w-4 text-center font-medium">{quantity}</span>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm text-gray-500 hover:text-[#111] transition-colors"
            >
              <Plus size={18} />
            </button>
          </div>
          
          <button 
            onClick={handleAddToCart}
            className="flex-1 bg-[#1A1A1A] text-white h-14 rounded-full font-medium tracking-wide flex items-center justify-between px-6 shadow-xl shadow-black/10 hover:bg-black transition-colors"
          >
            <span>Add to Order</span>
            <span>${(item.price * quantity).toFixed(2)}</span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
