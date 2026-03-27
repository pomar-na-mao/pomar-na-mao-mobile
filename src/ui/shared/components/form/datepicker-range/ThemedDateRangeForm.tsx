import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import ThemedDateRange, { type ThemedDateRangeProps } from './ThemedDateRange';

interface ThemedDateRangeFormProps<T extends FieldValues> extends Omit<ThemedDateRangeProps, 'value' | 'onChange'> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
}

export function ThemedDateRangeForm<T extends FieldValues>({
  control,
  name,
  label,
  ...rest
}: ThemedDateRangeFormProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <ThemedDateRange
          {...rest}
          label={label}
          value={value || { start: new Date(), end: new Date() }}
          onChange={onChange}
        />
      )}
    />
  );
}
