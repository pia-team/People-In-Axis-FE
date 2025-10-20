import React from 'react';
import { Box, Typography, Paper, Stack, Divider, Button, TextField, Table, TableHead, TableRow, TableCell, TableBody, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { timeSheetService } from '@/services/timesheetService';
import type { TimeSheetRow } from '@/types';

const TimeSheetDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['timesheet', id],
    queryFn: async () => timeSheetService.getById(Number(id)),
    enabled: !!id,
  });

  const submitMutation = useMutation({
    mutationFn: () => timeSheetService.submit(Number(id)),
    onSuccess: () => refetch(),
  });

  const cancelMutation = useMutation({
    mutationFn: (reason: string) => timeSheetService.cancel(Number(id), reason),
    onSuccess: () => refetch(),
  });

  // Rows state
  const { data: rowsData, refetch: refetchRows } = useQuery({
    queryKey: ['timesheet', id, 'rows'],
    queryFn: async () => timeSheetService.getRows(Number(id), { page: 0, size: 100 }),
    enabled: !!id,
  });

  // History
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const { data: historyItems } = useQuery({
    queryKey: ['timesheet', id, 'history', historyOpen],
    queryFn: async () => timeSheetService.getHistory(Number(id)),
    enabled: !!id && historyOpen,
  });

  const createRowMutation = useMutation({
    mutationFn: (payload: Partial<TimeSheetRow>) => timeSheetService.createRow(Number(id), payload),
    onSuccess: () => refetchRows(),
  });

  const deleteRowMutation = useMutation({
    mutationFn: (rowId: number) => timeSheetService.deleteRow(Number(id), rowId),
    onSuccess: () => refetchRows(),
  });

  const assignRowMutation = useMutation({
    mutationFn: ({ rowId, assigneeEmployeeId }: { rowId: number; assigneeEmployeeId: number }) =>
      timeSheetService.assignRow(Number(id), rowId, assigneeEmployeeId),
    onSuccess: () => refetchRows(),
  });

  const approveRowMutation = useMutation({
    mutationFn: ({ rowId, comments }: { rowId: number; comments?: string }) =>
      timeSheetService.approveRow(Number(id), rowId, comments),
    onSuccess: () => refetchRows(),
  });

  const rejectRowMutation = useMutation({
    mutationFn: ({ rowId, reason }: { rowId: number; reason: string }) =>
      timeSheetService.rejectRow(Number(id), rowId, reason),
    onSuccess: () => refetchRows(),
  });

  // Quick add form
  const [newWorkDate, setNewWorkDate] = React.useState('');
  const [newHours, setNewHours] = React.useState('');
  const [newTask, setNewTask] = React.useState('');

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" component="h1" gutterBottom>
          TimeSheet Detail
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => navigate('/timesheets')}>Back</Button>
          <Button variant="text" onClick={() => setHistoryOpen(true)}>History</Button>
          <Button
            variant="contained"
            onClick={() => submitMutation.mutate()}
            disabled={
              !data || !['DRAFT', 'REVISION_REQUESTED'].includes(String(data.status)) || submitMutation.isPending
            }
          >
            Submit
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              const reason = window.prompt('Cancel reason?') || '';
              if (reason.trim()) cancelMutation.mutate(reason);
            }}
            disabled={!data || String(data.baseStatus) !== 'CREATED' || cancelMutation.isPending}
          >
            Cancel
          </Button>
        </Stack>
      </Stack>
      <Paper sx={{ p: 3, mt: 2 }}>
        {isLoading && (
          <Typography variant="body1">Loading...</Typography>
        )}
        {isError && (
          <Typography variant="body1" color="error">Failed to load timesheet.</Typography>
        )}
        {data && (
          <Stack spacing={1}>
            <Typography variant="h6">{data.employeeName} - {data.projectName}</Typography>
            <Divider sx={{ my: 1 }} />
            <Typography>Date: {data.workDate}</Typography>
            <Typography>Hours: {data.hoursWorked}</Typography>
            {data.overtimeHours !== undefined && (
              <Typography>Overtime: {data.overtimeHours}</Typography>
            )}
            <Typography>Status: {data.status || '-'}</Typography>
            <Typography>Base Status: {data.baseStatus || '-'}</Typography>
            <Typography>Billable: {data.billable ? 'Yes' : 'No'}</Typography>
            <Typography>Task: {data.taskDescription || '-'}</Typography>

            <Divider sx={{ my: 2 }} />
            <Typography variant="h6">Rows</Typography>

            {String(data.baseStatus) === 'CREATED' && (
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <TextField
                  size="small"
                  label="Work Date"
                  type="date"
                  value={newWorkDate}
                  onChange={(e) => setNewWorkDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  size="small"
                  label="Hours"
                  type="number"
                  value={newHours}
                  onChange={(e) => setNewHours(e.target.value)}
                />
                <TextField
                  size="small"
                  label="Task"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                />
                <Button
                  variant="contained"
                  onClick={() => {
                    const hours = Number(newHours);
                    if (!newWorkDate || !hours) return;
                    createRowMutation.mutate({ workDate: newWorkDate as any, hours, taskDescription: newTask });
                    setNewWorkDate(''); setNewHours(''); setNewTask('');
                  }}
                  disabled={createRowMutation.isPending}
                >
                  Add Row
                </Button>
              </Stack>
            )}

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Hours</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Assigned To</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(rowsData?.content ?? []).map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.id}</TableCell>
                    <TableCell>{r.workDate}</TableCell>
                    <TableCell>{r.hours}</TableCell>
                    <TableCell>{r.status}</TableCell>
                    <TableCell>{r.assignedToName || '-'}</TableCell>
                    <TableCell align="right">
                      {String(data.baseStatus) === 'CREATED' && (
                        <Button size="small" color="error" onClick={() => deleteRowMutation.mutate(r.id)}>Delete</Button>
                      )}
                      <Button size="small" onClick={() => {
                        const assignee = window.prompt('Assign to employeeId?');
                        const idNum = assignee ? Number(assignee) : NaN;
                        if (!isNaN(idNum)) assignRowMutation.mutate({ rowId: r.id, assigneeEmployeeId: idNum });
                      }}>Assign</Button>
                      <Button size="small" onClick={() => approveRowMutation.mutate({ rowId: r.id })}>Approve</Button>
                      <Button size="small" color="error" onClick={() => {
                        const reason = window.prompt('Reject reason?') || '';
                        if (reason.trim()) rejectRowMutation.mutate({ rowId: r.id, reason });
                      }}>Reject</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Stack>
        )}
      </Paper>

      <Dialog open={historyOpen} onClose={() => setHistoryOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>TimeSheet History</DialogTitle>
        <DialogContent>
          {!historyItems && (
            <Typography variant="body2" color="text.secondary">Loading...</Typography>
          )}
          {historyItems && (
            <List>
              {historyItems.map((h, idx) => (
                <ListItem key={idx} divider>
                  <ListItemText
                    primary={`${h.type} | ${h.createdAt} | ${h.oldStatus ?? '-'} → ${h.newStatus ?? '-'}`}
                    secondary={`Actor: ${h.actorEmployeeName ?? '-'} (${h.actorEmployeeId ?? '-'})${h.rowId ? ` | Row: ${h.rowId}` : ''}${h.reason ? ` | Reason: ${h.reason}` : ''}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default TimeSheetDetail;
