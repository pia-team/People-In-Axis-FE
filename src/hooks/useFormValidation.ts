import { useForm, UseFormReturn, FieldValues, Path } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ObjectSchema } from 'yup';

/**
 * Custom hook for form validation with Yup
 * @param schema - Yup validation schema
 * @param defaultValues - Default form values
 * @returns Form methods from react-hook-form
 */
export function useFormValidation<T extends FieldValues>(
  schema: ObjectSchema<T>,
  defaultValues?: Partial<T>
) {
  return useForm<T>({
    resolver: yupResolver(schema) as any,
    defaultValues: defaultValues as any,
    mode: 'onBlur', // Validate on blur for better UX
  });
}

/**
 * Helper to get field error message
 */
export function getFieldError<T extends FieldValues>(
  form: UseFormReturn<T>,
  fieldName: Path<T>
): string | undefined {
  const error = form.formState.errors[fieldName];
  return error?.message as string | undefined;
}

/**
 * Helper to check if field has error
 */
export function hasFieldError<T extends FieldValues>(
  form: UseFormReturn<T>,
  fieldName: Path<T>
): boolean {
  return Boolean(form.formState.errors[fieldName]);
}

