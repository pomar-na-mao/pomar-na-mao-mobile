import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { useLoadingStore } from '@/shared/hooks/use-loading';
import { ThemedText } from '@/shared/themes/themed-text';
import { UserLocationMarker } from '@/ui/shared/components/user-location-marker';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { darkMapStyle } from '../../../../../mapStyle';
import { useAddPlant } from '../../view-models/useAddPlant';

export const AddPlant = () => {
  const { initialRegion, userLocation, permissionDenied, submitPlant, sendPlants, deletePendingPlants, pendingCount } =
    useAddPlant();

  const { isLoading } = useLoadingStore();

  const [isModalVisible, setModalVisible] = useState(false);
  const [regionInput, setRegionInput] = useState('');

  const mapRef = useRef<MapView>(null);
  const theme = useColorScheme() ?? 'light';

  const handleSave = async () => {
    const isPlantLocallyInclude = await submitPlant(regionInput);
    if (isPlantLocallyInclude) {
      setModalVisible(false);
      setRegionInput('');
    }
  };

  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateCamera(
        {
          center: {
            latitude: userLocation.coords.latitude,
            longitude: userLocation.coords.longitude,
          },
        },
        { duration: 800 },
      );
    }
  }, [userLocation]);

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
        <ActivityIndicator size="large" color={Colors[theme].tint} />
        <ThemedText style={{ marginTop: 12 }} type="subtitle">
          Obtendo localização...
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
                styles.addButton,
                {
                  flex: 1,
                  backgroundColor: Colors[theme].background,
                  borderWidth: 1,
                  borderColor: Colors[theme].tint,
                  marginBottom: 0,
                },
              ]}
              onPress={sendPlants}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors[theme].tint} size="small" />
              ) : (
                <ThemedText style={[styles.addButtonText, { color: Colors[theme].tint }]}>
                  Enviar pendentes ({pendingCount})
                </ThemedText>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.addButton,
                {
                  width: 50,
                  backgroundColor: Colors[theme].background,
                  borderWidth: 1,
                  borderColor: '#ef4444',
                  marginBottom: 0,
                  paddingVertical: 0,
                },
              ]}
              onPress={deletePendingPlants}
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
          style={[styles.addButton, { backgroundColor: Colors[theme].tint }]}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <ThemedText style={styles.addButtonText}>Adicionar</ThemedText>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: Colors[theme].background }]}>
            <ThemedText style={styles.modalTitle} type="defaultSemiBold">
              Adicionar Planta
            </ThemedText>

            <TextInput
              style={[styles.input, { color: Colors[theme].text, borderColor: Colors[theme].icon }]}
              placeholder="Digite a região..."
              placeholderTextColor={Colors[theme].icon}
              value={regionInput}
              onChangeText={setRegionInput}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
                disabled={isLoading}
              >
                <ThemedText style={styles.cancelButtonText}>Cancelar</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: Colors[theme].tint }]}
                onPress={handleSave}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <ThemedText style={styles.saveButtonText}>Salvar</ThemedText>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  addButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    padding: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 250,
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 'auto',
    paddingBottom: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#E5E7EB',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
