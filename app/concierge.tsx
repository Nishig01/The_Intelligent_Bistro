import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Send, Sparkles, User, Bot, Mic, X, Volume2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useCartStore } from '../frontend/stores/useCartStore';
import { menuData } from '../frontend/data/menu';
import Toast from 'react-native-toast-message';
import SmartImage from '../frontend/components/SmartImage';

const INITIAL_SUGGESTIONS = [
  "What are today's specials?",
  "Recommend a dessert.",
  "I'd like a vegan dinner.",
  "Add Grilled Ribeye medium rare"
];

const VOICE_COMMANDS = [
  "Add Grilled Ribeye medium rare and a chilled Signature Tiramisu to cart",
  "Add two Signature Lemonades and a Velvet Kombucha",
  "What are today's specials?",
  "I'd like to order a vegan dinner, what do you suggest?"
];

type Message = {
  id: number;
  role: 'assistant' | 'user';
  content: string;
  actions?: any[];
};

export default function Concierge() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: 'assistant', content: "Good evening. I am your personal concierge at The Bistro. How may I assist with your culinary selection today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(INITIAL_SUGGESTIONS);
  const [isListening, setIsListening] = useState(false);
  const [listeningText, setListeningText] = useState("Listening to your craving...");
  const scrollRef = useRef<ScrollView>(null);
  
  const { items, addItem, removeItem, updateItemQuantity, clearCart } = useCartStore();

  const handleSend = async (text: string = input) => {
    if (!text.trim() || loading) return;

    const userMessage = text.trim();
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', content: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      // Automatically detect if we are on Expo Metro port 8081 and point to Express port 3000
      let apiBase = process.env.EXPO_PUBLIC_API_URL || '';
      if (!apiBase && Platform.OS === 'web' && typeof window !== 'undefined' && window.location.port === '8081') {
        apiBase = 'http://localhost:3000';
      }

      const response = await fetch(`${apiBase}/api/ai/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, currentCart: items })
      });
      const data = await response.json();

      // Save assistant message alongside actions to render rich product cards
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        role: 'assistant', 
        content: data.message,
        actions: data.actions
      }]);
      
      // Dynamically update suggestion chips
      if (data.suggestions && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
      } else {
        setSuggestions(INITIAL_SUGGESTIONS);
      }
      
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
              if (menuItem) {
                // Pass modifiers, spice levels, and instructions dynamically
                addItem(menuItem, action.quantity || 1, action.modifiers || [], undefined, action.instructions);
                Toast.show({
                  type: 'success',
                  text1: 'Added to Cart',
                  text2: `${action.quantity || 1}x ${menuItem.name} added to your basket.`,
                  position: 'top',
                  topOffset: 60,
                });
              }
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
            case 'clear':
              clearCart();
              break;
            case 'checkout':
              router.push('/checkout');
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

  // Simulate premium voice listening overlay
  const handleMicPress = () => {
    setIsListening(true);
    setListeningText("Listening to your craving...");
    
    // Choose a random gourmet bistro phrase to simulate speaking
    const randomCommand = VOICE_COMMANDS[Math.floor(Math.random() * VOICE_COMMANDS.length)];
    
    setTimeout(() => {
      setListeningText("Processing voice input...");
      setTimeout(() => {
        setIsListening(false);
        handleSend(randomCommand);
      }, 1200);
    }, 1800);
  };

  useEffect(() => {
    // Keep chat auto-scrolled to bottom
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, loading]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Premium Header */}
      <View style={styles.header}>
        <Pressable 
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/');
            }
          }} 
          style={styles.backButton}
        >
          <ChevronLeft size={24} color="#1A1A1A" />
        </Pressable>
        <View style={styles.headerTitleRow}>
          <View style={styles.titleSparkleBg}>
            <Sparkles size={16} color="#FFF" />
          </View>
          <View>
            <Text style={styles.headerTitle}>The Bistro</Text>
            <Text style={styles.headerSubtitle}>AI Concierge Service</Text>
          </View>
        </View>
        <Pressable onPress={() => router.push('/cart')} style={styles.cartIndicatorBtn}>
          <View style={styles.cartDotContainer}>
            <Bot size={18} color="#C1A87D" />
            {items.length > 0 && <View style={styles.cartBadgeDot} />}
          </View>
        </Pressable>
      </View>

      {/* Main Chat Stream */}
      <ScrollView 
        ref={scrollRef}
        style={styles.chatArea} 
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map(msg => (
          <View key={msg.id} style={{ marginBottom: 20 }}>
            {/* Standard Text Bubble */}
            <View style={[styles.messageBubble, msg.role === 'user' ? styles.userBubble : styles.botBubble]}>
              <View style={[styles.avatar, msg.role === 'user' ? styles.userAvatar : styles.botAvatar]}>
                 {msg.role === 'user' ? <User size={14} color="#FFF" /> : <Bot size={14} color="#C1A87D" />}
              </View>
              <View style={[styles.msgTextContainer, msg.role === 'user' ? styles.userBubbleTextContainer : styles.botBubbleTextContainer]}>
                <Text style={[styles.messageText, msg.role === 'user' ? styles.userText : styles.botText]}>
                  {msg.content ? msg.content.replace(/\*\*/g, '') : ''}
                </Text>
              </View>
            </View>

            {/* Premium Rich Interactive Product Cards */}
            {msg.role === 'assistant' && msg.actions && msg.actions.some(a => ['add', 'recommend'].includes(a.type)) && (
              <View style={styles.richCardsContainer}>
                {msg.actions
                  .filter(a => ['add', 'recommend'].includes(a.type))
                  .map((action, idx) => {
                    const menuItem = menuData.find(item => item.id === action.itemId);
                    if (!menuItem) return null;
                    
                    const cartItem = items.find(ci => 
                      ci.id === menuItem.id &&
                      JSON.stringify(ci.selectedModifiers.sort()) === JSON.stringify((action.modifiers || []).sort()) &&
                      ci.instructions === action.instructions
                    );
                    const currentQty = cartItem ? cartItem.quantity : 0;

                    return (
                      <View key={idx} style={styles.richCard}>
                        <SmartImage source={{ uri: menuItem.imageUrl }} style={styles.richCardImage} />
                        <View style={styles.richCardContent}>
                          <Text style={styles.richCardName} numberOfLines={1}>{menuItem.name}</Text>
                          <Text style={styles.richCardPrice}>${menuItem.price.toFixed(2)}</Text>
                          
                          {/* Modifier Labels */}
                          {action.modifiers && action.modifiers.length > 0 && (
                            <View style={styles.modifierBadgeContainer}>
                              {action.modifiers.map((mod: string, mIdx: number) => (
                                <View key={mIdx} style={styles.modifierBadge}>
                                  <Text style={styles.modifierBadgeText}>{mod}</Text>
                                </View>
                              ))}
                            </View>
                          )}
                          
                          {/* Custom Notes / Instructions */}
                          {action.instructions && (
                            <Text style={styles.instructionsText} numberOfLines={1}>
                              Note: {action.instructions}
                            </Text>
                          )}
                        </View>

                        {/* Interactive In-Chat Cart Quantity Controls */}
                        <View style={styles.qtyContainer}>
                          {currentQty > 0 ? (
                            <View style={styles.qtyControls}>
                              <Pressable 
                                onPress={() => removeItem(menuItem.id, 1)} 
                                style={styles.qtyBtn}
                              >
                                <Text style={styles.qtyBtnText}>-</Text>
                              </Pressable>
                              <Text style={styles.qtyText}>{currentQty}</Text>
                              <Pressable 
                                onPress={() => addItem(menuItem, 1, action.modifiers || [], undefined, action.instructions)} 
                                style={styles.qtyBtn}
                              >
                                <Text style={styles.qtyBtnText}>+</Text>
                              </Pressable>
                            </View>
                          ) : (
                            <Pressable 
                              onPress={() => addItem(menuItem, 1, action.modifiers || [], undefined, action.instructions)} 
                              style={styles.addToCartBtn}
                            >
                              <Text style={styles.addToCartBtnText}>Add</Text>
                            </Pressable>
                          )}
                        </View>
                      </View>
                    );
                  })}
              </View>
            )}
          </View>
        ))}
        {loading && (
           <View style={[styles.messageBubble, styles.botBubble]}>
              <View style={[styles.avatar, styles.botAvatar]}>
                 <Bot size={14} color="#C1A87D" />
              </View>
              <View style={[styles.msgTextContainer, styles.botBubbleTextContainer, { paddingVertical: 12 }]}>
                 <ActivityIndicator color="#C1A87D" size="small" />
              </View>
           </View>
        )}
      </ScrollView>

      {/* Suggestion Chips & Message Input Panel */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Dynamic Context-Aware Suggestion Chips */}
        {suggestions.length > 0 && !loading && (
          <View style={styles.suggestionsWrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsScroll}>
              {suggestions.map((sug, i) => (
                <Pressable key={i} style={styles.suggestionChip} onPress={() => handleSend(sug)}>
                  <Sparkles size={12} color="#C1A87D" style={{ marginRight: 4 }} />
                  <Text style={styles.suggestionText}>{sug}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Input Bar */}
        <View style={styles.inputArea}>
          <View style={styles.inputContainer}>
            {/* Elegant Mic Trigger */}
            <Pressable onPress={handleMicPress} style={styles.micBtn}>
              <Mic size={20} color="#C1A87D" />
            </Pressable>
            
            <TextInput 
              placeholder="Address your craving..."
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={() => handleSend()}
            />
            
            {/* Elegant Send Trigger */}
            <Pressable onPress={() => handleSend()} style={styles.sendBtn} disabled={loading}>
              <Send size={20} color={input.trim() ? "#1A1A1A" : "#9CA3AF"} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Simulated Premium Voice Recorder Overlay */}
      {isListening && (
        <View style={styles.voiceOverlay}>
          <View style={styles.voiceModal}>
            <Pressable onPress={() => setIsListening(false)} style={styles.closeVoiceBtn}>
              <X size={20} color="#FFF" />
            </Pressable>
            <View style={styles.voiceRingOuter}>
              <View style={styles.voiceRingInner}>
                <Volume2 size={40} color="#FFF" />
              </View>
            </View>
            <Text style={styles.voiceTitle}>The Bistro Voice</Text>
            <Text style={styles.voiceSubtitle}>{listeningText}</Text>
            <View style={styles.waveBarContainer}>
              <View style={[styles.waveBar, { height: 16 }]} />
              <View style={[styles.waveBar, { height: 32 }]} />
              <View style={[styles.waveBar, { height: 24 }]} />
              <View style={[styles.waveBar, { height: 38 }]} />
              <View style={[styles.waveBar, { height: 12 }]} />
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6', // Sleek slate tone
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  backButton: {
    padding: 8,
    borderRadius: 99,
    backgroundColor: '#F9FAFB',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  titleSparkleBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  cartIndicatorBtn: {
    padding: 8,
    borderRadius: 99,
    backgroundColor: '#F9FAFB',
  },
  cartDotContainer: {
    position: 'relative',
  },
  cartBadgeDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
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
    maxWidth: '85%',
    gap: 12,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  userAvatar: {
    backgroundColor: '#1A1A1A',
  },
  botAvatar: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  msgTextContainer: {
    flexShrink: 1,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  userBubbleTextContainer: {
    backgroundColor: '#1A1A1A',
    borderTopRightRadius: 4,
  },
  botBubbleTextContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#FFF',
    fontWeight: '500',
  },
  botText: {
    color: '#374151',
    fontWeight: '400',
  },
  // Premium Rich Product Cards styles
  richCardsContainer: {
    alignSelf: 'flex-start',
    width: '85%',
    marginLeft: 44,
    marginTop: 10,
    gap: 10,
  },
  richCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  richCardImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  richCardContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  richCardName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  richCardPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: '#C1A87D',
    marginTop: 2,
  },
  modifierBadgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  modifierBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modifierBadgeText: {
    fontSize: 10,
    color: '#4B5563',
    fontWeight: '600',
  },
  instructionsText: {
    fontSize: 10,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 4,
  },
  qtyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 10,
  },
  addToCartBtn: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addToCartBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    padding: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
  },
  qtyBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  qtyText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
    paddingHorizontal: 8,
  },
  // Suggestions UI
  suggestionsWrapper: {
    backgroundColor: 'transparent',
    paddingBottom: 4,
  },
  suggestionsScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 8,
  },
  suggestionText: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '600',
  },
  inputArea: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 99,
    paddingHorizontal: 16,
    height: 54,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  micBtn: {
    padding: 8,
    borderRadius: 99,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '500',
    outlineWidth: 0,
  },
  sendBtn: {
    padding: 8,
    borderRadius: 99,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginLeft: 10,
  },
  // Premium voice overlay styles
  voiceOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(26, 26, 26, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  voiceModal: {
    width: '80%',
    alignItems: 'center',
    position: 'relative',
  },
  closeVoiceBtn: {
    position: 'absolute',
    top: -120,
    right: 0,
    padding: 10,
    borderRadius: 99,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  voiceRingOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(193, 168, 125, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  voiceRingInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#C1A87D',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#C1A87D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  voiceTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  voiceSubtitle: {
    fontSize: 14,
    color: '#C1A87D',
    marginTop: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  waveBarContainer: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    height: 60,
  },
  waveBar: {
    width: 4,
    borderRadius: 2,
    backgroundColor: '#C1A87D',
  }
});
