import React from 'react';
import { Box, Typography, Paper, Stack, Button } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { timeSheetService } from '@/services/timesheetService';

const TimeSheetForm: React.FC = () => {
  const [file, setFile] = React.useState<File | null>(null);
  const [result, setResult] = React.useState<string>('');

  const { mutateAsync: importExcel, isPending } = useMutation({
    mutationFn: async (f: File) => timeSheetService.importExcel(f),
  });

  const onUpload = async () => {
    setResult('');
    if (!file) return;
    try {
      const count = await importExcel(file);
      setResult(`Imported ${count} timesheet rows.`);
    } catch (e) {
      setResult('Import failed.');
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Import TimeSheets from Excel
      </Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Choose an .xlsx file to import timesheets. After a successful import, check the TimeSheets list.
          </Typography>
          <input type="file" accept=".xlsx,.xls" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <Stack direction="row" spacing={2}>
            <Button variant="contained" onClick={onUpload} disabled={!file || isPending}>Upload</Button>
            {result && <Typography>{result}</Typography>}
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};

export default TimeSheetForm;