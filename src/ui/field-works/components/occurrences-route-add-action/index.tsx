import { Colors } from '@/shared/constants/theme';
import { useAlertBoxStore } from '@/shared/hooks/use-alert-box';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { useLoadingStore } from '@/shared/hooks/use-loading';
import { ThemedText } from '@/shared/themes/themed-text';
import { ThemedView } from '@/shared/themes/themed-view';
import * as Network from 'expo-network';
import * as React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface OccurrencesRouteActionsProps {
  onOpenFilters: () => void;
  onOpenDetails: () => void;
}

export const OccurrencesRouteActions: React.FC<OccurrencesRouteActionsProps> = ({ onOpenFilters, onOpenDetails }) => {
  const { setIsLoading } = useLoadingStore();
  const theme = useColorScheme() ?? 'light';
  const { setMessage, setIsVisible } = useAlertBoxStore();

  const handleFabPress = async () => {
    setIsLoading(true);
    const networkState = await Network.getNetworkStateAsync();
    const isConnected = networkState.isConnected ?? false;
    if (isConnected) {
      setIsLoading(false);
      onOpenFilters();
    } else {
      setIsLoading(false);
      setMessage('Ative o Wi-fi para carregar dados de uma zona');
      setIsVisible(true);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: Colors[theme].card,
            borderColor: Colors[theme].line,
          },
        ]}
        activeOpacity={0.8}
        onPress={onOpenDetails}
      >
        <ThemedText type="defaultSemiBold" style={{ color: Colors[theme].text }}>
          Detalhe
        </ThemedText>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: Colors[theme].tint }]}
        onPress={handleFabPress}
        activeOpacity={0.8}
      >
        <ThemedText type="defaultSemiBold" style={styles.primaryButtonText}>
          Buscar
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 12,
  },
  button: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
});
