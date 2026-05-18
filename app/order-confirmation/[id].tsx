import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, MapPin, Receipt, Truck, ArrowRight, Share2, Star } from 'lucide-react-native';
import { useOrderStore } from '../../frontend/stores/useOrderStore';
import * as Haptics from 'expo-haptics';
import Animated, { 
  FadeIn, 
  FadeInDown, 
  FadeInUp, 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withTiming, 
  withSequence,
  withDelay,
  Easing
} from 'react-native-reanimated';

export default function OrderConfirmation() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { orders, updateOrderStatus, rateOrder } = useOrderStore();
  
  const order = orders.find(o => o.id === id);
  const [selectedRating, setSelectedRating] = useState<number>(order?.rating ?? 0);
  
  const checkScale = useSharedValue(0);
  const checkOpacity = useSharedValue(0);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    checkScale.value = withDelay(500, withSequence(
      withTiming(1.2, { duration: 400 }),
      withTiming(1, { duration: 200 })
    ));
    checkOpacity.value = withDelay(500, withTiming(1, { duration: 300 }));
  }, []);

  const animatedCheckStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkOpacity.value
  }));

  if (!order) return <View style={styles.container}><Text>Order not found</Text></View>;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.header, { paddingTop: insets.top + 40 }]}>
          <Animated.View entering={FadeInDown} style={styles.successIconContainer}>
             <View style={styles.successPulse} />
             <Animated.View style={[styles.successIcon, animatedCheckStyle]}>
                <Check size={48} color="#FFF" strokeWidth={3} />
             </Animated.View>
          </Animated.View>
          
          <Animated.View entering={FadeInUp.delay(800)}>
            <Text style={styles.title}>Order Confirmed ✨</Text>
            <Text style={styles.subtitle}>Get ready, your bistro experience is weighing in!</Text>
          </Animated.View>
        </View>

        <Animated.View entering={FadeInDown.delay(1000)} style={styles.card}>
          <View style={styles.orderHeader}>
             <View>
                <Text style={styles.orderIdLabel}>Order ID</Text>
                <Text style={styles.orderId}>#{order.id}</Text>
             </View>
             <View style={styles.etaBadge}>
                <Truck size={16} color="#C1A87D" />
                <Text style={styles.etaText}>{order.eta}</Text>
             </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailsRow}>
            <MapPin size={20} color="#6B7280" />
            <View style={styles.detailsInfo}>
               {order.orderType === 'dine-in' ? (
                 <>
                   <Text style={styles.detailsLabel}>Dining In</Text>
                   <Text style={styles.detailsValue}>Table {order.tableNumber}</Text>
                 </>
               ) : order.orderType === 'pickup' ? (
                 <>
                   <Text style={styles.detailsLabel}>Pickup location</Text>
                   <Text style={styles.detailsValue}>Bistro Main Branch</Text>
                 </>
               ) : (
                 <>
                   <Text style={styles.detailsLabel}>Delivery to</Text>
                   <Text style={styles.detailsValue}>{order.address?.label} • {order.address?.street}</Text>
                 </>
               )}
            </View>
          </View>

          <View style={[styles.detailsRow, { marginTop: 15 }]}>
            <Receipt size={20} color="#6B7280" />
            <View style={styles.detailsInfo}>
               <Text style={styles.detailsLabel}>Payment Method</Text>
               <Text style={styles.detailsValue}>{order.paymentMethod}</Text>
            </View>
          </View>

          <View style={styles.miniSummary}>
            {order.items.slice(0, 2).map((item, idx) => (
              <Text key={`${item.id}-${idx}`} style={styles.itemText}>
                {item.quantity}x {item.name}
              </Text>
            ))}
            {order.items.length > 2 && (
              <Text style={styles.moreText}>+ {order.items.length - 2} more items</Text>
            )}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(1200)} style={styles.promoCard}>
           <View style={styles.promoInfo}>
              <Text style={styles.promoTitle}>Rate your experience</Text>
              <Text style={styles.promoSubtitle}>
                {selectedRating > 0 ? `You rated us ${selectedRating} star${selectedRating > 1 ? 's' : ''} — Thank you! 🙏` : 'Help us improve our bistro service'}
              </Text>
              <View style={styles.stars}>
                 {[1,2,3,4,5].map(i => (
                   <Pressable
                     key={i}
                     onPress={() => {
                       Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                       setSelectedRating(i);
                       if (order) rateOrder(order.id, i);
                     }}
                     style={{ marginRight: 6 }}
                   >
                     <Star
                       size={28}
                       color="#C1A87D"
                       fill={i <= selectedRating ? '#C1A87D' : 'transparent'}
                     />
                   </Pressable>
                 ))}
              </View>
           </View>
        </Animated.View>

        <View style={{ height: 160 }} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <Pressable 
          style={styles.trackBtn} 
          onPress={() => router.push({ pathname: '/track-order/[id]', params: { id: order.id } } as any)}
        >
          <Text style={styles.trackText}>Track Order</Text>
          <ArrowRight size={20} color="#FFF" />
        </Pressable>
        <Pressable 
          style={styles.homeBtn} 
          onPress={() => router.replace('/')}
        >
          <Text style={styles.homeBtnText}>Back to Home</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F5F0',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successIconContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successIcon: {
    backgroundColor: '#10B981',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    zIndex: 2,
  },
  successPulse: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    zIndex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    fontFamily: 'serif',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
    marginBottom: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  orderIdLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  orderId: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    marginTop: 2,
  },
  etaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(193, 168, 125, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  etaText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#C1A87D',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 20,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  detailsInfo: {
    flex: 1,
  },
  detailsLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  detailsValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 2,
  },
  miniSummary: {
    marginTop: 24,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 16,
  },
  itemText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  moreText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  promoCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  promoInfo: {
    flex: 1,
  },
  promoTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  promoSubtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 12,
  },
  stars: {
    flexDirection: 'row',
  },
  shareBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
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
  trackBtn: {
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
    marginBottom: 10,
  },
  trackText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  homeBtn: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeBtnText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
});
