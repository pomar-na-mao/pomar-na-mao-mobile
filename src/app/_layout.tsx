import { initializeDatabases } from '@/data/services/sqlite/initialize-sqlite-database';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';

import { AuthProvider } from '@/ui/auth/view-models/useAuth';
import { AlertBox } from '@/ui/shared/components/alert-box';
import { LoadingOverlay } from '@/ui/shared/components/LoadingOverlay';
import { SplashScreenProvider } from '@/ui/shared/hooks/useSplashScreen';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router, Stack, type ExternalPathString, type RelativePathString } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

type ExpoRouterPath = RelativePathString | ExternalPathString;

const queryClient = new QueryClient();

export const unstable_settings = {
  anchor: '(tabs)',
};

function MainLayout() {
  const theme = useColorScheme() ?? 'light';
  return (
    <>
      <Stack screenOptions={{ animation: 'fade' }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/forgot-password" options={{ headerShown: false }} />
        <Stack.Screen name="field-works" options={ReturnNavigationOptions('/(auth)/login' as ExpoRouterPath, theme)} />
        <Stack.Screen
          name="(inspect-routine)/inspect-routine-in-action-detection/[id]"
          options={ReturnNavigationOptions('/field-works' as ExpoRouterPath, theme)}
        />
        <Stack.Screen
          name="(inspect-routine)/inspect-routine-plants-sync-details/[id]"
          options={ReturnNavigationOptions('/syncs' as ExpoRouterPath, theme)}
        />
        <Stack.Screen name="reports" options={ReturnNavigationOptions('../(tabs)/' as ExpoRouterPath, theme)} />
        <Stack.Screen name="syncs" options={ReturnNavigationOptions('../(tabs)/' as ExpoRouterPath, theme)} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
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
              <AuthProvider>
                <MainLayout />
                <LoadingOverlay />
                <AlertBox />
              </AuthProvider>
            </GestureHandlerRootView>
          </QueryClientProvider>
        </SplashScreenProvider>
      </ThemeProvider>
    </SQLiteProvider>
  );
}

const ReturnNavigationOptions = (route: ExpoRouterPath, theme: 'dark' | 'light') => {
  return {
    headerShown: true,
    title: 'Voltar',
    headerLargeTitleShadowVisible: true,
    headerStyle: {
      backgroundColor: Colors[theme].navHeaderBackgroud,
    },
    headerTitleStyle: {
      color: Colors[theme].text,
    },
    headerLeft: () => {
      return (
        <TouchableOpacity onPress={() => router.replace(route)}>
          <MaterialCommunityIcons name="arrow-left" size={26} color={Colors[theme].icon} style={{ marginRight: 8 }} />
        </TouchableOpacity>
      );
    },
  };
};
