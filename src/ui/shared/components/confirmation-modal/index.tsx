import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { ThemedText } from '@/shared/themes/themed-text';
import { ThemedView } from '@/shared/themes/themed-view';
import React from 'react';
import { Modal, TouchableOpacity, View } from 'react-native';
import { styles } from './styles';

interface ConfirmationModalProps {
  visible: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title = 'Deletar',
  message = 'Deseja realmente excluir este registro ?',
  onConfirm,
  onCancel,
}) => {
  const theme = useColorScheme() ?? 'light';

  return (
    <View>
      <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
        <View style={[styles.overlay, { backgroundColor: Colors[theme].overlay }]}>
          <ThemedView style={styles.modal}>
            <ThemedText type="title" style={styles.title}>
              {title}
            </ThemedText>
            <ThemedText type="subtitle" style={styles.message}>
              {message}
            </ThemedText>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: Colors[theme].neutralButtonBackground }]}
                onPress={onCancel}
              >
                <ThemedText style={[styles.buttonText, { color: Colors[theme].neutralButtonText }]}>Não</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, { backgroundColor: Colors[theme].tint }]}
                onPress={onConfirm}
              >
                <ThemedText style={[styles.buttonText, { color: '#FFFFFF' }]}>Sim</ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </View>
      </Modal>
    </View>
  );
};
