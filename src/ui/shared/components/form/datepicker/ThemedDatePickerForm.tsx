import React from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import ThemedDatePicker, { ThemedDatePickerProps } from './ThemedDatePicker';

interface ThemedDatePickerFormProps<T extends FieldValues> extends Omit<ThemedDatePickerProps, 'value' | 'onChange'> {
  control: Control<T>;
  name: Path<T>;
}

export function ThemedDatePickerForm<T extends FieldValues>({ control, name, ...rest }: ThemedDatePickerFormProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <ThemedDatePicker
          {...rest}
          value={value ? new Date(value) : new Date()}
          onChange={onChange}
          error={error?.message}
        />
      )}
    />
  );
}
