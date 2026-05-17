import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '../lib/mmkv';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  setDoc,
  getDocs
} from 'firebase/firestore';

export type AddressType = 'Home' | 'Work' | 'Other';

export interface Address {
  id: string;
  label: AddressType;
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

interface AddressState {
  addresses: Address[];
  isLoading: boolean;
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
  updateAddress: (id: string, address: Partial<Address>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  syncAddresses: () => (() => void) | undefined;
}

export const useAddressStore = create<AddressState>()(
  persist(
    (set, get) => ({
      addresses: [],
      isLoading: false,
      syncAddresses: () => {
        const user = auth.currentUser;
        if (!user) return undefined;

        set({ isLoading: true });
        const q = query(collection(db, 'addresses'), where('userId', '==', user.uid));
        
        return onSnapshot(q, (snapshot) => {
          const remoteAddresses = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Address[];
          
          set({ addresses: remoteAddresses, isLoading: false });
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, 'addresses');
          set({ isLoading: false });
        });
      },
      addAddress: async (address) => {
        const user = auth.currentUser;
        if (user) {
          const payload = {
            ...address,
            userId: user.uid,
            createdAt: serverTimestamp()
          };
          
          // If setting as default, unset others first in Firestore (or handle via rules/logic)
          // For simplicity in the demo, we'll just add it. The client will handle UI.
          await addDoc(collection(db, 'addresses'), payload)
            .catch(e => handleFirestoreError(e, OperationType.CREATE, 'addresses'));
        } else {
          // Fallback to local
          const id = Math.random().toString(36).substring(7);
          const newAddress = { ...address, id };
          set((state) => {
            let newAddresses = [...state.addresses];
            if (address.isDefault) {
              newAddresses = newAddresses.map(a => ({ ...a, isDefault: false }));
            }
            return { addresses: [...newAddresses, newAddress] };
          });
        }
      },
      updateAddress: async (id, updatedAddress) => {
        const user = auth.currentUser;
        if (user) {
          const addressRef = doc(db, 'addresses', id);
          await updateDoc(addressRef, updatedAddress)
            .catch(e => handleFirestoreError(e, OperationType.UPDATE, `addresses/${id}`));
        } else {
          set((state) => {
            let newAddresses = state.addresses.map((a) =>
              a.id === id ? { ...a, ...updatedAddress } : a
            );
            if (updatedAddress.isDefault) {
              newAddresses = newAddresses.map((a) =>
                a.id === id ? a : { ...a, isDefault: false }
              );
            }
            return { addresses: newAddresses };
          });
        }
      },
      deleteAddress: async (id) => {
        const user = auth.currentUser;
        if (user) {
          const addressRef = doc(db, 'addresses', id);
          await deleteDoc(addressRef)
            .catch(e => handleFirestoreError(e, OperationType.DELETE, `addresses/${id}`));
        } else {
          set((state) => ({
            addresses: state.addresses.filter((a) => a.id !== id),
          }));
        }
      },
      setDefaultAddress: async (id) => {
        const user = auth.currentUser;
        if (user) {
          // This requires updating all addresses - better to do in a batch or cloud function
          // For now, update the targeted one and let onSnapshot handle sync
          const addresses = get().addresses;
          const updates = addresses.map(async (a) => {
            const addressRef = doc(db, 'addresses', a.id);
            return updateDoc(addressRef, { isDefault: a.id === id });
          });
          await Promise.all(updates).catch(e => handleFirestoreError(e, OperationType.UPDATE, 'addresses'));
        } else {
          set((state) => ({
            addresses: state.addresses.map((a) => ({
              ...a,
              isDefault: a.id === id,
            })),
          }));
        }
      },
    }),
    {
      name: 'address-storage',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
