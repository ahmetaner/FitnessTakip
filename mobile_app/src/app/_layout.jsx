import { Stack } from 'expo-router';
import { DataProvider } from '../contexts/DataContext';
import { NavigationBar } from 'expo-navigation-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setHidden(true);
      
    }
  }, []);

  return (
    <DataProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </DataProvider>
  );
}
