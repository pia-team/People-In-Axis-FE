import React from 'react';
import { Box, Typography, Paper, Stack, Divider, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { departmentService } from '@/services/departmentService';
import { Department } from '@/types';

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
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" component="h1" gutterBottom>
          Department Detail
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => navigate('/departments')}>Back</Button>
          <Button variant="contained" onClick={() => navigate(`/departments/${id}/edit`)}>Edit</Button>
        </Stack>
      </Stack>
      <Paper sx={{ p: 3, mt: 2 }}>
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
      </Paper>
    </Box>
  );
};

export default DepartmentDetail;