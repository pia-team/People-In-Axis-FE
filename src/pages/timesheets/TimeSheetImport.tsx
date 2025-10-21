import React from 'react';
import { Box, Typography, Stack, Button, LinearProgress } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { timeSheetService } from '@/services/timesheetService';
import PageContainer from '@/components/ui/PageContainer';
import SectionCard from '@/components/ui/SectionCard';

const TimeSheetImport: React.FC = () => {
  const [file, setFile] = React.useState<File | null>(null);
  const [result, setResult] = React.useState<{
    totalRows: number;
    importedCount: number;
    failedCount: number;
    successRows: any[];
    failedRows: any[];
  } | null>(null);

  const downloadTemplateMutation = useMutation({
    mutationFn: timeSheetService.downloadImportTemplate,
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'timesheet-import-template.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    },
  });

  const importMutation = useMutation({
    mutationFn: (f: File) => timeSheetService.importExcel(f),
    onSuccess: (data) => setResult(data as any),
  });

  return (
    <PageContainer title="Timesheet Import">
      <SectionCard>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            onClick={() => downloadTemplateMutation.mutate()}
            disabled={downloadTemplateMutation.isPending}
          >
            Download Template
          </Button>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <Button
            variant="contained"
            onClick={() => file && importMutation.mutate(file)}
            disabled={!file || importMutation.isPending}
          >
            Upload
          </Button>
        </Stack>
        {(downloadTemplateMutation.isPending || importMutation.isPending) && <LinearProgress />}

        {result && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6">Result</Typography>
            <Typography>Total Rows: {result.totalRows}</Typography>
            <Typography>Imported: {result.importedCount}</Typography>
            <Typography>Failed: {result.failedCount}</Typography>
          </Box>
        )}
      </SectionCard>
    </PageContainer>
  );
};

export default TimeSheetImport;
