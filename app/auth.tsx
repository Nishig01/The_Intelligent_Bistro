import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Mail, Lock, User, Phone, MapPin, ChefHat } from 'lucide-react-native';
import { useAuthStore } from '../frontend/stores/useAuthStore';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

export default function AuthScreen() {
  const router = useRouter();
  const { login, signup, isLoading } = useAuthStore();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async () => {
    if (!email || !password || (mode === 'signup' && (!name || !phone))) {
      Alert.alert('Incomplete Form', 'Please fill in all required fields to proceed.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (mode === 'signin') {
        const mockUser = {
          id: '1',
          name: 'Nishigandha Mali',
          email,
          avatar: '',
          token: 'mock-token'
        };
        login(mockUser);
      } else {
        await signup({ name, email, phone, deliveryAddress: address });
      }
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const handleGoogleSignIn = async () => {
     try {
       Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
       const { signInWithGoogle } = useAuthStore.getState();
       await signInWithGoogle();
       Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
       router.replace('/(tabs)');
     } catch (error) {
       console.error('Google Sign In error:', error);
       Alert.alert('Sign In Failed', 'We couldn\'t connect to your Google account. Please try again.');
     }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.closeBtn}>
            <X size={24} color="#1A1A1A" />
          </Pressable>
          <View style={styles.logoContainer}>
             <ChefHat size={32} color="#C1A87D" />
             <Text style={styles.brandName}>Bistro</Text>
          </View>
          <View style={{ width: 44 }} />
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Animated.View entering={FadeInDown.delay(100)} style={styles.titleSection}>
              <Text style={styles.title}>{mode === 'signin' ? 'Welcome Back' : 'Create Account'}</Text>
              <Text style={styles.subtitle}>
                {mode === 'signin' 
                  ? 'Sign in to access your culinary favorites' 
                  : 'Join Bistro for a personalized dining experience'}
              </Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(200)} style={styles.form}>
              {mode === 'signup' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Full Name</Text>
                  <View style={styles.inputWrapper}>
                    <User size={20} color="#9CA3AF" />
                    <TextInput 
                      style={styles.input}
                      placeholder="Nishigandha Mali"
                      value={name}
                      onChangeText={setName}
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputWrapper}>
                  <Mail size={20} color="#9CA3AF" />
                  <TextInput 
                    style={styles.input}
                    placeholder="example@mail.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {mode === 'signup' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Phone Number</Text>
                  <View style={styles.inputWrapper}>
                    <Phone size={20} color="#9CA3AF" />
                    <TextInput 
                      style={styles.input}
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>
              )}

              {mode === 'signup' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Default Delivery Address</Text>
                  <View style={styles.inputWrapper}>
                    <MapPin size={20} color="#9CA3AF" />
                    <TextInput 
                      style={styles.input}
                      placeholder="123 Gourmet St, NY"
                      value={address}
                      onChangeText={setAddress}
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrapper}>
                  <Lock size={20} color="#9CA3AF" />
                  <TextInput 
                    style={styles.input}
                    placeholder="••••••••"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              <Pressable 
                style={[styles.mainBtn, isLoading && styles.mainBtnDisabled]} 
                onPress={handleAuth}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.mainBtnText}>{mode === 'signin' ? 'Sign In' : 'Create Account'}</Text>
                )}
              </Pressable>

              <View style={styles.dividerRow}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>or continue with</Text>
                <View style={styles.divider} />
              </View>

              <Pressable style={styles.googleBtn} onPress={handleGoogleSignIn}>
                <View style={styles.googleIconContainer}>
                  <Text style={styles.googleIcon}>G</Text>
                </View>
                <Text style={styles.googleBtnText}>Continue with Google</Text>
              </Pressable>
            </Animated.View>

            <Pressable 
              style={styles.modeToggle} 
              onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            >
              <Text style={styles.modeToggleText}>
                {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
                <Text style={styles.modeToggleTextBold}>{mode === 'signin' ? 'Sign Up' : 'Sign In'}</Text>
              </Text>
            </Pressable>
            
            <View style={{ height: 100 }} />
          </ScrollView>
        </KeyboardAvoidingView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  closeBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    fontFamily: 'serif',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  titleSection: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A1A1A',
    fontFamily: 'serif',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 22,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    height: 60,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
  },
  mainBtn: {
    backgroundColor: '#1A1A1A',
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  mainBtnDisabled: {
    opacity: 0.7,
  },
  mainBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginVertical: 10,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    height: 64,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleIcon: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 14,
  },
  googleBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  modeToggle: {
    marginTop: 30,
    alignItems: 'center',
  },
  modeToggleText: {
    fontSize: 15,
    color: '#6B7280',
  },
  modeToggleTextBold: {
    color: '#C1A87D',
    fontWeight: '700',
  },
});
