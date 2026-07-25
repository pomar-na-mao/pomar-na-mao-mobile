import type { AnnotationOccurrenceTypeOption } from '@/domain/models/annotation';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { useAnnotation } from '@/ui/annotation/view-models/use-annotation';
import Button from '@/ui/shared/components/Button';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const severityOptions = [
  { label: 'Baixa', value: 'low' },
  { label: 'Média', value: 'medium' },
  { label: 'Alta', value: 'high' },
] as const;

export const AnnotationDataModal = () => {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];
  const {
    closeAnnotationModal,
    currentLocation,
    isAnnotationModalVisible,
    occurrenceTypes,
    saveAnnotation,
    validationMessage,
  } = useAnnotation();
  const [selectedOccurrence, setSelectedOccurrence] = useState<AnnotationOccurrenceTypeOption | null>(null);
  const [severity, setSeverity] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [localValidationMessage, setLocalValidationMessage] = useState<string | null>(null);

  const handleSave = () => {
    if (!selectedOccurrence) {
      setLocalValidationMessage('Selecione o tipo de ocorrência.');
      return;
    }
    setLocalValidationMessage(null);

    void saveAnnotation({
      notes: notes.trim() || null,
      occurrence: selectedOccurrence,
      severity,
    });
  };

  return (
    <Modal visible={isAnnotationModalVisible} transparent animationType="fade" onRequestClose={closeAnnotationModal}>
      <Pressable style={styles.overlay} onPress={closeAnnotationModal}>
        <Pressable style={[styles.content, { backgroundColor: colors.card }]}>
          <Text style={[styles.title, { color: colors.text }]}>Anotação</Text>
          <Text style={[styles.subtitle, { color: colors.disabledText }]}>
            Selecione os dados da ocorrência no ponto atual.
          </Text>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.text }]}>Ocorrência</Text>
              <View style={styles.optionGrid}>
                {occurrenceTypes.map((occurrence) => {
                  const isSelected = selectedOccurrence?.id === occurrence.id;
                  return (
                    <Pressable
                      accessibilityRole="button"
                      key={occurrence.id}
                      onPress={() => {
                        setSelectedOccurrence(occurrence);
                        setLocalValidationMessage(null);
                      }}
                      style={[
                        styles.optionChip,
                        {
                          backgroundColor: isSelected ? colors.tint : colors.background,
                          borderColor: isSelected ? colors.tint : colors.line,
                        },
                      ]}
                    >
                      <Text style={[styles.optionText, { color: isSelected ? '#FFFFFF' : colors.text }]}>
                        {occurrence.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.text }]}>Severidade</Text>
              <View style={styles.optionGrid}>
                {severityOptions.map((option) => {
                  const isSelected = severity === option.value;
                  return (
                    <Pressable
                      accessibilityRole="button"
                      key={option.value}
                      onPress={() => setSeverity(isSelected ? null : option.value)}
                      style={[
                        styles.optionChip,
                        {
                          backgroundColor: isSelected ? colors.tint : colors.background,
                          borderColor: isSelected ? colors.tint : colors.line,
                        },
                      ]}
                    >
                      <Text style={[styles.optionText, { color: isSelected ? '#FFFFFF' : colors.text }]}>
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.text }]}>Observação</Text>
              <TextInput
                multiline
                onChangeText={setNotes}
                placeholder="Opcional"
                placeholderTextColor={colors.disabledText}
                style={[styles.notesInput, { borderColor: colors.line, color: colors.text }]}
                value={notes}
              />
            </View>

            <View style={styles.gpsBox}>
              <Text style={[styles.helperText, { color: colors.disabledText }]}>
                GPS: {currentLocation?.coords.accuracy ? `${currentLocation.coords.accuracy.toFixed(1)} m` : '-'}
              </Text>
              <Text style={[styles.helperText, { color: colors.disabledText }]}>
                Lat/Lng:{' '}
                {currentLocation
                  ? `${currentLocation.coords.latitude.toFixed(6)}, ${currentLocation.coords.longitude.toFixed(6)}`
                  : '-'}
              </Text>
            </View>

            {validationMessage || localValidationMessage ? (
              <Text style={[styles.validationText, { color: colors.danger }]}>
                {validationMessage ?? localValidationMessage}
              </Text>
            ) : null}
          </ScrollView>

          <View style={styles.actions}>
            <Button title="Cancelar" variant="secondary" onPress={closeAnnotationModal} style={styles.button} />
            <Button title="Salvar" onPress={handleSave} style={styles.button} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    borderRadius: 8,
    flex: 1,
  },
  content: {
    borderRadius: 8,
    maxHeight: '80%',
    padding: 16,
    width: '100%',
  },
  gpsBox: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
  },
  notesInput: {
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 84,
    padding: 10,
    textAlignVertical: 'top',
  },
  optionChip: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  scroll: {
    marginBottom: 4,
  },
  section: {
    gap: 8,
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  validationText: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
});
