import React from 'react';
import { Box, Typography, Paper, Stack, Divider, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { companyService } from '@/services/companyService';
import { Company } from '@/types';

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
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" component="h1" gutterBottom>
          Company Detail
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => navigate('/companies')}>Back</Button>
          <Button variant="contained" onClick={() => navigate(`/companies/${id}/edit`)}>Edit</Button>
        </Stack>
      </Stack>
      <Paper sx={{ p: 3, mt: 2 }}>
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
      </Paper>
    </Box>
  );
};

export default CompanyDetail;