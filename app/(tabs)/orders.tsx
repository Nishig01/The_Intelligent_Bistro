import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOrderStore, Order } from '../../frontend/stores/useOrderStore';
import { useCartStore } from '../../frontend/stores/useCartStore';
import { 
  Package, 
  ChevronRight, 
  RefreshCcw, 
  Clock, 
  MapPin, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { format } from 'date-fns';

export default function OrdersScreen() {
  const router = useRouter();
  const { orders } = useOrderStore();
  const { addItem } = useCartStore();
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');

  const activeOrders = orders.filter(o => o.status !== 'delivered');
  const pastOrders = orders.filter(o => o.status === 'delivered');

  const handleReorder = (order: Order) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    order.items.forEach(item => {
      addItem(item, item.quantity, item.selectedModifiers, item.spiceLevel, item.instructions);
    });
    router.push('/cart');
  };

  const renderOrderCard = (order: Order, idx: number) => (
    <Animated.View 
      key={order.id} 
      entering={FadeInDown.delay(idx * 100)}
      style={styles.orderCard}
    >
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderDate}>{format(new Date(order.date), 'MMM dd, yyyy • hh:mm a')}</Text>
          <Text style={styles.orderId}>Order #{order.id}</Text>
        </View>
        <View style={[
          styles.statusBadge, 
          order.status === 'delivered' ? styles.statusDelivered : styles.statusActive
        ]}>
          <Text style={[
            styles.statusText, 
            order.status === 'delivered' ? styles.statusTextDelivered : styles.statusTextActive
          ]}>
            {order.status.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.itemsSummary}>
        <Text style={styles.itemsText} numberOfLines={1}>
          {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
        </Text>
        <Text style={styles.totalAmount}>${order.total.toFixed(2)}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.orderFooter}>
        <View style={styles.addressRow}>
          <MapPin size={14} color="#9CA3AF" />
          <Text style={styles.addressText} numberOfLines={1}>{order.address.street}</Text>
        </View>
        
        <View style={styles.actions}>
          {order.status === 'delivered' ? (
            <Pressable 
              style={styles.reorderBtn}
              onPress={() => handleReorder(order)}
            >
              <RefreshCcw size={14} color="#C1A87D" />
              <Text style={styles.reorderText}>Reorder</Text>
            </Pressable>
          ) : (
            <Pressable 
               style={styles.trackBtn}
               onPress={() => router.push({ pathname: '/track-order/[id]', params: { id: order.id } } as any)}
            >
               <Text style={styles.trackText}>Track</Text>
               <ChevronRight size={14} color="#FFF" />
            </Pressable>
          )}
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Orders</Text>
        </View>

        <View style={styles.tabContainer}>
          <Pressable 
            style={[styles.tab, activeTab === 'active' && styles.activeTab]}
            onPress={() => setActiveTab('active')}
          >
            <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>Active</Text>
            {activeOrders.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{activeOrders.length}</Text>
              </View>
            )}
          </Pressable>
          <Pressable 
            style={[styles.tab, activeTab === 'past' && styles.activeTab]}
            onPress={() => setActiveTab('past')}
          >
            <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>Past Orders</Text>
          </Pressable>
        </View>
        
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
        >
          {activeTab === 'active' ? (
            activeOrders.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <Package size={48} color="#D1D5DB" />
                </View>
                <Text style={styles.emptyTitle}>No Active Orders</Text>
                <Text style={styles.emptySubtitle}>When you place an order, it will appear here for tracking.</Text>
                <Pressable style={styles.browseBtn} onPress={() => router.push('/')}>
                  <Text style={styles.browseBtnText}>Browse Menu</Text>
                </Pressable>
              </View>
            ) : (
              activeOrders.map((order, idx) => renderOrderCard(order, idx))
            )
          ) : (
            pastOrders.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <Clock size={48} color="#D1D5DB" />
                </View>
                <Text style={styles.emptyTitle}>No Past Orders</Text>
                <Text style={styles.emptySubtitle}>Your order history is empty. Time to change that?</Text>
              </View>
            ) : (
              pastOrders.map((order, idx) => renderOrderCard(order, idx))
            )
          )}
          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F5F0',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    fontFamily: 'serif',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: '#FFF',
    padding: 4,
    borderRadius: 16,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#1A1A1A',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFF',
  },
  badge: {
    backgroundColor: '#C1A87D',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderDate: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
    marginBottom: 2,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusActive: {
    backgroundColor: 'rgba(193, 168, 125, 0.1)',
  },
  statusDelivered: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statusTextActive: {
    color: '#C1A87D',
  },
  statusTextDelivered: {
    color: '#10B981',
  },
  itemsSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  itemsText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
    marginRight: 15,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 16,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  addressText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reorderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(193, 168, 125, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(193, 168, 125, 0.2)',
  },
  reorderText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#C1A87D',
  },
  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  trackText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    fontFamily: 'serif',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
    marginBottom: 24,
  },
  browseBtn: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  browseBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
