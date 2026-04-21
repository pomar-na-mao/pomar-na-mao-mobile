import { useOccurrencesRouteSqliteService } from '@/data/services/occurrences-route/use-occurrences-route-sqlite-service';
import { useOccurrencesRouteStore } from '@/data/store/occurrences-route/use-occurrences-route-store';
import { Colors } from '@/shared/constants/theme';
import { useAlertBoxStore } from '@/shared/hooks/use-alert-box';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { useLoadingStore } from '@/shared/hooks/use-loading';
import { ThemedView } from '@/shared/themes/themed-view';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
  const occurrencesRouteSqliteService = useOccurrencesRouteSqliteService();
  const { setSearchPlantsData, setNearestPlant, setOccurrencesRouteFilters } = useOccurrencesRouteStore(
    (state) => state,
  );

  const handleOpenFiltersPress = async () => {
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

  const handleResetRoutePress = async () => {
    setIsLoading(true);

    try {
      await occurrencesRouteSqliteService.clearAll();
      setSearchPlantsData([]);
      setNearestPlant(null);
      setOccurrencesRouteFilters(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setMessage('Erro ao limpar os dados locais da rota.\n' + message);
      setIsVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendUpdatesPress = async () => {
    setIsLoading(true);

    const networkState = await Network.getNetworkStateAsync();
    const isConnected = networkState.isConnected ?? false;

    if (!isConnected) {
      setMessage('Sem conexão com a internet. Conecte-se e tente novamente.');
      setIsVisible(true);
      setIsLoading(false);
      return;
    }

    try {
      const locallyUpdatedPlants = await occurrencesRouteSqliteService.searchAll();
      const plantsToSend = locallyUpdatedPlants.filter((plant) => plant.wasUpdated);

      if (plantsToSend.length === 0) {
        setMessage('Nenhuma planta foi atualizada para enviar.');
        setIsVisible(true);
        return;
      }

      console.log(plantsToSend);

      setMessage('Dados enviados com sucesso.');
      setIsVisible(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setMessage('Erro ao enviar dados. Tente novamente.\n' + message);
      setIsVisible(true);
    } finally {
      setIsLoading(false);
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
        accessibilityRole="button"
        accessibilityLabel="Abrir detalhes"
      >
        <MaterialCommunityIcons name="file-document-outline" size={22} color={Colors[theme].text} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: Colors[theme].tint,
            borderColor: Colors[theme].tint,
          },
        ]}
        onPress={handleOpenFiltersPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Buscar plantas"
      >
        <MaterialCommunityIcons name="magnify" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: Colors[theme].card,
            borderColor: Colors[theme].line,
          },
        ]}
        activeOpacity={0.8}
        onPress={handleResetRoutePress}
        accessibilityRole="button"
        accessibilityLabel="Resetar pesquisa"
      >
        <MaterialCommunityIcons name="backup-restore" size={22} color={Colors[theme].text} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: Colors[theme].tint,
            borderColor: Colors[theme].tint,
          },
        ]}
        activeOpacity={0.8}
        onPress={handleSendUpdatesPress}
        accessibilityRole="button"
        accessibilityLabel="Enviar atualizações"
      >
        <MaterialCommunityIcons name="send" size={22} color="#FFFFFF" />
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
    gap: 10,
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
});
