import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, ArrowRight, ChefHat, Plus, Minus, ShoppingBag } from 'lucide-react-native';
import { useFavoritesStore } from '../../frontend/stores/useFavoritesStore';
import { useCartStore } from '../../frontend/stores/useCartStore';
import { menuData, MenuItem } from '../../frontend/data/menu';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';

const QuantityControls = ({ item }: { item: MenuItem }) => {
  const { items, addItem, updateItemQuantity } = useCartStore();
  const cartItem = items.find(i => i.id === item.id);
  const qty = cartItem?.quantity || 0;

  const handleAdd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addItem(item);
  };

  const handleRemove = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (qty > 0) {
      updateItemQuantity(item.id, qty - 1);
    }
  };

  if (qty === 0) {
    return (
      <Pressable style={styles.addBtnSmall} onPress={handleAdd}>
        <Plus size={18} color="#FFF" />
      </Pressable>
    );
  }

  return (
    <Animated.View layout={Layout.springify()} style={styles.qtyContainer}>
      <Pressable style={styles.qtyBtn} onPress={handleRemove}>
        <Minus size={14} color="#1A1A1A" />
      </Pressable>
      <Text style={styles.qtyText}>{qty}</Text>
      <Pressable style={styles.qtyBtn} onPress={handleAdd}>
        <Plus size={14} color="#1A1A1A" />
      </Pressable>
    </Animated.View>
  );
};

export default function FavoritesScreen() {
  const router = useRouter();
  const { favoriteIds, toggleFavorite } = useFavoritesStore();
  
  const favoriteItems = menuData.filter(item => favoriteIds.includes(item.id));
  const [imageErrors, setImageErrors] = React.useState<Record<string, boolean>>({});

  const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800';

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Favorites</Text>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
        >
          {favoriteItems.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Heart size={48} color="#D1D5DB" />
              </View>
              <Text style={styles.emptyTitle}>Nothing here yet</Text>
              <Text style={styles.emptySubtitle}>Tap the heart icon on any dish to save it to your favorites.</Text>
              <Pressable style={styles.browseBtn} onPress={() => router.push('/')}>
                 <Text style={styles.browseBtnText}>Explore Menu</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.grid}>
              {favoriteItems.map((item, idx) => (
                <Animated.View 
                  key={item.id} 
                  entering={FadeInDown.delay(idx * 100)}
                  layout={Layout.springify()}
                  style={styles.card}
                >
                  <Pressable onPress={() => router.push({ pathname: '/food-details/[id]', params: { id: item.id } })}>
                    <Image 
                      source={{ uri: imageErrors[item.id] ? DEFAULT_IMAGE : item.imageUrl }} 
                      style={styles.cardImg} 
                      contentFit="cover" 
                      onError={() => setImageErrors(prev => ({ ...prev, [item.id]: true }))}
                    />
                    <Pressable 
                      style={styles.unfavBtn} 
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        toggleFavorite(item.id);
                      }}
                    >
                      <Heart size={18} color="#EF4444" fill="#EF4444" />
                    </Pressable>
                    <View style={styles.cardContent}>
                      <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.cardCategory}>{item.category}</Text>
                      <View style={styles.cardFooter}>
                        <Text style={styles.cardPrice}>${item.price.toFixed(2)}</Text>
                        <QuantityControls item={item} />
                      </View>
                    </View>
                  </Pressable>
                </Animated.View>
              ))}
            </View>
          )}
          <View style={{ height: 160 }} />
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
    paddingHorizontal: 24,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    fontFamily: 'serif',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
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
    marginBottom: 30,
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  card: {
    width: (Dimensions.get('window').width - 64) / 2,
    backgroundColor: '#FFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardImg: {
    width: '100%',
    height: 140,
  },
  unfavBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  cardContent: {
    padding: 12,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  cardCategory: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  cardPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#C1A87D',
  },
  addBtnSmall: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 2,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  qtyBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  qtyText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1A1A1A',
    minWidth: 16,
    textAlign: 'center',
  },
  cartBarContainer: {
    position: 'absolute',
    bottom: 90, // Position above the tab bar
    left: 20,
    right: 20,
    zIndex: 100,
  },
  cartBar: {
    backgroundColor: '#1A1A1A',
    height: 64,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  cartBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    fontSize: 12,
  },
  cartBarLabel: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '600',
  },
  cartBarPrice: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  cartBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

