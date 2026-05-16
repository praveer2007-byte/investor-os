import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        backgroundColor: '#0A0A0A',
      }}
    />
  );
}
