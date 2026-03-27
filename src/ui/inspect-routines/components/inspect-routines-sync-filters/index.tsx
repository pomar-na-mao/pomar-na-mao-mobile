import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, useColorScheme, View } from 'react-native';

import { useInspectRoutinesSyncStore } from '@/data/store/inspect-routines/use-inspect-routines-sync-store';
import {
  inspectRoutineSyncSchema,
  type InspectRoutinesSyncFilter,
} from '@/domain/models/inspect-routines/inspect-routines-sync.schema';
import { useLoadingStore } from '@/shared/hooks/use-loading';
import { useRegionOptions } from '@/ui/shared/hooks/use-regions-options';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/shared/constants/theme';
import { ThemedView } from '@/shared/themes/themed-view';
import Button from '@/ui/shared/components/Button';
import { ThemedDateRangeForm } from '@/ui/shared/components/form/datepicker-range/ThemedDateRangeForm';
import { ThemedDropdownForm } from '@/ui/shared/components/form/dropdown/ThemedDropdownForm';
import { useSyncInspectRoutine } from '../../view-models/useSyncInspectRoutine';
import { styles } from './styles';

interface InspectRoutinesSyncFiltersProps {
  closeMenu: () => void;
}

export const InspectRoutinesSyncFilters: React.FC<InspectRoutinesSyncFiltersProps> = ({ closeMenu }) => {
  const { setIsLoading } = useLoadingStore();

  const { inspectRoutinesSyncSearchFilters, setInspectRoutinesSyncSearchFilters } = useInspectRoutinesSyncStore(
    (state) => state,
  );

  const { searchInspectRoutineFromFilters } = useSyncInspectRoutine();

  const { formState, handleSubmit, control, setValue } = useForm<InspectRoutinesSyncFilter>({
    resolver: zodResolver(inspectRoutineSyncSchema),
    defaultValues: {
      region: inspectRoutinesSyncSearchFilters?.region ?? null,
      dateRange: inspectRoutinesSyncSearchFilters?.dateRange,
    },
  });

  const { data: regions, isLoading: isLoadingRegions } = useRegionOptions();

  useEffect(() => {
    setIsLoading(isLoadingRegions);
  }, [isLoadingRegions]);

  const submitFilters = async (data: InspectRoutinesSyncFilter) => {
    const { region, dateRange } = data;

    const filterCollectsData = {
      region,
      dateRange,
    } as InspectRoutinesSyncFilter;

    setInspectRoutinesSyncSearchFilters(filterCollectsData);

    await searchInspectRoutineFromFilters(filterCollectsData);

    closeMenu();
  };

  const theme = useColorScheme() ?? 'light';

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
              <ThemedDropdownForm
                control={control}
                name="region"
                label="Zona"
                placeholder="Selecione uma zona"
                options={regions ?? []}
                error={formState?.errors.region?.message}
              />

              <ThemedDateRangeForm
                control={control}
                name="dateRange"
                label="Período de envio"
                error={formState?.errors.dateRange?.end?.message}
              />
            </View>

            <ThemedView style={styles.actionsContainer}>
              <Button
                variant="secondary"
                title="Limpar"
                onPress={() => {
                  setValue('region', null);
                  setValue('dateRange', undefined);
                  setInspectRoutinesSyncSearchFilters(null);
                }}
              />

              <Button variant="primary" title="Buscar" onPress={handleSubmit(submitFilters)} disabled={false} />
            </ThemedView>
          </ScrollView>
        </KeyboardAvoidingView>
      </ThemedView>
    </SafeAreaView>
  );
};
