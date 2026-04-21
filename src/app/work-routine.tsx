import { ThemedView } from '@/shared/themes/themed-view';
import { WorkRoutineMap } from '@/ui/field-works/components/work-routine-map';
import { WorkRoutineMapProvider } from '@/ui/field-works/view-models/useWorkRoutineMap';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WorkRoutineScreen() {
  return (
    <ThemedView style={{ flex: 1, paddingHorizontal: 16 }}>
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        <WorkRoutineMapProvider>
          <WorkRoutineMap />
        </WorkRoutineMapProvider>
      </SafeAreaView>
    </ThemedView>
  );
}
