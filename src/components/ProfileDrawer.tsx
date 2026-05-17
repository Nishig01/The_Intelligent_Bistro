import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User as UserIcon, LogOut, Receipt, Heart, Settings, ChevronRight, Loader2, ChevronLeft, MapPin, Package, Clock, Bell, Plus, Minus } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { useOrderStore } from '../stores/useOrderStore';
import { useFavoriteStore } from '../stores/useFavoriteStore';
import { useSettingsStore, Address } from '../stores/useSettingsStore';
import { useCartStore } from '../stores/useCartStore';
import { menuData } from '../data/menu';
import { FoodImage } from './ui/FoodImage';

type ProfileView = 'main' | 'orders' | 'favorites' | 'settings';

interface ProfileDrawerProps {
  onClose: () => void;
}

export function ProfileDrawer({ onClose }: ProfileDrawerProps) {
  const { user, isAuthenticated, login, logout } = useAuthStore();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [currentView, setCurrentView] = useState<ProfileView>('main');

  const { orders } = useOrderStore();
  const { favorites, toggleFavorite } = useFavoriteStore();
  const { addresses, addAddress, updateAddress, removeAddress, notifications, toggleNotification } = useSettingsStore();
  const { items, addItem, removeItem } = useCartStore();

  const [editingAddress, setEditingAddress] = useState<Address | Partial<Address> | null>(null);
  const [now, setNow] = useState(Date.now());

  // We set up a listener for the OAuth success message from the popup
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_SUCCESS') {
        login({
          name: event.data.user?.name || 'Valued Guest',
          email: event.data.user?.email || 'guest@example.com',
          avatar: event.data.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200',
          token: event.data.token || 'mock_token'
        });
        setIsAuthenticating(false);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [login]);

  const handleGoogleLogin = async () => {
    setIsAuthenticating(true);
    try {
      const redirectUri = `${window.location.origin}/auth/google/callback`;
      const response = await fetch(`/api/auth/google/url?redirectUri=${encodeURIComponent(redirectUri)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch auth url');
      }
      
      const { url } = await response.json();
      
      const popup = window.open(url, 'oauth_popup', 'width=500,height=600');
      if (!popup) {
        alert('Please allow popups to sign in with Google.');
        setIsAuthenticating(false);
      }
      
      // Safety timeout in case popup is closed manually without message
      const checkPopup = setInterval(() => {
        if (popup && popup.closed) {
          clearInterval(checkPopup);
          setIsAuthenticating(false);
        }
      }, 1000);
      
    } catch (err) {
      console.error(err);
      // Fallback for demonstration if API isn't configured yet
      setTimeout(() => {
        login({
          name: 'Nishigandha',
          email: 'nishimali1111@gmail.com',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200',
          token: 'mock_token'
        });
        setIsAuthenticating(false);
      }, 2000);
    }
  };

  // Update 'now' every second to recalculate order times
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (currentView === 'orders') {
      interval = setInterval(() => setNow(Date.now()), 1000);
    }
    return () => clearInterval(interval);
  }, [currentView]);

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
        className="absolute bottom-0 inset-x-0 h-[85%] bg-[#FAFAFA] shadow-[0_-10px_40px_rgba(0,0,0,0.2)] z-50 flex flex-col rounded-t-[32px] overflow-hidden"
      >
        <div className="flex justify-center pt-3 pb-1 bg-white shrink-0">
          <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
        </div>
        <div className="flex justify-between items-center px-6 pb-4 pt-2 border-b border-gray-100 bg-white shadow-sm shrink-0">
          {currentView !== 'main' ? (
            <button onClick={() => setCurrentView('main')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
              <ChevronLeft size={22} className="text-[#1A1A1A]"/>
            </button>
          ) : (
            <h2 className="font-serif text-2xl text-bistro-charcoal">
              {isAuthenticated ? 'Profile' : 'Sign In'}
            </h2>
          )}
          
          {currentView !== 'main' && (
            <h2 className="font-serif text-2xl text-bistro-charcoal mr-auto ml-2">
              {currentView === 'orders' ? 'My Orders' : currentView === 'favorites' ? 'Favorites' : 'Settings'}
            </h2>
          )}

          <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors">
            <X size={20} className="text-[#1A1A1A]"/>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {currentView === 'main' && (
              <motion.div
                key="main"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full"
              >
                {!isAuthenticated ? (
            <div className="p-8 h-full flex flex-col justify-center relative">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[100px] -right-[100px] w-64 h-64 bg-bistro-gold/10 rounded-full blur-3xl opacity-50" />
                <div className="absolute -bottom-[50px] -left-[50px] w-48 h-48 bg-gray-300/30 rounded-full blur-3xl opacity-50" />
              </div>
              
              <div className="relative z-10 bg-white/70 backdrop-blur-xl border border-white p-8 rounded-[32px] shadow-premium-soft flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-bistro-ivory rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100">
                  <UserIcon size={32} className="text-bistro-gold" />
                </div>
                
                <h3 className="font-serif text-[28px] text-bistro-charcoal leading-tight mb-3">
                  Welcome to <br />The Bistro
                </h3>
                
                <p className="text-bistro-gray font-light text-[15px] mb-10 px-2 line-clamp-3">
                  Sign in to save your favorite dishes, track orders, and experience personalized dining.
                </p>

                <button 
                  onClick={handleGoogleLogin}
                  disabled={isAuthenticating}
                  className="w-full relative overflow-hidden bg-white border border-gray-200 text-bistro-charcoal py-4 rounded-full font-medium shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3 disabled:opacity-80 disabled:cursor-wait group"
                >
                  {isAuthenticating ? (
                    <>
                      <Loader2 size={18} className="animate-spin text-bistro-gray" />
                      <span className="text-gray-500">Connecting securely...</span>
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" className="w-5 h-5 absolute left-6 transition-transform group-hover:scale-110">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      <span className="pl-6">Continue with Google</span>
                    </>
                  )}
                </button>
                
                <p className="text-[11px] text-gray-400 mt-6 mt-auto">
                  By continuing, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6">
              {/* Profile Card */}
              <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex items-center gap-4 mb-8">
                <img 
                  src={user?.avatar} 
                  alt={user?.name} 
                  className="w-16 h-16 rounded-full object-cover shadow-sm"
                />
                <div className="flex-1">
                  <h3 className="font-serif text-xl text-bistro-charcoal leading-tight">{user?.name}</h3>
                  <p className="text-[13px] text-bistro-gray font-light mt-1">{user?.email}</p>
                </div>
              </div>

              {/* Menu Options */}
              <div className="space-y-2">
                {[
                  { icon: Receipt, label: 'My Orders', id: 'orders' },
                  { icon: Heart, label: 'Favorites', id: 'favorites' },
                  { icon: Settings, label: 'Settings', id: 'settings' }
                ].map((item) => (
                  <button 
                    key={item.id} 
                    onClick={() => setCurrentView(item.id as ProfileView)}
                    className="w-full flex items-center p-4 bg-white rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group"
                  >
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-bistro-gray group-hover:text-bistro-charcoal group-hover:bg-white transition-colors">
                      <item.icon size={18} />
                    </div>
                    <span className="ml-4 font-medium text-[15px] text-bistro-charcoal">{item.label}</span>
                    <ChevronRight size={18} className="ml-auto text-gray-300 group-hover:text-bistro-gold transition-colors" />
                  </button>
                ))}
              </div>

              <button 
                onClick={logout}
                className="w-full mt-8 p-4 flex items-center justify-center gap-2 text-red-500 font-medium hover:bg-red-50 rounded-2xl transition-colors"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          )}
              </motion.div>
            )}

            {currentView === 'orders' && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-6 space-y-8"
              >
                {orders.length === 0 ? (
                  <div className="text-center text-gray-400 py-10">
                    <Receipt size={48} className="mx-auto mb-4 opacity-30 stroke-1" />
                    <p className="font-serif text-xl text-[#1A1A1A]">No orders yet</p>
                    <p className="text-sm font-light mt-1">When you place an order, it will appear here.</p>
                  </div>
                ) : (
                  (() => {
                    const limit = 3 * 60 * 1000;
                    const activeOrders = orders.filter(o => (now - new Date(o.date).getTime()) < limit);
                    const pastOrders = orders.filter(o => (now - new Date(o.date).getTime()) >= limit);

                    return (
                      <>
                        {activeOrders.length > 0 && (
                          <div className="space-y-4">
                            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Active Orders</h3>
                            {activeOrders.map(order => {
                              const elapsed = Math.max(0, now - new Date(order.date).getTime());
                              const timeLeft = Math.max(0, limit - elapsed);
                              const minutesLeft = Math.floor(timeLeft / 60000);
                              const secondsLeft = Math.floor((timeLeft % 60000) / 1000);

                              return (
                                <div key={order.id} className="bg-white rounded-2xl p-5 border border-[#1A1A1A]/10 shadow-sm relative overflow-hidden">
                                  <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100">
                                    <div 
                                      className="h-full bg-[#1A1A1A] transition-all duration-1000 ease-linear" 
                                      style={{ width: `${(elapsed / limit) * 100}%` }}
                                    />
                                  </div>
                                  <div className="flex justify-between items-start mb-4 mt-1">
                                    <div>
                                      <p className="text-sm font-medium text-[#1A1A1A]">Order {order.id}</p>
                                      <p className="text-[12px] text-gray-400 mt-0.5">{new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                    </div>
                                    <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#1A1A1A] text-white whitespace-nowrap">
                                      Preparing ({minutesLeft}m {secondsLeft.toString().padStart(2, '0')}s)
                                    </span>
                                  </div>
                                  
                                  <div className="space-y-3 mb-4">
                                    {order.items.map(item => (
                                      <div key={item.id} className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                                          <FoodImage src={item.imageUrl} alt={item.name} containerClassName="w-full h-full" />
                                        </div>
                                        <div className="flex-1">
                                          <p className="text-[13px] font-medium text-[#1A1A1A]">{item.name}</p>
                                          <p className="text-[12px] text-gray-400">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="text-[13px] font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-500">Total</span>
                                    <span className="font-serif text-lg text-[#1A1A1A]">${order.total.toFixed(2)}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {pastOrders.length > 0 && (
                          <div className="space-y-4">
                            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Past Orders</h3>
                            {pastOrders.map(order => (
                              <div key={order.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm opacity-75">
                                <div className="flex justify-between items-start mb-4">
                                  <div>
                                    <p className="text-sm font-medium text-[#1A1A1A]">Order {order.id}</p>
                                    <p className="text-[12px] text-gray-400 mt-0.5">{new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                  </div>
                                  <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 whitespace-nowrap">
                                    Delivered
                                  </span>
                                </div>
                                
                                <div className="space-y-3 mb-4">
                                  {order.items.map(item => (
                                    <div key={item.id} className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                                        <FoodImage src={item.imageUrl} alt={item.name} containerClassName="w-full h-full grayscale" />
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-[13px] font-medium text-[#1A1A1A]">{item.name}</p>
                                        <p className="text-[12px] text-gray-400">Qty: {item.quantity}</p>
                                      </div>
                                      <p className="text-[13px] font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                  ))}
                                </div>
                                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                  <span className="text-sm font-medium text-gray-500">Total</span>
                                  <span className="font-serif text-lg text-[#1A1A1A]">${order.total.toFixed(2)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    );
                  })()
                )}
              </motion.div>
            )}

            {currentView === 'favorites' && (
              <motion.div
                key="favorites"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-6 space-y-4"
              >
                {favorites.length === 0 ? (
                  <div className="text-center text-gray-400 py-10">
                    <Heart size={48} className="mx-auto mb-4 opacity-30 stroke-1" />
                    <p className="font-serif text-xl border-none text-[#1A1A1A]">No favorites yet</p>
                    <p className="text-sm font-light mt-1">Tap the heart icon on items you love.</p>
                  </div>
                ) : (
                  menuData.filter(item => favorites.includes(item.id)).map(item => {
                    const cartItemCount = items.filter(i => i.id === item.id).reduce((sum, i) => sum + i.quantity, 0);
                    return (
                    <div key={item.id} className="flex gap-4 items-center bg-white p-3 rounded-2xl border border-gray-100 shadow-sm relative group pr-4">
                      <button 
                        onClick={() => toggleFavorite(item.id)}
                        className="absolute right-3 top-3 p-1.5 bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove from favorites"
                      >
                        <Heart size={14} fill="currentColor" />
                      </button>
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative">
                        <FoodImage src={item.imageUrl} alt={item.name} containerClassName="w-full h-full" />
                      </div>
                      <div className="flex-1 pr-4">
                        <h4 className="font-medium text-[15px] text-[#1A1A1A] leading-tight mb-1">{item.name}</h4>
                        <span className="font-serif text-lg text-[#1A1A1A]">${item.price.toFixed(2)}</span>
                      </div>
                      <button 
                        onClick={() => cartItemCount > 0 ? removeItem(item.id) : addItem(item, 1, [])}
                        className={`p-3 rounded-xl transition-colors ${cartItemCount > 0 ? 'bg-[#C1A87D] text-white shadow-sm hover:opacity-90' : 'bg-gray-50 text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white'}`}
                        title={cartItemCount > 0 ? "Remove from cart" : "Add to cart"}
                      >
                        {cartItemCount > 0 ? <Minus size={18} /> : <Plus size={18} />}
                      </button>
                    </div>
                  )})
                )}
              </motion.div>
            )}

            {currentView === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-6 space-y-6"
              >
                {editingAddress ? (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
                      {editingAddress.id ? 'Edit Address' : 'New Address'}
                    </h3>
                    <div>
                      <label className="text-[13px] font-medium text-gray-700 block mb-1.5">Name (e.g. Home, Work)</label>
                      <input 
                        type="text" 
                        value={editingAddress.name || ''}
                        onChange={e => setEditingAddress({ ...editingAddress, name: e.target.value })}
                        className="w-full p-3 rounded-xl border border-gray-200 bg-white text-[15px] outline-none focus:border-gray-400 placeholder:text-gray-400"
                      />
                    </div>
                    <div>
                      <label className="text-[13px] font-medium text-gray-700 block mb-1.5">Street Address</label>
                      <input 
                        type="text" 
                        value={editingAddress.street || ''}
                        onChange={e => setEditingAddress({ ...editingAddress, street: e.target.value })}
                        className="w-full p-3 rounded-xl border border-gray-200 bg-white text-[15px] outline-none focus:border-gray-400 placeholder:text-gray-400"
                      />
                    </div>
                    <div>
                      <label className="text-[13px] font-medium text-gray-700 block mb-1.5">City & Zip</label>
                      <input 
                        type="text" 
                        value={editingAddress.city || ''}
                        onChange={e => setEditingAddress({ ...editingAddress, city: e.target.value })}
                        className="w-full p-3 rounded-xl border border-gray-200 bg-white text-[15px] outline-none focus:border-gray-400 placeholder:text-gray-400"
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button 
                        onClick={() => setEditingAddress(null)}
                        className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => {
                          if (editingAddress.id) {
                            updateAddress(editingAddress.id, editingAddress as any);
                          } else {
                            addAddress(editingAddress as any);
                          }
                          setEditingAddress(null);
                        }}
                        disabled={!editingAddress.name || !editingAddress.street || !editingAddress.city}
                        className="flex-1 bg-[#1A1A1A] text-white py-3 rounded-xl font-medium hover:bg-black transition-colors disabled:opacity-50"
                      >
                        Save
                      </button>
                    </div>
                    {editingAddress.id && (
                      <button 
                        onClick={() => {
                          removeAddress(editingAddress.id as string);
                          setEditingAddress(null);
                        }}
                        className="w-full py-3 mt-2 text-red-500 font-medium hover:bg-red-50 rounded-xl transition-colors"
                      >
                        Delete Address
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Delivery Addresses</h3>
                      <div className="space-y-3">
                        {addresses.map((addr) => (
                          <div key={addr.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group">
                            <div className="flex items-start gap-4">
                              <MapPin size={24} className="text-[#1A1A1A] shrink-0 mt-1" />
                              <div>
                                <p className="font-medium text-[15px] text-[#1A1A1A]">{addr.name}</p>
                                <p className="text-[13px] text-gray-500 mt-0.5">{addr.street}<br/>{addr.city}</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => setEditingAddress(addr)}
                              className="text-[13px] font-medium text-gray-400 hover:text-[#1A1A1A] opacity-0 group-hover:opacity-100 transition-all px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100"
                            >
                              Edit
                            </button>
                          </div>
                        ))}
                        <button 
                          onClick={() => setEditingAddress({})}
                          className="w-full py-4 rounded-2xl border border-dashed border-gray-300 text-[14px] font-medium text-gray-500 hover:text-black hover:border-black transition-colors"
                        >
                          + Add New Address
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Notifications</h3>
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
                        <div className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Bell size={20} className="text-gray-400" />
                            <span className="font-medium text-[15px] text-[#1A1A1A]">Order Updates</span>
                          </div>
                          <div 
                            onClick={() => toggleNotification('orderUpdates')}
                            className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${notifications.orderUpdates ? 'bg-[#1A1A1A]' : 'bg-gray-200'}`}
                          >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${notifications.orderUpdates ? 'left-6' : 'left-1'}`}></div>
                          </div>
                        </div>
                        <div className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Package size={20} className="text-gray-400" />
                            <span className="font-medium text-[15px] text-[#1A1A1A]">Promotions</span>
                          </div>
                          <div 
                            onClick={() => toggleNotification('promotions')}
                            className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${notifications.promotions ? 'bg-[#1A1A1A]' : 'bg-gray-200'}`}
                          >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${notifications.promotions ? 'left-6' : 'left-1'}`}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
}
