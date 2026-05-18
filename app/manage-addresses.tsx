import React, { useState, useRef, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Plus, MapPin, Home, Briefcase, MoreHorizontal, Trash2, CheckCircle2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAddressStore, Address, AddressType } from '../frontend/stores/useAddressStore';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInRight, FadeOutLeft, FadeInDown } from 'react-native-reanimated';
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';

export default function ManageAddresses() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addresses, addAddress, deleteAddress, setDefaultAddress, updateAddress, syncAddresses } = useAddressStore();
  
  useEffect(() => {
    const unsubscribe = syncAddresses();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [syncAddresses]);
  
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['85%', '95%'], []);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Form State
  const [label, setLabel] = useState<AddressType>('Home');
  const [fullName, setFullName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const resetForm = () => {
    setLabel('Home');
    setFullName('');
    setStreet('');
    setCity('');
    setState('');
    setZipCode('');
    setIsDefault(addresses.length === 0);
    setIsEditing(false);
    setEditingId(null);
    setErrors({});
  };

  const handleAddPress = () => {
    resetForm();
    bottomSheetModalRef.current?.present();
  };

  const handleEditPress = (address: Address) => {
    setLabel(address.label);
    setFullName(address.fullName);
    setStreet(address.street);
    setCity(address.city);
    setState(address.state);
    setZipCode(address.zipCode);
    setIsDefault(address.isDefault);
    setIsEditing(true);
    setEditingId(address.id);
    bottomSheetModalRef.current?.present();
  };

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!street.trim()) newErrors.street = 'Street address is required';
    if (!city.trim()) newErrors.city = 'City is required';
    if (!state.trim()) newErrors.state = 'State is required';
    if (!zipCode.trim()) newErrors.zipCode = 'Zip code is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setErrors({});

    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Simulate real backend delay for production feel
    await new Promise(resolve => setTimeout(resolve, 800));

    const payload = { label, fullName, street, city, state, zipCode, isDefault };
    
    if (isEditing && editingId) {
      updateAddress(editingId, payload);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      addAddress(payload);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    setIsSaving(false);
    bottomSheetModalRef.current?.dismiss();
    bottomSheetModalRef.current?.close();
  };

  const handleDelete = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    deleteAddress(id);
  };

  const renderBackdrop = (props: any) => (
    <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
  );

  const getIcon = (type: AddressType) => {
    switch (type) {
      case 'Home': return <Home size={20} color="#C1A87D" />;
      case 'Work': return <Briefcase size={20} color="#C1A87D" />;
      default: return <MapPin size={20} color="#C1A87D" />;
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Pressable 
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/');
              }
            }} 
            style={styles.backBtn}
          >
            <ChevronLeft size={24} color="#1A1A1A" />
          </Pressable>
          <Text style={styles.headerTitle}>Delivery Addresses</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {addresses.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <MapPin size={48} color="#D1D5DB" />
              </View>
              <Text style={styles.emptyTitle}>No Addresses Saved</Text>
              <Text style={styles.emptySubtitle}>Add a delivery address to get started with your orders.</Text>
            </View>
          ) : (
            addresses.map((address, idx) => (
              <Animated.View 
                key={address.id} 
                entering={FadeInRight.delay(idx * 100)} 
                exiting={FadeOutLeft}
                style={styles.addressCard}
              >
                <Pressable 
                  style={styles.addressMain} 
                  onPress={() => setDefaultAddress(address.id)}
                >
                  <View style={styles.addressHeader}>
                    <View style={styles.addressLabelRow}>
                      <View style={styles.labelIcon}>{getIcon(address.label)}</View>
                      <Text style={styles.addressLabel}>{address.label}</Text>
                      {address.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultText}>DEFAULT</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.addressActions}>
                      <Pressable onPress={() => handleEditPress(address)} style={styles.actionBtn}>
                         <MoreHorizontal size={20} color="#9CA3AF" />
                      </Pressable>
                    </View>
                  </View>
                  
                  <View style={styles.addressBody}>
                    <Text style={styles.addressName}>{address.fullName}</Text>
                    <Text style={styles.addressText}>{address.street}</Text>
                    <Text style={styles.addressText}>{address.city}, {address.state} {address.zipCode}</Text>
                  </View>

                  {address.isDefault && (
                    <View style={styles.checkIcon}>
                      <CheckCircle2 size={20} color="#C1A87D" />
                    </View>
                  )}
                </Pressable>
                
                <Pressable 
                  style={styles.deleteSideBtn} 
                  onPress={() => handleDelete(address.id)}
                >
                  <Trash2 size={20} color="#EF4444" />
                </Pressable>
              </Animated.View>
            ))
          )}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <Pressable style={styles.addNewBtn} onPress={handleAddPress}>
            <Plus size={20} color="#FFF" />
            <Text style={styles.addNewText}>Add New Address</Text>
          </Pressable>
        </View>
      </SafeAreaView>

      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: '#D1D5DB' }}
        backgroundStyle={{ borderRadius: 32 }}
      >
        <BottomSheetScrollView 
          contentContainerStyle={[
            styles.sheetContent, 
            { paddingBottom: Platform.OS === 'ios' ? 100 : 60 }
          ]}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
          >
            <Text style={styles.sheetTitle}>{isEditing ? 'Edit Address' : 'New Address'}</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Label</Text>
              <View style={styles.labelPicker}>
                {(['Home', 'Work', 'Other'] as AddressType[]).map((l) => (
                  <Pressable 
                    key={l}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setLabel(l);
                    }}
                    style={[styles.labelBtn, label === l && styles.labelBtnActive]}
                  >
                    {getIcon(l)}
                    <Text style={[styles.labelText, label === l && styles.labelTextActive]}>{l}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput 
                style={[styles.input, !!errors.fullName && styles.inputError]}
                placeholder="Receiver's name"
                value={fullName}
                onChangeText={(t) => { setFullName(t); if (errors.fullName) setErrors(prev => ({ ...prev, fullName: '' })); }}
              />
              {!!errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Address Line 1</Text>
              <TextInput 
                style={[styles.input, !!errors.street && styles.inputError]}
                placeholder="Street name, house/flat number"
                value={street}
                onChangeText={(t) => { setStreet(t); if (errors.street) setErrors(prev => ({ ...prev, street: '' })); }}
              />
              {!!errors.street && <Text style={styles.errorText}>{errors.street}</Text>}
            </View>

            <View style={styles.row}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>City</Text>
                <TextInput 
                  style={[styles.input, !!errors.city && styles.inputError]}
                  placeholder="New York"
                  value={city}
                  onChangeText={(t) => { setCity(t); if (errors.city) setErrors(prev => ({ ...prev, city: '' })); }}
                />
                {!!errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
              </View>
              <View style={[styles.formGroup, { width: 100 }]}>
                <Text style={styles.inputLabel}>State</Text>
                <TextInput 
                  style={[styles.input, !!errors.state && styles.inputError]}
                  placeholder="NY"
                  value={state}
                  onChangeText={(t) => { setState(t); if (errors.state) setErrors(prev => ({ ...prev, state: '' })); }}
                />
                {!!errors.state && <Text style={styles.errorText}>{errors.state}</Text>}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Zip Code</Text>
              <TextInput 
                style={[styles.input, !!errors.zipCode && styles.inputError]}
                placeholder="10001"
                value={zipCode}
                onChangeText={(t) => { setZipCode(t); if (errors.zipCode) setErrors(prev => ({ ...prev, zipCode: '' })); }}
                keyboardType="numeric"
              />
              {!!errors.zipCode && <Text style={styles.errorText}>{errors.zipCode}</Text>}
            </View>

            <Pressable 
              style={styles.defaultToggle}
              onPress={() => setIsDefault(!isDefault)}
            >
              <View style={[styles.checkbox, isDefault && styles.checkboxActive]}>
                {isDefault && <CheckCircle2 size={16} color="#FFF" />}
              </View>
              <Text style={styles.defaultToggleText}>Set as default delivery address</Text>
            </Pressable>

            <View style={{ height: 40 }} />
            
            <Pressable 
              style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]} 
              onPress={handleSave}
              disabled={isSaving}
            >
              <Text style={styles.saveBtnText}>
                {isSaving ? 'Saving...' : (isEditing ? 'Update Address' : 'Save Address')}
              </Text>
            </Pressable>

            <View style={{ height: 40 }} />
          </KeyboardAvoidingView>
        </BottomSheetScrollView>
      </BottomSheetModal>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    fontFamily: 'serif',
  },
  listContent: {
    padding: 24,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 24,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  addressMain: {
    flex: 1,
    padding: 20,
    position: 'relative',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  addressLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  labelIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(193, 168, 125, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  addressActions: {
    flexDirection: 'row',
  },
  actionBtn: {
    padding: 4,
  },
  defaultBadge: {
    backgroundColor: 'rgba(193, 168, 125, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#C1A87D',
  },
  addressBody: {
    gap: 4,
  },
  addressName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  addressText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  checkIcon: {
    position: 'absolute',
    right: 20,
    bottom: 20,
  },
  deleteSideBtn: {
    width: 60,
    height: '100%',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#F3F4F6',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: '#F8F5F0',
  },
  addNewBtn: {
    height: 60,
    backgroundColor: '#1A1A1A',
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 5,
  },
  addNewText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  sheetContent: {
    padding: 24,
  },
  sheetTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    fontFamily: 'serif',
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  input: {
    height: 56,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  labelPicker: {
    flexDirection: 'row',
    gap: 10,
  },
  labelBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  labelBtnActive: {
    backgroundColor: '#1A1A1A',
    borderColor: '#1A1A1A',
  },
  labelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  labelTextActive: {
    color: '#FFF',
  },
  row: {
    flexDirection: 'row',
    gap: 15,
  },
  defaultToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#C1A87D',
    borderColor: '#C1A87D',
  },
  defaultToggleText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  saveBtn: {
    height: 60,
    backgroundColor: '#1A1A1A',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  inputError: {
    borderColor: '#EF4444',
    borderWidth: 1.5,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    marginLeft: 4,
  },
});
