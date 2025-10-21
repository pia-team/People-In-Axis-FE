import React from 'react';
import { Typography, Stack, Divider, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { departmentService } from '@/services/departmentService';
import { Department } from '@/types';
import PageContainer from '@/components/ui/PageContainer';
import SectionCard from '@/components/ui/SectionCard';

const DepartmentDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['department', id],
    queryFn: async () => departmentService.getById(Number(id)),
    enabled: !!id,
  });

  const dept = data as Department | undefined;

  return (
    <PageContainer
      title="Department Detail"
      actions={
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => navigate('/departments')}>Back</Button>
          <Button variant="contained" onClick={() => navigate(`/departments/${id}/edit`)}>Edit</Button>
        </Stack>
      }
    >
      <SectionCard>
        {isLoading && <Typography>Loading...</Typography>}
        {isError && <Typography color="error">Failed to load department.</Typography>}
        {dept && (
          <Stack spacing={1}>
            <Typography variant="h6">{dept.name} ({dept.code || '-'})</Typography>
            <Divider sx={{ my: 1 }} />
            <Typography>Company: {dept.companyName || '-'}</Typography>
            <Typography>Manager: {dept.managerName || '-'}</Typography>
            <Typography>Parent Department ID: {dept.parentDepartmentId ?? '-'}</Typography>
            <Typography>Location: {dept.location || '-'}</Typography>
            <Typography>Budget: {dept.budget ?? '-'}</Typography>
            <Typography>Status: {dept.isActive ? 'Active' : 'Inactive'}</Typography>
            {dept.description && (
              <>
                <Divider sx={{ my: 1 }} />
                <Typography>Description: {dept.description}</Typography>
              </>
            )}
          </Stack>
        )}
      </SectionCard>
    </PageContainer>
  );
};

export default DepartmentDetail;