import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import React, { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface DropdownOption {
  label: string;
  value: string | number;
}

export interface ThemedDropdownProps {
  label?: string;
  value?: string | number | null;
  onSelect: (value: string | number) => void;
  options: DropdownOption[];
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  // Opcional: ícone para indicar dropdown (ex: seta para baixo)
  rightIcon?: React.ReactNode;
}

const ThemedDropdown: React.FC<ThemedDropdownProps> = ({
  label,
  value,
  onSelect,
  options,
  placeholder = 'Selecione uma opção',
  error,
  disabled = false,
  rightIcon,
}) => {
  const theme = useColorScheme() ?? 'light';

  const [visible, setVisible] = useState(false);

  // Encontra o label da opção selecionada baseada no valor atual
  const selectedOption = options?.find((opt) => opt.value === value);

  const handleSelect = (item: DropdownOption) => {
    onSelect(item.value);
    setVisible(false);
  };

  return (
    <View style={styles.inputContainer}>
      {label ? <Text style={[styles.label, { color: Colors[theme].text }]}>{label}</Text> : null}

      <TouchableOpacity
        activeOpacity={0.7}
        disabled={disabled}
        onPress={() => setVisible(true)}
        style={[
          styles.input,
          disabled && styles.disabledInput,
          {
            backgroundColor: Colors[theme].inputBackground,
            borderColor: error ? Colors[theme].inputError : Colors[theme].inputBorder,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          },
        ]}
      >
        <Text
          style={{
            fontSize: 16,
            color: disabled
              ? Colors[theme].disabledText
              : selectedOption
                ? Colors[theme].text
                : Colors[theme].inputPlaceholder,
          }}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>

        {/* Renderiza o ícone passado ou um caractere simples de seta se não houver ícone */}
        {rightIcon || <Text style={{ color: Colors[theme].icon }}>▼</Text>}
      </TouchableOpacity>

      <Text style={[styles.errorText, { color: Colors[theme].errorText }]}>{error}</Text>

      {/* Modal de Seleção */}
      <Modal visible={visible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setVisible(false)}>
          <View style={[styles.modalContent, { backgroundColor: Colors[theme].background }]}>
            <Text style={[styles.modalTitle, { color: Colors[theme].text }]}>{label || placeholder}</Text>

            <FlatList
              data={options}
              keyExtractor={(item) => String(item.value)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    { borderBottomColor: Colors[theme].inputBorder },
                    item.value === value && { backgroundColor: Colors[theme].inputBackground },
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={{ fontSize: 16, color: Colors[theme].text }}>{item.label}</Text>
                  {item.value === value && <Text style={{ color: Colors[theme].tint }}>✓</Text>}
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 12,
  },
  label: {
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    height: 54,
  },
  disabledInput: {
    opacity: 0.6,
  },
  errorText: {
    marginTop: 4,
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 12,
    padding: 16,
    maxHeight: '50%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  optionItem: {
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default ThemedDropdown;
