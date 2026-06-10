import type { SprayingInputDraft, SprayingSetup } from '@/domain/models/spraying';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { useSpraying } from '@/ui/spraying/view-models/use-spraying';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const emptyInput = (): SprayingInputDraft => ({
  inputType: 'insecticide',
  productName: '',
  activeIngredient: '',
  dose: null,
  doseUnit: 'L/ha',
  totalQuantity: null,
  totalQuantityUnit: 'L',
  notes: '',
});

export function SprayingSetupModal() {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];
  const { beginOperation, closeSetup, isSetupVisible, selectedZone } = useSpraying();
  const [operatorName, setOperatorName] = useState('');
  const [machineName, setMachineName] = useState('');
  const [tractorIdentifier, setTractorIdentifier] = useState('');
  const [notes, setNotes] = useState('');
  const [minDistance, setMinDistance] = useState('3.5');
  const [maxDistance, setMaxDistance] = useState('9');
  const [inputs, setInputs] = useState<SprayingInputDraft[]>([emptyInput()]);
  const [validation, setValidation] = useState<string | null>(null);

  useEffect(() => {
    if (!isSetupVisible) {
      setValidation(null);
    }
  }, [isSetupVisible]);

  const updateInput = (index: number, changes: Partial<SprayingInputDraft>) => {
    setInputs((current) =>
      current.map((input, inputIndex) => (inputIndex === index ? { ...input, ...changes } : input)),
    );
  };

  const save = () => {
    const minimum = Number(minDistance.replace(',', '.'));
    const maximum = Number(maxDistance.replace(',', '.'));
    if (!selectedZone || !operatorName.trim() || inputs.some((input) => !input.productName.trim())) {
      setValidation('Informe operador e nome de todos os insumos.');
      return;
    }
    if (!Number.isFinite(minimum) || !Number.isFinite(maximum) || minimum < 0 || maximum < minimum) {
      setValidation('Informe uma faixa lateral valida.');
      return;
    }

    const setup: SprayingSetup = {
      zoneId: selectedZone.id,
      zoneName: selectedZone.name,
      operatorName,
      machineName: machineName.trim(),
      tractorIdentifier: tractorIdentifier || null,
      notes: notes || null,
      minDistanceMeters: minimum,
      maxDistanceMeters: maximum,
      inputs,
    };
    void beginOperation(setup);
  };

  return (
    <Modal visible={isSetupVisible} transparent animationType="fade" onRequestClose={closeSetup}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        testID="spraying-setup-keyboard-avoiding-view"
      >
        <View style={styles.overlay}>
          <View style={[styles.content, { backgroundColor: colors.card }]}>
            <Text style={[styles.title, { color: colors.text }]}>Nova Pulverização</Text>
            <Text style={[styles.subtitle, { color: colors.disabledText }]}>
              {selectedZone ? `Plantas da ${selectedZone.name} carregadas.` : 'Carregue plantas de uma zona.'}
            </Text>

            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardDismissMode="on-drag"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={styles.scroll}
              testID="spraying-setup-scroll"
            >
              <TextInput
                accessibilityLabel="Operador"
                onChangeText={setOperatorName}
                placeholder="Operador"
                placeholderTextColor={colors.disabledText}
                style={[styles.input, { borderColor: colors.line, color: colors.text }]}
                value={operatorName}
              />
              <TextInput
                accessibilityLabel="Máquina"
                onChangeText={setMachineName}
                placeholder="Máquina ou pulverizador (opcional)"
                placeholderTextColor={colors.disabledText}
                style={[styles.input, { borderColor: colors.line, color: colors.text }]}
                value={machineName}
              />
              <TextInput
                accessibilityLabel="Trator"
                onChangeText={setTractorIdentifier}
                placeholder="Identificação do trator (opcional)"
                placeholderTextColor={colors.disabledText}
                style={[styles.input, { borderColor: colors.line, color: colors.text }]}
                value={tractorIdentifier}
              />

              <View style={styles.distanceRow}>
                <View style={styles.distanceField}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>Distância típica planta-trator (m)</Text>
                  <TextInput
                    accessibilityLabel="Distância minima da faixa aplicada"
                    keyboardType="decimal-pad"
                    onChangeText={setMinDistance}
                    placeholder="Min. m"
                    placeholderTextColor={colors.disabledText}
                    style={[styles.input, styles.distanceInput, { borderColor: colors.line, color: colors.text }]}
                    value={minDistance}
                  />
                </View>
                <View style={styles.distanceField}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>Alcance máximo da pulverização (m)</Text>
                  <TextInput
                    accessibilityLabel="Distância máxima da faixa aplicada"
                    keyboardType="decimal-pad"
                    onChangeText={setMaxDistance}
                    placeholder="Max. m"
                    placeholderTextColor={colors.disabledText}
                    style={[styles.input, styles.distanceInput, { borderColor: colors.line, color: colors.text }]}
                    value={maxDistance}
                  />
                </View>
              </View>

              <Text style={[styles.sectionTitle, { color: colors.text }]}>Insumos aplicados</Text>
              {inputs.map((input, index) => (
                <View key={`input-${index}`} style={[styles.inputCard, { borderColor: colors.line }]}>
                  <TextInput
                    accessibilityLabel={`Produto ${index + 1}`}
                    onChangeText={(value) => updateInput(index, { productName: value })}
                    placeholder="Nome do produto"
                    placeholderTextColor={colors.disabledText}
                    style={[styles.input, { borderColor: colors.line, color: colors.text }]}
                    value={input.productName}
                  />
                  <TextInput
                    onChangeText={(value) => updateInput(index, { activeIngredient: value })}
                    placeholder="Ingrediente ativo"
                    placeholderTextColor={colors.disabledText}
                    style={[styles.input, { borderColor: colors.line, color: colors.text }]}
                    value={input.activeIngredient ?? ''}
                  />
                  <View style={styles.distanceRow}>
                    <TextInput
                      keyboardType="decimal-pad"
                      onChangeText={(value) =>
                        updateInput(index, { dose: value ? Number(value.replace(',', '.')) : null })
                      }
                      placeholder="Dose"
                      placeholderTextColor={colors.disabledText}
                      style={[styles.input, styles.distanceInput, { borderColor: colors.line, color: colors.text }]}
                    />
                    <TextInput
                      onChangeText={(value) => updateInput(index, { doseUnit: value })}
                      placeholder="Unidade"
                      placeholderTextColor={colors.disabledText}
                      style={[styles.input, styles.distanceInput, { borderColor: colors.line, color: colors.text }]}
                      value={input.doseUnit ?? ''}
                    />
                  </View>
                </View>
              ))}
              <Pressable
                onPress={() => setInputs((current) => [...current, emptyInput()])}
                style={[styles.addInput, { borderColor: colors.tint }]}
              >
                <Text style={{ color: colors.tint, fontWeight: '800' }}>Adicionar insumo</Text>
              </Pressable>

              <TextInput
                multiline
                onChangeText={setNotes}
                placeholder="Observações"
                placeholderTextColor={colors.disabledText}
                style={[styles.input, styles.notes, { borderColor: colors.line, color: colors.text }]}
                value={notes}
              />

              {validation ? <Text style={[styles.validation, { color: colors.danger }]}>{validation}</Text> : null}
            </ScrollView>

            <View style={styles.actions}>
              <Pressable
                onPress={closeSetup}
                style={[styles.action, { backgroundColor: colors.cancelButtonBackground }]}
              >
                <Text style={{ color: colors.text, fontWeight: '800' }}>Cancelar</Text>
              </Pressable>
              <Pressable onPress={save} style={[styles.action, { backgroundColor: colors.tint }]}>
                <Text style={styles.whiteText}>Confirmar e iniciar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  action: {
    alignItems: 'center',
    borderRadius: 10,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 12,
  },
  addInput: {
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
    padding: 12,
  },
  content: {
    borderRadius: 16,
    maxHeight: '90%',
    minHeight: 0,
    padding: 16,
    width: '100%',
  },
  distanceInput: {
    flex: 1,
  },
  distanceField: {
    flex: 1,
  },
  distanceRow: {
    flexDirection: 'row',
    gap: 10,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
    minHeight: 46,
    paddingHorizontal: 12,
  },
  inputCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  notes: {
    minHeight: 72,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  scroll: {
    flexShrink: 1,
    minHeight: 0,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 8,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  validation: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  whiteText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
