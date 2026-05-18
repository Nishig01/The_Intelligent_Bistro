import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { ChefHat } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay, 
  withSpring 
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

let sessionSplashShown = false;
const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();

  // Animation values
  const logoScale = useSharedValue(0.5);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    if (sessionSplashShown) {
      router.replace('/(tabs)');
      return;
    }
    sessionSplashShown = true;

    // 1. Play logo entry animation
    logoOpacity.value = withTiming(1, { duration: 800 });
    logoScale.value = withSpring(1, { damping: 12, stiffness: 90 });

    // 2. Play text and tagline entry
    textOpacity.value = withDelay(400, withTiming(1, { duration: 800 }));
    textTranslateY.value = withDelay(400, withSpring(0, { damping: 15, stiffness: 80 }));

    // 3. Animate clean progress loading bar
    progressWidth.value = withTiming(100, { duration: 2000 });

    // 4. Subtle launch haptic
    if (Platform.OS !== 'web') {
      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }, 300);
    }

    // 5. Clean redirect after 2.6 seconds
    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, 2600);

    return () => clearTimeout(timer);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Animated Brand Logo Icon */}
        <Animated.View style={[styles.logoContainer, logoStyle]}>
          <View style={styles.logoBadge}>
            <ChefHat size={48} color="#C1A87D" />
          </View>
        </Animated.View>

        {/* Animated Typography */}
        <Animated.View style={[styles.textContainer, textStyle]}>
          <Text style={styles.brandTitle}>THE INTELLIGENT BISTRO</Text>
          <Text style={styles.tagline}>A Symphony of Gourmet & AI</Text>
        </Animated.View>

        {/* Elegant Minimalist Loading Bar */}
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressBar, progressStyle]} />
        </View>
      </View>

      {/* Luxury Subtle Bottom Copy */}
      <Text style={styles.footerCopy}>EXQUISITE DINING EXPERIENCE</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A', // Dark mode background for luxury aesthetics
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    width: Math.min(width * 0.8, 400),
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoBadge: {
    width: 96,
    height: 96,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1.5,
    borderColor: 'rgba(193, 168, 125, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#C1A87D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 5,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
    fontFamily: Platform.OS === 'ios' ? 'Playfair Display' : 'serif',
    letterSpacing: 2.5,
    textAlign: 'center',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 13,
    color: '#C1A87D',
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    letterSpacing: 1.5,
    textAlign: 'center',
    opacity: 0.8,
  },
  progressTrack: {
    width: '60%',
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#C1A87D',
    borderRadius: 2,
  },
  footerCopy: {
    position: 'absolute',
    bottom: 40,
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.3)',
    letterSpacing: 3,
  },
});
