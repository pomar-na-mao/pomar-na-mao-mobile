import { ThemedView } from '@/shared/themes/themed-view';
import { InspectionScreen } from '@/ui/inspection/components/inspection-screen';
import { InspectionProvider } from '@/ui/inspection/view-models/use-inspection';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function InspectionRoute() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
        <InspectionProvider>
          <InspectionScreen />
        </InspectionProvider>
      </SafeAreaView>
    </ThemedView>
  );
}
