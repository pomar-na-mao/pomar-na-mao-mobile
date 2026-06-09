import { ThemedView } from '@/shared/themes/themed-view';
import { SprayingScreen } from '@/ui/spraying/components/spraying-screen';
import { SprayingProvider } from '@/ui/spraying/view-models/use-spraying';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SprayingRoute() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
        <SprayingProvider>
          <SprayingScreen />
        </SprayingProvider>
      </SafeAreaView>
    </ThemedView>
  );
}
