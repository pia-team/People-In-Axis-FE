import React from 'react';
import { Box, Typography, Paper, Stack, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { timeSheetService } from '@/services/timesheetService';
import { expenseService } from '@/services/expenseService';

const Reports: React.FC = () => {
  const navigate = useNavigate();

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportTimesheets = async () => {
    const blob = await timeSheetService.exportExcel({ page: 0, size: 1000 });
    triggerDownload(blob as unknown as Blob, 'timesheets.xlsx');
  };

  const exportExpenses = async () => {
    const blob = await expenseService.exportExcel({ page: 0, size: 1000 });
    triggerDownload(blob as unknown as Blob, 'expenses.xlsx');
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Reports
      </Typography>
      <Stack spacing={2} sx={{ mt: 2 }}>
        <Paper sx={{ p: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <Box flexGrow={1}>
              <Typography variant="h6">TimeSheet Report</Typography>
              <Typography variant="body2" color="text.secondary">Export timesheets or go to detailed report page.</Typography>
            </Box>
            <Button variant="outlined" onClick={() => navigate('/reports/timesheet')}>Open</Button>
            <Button variant="contained" onClick={exportTimesheets}>Export</Button>
          </Stack>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <Box flexGrow={1}>
              <Typography variant="h6">Expense Report</Typography>
              <Typography variant="body2" color="text.secondary">Export expenses or go to detailed report page.</Typography>
            </Box>
            <Button variant="outlined" onClick={() => navigate('/reports/expense')}>Open</Button>
            <Button variant="contained" onClick={exportExpenses}>Export</Button>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
};

export default Reports;