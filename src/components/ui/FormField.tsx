import { TextField, TextFieldProps } from '@mui/material';
import { Controller, Control, FieldPath, FieldValues } from 'react-hook-form';

interface FormFieldProps<T extends FieldValues> extends Omit<TextFieldProps, 'name'> {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
  required?: boolean;
}

/**
 * Reusable form field component with React Hook Form integration
 */
export function FormField<T extends FieldValues>({
  name,
  control,
  label,
  required = false,
  ...textFieldProps
}: FormFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          {...textFieldProps}
          label={label}
          required={required}
          error={!!error}
          helperText={error?.message}
          fullWidth
        />
      )}
    />
  );
}

export default FormField;

