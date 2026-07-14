import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import Button from '@/ui/shared/components/Button';
import ThemedDropdown from '@/ui/shared/components/form/dropdown/ThemedDropdown';
import React, { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReturnTypeOfUseFieldWorkPlantLoader } from './types';

interface FieldWorkPlantLoadModalProps {
  loader: ReturnTypeOfUseFieldWorkPlantLoader;
}

export function FieldWorkPlantLoadModal({ loader }: FieldWorkPlantLoadModalProps) {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];
  const [zoneId, setZoneId] = useState('');
  const options = useMemo(() => loader.zones.map((zone) => ({ label: zone.name, value: zone.id })), [loader.zones]);

  return (
    <Modal visible={loader.isVisible} transparent animationType="fade" onRequestClose={loader.close}>
      <Pressable style={styles.overlay} onPress={loader.close}>
        <Pressable style={[styles.content, { backgroundColor: colors.card }]}>
          <Text style={[styles.title, { color: colors.text }]}>Carregar plantas</Text>
          <Text style={[styles.subtitle, { color: colors.disabledText }]}>
            Selecione uma zona para salvar suas plantas no dispositivo.
          </Text>
          <ThemedDropdown
            disabled={loader.isLoading}
            error={loader.error ?? undefined}
            label="Zona"
            onSelect={(value) => setZoneId(String(value))}
            options={options}
            placeholder="Selecionar zona"
            value={zoneId}
          />
          <View style={styles.actions}>
            <Button
              title="Cancelar"
              variant="secondary"
              disabled={loader.isLoading}
              onPress={loader.close}
              style={styles.button}
            />
            <Button
              title="Carregar"
              disabled={!loader.isOnline || !zoneId}
              isLoading={loader.isLoading}
              onPress={() => void loader.loadZone(zoneId)}
              style={styles.button}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: 10 },
  button: { borderRadius: 8, flex: 1 },
  content: { borderRadius: 12, padding: 16, width: '100%' },
  overlay: { backgroundColor: 'rgba(0,0,0,0.55)', flex: 1, justifyContent: 'center', padding: 16 },
  subtitle: { fontSize: 13, marginBottom: 14 },
  title: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
});
