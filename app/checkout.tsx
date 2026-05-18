import { BottomSheetBackdrop, BottomSheetModal } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { sendLocalNotification } from '../frontend/utils/notifications';
import { Apple, ChevronLeft, ChevronRight, CreditCard, MapPin, ShieldCheck, Smartphone, Wallet } from 'lucide-react-native';
import { useMemo, useRef, useState, useEffect } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AddressType, useAddressStore } from '../frontend/stores/useAddressStore';
import { useAuthStore } from '../frontend/stores/useAuthStore';
import { useCartStore } from '../frontend/stores/useCartStore';
import { useOrderStore } from '../frontend/stores/useOrderStore';

export default function Checkout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated } = useAuthStore();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { addresses, syncAddresses } = useAddressStore();

  useEffect(() => {
    const unsubscribe = syncAddresses();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [syncAddresses]);
  const { addOrder } = useOrderStore();

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['60%'], []);

  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTip, setSelectedTip] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple' | 'google'>('card');
  const [orderType, setOrderType] = useState<'delivery' | 'pickup' | 'dine-in'>('delivery');
  const [tableNumber, setTableNumber] = useState('');

  // Guest fields
  const [guestEmail, setGuestEmail] = useState('');
  const [guestEmailError, setGuestEmailError] = useState('');
  const [guestStreet, setGuestStreet] = useState('');
  const [guestCity, setGuestCity] = useState('');
  const [guestZip, setGuestZip] = useState('');
  const [guestCard, setGuestCard] = useState('');
  const [guestExpiry, setGuestExpiry] = useState('');
  const [guestCvc, setGuestCvc] = useState('');

  const validateEmail = (val: string) => /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(val.trim());

  const subtotal = getTotalPrice();
  const deliveryFee = orderType === 'delivery' ? 2.99 : 0;
  const taxRate = 0.0825;
  const tax = subtotal * taxRate;
  const tipAmount = selectedTip || 0;
  const total = subtotal + deliveryFee + tax + tipAmount;

  const defaultAddress = addresses.find(a => a.isDefault) || addresses[0];

  const handlePlaceOrder = async () => {
    // Email validation for guest
    if (!isAuthenticated) {
      if (!guestEmail || !validateEmail(guestEmail)) {
        setGuestEmailError('Please enter a valid email address (e.g. you@example.com)');
        Alert.alert('Email Required', 'We need your email to send the order confirmation.');
        return;
      }
      setGuestEmailError('');
    }
    if (orderType === 'delivery') {
      if (!isAuthenticated && (!guestStreet || !guestCity || !guestZip)) {
        Alert.alert('Delivery Address', 'Please provide your full delivery address.');
        return;
      }
    }

    if (!isAuthenticated && paymentMethod === 'card' && (!guestCard || !guestExpiry || !guestCvc)) {
      Alert.alert('Payment Details', 'Please provide your card details to checkout.');
      return;
    }

    if (orderType === 'dine-in' && !tableNumber) {
      Alert.alert('Table Number', 'Please enter your table number.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      const orderId = `BSTR-${Math.floor(1000 + Math.random() * 9000)}`;

      const finalAddress = isAuthenticated
        ? (defaultAddress || { id: 'guest', label: 'Home' as AddressType, fullName: user?.name || 'User', street: user?.deliveryAddress || '123 Default St', city: 'City', state: '', zipCode: '00000', isDefault: true })
        : { id: 'guest', label: 'Home' as AddressType, fullName: 'Guest', street: guestStreet, city: guestCity, state: '', zipCode: guestZip, isDefault: true };

      addOrder({
        id: orderId,
        items: [...items],
        total,
        subtotal,
        tax,
        deliveryFee,
        tip: tipAmount,
        date: new Date().toISOString(),
        status: 'preparing',
        address: finalAddress,
        paymentMethod: paymentMethod === 'card' ? (isAuthenticated ? 'Visa •••• 4242' : `Card •••• ${guestCard.slice(-4) || 'XXXX'}`) : paymentMethod === 'apple' ? 'Apple Pay' : 'Google Pay',
        eta: orderType === 'delivery' ? '25-35 mins' : '10-15 mins',
        orderType,
        tableNumber,
        customerName: isAuthenticated ? user?.name : 'Valued Guest',
        customerEmail: isAuthenticated ? user?.email : guestEmail
      });

      setIsProcessing(false);
      clearCart();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      sendLocalNotification('Order Placed Successfully!', 'Your order is being sent to the kitchen.');

      // Send order confirmation email (fire-and-forget)
      const emailTo = isAuthenticated ? user?.email : guestEmail;
      if (emailTo) {
        const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
        fetch(`${API_URL}/api/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            items: [...items],
            total,
            customerName: isAuthenticated ? user?.name : 'Valued Guest',
            email: emailTo,
            orderType,
            eta: orderType === 'delivery' ? '25-35 mins' : '10-15 mins',
          })
        }).catch(err => console.warn('Email send failed (non-blocking):', err));
      }

      router.push({
        pathname: "/order-confirmation/[id]" as any,
        params: { id: orderId }
      });
    }, 2500);
  };

  const renderBackdrop = (props: any) => (
    <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
  );

  const tips = [2, 5, 8, 10];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.header} edges={['top']}>
        <Pressable
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/');
            }
          }}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color="#1A1A1A" />
        </Pressable>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 44 }} />
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Type Section */}
        <Animated.View entering={FadeInDown} style={styles.section}>
          <Text style={styles.sectionTitle}>Order Type</Text>
          <View style={styles.paymentMethods}>
            <Pressable
              style={[styles.paymentBtn, orderType === 'delivery' && styles.paymentBtnActive]}
              onPress={() => setOrderType('delivery')}
            >
              <Text style={[styles.paymentText, orderType === 'delivery' && styles.paymentTextActive]}>Delivery</Text>
            </Pressable>
            <Pressable
              style={[styles.paymentBtn, orderType === 'pickup' && styles.paymentBtnActive]}
              onPress={() => setOrderType('pickup')}
            >
              <Text style={[styles.paymentText, orderType === 'pickup' && styles.paymentTextActive]}>Pickup</Text>
            </Pressable>
            <Pressable
              style={[styles.paymentBtn, orderType === 'dine-in' && styles.paymentBtnActive]}
              onPress={() => setOrderType('dine-in')}
            >
              <Text style={[styles.paymentText, orderType === 'dine-in' && styles.paymentTextActive]}>Dine-in</Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* Guest Contact Info */}
        {!isAuthenticated && (
          <Animated.View entering={FadeInDown.delay(25)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Contact Info</Text>
            </View>
            <View style={styles.guestForm}>
              <TextInput
                style={[styles.input, !!guestEmailError && { borderColor: '#EF4444', borderWidth: 1.5 }]}
                placeholder="your@email.com (for order confirmation)"
                placeholderTextColor="#D1D5DB"
                value={guestEmail}
                onChangeText={(t) => { setGuestEmail(t); setGuestEmailError(''); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {!!guestEmailError ? <Text style={{ fontSize: 12, color: '#EF4444', marginTop: -4, marginLeft: 4 }}>{guestEmailError}</Text> : null}
            </View>
          </Animated.View>
        )}

        {/* Dynamic Details based on Order Type */}
        {orderType === 'delivery' && (
          <Animated.View entering={FadeInDown.delay(50)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Delivery Address</Text>
              {isAuthenticated && (
                <Pressable onPress={() => router.push('/manage-addresses')}>
                  <Text style={styles.actionText}>{defaultAddress ? 'Change' : 'Add'}</Text>
                </Pressable>
              )}
            </View>

            {isAuthenticated ? (
              <Pressable
                style={styles.addressCard}
                onPress={() => router.push('/manage-addresses')}
              >
                <View style={styles.iconCircle}>
                  <MapPin size={20} color="#C1A87D" />
                </View>
                <View style={styles.addressInfo}>
                  {defaultAddress ? (
                    <>
                      <Text style={styles.addressLabel}>{defaultAddress.label}</Text>
                      <Text style={styles.addressText}>{defaultAddress.street}</Text>
                      <Text style={styles.addressText}>{defaultAddress.city}, {defaultAddress.zipCode}</Text>
                    </>
                  ) : (
                    <Text style={styles.placeholderText}>Please add a delivery address</Text>
                  )}
                </View>
                <ChevronRight size={20} color="#D1D5DB" />
              </Pressable>
            ) : (
              <View style={styles.guestForm}>
                <TextInput
                  style={styles.input}
                  placeholder="Street Address"
                  placeholderTextColor="#D1D5DB"
                  value={guestStreet}
                  onChangeText={setGuestStreet}
                />
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TextInput
                    style={[styles.input, { flex: 2 }]}
                    placeholder="City"
                    placeholderTextColor="#D1D5DB"
                    value={guestCity}
                    onChangeText={setGuestCity}
                  />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Zip"
                    placeholderTextColor="#D1D5DB"
                    keyboardType="numeric"
                    value={guestZip}
                    onChangeText={setGuestZip}
                  />
                </View>
              </View>
            )}
          </Animated.View>
        )}

        {orderType === 'dine-in' && (
          <Animated.View entering={FadeInDown.delay(50)} style={styles.section}>
            <Text style={styles.sectionTitle}>Table Number</Text>
            <View style={styles.tableInputContainer}>
              <TextInput
                style={styles.tableInput}
                placeholder="E.g. 12"
                placeholderTextColor="#9CA3AF"
                value={tableNumber}
                onChangeText={setTableNumber}
                keyboardType="numeric"
              />
            </View>
          </Animated.View>
        )}

        {/* Payment Method Section */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentMethods}>
            <Pressable
              style={[styles.paymentBtn, paymentMethod === 'apple' && styles.paymentBtnActive]}
              onPress={() => setPaymentMethod('apple')}
            >
              <Apple size={20} color={paymentMethod === 'apple' ? "#FFF" : "#1A1A1A"} />
              <Text style={[styles.paymentText, paymentMethod === 'apple' && styles.paymentTextActive]}>Pay</Text>
            </Pressable>
            <Pressable
              style={[styles.paymentBtn, paymentMethod === 'google' && styles.paymentBtnActive]}
              onPress={() => setPaymentMethod('google')}
            >
              <Smartphone size={20} color={paymentMethod === 'google' ? "#FFF" : "#1A1A1A"} />
              <Text style={[styles.paymentText, paymentMethod === 'google' && styles.paymentTextActive]}>Google Pay</Text>
            </Pressable>
            <Pressable
              style={[styles.paymentBtn, paymentMethod === 'card' && styles.paymentBtnActive]}
              onPress={() => setPaymentMethod('card')}
            >
              <CreditCard size={20} color={paymentMethod === 'card' ? "#FFF" : "#1A1A1A"} />
              <Text style={[styles.paymentText, paymentMethod === 'card' && styles.paymentTextActive]}>Card</Text>
            </Pressable>
          </View>

          {paymentMethod === 'card' && (
            <Animated.View entering={FadeIn} style={isAuthenticated ? styles.cardPreview : styles.guestForm}>
              {isAuthenticated ? (
                <>
                  <View style={styles.flex1}>
                    <Text style={styles.cardName}>Visa Gold</Text>
                    <Text style={styles.cardNumber}>•••• •••• •••• 4242</Text>
                  </View>
                  <CreditCard size={24} color="#C1A87D" />
                </>
              ) : (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Card Number"
                    placeholderTextColor="#D1D5DB"
                    keyboardType="numeric"
                    maxLength={16}
                    value={guestCard}
                    onChangeText={setGuestCard}
                  />
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      placeholder="MM/YY"
                      placeholderTextColor="#D1D5DB"
                      maxLength={5}
                      value={guestExpiry}
                      onChangeText={setGuestExpiry}
                    />
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      placeholder="CVC"
                      placeholderTextColor="#D1D5DB"
                      keyboardType="numeric"
                      maxLength={3}
                      value={guestCvc}
                      onChangeText={setGuestCvc}
                    />
                  </View>
                </>
              )}
            </Animated.View>
          )}
        </Animated.View>

        {/* Tip Section */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Add a Tip</Text>
            <Text style={styles.actionText}>100% goes to driver</Text>
          </View>
          <View style={styles.tipOptions}>
            {tips.map(tip => (
              <Pressable
                key={tip}
                onPress={() => setSelectedTip(selectedTip === tip ? 0 : tip)}
                style={[styles.tipBtn, selectedTip === tip && styles.tipBtnActive]}
              >
                <Text style={[styles.tipText, selectedTip === tip && styles.tipTextActive]}>${tip}</Text>
              </Pressable>
            ))}
            <Pressable
              style={[styles.tipBtn, !tips.includes(selectedTip || 0) && selectedTip !== 0 && selectedTip !== null && styles.tipBtnActive]}
              onPress={() => { }} // Custom tip modal
            >
              <Text style={[styles.tipText]}>Custom</Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* Summary */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>${deliveryFee.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Estimated Tax</Text>
            <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
          </View>
          {tipAmount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tip</Text>
              <Text style={styles.summaryValue}>${tipAmount.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
        </Animated.View>

        <View style={styles.securityBadge}>
          <ShieldCheck size={16} color="#10B981" />
          <Text style={styles.securityText}>Payments are secure and encrypted</Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Footer / Processing Overlay */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <Pressable
          style={[styles.mainBtn, isProcessing && styles.mainBtnDisabled]}
          onPress={handlePlaceOrder}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Wallet size={20} color="#FFF" />
              <Text style={styles.mainBtnText}>Place Order • ${total.toFixed(2)}</Text>
            </>
          )}
        </Pressable>
      </View>

      {isProcessing && (
        <Animated.View entering={FadeIn} style={StyleSheet.absoluteFill}>
          <View style={styles.overlay}>
            <View style={styles.processingCard}>
              <ActivityIndicator size="large" color="#C1A87D" />
              <Text style={styles.processingText}>Processing Payment...</Text>
              <Text style={styles.processingSubtext}>Please do not close the app</Text>
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F5F0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#FFF',
    paddingBottom: 15,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    fontFamily: 'serif',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tableInputContainer: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    justifyContent: 'center',
    marginTop: 12,
  },
  tableInput: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  actionText: {
    fontSize: 13,
    color: '#C1A87D',
    fontWeight: '700',
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    gap: 15,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(193, 168, 125, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressInfo: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  addressText: {
    fontSize: 13,
    color: '#6B7280',
  },
  placeholderText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  paymentMethods: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  paymentBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  paymentBtnActive: {
    backgroundColor: '#1A1A1A',
    borderColor: '#1A1A1A',
  },
  paymentText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  paymentTextActive: {
    color: '#FFF',
  },
  cardPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 16,
    gap: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  cardName: {
    color: '#C1A87D',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardNumber: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  flex1: { flex: 1 },
  tipOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  tipBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipBtnActive: {
    backgroundColor: 'rgba(193, 168, 125, 0.1)',
    borderColor: '#C1A87D',
  },
  tipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  tipTextActive: {
    color: '#C1A87D',
    fontWeight: '700',
  },
  summarySection: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 15,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    opacity: 0.6,
  },
  securityText: {
    fontSize: 12,
    color: '#6B7280',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#F8F5F0',
    borderTopWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  mainBtn: {
    height: 56,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  mainBtnDisabled: {
    opacity: 0.8,
  },
  mainBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  processingCard: {
    backgroundColor: '#FFF',
    padding: 32,
    borderRadius: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 20,
    width: '100%',
  },
  processingText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    fontFamily: 'serif',
    marginTop: 20,
  },
  processingSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  guestForm: {
    gap: 10,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: '#1A1A1A',
  }
});
