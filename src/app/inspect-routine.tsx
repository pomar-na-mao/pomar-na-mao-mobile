import { ThemedView } from '@/shared/themes/themed-view';
import { InspectRoutineList } from '@/ui/inspect-routines/components/inspect-routine-list';
import { InspectRoutineProvider } from '@/ui/inspect-routines/view-models/useInspectRoutine';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function InspectRoutineScreen() {
  return (
    <ThemedView style={{ flex: 1, paddingHorizontal: 16 }}>
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        <InspectRoutineProvider>
          <InspectRoutineList />
        </InspectRoutineProvider>
      </SafeAreaView>
    </ThemedView>
  );
}
