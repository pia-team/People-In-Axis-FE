import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const RoleManagement: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Role Management
      </Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="body1" color="text.secondary">
          This is the Role Management page. Implementation coming soon.
        </Typography>
      </Paper>
    </Box>
  );
};

export default RoleManagement;