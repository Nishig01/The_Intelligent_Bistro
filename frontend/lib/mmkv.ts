import { Platform } from 'react-native';

let storage: any;

if (Platform.OS !== 'web') {
  try {
    const { MMKV } = require('react-native-mmkv');
    storage = new MMKV({
      id: 'bistro-storage',
    });
  } catch (e) {
    console.warn('MMKV failed to initialize:', e);
    // Fallback if native module is not available
  }
}

export const mmkvStorage = {
  setItem: (name: string, value: string) => {
    if (Platform.OS === 'web' || !storage) {
      localStorage.setItem(name, value);
    } else {
      storage.set(name, value);
    }
  },
  getItem: (name: string) => {
    if (Platform.OS === 'web' || !storage) {
      return localStorage.getItem(name);
    }
    return storage.getString(name) ?? null;
  },
  removeItem: (name: string) => {
    if (Platform.OS === 'web' || !storage) {
      localStorage.removeItem(name);
    } else {
      storage.delete(name);
    }
  },
};
