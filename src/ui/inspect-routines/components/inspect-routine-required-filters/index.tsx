import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, useColorScheme, View } from 'react-native';

import { useInspectRoutinesStore } from '@/data/store/inspect-routines/use-inspect-routines-store';
import {
  inspectRoutineSearchSchema,
  type InspectRoutineFilter,
} from '@/domain/models/inspect-routines/inspect-routines-search.schema';
import { useLoadingStore } from '@/shared/hooks/use-loading';
import { useOccurrences } from '@/ui/shared/hooks/use-occurrences';
import { useRegionOptions } from '@/ui/shared/hooks/use-regions-options';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/shared/constants/theme';
import { ThemedView } from '@/shared/themes/themed-view';
import Button from '@/ui/shared/components/Button';
import ThemedDropdown from '@/ui/shared/components/form/dropdown/ThemedDropdown';
import { useInspectRoutine } from '../../view-models/useInspectRoutine';
import { styles } from './styles';

interface InspectRoutineRequiredFiltersProps {
  closeMenu: () => void;
}

export const InspectRoutineRequiredFilters: React.FC<InspectRoutineRequiredFiltersProps> = ({ closeMenu }) => {
  const { setSearchPlantsData, setInspectRoutineSearchFilters } = useInspectRoutinesStore((state) => state);

  const { generateNewInspectRoutine } = useInspectRoutine();

  const { setIsLoading } = useLoadingStore();

  const { formState, handleSubmit, setValue, watch } = useForm<InspectRoutineFilter>({
    resolver: zodResolver(inspectRoutineSearchSchema),
    defaultValues: {
      region: null,
      occurrence: null,
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

  // Sync form data with store when region or occurrence changes
  useEffect(() => {
    setInspectRoutineSearchFilters({
      region: regionValue ?? null,
      occurrence: occurrenceValue ?? null,
    });
  }, [regionValue, occurrenceValue]);

  const clearFiltersSearchData = () => {
    setValue('region', null);
    setValue('occurrence', null);
    setSearchPlantsData([]);
    setInspectRoutineSearchFilters(null);
  };

  const searchInspectRoutineData = async () => {
    await generateNewInspectRoutine();

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
          {/* Form */}
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
                onPress={handleSubmit(searchInspectRoutineData)}
                disabled={!regionValue}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ThemedView>
    </SafeAreaView>
  );
};
