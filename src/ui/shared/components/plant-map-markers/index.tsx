import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import React, { memo, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { getPlantMapMarkerId } from './helpers';
import type { PlantMapClusterVisualization, PlantMapVisualization } from './visualization';

export interface PlantMapMarkerData {
  id?: string;
  plantId?: string;
  latitude: number;
  longitude: number;
  isChanged?: boolean;
  isHighlighted?: boolean;
  markerBorderColor?: string;
  markerFillColor?: string;
}

interface PlantMapMarkersProps {
  plantsData?: PlantMapMarkerData[];
  visualization?: PlantMapVisualization[];
  nearestPlantId?: string | null;
  onPlantPress?: (plant: PlantMapMarkerData) => void;
  onClusterPress?: (cluster: PlantMapClusterVisualization) => void;
}

interface PlantMapMarkerProps {
  marker: PlantMapMarkerData;
  isNearestPlant: boolean;
  onPlantPress?: (plant: PlantMapMarkerData) => void;
  tracksViewChanges: boolean;
}

const MARKER_SNAPSHOT_DELAY_MS = 250;

const MARKER_COLORS = {
  changed: {
    dark: {
      border: '#2563EB',
      fill: '#60A5FA',
    },
    light: {
      border: '#024C76',
      fill: '#0369A1',
    },
  },
  nearest: {
    border: '#8F1D1D',
    fill: '#D32F2F',
  },
  plant: {
    dark: {
      border: '#5FA863',
      fill: 'rgba(151, 214, 155, 1)',
    },
    light: {
      border: '#172E19',
      fill: 'rgba(43, 76, 44, 1)',
    },
  },
} as const;

const PlantMapMarker = memo(({ marker, isNearestPlant, onPlantPress, tracksViewChanges }: PlantMapMarkerProps) => {
  const theme = useColorScheme() ?? 'light';
  const markerId = getPlantMapMarkerId(marker);
  const isChanged = marker.isChanged ?? false;
  const markerColors = isNearestPlant
    ? MARKER_COLORS.nearest
    : isChanged
      ? MARKER_COLORS.changed[theme]
      : MARKER_COLORS.plant[theme];
  const fillColor = marker.markerFillColor ?? markerColors.fill;
  const borderColor = marker.markerBorderColor ?? markerColors.border;

  return (
    <Marker
      coordinate={{
        latitude: marker.latitude,
        longitude: marker.longitude,
      }}
      anchor={{ x: 0.5, y: 0.5 }}
      onPress={onPlantPress ? () => onPlantPress(marker) : undefined}
      testID={`plant-map-marker-${markerId}`}
      tracksViewChanges={tracksViewChanges}
      zIndex={isNearestPlant ? 20 : isChanged ? 15 : 10}
    >
      <View
        style={[
          styles.marker,
          {
            backgroundColor: fillColor,
            borderColor,
          },
        ]}
        testID={`plant-map-marker-circle-${markerId}`}
      />
    </Marker>
  );
});

PlantMapMarker.displayName = 'PlantMapMarker';

const PlantMapClusterMarker = memo(
  ({
    cluster,
    onPress,
    tracksViewChanges,
  }: {
    cluster: PlantMapClusterVisualization;
    onPress?: (cluster: PlantMapClusterVisualization) => void;
    tracksViewChanges: boolean;
  }) => (
    <Marker
      anchor={{ x: 0.5, y: 0.5 }}
      coordinate={{ latitude: cluster.latitude, longitude: cluster.longitude }}
      onPress={onPress ? () => onPress(cluster) : undefined}
      testID={`plant-map-cluster-${cluster.id}`}
      tracksViewChanges={tracksViewChanges}
      zIndex={5}
    >
      <View style={[styles.cluster, cluster.highlightedCount > 0 && styles.highlightedCluster]}>
        <View accessibilityLabel={`${cluster.count} plantas`} style={styles.clusterCountBadge}>
          <Text style={styles.clusterText}>{cluster.count}</Text>
        </View>
      </View>
    </Marker>
  ),
);

PlantMapClusterMarker.displayName = 'PlantMapClusterMarker';

export const PlantMapMarkers: React.FC<PlantMapMarkersProps> = memo(
  ({ plantsData = [], visualization, nearestPlantId, onPlantPress, onClusterPress }) => {
    const items: PlantMapVisualization[] =
      visualization ??
      plantsData.map((plant) => ({
        type: 'plant' as const,
        id: getPlantMapMarkerId(plant),
        plant,
        isPriority: nearestPlantId === getPlantMapMarkerId(plant),
      }));
    const visualKey = useMemo(
      () =>
        items
          .map((item) =>
            item.type === 'cluster'
              ? `${item.id}:${item.count}:${item.highlightedCount}`
              : [
                  item.id,
                  item.isPriority,
                  item.plant.isChanged,
                  item.plant.markerBorderColor,
                  item.plant.markerFillColor,
                ].join(':'),
          )
          .join('|'),
      [items],
    );
    const [tracksViewChanges, setTracksViewChanges] = useState(true);

    useEffect(() => {
      setTracksViewChanges(true);
      const timeout = setTimeout(() => setTracksViewChanges(false), MARKER_SNAPSHOT_DELAY_MS);
      return () => clearTimeout(timeout);
    }, [visualKey]);

    return (
      <>
        {items.map((item) => {
          if (item.type === 'cluster') {
            return (
              <PlantMapClusterMarker
                cluster={item}
                key={item.id}
                onPress={onClusterPress}
                tracksViewChanges={tracksViewChanges}
              />
            );
          }

          return (
            <PlantMapMarker
              key={item.id}
              marker={item.plant}
              isNearestPlant={nearestPlantId === item.id || item.isPriority}
              onPlantPress={onPlantPress}
              tracksViewChanges={tracksViewChanges}
            />
          );
        })}
      </>
    );
  },
);

PlantMapMarkers.displayName = 'PlantMapMarkers';

const styles = StyleSheet.create({
  cluster: {
    alignItems: 'center',
    backgroundColor: '#D1E2D2',
    borderColor: '#2B4C2C',
    borderRadius: 18,
    borderWidth: 2,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  clusterCountBadge: { alignItems: 'center', justifyContent: 'center' },
  clusterText: { color: '#172E19', fontSize: 12, fontWeight: '800' },
  highlightedCluster: { backgroundColor: '#F59E0B', borderColor: '#92400E' },
  marker: {
    borderRadius: 8,
    borderWidth: 2,
    height: 16,
    width: 16,
  },
});
