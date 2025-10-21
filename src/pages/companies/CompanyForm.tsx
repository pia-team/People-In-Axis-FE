import React from 'react';
import { Stack, TextField, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { companyService } from '@/services/companyService';
import { Company, CompanyCreateDTO, CompanyUpdateDTO } from '@/types';
import PageContainer from '@/components/ui/PageContainer';
import SectionCard from '@/components/ui/SectionCard';

const CompanyForm: React.FC = () => {
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
      if (!payload.name) throw new Error('Name is required');
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
      // eslint-disable-next-line no-console
      console.error(err);
    }
  };

  return (
    <PageContainer title={isEdit ? 'Edit Company' : 'New Company'}>
      <SectionCard>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Name" value={form.name || ''} onChange={handleChange('name')} fullWidth required />
            <TextField label="Parent Company ID" type="number" value={form.parentCompanyId ?? ''} onChange={handleNumber('parentCompanyId')} sx={{ minWidth: 220 }} />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Tax Number" value={form.taxNumber || ''} onChange={handleChange('taxNumber')} />
            <TextField label="Tax Office" value={form.taxOffice || ''} onChange={handleChange('taxOffice')} />
            <TextField label="Email" value={form.email || ''} onChange={handleChange('email')} />
            <TextField label="Phone" value={form.phone || ''} onChange={handleChange('phone')} />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Fax" value={form.fax || ''} onChange={handleChange('fax')} />
            <TextField label="Website" value={form.website || ''} onChange={handleChange('website')} />
            <TextField label="Logo URL" value={form.logoUrl || ''} onChange={handleChange('logoUrl')} />
            <TextField label="Sector" value={form.sector || ''} onChange={handleChange('sector')} />
          </Stack>
          <TextField label="Address" value={form.address || ''} onChange={handleChange('address')} multiline minRows={3} />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="City" value={form.city || ''} onChange={handleChange('city')} />
            <TextField label="District" value={form.district || ''} onChange={handleChange('district')} />
            <TextField label="Postal Code" value={form.postalCode || ''} onChange={handleChange('postalCode')} />
            <TextField label="Country" value={form.country || ''} onChange={handleChange('country')} />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Employee Count" type="number" value={form.employeeCount ?? ''} onChange={handleNumber('employeeCount')} />
            <TextField label="Established Year" type="number" value={form.establishedYear ?? ''} onChange={handleNumber('establishedYear')} />
          </Stack>
          <TextField label="Description" value={form.description || ''} onChange={handleChange('description')} multiline minRows={3} />
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={() => navigate('/companies')}>Cancel</Button>
            <Button variant="contained" onClick={onSubmit} disabled={isPending}>{isEdit ? 'Save' : 'Create'}</Button>
          </Stack>
        </Stack>
      </SectionCard>
    </PageContainer>
  );
};

export default CompanyForm;