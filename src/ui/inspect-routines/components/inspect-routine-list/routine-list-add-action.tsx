import { Colors } from '@/shared/constants/theme';
import { useAlertBoxStore } from '@/shared/hooks/use-alert-box';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { useLoadingStore } from '@/shared/hooks/use-loading';
import { ThemedView } from '@/shared/themes/themed-view';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Network from 'expo-network';
import * as React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface RoutineListAddActionProps {
  onCreateRoutine: () => void;
}

export const RoutineListAddAction: React.FC<RoutineListAddActionProps> = ({ onCreateRoutine }) => {
  const { setIsLoading } = useLoadingStore();
  const theme = useColorScheme() ?? 'light';

  const { setMessage, setIsVisible } = useAlertBoxStore();

  const handleFabPress = async () => {
    setIsLoading(true);
    const networkState = await Network.getNetworkStateAsync();
    const isConnected = networkState.isConnected ?? false;
    if (isConnected) {
      setIsLoading(false);
      onCreateRoutine();
    } else {
      setIsLoading(false);
      setMessage('Ative o Wi-fi para carregar dados de uma zona');
      setIsVisible(true);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: Colors[theme].tint }]}
        onPress={handleFabPress}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="plus" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  fab: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    marginBottom: 12,
  },
});
