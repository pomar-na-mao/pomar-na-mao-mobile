import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface ThemedDatePickerProps {
  label?: string;
  value: Date;
  onChange: (date: Date) => void;
  error?: string;
  placeholder?: string;
  mode?: 'date' | 'time' | 'datetime';
}

const ThemedDatePicker: React.FC<ThemedDatePickerProps> = ({
  label,
  value,
  onChange,
  error,
  placeholder,
  mode = 'date',
}) => {
  const theme = useColorScheme() ?? 'light';
  const [show, setShow] = useState(false);

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    // No Android, precisamos fechar o seletor manualmente
    setShow(Platform.OS === 'ios');
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR'); // Adapte para seu locale
  };

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: Colors[theme].text }]}>{label}</Text>}

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setShow(true)}
        style={[
          styles.input,
          {
            backgroundColor: Colors[theme].inputBackground,
            borderColor: error ? Colors[theme].inputError : Colors[theme].inputBorder,
          },
        ]}
      >
        <Text style={{ color: value ? Colors[theme].text : Colors[theme].inputPlaceholder }}>
          {value ? formatDate(value) : placeholder}
        </Text>
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={value || new Date()}
          mode={mode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
        />
      )}

      {error && <Text style={[styles.errorText, { color: Colors[theme].errorText }]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 32 },
  label: { marginBottom: 8, marginLeft: 4 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'center',
  },
  errorText: { marginTop: 4, marginLeft: 4, fontSize: 12, fontWeight: '500' },
});

export default ThemedDatePicker;
