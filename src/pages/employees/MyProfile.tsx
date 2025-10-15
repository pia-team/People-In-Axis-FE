import React from 'react';
import { Box, Typography, Paper, Stack, Divider } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { employeeService } from '@/services/employeeService';
import { Employee } from '@/types';

const MyProfile: React.FC = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['me'],
    queryFn: async () => employeeService.getCurrentEmployee(),
  });

  const me = data as Employee | undefined;

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        My Profile
      </Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
        {isLoading && <Typography>Loading...</Typography>}
        {isError && <Typography color="error">Failed to load profile.</Typography>}
        {me && (
          <Stack spacing={1}>
            <Typography variant="h6">{me.fullName || `${me.firstName ?? ''} ${me.lastName ?? ''}`.trim()}</Typography>
            <Divider sx={{ my: 1 }} />
            <Typography>Employee Code: {me.employeeCode}</Typography>
            <Typography>Email: {me.email}</Typography>
            <Typography>Company: {me.companyName || '-'}</Typography>
            <Typography>Department: {me.departmentName || '-'}</Typography>
            <Typography>Manager: {me.managerName || '-'}</Typography>
            <Typography>Status: {me.status}</Typography>
          </Stack>
        )}
      </Paper>
    </Box>
  );
};

export default MyProfile;