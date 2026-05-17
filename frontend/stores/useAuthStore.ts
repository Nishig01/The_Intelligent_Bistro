import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

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
  signup: (userData: Omit<User, 'id'>) => Promise<void>;
  logout: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

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
          // The onAuthStateChanged listener will handle state update
        } catch (error) {
          console.error('Google Sign In error:', error);
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
    { name: 'bistro-auth-storage' }
  )
);
