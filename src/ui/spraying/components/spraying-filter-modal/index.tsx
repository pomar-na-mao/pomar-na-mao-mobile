import { Colors } from '@/shared/constants/theme';
import { ThemedView } from '@/shared/themes/themed-view';
import Button from '@/ui/shared/components/Button';
import ThemedDropdown from '@/ui/shared/components/form/dropdown/ThemedDropdown';
import ThemedInput from '@/ui/shared/components/form/input/ThemedInput';
import { useRegionOptions } from '@/ui/shared/hooks/use-regions-options';
import { useSpraying } from '@/ui/spraying/view-models/use-spraying';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SprayingFilterModalProps {
  closeMenu: () => void;
}

export const SprayingFilterModal: React.FC<SprayingFilterModalProps> = ({ closeMenu }) => {
  const theme = useColorScheme() ?? 'light';

  const { lastLoadedRegion, loadPlantsByRegion, operatorName, setOperatorName } = useSpraying();
  const { data: regions, isLoading: isLoadingRegions } = useRegionOptions();

  const [selectedRegion, setSelectedRegion] = useState<string | undefined>(lastLoadedRegion);

  useEffect(() => {
    setSelectedRegion(lastLoadedRegion);
  }, [lastLoadedRegion]);

  const canSearch = !!selectedRegion;

  const handleSearch = async () => {
    if (!selectedRegion) return;
    await loadPlantsByRegion(selectedRegion);
    closeMenu();
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
      <ThemedView style={{ flex: 1, padding: 12 }}>
        {/* Close button */}
        <View style={styles.closeIconContainer}>
          <Pressable onPress={closeMenu} hitSlop={12}>
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
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.fieldsContainer}>
              <Text style={[styles.title, { color: Colors[theme].text }]}>Configurar Pulverização</Text>
              <Text style={[styles.subtitle, { color: Colors[theme].disabledText }]}>
                Selecione a zona para carregar as plantas no mapa.
              </Text>

              {/* Região */}
              <ThemedDropdown
                label="Zona"
                placeholder={isLoadingRegions ? 'Carregando zonas...' : 'Selecione a zona'}
                options={regions ?? []}
                value={selectedRegion}
                onSelect={(value) => setSelectedRegion(String(value))}
                disabled={isLoadingRegions || !regions?.length}
              />

              {/* Nome do operador */}
              <ThemedInput
                label="Operador (opcional)"
                placeholder="Nome do operador"
                value={operatorName}
                onChangeText={setOperatorName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.actionsContainer}>
              <Button
                variant="primary"
                title="Carregar plantas"
                onPress={handleSearch}
                disabled={!canSearch || isLoadingRegions}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ThemedView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  closeIconContainer: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  fieldsContainer: {
    gap: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  actionsContainer: {
    paddingTop: 24,
    gap: 4,
  },
});
