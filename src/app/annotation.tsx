import { ThemedView } from '@/shared/themes/themed-view';
import { Annotation } from '@/ui/annotation/components/annotation';
import { AnnotationProvider } from '@/ui/annotation/view-models/useAnnotation';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AnnotationScreen() {
  return (
    <ThemedView style={{ flex: 1, paddingHorizontal: 16 }}>
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        <AnnotationProvider>
          <Annotation />
        </AnnotationProvider>
      </SafeAreaView>
    </ThemedView>
  );
}
