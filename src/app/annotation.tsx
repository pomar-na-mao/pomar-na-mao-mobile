import { ThemedView } from '@/shared/themes/themed-view';
import { AnnotationScreen } from '@/ui/annotation/components/annotation-screen';
import { AnnotationProvider } from '@/ui/annotation/view-models/use-annotation';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AnnotationRoute() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        <AnnotationProvider>
          <AnnotationScreen />
        </AnnotationProvider>
      </SafeAreaView>
    </ThemedView>
  );
}
