import React from 'react';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { Button } from './ui/Button';

interface FilterDrawerProps {
  onClose: () => void;
  dietaryFilter: string;
  setDietaryFilter: (val: string) => void;
  priceFilter: string;
  setPriceFilter: (val: string) => void;
}

export function FilterDrawer({ onClose, dietaryFilter, setDietaryFilter, priceFilter, setPriceFilter }: FilterDrawerProps) {
  const dietaryOptions = ['All', 'Veg', 'Non-Veg', 'Vegan'];
  const priceOptions = [
    { label: 'Recommended', value: 'none' },
    { label: 'Price: Low to High', value: 'lowToHigh' },
    { label: 'Price: High to Low', value: 'highToLow' }
  ];

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm z-40"
      />
      
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute inset-x-0 bottom-0 bg-white shadow-[0_-20px_40px_rgba(0,0,0,0.1)] z-50 rounded-t-[32px] flex flex-col"
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="font-serif text-2xl text-bistro-charcoal">Filter Menu</h2>
          <button onClick={onClose} className="p-2 rounded-full bg-gray-50 hover:bg-gray-100 text-bistro-gray transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto max-h-[60vh]">
          {/* Dietary Filter */}
          <div>
            <h3 className="text-[13px] uppercase tracking-wider font-semibold text-bistro-gray mb-4">Dietary Preference</h3>
            <div className="flex flex-wrap gap-3">
              {dietaryOptions.map(option => (
                <button
                  key={option}
                  onClick={() => setDietaryFilter(option)}
                  className={`px-5 py-2.5 rounded-full text-[14px] font-medium tracking-wide transition-all ${
                    dietaryFilter === option 
                      ? 'bg-bistro-charcoal text-white shadow-md' 
                      : 'bg-gray-50 text-bistro-gray border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div>
            <h3 className="text-[13px] uppercase tracking-wider font-semibold text-bistro-gray mb-4">Sort By</h3>
            <div className="space-y-3">
              {priceOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setPriceFilter(option.value)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    priceFilter === option.value
                      ? 'bg-bistro-ivory border-bistro-gold text-bistro-charcoal'
                      : 'bg-white border-gray-100 text-bistro-gray hover:border-gray-200'
                  }`}
                >
                  <span className="font-medium text-[15px]">{option.label}</span>
                  {priceFilter === option.value && <Check size={18} className="text-bistro-gold" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 shrink-0 bg-white pb-8">
          <Button onClick={onClose} className="w-full">
            Show Results
          </Button>
        </div>
      </motion.div>
    </>
  );
}
