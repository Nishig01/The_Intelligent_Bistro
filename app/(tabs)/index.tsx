import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChefHat, Search, SlidersHorizontal, Sparkles, Plus, Minus, ShoppingCart, ArrowRight, Star, Clock, Heart, X, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useCartStore } from '../../frontend/stores/useCartStore';
import { useAuthStore } from '../../frontend/stores/useAuthStore';
import { useFavoritesStore } from '../../frontend/stores/useFavoritesStore';
import { menuData, MenuItem } from '../../frontend/data/menu';
import { Skeleton } from '../../frontend/components/Skeleton';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import Animated, { 
  FadeInDown, 
  FadeInRight, 
  FadeIn, 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  Layout,
  interpolate,
  Extrapolation
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

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
        <Minus size={16} color="#1A1A1A" />
      </Pressable>
      <Text style={styles.qtyText}>{qty}</Text>
      <Pressable style={styles.qtyBtn} onPress={handleAdd}>
        <Plus size={16} color="#1A1A1A" />
      </Pressable>
    </Animated.View>
  );
};

export default function Home() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeDietary, setActiveDietary] = useState<string | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({});
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 150);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const { user, isAuthenticated } = useAuthStore();
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  
  const categories = ['All', 'Starters', 'Mains', 'Sides', 'Desserts', 'Drinks'];
  const dietaryFilters = ['Vegan', 'Vegetarian', 'Gluten-Free', 'Dairy-Free', 'High Protein'];
  
  const featuredItems = menuData.filter(item => item.id === 'wagyu_burger' || item.id === 'wild_mushroom_risotto');

  const filteredMenu = menuData.filter(item => {
    const query = debouncedSearchQuery.toLowerCase().trim();
    if (query) {
      // Fuzzy matching across multiple fields
      const searchString = `${item.name} ${item.category} ${item.dietary?.join(' ')} ${item.description}`.toLowerCase();
      // Partial matching logic
      const words = query.split(' ');
      const matchesSearch = words.every(word => searchString.includes(word));
      if (!matchesSearch) return false;
    }
    
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesDietary = !activeDietary || (item.dietary && item.dietary.includes(activeDietary));
    return matchesCategory && matchesDietary;
  });

  const handleItemPress = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: "/food-details/[id]",
      params: { id }
    });
  }, [router]);

  const scrollToTop = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const onImageLoad = (id: string) => {
    setImagesLoaded(prev => ({ ...prev, [id]: true }));
  };

  const onImageError = (id: string) => {
     setImageErrors(prev => ({ ...prev, [id]: true }));
     setImagesLoaded(prev => ({ ...prev, [id]: true })); // Stop showing skeleton
  };

  const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800';

  const scrollY = useSharedValue(0);

  const onScroll = (event: any) => {
    scrollY.value = event.nativeEvent.contentOffset.y;
  };

  const welcomeAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: withSpring(scrollY.value > 20 ? 0 : 80, { damping: 20, stiffness: 90 }),
      opacity: withSpring(scrollY.value > 20 ? 0 : 1),
      transform: [{ translateY: withSpring(scrollY.value > 20 ? -20 : 0) }],
      marginBottom: withSpring(scrollY.value > 20 ? 0 : 10),
      overflow: 'hidden',
    };
  });

  const searchAnimatedStyle = useAnimatedStyle(() => {
    const paddingH = interpolate(scrollY.value, [0, 80], [16, 12], Extrapolation.CLAMP);
    const paddingV = interpolate(scrollY.value, [0, 80], [15, 8], Extrapolation.CLAMP);
    
    return {
      paddingHorizontal: paddingH,
      paddingVertical: paddingV,
    };
  });

  const searchBarAnimatedStyle = useAnimatedStyle(() => {
    const height = interpolate(scrollY.value, [0, 80], [56, 44], Extrapolation.CLAMP);
    const borderRadius = interpolate(scrollY.value, [0, 80], [20, 12], Extrapolation.CLAMP);
    
    return {
      height,
      borderRadius,
    };
  });

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Sticky Header with Logo */}
        <View style={styles.stickyHeader}>
           <Pressable onPress={scrollToTop} style={styles.headerLeft}>
              <View style={styles.logoBadge}>
                 <ChefHat size={20} color="#C1A87D" />
              </View>
              <Text style={styles.brandName}>Bistro</Text>
           </Pressable>
           <View style={styles.headerRight}>
              <Pressable style={styles.iconBtn} onPress={() => router.push('/(tabs)/profile')}>
                 {user?.avatar ? (
                   <Image 
                      source={{ uri: user.avatar }} 
                      style={styles.avatarMini}
                   />
                 ) : (
                   <View style={[styles.avatarMini, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#E5E7EB' }]}>
                     <User size={16} color="#6B7280" />
                   </View>
                 )}
              </Pressable>
           </View>
        </View>

        <Animated.ScrollView 
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={[1]}
          contentContainerStyle={styles.scrollContent}
          onScroll={onScroll}
          scrollEventThrottle={16}
        >
          {/* Greeting */}
          <Animated.View style={[styles.welcomeSection, welcomeAnimatedStyle]}>
            <Text style={styles.greeting}>Good Evening,</Text>
            <Text style={styles.userName}>{isAuthenticated ? user?.name?.split(' ')[0] : 'Guest'} ✨</Text>
          </Animated.View>

          {/* Search Bar & Filters (Sticky) */}
          <View style={styles.searchWrapper}>
            <Animated.View style={[styles.searchContainer, searchAnimatedStyle]}>
              <Animated.View style={[styles.searchBar, searchBarAnimatedStyle]}>
                <Search size={20} color="#9CA3AF" />
                <TextInput 
                  placeholder="Craving something special?"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={styles.searchInput}
                  placeholderTextColor="#9CA3AF"
                />
                {searchQuery.length > 0 && (
                  <Pressable 
                    onPress={() => setSearchQuery('')}
                    style={styles.clearBtn}
                  >
                    <X size={16} color="#FFF" />
                  </Pressable>
                )}
                <Pressable style={styles.filterBtn}>
                   <SlidersHorizontal size={18} color="#1A1A1A" />
                </Pressable>
              </Animated.View>
            </Animated.View>

            <View style={styles.filtersWrapper}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
                {categories.map(cat => (
                  <Pressable 
                    key={cat} 
                    onPress={() => {
                      Haptics.selectionAsync();
                      setActiveCategory(cat);
                    }}
                    style={[styles.tab, activeCategory === cat && styles.tabActive]}
                  >
                    <Text style={[styles.tabText, activeCategory === cat && styles.tabTextActive]}>{cat}</Text>
                  </Pressable>
                ))}
              </ScrollView>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dietaryScroll}>
                {dietaryFilters.map(diet => (
                  <Pressable 
                    key={diet} 
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setActiveDietary(activeDietary === diet ? null : diet);
                    }}
                    style={[styles.dietaryBtn, activeDietary === diet && styles.dietaryBtnActive]}
                  >
                    <Text style={[styles.dietaryBtnText, activeDietary === diet && styles.dietaryBtnTextActive]}>{diet}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Featured Horizontal Scroll */}
          {!searchQuery && activeCategory === 'All' && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Chef's Signature</Text>
                <Pressable><Text style={styles.seeAll}>See All</Text></Pressable>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredScroll}>
                {featuredItems.map((item, idx) => (
                  <Animated.View 
                    key={item.id} 
                    entering={FadeInRight.delay(idx * 100)}
                  >
                    <Pressable style={styles.featuredCard} onPress={() => handleItemPress(item.id)}>
                      <View style={styles.featuredImageContainer}>
                        {!imagesLoaded[item.id] && <Skeleton width="100%" height="100%" borderRadius={0} />}
                        <Image 
                          source={{ uri: imageErrors[item.id] ? DEFAULT_IMAGE : item.imageUrl }} 
                          style={styles.featuredImage}
                          contentFit="cover"
                          transition={300}
                          onLoad={() => onImageLoad(item.id)}
                          onError={() => onImageError(item.id)}
                        />
                        <Pressable 
                          style={styles.favBtn} 
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            toggleFavorite(item.id);
                          }}
                        >
                          <Heart size={20} color={isFavorite(item.id) ? "#EF4444" : "#FFF"} fill={isFavorite(item.id) ? "#EF4444" : "transparent"} />
                        </Pressable>
                      </View>
                      <View style={styles.featuredContent}>
                        <View style={styles.featuredRow}>
                          <View style={styles.flex1}>
                            <Text style={styles.featuredName}>{item.name}</Text>
                            <View style={styles.badgeLine}>
                               <Star size={12} color="#C1A87D" fill="#C1A87D" />
                               <Text style={styles.ratingText}>4.9</Text>
                               <Text style={styles.dot}>•</Text>
                               <Clock size={12} color="#6B7280" />
                               <Text style={styles.ratingText}>25 min</Text>
                            </View>
                            <Text style={styles.featuredPrice}>${item.price.toFixed(2)}</Text>
                          </View>
                          <QuantityControls item={item} />
                        </View>
                      </View>
                    </Pressable>
                  </Animated.View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Menu List */}
          <View style={styles.menuSection}>
            <View style={styles.sectionHeader}>
               <Text style={styles.sectionTitle}>Explore Menu</Text>
            </View>
            
            {filteredMenu.length === 0 ? (
              <Animated.View entering={FadeIn} style={styles.emptySearch}>
                <Search size={48} color="#D1D5DB" />
                <Text style={styles.emptySearchTitle}>No items found</Text>
                <Text style={styles.emptySearchSubtitle}>
                  We couldn't find anything matching "{searchQuery}". Try a different keyword or category.
                </Text>
                <Pressable 
                  style={styles.clearSearchBtn}
                  onPress={() => setSearchQuery('')}
                >
                  <Text style={styles.clearSearchBtnText}>Clear Search</Text>
                </Pressable>
              </Animated.View>
            ) : (
              filteredMenu.map((item, idx) => (
                <Animated.View 
                  key={item.id} 
                  entering={FadeInDown.delay(idx * 50)}
                >
                  <Pressable style={styles.menuItem} onPress={() => handleItemPress(item.id)}>
                    <View style={styles.menuInfo}>
                      <Text style={styles.menuName}>{item.name}</Text>
                      <Text style={styles.menuDesc} numberOfLines={2}>{item.description}</Text>
                      <View style={styles.priceRow}>
                        <Text style={styles.menuPrice}>${item.price.toFixed(2)}</Text>
                        {item.dietary && item.dietary.length > 0 && (
                          <View style={styles.dietaryBadge}>
                            <Text style={styles.dietaryText}>{item.dietary[0]}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <View style={styles.menuImageContainer}>
                      {!imagesLoaded[item.id] && <Skeleton width={100} height={100} borderRadius={18} />}
                      <Image 
                        source={{ uri: imageErrors[item.id] ? DEFAULT_IMAGE : item.imageUrl }} 
                        style={styles.menuImage}
                        contentFit="cover"
                        transition={200}
                        onLoad={() => onImageLoad(item.id)}
                        onError={() => onImageError(item.id)}
                      />
                      <Pressable 
                        style={styles.menuFavBtn} 
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          toggleFavorite(item.id);
                        }}
                      >
                        <Heart 
                          size={14} 
                          color={isFavorite(item.id) ? "#EF4444" : "#FFF"} 
                          fill={isFavorite(item.id) ? "#EF4444" : "transparent"} 
                        />
                      </Pressable>
                      <View style={styles.menuItemQtyOverlay}>
                         <QuantityControls item={item} />
                      </View>
                    </View>
                  </Pressable>
                </Animated.View>
              ))
            )}
          </View>
          <View style={{ height: 160 }} />
        </Animated.ScrollView>
      </SafeAreaView>

      {/* Floating AI Concierge Button */}
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
  stickyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F5F0',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    fontFamily: 'serif',
    letterSpacing: -0.5,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  avatarMini: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    padding: 2,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  welcomeSection: {
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 5,
  },
  greeting: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'serif',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'serif',
  },
  searchWrapper: {
    backgroundColor: '#F8F5F0',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    marginLeft: 10,
    color: '#1A1A1A',
    outlineWidth: 0,
  },
  clearBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#9CA3AF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  filterBtn: {
    padding: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  filtersWrapper: {
    paddingBottom: 5,
  },
  tabsScroll: {
    paddingHorizontal: 16,
    paddingTop: 5,
    paddingBottom: 12,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 99,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tabActive: {
    backgroundColor: '#1A1A1A',
    borderColor: '#1A1A1A',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#FFF',
  },
  dietaryScroll: {
    paddingHorizontal: 16,
    paddingBottom: 15,
    gap: 8,
  },
  dietaryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dietaryBtnActive: {
    backgroundColor: 'rgba(193, 168, 125, 0.1)',
    borderColor: '#C1A87D',
  },
  dietaryBtnText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  dietaryBtnTextActive: {
    color: '#C1A87D',
  },
  section: {
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'serif',
  },
  seeAll: {
    color: '#C1A87D',
    fontWeight: '600',
    fontSize: 14,
  },
  featuredScroll: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  featuredCard: {
    width: 240,
    marginHorizontal: 6,
    borderRadius: 20,
    backgroundColor: '#FFF',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 4,
  },
  featuredImageContainer: {
    width: '100%',
    height: 180,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  favBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredContent: {
    padding: 16,
  },
  featuredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  featuredName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  featuredPrice: {
    fontSize: 16,
    color: '#C1A87D',
    fontWeight: '800',
    marginTop: 4,
  },
  addBtnSmall: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 4,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  qtyText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
    minWidth: 20,
    textAlign: 'center',
  },
  flex1: { flex: 1, marginRight: 10 },
  menuSection: {
    marginTop: 15,
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginVertical: 6,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  menuInfo: {
    flex: 1,
  },
  menuName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  menuDesc: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
    marginBottom: 8,
  },
  menuPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  menuImageContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  menuFavBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  menuItemQtyOverlay: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  badgeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
    marginBottom: 2,
  },
  ratingText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  dot: {
    fontSize: 12,
    color: '#D1D5DB',
    marginHorizontal: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dietaryBadge: {
    backgroundColor: 'rgba(193, 168, 125, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  dietaryText: {
    fontSize: 10,
    color: '#C1A87D',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  emptySearch: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    backgroundColor: '#FFF',
    borderRadius: 24,
    marginTop: 10,
    paddingHorizontal: 30,
  },
  emptySearchTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    fontFamily: 'serif',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySearchSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  clearSearchBtn: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  clearSearchBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  }
});
