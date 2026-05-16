import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

const COLORS = {
  black: '#0A0A0A',
  darkSurface: '#141414',
  gold: '#C9A84C',
  white: '#FFFFFF',
  gray: '#808080',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 12,
    fontFamily: 'Inter',
  },
  tagline: {
    fontSize: 16,
    color: COLORS.gold,
    marginBottom: 24,
    fontFamily: 'Inter',
    fontWeight: '500',
  },
  separator: {
    width: 60,
    height: 1,
    backgroundColor: COLORS.gold,
    marginBottom: 48,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 32,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: COLORS.gold,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gold,
    fontFamily: 'Inter',
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    color: COLORS.gray,
    fontFamily: 'Inter',
  },
  linkTextActive: {
    color: COLORS.gold,
  },
});

export default function WelcomeScreen() {
  const router = useRouter();

  const handleBegin = () => {
    router.push('/onboarding/profile');
  };

  const handleExistingAccount = () => {
    router.replace('/(tabs)/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>InvestorOS</Text>
        <Text style={styles.tagline}>Wealth. Systems. Discipline.</Text>
        <View style={styles.separator} />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleBegin}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>Begin</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSection}>
        <TouchableOpacity onPress={handleExistingAccount} activeOpacity={0.7}>
          <Text style={styles.linkText}>
            I already have an{' '}
            <Text style={[styles.linkText, styles.linkTextActive]}>account</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
