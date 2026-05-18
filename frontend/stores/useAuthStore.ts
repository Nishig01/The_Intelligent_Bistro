import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { mmkvStorage } from '../lib/mmkv';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile as fbUpdateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getApiUrl } from '../utils/api';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  deliveryAddress?: string;
  token?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initAuth: () => void;
  login: (user: User) => void;
  signInWithGoogle: () => Promise<void>;
  emailSignIn: (email: string, password: string) => Promise<void>;
  emailSignUp: (name: string, email: string, password: string, phone?: string, address?: string) => Promise<void>;
  signup: (userData: Omit<User, 'id'>) => Promise<void>;
  logout: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const getFederatedPassword = (email: string) => {
  const salt = "IntelliBistroOAuthSecureSalt2026!";
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = (hash << 5) - hash + email.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash).toString(36);
  return `IB-${absHash.toUpperCase()}-${email.slice(0, 3)}-Sec9!`;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      setLoading: (loading) => set({ isLoading: loading }),
      initAuth: () => {
        onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            try {
              const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                set({ 
                  user: { 
                    id: firebaseUser.uid, 
                    name: userData.name, 
                    email: userData.email,
                    phone: userData.phone,
                    avatar: userData.avatar,
                    deliveryAddress: userData.deliveryAddress
                  }, 
                  isAuthenticated: true, 
                  isLoading: false 
                });
              } else {
                // User signed in but no profile doc (e.g. first time Google login)
                const newUser = {
                  id: firebaseUser.uid,
                  name: firebaseUser.displayName || 'Guest User',
                  email: firebaseUser.email || '',
                  avatar: firebaseUser.photoURL || undefined
                };
                set({ user: newUser, isAuthenticated: true, isLoading: false });
              }
            } catch (error) {
              console.error('Error fetching user profile:', error);
              set({ user: null, isAuthenticated: false, isLoading: false });
            }
          } else {
            set({ user: null, isAuthenticated: false, isLoading: false });
          }
        });
      },
      login: (user) => set({ user, isAuthenticated: true, isLoading: false }),
      signInWithGoogle: async () => {
        set({ isLoading: true });
        try {
          if (Platform.OS === 'web') {
            const result = await signInWithPopup(auth, googleProvider);
            const firebaseUser = result.user;
            
            // Check if profile exists, if not create basic one
            const userRef = doc(db, 'users', firebaseUser.uid);
            const userDoc = await getDoc(userRef).catch(e => {
              handleFirestoreError(e, OperationType.GET, 'users');
              return null;
            });
            
            if (userDoc && !userDoc.exists()) {
              await setDoc(userRef, {
                name: firebaseUser.displayName || 'Guest User',
                email: firebaseUser.email,
                avatar: firebaseUser.photoURL,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
              }).catch(e => handleFirestoreError(e, OperationType.WRITE, 'users'));
            }
          } else {
            const apiBase = getApiUrl();
            const appSchemeUrl = Linking.createURL('auth-callback');
            const urlResponse = await fetch(`${apiBase}/api/auth/google/url?redirectUri=${encodeURIComponent(appSchemeUrl)}`);
            const urlData = await urlResponse.json();
            
            const authUrl = urlData.url;
            const result = await WebBrowser.openAuthSessionAsync(authUrl, appSchemeUrl);
            
            if (result.type === 'success' && result.url) {
              const redirectUrl = result.url;
              const paramsStart = redirectUrl.indexOf('?');
              if (paramsStart === -1) throw new Error("Authentication failed: No user parameters returned.");
              
              const queryString = redirectUrl.substring(paramsStart + 1);
              const queryParams: Record<string, string> = {};
              queryString.split('&').forEach(pair => {
                const [key, value] = pair.split('=');
                if (key && value) {
                  queryParams[key] = decodeURIComponent(value);
                }
              });
              
              const { email, name, avatar } = queryParams;
              if (!email) throw new Error("Authentication failed: No verified email returned from Google.");
              
              const securePassword = getFederatedPassword(email);
              
              let authResult;
              try {
                authResult = await signInWithEmailAndPassword(auth, email, securePassword);
              } catch (loginErr: any) {
                if (loginErr.code === 'auth/user-not-found' || loginErr.code === 'auth/invalid-credential') {
                  try {
                    authResult = await createUserWithEmailAndPassword(auth, email, securePassword);
                    await fbUpdateProfile(authResult.user, { displayName: name || 'Google User' });
                  } catch (createErr: any) {
                    if (createErr.code === 'auth/email-already-in-use') {
                      throw new Error("This email is already registered with a regular password. Please sign in using your email and password instead.");
                    } else {
                      throw createErr;
                    }
                  }
                } else {
                  throw loginErr;
                }
              }
              
              const firebaseUser = authResult.user;
              const userRef = doc(db, 'users', firebaseUser.uid);
              await setDoc(userRef, {
                name: name || 'Google User',
                email: email,
                avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
              }, { merge: true }).catch(e => handleFirestoreError(e, OperationType.WRITE, 'users'));
            } else {
              throw new Error("Google Sign-In was cancelled by the user.");
            }
          }
        } catch (error: any) {
          set({ isLoading: false });
          throw error;
        }
      },
      emailSignIn: async (email, password) => {
        set({ isLoading: true });
        try {
          const result = await signInWithEmailAndPassword(auth, email, password);
          const userRef = doc(db, 'users', result.user.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const d = userDoc.data();
            set({ user: { id: result.user.uid, name: d.name, email: d.email, phone: d.phone, avatar: d.avatar, deliveryAddress: d.deliveryAddress }, isAuthenticated: true, isLoading: false });
          } else {
            set({ user: { id: result.user.uid, name: result.user.displayName || 'User', email }, isAuthenticated: true, isLoading: false });
          }
        } catch (error: any) {
          set({ isLoading: false });
          throw error;
        }
      },
      emailSignUp: async (name, email, password, phone, address) => {
        set({ isLoading: true });
        try {
          const result = await createUserWithEmailAndPassword(auth, email, password);
          await fbUpdateProfile(result.user, { displayName: name });
          const userRef = doc(db, 'users', result.user.uid);
          await setDoc(userRef, {
            name,
            email,
            phone: phone || '',
            deliveryAddress: address || '',
            avatar: '',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          set({ user: { id: result.user.uid, name, email, phone, deliveryAddress: address }, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          set({ isLoading: false });
          throw error;
        }
      },
      signup: async (userData) => {
        // This is now handled either via Google Sign In or would require email/pass
        // For the sake of the demo, we'll assume we're creating a profile for current auth user
        if (!auth.currentUser) throw new Error('No authenticated user');
        
        set({ isLoading: true });
        try {
          const userRef = doc(db, 'users', auth.currentUser.uid);
          await setDoc(userRef, {
            ...userData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          }).catch(e => handleFirestoreError(e, OperationType.WRITE, 'users'));
          
          set({ 
            user: { ...userData, id: auth.currentUser.uid }, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      updateProfile: async (updates) => {
        if (!auth.currentUser) return;
        set({ isLoading: true });
        try {
          const userRef = doc(db, 'users', auth.currentUser.uid);
          await setDoc(userRef, {
            ...updates,
            updatedAt: serverTimestamp()
          }, { merge: true }).catch(e => handleFirestoreError(e, OperationType.UPDATE, 'users'));
          
          set((state) => ({
            user: state.user ? { ...state.user, ...updates } : null,
            isLoading: false
          }));
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      logout: async () => {
        set({ isLoading: true });
        await signOut(auth);
        set({ user: null, isAuthenticated: false, isLoading: false });
      },
    }),
    {
      name: 'bistro-auth-storage',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
