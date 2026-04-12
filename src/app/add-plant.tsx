import { ThemedView } from '@/shared/themes/themed-view';
import { AddPlant } from '@/ui/add-plant/components/add-plant';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddPlantScreen() {
  return (
    <ThemedView style={{ flex: 1, paddingHorizontal: 16 }}>
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        <AddPlant />
      </SafeAreaView>
    </ThemedView>
  );
}
