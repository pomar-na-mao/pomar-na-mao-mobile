import type { BooleanKeys, PlantData } from '@/domain/models/shared/plant-data.model';
import { Colors } from '@/shared/constants/theme';
import { occurenceKeys, occurencesLabels } from '@/shared/constants/values';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { ThemedText } from '@/shared/themes/themed-text';
import { ThemedView } from '@/shared/themes/themed-view';
import Button from '@/ui/shared/components/Button';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Switch, View } from 'react-native';
import { styles } from './style';

interface PlantOccurrencesFormProps {
  plant: PlantData | null;
  savePlantOccurrencesHandler: (formState: Record<BooleanKeys, boolean>) => Promise<void>;
}

export const PlantOccurrencesForm: React.FC<PlantOccurrencesFormProps> = ({ plant, savePlantOccurrencesHandler }) => {
  const [formState, setFormState] = useState<Record<BooleanKeys, boolean>>({} as Record<BooleanKeys, boolean>);

  useEffect(() => {
    const initialState = {} as Record<BooleanKeys, boolean>;

    if (plant) {
      occurenceKeys.forEach((key) => {
        initialState[key] = plant[key] as boolean;
      });

      setFormState(initialState);
    }
  }, [plant]);

  const theme = useColorScheme() ?? 'light';

  const handleToggle = (key: BooleanKeys) => {
    setFormState((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, width: '100%' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 30}
    >
      <ThemedView style={{ flex: 1, padding: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <ThemedText type="default">Ocorrências da Planta</ThemedText>
          <ThemedText type="default" style={{ color: Colors[theme].tint }}>
            #{plant?.id.split('-')[0]}
          </ThemedText>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'space-between',
            paddingVertical: 18,
          }}
          keyboardShouldPersistTaps="handled"
        >
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
                thumbColor={formState[key] ? Colors[theme].activeThumbColor : Colors[theme].deactiveThumbColor}
                value={Boolean(formState[key])}
                onValueChange={() => handleToggle(key)}
              />
            </View>
          ))}
        </ScrollView>

        <Button style={{ marginVertical: 12 }} title="Salvar" onPress={() => savePlantOccurrencesHandler(formState)} />
      </ThemedView>
    </KeyboardAvoidingView>
  );
};
