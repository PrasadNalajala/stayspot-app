import { Navbar } from '@/components/Navbar';
import { SplashScreen } from '@/components/SplashScreen';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';

function RootNavigation() {
  const { isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    } else if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, segments]);

  const handleProfilePress = () => {
    router.push('/profile');
  };

  return (
    <>
      {segments[0] !== '(auth)' && <Navbar onProfilePress={handleProfilePress} />}
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="property/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="property/edit/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="messages/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="messages" options={{ headerShown: false }} />
        <Stack.Screen name="bookings" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [showSplash, setShowSplash] = useState(true); 

  useEffect(() => {
    if (loaded) {
      const timer = setTimeout(() => {
        setShowSplash(false); 
      }, 2020); 

      return () => clearTimeout(timer);
    }
  }, [loaded]);

  if (!loaded || showSplash) return <SplashScreen />

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RootNavigation />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}

export const options = {
  headerShown: false,
};

