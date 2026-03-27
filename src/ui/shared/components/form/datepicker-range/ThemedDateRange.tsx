import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface DateRange {
  start: Date;
  end: Date;
}

export interface ThemedDateRangeProps {
  label?: string;
  value: DateRange;
  onChange: (range: DateRange) => void;
  error?: string;
}

const ThemedDateRange: React.FC<ThemedDateRangeProps> = ({ label, value, onChange, error }) => {
  const theme = useColorScheme() ?? 'light';

  const [activePicker, setActivePicker] = useState<'start' | 'end' | null>(null);

  const onDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    setActivePicker(null);

    if (!selectedDate) return;

    if (activePicker === 'start') {
      onChange({ ...value, start: selectedDate });
    } else {
      onChange({ ...value, end: selectedDate });
    }
  };

  const formatDate = (date: Date) => date.toLocaleDateString('pt-BR');

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: Colors[theme].text }]}>{label}</Text>}

      <View style={styles.row}>
        {/* Input Início */}
        <TouchableOpacity
          style={[
            styles.input,
            { backgroundColor: Colors[theme].inputBackground, borderColor: Colors[theme].inputBorder },
          ]}
          onPress={() => setActivePicker('start')}
        >
          <Text style={{ fontSize: 12, color: Colors[theme].inputPlaceholder }}>Início</Text>
          <Text style={{ color: Colors[theme].text }}>{formatDate(value.start)}</Text>
        </TouchableOpacity>

        <View style={{ width: 10 }} />

        {/* Input Fim */}
        <TouchableOpacity
          style={[
            styles.input,
            { backgroundColor: Colors[theme].inputBackground, borderColor: Colors[theme].inputBorder },
          ]}
          onPress={() => setActivePicker('end')}
        >
          <Text style={{ fontSize: 12, color: Colors[theme].inputPlaceholder }}>Fim</Text>
          <Text style={{ color: Colors[theme].text }}>{formatDate(value.end)}</Text>
        </TouchableOpacity>
      </View>

      {activePicker && (
        <DateTimePicker
          value={activePicker === 'start' ? value.start : value.end}
          mode="date"
          minimumDate={activePicker === 'end' ? value.start : undefined}
          onChange={onDateChange}
        />
      )}

      {error && <Text style={[styles.errorText, { color: Colors[theme].errorText }]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  label: { marginBottom: 8, marginLeft: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  input: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 12 },
  errorText: { marginTop: 4, marginLeft: 4, fontSize: 12, fontWeight: '500' },
});

export default ThemedDateRange;
