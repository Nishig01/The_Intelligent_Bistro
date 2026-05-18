import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, StyleProp, ImageStyle } from 'react-native';
import { Image } from 'expo-image';
import { ImageOff } from 'lucide-react-native';

interface SmartImageProps {
  source: { uri?: string };
  style?: StyleProp<ImageStyle>;
  contentFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'center' | string;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: (error: any) => void;
}

export default function SmartImage({ source, style, contentFit, resizeMode, ...props }: SmartImageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [fallbackUri, setFallbackUri] = useState<string | null>(null);

  // Map legacy resizeMode to modern contentFit
  const resolvedContentFit: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down' = contentFit || (
    resizeMode === 'stretch' ? 'fill' :
    resizeMode === 'contain' ? 'contain' :
    resizeMode === 'cover' ? 'cover' : 'cover'
  );

  // If no URI is provided at all
  if (!source || !source.uri) {
    return (
      <View style={[styles.container, style]}>
        <ImageOff size={24} color="#9CA3AF" />
      </View>
    );
  }

  // Reset state if URI changes
  const previousUri = React.useRef(source?.uri);
  React.useEffect(() => {
    if (previousUri.current !== source?.uri) {
      setLoading(true);
      setError(false);
      setFallbackUri(null);
      previousUri.current = source?.uri;
    }
  }, [source?.uri]);

  const handleError = (e: any) => {
    if (!fallbackUri) {
      setFallbackUri("https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80"); // Use guaranteed stable Truffle Fries gourmet URL!
      setLoading(true);
      setError(false);
    } else {
      setLoading(false);
      setError(true);
      props.onError?.(e);
    }
  };

  return (
    <View style={[styles.container, style]}>
      {loading && !error && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#C1A87D" size="small" />
        </View>
      )}
      
      {error ? (
        <View style={styles.errorContainer}>
          <ImageOff size={24} color="#9CA3AF" />
        </View>
      ) : (
        <Image
          key={fallbackUri || source.uri}
          source={{ uri: fallbackUri || source.uri }}
          style={[StyleSheet.absoluteFill, style]}
          contentFit={resolvedContentFit}
          transition={200}
          onLoadStart={() => {
            setLoading(true);
            props.onLoadStart?.();
          }}
          onLoad={() => {
            setLoading(false);
            props.onLoadEnd?.();
          }}
          onError={(e) => {
            console.warn(`SmartImage failed to load URI: ${fallbackUri || source.uri}. Activating self-healing fallback.`, e);
            handleError(e);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#F3F4F6', // Skeleton loading color
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    zIndex: 1,
  },
  errorContainer: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    zIndex: 1,
  },
});
