import { initializeDatabases } from '@/data/services/sqlite/initialize-sqlite-database';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';

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

export type ExpoRouterPath = RelativePathString | ExternalPathString;

const queryClient = new QueryClient();

function MainLayout() {
  const theme = useColorScheme() ?? 'light';

  return (
    <>
      <Stack screenOptions={{ animation: 'fade' }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="field-works" options={{ headerShown: false }} />
        <Stack.Screen name="inspect-routine" options={{ title: 'Rotina de Inspeção' }} />
        <Stack.Screen name="inspect-annotation" options={{ title: 'Rotina de Anotação' }} />
        <Stack.Screen name="routine" options={{ title: 'Rotina de trabalho' }} />
        <Stack.Screen name="add-plant" options={{ title: 'Adicionar Planta' }} />

        <Stack.Screen
          name="(inspect-routine)/inspect-routine-in-action-detection/[id]"
          options={ReturnNavigationOptions('/inspect-routine' as ExpoRouterPath, theme)}
        />
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
