import React from 'react';
import { Box, Typography, Paper, Stack, Button, Divider, Alert, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { timeSheetService } from '@/services/timesheetService';
import { TimeSheetImportResult } from '@/types';

const TimeSheetForm: React.FC = () => {
  const [file, setFile] = React.useState<File | null>(null);
  const [result, setResult] = React.useState<string>('');
  const [importResult, setImportResult] = React.useState<TimeSheetImportResult | null>(null);

  const { mutateAsync: importExcel, isPending } = useMutation({
    mutationFn: async (f: File) => timeSheetService.importExcel(f),
  });

  const { mutateAsync: downloadTemplate, isPending: isTplPending } = useMutation({
    mutationFn: async () => timeSheetService.downloadImportTemplate(),
  });

  const onUpload = async () => {
    setResult('');
    setImportResult(null);
    if (!file) return;
    try {
      const res = await importExcel(file);
      setImportResult(res);
      setResult(`Imported ${res.importedCount} of ${res.totalRows}. Failed: ${res.failedCount}`);
    } catch (e) {
      setResult('Import failed.');
    }
  };

  const onDownloadTemplate = async () => {
    const blob = await downloadTemplate();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'timesheet-import-template.xlsx';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
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
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={onDownloadTemplate} disabled={isTplPending}>
              Download Template
            </Button>
          </Stack>
          <Typography variant="subtitle2">Template Guidelines</Typography>
          <Typography variant="body2" color="text.secondary">
            - EmployeeId (required): Sistemde var olan çalışan ID’si
          </Typography>
          <Typography variant="body2" color="text.secondary">
            - ProjectId (optional): İlgili proje ID’si (boş bırakılabilir)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            - WorkDate (required): Tarih formatı YYYY-MM-DD (örn. 2024-09-09)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            - HoursWorked (optional): 7.5 gibi ondalıklı değer kabul eder
          </Typography>
          <Typography variant="body2" color="text.secondary">
            - EmployeeName/ProjectName sütunları rehber amaçlıdır, import sırasında dikkate alınmaz
          </Typography>
          <input type="file" accept=".xlsx,.xls" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <Stack direction="row" spacing={2}>
            <Button variant="contained" onClick={onUpload} disabled={!file || isPending}>Upload</Button>
            {result && <Typography>{result}</Typography>}
          </Stack>

          {importResult && (
            <Box>
              <Divider sx={{ my: 2 }} />
              <Alert severity={importResult.failedCount > 0 ? 'warning' : 'success'}>
                Total: {importResult.totalRows} | Imported: {importResult.importedCount} | Failed: {importResult.failedCount}
              </Alert>

              {importResult.successRows?.length > 0 && (
                <Box mt={2}>
                  <Typography variant="subtitle1">Successful Rows ({importResult.successRows.length})</Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Row</TableCell>
                        <TableCell>EmployeeId</TableCell>
                        <TableCell>ProjectId</TableCell>
                        <TableCell>WorkDate</TableCell>
                        <TableCell>Hours</TableCell>
                        <TableCell>TimeSheetId</TableCell>
                        <TableCell>Message</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {importResult.successRows.map((r, idx) => (
                        <TableRow key={`s-${idx}`}>
                          <TableCell>{r.rowNumber}</TableCell>
                          <TableCell>{r.employeeId ?? ''}</TableCell>
                          <TableCell>{r.projectId ?? ''}</TableCell>
                          <TableCell>{r.workDate ?? ''}</TableCell>
                          <TableCell>{r.hoursWorked ?? ''}</TableCell>
                          <TableCell>{r.timeSheetId ?? ''}</TableCell>
                          <TableCell>{r.message ?? ''}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}

              {importResult.failedRows?.length > 0 && (
                <Box mt={2}>
                  <Typography variant="subtitle1">Failed Rows ({importResult.failedRows.length})</Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Row</TableCell>
                        <TableCell>EmployeeId</TableCell>
                        <TableCell>ProjectId</TableCell>
                        <TableCell>WorkDate</TableCell>
                        <TableCell>Hours</TableCell>
                        <TableCell>Message</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {importResult.failedRows.map((r, idx) => (
                        <TableRow key={`f-${idx}`}>
                          <TableCell>{r.rowNumber}</TableCell>
                          <TableCell>{r.employeeId ?? ''}</TableCell>
                          <TableCell>{r.projectId ?? ''}</TableCell>
                          <TableCell>{r.workDate ?? ''}</TableCell>
                          <TableCell>{r.hoursWorked ?? ''}</TableCell>
                          <TableCell>{r.message ?? ''}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </Box>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default TimeSheetForm;