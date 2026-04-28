import { routinesRepository } from '@/data/repositories/routines/routines-repository';
import { useRoutineSqliteService } from '@/data/services/routine/use-routine-sqlite-service';
import { useRoutineStore } from '@/data/store/routine/use-routine-store';
import type { PlantData } from '@/domain/models/shared/plant-data.model';
import { Colors } from '@/shared/constants/theme';
import { useAlertBoxStore } from '@/shared/hooks/use-alert-box';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { useLoadingStore } from '@/shared/hooks/use-loading';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Network from 'expo-network';
import * as React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { styles } from './style';

interface RoutineActionsProps {
  onOpenFilters: () => void;
  onOpenDetails: () => void;
}

export const RoutineActions: React.FC<RoutineActionsProps> = ({ onOpenFilters, onOpenDetails }) => {
  const { setIsLoading } = useLoadingStore();
  const theme = useColorScheme() ?? 'light';
  const { setMessage, setIsVisible } = useAlertBoxStore();
  const routineSqliteService = useRoutineSqliteService();
  const { routineFilters, setSearchPlantsData, setNearestPlant, setRoutineFilters } = useRoutineStore((state) => state);

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

  const handleResetRoutinePress = async () => {
    setIsLoading(true);

    try {
      await routineSqliteService.clearAll();
      setSearchPlantsData([]);
      setNearestPlant(null);
      setRoutineFilters(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setMessage('Erro ao limpar os dados locais da rotina.\n' + message);
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
      const locallyUpdatedPlants = await routineSqliteService.searchAll();
      const plantsToSend = locallyUpdatedPlants.filter((plant) => plant.wasUpdated);

      if (plantsToSend.length === 0) {
        setMessage('Nenhuma planta foi atualizada para enviar.');
        setIsVisible(true);
        return;
      }

      const newRoutine = {
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        description: '',
        date: new Date().toISOString(),
        region: routineFilters?.region ?? plantsToSend[0]?.region ?? '',
      };

      const enrichedPlantData = plantsToSend.map((plant) => ({
        plant_id: plant.id,
        latitude: plant.latitude,
        longitude: plant.longitude,
        gps_timestamp: plant.gps_timestamp,
        mass: plant.mass,
        variety: plant.variety,
        harvest: plant.harvest,
        description: plant.description,
        planting_date: plant.planting_date,
        life_of_the_tree: plant.life_of_the_tree,
        stick: plant.stick,
        broken_branch: plant.broken_branch,
        vine_growing: plant.vine_growing,
        burnt_branch: plant.burnt_branch,
        struck_by_lightning: plant.struck_by_lightning,
        drill: plant.drill,
        anthill: plant.anthill,
        in_experiment: plant.in_experiment,
        weeds_in_the_basin: plant.weeds_in_the_basin,
        fertilization_or_manuring: plant.fertilization_or_manuring,
        mites: plant.mites,
        thrips: plant.thrips,
        empty_collection_box_near: plant.empty_collection_box_near,
        is_dead: plant.is_dead,
        region: plant.region,
        is_new: plant.is_new,
        non_existent: plant.non_existent,
        frost: plant.frost,
        flowers: plant.flowers,
        buds: plant.buds,
        dehydrated: plant.dehydrated,
        is_approved: false,
      }));

      const { error: rpcError } = await routinesRepository.createANewRoutineWithPlants(
        newRoutine,
        enrichedPlantData as Partial<PlantData>[],
      );

      if (rpcError) {
        setMessage('Erro ao enviar dados. Tente novamente.\n' + rpcError.message);
        setIsVisible(true);
        return;
      }

      await routineSqliteService.clearAll();
      setSearchPlantsData([]);
      setNearestPlant(null);
      setRoutineFilters(null);

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
    <View style={styles.dockContainer}>
      <View
        style={[
          styles.pillBar,
          {
            backgroundColor: theme === 'dark' ? 'rgba(28, 29, 28, 0.92)' : 'rgba(255, 255, 255, 0.92)',
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.secondaryButton,
            {
              backgroundColor: Colors[theme].background,
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
          style={[styles.primaryButton, { backgroundColor: Colors[theme].tint }]}
          onPress={handleOpenFiltersPress}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Buscar plantas"
        >
          <MaterialCommunityIcons name="magnify" size={20} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Buscar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: Colors[theme].tint }]}
          activeOpacity={0.8}
          onPress={handleSendUpdatesPress}
          accessibilityRole="button"
          accessibilityLabel="Enviar atualizações"
        >
          <MaterialCommunityIcons name="send" size={18} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Enviar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.secondaryButton,
            {
              backgroundColor: Colors[theme].background,
              borderColor: Colors[theme].line,
            },
          ]}
          activeOpacity={0.8}
          onPress={handleResetRoutinePress}
          accessibilityRole="button"
          accessibilityLabel="Resetar pesquisa"
        >
          <MaterialCommunityIcons name="backup-restore" size={22} color={Colors[theme].text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
