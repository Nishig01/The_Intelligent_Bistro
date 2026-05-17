import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { useCartStore } from '../stores/useCartStore';
import { FoodImage } from './ui/FoodImage';
import { CheckoutDrawer } from './CheckoutDrawer';

export function CartDrawer({ onClose }: { onClose: () => void }) {
  const store = useCartStore();
  const items = store.items;
  const [isCheckout, setIsCheckout] = useState(false);
  const [orderState, setOrderState] = useState<'idle' | 'success'>('idle');
  const [orderId, setOrderId] = useState('');

  const handleCheckoutSuccess = (id: string) => {
    setOrderId(id);
    setOrderState('success');
    setIsCheckout(false);
    setTimeout(() => {
      store.clearCart();
      onClose();
    }, 4000);
  };

  return (
    <>
      <motion.div 
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={orderState === 'idle' && !isCheckout ? onClose : undefined}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm z-40"
      />
      <AnimatePresence>
        {isCheckout ? (
          <CheckoutDrawer 
             onClose={onClose} 
             onBack={() => setIsCheckout(false)} 
             onSuccess={handleCheckoutSuccess} 
          />
        ) : (
          <motion.div 
            key="cart"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-y-0 right-0 w-full sm:w-[400px] bg-white shadow-2xl z-50 flex flex-col"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white/80 backdrop-blur-xl shrink-0">
              <h2 className="font-serif text-3xl text-bistro-charcoal">Your Order</h2>
              <button onClick={onClose} disabled={orderState !== 'idle'} className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50">
                <X size={24} className="text-[#1A1A1A]"/>
              </button>
            </div>

            {orderState === 'success' ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col items-center justify-center p-6 text-center"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 15, delay: 0.2 }}
                  className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6"
                >
                  <CheckCircle2 size={48} className="text-green-500" />
                </motion.div>
                <h3 className="font-serif text-3xl text-bistro-charcoal mb-2">Order Confirmed</h3>
                <p className="text-bistro-gray font-light mb-2">Your payment was successful.</p>
                <p className="text-sm font-medium text-[#1A1A1A] bg-gray-50 px-4 py-2 rounded-lg">Order #{orderId}</p>
              </motion.div>
            ) : items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-6">
                <ShoppingBag size={64} className="mb-6 opacity-30 stroke-1" />
                <p className="font-serif text-2xl text-[#1A1A1A]">Your bag is empty.</p>
                <p className="mt-2 text-sm font-light">Explore our menu to find your favorites.</p>
                <button 
                  onClick={onClose}
                  className="mt-8 px-8 py-3 bg-[#1A1A1A] text-white rounded-full font-medium tracking-wide shadow-lg hover:shadow-xl transition-all"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              <div className="flex flex-col h-full overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  <AnimatePresence>
                    {items.map(item => (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, x: -20 }}
                        key={`${item.id}-${item.selectedModifiers.join('-')}`} 
                        className="flex gap-4 items-center bg-white p-3 rounded-2xl border border-gray-100 shadow-sm"
                      >
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative">
                          <FoodImage src={item.imageUrl} alt={item.name} containerClassName="w-full h-full" />
                        </div>
                        <div className="flex-1 pr-2">
                          <h4 className="font-medium text-[15px] text-[#1A1A1A] leading-tight mb-1">{item.name}</h4>
                          <div className="flex items-center justify-between mt-1">
                            <span className="font-serif text-lg text-[#1A1A1A]">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                          {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                            <p className="text-[11px] text-[#C1A87D] mt-1 font-medium bg-[#FAFAFA] inline-block px-2 py-0.5 rounded-sm">
                              {item.selectedModifiers.join(', ')}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-3 mt-3 bg-[#FAFAFA] rounded-full inline-flex px-1.5 py-1 border border-gray-100">
                            <button 
                              onClick={() => store.removeItem(item.id, 1)}
                              disabled={orderState !== 'idle'}
                              className="w-7 h-7 flex items-center justify-center font-medium bg-white rounded-full shadow-sm text-gray-500 hover:text-black transition-colors disabled:opacity-50"
                            ><Minus size={14} /></button>
                            <span className="text-[13px] font-medium w-4 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => store.addItem(item, 1, item.selectedModifiers)}
                              disabled={orderState !== 'idle'}
                              className="w-7 h-7 flex items-center justify-center font-medium bg-white rounded-full shadow-sm text-gray-500 hover:text-black transition-colors disabled:opacity-50"
                            ><Plus size={14} /></button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                
                <div className="bg-white border-t border-gray-100 p-6 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] shrink-0">
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center text-sm text-gray-500 font-light">
                      <span>Subtotal</span>
                      <span>${store.getTotalPrice().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-500 font-light">
                      <span>Taxes & Fees</span>
                      <span>${(store.getTotalPrice() * 0.08).toFixed(2)}</span>
                    </div>
                    <div className="h-px bg-gray-100 w-full my-3" />
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-[#1A1A1A]">Total</span>
                      <span className="font-serif text-3xl text-[#1A1A1A]">${(store.getTotalPrice() * 1.08).toFixed(2)}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsCheckout(true)}
                    disabled={orderState !== 'idle'}
                    className="w-full bg-[#1A1A1A] group text-white py-4 rounded-full font-medium tracking-wide hover:bg-black transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-3 disabled:opacity-80"
                  >
                    Proceed to Checkout
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
