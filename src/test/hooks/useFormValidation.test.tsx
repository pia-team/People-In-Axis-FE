import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@/test/utils';
import { useFormValidation, getFieldError, hasFieldError } from '@/hooks/useFormValidation';
import * as yup from 'yup';

describe('useFormValidation', () => {
  const testSchema = yup.object({
    name: yup.string().required('Name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    age: yup.number().min(18, 'Age must be at least 18').optional(),
  });

  it('initializes form with default values', () => {
    const { result } = renderHook(() =>
      useFormValidation(testSchema, {
        name: 'Test',
        email: 'test@example.com',
      })
    );

    expect(result.current.getValues()).toEqual({
      name: 'Test',
      email: 'test@example.com',
    });
  });

  it('returns form methods', () => {
    const { result } = renderHook(() => useFormValidation(testSchema));

    expect(result.current.register).toBeDefined();
    expect(result.current.handleSubmit).toBeDefined();
    expect(result.current.setValue).toBeDefined();
    expect(result.current.getValues).toBeDefined();
    expect(result.current.formState).toBeDefined();
  });

  it('validates form fields', async () => {
    const { result } = renderHook(() => useFormValidation(testSchema));

    // Set empty value
    result.current.setValue('name', '', { shouldValidate: true });
    
    // Trigger validation - this should populate errors
    const triggerResult = await result.current.trigger('name');
    
    // trigger returns a boolean indicating if validation passed
    expect(triggerResult).toBe(false);
    
    // React Hook Form updates formState asynchronously
    // Use getFieldState to get the current field state
    await waitFor(
      () => {
        const fieldState = result.current.getFieldState('name');
        expect(fieldState.invalid).toBe(true);
        expect(fieldState.error?.message).toBe('Name is required');
      },
      { timeout: 3000, interval: 100 }
    );
  });
});

describe('getFieldError', () => {
  it('returns error message when field has error', () => {
    const form = {
      formState: {
        errors: {
          name: { message: 'Name is required' },
        },
      },
    } as any;

    expect(getFieldError(form, 'name')).toBe('Name is required');
  });

  it('returns undefined when field has no error', () => {
    const form = {
      formState: {
        errors: {},
      },
    } as any;

    expect(getFieldError(form, 'name')).toBeUndefined();
  });
});

describe('hasFieldError', () => {
  it('returns true when field has error', () => {
    const form = {
      formState: {
        errors: {
          name: { message: 'Name is required' },
        },
      },
    } as any;

    expect(hasFieldError(form, 'name')).toBe(true);
  });

  it('returns false when field has no error', () => {
    const form = {
      formState: {
        errors: {},
      },
    } as any;

    expect(hasFieldError(form, 'name')).toBe(false);
  });
});
