import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const ExpenseForm: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Expense Form
      </Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="body1" color="text.secondary">
          This is the Expense Form page. Implementation coming soon.
        </Typography>
      </Paper>
    </Box>
  );
};

export default ExpenseForm;