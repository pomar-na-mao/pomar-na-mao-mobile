import { initializeDatabases } from '@/data/services/sqlite/initialize-sqlite-database';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';

import { AlertBox } from '@/ui/shared/components/alert-box';
import { LoadingOverlay } from '@/ui/shared/components/LoadingOverlay';
import { SplashScreenProvider } from '@/ui/shared/hooks/useSplashScreen';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const queryClient = new QueryClient();

function MainLayout() {
  return (
    <>
      <Stack screenOptions={{ animation: 'fade' }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="field-works" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SQLiteProvider databaseName="pomar-na-mao.db" onInit={initializeDatabases}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <SplashScreenProvider>
          <QueryClientProvider client={queryClient}>
            <GestureHandlerRootView>
              <MainLayout />
              <LoadingOverlay />
              <AlertBox />
            </GestureHandlerRootView>
          </QueryClientProvider>
        </SplashScreenProvider>
      </ThemeProvider>
    </SQLiteProvider>
  );
}
