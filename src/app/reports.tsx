import { ThemedView } from '@/shared/themes/themed-view';
import { AlteredPlantsChart } from '@/ui/reports/components/AlteredPlantsChart';
import { InspectionsByRegionChart } from '@/ui/reports/components/InspectionsByRegionChart';
import { OccurrenceDistributionChart } from '@/ui/reports/components/OccurrenceDistributionChart';
import { PlantsByRegionChart } from '@/ui/reports/components/PlantsByRegionChart';
import { SummaryCards } from '@/ui/reports/components/SummaryCards';
import { useReportsViewModel } from '@/ui/reports/view-models/useReportsViewModel';
import React from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Reports() {
  const { data, isLoading, refresh } = useReportsViewModel();

  if (isLoading && !data) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </ThemedView>
    );
  }

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
      <ThemedView style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refresh} />
          }
        >
          {data && (
            <>
              <SummaryCards summary={data.summary} />
              <OccurrenceDistributionChart data={data.occurrenceDistribution} />
              <PlantsByRegionChart data={data.plantsByRegion} />
              <InspectionsByRegionChart data={data.inspectionsByRegion} />
              <AlteredPlantsChart data={data.alteredPlants} />
            </>
          )}
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
