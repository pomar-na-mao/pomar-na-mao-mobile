import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import Button from '@/ui/shared/components/Button';
import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

interface FieldWorkPlantClearModalProps {
  onClose: () => void;
  onConfirm: () => Promise<void>;
  visible: boolean;
  zoneName?: string;
}

export function FieldWorkPlantClearModal({ onClose, onConfirm, visible, zoneName }: FieldWorkPlantClearModalProps) {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const description = zoneName
    ? 'As plantas desta zona serão removidas do aparelho.'
    : 'Todas as plantas armazenadas no aparelho serão removidas. ' + 'Inspeção e pulverização ficarão indisponíveis.';

  useEffect(() => {
    if (visible) setError(null);
  }, [visible]);

  const handleClose = () => {
    if (!isLoading) onClose();
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch {
      setError('Não foi possível excluir as plantas carregadas.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable style={styles.overlay} onPress={handleClose} testID="field-work-clear-plants-modal">
        <Pressable style={[styles.content, { backgroundColor: colors.card }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            {zoneName ? `Excluir plantas de ${zoneName}?` : 'Excluir plantas carregadas?'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.disabledText }]}>{description}</Text>
          {error ? <Text style={[styles.error, { color: colors.errorText }]}>{error}</Text> : null}
          <View style={styles.actions}>
            <Button
              title="Cancelar"
              variant="secondary"
              disabled={isLoading}
              onPress={handleClose}
              style={styles.button}
            />
            <Button
              title="Excluir"
              isLoading={isLoading}
              onPress={() => void handleConfirm()}
              style={{ ...styles.button, backgroundColor: colors.destructiveButtonBackground }}
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
  error: { fontSize: 13, marginBottom: 6 },
  overlay: { backgroundColor: 'rgba(0,0,0,0.55)', flex: 1, justifyContent: 'center', padding: 16 },
  subtitle: { fontSize: 13, marginBottom: 14 },
  title: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
});
