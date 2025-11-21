import React from 'react';
import { Typography, Stack, Divider, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { companyService } from '@/services/companyService';
import { Company } from '@/types';
import PageContainer from '@/components/ui/PageContainer';
import SectionCard from '@/components/ui/SectionCard';

const CompanyDetail: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['company', id],
    queryFn: async () => companyService.getById(Number(id)),
    enabled: !!id,
  });

  const company = data as Company | undefined;

  return (
    <PageContainer
      title={t('company.companyDetails')}
      actions={
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => navigate('/companies')}>{t('common.back')}</Button>
          <Button variant="contained" onClick={() => navigate(`/companies/${id}/edit`)}>{t('common.edit')}</Button>
        </Stack>
      }
    >
      <SectionCard>
        {isLoading && <Typography>{t('common.loading')}</Typography>}
        {isError && <Typography color="error">{t('error.loadFailed', { item: t('company.title').toLowerCase() })}</Typography>}
        {company && (
          <Stack spacing={1}>
            <Typography variant="h6">{company.name} ({company.code || '-'})</Typography>
            <Divider sx={{ my: 1 }} />
            <Typography>{t('employee.email')}: {company.email || '-'}</Typography>
            <Typography>{t('employee.phone')}: {company.phone || '-'}</Typography>
            <Typography>{t('company.website')}: {company.website || '-'}</Typography>
            <Typography>{t('company.taxNumber')}: {company.taxNumber || '-'}</Typography>
            <Typography>{t('company.city')}: {company.city || '-'}</Typography>
            <Typography>{t('company.country')}: {company.country || '-'}</Typography>
            <Typography>{t('company.address')}: {company.address || '-'}</Typography>
            <Typography>{t('company.sector')}: {company.sector || '-'}</Typography>
            <Typography>{t('company.establishedYear')}: {company.establishedYear || '-'}</Typography>
            <Typography>{t('company.parentCompany')} ID: {company.parentCompanyId ?? '-'}</Typography>
            <Typography>{t('common.status')}: {company.isActive ? t('status.active') : t('status.inactive')}</Typography>
            {company.description && (
              <>
                <Divider sx={{ my: 1 }} />
                <Typography>{t('common.description')}: {company.description}</Typography>
              </>
            )}
          </Stack>
        )}
      </SectionCard>
    </PageContainer>
  );
};

export default CompanyDetail;
