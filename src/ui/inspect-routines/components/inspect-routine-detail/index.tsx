import { detectNearestPlantWithDistance, twoPointsDistance } from '@/utils/geolocation/geolocation-math';
import * as Location from 'expo-location';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import { useInspectRoutinesStore } from '@/data/store/inspect-routines/use-inspect-routines-store';
import type { PlantData, Position } from '@/domain/models/shared/plant-data.model';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { ThemedText } from '@/shared/themes/themed-text';
import { darkMapStyle } from '../../../../../mapStyle';
import { InspectRoutineNearestPlantCard } from '../../components/inspect-routine-nearest-plant-card';
import { CardSkeleton } from '../card-skeleton';
import { InspectRoutineRouteSimulation } from '../inspect-routine-route-simulation';
import { RoutineMapDetailLoader } from '../routine-map-detail-loader';
import { RoutinePlantsCircles } from '../routine-plants-circles';
import { styles } from './styles';

const CAMERA_ANIMATION_DURATION_MS = 500;
const CAMERA_ANIMATION_INTERVAL_MS = 350;
const INITIAL_REGION_DELTA = 0.001;
const LOCATION_DISTANCE_INTERVAL_METERS = 1;
const LOCATION_TIME_INTERVAL_MS = 500;
const MARKER_ANIMATION_DURATION_MS = 450;
const MIN_LOCATION_CHANGE_METERS = 0.35;
const NEAREST_PLANT_SWITCH_MARGIN_METERS = 0.75;

export const InspectRoutineDetail = () => {
  const [initialLocation, setInitialLocation] = useState<Position | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const { setNearestPlant, nearestPlant, selectedInspection, isDetecting, location, setLocation } =
    useInspectRoutinesStore();

  const mapRef = useRef<MapView>(null);
  const userMarkerRef = useRef<React.ElementRef<typeof Marker>>(null);
  const lastCameraAnimationAtRef = useRef(0);
  const lastLocationRef = useRef<Location.LocationObject | null>(null);
  const isMockingLocationRef = useRef(false);

  const theme = useColorScheme() ?? 'light';

  const plantsData = useMemo<PlantData[]>(() => {
    const routinePlants = selectedInspection?.plant_data;

    if (!routinePlants) {
      return [];
    }

    if (Array.isArray(routinePlants)) {
      return routinePlants;
    }

    try {
      const parsedPlantsData = JSON.parse(routinePlants) as PlantData[];
      return Array.isArray(parsedPlantsData) ? parsedPlantsData : [];
    } catch {
      return [];
    }
  }, [selectedInspection?.plant_data]);

  const animateMapToCoordinate = useCallback((coordinate: { latitude: number; longitude: number }) => {
    userMarkerRef.current?.animateMarkerToCoordinate(coordinate, MARKER_ANIMATION_DURATION_MS);

    const now = Date.now();

    if (now - lastCameraAnimationAtRef.current < CAMERA_ANIMATION_INTERVAL_MS) {
      return;
    }

    lastCameraAnimationAtRef.current = now;
    mapRef.current?.animateCamera({ center: coordinate }, { duration: CAMERA_ANIMATION_DURATION_MS });
  }, []);

  const applyLocationUpdate = useCallback(
    (newLocation: Location.LocationObject) => {
      const coordinate = {
        latitude: newLocation.coords.latitude,
        longitude: newLocation.coords.longitude,
      };

      if (lastLocationRef.current) {
        const previousCoordinate = {
          latitude: lastLocationRef.current.coords.latitude,
          longitude: lastLocationRef.current.coords.longitude,
        };
        const movedDistance = twoPointsDistance(previousCoordinate, coordinate);

        if (movedDistance < MIN_LOCATION_CHANGE_METERS) {
          return;
        }
      }

      lastLocationRef.current = newLocation;
      setLocation(newLocation);
      animateMapToCoordinate(coordinate);
    },
    [animateMapToCoordinate, setLocation],
  );

  const updateCurrentLocation = useCallback(async () => {
    const currentLocation = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest,
      distanceInterval: LOCATION_DISTANCE_INTERVAL_METERS,
    });

    const { latitude, longitude } = currentLocation.coords;

    lastLocationRef.current = currentLocation;
    setInitialLocation({
      latitude,
      longitude,
      latitudeDelta: INITIAL_REGION_DELTA,
      longitudeDelta: INITIAL_REGION_DELTA,
    });
    setLocation(currentLocation);
  }, [setLocation]);

  useEffect(() => {
    if (!location || !isDetecting || plantsData.length === 0) {
      return;
    }

    const nearestPlantDetection = detectNearestPlantWithDistance(location, plantsData);

    if (!nearestPlantDetection) {
      setNearestPlant(null);
      return;
    }

    if (!nearestPlant) {
      setNearestPlant(nearestPlantDetection.plant);
      return;
    }

    if (nearestPlant.id === nearestPlantDetection.plant.id) {
      if (nearestPlant !== nearestPlantDetection.plant) {
        setNearestPlant(nearestPlantDetection.plant);
      }

      return;
    }

    const currentNearestPlant = plantsData.find((plant) => plant.id === nearestPlant.id);

    if (!currentNearestPlant) {
      setNearestPlant(nearestPlantDetection.plant);
      return;
    }

    const userPoint = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
    const currentNearestDistance = twoPointsDistance(userPoint, {
      latitude: currentNearestPlant.latitude,
      longitude: currentNearestPlant.longitude,
    });

    if (currentNearestDistance - nearestPlantDetection.distance >= NEAREST_PLANT_SWITCH_MARGIN_METERS) {
      setNearestPlant(nearestPlantDetection.plant);
    }
  }, [isDetecting, location?.coords.latitude, location?.coords.longitude, nearestPlant, plantsData, setNearestPlant]);

  useEffect(() => {
    let mounted = true;
    let subscription: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (!mounted) {
        return;
      }

      if (status !== 'granted') {
        setPermissionDenied(true);
        return;
      }

      await updateCurrentLocation();

      if (!mounted) {
        return;
      }

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Highest,
          distanceInterval: LOCATION_DISTANCE_INTERVAL_METERS,
          timeInterval: LOCATION_TIME_INTERVAL_MS,
        },
        (newLocation) => {
          if (__DEV__ && isMockingLocationRef.current) {
            return;
          }

          applyLocationUpdate(newLocation);
        },
      );

      if (!mounted) {
        subscription.remove();
      }
    })();

    return () => {
      mounted = false;

      if (subscription) {
        subscription.remove();
      }

      setNearestPlant(null);
      setLocation(null);
    };
  }, [applyLocationUpdate, setLocation, setNearestPlant, updateCurrentLocation]);

  if (permissionDenied) {
    return (
      <View style={localStyles.centered}>
        <ThemedText type="defaultSemiBold">Permissão de localização negada</ThemedText>
        <ThemedText type="subtitle">
          Habilite a localização nas configurações do dispositivo para usar esta funcionalidade.
        </ThemedText>
      </View>
    );
  }

  if (!initialLocation || !location) {
    return (
      <View style={localStyles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <ThemedText style={{ marginTop: 12 }} type="subtitle">
          Obtendo localização...
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'space-between' }}>
      <View style={styles.map}>
        {initialLocation && location ? (
          <MapView
            provider={PROVIDER_GOOGLE}
            ref={mapRef}
            style={{ marginHorizontal: 16, ...StyleSheet.absoluteFillObject }}
            customMapStyle={theme === 'dark' ? darkMapStyle : []}
            initialRegion={initialLocation}
          >
            {location ? (
              <Marker
                ref={userMarkerRef}
                coordinate={{ latitude: location.coords.latitude, longitude: location.coords.longitude }}
                tracksViewChanges={false}
              ></Marker>
            ) : null}
            <RoutinePlantsCircles nearestPlantId={nearestPlant?.id ?? null} plantsData={plantsData} />
          </MapView>
        ) : (
          <RoutineMapDetailLoader />
        )}

        <InspectRoutineRouteSimulation
          applyLocationUpdate={applyLocationUpdate}
          onMockingLocationChange={(isMocking) => {
            isMockingLocationRef.current = isMocking;
          }}
          plantsData={plantsData}
          userLocation={location}
        />
      </View>

      {location ? <InspectRoutineNearestPlantCard location={location} /> : <CardSkeleton />}
    </View>
  );
};

const localStyles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 8,
  },
});
