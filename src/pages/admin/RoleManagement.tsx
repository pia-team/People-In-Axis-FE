import React from 'react';
import { Box, Typography, Paper, Stack, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const RoleManagement: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Role Management
      </Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
        <Stack spacing={2}>
          <Typography>
            Roles and access are managed via Keycloak. Use the links below to navigate to common admin pages
            and review which routes in the app require which roles.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button variant="outlined" onClick={() => navigate('/employees')}>Open Employees</Button>
            <Button variant="outlined" onClick={() => navigate('/timesheets/approval')}>Timesheet Approvals</Button>
            <Button variant="outlined" onClick={() => navigate('/expenses/approval')}>Expense Approvals</Button>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Route guards in the app:
            - Team managers and HR can approve timesheets.
            - Team managers, HR, and Finance can approve expenses; Finance can reimburse.
            - HR and Admin can manage employees, companies, departments, and projects.
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
};

export default RoleManagement;