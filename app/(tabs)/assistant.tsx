import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MATTE_BLACK = '#0A0A0A';
const GOLD = '#C9A84C';
const WHITE = '#FFFFFF';
const DARK_GRAY = '#1A1A1A';
const LIGHT_GRAY = '#999999';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const AI_RESPONSES: Record<string, string> = {
  'P/E ratio': 'The Price-to-Earnings (P/E) ratio measures how much investors pay per dollar of earnings. A P/E of 20 means investors pay $20 for every $1 of annual earnings. Higher P/E suggests growth expectations; lower P/E may indicate value or risk. Context matters—compare P/E within the same sector.',
  'EPS': 'EPS stands for Earnings Per Share. It\'s calculated by dividing a company\'s net income by the number of outstanding shares. A higher EPS is generally better, as it means the company is generating more profit for each share. However, you should compare EPS growth rates to understand if earnings are improving.',
  'ROIC': 'Return on Invested Capital (ROIC) measures how efficiently a company uses capital to generate profits. It\'s calculated as NOPAT (Net Operating Profit After Tax) divided by Invested Capital. A ROIC higher than the cost of capital indicates the company is creating value. Compare ROIC across competitors in the same industry.',
  'Sharpe ratio': 'The Sharpe ratio measures risk-adjusted returns. It\'s calculated as (Portfolio Return - Risk-Free Rate) / Standard Deviation. A higher Sharpe ratio indicates better returns per unit of risk taken. Ratios above 1.0 are considered good; above 2.0 is very good. It helps compare portfolios fairly.',
  'Diversification': 'Diversification reduces portfolio risk by holding different asset types. A diversified portfolio might include stocks, bonds, ETFs, and cash. The benefit is that when one asset class underperforms, others may perform well, reducing overall volatility. Remember: diversification is a risk management strategy, not a return maximizer.',
  'ETF': 'An ETF (Exchange-Traded Fund) is a basket of securities that trades on stock exchanges like a single stock. ETFs offer diversification, low fees, and tax efficiency. You can buy and sell them during market hours. Popular types include index ETFs (tracking a market index) and sector ETFs (focusing on specific industries).',
  'Index fund': 'An index fund is a fund designed to track a specific market index like the S&P 500. Instead of trying to beat the market, it aims to match the index\'s returns at low cost. Index funds are passively managed, which keeps fees low. They\'re ideal for long-term, hands-off investing.',
  'Compound interest': 'Compound interest is "interest on interest." Your earnings generate their own earnings over time, creating exponential growth. Albert Einstein called it the eighth wonder of the world. For example, $10,000 at 10% annual returns becomes $25,937 in 10 years. Time is your greatest advantage with compounding.',
  'Dollar cost averaging': 'Dollar cost averaging (DCA) means investing a fixed amount regularly, regardless of price. For example, investing $500 monthly buys more shares when prices are low and fewer when prices are high. This reduces the impact of market timing risk and is effective for long-term investors, especially in volatile markets.',
  'FIRE': 'FIRE stands for Financial Independence, Retire Early. It\'s a movement focused on saving aggressively (often 50%+ of income) to build wealth and retire decades before traditional retirement age. The strategy uses compound interest, low expenses, and diversified investments. It requires discipline but can provide freedom and flexibility.',
};

const PERSONALITY_OPTIONS = ['Educational', 'Casual', 'Analytical', 'Motivational', 'Skeptical', 'Storyteller'];

export default function AssistantScreen() {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Welcome to InvestorOS AI. I can explain investing concepts, analyze ratios, summarize macro events, and help you understand your portfolio. What would you like to explore?',
      sender: 'ai',
      timestamp: new Date(Date.now() - 300000),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [selectedPersonality, setSelectedPersonality] = useState('Educational');
  const [showPersonalitySheet, setShowPersonalitySheet] = useState(false);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const findBestResponse = (userMessage: string): string => {
    const lower = userMessage.toLowerCase();

    // Direct keyword matching
    for (const [key, response] of Object.entries(AI_RESPONSES)) {
      if (lower.includes(key.toLowerCase())) {
        return response;
      }
    }

    // Generic fallback responses
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
      return 'Hi there! Feel free to ask me about investing concepts, portfolio analysis, or financial ratios. What interests you?';
    }
    if (lower.includes('help') || lower.includes('what can you')) {
      return 'I can help with: investment concepts like P/E ratio, EPS, ROIC, Sharpe ratio; portfolio strategies like diversification and dollar-cost averaging; and long-term investing approaches like FIRE and index funds. Just ask!';
    }
    if (lower.includes('stock') || lower.includes('invest')) {
      return 'Great question! When evaluating stocks, consider their P/E ratio, EPS growth, ROIC compared to peers, and overall portfolio diversification. What specific aspect would you like to dive deeper into?';
    }
    if (lower.includes('risk')) {
      return 'Risk management is crucial. Diversification across asset classes, using the Sharpe ratio to assess risk-adjusted returns, and dollar-cost averaging can all help reduce risk. What\'s your risk tolerance?';
    }

    return 'That\'s an interesting question! I specialize in investing concepts and portfolio analysis. Try asking about specific metrics like P/E ratio, EPS, or strategies like diversification and compound interest.';
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setMessageCount((prev) => prev + 1);

    // Simulate typing
    setIsTyping(true);
    setTimeout(() => {
      const aiResponse = findBestResponse(inputText);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
    >
      {/* Demo Mode Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerText}>
          AI Assistant — Connect an API key in Settings to enable full AI. Using demo mode.
        </Text>
      </View>

      {/* Top Bar with Personality Selector */}
      <View style={styles.topBar}>
        <View style={styles.spacer} />
        <TouchableOpacity
          style={styles.personalityChip}
          onPress={() => setShowPersonalitySheet(!showPersonalitySheet)}
        >
          <Text style={styles.personalityText}>{selectedPersonality}</Text>
        </TouchableOpacity>
      </View>

      {/* Personality Selection Sheet */}
      {showPersonalitySheet && (
        <View style={styles.personalitySheet}>
          {PERSONALITY_OPTIONS.map((personality) => (
            <TouchableOpacity
              key={personality}
              style={[
                styles.personalityOption,
                selectedPersonality === personality && styles.activePersonalityOption,
              ]}
              onPress={() => {
                setSelectedPersonality(personality);
                setShowPersonalitySheet(false);
              }}
            >
              <Text
                style={[
                  styles.personalityOptionText,
                  selectedPersonality === personality && styles.activePersonalityOptionText,
                ]}
              >
                {personality}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Chat Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageRow,
              message.sender === 'user' ? styles.userMessageRow : styles.aiMessageRow,
            ]}
          >
            {message.sender === 'ai' && <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>AI</Text>
            </View>}
            <View
              style={[
                styles.messageBubble,
                message.sender === 'user' ? styles.userBubble : styles.aiBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  message.sender === 'user' && styles.userMessageText,
                ]}
              >
                {message.text}
              </Text>
              <Text
                style={[
                  styles.messageTime,
                  message.sender === 'user' && styles.userMessageTime,
                ]}
              >
                {formatTime(message.timestamp)}
              </Text>
            </View>
            {message.sender === 'user' && <View style={styles.spacer} />}
          </View>
        ))}

        {isTyping && (
          <View style={styles.messageRow}>
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>AI</Text>
            </View>
            <View style={[styles.messageBubble, styles.aiBubble]}>
              <View style={styles.typingIndicator}>
                <View style={[styles.typingDot, styles.typingDot1]} />
                <View style={[styles.typingDot, styles.typingDot2]} />
                <View style={[styles.typingDot, styles.typingDot3]} />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Demo Mode Upgrade Prompt */}
      {messageCount >= 3 && (
        <View style={styles.upgradePrompt}>
          <Text style={styles.upgradeText}>Upgrade to Plus for unlimited AI</Text>
        </View>
      )}

      {/* Input Bar */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Ask about investing..."
          placeholderTextColor={LIGHT_GRAY}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!inputText.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MATTE_BLACK,
  },
  banner: {
    backgroundColor: DARK_GRAY,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomColor: '#262626',
    borderBottomWidth: 1,
  },
  bannerText: {
    color: LIGHT_GRAY,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomColor: '#262626',
    borderBottomWidth: 1,
  },
  spacer: {
    flex: 1,
  },
  personalityChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderColor: GOLD,
    borderWidth: 1,
  },
  personalityText: {
    color: GOLD,
    fontSize: 12,
    fontWeight: '600',
  },
  personalitySheet: {
    backgroundColor: DARK_GRAY,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomColor: '#262626',
    borderBottomWidth: 1,
  },
  personalityOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 6,
    borderColor: '#262626',
    borderWidth: 1,
  },
  activePersonalityOption: {
    backgroundColor: GOLD,
  },
  personalityOptionText: {
    color: WHITE,
    fontSize: 13,
    fontWeight: '500',
  },
  activePersonalityOptionText: {
    color: MATTE_BLACK,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  aiMessageRow: {
    justifyContent: 'flex-start',
  },
  aiBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  aiBadgeText: {
    color: MATTE_BLACK,
    fontSize: 10,
    fontWeight: '700',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  userBubble: {
    backgroundColor: GOLD,
  },
  aiBubble: {
    backgroundColor: DARK_GRAY,
    borderColor: '#262626',
    borderWidth: 1,
  },
  messageText: {
    color: WHITE,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  userMessageText: {
    color: MATTE_BLACK,
  },
  messageTime: {
    color: LIGHT_GRAY,
    fontSize: 10,
  },
  userMessageTime: {
    color: '#0A0A0A',
    opacity: 0.7,
  },
  typingIndicator: {
    flexDirection: 'row',
    gap: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: LIGHT_GRAY,
  },
  typingDot1: {
    opacity: 1,
  },
  typingDot2: {
    opacity: 0.6,
  },
  typingDot3: {
    opacity: 0.3,
  },
  upgradePrompt: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  upgradeText: {
    color: LIGHT_GRAY,
    fontSize: 12,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderTopColor: '#262626',
    borderTopWidth: 1,
  },
  textInput: {
    flex: 1,
    backgroundColor: DARK_GRAY,
    borderColor: GOLD,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: WHITE,
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: GOLD,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: MATTE_BLACK,
    fontSize: 13,
    fontWeight: '700',
  },
});
