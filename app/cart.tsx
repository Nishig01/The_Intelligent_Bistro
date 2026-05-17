import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useCartStore, CartItem } from '../frontend/stores/useCartStore';
import { ChevronLeft, Trash2, Plus, Minus, CreditCard, ShoppingBag, MapPin, Flame, MessageSquareText } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeOutLeft, Layout } from 'react-native-reanimated';

export default function Cart() {
  const { items, addItem, removeItem, updateItemQuantity, getTotalPrice } = useCartStore();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const subtotal = getTotalPrice();
  const delivery = 2.99;
  const taxes = subtotal * 0.0825;
  const total = subtotal + delivery + taxes;

  const handleUpdateQty = (item: CartItem, delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      removeItem(item.id);
    } else {
      updateItemQuantity(item.id, newQty);
    }
  };

  const handleRemove = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    removeItem(id);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeHeader} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color="#1A1A1A" />
          </Pressable>
          <Text style={styles.headerTitle}>Your Basket</Text>
          <Pressable onPress={() => {}} style={styles.moreButton}>
            <Text style={styles.itemCount}>{items.length} items</Text>
          </Pressable>
        </View>
      </SafeAreaView>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
               <ShoppingBag size={48} color="#D1D5DB" />
            </View>
            <Text style={styles.emptyTitle}>Your basket is empty</Text>
            <Text style={styles.emptySubtitle}>Looks like you haven't added anything to your basket yet.</Text>
            <Pressable onPress={() => router.push('/')} style={styles.browseButton}>
              <Text style={styles.browseButtonText}>Browse Menu</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.itemList}>
            {items.map((item, idx) => (
              <Animated.View 
                key={`${item.id}-${idx}`} 
                entering={FadeInDown.delay(idx * 50)} 
                exiting={FadeOutLeft}
                layout={Layout.springify()}
                style={styles.itemCard}
              >
                <Image source={{ uri: item.imageUrl }} style={styles.itemImage} contentFit="cover" />
                <View style={styles.itemContent}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Pressable onPress={() => handleRemove(item.id)}>
                       <Trash2 size={16} color="#EF4444" />
                    </Pressable>
                  </View>
                  
                  {/* Customizations display */}
                  <View style={styles.modifierRow}>
                    {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                      <Text style={styles.modifierText}>{item.selectedModifiers.join(', ')}</Text>
                    )}
                    {item.spiceLevel && (
                      <View style={styles.spiceBadge}>
                        <Flame size={12} color="#EF4444" />
                        <Text style={styles.spiceText}>{item.spiceLevel === 1 ? 'Mild' : item.spiceLevel === 2 ? 'Med' : 'Hot'}</Text>
                      </View>
                    )}
                  </View>

                  {item.instructions && (
                    <View style={styles.instructionNote}>
                      <MessageSquareText size={12} color="#9CA3AF" />
                      <Text style={styles.instructionText} numberOfLines={1}>{item.instructions}</Text>
                    </View>
                  )}

                  <View style={styles.itemFooter}>
                    <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
                    <View style={styles.qtyControls}>
                      <Pressable onPress={() => handleUpdateQty(item, -1)} style={styles.qtyBtn}>
                        <Minus size={16} color="#1A1A1A" />
                      </Pressable>
                      <Text style={styles.qtyText}>{item.quantity}</Text>
                      <Pressable onPress={() => handleUpdateQty(item, 1)} style={styles.qtyBtn}>
                        <Plus size={16} color="#1A1A1A" />
                      </Pressable>
                    </View>
                  </View>
                </View>
              </Animated.View>
            ))}

            {/* AI SUGGESTION */}
            <View style={styles.aiSuggestionCard}>
               <View style={styles.aiInfo}>
                  <Text style={styles.aiLabel}>BISTRO SUGGESTION</Text>
                  <Text style={styles.aiTitle}>Pair with Truffle Fries?</Text>
                  <Text style={styles.aiText}>Commonly ordered with your selection.</Text>
               </View>
               <Pressable style={styles.aiAddBtn}>
                  <Plus size={20} color="#C1A87D" />
               </Pressable>
            </View>
          </View>
        )}
        
        {items.length > 0 && (
          <View style={styles.summarySection}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>${delivery.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Estimated Tax</Text>
              <Text style={styles.summaryValue}>${taxes.toFixed(2)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
            </View>
          </View>
        )}

        <View style={{ height: 160 }} />
      </ScrollView>

      {items.length > 0 && (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <Pressable 
            style={styles.checkoutBtn} 
            onPress={() => router.push('/checkout')}
          >
            <CreditCard size={20} color="#FFF" />
            <Text style={styles.checkoutBtnText}>Checkout • ${total.toFixed(2)}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F5F0',
  },
  safeHeader: {
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    fontFamily: 'serif',
  },
  moreButton: {
    backgroundColor: 'rgba(193, 168, 125, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  itemCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C1A87D',
  },
  scrollContent: {
    padding: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    fontFamily: 'serif',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
    marginBottom: 30,
  },
  browseButton: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  browseButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  itemList: {
    gap: 16,
    marginBottom: 32,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 12,
    gap: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
  },
  itemContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
    marginRight: 8,
  },
  modifierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  modifierText: {
    fontSize: 12,
    color: '#9CA3AF',
    flex: 1,
  },
  spiceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 2,
  },
  spiceText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EF4444',
  },
  instructionNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F9FAFB',
    padding: 6,
    borderRadius: 8,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 11,
    color: '#6B7280',
    flex: 1,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#C1A87D',
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 2,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: 8,
    color: '#1A1A1A',
  },
  aiSuggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(193, 168, 125, 0.05)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(193, 168, 125, 0.1)',
    borderStyle: 'dashed',
  },
  aiInfo: {
    flex: 1,
  },
  aiLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#C1A87D',
    letterSpacing: 1,
    marginBottom: 4,
  },
  aiTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  aiText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  aiAddBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(193, 168, 125, 0.2)',
  },
  summarySection: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    color: '#6B7280',
    fontSize: 14,
  },
  summaryValue: {
    color: '#1A1A1A',
    fontWeight: '700',
    fontSize: 14,
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
  checkoutBtn: {
    backgroundColor: '#1A1A1A',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  checkoutBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  }
});
