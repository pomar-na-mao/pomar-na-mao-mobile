import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, useColorScheme, View } from 'react-native';

import { useOccurrencesRouteStore } from '@/data/store/occurrences-route/use-occurrences-route-store';
import { useOccurrencesRouteSqliteService } from '@/data/services/occurrences-route/use-occurrences-route-sqlite-service';
import {
  occurrencesRouteSearchSchema,
  type OccurrencesRouteFilter,
} from '@/domain/models/occurrences-route/occurrences-route-search.schema';
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

import { useOccurrencesMap } from '../../view-models/useOccurrencesMap';
import { styles } from './styles';

interface OccurrencesRequiredFiltersProps {
  closeMenu: () => void;
}

export const OccurrencesRequiredFilters: React.FC<OccurrencesRequiredFiltersProps> = ({ closeMenu }) => {
  const occurrencesRouteSqliteService = useOccurrencesRouteSqliteService();
  const occurrencesRouteFilters = useOccurrencesRouteStore((state) => state.occurrencesRouteFilters);
  const setSearchPlantsData = useOccurrencesRouteStore((state) => state.setSearchPlantsData);
  const setNearestPlant = useOccurrencesRouteStore((state) => state.setNearestPlant);
  const setOccurrencesRouteFilters = useOccurrencesRouteStore((state) => state.setOccurrencesRouteFilters);
  const { loadPlantsByFilters } = useOccurrencesMap();
  const { setMessage, setIsVisible } = useAlertBoxStore();
  const { setIsLoading } = useLoadingStore();

  const { formState, handleSubmit, setValue, watch } = useForm<OccurrencesRouteFilter>({
    resolver: zodResolver(occurrencesRouteSearchSchema),
    defaultValues: {
      region: occurrencesRouteFilters?.region ?? null,
      occurrence: occurrencesRouteFilters?.occurrence ?? null,
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
    setOccurrencesRouteFilters({
      region: regionValue ?? null,
      occurrence: occurrenceValue ?? null,
    });
  }, [regionValue, occurrenceValue]);

  const clearFiltersSearchData = async () => {
    setIsLoading(true);

    try {
      await occurrencesRouteSqliteService.clearAll();
      setValue('region', null);
      setValue('occurrence', null);
      setSearchPlantsData([]);
      setNearestPlant(null);
      setOccurrencesRouteFilters(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setMessage('Erro ao limpar a base local da rota.\n' + message);
      setIsVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const searchOccurrencesData = async () => {
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
                onPress={handleSubmit(searchOccurrencesData)}
                disabled={!regionValue}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ThemedView>
    </SafeAreaView>
  );
};
