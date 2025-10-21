import React from 'react';
import { Typography, Stack, Divider, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { companyService } from '@/services/companyService';
import { Company } from '@/types';
import PageContainer from '@/components/ui/PageContainer';
import SectionCard from '@/components/ui/SectionCard';

const CompanyDetail: React.FC = () => {
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
      title="Company Detail"
      actions={
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => navigate('/companies')}>Back</Button>
          <Button variant="contained" onClick={() => navigate(`/companies/${id}/edit`)}>Edit</Button>
        </Stack>
      }
    >
      <SectionCard>
        {isLoading && <Typography>Loading...</Typography>}
        {isError && <Typography color="error">Failed to load company.</Typography>}
        {company && (
          <Stack spacing={1}>
            <Typography variant="h6">{company.name} ({company.code || '-'})</Typography>
            <Divider sx={{ my: 1 }} />
            <Typography>Email: {company.email || '-'}</Typography>
            <Typography>Phone: {company.phone || '-'}</Typography>
            <Typography>Website: {company.website || '-'}</Typography>
            <Typography>Tax Number: {company.taxNumber || '-'}</Typography>
            <Typography>City: {company.city || '-'}</Typography>
            <Typography>Country: {company.country || '-'}</Typography>
            <Typography>Address: {company.address || '-'}</Typography>
            <Typography>Sector: {company.sector || '-'}</Typography>
            <Typography>Established: {company.establishedYear || '-'}</Typography>
            <Typography>Parent Company ID: {company.parentCompanyId ?? '-'}</Typography>
            <Typography>Status: {company.isActive ? 'Active' : 'Inactive'}</Typography>
            {company.description && (
              <>
                <Divider sx={{ my: 1 }} />
                <Typography>Description: {company.description}</Typography>
              </>
            )}
          </Stack>
        )}
      </SectionCard>
    </PageContainer>
  );
};

export default CompanyDetail;