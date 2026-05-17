import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Minus, Plus, ShoppingBag, Star, Flame, Clock, Heart } from 'lucide-react-native';
import { menuData } from '../../frontend/data/menu';
import { useCartStore } from '../../frontend/stores/useCartStore';
import { useFavoritesStore } from '../../frontend/stores/useFavoritesStore';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

export default function FoodDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addItem } = useCartStore();
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  
  const item = menuData.find(m => m.id === id);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [instructions, setInstructions] = useState('');
  const [spiceLevel, setSpiceLevel] = useState(1); // 1 to 3
  const [imageError, setImageError] = useState(false);

  if (!item) return <View><Text>Item not found</Text></View>;

  const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800';

  const handleAddToCart = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addItem(
      item, 
      quantity, 
      selectedOptions, 
      spiceLevel,
      instructions
    );
    router.back();
  };

  const toggleOption = (option: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter(o => o !== option));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: imageError ? DEFAULT_IMAGE : item.imageUrl }} 
            style={styles.image}
            contentFit="cover"
            onError={() => setImageError(true)}
          />
          <BlurView intensity={20} style={[styles.backButton, { top: insets.top + 10 }]}>
            <Pressable onPress={() => router.back()}>
              <ChevronLeft size={24} color="#FFF" />
            </Pressable>
          </BlurView>
          <BlurView intensity={20} style={[styles.favButton, { top: insets.top + 10 }]}>
            <Pressable onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              toggleFavorite(item.id);
            }}>
              <Heart 
                size={22} 
                color={isFavorite(item.id) ? "#EF4444" : "#FFF"} 
                fill={isFavorite(item.id) ? "#EF4444" : "transparent"} 
              />
            </Pressable>
          </BlurView>
        </View>

        <View style={styles.content}>
          <Animated.View entering={FadeInDown.delay(100)} style={styles.headerRow}>
            <View style={styles.flex1}>
              <Text style={styles.name}>{item.name}</Text>
              <View style={styles.badgeRow}>
                <View style={styles.badge}>
                  <Flame size={14} color="#C1A87D" />
                  <Text style={styles.badgeText}>{item.calories} kcal</Text>
                </View>
                <View style={styles.badge}>
                  <Clock size={14} color="#C1A87D" />
                  <Text style={styles.badgeText}>15-20 min</Text>
                </View>
                <View style={styles.badge}>
                  <Star size={14} color="#C1A87D" />
                  <Text style={styles.badgeText}>4.9 (120+)</Text>
                </View>
              </View>
            </View>
            <Text style={styles.price}>${item.price.toFixed(2)}</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
            <Text style={styles.sectionTitle}>Details</Text>
            <Text style={styles.description}>{item.description}</Text>
          </Animated.View>

          {item.options && item.options.length > 0 && (
            <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
              <Text style={styles.sectionTitle}>Customizations</Text>
              <View style={styles.optionsGrid}>
                {item.options.map(option => (
                  <Pressable 
                    key={option} 
                    onPress={() => toggleOption(option)}
                    style={[
                      styles.optionChip, 
                      selectedOptions.includes(option) && styles.optionChipActive
                    ]}
                  >
                    <Text style={[
                      styles.optionText, 
                      selectedOptions.includes(option) && styles.optionTextActive
                    ]}>{option}</Text>
                  </Pressable>
                ))}
              </View>
            </Animated.View>
          )}

          <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
            <Text style={styles.sectionTitle}>Spice Level</Text>
            <View style={styles.spiceRow}>
              {[1, 2, 3].map(level => (
                <Pressable 
                  key={level} 
                  onPress={() => setSpiceLevel(level)}
                  style={[styles.spiceButton, spiceLevel >= level && styles.spiceButtonActive]}
                >
                  <Flame size={20} color={spiceLevel >= level ? "#FFF" : "#D1D5DB"} />
                </Pressable>
              ))}
              <Text style={styles.spiceLabel}>
                {spiceLevel === 1 ? 'Mild' : spiceLevel === 2 ? 'Medium' : 'Hot'}
              </Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(500)} style={styles.section}>
            <Text style={styles.sectionTitle}>Cooking Instructions</Text>
            <View style={styles.instructionsContainer}>
              <TextInput
                style={styles.instructionsInput}
                placeholder="e.g. No onions, extra spicy, etc."
                placeholderTextColor="#9CA3AF"
                multiline
                value={instructions}
                onChangeText={setInstructions}
                maxLength={200}
              />
              <Text style={styles.charCount}>{instructions.length}/200</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(600)} style={styles.section}>
            <View style={styles.suggestionHeader}>
               <Text style={styles.sectionTitle}>Pair it with</Text>
               <View style={styles.aiBadge}>
                  <Star size={10} color="#FFF" fill="#FFF" />
                  <Text style={styles.aiBadgeText}>AI CHOICE</Text>
               </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionScroll}>
               {[
                 { id: 's1', name: 'Truffle Fries', price: 6.50, img: 'https://images.unsplash.com/photo-1630384065922-1aeabb805627?auto=format&fit=crop&q=80&w=200' },
                 { id: 's2', name: 'Craft IPA', price: 8.00, img: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&q=80&w=200' },
                 { id: 's3', name: 'Garlic Aioli', price: 1.50, img: 'https://images.unsplash.com/photo-1610450537449-700938466635?auto=format&fit=crop&q=80&w=200' }
               ].map((s, idx) => (
                 <Pressable key={s.id} style={styles.suggestionCard}>
                    <Image 
                      source={{ uri: s.img }} 
                      style={styles.suggestionImg} 
                      contentFit="cover"
                    />
                    <View style={styles.suggestionInfo}>
                       <Text style={styles.suggestionName}>{s.name}</Text>
                       <Text style={styles.suggestionPrice}>+${s.price.toFixed(2)}</Text>
                    </View>
                 </Pressable>
               ))}
            </ScrollView>
          </Animated.View>

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* Footer / Actions */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <View style={styles.quantityControls}>
          <Pressable 
            style={styles.quantityBtn} 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setQuantity(Math.max(1, quantity - 1));
            }}
          >
            <Minus size={20} color="#1A1A1A" />
          </Pressable>
          <Text style={styles.quantityText}>{quantity}</Text>
          <Pressable 
            style={styles.quantityBtn} 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setQuantity(quantity + 1);
            }}
          >
            <Plus size={20} color="#1A1A1A" />
          </Pressable>
        </View>
        <Pressable style={styles.addToCartBtn} onPress={handleAddToCart}>
          <ShoppingBag size={20} color="#FFF" />
          <Text style={styles.addToCartText}>Add to Cart</Text>
          <View style={styles.priceTag}>
            <Text style={styles.priceTagText}>${(item.price * quantity).toFixed(2)}</Text>
          </View>
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
  imageContainer: {
    width: '100%',
    height: 350,
    backgroundColor: '#E5E7EB',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  favButton: {
    position: 'absolute',
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  content: {
    padding: 24,
    backgroundColor: '#F8F5F0',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  flex1: { flex: 1 },
  name: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    fontFamily: 'serif',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  badgeText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  price: {
    fontSize: 24,
    fontWeight: '800',
    color: '#C1A87D',
  },
  section: {
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 24,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  optionChipActive: {
    backgroundColor: '#1A1A1A',
    borderColor: '#1A1A1A',
  },
  optionText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  optionTextActive: {
    color: '#FFF',
  },
  spiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  spiceButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  spiceButtonActive: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  spiceLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  instructionsContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  instructionsInput: {
    fontSize: 14,
    color: '#1A1A1A',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiBadge: {
    backgroundColor: '#C1A87D',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  aiBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  suggestionScroll: {
    gap: 12,
    paddingRight: 24,
  },
  suggestionCard: {
    width: 140,
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  suggestionImg: {
    width: '100%',
    height: 80,
    backgroundColor: '#F3F4F6',
  },
  suggestionInfo: {
    padding: 10,
  },
  suggestionName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  suggestionPrice: {
    fontSize: 12,
    color: '#C1A87D',
    fontWeight: '700',
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 4,
  },
  quantityBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 12,
    color: '#1A1A1A',
  },
  addToCartBtn: {
    flex: 1,
    height: 56,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  addToCartText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  priceTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priceTagText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  }
});
