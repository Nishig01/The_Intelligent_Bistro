import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const getApiUrl = () => {
  // If explicitly configured in Env
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (Platform.OS === 'web') {
    return 'http://localhost:3000';
  }

  // Check all possible locations of Metro IP
  let hostUri = Constants.expoConfig?.hostUri;

  if (!hostUri) {
    const manifest = (Constants.manifest || Constants.manifest2) as any;
    hostUri = manifest?.extra?.expoGo?.developer?.projectUrl || manifest?.debuggerHost;
  }

  if (hostUri) {
    const stripped = hostUri.replace(/^exp:\/\//, '');
    const ip = stripped.split(':')[0];
    if (ip) {
      return `http://${ip}:3000`;
    }
  }

  // Hardcode your computer's verified local IP address from the Expo start logs
  return 'http://10.20.0.37:3000';
};

