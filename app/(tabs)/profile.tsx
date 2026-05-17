import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../frontend/stores/useAuthStore';
import { useAddressStore } from '../../frontend/stores/useAddressStore';
import { useSettingsStore } from '../../frontend/stores/useSettingsStore';
import { 
  User, 
  MapPin, 
  ChevronRight, 
  Settings, 
  CreditCard, 
  Bell, 
  ShieldCheck, 
  LogOut,
  HelpCircle
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, login, logout, isAuthenticated } = useAuthStore();
  const { addresses } = useAddressStore();
  const { notifications, toggleNotification } = useSettingsStore();
  const defaultAddress = addresses.find(a => a.isDefault);

  const handleAuthPress = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (isAuthenticated) {
      logout();
    } else {
      router.push('/auth' as any);
    }
  };

  const menuItems = [
    { 
      id: 'addresses', 
      label: 'Saved Addresses', 
      icon: MapPin, 
      subtitle: defaultAddress ? `${defaultAddress.label}: ${defaultAddress.street}` : 'Manage delivery locations',
      onPress: () => router.push('/manage-addresses')
    },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      icon: Bell, 
      subtitle: notifications.orderUpdates ? 'Enabled' : 'Disabled', 
      type: 'switch', 
      value: notifications.orderUpdates,
      onValueChange: () => toggleNotification('orderUpdates')
    },
  ];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Account</Text>
        </View>
        
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Profile Card */}
          <Animated.View entering={FadeInDown} style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                {user?.avatar ? (
                  <Image source={{ uri: user.avatar }} style={styles.avatarImg} />
                ) : (
                  <User size={32} color="#C1A87D" />
                )}
              </View>
              {isAuthenticated && (
                <Pressable style={styles.editAvatar}>
                  <Settings size={14} color="#FFF" />
                </Pressable>
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{isAuthenticated ? user?.name : 'Guest User'}</Text>
              <Text style={styles.profileEmail}>{isAuthenticated ? user?.email : 'Sign in to sync your data'}</Text>
            </View>
          </Animated.View>

          {/* Account Stats */}
          {isAuthenticated && (
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>12</Text>
                <Text style={styles.statLabel}>Orders</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.statBox}>
                <Text style={styles.statValue}>450</Text>
                <Text style={styles.statLabel}>Points</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.statBox}>
                <Text style={styles.statValue}>4</Text>
                <Text style={styles.statLabel}>Vouchers</Text>
              </View>
            </View>
          )}

          {/* Menu Sections */}
          <View style={styles.menuContainer}>
            {menuItems.map((item, idx) => (
              <Animated.View key={item.id} entering={FadeInDown.delay(100 + idx * 50)}>
                <Pressable 
                  style={styles.menuItem} 
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    item.onPress?.();
                  }}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(193, 168, 125, 0.1)' }]}>
                    <item.icon size={20} color="#C1A87D" />
                  </View>
                  <View style={styles.menuTextContainer}>
                     <Text style={styles.menuLabel}>{item.label}</Text>
                     {item.subtitle && <Text style={styles.menuSubtitle}>{item.subtitle}</Text>}
                  </View>
                  {item.type === 'switch' ? (
                    <Switch 
                      value={item.value} 
                      onValueChange={item.onValueChange} 
                      trackColor={{ false: '#E5E7EB', true: '#C1A87D' }}
                      thumbColor="#FFF"
                    />
                  ) : (
                    <ChevronRight size={18} color="#D1D5DB" />
                  )}
                </Pressable>
                {idx < menuItems.length - 1 && <View style={styles.menuDivider} />}
              </Animated.View>
            ))}
          </View>

          {/* Auth Button */}
          <Animated.View entering={FadeInDown.delay(300)}>
            <Pressable 
              style={[styles.logoutBtn, !isAuthenticated && styles.loginBtn]} 
              onPress={handleAuthPress}
            >
              <View style={styles.logoutIconContainer}>
                {isAuthenticated ? (
                  <LogOut size={18} color="#EF4444" />
                ) : (
                  <User size={18} color="#C1A87D" />
                )}
              </View>
              <Text style={[styles.logoutText, !isAuthenticated && styles.loginText]}>
                {isAuthenticated ? 'Sign Out' : 'Sign In'}
              </Text>
            </Pressable>
          </Animated.View>

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
    paddingBottom: 40,
  },
  profileCard: {
    marginHorizontal: 24,
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  editAvatar: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#1A1A1A',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 24,
    backgroundColor: '#FFF',
    paddingVertical: 15,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '500',
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E7EB',
  },
  menuContainer: {
    marginHorizontal: 24,
    backgroundColor: '#FFF',
    borderRadius: 24,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 16,
    gap: 15,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 75,
  },
  logoutBtn: {
    marginHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderRadius: 16,
  },
  loginBtn: {
    backgroundColor: 'rgba(193, 168, 125, 0.1)',
  },
  logoutIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
  },
  loginText: {
    color: '#C1A87D',
  },
});
