import { ThemedView } from '@/shared/themes/themed-view';
import { InspectAnnotation } from '@/ui/inspect-annotation/components/inspect-annotation';
import { InspectAnnotationProvider } from '@/ui/inspect-annotation/view-models/useInspectAnnotation';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function InspectAnnotationScreen() {
  return (
    <ThemedView style={{ flex: 1, paddingHorizontal: 16 }}>
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        <InspectAnnotationProvider>
          <InspectAnnotation />
        </InspectAnnotationProvider>
      </SafeAreaView>
    </ThemedView>
  );
}
