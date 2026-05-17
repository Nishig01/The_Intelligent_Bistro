import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useCartStore } from '../stores/useCartStore';
import { ArrowRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function CartIndicator() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getTotalItems, getTotalPrice } = useCartStore();
  
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  if (totalItems === 0) return null;

  // Calculate bottom position based on tab bar height (64) + spacing (16) + safe area
  const bottomPosition = (Platform.OS === 'ios' ? insets.bottom : 20) + 64 + 16;

  return (
    <Animated.View 
      entering={FadeInDown} 
      style={[styles.cartBarContainer, { bottom: bottomPosition }]}
    >
      <Pressable 
        style={styles.cartBar} 
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push('/cart' as any);
        }}
      >
        <View style={styles.cartBarLeft}>
          <View style={styles.cartItemCount}>
            <Text style={styles.cartItemCountText}>{totalItems}</Text>
          </View>
          <View>
            <Text style={styles.cartBarLabel}>View Basket</Text>
            <Text style={styles.cartBarPrice}>Total: ${totalPrice.toFixed(2)}</Text>
          </View>
        </View>
        <View style={styles.cartBarRight}>
          <Text style={styles.checkoutText}>View Cart</Text>
          <ArrowRight size={20} color="#FFF" />
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cartBarContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  cartBar: {
    backgroundColor: '#1A1A1A',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  cartBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cartItemCount: {
    backgroundColor: '#C1A87D',
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartItemCountText: {
    color: '#1A1A1A',
    fontWeight: '800',
    fontSize: 13,
  },
  cartBarLabel: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '600',
  },
  cartBarPrice: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  cartBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkoutText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  }
});
