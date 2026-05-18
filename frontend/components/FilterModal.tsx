import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { ArrowDown, ArrowUp, SlidersHorizontal, Star, X } from 'lucide-react-native';
import { forwardRef, useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type SortOption = 'Popularity' | 'Price: Low-High' | 'Price: High-Low';
export type PriceOption = 'All' | 'Low' | 'High';

export type FilterState = {
  category: string;
  dietary: string | null;
  priceType: PriceOption;
  rating: number;
  sort: SortOption;
};

interface FilterModalProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  onClose: () => void;
}

export const FilterModal = forwardRef<BottomSheetModal, FilterModalProps>(({ filters, setFilters, onClose }, ref) => {
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ['80%'], []);
  const ScrollContainer = Platform.OS === 'web' ? ScrollView : BottomSheetScrollView;

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
      />
    ),
    []
  );

  const updateFilter = (key: keyof FilterState, value: any) => {
    Haptics.selectionAsync();
    setFilters({ ...filters, [key]: value });
  };

  const resetFilters = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setFilters({
      category: 'All',
      dietary: null,
      priceType: 'All',
      rating: 0,
      sort: 'Popularity'
    });
    onClose();
  };

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.modalBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <SlidersHorizontal size={20} color="#1A1A1A" />
          <Text style={styles.title}>Menu Filters</Text>
        </View>
        <Pressable onPress={onClose} style={styles.closeBtn}>
          <X size={20} color="#9CA3AF" />
        </Pressable>
      </View>

      <ScrollContainer contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}>
        
        {/* Sort Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sort By</Text>
          <View style={styles.chipsContainer}>
            {(['Popularity', 'Price: Low-High', 'Price: High-Low'] as SortOption[]).map((option) => (
              <Pressable
                key={option}
                onPress={() => updateFilter('sort', option)}
                style={[styles.chip, filters.sort === option && styles.chipActive]}
              >
                {option === 'Popularity' && <Star size={14} color={filters.sort === option ? '#1A1A1A' : '#6B7280'} />}
                {option === 'Price: Low-High' && <ArrowUp size={14} color={filters.sort === option ? '#1A1A1A' : '#6B7280'} />}
                {option === 'Price: High-Low' && <ArrowDown size={14} color={filters.sort === option ? '#1A1A1A' : '#6B7280'} />}
                <Text style={[styles.chipText, filters.sort === option && styles.chipTextActive]}>{option}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category Type</Text>
          <View style={styles.chipsContainer}>
            {['All', 'Starters', 'Mains', 'Sides', 'Desserts', 'Drinks'].map((cat) => (
              <Pressable
                key={cat}
                onPress={() => updateFilter('category', cat)}
                style={[styles.chip, filters.category === cat && styles.chipActive]}
              >
                <Text style={[styles.chipText, filters.category === cat && styles.chipTextActive]}>{cat}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Price Filtering Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Category</Text>
          <View style={styles.chipsContainer}>
            {[
              { label: 'All Prices', value: 'All' },
              { label: 'Low Price (Under $15)', value: 'Low' },
              { label: 'High Price ($15 & Above)', value: 'High' }
            ].map((option) => (
              <Pressable
                key={option.value}
                onPress={() => updateFilter('priceType', option.value as PriceOption)}
                style={[styles.chip, filters.priceType === option.value && styles.chipActive]}
              >
                <Text style={[styles.chipText, filters.priceType === option.value && styles.chipTextActive]}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Dietary Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dietary Preferences</Text>
          <View style={styles.chipsContainer}>
            {['Vegan', 'Vegetarian', 'Gluten-Free', 'Dairy-Free', 'High Protein'].map((diet) => (
              <Pressable
                key={diet}
                onPress={() => updateFilter('dietary', filters.dietary === diet ? null : diet)}
                style={[styles.chip, filters.dietary === diet && styles.chipActive]}
              >
                <Text style={[styles.chipText, filters.dietary === diet && styles.chipTextActive]}>{diet}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Minimum Rating Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Minimum Rating</Text>
          <View style={styles.chipsContainer}>
            {[4.5, 4.0, 3.5].map((rating) => (
              <Pressable
                key={rating}
                onPress={() => updateFilter('rating', filters.rating === rating ? 0 : rating)}
                style={[styles.chip, filters.rating === rating && styles.chipActive]}
              >
                <Star 
                  size={14} 
                  color={filters.rating === rating ? '#1A1A1A' : '#F59E0B'} 
                  fill={filters.rating === rating ? '#1A1A1A' : '#F59E0B'} 
                />
                <Text style={[styles.chipText, filters.rating === rating && styles.chipTextActive]}>{rating}+</Text>
              </Pressable>
            ))}
          </View>
        </View>

      </ScrollContainer>

      {/* Footer Actions */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <Pressable onPress={resetFilters} style={styles.resetBtn}>
          <Text style={styles.resetBtnText}>Reset</Text>
        </Pressable>
        <Pressable onPress={onClose} style={styles.applyBtn}>
          <Text style={styles.applyBtnText}>Apply Filters</Text>
        </Pressable>
      </View>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  modalBackground: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
  },
  handleIndicator: {
    backgroundColor: '#D1D5DB',
    width: 40,
    height: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  closeBtn: {
    padding: 8,
    marginRight: -8,
  },
  content: {
    padding: 24,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 14,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 6,
  },
  chipActive: {
    backgroundColor: '#C1A87D',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  chipTextActive: {
    color: '#1A1A1A',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
    gap: 16,
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
  },
  applyBtn: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
