import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, useColorScheme, View } from 'react-native';

import { useWorkRoutineSqliteService } from '@/data/services/work-routine/use-work-routine-sqlite-service';
import { useWorkRoutineStore } from '@/data/store/work-routine/use-work-routine-store';
import {
  workRoutineSearchSchema,
  type WorkRoutineFilter,
} from '@/domain/models/work-routine/work-routine-search.schema';
import { Colors } from '@/shared/constants/theme';
import { useAlertBoxStore } from '@/shared/hooks/use-alert-box';
import { useLoadingStore } from '@/shared/hooks/use-loading';
import { ThemedView } from '@/shared/themes/themed-view';
import Button from '@/ui/shared/components/Button';
import ThemedDropdown from '@/ui/shared/components/form/dropdown/ThemedDropdown';
import { useOccurrences } from '@/ui/shared/hooks/use-occurrences';
import { useRegionOptions } from '@/ui/shared/hooks/use-regions-options';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useWorkRoutineMap } from '../../view-models/useWorkRoutineMap';
import { styles } from './styles';

interface WorkRoutineRequiredFiltersProps {
  closeMenu: () => void;
}

export const WorkRoutineRequiredFilters: React.FC<WorkRoutineRequiredFiltersProps> = ({ closeMenu }) => {
  const workRoutineSqliteService = useWorkRoutineSqliteService();
  const workRoutineFilters = useWorkRoutineStore((state) => state.workRoutineFilters);
  const setSearchPlantsData = useWorkRoutineStore((state) => state.setSearchPlantsData);
  const setNearestPlant = useWorkRoutineStore((state) => state.setNearestPlant);
  const setWorkRoutineFilters = useWorkRoutineStore((state) => state.setWorkRoutineFilters);
  const { loadPlantsByFilters } = useWorkRoutineMap();
  const { setMessage, setIsVisible } = useAlertBoxStore();
  const { setIsLoading } = useLoadingStore();

  const { formState, handleSubmit, setValue, watch } = useForm<WorkRoutineFilter>({
    resolver: zodResolver(workRoutineSearchSchema),
    defaultValues: {
      region: workRoutineFilters?.region ?? null,
      occurrence: workRoutineFilters?.occurrence ?? null,
    },
  });

  const regionValue = watch('region') ?? undefined;
  const occurrenceValue = watch('occurrence') ?? undefined;

  const { data: regions, isLoading: isLoadingRegions } = useRegionOptions();
  const { data: occurrences, isLoading: isLoadingOccurrences } = useOccurrences();
  const theme = useColorScheme() ?? 'light';

  useEffect(() => {
    setIsLoading(isLoadingRegions || isLoadingOccurrences);
  }, [isLoadingRegions, isLoadingOccurrences]);

  useEffect(() => {
    setWorkRoutineFilters({
      region: regionValue ?? null,
      occurrence: occurrenceValue ?? null,
    });
  }, [regionValue, occurrenceValue]);

  const clearFiltersSearchData = async () => {
    setIsLoading(true);

    try {
      await workRoutineSqliteService.clearAll();
      setValue('region', null);
      setValue('occurrence', null);
      setSearchPlantsData([]);
      setNearestPlant(null);
      setWorkRoutineFilters(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setMessage('Erro ao limpar a base local da rotina de trabalho.\n' + message);
      setIsVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const searchWorkRoutineData = async () => {
    await loadPlantsByFilters({
      region: regionValue ? String(regionValue) : null,
      occurrence: occurrenceValue ? String(occurrenceValue) : null,
    });
    closeMenu();
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
      <ThemedView style={{ flex: 1, padding: 12 }}>
        <View style={styles.closeIconContainer}>
          <Pressable onPress={closeMenu}>
            <MaterialCommunityIcons name="close-circle" size={32} color={Colors[theme].danger} />
          </Pressable>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1, width: '100%' }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 30}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between' }}
            keyboardShouldPersistTaps="handled"
          >
            <View>
              {regions ? (
                <ThemedDropdown
                  label="Zona"
                  placeholder="Selecione a zona"
                  options={regions}
                  value={regionValue}
                  onSelect={(value) => setValue('region', String(value))}
                  error={formState.errors.region?.message}
                />
              ) : null}
              {occurrences ? (
                <ThemedDropdown
                  label="Ocorrência"
                  placeholder="Selecione uma ocorrência"
                  options={occurrences}
                  value={occurrenceValue}
                  onSelect={(value) => setValue('occurrence', String(value))}
                  error={formState.errors.occurrence?.message}
                />
              ) : null}
            </View>
            <View style={styles.actionsContainer}>
              <Button variant="secondary" title="Limpar" onPress={clearFiltersSearchData} />

              <Button
                variant="primary"
                title="Buscar"
                onPress={handleSubmit(searchWorkRoutineData)}
                disabled={!regionValue}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ThemedView>
    </SafeAreaView>
  );
};
