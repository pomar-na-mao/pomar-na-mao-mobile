import type { PlantMapVisualizationResult } from '@/ui/shared/components/plant-map-markers/visualization';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function PlantMapDiagnostics({ diagnostics }: Pick<PlantMapVisualizationResult, 'diagnostics'>) {
  if (!__DEV__) return null;

  return (
    <View pointerEvents="none" style={styles.container} testID="plant-map-diagnostics">
      <Text style={styles.text}>
        {diagnostics.sourceCount} total · {diagnostics.candidateCount} viewport · {diagnostics.individualCount} plantas
        · {diagnostics.clusterCount} grupos · {diagnostics.durationMs}ms
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,0.68)',
    borderRadius: 6,
    left: 12,
    paddingHorizontal: 7,
    paddingVertical: 4,
    position: 'absolute',
    top: 8,
    zIndex: 50,
  },
  text: { color: '#FFFFFF', fontSize: 10 },
});
