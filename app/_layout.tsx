import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useAuthStore } from '../frontend/stores/useAuthStore';
import { useAddressStore } from '../frontend/stores/useAddressStore';

export default function Layout() {
  const initAuth = useAuthStore(state => state.initAuth);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const syncAddresses = useAddressStore(state => state.syncAddresses);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    if (isAuthenticated) {
      unsubscribe = syncAddresses();
    }
    return () => unsubscribe?.();
  }, [isAuthenticated, syncAddresses]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="auth" options={{ presentation: 'modal' }} />
          <Stack.Screen name="manage-addresses" options={{ presentation: 'modal' }} />
          <Stack.Screen name="cart" options={{ presentation: 'modal' }} />
        </Stack>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
