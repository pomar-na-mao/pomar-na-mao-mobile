import {
  inspectRoutineInformationsSchema,
  type PlantInformation,
} from '@/domain/models/inspect-routines/inspect-routines-informations.schema';
import type { BooleanKeys } from '@/domain/models/shared/plant-data.model';
import { Colors } from '@/shared/constants/theme';
import { occurenceKeys, occurencesLabels, varieties } from '@/shared/constants/values';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { ThemedText } from '@/shared/themes/themed-text';
import { ThemedView } from '@/shared/themes/themed-view';
import Button from '@/ui/shared/components/Button';
import { Collapsible } from '@/ui/shared/components/Collapsible';
import ThemedDatePicker from '@/ui/shared/components/form/datepicker/ThemedDatePicker';
import ThemedDropdown from '@/ui/shared/components/form/dropdown/ThemedDropdown';
import { ThemedInputForm } from '@/ui/shared/components/form/input/ThemedInputForm';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, View } from 'react-native';

export interface PlantAnnotationData {
  information: PlantInformation;
  occurrences: Partial<Record<BooleanKeys, boolean>>;
}

interface PlantAnnotationFormProps {
  onSubmit: (data: PlantAnnotationData) => void;
}

export const PlantAnnotationForm: React.FC<PlantAnnotationFormProps> = ({ onSubmit }) => {
  const theme = useColorScheme() ?? 'light';

  // Information form
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

  const varietyValue = watch('variety') ?? undefined;
  const plantingDateValue = watch('plantingDate');

  // Occurrences form
  const [occurrencesState, setOccurrencesState] = useState<Record<BooleanKeys, boolean>>(() => {
    const initialState = {} as Record<BooleanKeys, boolean>;

    occurenceKeys.forEach((key) => {
      initialState[key] = false;
    });

    return initialState;
  });

  const handleToggle = (key: BooleanKeys) => {
    setOccurrencesState((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const submitHandler = (informationData: PlantInformation) => {
    const filteredOccurrences = Object.fromEntries(
      Object.entries(occurrencesState).filter(([_, value]) => value),
    ) as Partial<Record<BooleanKeys, boolean>>;

    onSubmit({
      information: informationData,
      occurrences: filteredOccurrences,
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, width: '100%' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 30}
    >
      <ThemedView style={{ flex: 1, padding: 12 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between' }}
          keyboardShouldPersistTaps="handled"
        >
          <View>
            <Collapsible title="Informações da Planta" defaultOpen>
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
            </Collapsible>

            <Collapsible title="Ocorrências da Planta">
              {occurenceKeys.map((key) => (
                <View key={key} style={[styles.switchRow, { borderBottomColor: Colors[theme].line }]}>
                  <ThemedText type="subtitle" style={styles.label}>
                    {occurencesLabels[key]}
                  </ThemedText>
                  <Switch
                    trackColor={{
                      false: Colors[theme].deactiveTrackColor,
                      true: Colors[theme].activeTrackColor,
                    }}
                    thumbColor={
                      occurrencesState[key] ? Colors[theme].activeThumbColor : Colors[theme].deactiveThumbColor
                    }
                    value={occurrencesState[key]}
                    onValueChange={() => handleToggle(key)}
                  />
                </View>
              ))}
            </Collapsible>
          </View>

          <View style={{ marginTop: 20 }}>
            <Button title="Salvar" onPress={handleSubmit(submitHandler)} />
          </View>
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    paddingBottom: 10,
  },
  label: {
    flex: 1,
    fontSize: 16,
    marginRight: 10,
    textTransform: 'capitalize',
  },
});
