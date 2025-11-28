import React from 'react';
import { Stack, TextField, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { departmentService } from '@/services/departmentService';
import { Department, DepartmentCreateDTO, DepartmentUpdateDTO } from '@/types';
import PageContainer from '@/components/ui/PageContainer';
import SectionCard from '@/components/ui/SectionCard';
import { useTranslation } from 'react-i18next';

const DepartmentForm: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ['department', id],
    queryFn: async () => departmentService.getById(Number(id)),
    enabled: isEdit,
  });

  const existing = (data as Department | undefined) || undefined;

  const [form, setForm] = React.useState<Partial<DepartmentCreateDTO & DepartmentUpdateDTO>>({
    name: '',
    description: '',
    location: '',
    budget: undefined,
    companyId: undefined,
    managerId: undefined,
    parentDepartmentId: undefined,
  });

  React.useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name,
        description: existing.description || '',
        location: existing.location || '',
        budget: existing.budget,
        companyId: existing.companyId,
        managerId: existing.managerId ?? undefined,
        parentDepartmentId: existing.parentDepartmentId ?? undefined,
      });
    }
  }, [existing]);

  const { mutateAsync: save, isPending } = useMutation({
    mutationFn: async () => {
      const payload = form as DepartmentCreateDTO;
      if (!payload.name || !payload.companyId) throw new Error('Name and Company ID are required');
      if (isEdit) {
        return departmentService.update(Number(id), payload as DepartmentUpdateDTO);
      }
      return departmentService.create(payload);
    },
  });

  const handleChange = (key: keyof (DepartmentCreateDTO & DepartmentUpdateDTO)) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [key]: value === '' ? '' : value }));
  };

  const handleNumber = (key: keyof (DepartmentCreateDTO & DepartmentUpdateDTO)) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [key]: value === '' ? undefined : Number(value) }));
  };

  const onSubmit = async () => {
    try {
      await save();
      navigate('/departments');
    } catch (err) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error('Department save failed:', err);
      }
      // Log to Sentry in production
      try {
        const Sentry = await import('@sentry/react');
        Sentry.captureException(err instanceof Error ? err : new Error(String(err)), {
          tags: { component: 'DepartmentForm', action: 'save' }
        });
      } catch {
        // Sentry not available
      }
    }
  };

  return (
    <PageContainer title={isEdit ? t('department.editDepartmentTitle') : t('department.newDepartment')}>
      <SectionCard>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label={t('department.name')} value={form.name || ''} onChange={handleChange('name')} fullWidth required />
            <TextField label={t('department.companyId')} type="number" value={form.companyId ?? ''} onChange={handleNumber('companyId')} sx={{ minWidth: 200 }} required />
            <TextField label={t('department.managerId')} type="number" value={form.managerId ?? ''} onChange={handleNumber('managerId')} sx={{ minWidth: 200 }} />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label={t('department.parentDepartmentId')} type="number" value={form.parentDepartmentId ?? ''} onChange={handleNumber('parentDepartmentId')} sx={{ minWidth: 200 }} />
            <TextField label={t('department.location')} value={form.location || ''} onChange={handleChange('location')} sx={{ minWidth: 200 }} />
            <TextField label={t('department.budget')} type="number" value={form.budget ?? ''} onChange={handleNumber('budget')} sx={{ minWidth: 200 }} />
          </Stack>
          <TextField label={t('department.description')} value={form.description || ''} onChange={handleChange('description')} multiline minRows={3} />
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={() => navigate('/departments')}>{t('common.cancel')}</Button>
            <Button variant="contained" onClick={onSubmit} disabled={isPending}>{isEdit ? t('common.save') : t('common.create')}</Button>
          </Stack>
        </Stack>
      </SectionCard>
    </PageContainer>
  );
};

export default DepartmentForm;