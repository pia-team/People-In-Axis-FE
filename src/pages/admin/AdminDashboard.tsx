import React from 'react';
import { Box, Typography, Paper, Grid, Stack } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { employeeService } from '@/services/employeeService';
import { companyService } from '@/services/companyService';
import { departmentService } from '@/services/departmentService';
import { projectService } from '@/services/projectService';
import { timeSheetService } from '@/services/timesheetService';
import { expenseService } from '@/services/expenseService';

const AdminDashboard: React.FC = () => {
  const useCount = (key: string[], fetcher: () => Promise<{ totalElements: number }>) => {
    return useQuery({ queryKey: key, queryFn: fetcher });
  };

  const employees = useCount(['kpi','employees'], async () => await employeeService.getAll({ page: 0, size: 1 }) as any);
  const companies = useCount(['kpi','companies'], async () => await companyService.getAll({ page: 0, size: 1 }) as any);
  const departments = useCount(['kpi','departments'], async () => await departmentService.getAll({ page: 0, size: 1 }) as any);
  const projects = useCount(['kpi','projects'], async () => await projectService.getAll({ page: 0, size: 1 }) as any);
  const timesheets = useCount(['kpi','timesheets'], async () => await timeSheetService.getAll({ page: 0, size: 1 }) as any);
  const expenses = useCount(['kpi','expenses'], async () => await expenseService.getAll({ page: 0, size: 1 }) as any);

  const Card = ({ title, count, loading }: { title: string; count?: number; loading?: boolean }) => (
    <Paper sx={{ p: 2 }}>
      <Stack>
        <Typography variant="overline" color="text.secondary">{title}</Typography>
        <Typography variant="h4">{loading ? '...' : (count ?? 0)}</Typography>
      </Stack>
    </Paper>
  );

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12} sm={6} md={4}><Card title="Employees" count={(employees.data as any)?.totalElements} loading={employees.isLoading} /></Grid>
        <Grid item xs={12} sm={6} md={4}><Card title="Companies" count={(companies.data as any)?.totalElements} loading={companies.isLoading} /></Grid>
        <Grid item xs={12} sm={6} md={4}><Card title="Departments" count={(departments.data as any)?.totalElements} loading={departments.isLoading} /></Grid>
        <Grid item xs={12} sm={6} md={4}><Card title="Projects" count={(projects.data as any)?.totalElements} loading={projects.isLoading} /></Grid>
        <Grid item xs={12} sm={6} md={4}><Card title="Timesheets" count={(timesheets.data as any)?.totalElements} loading={timesheets.isLoading} /></Grid>
        <Grid item xs={12} sm={6} md={4}><Card title="Expenses" count={(expenses.data as any)?.totalElements} loading={expenses.isLoading} /></Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;