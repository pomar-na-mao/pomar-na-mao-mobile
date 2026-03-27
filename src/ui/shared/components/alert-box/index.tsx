import { Colors } from '@/shared/constants/theme';
import { useAlertBoxStore } from '@/shared/hooks/use-alert-box';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { ThemedText } from '@/shared/themes/themed-text';
import { ThemedView } from '@/shared/themes/themed-view';
import Button from '@/ui/shared/components/Button';
import { Modal, View } from 'react-native';
import { styles } from './styles';

export const AlertBox = () => {
  const { message, isVisible, setIsVisible } = useAlertBoxStore();

  const theme = useColorScheme() ?? 'light';

  return (
    <>
      {isVisible ? (
        <Modal transparent visible={true} animationType="fade">
          <View style={[styles.overlay, { backgroundColor: Colors[theme].overlay }]}>
            <ThemedView style={styles.alertContainer}>
              <ThemedText type="title" style={styles.title}>
                Atenção
              </ThemedText>
              <ThemedText type="subtitle" style={styles.message}>
                {message}
              </ThemedText>
              <Button style={{ alignSelf: 'flex-end' }} title="OK" onPress={() => setIsVisible(false)} />
            </ThemedView>
          </View>
        </Modal>
      ) : null}
    </>
  );
};
