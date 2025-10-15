import React from 'react';
import { Box, Typography, Paper, Stack, Divider, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { employeeService } from '@/services/employeeService';

const EmployeeDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['employee', id],
    queryFn: async () => employeeService.getById(Number(id)),
    enabled: !!id,
  });

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" component="h1" gutterBottom>
          Employee Detail
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => navigate('/employees')}>Back</Button>
          <Button variant="contained" onClick={() => navigate(`/employees/${id}/edit`)}>Edit</Button>
        </Stack>
      </Stack>
      <Paper sx={{ p: 3, mt: 2 }}>
        {isLoading && (
          <Typography variant="body1">Loading...</Typography>
        )}
        {isError && (
          <Typography variant="body1" color="error">Failed to load employee.</Typography>
        )}
        {data && (
          <Stack spacing={1}>
            <Typography variant="h6">{data.fullName || `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim()}</Typography>
            <Divider sx={{ my: 1 }} />
            <Typography>Email: {data.email || '-'}</Typography>
            <Typography>Code: {data.employeeCode || '-'}</Typography>
            <Typography>Company: {data.companyName || '-'}</Typography>
            <Typography>Department: {data.departmentName || '-'}</Typography>
            <Typography>Status: {data.status || '-'}</Typography>
            <Typography>Employment Type: {data.employmentType || '-'}</Typography>
            <Typography>Start Date: {data.startDate || '-'}</Typography>
            <Typography>End Date: {data.endDate || '-'}</Typography>
          </Stack>
        )}
      </Paper>
    </Box>
  );
};

export default EmployeeDetail;