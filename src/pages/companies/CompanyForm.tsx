import React from 'react';
import { Stack, TextField, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { companyService } from '@/services/companyService';
import { Company, CompanyCreateDTO, CompanyUpdateDTO } from '@/types';
import PageContainer from '@/components/ui/PageContainer';
import SectionCard from '@/components/ui/SectionCard';

const CompanyForm: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ['company', id],
    queryFn: async () => companyService.getById(Number(id)),
    enabled: isEdit,
  });

  const existing = (data as Company | undefined) || undefined;

  const [form, setForm] = React.useState<Partial<CompanyCreateDTO & CompanyUpdateDTO>>({
    name: '',
    taxNumber: '',
    taxOffice: '',
    email: '',
    phone: '',
    fax: '',
    website: '',
    address: '',
    city: '',
    district: '',
    postalCode: '',
    country: '',
    logoUrl: '',
    sector: '',
    employeeCount: undefined,
    establishedYear: undefined,
    description: '',
    parentCompanyId: undefined,
  });

  React.useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name,
        taxNumber: existing.taxNumber || '',
        taxOffice: existing.taxOffice || '',
        email: existing.email || '',
        phone: existing.phone || '',
        fax: existing.fax || '',
        website: existing.website || '',
        address: existing.address || '',
        city: existing.city || '',
        district: existing.district || '',
        postalCode: existing.postalCode || '',
        country: existing.country || '',
        logoUrl: existing.logoUrl || '',
        sector: existing.sector || '',
        employeeCount: existing.employeeCount,
        establishedYear: existing.establishedYear,
        description: existing.description || '',
        parentCompanyId: existing.parentCompanyId ?? undefined,
      });
    }
  }, [existing]);

  const { mutateAsync: save, isPending } = useMutation({
    mutationFn: async () => {
      const payload = form as CompanyCreateDTO;
      if (!payload.name) throw new Error(t('validation.required'));
      if (isEdit) {
        return companyService.update(Number(id), payload as CompanyUpdateDTO);
      }
      return companyService.create(payload);
    },
  });

  const handleChange = (key: keyof (CompanyCreateDTO & CompanyUpdateDTO)) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleNumber = (key: keyof (CompanyCreateDTO & CompanyUpdateDTO)) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [key]: value === '' ? undefined : Number(value) }));
  };

  const onSubmit = async () => {
    try {
      await save();
      navigate('/companies');
    } catch (err) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error('Company save failed:', err);
      }
      // Log to Sentry in production
      try {
        const Sentry = await import('@sentry/react');
        Sentry.captureException(err instanceof Error ? err : new Error(String(err)), {
          tags: { component: 'CompanyForm', action: 'save' }
        });
      } catch {
        // Sentry not available
      }
    }
  };

  return (
    <PageContainer title={isEdit ? t('company.editCompany') : t('company.createCompany')}>
      <SectionCard>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label={t('company.name')} value={form.name || ''} onChange={handleChange('name')} fullWidth required />
            <TextField label={t('company.parentCompany') + ' ID'} type="number" value={form.parentCompanyId ?? ''} onChange={handleNumber('parentCompanyId')} sx={{ minWidth: 220 }} />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label={t('company.taxNumber')} value={form.taxNumber || ''} onChange={handleChange('taxNumber')} />
            <TextField label={t('company.taxOffice')} value={form.taxOffice || ''} onChange={handleChange('taxOffice')} />
            <TextField label={t('employee.email')} value={form.email || ''} onChange={handleChange('email')} />
            <TextField label={t('employee.phone')} value={form.phone || ''} onChange={handleChange('phone')} />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label={t('company.fax')} value={form.fax || ''} onChange={handleChange('fax')} />
            <TextField label={t('company.website')} value={form.website || ''} onChange={handleChange('website')} />
            <TextField label={t('company.logoUrl')} value={form.logoUrl || ''} onChange={handleChange('logoUrl')} />
            <TextField label={t('company.sector')} value={form.sector || ''} onChange={handleChange('sector')} />
          </Stack>
          <TextField label={t('company.address')} value={form.address || ''} onChange={handleChange('address')} multiline minRows={3} />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label={t('company.city')} value={form.city || ''} onChange={handleChange('city')} />
            <TextField label={t('company.district')} value={form.district || ''} onChange={handleChange('district')} />
            <TextField label={t('company.postalCode')} value={form.postalCode || ''} onChange={handleChange('postalCode')} />
            <TextField label={t('company.country')} value={form.country || ''} onChange={handleChange('country')} />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label={t('company.employeeCount')} type="number" value={form.employeeCount ?? ''} onChange={handleNumber('employeeCount')} />
            <TextField label={t('company.establishedYear')} type="number" value={form.establishedYear ?? ''} onChange={handleNumber('establishedYear')} />
          </Stack>
          <TextField label={t('common.description')} value={form.description || ''} onChange={handleChange('description')} multiline minRows={3} />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button variant="outlined" onClick={() => navigate('/companies')} sx={{ width: { xs: '100%', sm: 'auto' } }}>{t('common.cancel')}</Button>
            <Button variant="contained" onClick={onSubmit} disabled={isPending} sx={{ width: { xs: '100%', sm: 'auto' } }}>{isEdit ? t('common.save') : t('common.create')}</Button>
          </Stack>
        </Stack>
      </SectionCard>
    </PageContainer>
  );
};

export default CompanyForm;
