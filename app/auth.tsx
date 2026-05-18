import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { ChefHat, Lock, Mail, MapPin, Phone, User, X } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../frontend/stores/useAuthStore';

WebBrowser.maybeCompleteAuthSession();

export default function AuthScreen() {
  const router = useRouter();
  const { login, emailSignIn, emailSignUp, isLoading } = useAuthStore();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Validate email — must have local part, @, domain, and a real TLD (.com/.org/.net etc.)
  const validateEmail = (val: string): string => {
    if (!val) return 'Email is required.';
    if (!val.includes('@')) return 'Email must contain @.';
    const [local, domain] = val.split('@');
    if (!local || local.length < 1) return 'Enter a valid username before @.';
    if (!domain || !domain.includes('.')) return 'Email must contain a domain (e.g. gmail.com).';
    const tld = domain.split('.').pop() || '';
    if (tld.length < 2) return 'Email must have a valid extension (.com, .org, etc.).';
    if (!/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(val))
      return 'Please enter a valid email address.';
    return '';
  };

  const validatePassword = (val: string): string => {
    if (!val) return 'Password is required.';
    if (val.length < 8) return 'Password must be at least 8 characters.';
    if (!/[A-Z]/.test(val)) return 'Password must include at least one uppercase letter.';
    if (!/[0-9]/.test(val)) return 'Password must include at least one number.';
    return '';
  };

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async () => {
    // Validate fields
    const emailErr = validateEmail(email);
    const passErr = mode === 'signup' ? validatePassword(password) : (!password ? 'Password is required.' : '');
    setEmailError(emailErr);
    setPasswordError(passErr);

    if (emailErr || passErr) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (mode === 'signup' && !name.trim()) {
      Alert.alert('Incomplete Form', 'Please enter your full name.');
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (mode === 'signin') {
        await emailSignIn(email.trim().toLowerCase(), password);
      } else {
        await emailSignUp(name.trim(), email.trim().toLowerCase(), password, phone, address);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    } catch (error: any) {
      const msg =
        error.code === 'auth/user-not-found' ? 'No account found with this email. Please tap "Sign Up" below to create one instantly!' :
          error.code === 'auth/wrong-password' ? 'Incorrect password. Please try again.' :
            error.code === 'auth/email-already-in-use' ? 'An account already exists with this email. Sign in instead.' :
              error.code === 'auth/invalid-credential' ? 'Invalid email or password. If you don\'t have an account yet, please tap "Sign Up" below to create one instantly!' :
                error.code === 'auth/network-request-failed' ? 'Network error. Please check your connection.' :
                  'Something went wrong. Please try again.';
      Alert.alert('Authentication Error', msg);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleDemoSignIn = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const { emailSignIn, emailSignUp } = useAuthStore.getState();
      
      try {
        await emailSignIn('bistro.demo@intellibistro.com', 'BistroDemo123!');
      } catch (err: any) {
        // Automatically sign up if not in Firebase yet
        await emailSignUp(
          'Nishigandha Mali',
          'bistro.demo@intellibistro.com',
          'BistroDemo123!',
          '+1 (555) 123-4567',
          '456 Gourmet Ave, San Francisco, CA'
        );
      }
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Demo Sign In error:', error);
      Alert.alert('Demo Sign In Failed', 'Failed to authenticate demo account. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const { signInWithGoogle } = useAuthStore.getState();
      await signInWithGoogle();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Google Sign In error:', error);
      let errorMsg = "We couldn't connect to your Google account. Please try again.";
      if (error.code === 'auth/unauthorized-domain') {
        errorMsg = "This domain is not authorized for Google Sign-In in Firebase. Please add this domain (localhost) to your Authorized Domains list in the Firebase/GCP Console.";
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMsg = "The sign-in popup was closed before completing. Please try again.";
      }
      Alert.alert('Sign In Failed', errorMsg);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} style={styles.closeBtn}>
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
                <View style={[styles.inputWrapper, !!emailError && styles.inputWrapperError]}>
                  <Mail size={20} color={emailError ? '#EF4444' : '#9CA3AF'} />
                  <TextInput
                    style={styles.input}
                    placeholder="example@mail.com"
                    value={email}
                    onChangeText={(t) => { setEmail(t); setEmailError(''); }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                {!!emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}
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
                <View style={[styles.inputWrapper, !!passwordError && styles.inputWrapperError]}>
                  <Lock size={20} color={passwordError ? '#EF4444' : '#9CA3AF'} />
                  <TextInput
                    style={styles.input}
                    placeholder={mode === 'signup' ? '8+ chars, 1 uppercase, 1 number' : '••••••••'}
                    value={password}
                    onChangeText={(t) => { setPassword(t); setPasswordError(''); }}
                    secureTextEntry
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                {!!passwordError ? <Text style={styles.fieldError}>{passwordError}</Text> : null}
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

              <Pressable style={styles.demoBtn} onPress={handleDemoSignIn}>
                <ChefHat size={20} color="#C1A87D" />
                <Text style={styles.demoBtnText}>Quick Demo Login (1-Tap)</Text>
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
  inputWrapperError: {
    borderColor: '#EF4444',
    borderWidth: 1.5,
  },
  fieldError: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 4,
  },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(193, 168, 125, 0.08)',
    height: 64,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(193, 168, 125, 0.3)',
    gap: 12,
    marginTop: 8,
  },
  demoBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#C1A87D',
  },
});
