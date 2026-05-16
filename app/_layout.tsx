import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';

const COLORS = {
  black: '#0A0A0A',
  gold: '#C9A84C',
};

export default function RootLayout() {
  const [loading, setLoading] = useState(true);
  const [onboarded, setOnboarded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const userDataStr = await AsyncStorage.getItem('@investoros_user');
        if (userDataStr) {
          const userData = JSON.parse(userDataStr);
          setOnboarded(!!userData.hasCompletedOnboarding);
        }
      } catch (error) {
        console.error('Failed to check onboarding status:', error);
        setOnboarded(false);
      } finally {
        setLoading(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!onboarded) {
        router.replace('/onboarding');
      } else {
        router.replace('/(tabs)/');
      }
    }
  }, [loading, onboarded, router]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.black,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator color={COLORS.gold} size="large" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
