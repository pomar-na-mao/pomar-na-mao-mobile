import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

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
    ? 'As plantas desta zona serão removidas deste aparelho.'
    : 'Todas as plantas deste aparelho serão removidas. Inspeção e pulverização ficarão indisponíveis.';
  const destructiveBackground = '#B91C1C';
  const cancelBackground = theme === 'dark' ? '#393D39' : '#F1F3F1';
  const warningBackground = theme === 'dark' ? '#472323' : '#FDECEC';

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
      <Pressable
        accessibilityLabel="Fechar confirmação de exclusão"
        accessibilityRole="button"
        style={[styles.overlay, { backgroundColor: colors.overlay }]}
        onPress={handleClose}
        testID="field-work-clear-plants-modal"
      >
        <Pressable
          accessibilityViewIsModal
          onPress={(event) => event.stopPropagation()}
          style={[styles.content, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
        >
          <View style={[styles.warningIcon, { backgroundColor: warningBackground }]}>
            <MaterialIcons name="delete-outline" size={28} color={colors.danger} />
          </View>

          <Text style={[styles.title, { color: colors.text }]}>
            {zoneName ? `Excluir plantas de ${zoneName}?` : 'Excluir plantas carregadas?'}
          </Text>
          <Text style={[styles.description, { color: colors.disabledText }]}>{description}</Text>

          {error ? (
            <View style={[styles.errorContainer, { backgroundColor: warningBackground }]}>
              <MaterialIcons name="error-outline" size={18} color={colors.errorText} />
              <Text style={[styles.error, { color: colors.errorText }]}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: isLoading }}
              disabled={isLoading}
              onPress={handleClose}
              style={({ pressed }) => [
                styles.button,
                styles.cancelButton,
                {
                  backgroundColor: cancelBackground,
                  borderColor: colors.inputBorder,
                  opacity: pressed || isLoading ? 0.65 : 1,
                },
              ]}
              testID="field-work-clear-plants-cancel-button"
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancelar</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ busy: isLoading, disabled: isLoading }}
              disabled={isLoading}
              onPress={() => void handleConfirm()}
              style={({ pressed }) => [
                styles.button,
                styles.deleteButton,
                { backgroundColor: destructiveBackground, opacity: pressed || isLoading ? 0.75 : 1 },
              ]}
              testID="field-work-clear-plants-confirm-button"
            >
              {isLoading ? (
                <ActivityIndicator accessibilityLabel="Excluindo plantas" color="#FFFFFF" size="small" />
              ) : (
                <>
                  <MaterialIcons name="delete-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.deleteButtonText}>Excluir</Text>
                </>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: 12, marginTop: 22 },
  button: {
    alignItems: 'center',
    borderRadius: 12,
    flex: 1,
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: 16,
  },
  cancelButton: { borderWidth: 1 },
  cancelButtonText: { fontSize: 15, fontWeight: '700' },
  content: {
    alignSelf: 'center',
    borderRadius: 20,
    borderWidth: 1,
    elevation: 8,
    maxWidth: 420,
    padding: 22,
    shadowColor: '#000000',
    shadowOffset: { height: 6, width: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    width: '100%',
  },
  deleteButton: { borderWidth: 0 },
  deleteButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  description: { fontSize: 14, lineHeight: 21, textAlign: 'center' },
  error: { flex: 1, fontSize: 13, lineHeight: 18 },
  errorContainer: {
    alignItems: 'flex-start',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    padding: 10,
  },
  overlay: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: '800', lineHeight: 27, marginBottom: 7, textAlign: 'center' },
  warningIcon: {
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 26,
    height: 52,
    justifyContent: 'center',
    marginBottom: 14,
    width: 52,
  },
});
