import React from 'react';
import { Typography, Stack, TextField, MenuItem, Button } from '@mui/material';
import { SubmitHandler } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { employeeService } from '@/services/employeeService';
import { Employee, EmployeeCreateDTO, EmployeeUpdateDTO, EmploymentType } from '@/types';
import PageContainer from '@/components/ui/PageContainer';
import SectionCard from '@/components/ui/SectionCard';
import { useFormValidation } from '@/hooks/useFormValidation';
import { employeeCreateSchema } from '@/utils/validation';

const employmentTypes: EmploymentType[] = [
  'FULL_TIME',
  'PART_TIME',
  'CONTRACT',
  'TEMPORARY',
  'INTERN',
  'FREELANCE',
  'CONSULTANT',
  'VOLUNTEER',
];

const EmployeeForm: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const { data: existing } = useQuery({
    queryKey: ['employee', id],
    queryFn: async () => employeeService.getById(Number(id)),
    enabled: isEdit,
  });

  const { register, handleSubmit, reset } = useFormValidation<
    EmployeeCreateDTO & Partial<EmployeeUpdateDTO>
  >(
    employeeCreateSchema as any, // Type assertion needed due to yup schema typing
    {
      firstName: existing?.firstName ?? '',
      lastName: existing?.lastName ?? '',
      email: existing?.email ?? '',
      position: existing?.position ?? '',
      startDate: existing?.startDate ?? '',
      employmentType: (existing?.employmentType as EmploymentType) ?? 'FULL_TIME',
      companyId: existing?.companyId ?? undefined,
      departmentId: existing?.departmentId ?? undefined,
      managerId: existing?.managerId ?? undefined,
    }
  );

  React.useEffect(() => {
    if (existing) {
      reset({
        firstName: existing.firstName ?? '',
        lastName: existing.lastName ?? '',
        email: existing.email ?? '',
        position: existing.position ?? '',
        startDate: existing.startDate ?? '',
        employmentType: (existing.employmentType as EmploymentType) ?? 'FULL_TIME',
        companyId: existing.companyId,
        departmentId: existing.departmentId,
        managerId: existing.managerId,
      });
    }
  }, [existing, reset]);

  const createMutation = useMutation({
    mutationFn: (payload: EmployeeCreateDTO) => employeeService.create(payload),
    onSuccess: (emp: Employee) => navigate(`/employees/${emp.id}`),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: EmployeeUpdateDTO) => employeeService.update(Number(id), payload),
    onSuccess: () => navigate(`/employees/${id}`),
  });

  const onSubmit: SubmitHandler<EmployeeCreateDTO & Partial<EmployeeUpdateDTO>> = (values) => {
    if (isEdit) {
      const updatePayload: EmployeeUpdateDTO = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        position: values.position,
        startDate: values.startDate,
        employmentType: values.employmentType,
        companyId: values.companyId,
        departmentId: values.departmentId,
        managerId: values.managerId,
      };
      updateMutation.mutate(updatePayload);
    } else {
      const createPayload: EmployeeCreateDTO = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email!,
        position: values.position!,
        startDate: values.startDate!,
        employmentType: values.employmentType!,
        companyId: values.companyId!,
        departmentId: values.departmentId,
        managerId: values.managerId,
      };
      createMutation.mutate(createPayload);
    }
  };

  return (
    <PageContainer title={isEdit ? t('employee.editEmployee') : t('employee.createEmployee')}>
      <SectionCard>
        <form onSubmit={handleSubmit(onSubmit as any)} noValidate>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label={t('employee.firstName')} fullWidth required {...register('firstName')} />
              <TextField label={t('employee.lastName')} fullWidth required {...register('lastName')} />
            </Stack>
            <TextField label={t('employee.email')} type="email" required {...register('email')} />
            <TextField label={t('employee.position')} required {...register('position')} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label={t('employee.company') + ' ID'} type="number" required {...register('companyId', { valueAsNumber: true })} />
              <TextField label={t('employee.department') + ' ID'} type="number" {...register('departmentId', { valueAsNumber: true })} />
              <TextField label={t('employee.manager') + ' ID'} type="number" {...register('managerId', { valueAsNumber: true })} />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label={t('employee.hireDate')} type="date" InputLabelProps={{ shrink: true }} required {...register('startDate')} />
              <TextField label={t('employee.employmentType')} select required defaultValue={employmentTypes[0]} {...register('employmentType')}>
                {employmentTypes.map((et) => (
                  <MenuItem key={et} value={et}>{et}</MenuItem>
                ))}
              </TextField>
            </Stack>
            <Stack direction="row" spacing={2}>
              <Button variant="outlined" onClick={() => navigate('/employees')}>{t('common.cancel')}</Button>
              <Button variant="contained" type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {isEdit ? t('common.save') : t('common.create')}
              </Button>
            </Stack>
            {(createMutation.isError || updateMutation.isError) && (
              <Typography variant="body2" color="error">{t('error.saveFailed')}</Typography>
            )}
          </Stack>
        </form>
      </SectionCard>
    </PageContainer>
  );
};

export default EmployeeForm;
