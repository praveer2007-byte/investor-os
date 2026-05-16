import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLORS = {
  black: '#0A0A0A',
  darkSurface: '#141414',
  gold: '#C9A84C',
  white: '#FFFFFF',
  gray: '#808080',
  lightGray: '#404040',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },
  progressBarContainer: {
    height: 3,
    backgroundColor: COLORS.lightGray,
    marginBottom: 32,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.gold,
  },
  stepLabel: {
    fontSize: 12,
    color: COLORS.gray,
    fontFamily: 'Inter',
    marginBottom: 8,
    fontWeight: '500',
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 24,
    fontFamily: 'Inter',
  },
  section: {
    marginBottom: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 16,
    fontFamily: 'Inter',
  },
  input: {
    backgroundColor: COLORS.darkSurface,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.white,
    fontFamily: 'Inter',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  inputPlaceholder: {
    color: COLORS.gray,
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  card: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.darkSurface,
  },
  cardSelected: {
    borderColor: COLORS.gold,
  },
  cardText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
    fontFamily: 'Inter',
    textAlign: 'center',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.darkSurface,
    marginBottom: 8,
  },
  chipSelected: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.darkSurface,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.white,
    fontFamily: 'Inter',
  },
  chipTextSelected: {
    color: COLORS.gold,
  },
  buttonContainer: {
    marginTop: 32,
    marginBottom: 0,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: COLORS.gold,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gold,
    fontFamily: 'Inter',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 10, 10, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});

type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced';
type InvestingStyle = 'Growth' | 'Dividend' | 'Value' | 'Passive' | 'Mixed';
type InvestingGoal = 'FIRE' | 'Wealth Building' | 'Passive Income' | 'Retirement' | 'Education' | 'Other';

export default function ProfileScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1 - Name
  const [name, setName] = useState('');

  // Step 2 - Experience
  const [experience, setExperience] = useState<ExperienceLevel | null>(null);

  // Step 3 - Investing Style
  const [investingStyle, setInvestingStyle] = useState<InvestingStyle | null>(null);

  // Step 4 - Goals
  const [goals, setGoals] = useState<InvestingGoal[]>([]);

  const experienceLevels: ExperienceLevel[] = ['Beginner', 'Intermediate', 'Advanced'];
  const investingStyles: InvestingStyle[] = ['Growth', 'Dividend', 'Value', 'Passive', 'Mixed'];
  const investingGoals: InvestingGoal[] = [
    'FIRE',
    'Wealth Building',
    'Passive Income',
    'Retirement',
    'Education',
    'Other',
  ];

  const toggleGoal = (goal: InvestingGoal) => {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleContinue = async () => {
    if (currentStep === 1 && !name.trim()) {
      // Simple validation: require name
      return;
    }

    if (currentStep === 2 && !experience) {
      return;
    }

    if (currentStep === 3 && !investingStyle) {
      return;
    }

    if (currentStep === 4 && goals.length === 0) {
      return;
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      return;
    }

    // Final step - save and redirect
    setLoading(true);
    try {
      const userData = {
        hasCompletedOnboarding: true,
        name: name.trim(),
        experience,
        investingStyle,
        goals,
        completedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem('@investoros_user', JSON.stringify(userData));
      router.replace('/(tabs)/');
    } catch (error) {
      console.error('Failed to save user data:', error);
      setLoading(false);
    }
  };

  const progressPercentage = (currentStep / 4) * 100;

  const renderStep1 = () => (
    <View style={styles.section}>
      <Text style={styles.stepLabel}>Step 1 of 4</Text>
      <Text style={styles.stepTitle}>Your Name</Text>
      <View>
        <Text style={styles.label}>What should we call you?</Text>
        <TextInput
          style={[styles.input, styles.inputPlaceholder]}
          placeholder="Enter your name"
          placeholderTextColor={COLORS.gray}
          value={name}
          onChangeText={setName}
          editable={!loading}
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.section}>
      <Text style={styles.stepLabel}>Step 2 of 4</Text>
      <Text style={styles.stepTitle}>Your Experience</Text>
      <View>
        <Text style={styles.label}>Your investing experience</Text>
        <View style={styles.cardContainer}>
          {experienceLevels.map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.card,
                experience === level && styles.cardSelected,
              ]}
              onPress={() => setExperience(level)}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.cardText}>{level}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.section}>
      <Text style={styles.stepLabel}>Step 3 of 4</Text>
      <Text style={styles.stepTitle}>Your Investing Style</Text>
      <View>
        <Text style={styles.label}>Your investing style</Text>
        <View style={styles.chipContainer}>
          {investingStyles.map((style) => (
            <TouchableOpacity
              key={style}
              style={[
                styles.chip,
                investingStyle === style && styles.chipSelected,
              ]}
              onPress={() => setInvestingStyle(style)}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.chipText,
                  investingStyle === style && styles.chipTextSelected,
                ]}
              >
                {style}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.section}>
      <Text style={styles.stepLabel}>Step 4 of 4</Text>
      <Text style={styles.stepTitle}>Your Goals</Text>
      <View>
        <Text style={styles.label}>What are you investing for?</Text>
        <View style={styles.chipContainer}>
          {investingGoals.map((goal) => (
            <TouchableOpacity
              key={goal}
              style={[
                styles.chip,
                goals.includes(goal) && styles.chipSelected,
              ]}
              onPress={() => toggleGoal(goal)}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.chipText,
                  goals.includes(goal) && styles.chipTextSelected,
                ]}
              >
                {goal}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${progressPercentage}%` },
            ]}
          />
        </View>

        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleContinue}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>
              {currentStep === 4 ? 'Complete' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color={COLORS.gold} size="large" />
        </View>
      )}
    </SafeAreaView>
  );
}
