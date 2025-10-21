import React from 'react';
import { Box, Typography, Grid, Paper, Stack, Button, Skeleton } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboardService';
import { Link } from 'react-router-dom';
import { useKeycloak } from '@/hooks/useKeycloak';

const Dashboard: React.FC = () => {
  const { hasRole, hasAnyRole } = useKeycloak();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'metrics'],
    queryFn: () => dashboardService.getMetrics(),
    staleTime: 30_000,
  });

  const value = (n?: number) => (
    isLoading ? <Skeleton variant="text" width={48} height={48} /> : <Typography variant="h3">{n ?? 0}</Typography>
  );

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Stack spacing={1}>
              <Typography variant="h6">Total Employees</Typography>
              {value(data?.totalEmployees)}
              <Button size="small" component={Link} to="/employees">View</Button>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Stack spacing={1}>
              <Typography variant="h6">Active Projects</Typography>
              {value(data?.activeProjects)}
              <Button size="small" component={Link} to="/projects">View</Button>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Stack spacing={1}>
              <Typography variant="h6">Pending Timesheets (Manager)</Typography>
              {value(data?.pendingTimesheetsManager)}
              {hasAnyRole(['TEAM_MANAGER', 'HUMAN_RESOURCES']) && (
                <Button size="small" component={Link} to="/timesheets/approval">Review</Button>
              )}
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Stack spacing={1}>
              <Typography variant="h6">Pending Timesheets (Admin)</Typography>
              {value(data?.pendingTimesheetsAdmin)}
              {hasRole('ADMIN') && (
                <Button size="small" component={Link} to="/timesheets/admin-approval">Review</Button>
              )}
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Stack spacing={1}>
              <Typography variant="h6">Pending Expenses</Typography>
              {value(data?.pendingExpenses)}
              {hasAnyRole(['TEAM_MANAGER', 'HUMAN_RESOURCES', 'FINANCE']) && (
                <Button size="small" component={Link} to="/expenses/approval">Review</Button>
              )}
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Stack spacing={1}>
              <Typography variant="h6">Assigned Rows (Team Lead)</Typography>
              {value(data?.teamLeadAssignedRows)}
              {hasRole('TEAM_MANAGER') && (
                <Button size="small" component={Link} to="/timesheets/assigned">Open</Button>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
