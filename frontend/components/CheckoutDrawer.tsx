import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Apple, ArrowRight, Loader2, CheckCircle2, ShieldCheck, ChevronLeft, MapPin, User, Mail, Phone } from 'lucide-react';
import { useCartStore } from '../stores/useCartStore';
import { useAuthStore } from '../stores/useAuthStore';
import { useOrderStore } from '../stores/useOrderStore';
import { useAddressStore } from '../stores/useAddressStore';
import { getApiUrl } from '../utils/api';

interface CheckoutDrawerProps {
  onClose: () => void;
  onSuccess: (orderId: string) => void;
  onBack: () => void;
}

export function CheckoutDrawer({ onClose, onSuccess, onBack }: CheckoutDrawerProps) {
  const store = useCartStore();
  const { items } = store;
  const { user, isAuthenticated } = useAuthStore();
  const { addresses } = useAddressStore();
  const addOrder = useOrderStore(state => state.addOrder);
  const subtotal = store.getTotalPrice();
  const taxesAndFees = subtotal * 0.08;
  const deliveryFee = 4.99;
  const total = subtotal + taxesAndFees + deliveryFee;

  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [paymentState, setPaymentState] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');
  const [orderId, setOrderId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Details step state
  const [contactName, setContactName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState(addresses.length > 0 ? addresses[0].street : '');
  const [cityZip, setCityZip] = useState(addresses.length > 0 ? addresses[0].city : '');

  const handlePayment = async (method: 'card' | 'apple' | 'google') => {
    setPaymentState('processing');
    setErrorMessage('');
    
    // Simulate payment gateway delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate failure if name contains 'fail'
    if (name.toLowerCase().includes('fail')) {
      setPaymentState('error');
      setErrorMessage('Payment declined by your bank. Please try a different card.');
      return;
    }

    const generatedOrderId = 'ORD-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    setOrderId(generatedOrderId);

    addOrder({
      id: generatedOrderId,
      items: items,
      total: total,
      subtotal: subtotal,
      tax: taxesAndFees,
      deliveryFee: deliveryFee,
      tip: 0,
      date: new Date().toISOString(),
      status: 'preparing',
      address: {
        id: 'guest',
        label: 'Other',
        fullName: contactName || name || 'Guest User',
        street: addressLine1,
        city: cityZip,
        state: '',
        zipCode: '',
        isDefault: true
      },
      paymentMethod: method === 'card' ? 'Visa •••• 4242' : method === 'apple' ? 'Apple Pay' : 'Google Pay',
      eta: '25-30 mins'
    });

    try {
      const apiBase = getApiUrl();

      // Send confirmation email
      await fetch(`${apiBase}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId: generatedOrderId,
          items: items,
          total: total,
          customerName: contactName || name || 'Valued Guest',
          email: email || user?.email
        })
      });
    } catch (e) {
      console.error('Failed to send confirmation email', e);
      // We don't fail the order if the email fails
    }

    setPaymentState('success');
    
    setTimeout(() => {
      onSuccess(generatedOrderId);
    }, 2000);
  };

  if (paymentState === 'success') {
    return (
      <div className="absolute bottom-0 inset-x-0 h-[85%] bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.2)] z-50 flex flex-col items-center justify-center p-6 text-center rounded-t-[32px] overflow-hidden">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 15, delay: 0.1 }}
          className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircle2 size={48} className="text-green-500" />
        </motion.div>
        <motion.h3 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-serif text-3xl text-bistro-charcoal mb-2"
        >
          Payment Successful
        </motion.h3>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-bistro-gray font-light mb-6"
        >
          Your order {orderId} has been confirmed.
        </motion.p>
      </div>
    );
  }

  const isDetailsValid = contactName.trim() !== '' && email.trim() !== '' && addressLine1.trim() !== '' && cityZip.trim() !== '';

  return (
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
        <div className="flex items-center gap-3">
          <button 
            onClick={step === 'payment' ? () => setStep('details') : onBack} 
            disabled={paymentState !== 'idle'} 
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <ChevronLeft size={22} className="text-[#1A1A1A]"/>
          </button>
          <h2 className="font-serif text-2xl text-bistro-charcoal">{step === 'details' ? 'Delivery Details' : 'Payment'}</h2>
        </div>
        <button onClick={onClose} disabled={paymentState !== 'idle'} className="p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 cursor-pointer">
          <X size={20} className="text-[#1A1A1A]"/>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {step === 'details' ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {!isAuthenticated && (
              <div className="bg-blue-50 text-blue-700 p-4 rounded-xl text-[13px] font-medium border border-blue-100">
                You are checking out as a guest. <button className="font-bold underline cursor-pointer" onClick={() => { onClose(); }}>Log in</button> for faster checkout.
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Contact Information</h3>
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="flex items-center p-3 border-b border-gray-100">
                  <User size={18} className="text-gray-400 mr-3" />
                  <input type="text" placeholder="Full Name" value={contactName} onChange={e => setContactName(e.target.value)} className="w-full text-[15px] outline-none placeholder:text-gray-400" />
                </div>
                <div className="flex items-center p-3 border-b border-gray-100">
                  <Mail size={18} className="text-gray-400 mr-3" />
                  <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className="w-full text-[15px] outline-none placeholder:text-gray-400" />
                </div>
                <div className="flex items-center p-3">
                  <Phone size={18} className="text-gray-400 mr-3" />
                  <input type="tel" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} className="w-full text-[15px] outline-none placeholder:text-gray-400" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Delivery Address</h3>
              
              {isAuthenticated && addresses.length > 0 && (
                <div className="mb-4">
                  <label className="text-[13px] font-medium text-gray-700 block mb-2">Saved Addresses</label>
                  <div className="flex gap-2 w-full overflow-x-auto pb-2 scrollbar-hide">
                    {addresses.map((addr) => (
                      <button key={addr.id} onClick={() => { setAddressLine1(addr.street); setCityZip(addr.city); }} className="flex border border-gray-200 p-3 rounded-xl bg-white items-center justify-between hover:border-bistro-charcoal group cursor-pointer whitespace-nowrap shadow-sm">
                        <div className="flex items-center gap-2 text-[14px] text-gray-600 font-medium group-hover:text-bistro-charcoal text-left">
                          <MapPin size={18} className="text-gray-400 group-hover:text-bistro-charcoal" /> 
                          <div><span className="block">{addr.label}</span><span className="block text-xs font-normal text-gray-400">{addr.street}</span></div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="flex items-center p-3 border-b border-gray-100">
                  <input type="text" placeholder="Street Address" value={addressLine1} onChange={e => setAddressLine1(e.target.value)} className="w-full text-[15px] outline-none placeholder:text-gray-400" />
                </div>
                <div className="flex items-center p-3">
                  <input type="text" placeholder="City & ZIP" value={cityZip} onChange={e => setCityZip(e.target.value)} className="w-full text-[15px] outline-none placeholder:text-gray-400" />
                </div>
              </div>
            </div>
            
            <div className="pb-4 pt-4">
              <button 
                onClick={() => setStep('payment')}
                disabled={!isDetailsValid}
                className="w-full bg-[#1A1A1A] group text-white py-4 rounded-xl font-medium tracking-wide hover:bg-black transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-3 disabled:opacity-80 disabled:cursor-not-allowed"
              >
                Continue to Payment
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Order Summary Miniature */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <h4 className="font-medium text-[15px] mb-4 text-[#1A1A1A]">Order Summary</h4>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-[13px] text-gray-500">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[13px] text-gray-500">
                  <span>Taxes</span>
                  <span>${taxesAndFees.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[13px] text-gray-500">
                  <span>Delivery Fee</span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>
              </div>
              <div className="h-px bg-gray-100 w-full my-3" />
              <div className="flex justify-between items-center">
                <span className="font-medium text-[#1A1A1A]">Total due</span>
                <span className="font-serif text-2xl text-[#1A1A1A]">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Express Checkout Options */}
            <div>
              <p className="text-[12px] font-medium text-gray-400 uppercase tracking-wider mb-3">Express Checkout</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => handlePayment('apple')}
                  disabled={paymentState !== 'idle'}
                  className="flex-1 bg-black text-white rounded-xl py-3.5 flex items-center justify-center shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Apple size={20} className="mr-1" fill="currentColor" />
                  <span className="font-medium">Pay</span>
                </button>
                <button 
                  onClick={() => handlePayment('google')}
                  disabled={paymentState !== 'idle'}
                  className="flex-1 bg-white border border-gray-200 text-black rounded-xl py-3.5 flex items-center justify-center shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" className="w-[42px] h-[18px]">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase tracking-widest font-medium">Or pay with card</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            {paymentState === 'error' && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 text-red-600 p-4 rounded-xl text-[13px] font-medium border border-red-100"
              >
                {errorMessage}
              </motion.div>
            )}

            {/* Standard Checkout */}
            <div className="space-y-4 pb-20">
              <div>
                <label className="text-[13px] font-medium text-gray-700 block mb-1.5">Saved Payment Methods</label>
                <div className="flex gap-2 w-full overflow-x-auto pb-2 scrollbar-hide">
                  <button onClick={() => { setCardNumber('4242 4242 4242 4242'); setExpiry('12/28'); setCvc('123'); setName('John Doe'); }} className="flex border border-gray-200 p-3 rounded-xl bg-white items-center justify-between hover:border-gray-400 group cursor-pointer whitespace-nowrap shadow-sm">
                    <div className="flex items-center gap-2 text-[14px] text-gray-600 font-medium">
                      <CreditCard size={18} className="text-gray-400" /> Waitress Visa (**** 4242)
                    </div>
                  </button>
                  <button onClick={() => { setCardNumber('5555 5555 5555 4444'); setExpiry('08/25'); setCvc('456'); setName('Jane Doe'); }} className="flex border border-gray-200 p-3 rounded-xl bg-white items-center justify-between hover:border-gray-400 group cursor-pointer whitespace-nowrap shadow-sm">
                    <div className="flex items-center gap-2 text-[14px] text-gray-600 font-medium">
                      <CreditCard size={18} className="text-gray-400" /> Personal MC (**** 4444)
                    </div>
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[13px] font-medium text-gray-700 block mb-1.5">Card Information</label>
                <div className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
                  <div className="p-3 border-b border-gray-200 flex items-center">
                    <CreditCard size={18} className="text-gray-400 mr-2" />
                    <input 
                      type="text" 
                      placeholder="Card number" 
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value)}
                      className="w-full text-[15px] outline-none placeholder:text-gray-400"
                    />
                  </div>
                  <div className="flex">
                    <div className="p-3 border-r border-gray-200 flex-1">
                      <input 
                        type="text" 
                        placeholder="MM / YY" 
                        value={expiry}
                        onChange={e => setExpiry(e.target.value)}
                        className="w-full text-[15px] outline-none placeholder:text-gray-400"
                      />
                    </div>
                    <div className="p-3 flex-1">
                      <input 
                        type="text" 
                        placeholder="CVC" 
                        value={cvc}
                        onChange={e => setCvc(e.target.value)}
                        className="w-full text-[15px] outline-none placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-[13px] font-medium text-gray-700 block mb-1.5">Name on card</label>
                <input 
                  type="text" 
                  placeholder="e.g. Jane Doe" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 bg-white text-[15px] outline-none focus:border-gray-400 placeholder:text-gray-400 shadow-sm"
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {step === 'payment' && (
        <div className="bg-white border-t border-gray-100 p-6 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] shrink-0 absolute bottom-0 inset-x-0">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mb-4 font-medium">
            <ShieldCheck size={14} />
            Payments are secure and encrypted
          </div>
          <button 
            onClick={() => handlePayment('card')}
            disabled={paymentState !== 'idle' || !cardNumber || !expiry || !cvc}
            className="w-full bg-[#1A1A1A] group text-white py-4 rounded-xl font-medium tracking-wide hover:bg-black transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-3 disabled:opacity-80 disabled:cursor-not-allowed cursor-pointer"
          >
            {paymentState === 'processing' ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Pay ${total.toFixed(2)}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      )}
    </motion.div>
  );
}
