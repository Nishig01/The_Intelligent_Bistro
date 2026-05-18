import React, { useState } from 'react';
import { View, Image, StyleSheet, ActivityIndicator, ImageProps, StyleProp, ImageStyle } from 'react-native';
import { ImageOff } from 'lucide-react-native';

interface SmartImageProps extends Omit<ImageProps, 'source'> {
  source: { uri?: string };
  style?: StyleProp<ImageStyle>;
}

export default function SmartImage({ source, style, ...props }: SmartImageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // If no URI is provided at all
  if (!source || !source.uri) {
    return (
      <View style={[styles.container, style]}>
        <ImageOff size={24} color="#9CA3AF" />
      </View>
    );
  }

  // Reset state if URI changes (but not on initial mount to avoid overriding fast cached loads)
  const previousUri = React.useRef(source?.uri);
  React.useEffect(() => {
    if (previousUri.current !== source?.uri) {
      setLoading(true);
      setError(false);
      previousUri.current = source?.uri;
    }
  }, [source?.uri]);

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
          source={source}
          style={[StyleSheet.absoluteFill, style]}
          onLoadStart={props.onLoadStart}
          onLoad={() => {
            setLoading(false);
            props.onLoadEnd?.();
          }}
          onError={(e) => {
            setLoading(false);
            setError(true);
            props.onError?.(e);
          }}
          {...props}
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
