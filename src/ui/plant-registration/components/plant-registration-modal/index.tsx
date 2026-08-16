import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { PlantRegistrationMap } from '@/ui/plant-registration/components/plant-registration-map';
import { usePlantRegistration } from '@/ui/plant-registration/view-models/use-plant-registration';
import Button from '@/ui/shared/components/Button';
import ThemedDatePicker from '@/ui/shared/components/form/datepicker/ThemedDatePicker';
import ThemedDropdown from '@/ui/shared/components/form/dropdown/ThemedDropdown';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function PlantRegistrationModal() {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];
  const {
    closeModal,
    currentLocation,
    isModalVisible,
    isSaving,
    locationError,
    locationState,
    retryLocation,
    savePlant,
    varieties,
    zones,
  } = usePlantRegistration();
  const [varietyId, setVarietyId] = useState<number | null>(null);
  const [zoneId, setZoneId] = useState<string | null>(null);
  const [plantingDate, setPlantingDate] = useState(new Date());
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isModalVisible) {
      setVarietyId(null);
      setZoneId(null);
      setPlantingDate(new Date());
      setValidationMessage(null);
    }
  }, [isModalVisible]);

  const canSave = Boolean(currentLocation && varietyId && zoneId && !isSaving && locationState === 'ready');

  const handleSave = async () => {
    if (!canSave || !varietyId || !zoneId) {
      setValidationMessage('Preencha variedade, zona, data e aguarde a localização atual.');
      return;
    }
    setValidationMessage(null);
    const saved = await savePlant({ plantingDate: plantingDate.toISOString(), varietyId, zoneId });
    if (!saved) setValidationMessage('Aguarde uma localização GPS recente com precisão de até 5 m.');
  };

  return (
    <Modal animationType="slide" onRequestClose={closeModal} presentationStyle="fullScreen" visible={isModalVisible}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
          <Pressable
            accessibilityLabel="Fechar cadastro de planta"
            accessibilityRole="button"
            disabled={isSaving}
            onPress={closeModal}
            style={[styles.iconButton, { borderColor: colors.cardBorder }]}
          >
            <MaterialIcons color={colors.text} name="close" size={22} />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: colors.text }]}>Nova planta</Text>
            <Text style={[styles.subtitle, { color: colors.disabledText }]}>Posição e dados de plantio</Text>
          </View>
          <View style={styles.headerPlaceholder} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={8}
          style={styles.flex}
        >
          {locationState === 'loading' ? (
            <View accessible accessibilityLabel="Obtendo localização atual" style={styles.locationState}>
              <ActivityIndicator color={colors.tint} size="large" />
              <Text style={[styles.locationStateText, { color: colors.text }]}>Aguardando GPS de alta precisão...</Text>
            </View>
          ) : null}

          {locationState === 'error' ? (
            <View style={[styles.locationError, { backgroundColor: colors.neutralButtonBackground }]}>
              <MaterialIcons color={colors.danger} name="location-off" size={28} />
              <Text accessibilityRole="alert" style={[styles.locationErrorText, { color: colors.text }]}>
                {locationError}
              </Text>
              <Button title="Tentar novamente" onPress={retryLocation} style={styles.retryButton} />
            </View>
          ) : null}

          {currentLocation ? <PlantRegistrationMap location={currentLocation} /> : null}

          <ScrollView
            contentContainerStyle={[styles.form, { backgroundColor: colors.card }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={[styles.formScroll, { backgroundColor: colors.card }]}
            testID="plant-registration-form-scroll"
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Localização capturada</Text>
            {currentLocation?.coords.accuracy != null ? (
              <View style={[styles.accuracyStatus, { backgroundColor: colors.activeTrackColor }]}>
                <MaterialIcons color={colors.tint} name="gps-fixed" size={18} />
                <Text style={[styles.accuracyText, { color: colors.text }]}>
                  Precisão GPS: {currentLocation.coords.accuracy.toFixed(1)} m
                </Text>
              </View>
            ) : null}
            <View style={styles.coordinateRow}>
              <CoordinateField
                label="Latitude"
                value={currentLocation ? currentLocation.coords.latitude.toFixed(7) : ''}
              />
              <CoordinateField
                label="Longitude"
                value={currentLocation ? currentLocation.coords.longitude.toFixed(7) : ''}
              />
            </View>

            <ThemedDropdown
              error={validationMessage && !varietyId ? 'Selecione uma variedade.' : undefined}
              label="Variedade"
              onSelect={(value) => setVarietyId(Number(value))}
              options={varieties.map((item) => ({ label: item.name, value: item.id }))}
              placeholder="Selecione a variedade"
              value={varietyId}
            />
            <ThemedDropdown
              error={validationMessage && !zoneId ? 'Selecione uma zona.' : undefined}
              label="Zona"
              onSelect={(value) => setZoneId(String(value))}
              options={zones.map((item) => ({ label: item.name, value: item.id }))}
              placeholder="Selecione a zona"
              value={zoneId}
            />
            <ThemedDatePicker label="Data de plantio" onChange={setPlantingDate} value={plantingDate} />

            {validationMessage ? (
              <Text accessibilityRole="alert" style={[styles.validation, { color: colors.errorText }]}>
                {validationMessage}
              </Text>
            ) : null}
          </ScrollView>

          <View
            style={[styles.actions, { backgroundColor: colors.card, borderTopColor: colors.cardBorder }]}
            testID="plant-registration-actions"
          >
            <Button
              disabled={isSaving}
              onPress={closeModal}
              style={styles.actionButton}
              title="Cancelar"
              variant="secondary"
            />
            <Button
              disabled={!canSave}
              isLoading={isSaving}
              onPress={() => void handleSave()}
              style={styles.actionButton}
              title="Salvar"
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

function CoordinateField({ label, value }: { label: string; value: string }) {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];
  return (
    <View style={styles.coordinateField}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <TextInput
        accessibilityLabel={`${label}, preenchida automaticamente`}
        accessibilityState={{ disabled: true }}
        editable={false}
        style={[
          styles.coordinateInput,
          { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, color: colors.disabledText },
        ]}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  accuracyStatus: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    minHeight: 40,
    paddingHorizontal: 12,
  },
  accuracyText: { fontSize: 13, fontWeight: '700' },
  actionButton: { flex: 1, borderRadius: 8 },
  actions: { borderTopWidth: 1, flexDirection: 'row', gap: 12, padding: 16 },
  coordinateField: { flex: 1, minWidth: 0 },
  coordinateInput: { borderRadius: 12, borderWidth: 1, fontSize: 16, minHeight: 52, paddingHorizontal: 12 },
  coordinateRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  flex: { flex: 1 },
  form: { padding: 16 },
  formScroll: { flex: 1, minHeight: 0 },
  header: { alignItems: 'center', borderBottomWidth: 1, flexDirection: 'row', minHeight: 64, paddingHorizontal: 16 },
  headerPlaceholder: { height: 44, width: 44 },
  headerText: { alignItems: 'center', flex: 1 },
  iconButton: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 8, marginLeft: 4 },
  locationError: { alignItems: 'center', gap: 10, minHeight: 220, justifyContent: 'center', padding: 24 },
  locationErrorText: { fontSize: 16, lineHeight: 24, textAlign: 'center' },
  locationState: { alignItems: 'center', height: 220, justifyContent: 'center' },
  locationStateText: { fontSize: 16, marginTop: 12 },
  retryButton: { minWidth: 180 },
  safeArea: { flex: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 12 },
  subtitle: { fontSize: 12, lineHeight: 16 },
  title: { fontSize: 18, fontWeight: '800', lineHeight: 24 },
  validation: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
});
