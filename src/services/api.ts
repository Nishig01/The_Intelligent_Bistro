import { menuData } from "../data/menu";
import { useCartStore } from "../stores/useCartStore";
import { useOrderStore } from "../stores/useOrderStore";

export const processAIOrder = async (message: string) => {
  const currentCart = useCartStore.getState().items;
  const orderHistory = useOrderStore.getState().orders;
  
  // Automatically detect if we are on Expo Metro port 8081 and point to Express port 3000
  let apiBase = '';
  if (typeof window !== 'undefined' && window.location.port === '8081') {
    apiBase = 'http://localhost:3000';
  }

  const response = await fetch(`${apiBase}/api/ai/order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, currentCart, orderHistory })
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to process AI order');
  }
  
  const data = await response.json();
  return data;
};

// Function to apply AI actions to the store
export const applyAIActions = (actions: any[]) => {
  const store = useCartStore.getState();
  
  actions.forEach(action => {
    const menuItem = menuData.find(m => m.id === action.itemId);
    
    if (action.type === 'clear') {
      store.clearCart();
    } else if (action.type === 'add' && menuItem) {
      store.addItem(menuItem, action.quantity, action.modifiers);
    } else if (action.type === 'remove') {
      store.removeItem(action.itemId, action.quantity === 0 ? undefined : action.quantity);
    } else if (action.type === 'update') {
      store.updateItemQuantity(action.itemId, action.quantity);
    }
  });
};
