import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

export interface ThemedInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  rightElement?: React.ReactNode;
  error?: string;
  multiline?: boolean;
  numberOfLines?: number;
}

const ThemedInput: React.FC<ThemedInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'none',
  rightElement,
  error,
  multiline,
  numberOfLines,
}) => {
  const theme = useColorScheme() ?? 'light';

  return (
    <View style={styles.inputContainer}>
      {label ? <Text style={[styles.label, { color: Colors[theme].text }]}>{label}</Text> : null}
      <View style={{ position: 'relative' }}>
        <TextInput
          style={[
            styles.input,
            multiline && styles.multilineInput,
            {
              backgroundColor: Colors[theme].inputBackground,
              borderColor: error ? Colors[theme].inputError : Colors[theme].inputBorder,
              color: Colors[theme].text,
              paddingRight: rightElement ? 60 : 16,
            },
          ]}
          placeholder={placeholder}
          placeholderTextColor={Colors[theme].inputPlaceholder}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={secureTextEntry}
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
        {rightElement ? (
          <View style={{ position: 'absolute', right: 2, top: 0, bottom: 0, justifyContent: 'center' }}>
            {rightElement}
          </View>
        ) : null}
      </View>
      <Text
        style={[
          styles.errorText,
          {
            color: Colors[theme].errorText,
          },
        ]}
      >
        {error}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 4,
  },
  label: {
    marginBottom: 4,
    marginLeft: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  multilineInput: {
    paddingVertical: 12,
    minHeight: 80,
  },
  errorText: {
    marginTop: 4,
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
  },
});

export default ThemedInput;
