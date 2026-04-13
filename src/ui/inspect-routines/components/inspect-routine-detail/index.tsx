import { detectNearestPlant } from '@/utils/geolocation/geolocation-math';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import { useInspectRoutinesStore } from '@/data/store/inspect-routines/use-inspect-routines-store';
import type { PlantData, Position } from '@/domain/models/shared/plant-data.model';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { ThemedText } from '@/shared/themes/themed-text';
import { darkMapStyle } from '../../../../../mapStyle';
import { InspectRoutineNearestPlantCard } from '../../components/inspect-routine-nearest-plant-card';
import { CardSkeleton } from '../card-skeleton';
import { RoutineMapDetailLoader } from '../routine-map-detail-loader';
import { RoutinePlantsCircles } from '../routine-plants-circles';
import { styles } from './styles';

// For testing: set a mock location
/* 
const goToPoint = (latitude: number, longitude: number) => {
    setTimeout(() => {
      const _location = {
        coords: {
          latitude,
          longitude,
          altitude: 0,
          accuracy: 1,
          altitudeAccuracy: 1,
          heading: 0,
          speed: 0,
        },
        timestamp: Date.now(),
      } as Location.LocationObject;

      setLocation(_location);

    }, 3000);
  };
*/

export const InspectRoutineDetail = () => {
  const [initialLocation, setInitialLocation] = useState<Position | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const { setNearestPlant, nearestPlant, selectedInspection, isDetecting, location, setLocation } =
    useInspectRoutinesStore();

  const mapRef = useRef<MapView>(null);

  const theme = useColorScheme() ?? 'light';

  useEffect(() => {
    if (selectedInspection) {
      const plantsData = JSON.parse(selectedInspection.plant_data as string) as PlantData[];

      if (location && plantsData && isDetecting) {
        const nearestPlant = detectNearestPlant(location, plantsData);
        setNearestPlant(nearestPlant);
      }
    }
  }, [location?.coords.latitude, location?.coords.longitude, initialLocation, selectedInspection, isDetecting]);

  useEffect(() => {
    let mounted = true;
    let subscription!: Location.LocationSubscription;

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status && mounted) {
        if (status !== 'granted') {
          setPermissionDenied(true);
          return;
        }

        await updateCurrentLocation();

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Highest,
            distanceInterval: 3,
          },
          (newLocation) => {
            setLocation(newLocation);

            mapRef.current?.getCamera().then((camera) => {
              camera.center = {
                latitude: newLocation.coords.latitude,
                longitude: newLocation.coords.longitude,
              };

              mapRef.current?.animateCamera(camera, { duration: 800 });
            });
          },
        );
      }
    })();

    return () => {
      mounted = false;

      if (subscription) subscription.remove();

      setNearestPlant(null);
    };
  }, []);

  const updateCurrentLocation = async () => {
    const currentLocation = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest,
      distanceInterval: 0.5,
    });

    const { latitude, longitude } = currentLocation.coords;

    setInitialLocation({ latitude, longitude, latitudeDelta: 0.001, longitudeDelta: 0.001 });
  };

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
                coordinate={{ latitude: location.coords.latitude, longitude: location.coords.longitude }}
              ></Marker>
            ) : null}
            <RoutinePlantsCircles nearestPlant={nearestPlant} selectedRoutine={selectedInspection} />
          </MapView>
        ) : (
          <RoutineMapDetailLoader />
        )}
      </View>

      {/* <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 2 }}>
        <TouchableOpacity
          style={{ padding: 8, backgroundColor: 'lightgray', borderRadius: 4 }}
          onPress={() => goToPoint(-21.23511, -47.790248)}
        >
          <Text>Go to P1</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ padding: 8, backgroundColor: 'lightgray', borderRadius: 4 }}
          onPress={() => goToPoint(-21.234956, -47.790245)}
        >
          <Text>Go to P2</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ padding: 8, backgroundColor: 'lightgray', borderRadius: 4 }}
          onPress={() => goToPoint(-21.234767, -47.790236)}
        >
          <Text>Go to P3</Text>
        </TouchableOpacity>
      </View> */}
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
