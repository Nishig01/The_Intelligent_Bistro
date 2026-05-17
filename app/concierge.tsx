import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Send, Sparkles, User, Bot } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useCartStore } from '../frontend/stores/useCartStore';

const SUGGESTIONS = [
  "What are today's specials?",
  "I'd like a vegan dinner.",
  "Pair a wine with my steak.",
  "Recommend a dessert."
];

import { menuData } from '../frontend/data/menu';

export default function Concierge() {
  const router = useRouter();
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', content: "Good evening. I am your personal concierge at The Bistro. How may I assist with your culinary selection today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  
  const { items, addItem, removeItem, updateItemQuantity, clearCart } = useCartStore();

  const handleSend = async (text: string = input) => {
    if (!text.trim() || loading) return;

    const userMessage = text.trim();
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', content: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, currentCart: items })
      });
      const data = await response.json();

      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: data.message }]);
      
      // Handle actions automatically
      if (data.actions) {
        data.actions.forEach((action: any) => {
          const menuItem = menuData.find(i => i.id === action.itemId);
          
          if (['add', 'remove', 'increase_quantity', 'decrease_quantity'].includes(action.type) && !menuItem) {
             console.warn(`AI requested action for invalid item: ${action.itemId}`);
             return;
          }

          switch (action.type) {
            case 'add':
              if (menuItem) addItem(menuItem, action.quantity || 1);
              break;
            case 'remove':
              removeItem(action.itemId, action.quantity);
              break;
            case 'increase_quantity':
              const itemInCart = items.find(i => i.id === action.itemId);
              if (itemInCart) updateItemQuantity(action.itemId, itemInCart.quantity + 1);
              break;
            case 'decrease_quantity':
              const itemToDecrease = items.find(i => i.id === action.itemId);
              if (itemToDecrease) updateItemQuantity(action.itemId, Math.max(1, itemToDecrease.quantity - 1));
              break;
            case 'clear_cart':
              clearCart();
              break;
            case 'show_cart':
              // The API message should already contain the cart summary.
              break;
            case 'show_order_status':
               // Navigation might be needed if API returns navigation instructions.
              break;
            case 'recommend':
              // Recommend specific items if needed.
              break;
          }
        });
      }
    } catch (e) {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: "I apologize, but I'm having trouble connecting to my culinary database. How else can I help?" }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#1A1A1A" />
        </Pressable>
        <View style={styles.headerTitleRow}>
          <Sparkles size={18} color="#C1A87D" />
          <Text style={styles.headerTitle}>AI Concierge</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView 
        ref={scrollRef}
        style={styles.chatArea} 
        contentContainerStyle={styles.chatContent}
      >
        {messages.map(msg => (
          <View key={msg.id} style={[styles.messageBubble, msg.role === 'user' ? styles.userBubble : styles.botBubble]}>
            <View style={styles.avatar}>
               {msg.role === 'user' ? <User size={14} color="#666" /> : <Bot size={14} color="#C1A87D" />}
            </View>
            <View style={[styles.msgTextContainer, msg.role === 'user' && styles.userBubble_text]}>
              <Text style={[styles.messageText, msg.role === 'user' ? styles.userText : styles.botText]}>
                {msg.content}
              </Text>
            </View>
          </View>
        ))}
        {loading && (
           <View style={[styles.messageBubble, styles.botBubble]}>
              <View style={styles.avatar}>
                 <Bot size={14} color="#C1A87D" />
              </View>
              <View style={styles.msgTextContainer}>
                 <ActivityIndicator color="#C1A87D" size="small" />
              </View>
           </View>
        )}
      </ScrollView>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {messages.length === 1 && !loading && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsScroll}>
            {SUGGESTIONS.map((sug, i) => (
              <Pressable key={i} style={styles.suggestionChip} onPress={() => handleSend(sug)}>
                <Text style={styles.suggestionText}>{sug}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
        <View style={styles.inputArea}>
          <View style={styles.inputContainer}>
            <TextInput 
              placeholder="Ask anything..."
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={() => handleSend()}
            />
            <Pressable onPress={() => handleSend()} style={styles.sendBtn} disabled={loading}>
              <Send size={20} color={input.trim() ? "#1A1A1A" : "#9CA3AF"} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 8,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'serif',
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    padding: 20,
    paddingBottom: 40,
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: 24,
    maxWidth: '85%',
    gap: 10,
    alignItems: 'flex-start',
  },
  userBubble: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  botBubble: {
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  msgTextContainer: {
    flexShrink: 1,
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  userBubble_text: {
    backgroundColor: '#1A1A1A',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#1A1A1A',
  },
  userText: {
    color: '#FFF',
  },
  botText: {
    color: '#374151',
    fontStyle: 'italic',
  },
  suggestionsScroll: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 10,
    marginTop: 10,
  },
  suggestionChip: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  suggestionText: {
    color: '#1A1A1A',
    fontSize: 14,
    fontWeight: '500',
  },
  inputArea: {
    padding: 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 99,
    paddingHorizontal: 20,
    height: 56,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
  },
  sendBtn: {
    padding: 8,
  }
});
