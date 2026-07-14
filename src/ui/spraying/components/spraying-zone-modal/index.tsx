import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import Button from '@/ui/shared/components/Button';
import ThemedDropdown from '@/ui/shared/components/form/dropdown/ThemedDropdown';
import { useSpraying } from '@/ui/spraying/view-models/use-spraying';
import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

export function SprayingZoneModal() {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];
  const { closeZoneSelection, isZoneSelectionVisible, loadZone, selectedZone, zones } = useSpraying();
  const [zoneId, setZoneId] = useState('');
  const [validation, setValidation] = useState<string | null>(null);
  const zoneOptions = useMemo(() => zones.map((zone) => ({ label: zone.name, value: zone.id })), [zones]);

  useEffect(() => {
    if (isZoneSelectionVisible) {
      setZoneId(selectedZone?.id ?? '');
      setValidation(null);
    }
  }, [isZoneSelectionVisible, selectedZone?.id]);

  const loadPlants = () => {
    if (!zoneId) {
      setValidation('Selecione uma zona para carregar as plantas.');
      return;
    }
    void loadZone(zoneId);
  };

  return (
    <Modal visible={isZoneSelectionVisible} transparent animationType="fade" onRequestClose={closeZoneSelection}>
      <Pressable style={styles.overlay} onPress={closeZoneSelection}>
        <Pressable style={[styles.content, { backgroundColor: colors.card }]}>
          <Text style={[styles.title, { color: colors.text }]}>Selecionar zona</Text>
          <Text style={[styles.subtitle, { color: colors.disabledText }]}>
            Selecione uma zona previamente carregada em Dados carregados.
          </Text>

          <ThemedDropdown
            error={validation ?? undefined}
            label="Zona"
            onSelect={(value) => {
              setZoneId(String(value));
              setValidation(null);
            }}
            options={zoneOptions}
            placeholder="Selecionar zona"
            value={zoneId}
          />

          <View style={styles.actions}>
            <Button title="Cancelar" variant="secondary" onPress={closeZoneSelection} style={styles.button} />
            <Button title="Carregar" onPress={loadPlants} style={styles.button} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

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
    fontSize: 20,
    fontWeight: '800',
  },
});
