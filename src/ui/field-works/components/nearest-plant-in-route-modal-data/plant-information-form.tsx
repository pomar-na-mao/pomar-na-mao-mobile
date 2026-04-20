import {
  inspectRoutineInformationsSchema,
  type PlantInformation,
} from '@/domain/models/inspect-routines/inspect-routines-informations.schema';
import type { PlantData } from '@/domain/models/shared/plant-data.model';
import { Colors } from '@/shared/constants/theme';
import { varieties } from '@/shared/constants/values';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { ThemedText } from '@/shared/themes/themed-text';
import { ThemedView } from '@/shared/themes/themed-view';
import Button from '@/ui/shared/components/Button';
import ThemedDatePicker from '@/ui/shared/components/form/datepicker/ThemedDatePicker';
import ThemedDropdown from '@/ui/shared/components/form/dropdown/ThemedDropdown';
import { ThemedInputForm } from '@/ui/shared/components/form/input/ThemedInputForm';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

interface PlantInformationFormProps {
  plant: PlantData | null;
  savePlantInformationHandler: (plantInformationData: PlantInformation) => Promise<void>;
}

export const PlantInformationForm: React.FC<PlantInformationFormProps> = ({ plant, savePlantInformationHandler }) => {
  const theme = useColorScheme() ?? 'light';

  const { control, formState, handleSubmit, setValue, watch } = useForm({
    resolver: zodResolver(inspectRoutineInformationsSchema),
    defaultValues: {
      variety: '',
      mass: '',
      lifeOfTree: '',
      harvest: '',
      plantingDate: new Date(),
      description: '',
    },
  });

  useEffect(() => {
    if (!plant) {
      return;
    }

    setValue('variety', plant.variety ?? null);
    setValue('mass', plant.mass ? String(plant.mass) : '');
    setValue('lifeOfTree', plant.life_of_the_tree ? String(plant.life_of_the_tree) : '');
    setValue('harvest', plant.harvest ? String(plant.harvest) : '');
    setValue('plantingDate', plant.planting_date ? new Date(plant.planting_date) : new Date());
    setValue('description', plant.description ?? '');
  }, [plant, setValue]);

  const varietyValue = watch('variety') ?? undefined;
  const plantingDateValue = watch('plantingDate');

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, width: '100%' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 30}
    >
      <ThemedView style={{ flex: 1, padding: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 36 }}>
          <ThemedText type="default">Informações da Planta</ThemedText>
          <ThemedText type="default" style={{ color: Colors[theme].tint }}>
            #{plant?.id.split('-')[0]}
          </ThemedText>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between' }}
          keyboardShouldPersistTaps="handled"
        >
          <View>
            <ThemedDropdown
              label="Variedade"
              placeholder="Selecione a variedade"
              options={varieties}
              value={varietyValue}
              onSelect={(value) => setValue('variety', String(value))}
              error={formState.errors.variety?.message}
            />

            <ThemedDatePicker
              label="Data de Plantio"
              value={plantingDateValue}
              onChange={(date) => setValue('plantingDate', date)}
              error={formState.errors.plantingDate?.message}
            />

            <ThemedInputForm
              control={control}
              name="mass"
              label="Massa"
              placeholder="Informe a massa da planta"
              error={formState.errors.mass?.message}
            />

            <ThemedInputForm
              control={control}
              name="lifeOfTree"
              label="Vida da Árvore"
              placeholder="Informe a vida da árvore"
              error={formState.errors.lifeOfTree?.message}
            />

            <ThemedInputForm
              control={control}
              name="harvest"
              label="Colheita"
              placeholder="Informe a colheita"
              error={formState.errors.harvest?.message}
            />

            <ThemedInputForm
              control={control}
              name="description"
              label="Descrição"
              placeholder="Descreva informações adicionais sobre a planta"
              error={formState.errors.description?.message}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={{ marginTop: 20 }}>
            <Button title="Salvar" onPress={handleSubmit(savePlantInformationHandler)} />
          </View>
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
};
