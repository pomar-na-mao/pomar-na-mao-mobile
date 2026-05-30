import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { getPlantMapMarkerId } from './helpers';

export interface PlantMapMarkerData {
  id?: string;
  plantId?: string;
  latitude: number;
  longitude: number;
  isChanged?: boolean;
}

interface PlantMapMarkersProps {
  plantsData: PlantMapMarkerData[];
  nearestPlantId?: string | null;
}

interface PlantMapMarkerProps {
  marker: PlantMapMarkerData;
  isNearestPlant: boolean;
}

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

const PlantMapMarker = memo(({ marker, isNearestPlant }: PlantMapMarkerProps) => {
  const theme = useColorScheme() ?? 'light';
  const isChanged = marker.isChanged ?? false;
  const markerColors = isNearestPlant
    ? MARKER_COLORS.nearest
    : isChanged
      ? MARKER_COLORS.changed[theme]
      : MARKER_COLORS.plant[theme];

  return (
    <Marker
      coordinate={{
        latitude: marker.latitude,
        longitude: marker.longitude,
      }}
      anchor={{ x: 0.5, y: 0.5 }}
      zIndex={isNearestPlant ? 20 : isChanged ? 15 : 10}
    >
      <View
        style={[
          styles.marker,
          {
            backgroundColor: markerColors.fill,
            borderColor: markerColors.border,
          },
        ]}
      />
    </Marker>
  );
});

PlantMapMarker.displayName = 'PlantMapMarker';

export const PlantMapMarkers: React.FC<PlantMapMarkersProps> = memo(({ plantsData, nearestPlantId }) => {
  return (
    <>
      {plantsData.map((marker) => {
        const plantId = getPlantMapMarkerId(marker);

        return <PlantMapMarker key={plantId} marker={marker} isNearestPlant={nearestPlantId === plantId} />;
      })}
    </>
  );
});

PlantMapMarkers.displayName = 'PlantMapMarkers';

const styles = StyleSheet.create({
  marker: {
    borderRadius: 8,
    borderWidth: 2,
    height: 16,
    width: 16,
  },
});
