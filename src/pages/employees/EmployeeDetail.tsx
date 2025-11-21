import React from 'react';
import { Typography, Stack, Divider, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { employeeService } from '@/services/employeeService';
import PageContainer from '@/components/ui/PageContainer';
import SectionCard from '@/components/ui/SectionCard';

const EmployeeDetail: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['employee', id],
    queryFn: async () => employeeService.getById(Number(id)),
    enabled: !!id,
  });

  return (
    <PageContainer
      title={t('employee.employeeDetails')}
      actions={
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => navigate('/employees')}>{t('common.back')}</Button>
          <Button variant="contained" onClick={() => navigate(`/employees/${id}/edit`)}>{t('common.edit')}</Button>
        </Stack>
      }
    >
      <SectionCard>
        {isLoading && (
          <Typography variant="body1">{t('common.loading')}</Typography>
        )}
        {isError && (
          <Typography variant="body1" color="error">{t('error.loadFailed', { item: t('employee.title').toLowerCase() })}</Typography>
        )}
        {data && (
          <Stack spacing={1}>
            <Typography variant="h6">{data.fullName || `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim()}</Typography>
            <Divider sx={{ my: 1 }} />
            <Typography>{t('employee.email')}: {data.email || '-'}</Typography>
            <Typography>{t('employee.employeeCode')}: {data.employeeCode || '-'}</Typography>
            <Typography>{t('employee.company')}: {data.companyName || '-'}</Typography>
            <Typography>{t('employee.department')}: {data.departmentName || '-'}</Typography>
            <Typography>{t('common.status')}: {data.status || '-'}</Typography>
            <Typography>{t('employee.employmentType')}: {data.employmentType || '-'}</Typography>
            <Typography>{t('employee.hireDate')}: {data.startDate || '-'}</Typography>
            <Typography>{t('employee.terminationDate')}: {data.endDate || '-'}</Typography>
          </Stack>
        )}
      </SectionCard>
    </PageContainer>
  );
};

export default EmployeeDetail;
