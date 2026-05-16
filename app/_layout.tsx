import { useEffect, useState } from 'react';
import { Stack, useRouter, useRootNavigationState } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { ThemeProvider } from '../themes/ThemeContext';

export default function RootLayout() {
  const [loading, setLoading] = useState(true);
  const [onboarded, setOnboarded] = useState(false);
  const router = useRouter();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    AsyncStorage.getItem('@investoros_user')
      .then(val => {
        if (val) {
          try {
            const user = JSON.parse(val);
            setOnboarded(!!user.hasCompletedOnboarding);
          } catch {}
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading && navigationState?.key) {
      router.replace(onboarded ? '/(tabs)/' : '/onboarding');
    }
  }, [loading, onboarded, navigationState?.key]);

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="search" />
        <Stack.Screen name="stock/[symbol]" />
      </Stack>
      {loading && (
        <View style={styles.splash}>
          <Text style={styles.logo}>InvestorOS</Text>
          <Text style={styles.tagline}>Wealth. Systems. Discipline.</Text>
          <ActivityIndicator color="#C9A84C" size="small" style={styles.spinner} />
        </View>
      )}
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 1,
  },
  tagline: {
    color: '#C9A84C',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.5,
    marginBottom: 24,
  },
  spinner: {
    marginTop: 8,
  },
});
