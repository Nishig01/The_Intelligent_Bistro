import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Animated as RNAnimated, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOrderStore } from '../../frontend/stores/useOrderStore';
import { MapPin, PhoneCall, ChevronLeft, CheckCircle2, Clock, ChefHat, Bike, PackageCheck } from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn, Layout, SlideInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const STAGES = [
  { id: 'confirmed', label: 'Order Confirmed', icon: CheckCircle2, description: 'We have received your order.' },
  { id: 'preparing', label: 'Preparing', icon: ChefHat, description: 'Your food is being prepared.' },
  { id: 'on_the_way', label: 'Out for Delivery', icon: Bike, description: 'Heading your way.' },
  { id: 'ready', label: 'Ready for Pickup', icon: PackageCheck, description: 'Order is ready at the counter' },
  { id: 'delivered', label: 'Delivered', icon: PackageCheck, description: 'Enjoy your meal!' },
];

export default function TrackOrderScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { orders, updateOrderStatus } = useOrderStore();
  
  const order = orders.find(o => o.id === id);
  const [currentStage, setCurrentStage] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes

  useEffect(() => {
    if (!order) return;
    
    let stageIdx = 0;
    if (order.status === 'preparing') stageIdx = 1;
    if (order.status === 'on_the_way') stageIdx = 2;
    if (order.status === 'ready') stageIdx = 3;
    if (order.status === 'delivered') stageIdx = 4;
    
    setCurrentStage(stageIdx);
  }, [order?.status]);

  useEffect(() => {
    if (order?.status === 'preparing') {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            const nextStatus = order.orderType === 'delivery' ? 'on_the_way' : 'ready';
            updateOrderStatus(order.id, nextStatus);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    } else if (order?.status === 'on_the_way') {
      // Countdown for delivery too (4 minutes example)
      if (timeLeft === 0) setTimeLeft(240); // Reset for delivery phase
      
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            updateOrderStatus(order.id, 'delivered');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [order?.status, order?.id, order?.orderType, updateOrderStatus]);

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Order not found</Text>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const isDelivery = order.orderType === 'delivery';
  
  const applicableStages = isDelivery 
    ? [STAGES[0], STAGES[1], STAGES[2], STAGES[4]] 
    : [STAGES[0], STAGES[1], STAGES[3]];

  const activeStageIndex = isDelivery
      ? (currentStage === 4 ? 3 : currentStage)
      : (currentStage >= 3 ? 2 : currentStage);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={styles.headerRow}>
          <Pressable style={styles.headerBtn} onPress={() => router.back()}>
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
        
        {/* Map Placeholder or ETA Card */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.etaCard}>
           <View style={styles.etaInfo}>
             <Text style={styles.etaLabel}>
                {order.status === 'preparing' ? 'Preparing Time Left' : order.status === 'on_the_way' ? 'Delivery Time Left' : 'Estimated Arrival'}
             </Text>
             <Text style={[styles.etaTime, (order.status === 'preparing' || order.status === 'on_the_way') && { color: '#F97316' }]}>
                {(order.status === 'preparing' || order.status === 'on_the_way') ? formatTime(timeLeft) : order.eta}
             </Text>
           </View>
           <View style={styles.etaIconCircle}>
             <Clock size={28} color="#C1A87D" />
           </View>
        </Animated.View>

        {/* Timeline */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.timelineCard}>
          {applicableStages.map((stage, idx) => {
            const isActive = idx <= activeStageIndex;
            const isCurrent = idx === activeStageIndex;
            const isLast = idx === applicableStages.length - 1;
            const Icon = stage.icon;

            return (
              <View key={stage.id} style={styles.timelineRow}>
                <View style={styles.timelineLeft}>
                  <View style={[styles.timelineDot, isActive && styles.timelineDotActive]}>
                    <Icon size={16} color={isActive ? "#FFF" : "#D1D5DB"} />
                  </View>
                  {!isLast && (
                     <View style={[styles.timelineLine, isActive && idx < activeStageIndex && styles.timelineLineActive]} />
                  )}
                </View>
                <View style={styles.timelineRight}>
                   <Text style={[styles.timelineTitle, isActive && styles.timelineTitleActive]}>{stage.label}</Text>
                   <Text style={styles.timelineDesc}>{stage.description}</Text>
                </View>
              </View>
            );
          })}
        </Animated.View>
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
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#F3F4F6',
    marginTop: -8,
    marginBottom: -8,
    zIndex: 1,
  },
  timelineLineActive: {
    backgroundColor: '#10B981',
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
