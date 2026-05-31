import type { InspectionFilter } from '@/domain/models/inspection';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import Button from '@/ui/shared/components/Button';
import ThemedDropdown from '@/ui/shared/components/form/dropdown/ThemedDropdown';
import { useInspection } from '@/ui/inspection/view-models/use-inspection';
import React, { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

export const InspectionFilterModal = () => {
  const theme = useColorScheme() ?? 'light';
  const { isFilterModalVisible, closeFilterModal, filterOptions, applyFilters } = useInspection();
  const [zoneId, setZoneId] = useState<string | null>(null);
  const [occurrenceTypeId, setOccurrenceTypeId] = useState<string | null>(null);

  const zoneOptions = useMemo(
    () => filterOptions.zones.map((zone) => ({ label: zone.name, value: zone.id })),
    [filterOptions.zones],
  );
  const occurrenceOptions = useMemo(
    () =>
      filterOptions.occurrenceTypes.map((occurrence) => ({
        label: occurrence.name,
        value: occurrence.id,
      })),
    [filterOptions.occurrenceTypes],
  );

  const submit = () => {
    const selectedZone = filterOptions.zones.find((zone) => zone.id === zoneId);
    const selectedOccurrence = filterOptions.occurrenceTypes.find((occurrence) => occurrence.id === occurrenceTypeId);
    const filters: InspectionFilter = {
      zoneId: selectedZone?.id ?? null,
      zoneName: selectedZone?.name ?? null,
      occurrenceTypeId: selectedOccurrence?.id ?? null,
      occurrenceCode: selectedOccurrence?.code ?? null,
      occurrenceName: selectedOccurrence?.name ?? null,
    };

    applyFilters(filters);
  };

  return (
    <Modal visible={isFilterModalVisible} transparent animationType="fade" onRequestClose={closeFilterModal}>
      <Pressable style={styles.overlay} onPress={closeFilterModal}>
        <Pressable style={[styles.content, { backgroundColor: Colors[theme].card }]}>
          <Text style={[styles.title, { color: Colors[theme].text }]}>Filtro da inspeção</Text>
          <Text style={[styles.subtitle, { color: Colors[theme].disabledText }]}>
            Selecione uma zona, uma ocorrência, ou combine os dois filtros.
          </Text>

          <ThemedDropdown
            label="Zona"
            options={zoneOptions}
            placeholder="Selecionar zona"
            value={zoneId}
            onSelect={(value) => setZoneId(String(value))}
          />

          <ThemedDropdown
            label="Ocorrência"
            options={occurrenceOptions}
            placeholder="Selecionar ocorrência"
            value={occurrenceTypeId}
            onSelect={(value) => setOccurrenceTypeId(String(value))}
          />

          <View style={styles.actions}>
            <Button title="Cancelar" variant="secondary" onPress={closeFilterModal} style={styles.button} />
            <Button title="Carregar" onPress={submit} style={styles.button} />
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
    padding: 16,
    width: '100%',
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    flex: 1,
    justifyContent: 'center',
    padding: 16,
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
});
