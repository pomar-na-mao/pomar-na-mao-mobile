import type { DropdownItem } from '@/domain/models/shared/forms.model';
import { REGION_COLORS } from '@/shared/constants/colors';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { ThemedText } from '@/shared/themes/themed-text';
import { ThemedView } from '@/shared/themes/themed-view';
import { useMyFarm } from '@/ui/my-farm/view-models/use-my-farm';
import Button from '@/ui/shared/components/Button';
import { ThemedDropdownForm } from '@/ui/shared/components/form/dropdown/ThemedDropdownForm';
import { useOccurrences } from '@/ui/shared/hooks/use-occurrences';
import { useRegionOptions } from '@/ui/shared/hooks/use-regions-options';
import React, { useEffect, useMemo, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import MapView, { Circle, Marker, Polygon, PROVIDER_GOOGLE } from 'react-native-maps';
import { darkMapStyle } from '../../../../../mapStyle';

export const MyFarmView = () => {
  const theme = useColorScheme() ?? 'light';
  const { regions, initialRegion, loading, error, plants, plantsLoading, fetchPlants, clearPlants } = useMyFarm();

  const { data: regionOptions } = useRegionOptions();

  const mapRef = useRef<MapView>(null);

  const { control } = useForm({
    defaultValues: {
      region: '' as string | null,
      occurrence: '' as string | null,
    },
  });

  const selectedRegionName = useWatch({
    control,
    name: 'region',
  });

  const selectedOccurrence = useWatch({
    control,
    name: 'occurrence',
  });

  const options = useMemo(() => {
    const baseOptions = regionOptions ?? [];
    return [{ label: 'Todas as regiões', value: '' }, ...baseOptions];
  }, [regionOptions]);

  const { data: occurrences } = useOccurrences();

  const occurrenceOptions = useMemo(() => {
    const baseOptions = (occurrences as DropdownItem[]) ?? [];
    return [{ label: 'Qualquer ocorrência', value: '' }, ...baseOptions];
  }, [occurrences]);

  useEffect(() => {
    // Clear previously plotted plants when user changes region or occurrence
    clearPlants();

    if (!mapRef.current) return;

    if (!selectedRegionName) {
      // Zoom out to initial region
      if (initialRegion) {
        mapRef.current.animateToRegion(initialRegion, 1000);
      }
      return;
    }

    // Auto-fetch plants when region or occurrence changes
    fetchPlants(selectedRegionName, selectedOccurrence);

    const selectedRegion = regions.find((r) => r.name === selectedRegionName);

    if (selectedRegion && selectedRegion.coordinates.length > 0) {
      mapRef.current.fitToCoordinates(selectedRegion.coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  }, [selectedRegionName, selectedOccurrence, regions, initialRegion, fetchPlants, clearPlants]);

  useEffect(() => {
    if (!mapRef.current || !plants || plants.length === 0) return;

    mapRef.current.fitToCoordinates(
      plants.map((p) => ({ latitude: p.latitude, longitude: p.longitude })),
      {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      },
    );
  }, [plants]);

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <ThemedText style={{ marginTop: 12 }}>Carregando mapa do pomar...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="defaultSemiBold">Erro ao carregar dados</ThemedText>
        <ThemedText>{error}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.mapWrapper}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={
            initialRegion || {
              latitude: -23.397,
              longitude: -49.149,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }
          }
          customMapStyle={theme === 'dark' ? darkMapStyle : []}
        >
          {regions.map((region, index) => (
            <Polygon
              key={`polygon-${region.name}`}
              coordinates={region.coordinates}
              fillColor={REGION_COLORS[index % REGION_COLORS.length]}
              strokeColor={REGION_COLORS[index % REGION_COLORS.length].replace('0.4', '1')}
              strokeWidth={2}
            />
          ))}

          {regions.map(
            (region, index) =>
              region.centroid && (
                <Marker
                  key={`label-${region.name}`}
                  coordinate={region.centroid}
                  anchor={{ x: 0.5, y: 0.5 }}
                  stopPropagation={true}
                >
                  <View
                    style={[
                      styles.labelContainer,
                      { backgroundColor: REGION_COLORS[index % REGION_COLORS.length].replace('0.4', '0.9') },
                    ]}
                  >
                    <ThemedText style={styles.labelText}>{region.name}</ThemedText>
                  </View>
                </Marker>
              ),
          )}

          {plants?.map((plant) => (
            <Circle
              key={`plant-${plant.id}`}
              center={{ latitude: plant.latitude, longitude: plant.longitude }}
              radius={3}
              fillColor={Colors[theme].plantCircle}
              strokeColor={Colors[theme].plantCircle}
              zIndex={2}
            />
          ))}
        </MapView>
      </View>

      <View style={styles.content}>
        <ThemedDropdownForm
          control={control}
          name="region"
          label="Região"
          placeholder="Selecione uma região"
          options={options}

        />
        <ThemedDropdownForm
          control={control}
          name="occurrence"
          label="Ocorrência"
          placeholder="Selecione uma ocorrência"
          options={occurrenceOptions}
        />
        {plantsLoading && (
          <ActivityIndicator size="small" color="#4CAF50" style={{ marginTop: 8 }} />
        )}
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapWrapper: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
    borderRadius: 12,
  },
  map: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  labelText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
