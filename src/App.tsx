import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Sparkles, ChefHat, Search, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { menuData, MenuItem } from './data/menu';
import { useCartStore } from './stores/useCartStore';
import { useAuthStore } from './stores/useAuthStore';

import { FoodCard } from './components/FoodCard';
import { ChefPickCard } from './components/ChefPickCard';
import { FoodDetailModal } from './components/FoodDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { FilterDrawer } from './components/FilterDrawer';
import { ProfileDrawer } from './components/ProfileDrawer';
import { AiConcierge } from './components/AiConcierge';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [dietaryFilter, setDietaryFilter] = useState('All'); // All, Veg, Non-Veg, Vegan
  const [priceFilter, setPriceFilter] = useState('none'); // none, lowToHigh, highToLow

  const { user } = useAuthStore();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const scrollRef = useRef<HTMLDivElement>(null);

  const handleGoHome = () => {
    setSearchQuery('');
    setActiveCategory('All');
    setDietaryFilter('All');
    setPriceFilter('none');
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const { scrollY } = useScroll({ container: scrollRef });
  const headerOpacity = useTransform(scrollY, [0, 50], [0, 1]);
  const headerShadow = useTransform(scrollY, [0, 50], ['0px 0px 0px rgba(0,0,0,0)', '0px 4px 20px rgba(0,0,0,0.05)']);
  const headerBg = useTransform(scrollY, [0, 50], ['rgba(250,250,250,0)', 'rgba(250,250,250,0.8)']);
  const headerBlur = useTransform(scrollY, [0, 50], ['blur(0px)', 'blur(12px)']);

  const categories = ['All', 'Starters', 'Mains', 'Sides', 'Desserts', 'Drinks'];
  
  // Example featuring logic
  const featuredItems = menuData.filter(item => item.id === 'wagyu_burger' || item.id === 'wild_mushroom_risotto');

  const filteredMenu = menuData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    
    let matchesDietary = true;
    if (dietaryFilter === 'Veg') {
      matchesDietary = item.dietary?.some(d => d.toLowerCase() === 'vegetarian' || d.toLowerCase() === 'vegan') || false;
    } else if (dietaryFilter === 'Vegan') {
      matchesDietary = item.dietary?.some(d => d.toLowerCase() === 'vegan') || false;
    } else if (dietaryFilter === 'Non-Veg') {
      matchesDietary = !(item.dietary?.some(d => d.toLowerCase() === 'vegetarian' || d.toLowerCase() === 'vegan'));
    }

    return matchesSearch && matchesCategory && matchesDietary;
  }).sort((a, b) => {
    if (priceFilter === 'lowToHigh') return a.price - b.price;
    if (priceFilter === 'highToLow') return b.price - a.price;
    return 0;
  });

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Splash Screen */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            className="fixed inset-0 z-[100] bg-[#1A1A1A] flex items-center justify-center text-[#FAFAFA]"
            exit={{ opacity: 0, filter: 'blur(10px)', scale: 1.05 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                <ChefHat size={56} className="mb-6 text-[#C1A87D] drop-shadow-2xl" strokeWidth={1} />
              </motion.div>
              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-5xl tracking-[0.2em] uppercase font-serif font-light"
              >
                The Bistro
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 1 }}
                className="mt-6 text-xs tracking-[0.3em] text-opacity-50 uppercase text-[#C1A87D] font-medium"
              >
                Intelligent Dining
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative h-screen w-full bg-[#E5E5E5] text-bistro-charcoal font-sans flex justify-center">
        {/* Mobile container constraint for desktop viewing */}
        <div className="w-full max-w-[430px] h-full bg-bistro-ivory relative overflow-hidden shadow-2xl flex flex-col mx-auto">
        
        {/* Dynamic Header */}
        <motion.header 
          style={{ 
            backgroundColor: headerBg,
            boxShadow: headerShadow,
            backdropFilter: headerBlur
          }}
          className="fixed top-0 max-w-[430px] w-full px-6 py-4 flex justify-between items-center z-30 transition-colors"
        >
          <button onClick={handleGoHome} className="flex items-center space-x-2 text-left">
            <ChefHat size={28} className="text-bistro-charcoal" strokeWidth={1.5} />
            <motion.h1 style={{ opacity: headerOpacity }} className="font-serif text-2xl text-bistro-charcoal">The Bistro</motion.h1>
          </button>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setIsProfileOpen(true)}
              className="relative p-2.5 bg-white/50 backdrop-blur-md rounded-full shadow-sm border border-bistro-gray-light hover:bg-white transition-colors flex items-center justify-center mr-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-bistro-charcoal"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </button>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 bg-white/50 backdrop-blur-md rounded-full shadow-sm border border-bistro-gray-light hover:bg-white transition-colors"
            >
              <ShoppingBag size={22} className="text-bistro-charcoal" strokeWidth={1.5} />
              <CartBadge />
            </button>
          </div>
        </motion.header>

        {/* Main Content Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto pb-32 scroll-smooth">
          
          {/* Hero Section */}
          <div className="pt-28 px-6 pb-2">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <h2 className="font-serif text-[44px] leading-[1.05] tracking-tight text-bistro-charcoal mb-2">
                {getGreeting()}, <br/>
                <span className="text-bistro-gray/80 font-light">{user?.name ? user.name.split(' ')[0] : 'Guest'} ✨</span>
              </h2>
              <p className="text-bistro-gray font-light mt-3 text-[17px]">What are you craving tonight?</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-8 mb-8 relative flex items-center bg-white border border-bistro-gray-light/60 rounded-2xl pr-2 focus-within:border-bistro-charcoal focus-within:ring-4 focus-within:ring-bistro-gray-light/50 transition-all shadow-premium-soft"
            >
              <Search size={20} className="text-bistro-gray-light absolute left-4" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search the menu..." 
                className="bg-transparent border-none outline-none w-full py-4 pl-12 pr-4 text-[15px] font-medium placeholder:text-gray-400 placeholder:font-light"
              />
              <button 
                onClick={() => setIsFilterOpen(true)}
                className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-bistro-gray hover:text-bistro-charcoal transition-colors relative"
              >
                <SlidersHorizontal size={18} />
                {(dietaryFilter !== 'All' || priceFilter !== 'none') && (
                  <span className="absolute top-2 right-2.5 w-2 h-2 bg-bistro-gold rounded-full" />
                )}
              </button>
            </motion.div>
          </div>

          {/* Featured Horizontal Scroll */}
          {!searchQuery && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-10"
            >
              <div className="flex px-6 items-center justify-between mb-4">
                <h3 className="font-serif text-[22px] text-bistro-charcoal">Chef's Picks</h3>
              </div>
              <div className="flex overflow-x-auto pb-4 scrollbar-hide px-4">
                {featuredItems.map(item => (
                  <ChefPickCard key={item.id} item={item} onClick={setSelectedItem} />
                ))}
              </div>
            </motion.div>
          )}

          {/* Category Tabs */}
          <div className="px-6 mb-6">
            <h3 className="font-serif text-[22px] text-bistro-charcoal mb-4">Menu</h3>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`whitespace-nowrap px-6 py-2.5 rounded-full text-[14px] transition-all duration-300 font-medium tracking-wide border ${
                    activeCategory === cat 
                      ? 'bg-bistro-charcoal text-white border-bistro-charcoal shadow-md' 
                      : 'bg-white text-bistro-gray border-bistro-gray-light hover:border-gray-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Grid */}
          <div className="px-6 space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredMenu.map((item, i) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <FoodCard item={item} onClick={setSelectedItem} />
                </motion.div>
              ))}
              {filteredMenu.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="py-12 text-center text-gray-400 font-light"
                >
                  No items found matching your craving.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Floating AI Button (Orb) */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, type: "spring", stiffness: 200, damping: 20 }}
          className="absolute bottom-8 right-6 z-20"
        >
          <motion.button
            onClick={() => setIsAiOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative w-16 h-16 bg-gradient-to-tr from-[#111] to-[#333] text-white rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.4)] flex items-center justify-center"
          >
            {/* Glowing orbital layers */}
            <div className="absolute inset-0 rounded-full bg-[#C1A87D] opacity-30 animate-ping" style={{ animationDuration: '3s' }} />
            <div className="absolute inset-[-4px] rounded-full border border-[#C1A87D]/30" />
            
            <Sparkles size={24} className="text-[#C1A87D] relative z-10" />
          </motion.button>
        </motion.div>

        {/* Modals & Drawers */}
        <FoodDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
        
        <AnimatePresence>
          {isCartOpen && <CartDrawer onClose={() => setIsCartOpen(false)} />}
        </AnimatePresence>

        <AnimatePresence>
          {isFilterOpen && (
            <FilterDrawer 
              onClose={() => setIsFilterOpen(false)} 
              dietaryFilter={dietaryFilter}
              setDietaryFilter={setDietaryFilter}
              priceFilter={priceFilter}
              setPriceFilter={setPriceFilter}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isProfileOpen && <ProfileDrawer onClose={() => setIsProfileOpen(false)} />}
        </AnimatePresence>

        <AnimatePresence>
          {isAiOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAiOpen(false)}
                className="absolute inset-0 bg-black/40 z-30 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute inset-x-0 bottom-0 h-[85%] bg-white rounded-t-[32px] shadow-2xl z-40 flex flex-col overflow-hidden"
              >
                <AiConcierge onClose={() => setIsAiOpen(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
    </>
  );
}

// Badge Component
function CartBadge() {
  const totalItems = useCartStore(state => state.getTotalItems());
  if (totalItems === 0) return null;
  return (
    <motion.div 
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="absolute -top-1 -right-1 bg-[#C1A87D] text-[#1A1A1A] text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm"
    >
      {totalItems}
    </motion.div>
  );
}

export default App;
