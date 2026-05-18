import { Tabs, useRouter } from 'expo-router';
import { Home, Heart, ClipboardList, User, Sparkles } from 'lucide-react-native';
import { Platform, View, StyleSheet, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CartIndicator } from '../../frontend/components/CartIndicator';
import { useCartStore } from '../../frontend/stores/useCartStore';
import * as Haptics from 'expo-haptics';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { getTotalItems } = useCartStore();
  const hasCartItems = getTotalItems() > 0;
  
  return (
    <View style={{ flex: 1 }}>
      <Tabs screenOptions={{ 
        headerShown: false,
        tabBarActiveTintColor: '#C1A87D',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarBackground: () => (
          Platform.OS !== 'web' ? (
            <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255, 255, 255, 0.9)' }]} />
          )
        ),
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? insets.bottom : 20,
          left: 20,
          right: 20,
          height: 64,
          borderRadius: 32,
          backgroundColor: Platform.OS === 'web' ? '#FFF' : 'transparent',
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          paddingBottom: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginBottom: 8,
        },
        tabBarIconStyle: {
          marginTop: 8,
        }
      }}>
        <Tabs.Screen 
          name="index" 
          options={{ 
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.iconContainer, focused && styles.activeIcon]}>
                <Home size={22} color={color} />
              </View>
            )
          }} 
        />
        <Tabs.Screen 
          name="favorites" 
          options={{ 
            title: 'Favorites',
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.iconContainer, focused && styles.activeIcon]}>
                <Heart size={22} color={color} fill={focused ? color : 'transparent'} />
              </View>
            )
          }} 
        />
        <Tabs.Screen 
          name="orders" 
          options={{ 
            title: 'Orders',
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.iconContainer, focused && styles.activeIcon]}>
                <ClipboardList size={22} color={color} />
              </View>
            )
          }} 
        />
        <Tabs.Screen 
          name="profile" 
          options={{ 
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.iconContainer, focused && styles.activeIcon]}>
                <User size={22} color={color} />
              </View>
            )
          }} 
        />
      </Tabs>
      <Pressable 
        style={[styles.fab, { bottom: hasCartItems ? 180 : 100 }]} 
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push('/concierge');
        }}
      >
        <Sparkles size={28} color="#C1A87D" />
      </Pressable>
      <CartIndicator />
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  activeIcon: {
    backgroundColor: 'rgba(193, 168, 125, 0.1)',
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1002,
  }
});
