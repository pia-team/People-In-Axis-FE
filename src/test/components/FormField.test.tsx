import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import { useForm } from 'react-hook-form';
import FormField from '@/components/ui/FormField';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

const TestForm: React.FC<{ schema: yup.ObjectSchema<any>; defaultValues?: any }> = ({
  schema,
  defaultValues,
}) => {
  const { control } = useForm({
    resolver: yupResolver(schema),
    defaultValues,
    mode: 'onChange',
  });

  return (
    <form>
      <FormField
        name="name"
        control={control}
        label="Name"
        required
      />
    </form>
  );
};

describe('FormField', () => {
  it('renders form field with label', () => {
    const schema = yup.object({
      name: yup.string().required('Name is required'),
    });

    render(<TestForm schema={schema} />);
    // MUI TextField renders label as text in the label element
    expect(screen.getByText('Name')).toBeInTheDocument();
    // Check if input is rendered
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
  });

  it('renders required field', () => {
    const schema = yup.object({
      name: yup.string().required('Name is required'),
    });

    render(<TestForm schema={schema} />);
    // Check if input field is rendered
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('required');
  });

  it('renders optional field', () => {
    const schema = yup.object({
      email: yup.string().email('Invalid email').optional(),
    });

    const TestOptionalForm = () => {
      const { control } = useForm({
        resolver: yupResolver(schema),
      });

      return (
        <form>
          <FormField
            name="email"
            control={control}
            label="Email"
            required={false}
          />
        </form>
      );
    };

    render(<TestOptionalForm />);
    // Check if input field is rendered
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
  });
});
