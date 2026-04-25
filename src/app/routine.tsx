import { ThemedView } from '@/shared/themes/themed-view';
import { RoutineMap } from '@/ui/routines/components/routine-map';
import { RoutineMapProvider } from '@/ui/routines/view-models/useRoutineMap';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RoutineScreen() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
        <RoutineMapProvider>
          <RoutineMap />
        </RoutineMapProvider>
      </SafeAreaView>
    </ThemedView>
  );
}
