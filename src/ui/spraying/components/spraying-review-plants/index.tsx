import type { PlantData } from '@/domain/models/shared/plant-data.model';
import type { ReviewOverride } from '@/ui/spraying/view-models/use-spraying';
import { buildPlantsMarkers } from '@/utils/transformation/build-plants-map-markers';
import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { Circle } from 'react-native-maps';

interface SprayingReviewPlantsProps {
  plantsData: PlantData[];
  reviewPreviewIds: Set<string>;
  reviewOverrides: Map<string, ReviewOverride>;
}

const REVIEW_COLORS = {
  preSelected: '#F97316',
  manuallyAdded: '#22C55E',
  manuallyRemoved: '#711ca1ff',
  unsprayed: {
    light: '#3B82F6',
    dark: '#60A5FA',
  },
} as const;

/**
 * Renders plant circles for the review mode.
 * Filters for valid coordinates and uses slightly larger radii for better visibility.
 */
export function SprayingReviewPlants({ plantsData, reviewPreviewIds, reviewOverrides }: SprayingReviewPlantsProps) {
  const theme = useColorScheme() ?? 'light';

  // Memoize markers and filter out any with invalid coordinates
  const markers = useMemo(() => {
    return buildPlantsMarkers(plantsData).filter((m) => m.latitude != null && m.longitude != null);
  }, [plantsData]);

  return (
    <>
      {markers.map((marker) => {
        const override = reviewOverrides.get(marker.id);
        const isPreSelected = reviewPreviewIds.has(marker.id);

        let color: string;
        let radius: number;

        if (override === 'removed') {
          color = REVIEW_COLORS.manuallyRemoved;
          radius = 2.5; // Slightly larger for visibility
        } else if (override === 'added') {
          color = REVIEW_COLORS.manuallyAdded;
          radius = 4.5; // Larger for manual highlights
        } else if (isPreSelected) {
          color = REVIEW_COLORS.preSelected;
          radius = 4.5; // Same as added
        } else {
          color = REVIEW_COLORS.unsprayed[theme];
          radius = 2.5;
        }

        return (
          <Circle
            key={marker.id}
            center={{ latitude: marker.latitude, longitude: marker.longitude }}
            radius={radius}
            strokeWidth={1.5}
            strokeColor={color}
            fillColor={`${color}CC`} // CC = 80% opacity
          />
        );
      })}
    </>
  );
}
