import React from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import ThemedInput, { ThemedInputProps } from './ThemedInput';

interface ThemedInputFormProps<T extends FieldValues> extends Omit<ThemedInputProps, 'value' | 'onChangeText'> {
  control: Control<T>;
  name: Path<T>;
}

export function ThemedInputForm<T extends FieldValues>({ control, name, ...rest }: ThemedInputFormProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => <ThemedInput {...rest} value={value} onChangeText={onChange} />}
    />
  );
}
