import '../global.css';

import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { useAuth } from '../hooks/useAuth';

export default function RootLayout() {
  const { user, loading } = useAuth();
  const segments          = useSegments();
  const router            = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  if (loading) {
    return <View className="flex-1 bg-surface" />;
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)"  options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)"  options={{ headerShown: false }} />
        <Stack.Screen
          name="modals/add-property"
          options={{ presentation: 'modal', headerShown: false }}
        />
        <Stack.Screen
          name="modals/add-tenant"
          options={{ presentation: 'modal', headerShown: false }}
        />
        <Stack.Screen
          name="modals/add-contract"
          options={{ presentation: 'modal', headerShown: false }}
        />
        <Stack.Screen
          name="modals/property-detail"
          options={{ presentation: 'modal', headerShown: false }}
        />
        <Stack.Screen
          name="modals/tenant-detail"
          options={{ presentation: 'modal', headerShown: false }}
        />
      </Stack>
    </>
  );
}
