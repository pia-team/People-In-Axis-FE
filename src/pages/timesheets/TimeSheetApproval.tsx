import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const TimeSheetApproval: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        TimeSheet Approval
      </Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="body1" color="text.secondary">
          This is the TimeSheet Approval page. Implementation coming soon.
        </Typography>
      </Paper>
    </Box>
  );
};

export default TimeSheetApproval;