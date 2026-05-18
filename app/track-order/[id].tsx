import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Bike, CheckCircle2, ChefHat, ChevronLeft, Clock, PackageCheck } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, SlideInUp } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOrderStore } from '../../frontend/stores/useOrderStore';


// Demo: 2 min preparing → 2 min on_the_way → delivered  (4 min total)
const PREPARING_SECS = 120;
const ON_THE_WAY_SECS = 120;


const getStages = (orderType?: string) => {
  if (orderType === 'pickup') {
    return [
      { id: 'confirmed', label: 'Order Confirmed', icon: CheckCircle2, description: 'We have received your order.' },
      { id: 'preparing', label: 'Preparing', icon: ChefHat, description: 'Your food is being prepared.' },
      { id: 'delivered', label: 'Ready for Pickup', icon: PackageCheck, description: 'Your order is ready!' },
    ];
  }
  if (orderType === 'dine-in') {
    return [
      { id: 'confirmed', label: 'Order Confirmed', icon: CheckCircle2, description: 'We have received your order.' },
      { id: 'preparing', label: 'Preparing', icon: ChefHat, description: 'Your food is being prepared.' },
      { id: 'delivered', label: 'Served', icon: PackageCheck, description: 'Enjoy your meal!' },
    ];
  }
  // Default: delivery
  return [
    { id: 'confirmed', label: 'Order Confirmed', icon: CheckCircle2, description: 'We have received your order.' },
    { id: 'preparing', label: 'Preparing', icon: ChefHat, description: 'Your food is being prepared.' },
    { id: 'on_the_way', label: 'Out for Delivery', icon: Bike, description: 'Heading your way.' },
    { id: 'delivered', label: 'Delivered', icon: PackageCheck, description: 'Enjoy your meal!' },
  ];
};

export default function TrackOrderScreen() {

  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { orders, updateOrderStatus } = useOrderStore();

  const order = orders.find(o => o.id === id);
  const [timeLeft, setTimeLeft] = useState(PREPARING_SECS);
  const [isDelivered, setIsDelivered] = useState(false);

const STAGES = getStages(order?.orderType);
  const isDelivery = order?.orderType === 'delivery' || !order?.orderType;

  // Keep currentStage in sync with order.status
  const currentStage =
    !order ? 0
      : order.status === 'preparing' || order.status === 'ready' ? 1
        : order.status === 'on_the_way' ? 2
          : order.status === 'delivered' ? (isDelivery ? 3 : 2)
            : 0;

  // Progress (0→1) for the active connector line based on remaining time
  const STAGE_DURATIONS = isDelivery ? [0, PREPARING_SECS, ON_THE_WAY_SECS, 0] : [0, PREPARING_SECS, 0];
  const getLineProgress = (lineIdx: number): number => {
    if (lineIdx < currentStage) return 1;
    if (lineIdx === currentStage) {
      const dur = STAGE_DURATIONS[currentStage];
      return dur > 0 ? Math.min(1, Math.max(0, 1 - timeLeft / dur)) : 1;
    }
    return 0;
  };

  // Auto-advance relative to order creation date so timer does not reset
  useEffect(() => {
    if (!order) return;

    if (order.status === 'delivered') {
      setIsDelivered(true);
      setTimeLeft(0);
      return;
    }

    const orderTime = new Date(order.date).getTime();

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - orderTime) / 1000);

      if (isDelivery) {
        if (elapsed < PREPARING_SECS) {
          if (order.status !== 'preparing') updateOrderStatus(order.id, 'preparing');
          setTimeLeft(PREPARING_SECS - elapsed);
        } else if (elapsed < PREPARING_SECS + ON_THE_WAY_SECS) {
          if (order.status !== 'on_the_way') {
             updateOrderStatus(order.id, 'on_the_way');
             Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          setTimeLeft(PREPARING_SECS + ON_THE_WAY_SECS - elapsed);
        } else {
          clearInterval(timer);
          if (order.status !== 'delivered') {
            updateOrderStatus(order.id, 'delivered');
            setIsDelivered(true);
            setTimeLeft(0);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            
            if (order.customerEmail) {
              const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
              fetch(`${API_URL}/api/orders/delivery`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: order.id,
                  customerName: order.customerName,
                  email: order.customerEmail,
                  total: order.total
                })
              }).catch(err => console.warn('Delivery email send failed:', err));
            }
          }
        }
      } else {
        // Pickup / Dine-in
        if (elapsed < PREPARING_SECS) {
          if (order.status !== 'preparing') updateOrderStatus(order.id, 'preparing');
          setTimeLeft(PREPARING_SECS - elapsed);
        } else {
          clearInterval(timer);
          if (order.status !== 'delivered') {
            updateOrderStatus(order.id, 'delivered');
            setIsDelivered(true);
            setTimeLeft(0);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            
            if (order.customerEmail) {
              const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
              fetch(`${API_URL}/api/orders/delivery`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: order.id,
                  customerName: order.customerName,
                  email: order.customerEmail,
                  total: order.total
                })
              }).catch(err => console.warn('Delivery email send failed:', err));
            }
          }
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [order?.status, order?.id, isDelivery, order?.date]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Order not found</Text>
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/')} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={styles.headerRow}>
          <Pressable style={styles.headerBtn} onPress={() => router.canGoBack() ? router.back() : router.replace('/')}>
            <ChevronLeft size={24} color="#1A1A1A" />
          </Pressable>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Track Order</Text>
            <Text style={styles.orderId}>#{order.id}</Text>
          </View>
          <View style={styles.placeholderBtn} />
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ETA Card */}
        <Animated.View entering={FadeInDown.delay(100)} style={[styles.etaCard, isDelivered && styles.etaCardDelivered]}>
          <View style={styles.etaInfo}>
            <Text style={styles.etaLabel}>
              {isDelivered ? (order.orderType === 'pickup' ? '🎉 Ready for Pickup!' : order.orderType === 'dine-in' ? '🎉 Served!' : '🎉 Delivered!') : order.status === 'on_the_way' ? 'Delivery Time Left' : 'Preparing Time Left'}
            </Text>
            <Text style={[styles.etaTime, isDelivered && { color: '#10B981' }]}>
              {isDelivered ? 'Enjoy your meal!' : formatTime(timeLeft)}
            </Text>
          </View>
          <View style={styles.etaIconCircle}>
            {isDelivered
              ? <PackageCheck size={28} color="#10B981" />
              : <Clock size={28} color="#C1A87D" />
            }
          </View>
        </Animated.View>

        {/* Timeline */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.timelineCard}>
          {STAGES.map((stage, idx) => {
            const isActive = idx <= currentStage;
            const isCurrent = idx === currentStage;
            const isLast = idx === STAGES.length - 1;
            const Icon = stage.icon;
            return (
              <View key={stage.id} style={styles.timelineRow}>
                <View style={styles.timelineLeft}>
                  <View style={[styles.timelineDot, isActive && styles.timelineDotActive, isCurrent && !isDelivered && styles.timelineDotCurrent]}>
                    <Icon size={16} color={isActive ? "#FFF" : "#D1D5DB"} />
                  </View>
                  {!isLast ? (
                    <View style={styles.timelineLineContainer}>
                      <View style={[styles.timelineLineFilled, { flex: getLineProgress(idx) }]} />
                      <View style={[styles.timelineLineEmpty, { flex: 1 - getLineProgress(idx) }]} />
                    </View>
                  ) : null}
                </View>
                <View style={styles.timelineRight}>
                  <Text style={[styles.timelineTitle, isActive && styles.timelineTitleActive]}>{stage.label}</Text>
                  <Text style={styles.timelineDesc}>{stage.description}</Text>
                </View>
              </View>
            );
          })}
        </Animated.View>

        {/* Past Orders CTA — only when delivered */}
        {isDelivered ? (
          <Animated.View entering={SlideInUp.delay(200)} style={styles.deliveredCta}>
            <Text style={styles.deliveredCtaTitle}>Order Complete! 🎉</Text>
            <Text style={styles.deliveredCtaSubtitle}>Your order has been delivered. Head to Past Orders to rate your experience.</Text>
            <Pressable
              style={styles.pastOrdersBtn}
              onPress={() => router.push('/(tabs)/orders')}
            >
              <PackageCheck size={18} color="#FFF" />
              <Text style={styles.pastOrdersBtnText}>View Past Orders</Text>
            </Pressable>
          </Animated.View>
        ) : null}

      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F5F0',
  },
  header: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  orderId: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  placeholderBtn: {
    width: 40,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  etaCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  etaCardDelivered: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  etaInfo: {
    flex: 1,
  },
  etaLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 4,
  },
  etaTime: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '800',
    fontFamily: 'serif',
  },
  etaIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(193, 168, 125, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  timelineRow: {
    flexDirection: 'row',
    minHeight: 70,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 40,
  },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  timelineDotActive: {
    backgroundColor: '#10B981',
  },
  timelineDotCurrent: {
    backgroundColor: '#F97316',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  timelineLineContainer: {
    width: 2,
    flex: 1,
    alignSelf: 'center',
    marginTop: -4,
    marginBottom: -4,
    zIndex: 1,
    overflow: 'hidden',
    borderRadius: 1,
  },
  timelineLineFilled: {
    width: '100%',
    backgroundColor: '#10B981',
    minHeight: 0,
  },
  timelineLineEmpty: {
    width: '100%',
    backgroundColor: '#E5E7EB',
    minHeight: 0,
  },
  timelineRight: {
    flex: 1,
    paddingLeft: 16,
    paddingTop: 4,
    paddingBottom: 24,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 4,
  },
  timelineTitleActive: {
    color: '#1A1A1A',
    fontWeight: '700',
  },
  timelineDesc: {
    fontSize: 13,
    color: '#6B7280',
  },
  deliveredCta: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  deliveredCtaTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  deliveredCtaSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  pastOrdersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  pastOrdersBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  driverCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  driverInfo: {
    flex: 1,
    marginLeft: 16,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  driverRole: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  callBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#1A1A1A',
    textAlign: 'center',
    marginTop: 100,
  },
  backBtn: {
    marginTop: 20,
    alignSelf: 'center',
    padding: 12,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
  },
  backBtnText: {
    color: '#FFF',
    fontWeight: '600',
  }
});
