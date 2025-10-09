import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const UserManagement: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        User Management
      </Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="body1" color="text.secondary">
          This is the User Management page. Implementation coming soon.
        </Typography>
      </Paper>
    </Box>
  );
};

export default UserManagement;