import { ThemedView } from '@/shared/themes/themed-view';
import { OccurrencesRouteMap } from '@/ui/field-works/components/occurrences-route-map';
import { OccurrencesMapProvider } from '@/ui/field-works/view-models/useOccurrencesMap';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OccurrencesRouteScreen() {
  return (
    <ThemedView style={{ flex: 1, paddingHorizontal: 16 }}>
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        <OccurrencesMapProvider>
          <OccurrencesRouteMap />
        </OccurrencesMapProvider>
      </SafeAreaView>
    </ThemedView>
  );
}
