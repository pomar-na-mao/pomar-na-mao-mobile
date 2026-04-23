import { ThemedView } from '@/shared/themes/themed-view';
import { WorkRoutineMap } from '@/ui/work-routines/components/work-routine-map';
import { WorkRoutineMapProvider } from '@/ui/work-routines/view-models/useWorkRoutineMap';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WorkRoutineScreen() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
        <WorkRoutineMapProvider>
          <WorkRoutineMap />
        </WorkRoutineMapProvider>
      </SafeAreaView>
    </ThemedView>
  );
}
