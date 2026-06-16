import type { InspectionChangeType } from '@/domain/models/inspection';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { useInspection } from '@/ui/inspection/view-models/use-inspection';
import Button from '@/ui/shared/components/Button';
import ThemedDropdown from '@/ui/shared/components/form/dropdown/ThemedDropdown';
import React, { useMemo, useState } from 'react';
import {
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

const changeOptions: { label: string; value: InspectionChangeType }[] = [
  { label: 'Adicionar ocorrência', value: 'add_occurrence' },
  { label: 'Remover ocorrência', value: 'remove_occurrence' },
];

export const NearestPlantModal = () => {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];
  const { nearestPlant, filterOptions, isNearestPlantModalVisible, closeNearestPlantModal, saveOccurrenceChange } =
    useInspection();
  const [changeType, setChangeType] = useState<InspectionChangeType>('add_occurrence');
  const [occurrenceTypeId, setOccurrenceTypeId] = useState<string | null>(null);
  const [severity, setSeverity] = useState('');
  const [notes, setNotes] = useState('');

  const occurrenceOptions = useMemo(
    () => filterOptions.occurrenceTypes.map((occurrence) => ({ label: occurrence.name, value: occurrence.id })),
    [filterOptions.occurrenceTypes],
  );
  const plantShortId = nearestPlant?.plantId.slice(0, 8);
  const distanceLabel = nearestPlant?.distanceMeters ? `${nearestPlant.distanceMeters.toFixed(1)} m` : '-';

  const submit = async () => {
    const occurrence = filterOptions.occurrenceTypes.find((item) => item.id === occurrenceTypeId);

    if (!occurrence) {
      return;
    }

    await saveOccurrenceChange({
      changeType,
      occurrence,
      severity: severity.trim() || null,
      notes: notes.trim() || null,
    });
    setSeverity('');
    setNotes('');
  };

  return (
    <Modal
      visible={isNearestPlantModalVisible}
      transparent
      animationType="fade"
      onRequestClose={closeNearestPlantModal}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        testID="nearest-plant-keyboard-avoiding-view"
      >
        <Pressable style={styles.overlay} onPress={closeNearestPlantModal}>
          <Pressable style={[styles.content, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>Planta mais próxima</Text>
              <Text style={[styles.subtitle, { color: colors.disabledText }]}>Ações para a planta detectada</Text>
            </View>

            {nearestPlant ? (
              <>
                <ScrollView
                  contentContainerStyle={styles.scrollContent}
                  keyboardDismissMode="on-drag"
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  style={styles.scroll}
                  testID="nearest-plant-scroll"
                >
                  <View style={styles.metaRow}>
                    <View style={[styles.metaItem, { backgroundColor: theme === 'dark' ? '#243B2A' : '#E8F3E8' }]}>
                      <Text style={[styles.metaLabel, { color: colors.disabledText }]}>ID</Text>
                      <Text numberOfLines={1} style={[styles.metaValue, { color: colors.text }]}>
                        {plantShortId}
                      </Text>
                    </View>
                    <View style={[styles.metaItem, { backgroundColor: theme === 'dark' ? '#263B46' : '#E7F1F8' }]}>
                      <Text style={[styles.metaLabel, { color: colors.disabledText }]}>Distância</Text>
                      <Text numberOfLines={1} style={[styles.metaValue, { color: colors.text }]}>
                        {distanceLabel}
                      </Text>
                    </View>
                    <View style={[styles.metaItem, { backgroundColor: theme === 'dark' ? '#3B2F1F' : '#FFF4DE' }]}>
                      <Text style={[styles.metaLabel, { color: colors.disabledText }]}>Zona</Text>
                      <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.metaValue, { color: colors.text }]}>
                        {nearestPlant.zoneName ?? 'Não informada'}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Ocorrências atuais</Text>
                  {nearestPlant.occurrences.length > 0 ? (
                    <View style={styles.occurrenceList}>
                      {nearestPlant.occurrences.map((occurrence) => (
                        <View
                          key={`${occurrence.occurrenceTypeId}:${occurrence.status}`}
                          style={[styles.occurrence, { backgroundColor: theme === 'dark' ? '#3B2F1F' : '#FFF4DE' }]}
                        >
                          <Text
                            numberOfLines={1}
                            ellipsizeMode="tail"
                            style={[styles.occurrenceName, { color: colors.text }]}
                          >
                            {occurrence.name}
                          </Text>
                          {occurrence.severity ? (
                            <Text style={[styles.occurrenceSeverity, { color: colors.warning }]}>
                              {occurrence.severity}
                            </Text>
                          ) : null}
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View style={[styles.emptyState, { backgroundColor: colors.neutralButtonBackground }]}>
                      <Text style={[styles.emptyText, { color: colors.disabledText }]}>Sem ocorrências abertas.</Text>
                    </View>
                  )}

                  <View style={styles.form}>
                    <ThemedDropdown
                      label="Ação"
                      options={changeOptions}
                      value={changeType}
                      onSelect={(value) => setChangeType(value as InspectionChangeType)}
                    />
                    <ThemedDropdown
                      label="Ocorrência"
                      options={occurrenceOptions}
                      value={occurrenceTypeId}
                      onSelect={(value) => setOccurrenceTypeId(String(value))}
                    />

                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: colors.inputBackground,
                          borderColor: colors.inputBorder,
                          color: colors.text,
                        },
                      ]}
                      placeholder="Severidade"
                      placeholderTextColor={colors.inputPlaceholder}
                      value={severity}
                      onChangeText={setSeverity}
                    />
                    <TextInput
                      style={[
                        styles.input,
                        styles.notesInput,
                        {
                          backgroundColor: colors.inputBackground,
                          borderColor: colors.inputBorder,
                          color: colors.text,
                        },
                      ]}
                      multiline
                      placeholder="Observações"
                      placeholderTextColor={colors.inputPlaceholder}
                      value={notes}
                      onChangeText={setNotes}
                    />
                  </View>
                </ScrollView>

                <View style={styles.actions}>
                  <Button title="Fechar" variant="secondary" onPress={closeNearestPlantModal} style={styles.button} />
                  <Button title="Salvar" onPress={submit} style={styles.button} disabled={!occurrenceTypeId} />
                </View>
              </>
            ) : (
              <View style={[styles.emptyState, { backgroundColor: colors.neutralButtonBackground }]}>
                <Text style={[styles.emptyText, { color: colors.text }]}>Nenhuma planta próxima detectada.</Text>
              </View>
            )}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 12,
  },
  button: {
    borderRadius: 8,
    flex: 1,
  },
  content: {
    borderRadius: 8,
    borderWidth: 1,
    maxHeight: '90%',
    minHeight: 0,
    padding: 16,
    width: '100%',
  },
  emptyState: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '600',
  },
  form: {
    marginTop: 12,
  },
  header: {
    gap: 3,
    marginBottom: 14,
    width: '100%',
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 15,
    marginBottom: 12,
    minHeight: 48,
    paddingHorizontal: 12,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  metaItem: {
    borderRadius: 8,
    flex: 1,
    gap: 3,
    minWidth: 0,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    minHeight: 58,
    width: '100%',
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  notesInput: {
    minHeight: 84,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  occurrence: {
    borderRadius: 8,
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 8,
    width: '100%',
  },
  occurrenceList: {
    gap: 6,
  },
  occurrenceName: {
    fontSize: 13,
    fontWeight: '800',
  },
  occurrenceSeverity: {
    fontSize: 12,
    fontWeight: '700',
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  scroll: {
    flexShrink: 1,
    minHeight: 0,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 8,
    marginTop: 14,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
});
