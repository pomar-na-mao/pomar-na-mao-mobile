import { ThemedView } from '@/shared/themes/themed-view';
import { PlantRegistrationScreen } from '@/ui/plant-registration/components/plant-registration-screen';
import { PlantRegistrationProvider } from '@/ui/plant-registration/view-models/use-plant-registration';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PlantRegistrationRoute() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        <PlantRegistrationProvider>
          <PlantRegistrationScreen />
        </PlantRegistrationProvider>
      </SafeAreaView>
    </ThemedView>
  );
}
