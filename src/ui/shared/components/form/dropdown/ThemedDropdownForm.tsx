import React from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import ThemedDropdown, { ThemedDropdownProps } from './ThemedDropdown';

// Omitimos 'value' e 'onSelect' pois serão controlados pelo react-hook-form
interface ThemedDropdownFormProps<T extends FieldValues> extends Omit<ThemedDropdownProps, 'value' | 'onSelect'> {
  control: Control<T>;
  name: Path<T>;
}

export function ThemedDropdownForm<T extends FieldValues>({ control, name, ...rest }: ThemedDropdownFormProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <ThemedDropdown {...rest} value={value} onSelect={onChange} error={error?.message} />
      )}
    />
  );
}
