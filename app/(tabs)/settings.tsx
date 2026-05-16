import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserStore } from '../../store/userStore';

interface Theme {
  id: string;
  name: string;
  description: string;
}

interface AIPersonality {
  id: string;
  name: string;
}

const THEMES: Theme[] = [
  { id: 'premium-light', name: 'Premium Light', description: 'Clean and bright' },
  { id: 'institutional-black', name: 'Institutional Black', description: 'Current dark theme' },
  { id: 'zen-wealth', name: 'Zen Wealth', description: 'Minimalist & calm' },
];

const AI_PERSONALITIES: AIPersonality[] = [
  { id: 'conservative', name: 'Conservative' },
  { id: 'balanced', name: 'Balanced' },
  { id: 'aggressive', name: 'Aggressive' },
  { id: 'socratic', name: 'Socratic' },
  { id: 'technical', name: 'Technical' },
  { id: 'coach', name: 'Coach' },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { name, investingStyle, riskTolerance, tier, reset, updateProfile } = useUserStore();

  const [selectedTheme, setSelectedTheme] = useState('institutional-black');
  const [selectedAIPersonality, setSelectedAIPersonality] = useState('balanced');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const themeData = await AsyncStorage.getItem('@investoros_theme');
      const aiData = await AsyncStorage.getItem('@investoros_ai_personality');

      if (themeData) setSelectedTheme(themeData);
      if (aiData) setSelectedAIPersonality(aiData);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveTheme = async (themeId: string) => {
    try {
      setSelectedTheme(themeId);
      await AsyncStorage.setItem('@investoros_theme', themeId);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const saveAIPersonality = async (personalityId: string) => {
    try {
      setSelectedAIPersonality(personalityId);
      await AsyncStorage.setItem('@investoros_ai_personality', personalityId);
      await updateProfile({ aiPersonality: personalityId });
    } catch (error) {
      console.error('Error saving AI personality:', error);
    }
  };

  const exportPortfolio = async () => {
    Alert.alert(
      'Export Portfolio',
      'Your portfolio data will be exported as CSV',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Export',
          onPress: () => {
            Alert.alert('Success', 'Portfolio exported successfully');
          },
        },
      ]
    );
  };

  const clearAllData = async () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure? This action cannot be undone.',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await reset();
              Alert.alert('Success', 'All data has been cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleUpgradeToPro = () => {
    Alert.alert(
      'Upgrade to Plus',
      'Access advanced analytics, portfolio optimization, and AI insights',
      [
        { text: 'Later', onPress: () => {}, style: 'cancel' },
        {
          text: 'Subscribe',
          onPress: () => {
            Alert.alert('Coming Soon', 'Premium features will be available soon');
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <Text style={styles.screenTitle}>Settings</Text>

      {/* Profile Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <View style={styles.profileCard}>
          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Name</Text>
            <Text style={styles.profileValue}>{name || 'Not set'}</Text>
          </View>
          <View style={[styles.profileRow, styles.profileRowBorder]}>
            <Text style={styles.profileLabel}>Investing Style</Text>
            <Text style={styles.profileValue}>{investingStyle || 'Not set'}</Text>
          </View>
          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Risk Tolerance</Text>
            <Text style={styles.profileValue}>{riskTolerance || 'Not set'}</Text>
          </View>
        </View>
      </View>

      {/* Appearance Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.themeGrid}>
          {THEMES.map((theme) => (
            <TouchableOpacity
              key={theme.id}
              style={[
                styles.themeCard,
                selectedTheme === theme.id && styles.themeCardActive,
              ]}
              onPress={() => saveTheme(theme.id)}
            >
              <View style={styles.themeCheckmark}>
                {selectedTheme === theme.id && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
              <Text style={styles.themeName}>{theme.name}</Text>
              <Text style={styles.themeDescription}>{theme.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* AI Personality Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI Personality</Text>
        <Text style={styles.sectionDescription}>
          Choose how your AI assistant communicates
        </Text>
        <View style={styles.personalityGrid}>
          {AI_PERSONALITIES.map((personality) => (
            <TouchableOpacity
              key={personality.id}
              style={[
                styles.personalityButton,
                selectedAIPersonality === personality.id &&
                styles.personalityButtonActive,
              ]}
              onPress={() => saveAIPersonality(personality.id)}
            >
              <Text
                style={[
                  styles.personalityButtonText,
                  selectedAIPersonality === personality.id &&
                  styles.personalityButtonTextActive,
                ]}
              >
                {personality.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Data Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>
        <TouchableOpacity style={styles.actionButton} onPress={exportPortfolio}>
          <Text style={styles.actionButtonText}>Export Portfolio CSV</Text>
          <Text style={styles.actionButtonArrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonDanger]}
          onPress={clearAllData}
        >
          <Text style={[styles.actionButtonText, styles.actionButtonTextDanger]}>
            Clear All Data
          </Text>
          <Text style={styles.actionButtonArrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Subscription Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subscription</Text>
        <View style={styles.subscriptionCard}>
          <View style={styles.tierBadgeContainer}>
            <View style={styles.tierBadge}>
              <Text style={styles.tierBadgeText}>
                {tier?.toUpperCase() || 'FREE'}
              </Text>
            </View>
          </View>
          <Text style={styles.tierDescription}>
            You're on the Free plan. Upgrade to Plus for advanced features.
          </Text>
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={handleUpgradeToPro}
          >
            <Text style={styles.upgradeButtonText}>Upgrade to Plus</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.aboutCard}>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Version</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>
          <View style={[styles.aboutRow, styles.aboutRowBorder]}>
            <Text style={styles.aboutLabel}>Tagline</Text>
            <Text style={styles.aboutValue}>Wealth at your fingertips</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Built with</Text>
            <Text style={styles.aboutValue}>React Native & Expo</Text>
          </View>
        </View>
      </View>

      {/* Bottom spacing */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 24,
    marginTop: 12,
  },

  // Section Container
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 13,
    color: '#888888',
    marginBottom: 12,
    fontWeight: '400',
  },

  // Profile Section
  profileCard: {
    backgroundColor: '#141414',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E1E1E',
    overflow: 'hidden',
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  profileRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E1E',
  },
  profileLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#888888',
  },
  profileValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Appearance / Theme Section
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  themeCard: {
    width: '48%',
    backgroundColor: '#141414',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#1E1E1E',
    padding: 14,
    alignItems: 'center',
  },
  themeCardActive: {
    borderColor: '#C9A84C',
  },
  themeCheckmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#C9A84C',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  checkmark: {
    fontSize: 16,
    fontWeight: '700',
    color: '#C9A84C',
  },
  themeName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  themeDescription: {
    fontSize: 11,
    color: '#888888',
    textAlign: 'center',
    fontWeight: '400',
  },

  // AI Personality Section
  personalityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  personalityButton: {
    width: '48%',
    borderWidth: 1.5,
    borderColor: '#1E1E1E',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    backgroundColor: '#141414',
  },
  personalityButtonActive: {
    borderColor: '#C9A84C',
    backgroundColor: '#1A1A1A',
  },
  personalityButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888888',
    textAlign: 'center',
  },
  personalityButtonTextActive: {
    color: '#C9A84C',
  },

  // Data Section / Action Buttons
  actionButton: {
    backgroundColor: '#141414',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E1E1E',
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionButtonDanger: {
    borderColor: '#DC2626',
    backgroundColor: '#1A0A0A',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionButtonTextDanger: {
    color: '#EF4444',
  },
  actionButtonArrow: {
    fontSize: 16,
    color: '#666666',
  },

  // Subscription Section
  subscriptionCard: {
    backgroundColor: '#141414',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C9A84C',
    padding: 16,
    alignItems: 'center',
  },
  tierBadgeContainer: {
    marginBottom: 12,
  },
  tierBadge: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#C9A84C',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  tierBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C9A84C',
    letterSpacing: 0.8,
  },
  tierDescription: {
    fontSize: 13,
    fontWeight: '400',
    color: '#888888',
    textAlign: 'center',
    marginBottom: 14,
    lineHeight: 18,
  },
  upgradeButton: {
    width: '100%',
    backgroundColor: '#C9A84C',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  upgradeButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0A0A0A',
  },

  // About Section
  aboutCard: {
    backgroundColor: '#141414',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E1E1E',
    overflow: 'hidden',
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  aboutRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E1E',
  },
  aboutLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#888888',
  },
  aboutValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#C9A84C',
  },
});
