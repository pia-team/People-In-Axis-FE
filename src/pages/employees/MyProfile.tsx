import React from 'react';
import { Typography, Stack, Divider } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { employeeService } from '@/services/employeeService';
import { Employee } from '@/types';
import PageContainer from '@/components/ui/PageContainer';
import SectionCard from '@/components/ui/SectionCard';
import LoadingState from '@/components/ui/LoadingState';

const MyProfile: React.FC = () => {
  const { t } = useTranslation();
  const { data, isPending, isError } = useQuery({
    queryKey: ['me'],
    queryFn: async () => employeeService.getCurrentEmployee(),
  });

  const me = data as Employee | undefined;

  return (
    <PageContainer title={t('navigation.myProfile')}>
      <SectionCard>
        {isPending && <LoadingState message={t('common.loading')} />}
        {isError && <Typography color="error">{t('error.loadFailed', { item: t('employee.profile').toLowerCase() })}</Typography>}
        {me && (
          <Stack spacing={1}>
            <Typography variant="h6">{me.fullName || `${me.firstName ?? ''} ${me.lastName ?? ''}`.trim()}</Typography>
            <Divider sx={{ my: 1 }} />
            <Typography>{t('employee.employeeCode')}: {me.employeeCode}</Typography>
            <Typography>{t('employee.email')}: {me.email}</Typography>
            <Typography>{t('employee.company')}: {me.companyName || '-'}</Typography>
            <Typography>{t('employee.department')}: {me.departmentName || '-'}</Typography>
            <Typography>{t('employee.manager')}: {me.managerName || '-'}</Typography>
            <Typography>{t('common.status')}: {me.status}</Typography>
          </Stack>
        )}
      </SectionCard>
    </PageContainer>
  );
};

export default MyProfile;