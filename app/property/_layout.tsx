import { Stack } from 'expo-router';

export default function PropertyLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        animation: 'slide_from_right',
        headerBackVisible: true,
        headerBackTitle: 'Explore',
      }}
    />
  );
} 