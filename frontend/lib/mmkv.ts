import { Platform } from 'react-native';

let storage: any;
const memoryStore = new Map<string, string>();

if (Platform.OS !== 'web') {
  try {
    const { MMKV } = require('react-native-mmkv');
    storage = new MMKV({
      id: 'bistro-storage',
    });
  } catch (e) {
    console.warn('MMKV failed to initialize:', e);
  }
}

export const mmkvStorage = {
  setItem: (name: string, value: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(name, value);
    } else if (storage) {
      storage.set(name, value);
    } else {
      memoryStore.set(name, value);
    }
  },
  getItem: (name: string) => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(name);
    }
    if (storage) {
      return storage.getString(name) ?? null;
    }
    return memoryStore.get(name) ?? null;
  },
  removeItem: (name: string) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(name);
    } else if (storage) {
      storage.delete(name);
    } else {
      memoryStore.delete(name);
    }
  },
};

