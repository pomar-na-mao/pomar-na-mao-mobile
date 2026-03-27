import { Colors } from '@/shared/constants/theme';
import { useLoadingStore } from '@/shared/hooks/use-loading';
import { ActivityIndicator, Modal, StyleSheet, useColorScheme, View } from 'react-native';

export const LoadingOverlay = () => {
  const { isLoading } = useLoadingStore();

  const theme = useColorScheme() ?? 'light';

  return (
    <View>
      {isLoading ? (
        <Modal visible={true} transparent animationType="fade">
          <View
            style={[
              styles.overlay,
              {
                backgroundColor: theme === 'light' ? 'rgba(255,255,255,0.7)' : 'rgba(21,23,24,0.7)',
              },
            ]}
          >
            <ActivityIndicator
              animating={true}
              size="large"
              color={theme === 'light' ? Colors.light.tint : Colors.dark.tint}
            />
          </View>
        </Modal>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
