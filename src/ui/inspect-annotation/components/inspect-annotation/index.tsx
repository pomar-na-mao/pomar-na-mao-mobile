import type { Region } from '@/domain/models/shared/geolocation.model';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { ThemedText } from '@/shared/themes/themed-text';
import { useInspectAnnotation } from '@/ui/inspect-annotation/view-models/useInspectAnnotation';
import { useLoadingStore } from '@/shared/hooks/use-loading';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { darkMapStyle } from '../../../../../mapStyle';
import { UserLocationMarker } from '@/ui/shared/components/user-location-marker';
import { InspectAnnotationInsert } from '../inspect-annotation-insert';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export const InspectAnnotation = () => {
  const [initialRegion, setInitialRegion] = useState<Region | null>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [showAnnotationModal, setShowAnnotationModal] = useState(false);

  const mapRef = useRef<MapView>(null);
  const theme = useColorScheme() ?? 'light';
  const { sendAnnotations, deleteAnnotations, pendingCount } = useInspectAnnotation();
  const { isLoading } = useLoadingStore();

  useEffect(() => {
    let mounted = true;
    let subscription: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (!mounted) return;

      if (status !== 'granted') {
        setPermissionDenied(true);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });

      if (!mounted) return;

      const { latitude, longitude } = currentLocation.coords;

      setUserLocation(currentLocation);
      setInitialRegion({
        latitude,
        longitude,
        latitudeDelta: 0.002,
        longitudeDelta: 0.002,
      });

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Highest,
          distanceInterval: 3,
        },
        (newLocation) => {
          if (!mounted) return;

          setUserLocation(newLocation);

          mapRef.current?.animateCamera(
            {
              center: {
                latitude: newLocation.coords.latitude,
                longitude: newLocation.coords.longitude,
              },
            },
            { duration: 800 },
          );
        },
      );
    })();

    return () => {
      mounted = false;
      subscription?.remove();
    };
  }, []);

  if (permissionDenied) {
    return (
      <View style={styles.centered}>
        <ThemedText type="defaultSemiBold">Permissão de localização negada</ThemedText>
        <ThemedText type="subtitle">
          Habilite a localização nas configurações do dispositivo para usar esta funcionalidade.
        </ThemedText>
      </View>
    );
  }

  if (!initialRegion || !userLocation) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <ThemedText style={{ marginTop: 12 }} type="subtitle">
          Obtendo localização...
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Modal
        visible={showAnnotationModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowAnnotationModal(false)}
      >
        <InspectAnnotationInsert closeMenu={() => setShowAnnotationModal(false)} />
      </Modal>

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={StyleSheet.absoluteFillObject}
          customMapStyle={theme === 'dark' ? darkMapStyle : []}
          initialRegion={initialRegion}
          showsUserLocation={false}
          showsMyLocationButton={false}
        >
          <UserLocationMarker
            coordinate={{
              latitude: userLocation.coords.latitude,
              longitude: userLocation.coords.longitude,
            }}
          />
        </MapView>
      </View>

      <View style={styles.buttonContainer}>
        {pendingCount > 0 && (
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
            <TouchableOpacity
              style={[
                styles.annotateButton,
                {
                  flex: 1,
                  backgroundColor: Colors[theme].background,
                  borderWidth: 1,
                  borderColor: Colors[theme].tint,
                  marginBottom: 0,
                },
              ]}
              onPress={sendAnnotations}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors[theme].tint} size="small" />
              ) : (
                <ThemedText style={[styles.annotateButtonText, { color: Colors[theme].tint }]}>
                  Enviar pendentes ({pendingCount})
                </ThemedText>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.annotateButton,
                {
                  width: 50,
                  backgroundColor: Colors[theme].background,
                  borderWidth: 1,
                  borderColor: '#ef4444',
                  marginBottom: 0,
                  paddingVertical: 0,
                },
              ]}
              onPress={deleteAnnotations}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#ef4444" size="small" />
              ) : (
                <FontAwesome name="trash-o" size={24} color="#ef4444" />
              )}
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[styles.annotateButton, { backgroundColor: Colors[theme].tint }]}
          onPress={() => setShowAnnotationModal(true)}
          activeOpacity={0.8}
        >
          <ThemedText style={styles.annotateButtonText}>Anotar</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
  },
  mapContainer: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 12,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 8,
  },
  buttonContainer: {
    marginBottom: 12,
    gap: 8,
  },
  annotateButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  annotateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
