import React from 'react';
import { Typography, Stack, Divider, Button, TextField, Table, TableHead, TableRow, TableCell, TableBody, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { timeSheetService } from '@/services/timesheetService';
import type { TimeSheetRow } from '@/types';
import { useKeycloak } from '@/hooks/useKeycloak';
import PageContainer from '@/components/ui/PageContainer';
import SectionCard from '@/components/ui/SectionCard';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

const TimeSheetDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useKeycloak();
  const formatBaseStatus = (s?: string) => (s === 'COMPLETED' ? 'Closed' : s || '-');

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

  const companyRejectMutation = useMutation({
    mutationFn: (note: string) => timeSheetService.companyAction(Number(id), 'reject', note),
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

  const cloneMutation = useMutation({
    mutationFn: () => timeSheetService.cloneTimesheet(Number(id)),
    onSuccess: (newTs) => navigate(`/timesheets/${newTs.id}`),
  });

  // Quick add form
  const [newWorkDate, setNewWorkDate] = React.useState('');
  const [newHours, setNewHours] = React.useState('');
  const [newTask, setNewTask] = React.useState('');

  // Dialog states
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState('');
  const [companyRejectOpen, setCompanyRejectOpen] = React.useState(false);
  const [companyRejectNote, setCompanyRejectNote] = React.useState('');
  const [assignOpen, setAssignOpen] = React.useState(false);
  const [assignRowId, setAssignRowId] = React.useState<number | null>(null);
  const [assignEmployeeId, setAssignEmployeeId] = React.useState('');
  const [rowRejectOpen, setRowRejectOpen] = React.useState(false);
  const [rowRejectRowId, setRowRejectRowId] = React.useState<number | null>(null);
  const [rowRejectReason, setRowRejectReason] = React.useState('');

  return (
    <PageContainer
      title="TimeSheet Detail"
      actions={
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => navigate('/timesheets')}>Back</Button>
          <Button variant="text" onClick={() => setHistoryOpen(true)}>History</Button>
          <Button
            variant="contained"
            onClick={() => submitMutation.mutate()}
            disabled={!data || !['DRAFT', 'REVISION_REQUESTED'].includes(String(data?.status)) || submitMutation.isPending}
          >
            Submit
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => { setCancelReason(''); setCancelOpen(true); }}
            disabled={!data || String(data?.baseStatus) !== 'CREATED' || cancelMutation.isPending}
          >
            Cancel
          </Button>
          {hasRole('COMPANY_MANAGER') && data && String(data.baseStatus) === 'CREATED' && (
            <Button
              variant="outlined"
              color="error"
              onClick={() => { setCompanyRejectNote(''); setCompanyRejectOpen(true); }}
              disabled={companyRejectMutation.isPending}
            >
              Company Reject
            </Button>
          )}
          {data && String(data.baseStatus) === 'ADMIN_REJECTED' && (
            <Button
              variant="outlined"
              onClick={() => cloneMutation.mutate()}
              disabled={cloneMutation.isPending}
            >
              Clone
            </Button>
          )}
        </Stack>
      }
    >
      <SectionCard>
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
            <Typography>Base Status: {formatBaseStatus(String(data.baseStatus))}</Typography>
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
                      <Button
                        size="small"
                        onClick={() => { setAssignRowId(r.id); setAssignEmployeeId(''); setAssignOpen(true); }}
                        disabled={
                          String(data.baseStatus) !== 'CREATED' ||
                          assignRowMutation.isPending ||
                          !!r.assignedToEmployeeId
                        }
                      >
                        Assign
                      </Button>
                      <Button
                        size="small"
                        onClick={() => approveRowMutation.mutate({ rowId: r.id })}
                        disabled={
                          String(data.baseStatus) !== 'CREATED' ||
                          approveRowMutation.isPending ||
                          ['TEAM_LEAD_APPROVE', 'TEAM_LEAD_REJECT', 'COMPLETED', 'ADMIN_REJECTED'].includes(String(r.status))
                        }
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => { setRowRejectRowId(r.id); setRowRejectReason(''); setRowRejectOpen(true); }}
                        disabled={
                          String(data.baseStatus) !== 'CREATED' ||
                          rejectRowMutation.isPending ||
                          ['TEAM_LEAD_APPROVE', 'TEAM_LEAD_REJECT', 'COMPLETED', 'ADMIN_REJECTED'].includes(String(r.status))
                        }
                      >
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Stack>
        )}
      </SectionCard>

      <ConfirmDialog
        open={cancelOpen}
        title="Cancel Timesheet"
        description="Please provide a reason for cancellation."
        confirmLabel="Cancel"
        confirmColor="error"
        loading={cancelMutation.isPending}
        confirmDisabled={cancelReason.trim().length === 0}
        onClose={() => setCancelOpen(false)}
        onConfirm={() => {
          if (cancelReason.trim()) {
            cancelMutation.mutate(cancelReason.trim());
            setCancelOpen(false);
          }
        }}
      >
        <TextField
          autoFocus
          fullWidth
          label="Reason"
          multiline
          minRows={2}
          value={cancelReason}
          error={cancelReason.trim().length === 0}
          helperText={cancelReason.trim().length === 0 ? 'Reason is required' : ''}
          onChange={(e) => setCancelReason(e.target.value)}
        />
      </ConfirmDialog>

      <ConfirmDialog
        open={companyRejectOpen}
        title="Company Reject"
        description="Optionally provide a company reject note."
        confirmLabel="Reject"
        confirmColor="error"
        loading={companyRejectMutation.isPending}
        onClose={() => setCompanyRejectOpen(false)}
        onConfirm={() => {
          companyRejectMutation.mutate(companyRejectNote.trim());
          setCompanyRejectOpen(false);
        }}
      >
        <TextField
          autoFocus
          fullWidth
          label="Note (optional)"
          multiline
          minRows={2}
          value={companyRejectNote}
          onChange={(e) => setCompanyRejectNote(e.target.value)}
        />
      </ConfirmDialog>

      <ConfirmDialog
        open={assignOpen}
        title="Assign Row"
        description="Provide an employee ID to assign."
        confirmLabel="Assign"
        confirmColor="primary"
        loading={assignRowMutation.isPending}
        confirmDisabled={assignEmployeeId.trim() === '' || Number.isNaN(Number(assignEmployeeId))}
        onClose={() => setAssignOpen(false)}
        onConfirm={() => {
          const idNum = Number(assignEmployeeId);
          if (assignRowId && !isNaN(idNum)) {
            assignRowMutation.mutate({ rowId: assignRowId, assigneeEmployeeId: idNum });
            setAssignOpen(false);
          }
        }}
      >
        <TextField
          autoFocus
          fullWidth
          type="number"
          label="Employee ID"
          value={assignEmployeeId}
          error={assignEmployeeId.trim() === '' || Number.isNaN(Number(assignEmployeeId))}
          helperText={(assignEmployeeId.trim() === '' || Number.isNaN(Number(assignEmployeeId))) ? 'Valid employee ID is required' : ''}
          onChange={(e) => setAssignEmployeeId(e.target.value)}
        />
      </ConfirmDialog>

      <ConfirmDialog
        open={rowRejectOpen}
        title="Reject Row"
        description="Please provide a reason for rejection."
        confirmLabel="Reject"
        confirmColor="error"
        loading={rejectRowMutation.isPending}
        confirmDisabled={rowRejectReason.trim().length === 0}
        onClose={() => setRowRejectOpen(false)}
        onConfirm={() => {
          if (rowRejectRowId && rowRejectReason.trim()) {
            rejectRowMutation.mutate({ rowId: rowRejectRowId, reason: rowRejectReason.trim() });
            setRowRejectOpen(false);
          }
        }}
      >
        <TextField
          autoFocus
          fullWidth
          label="Reason"
          multiline
          minRows={2}
          value={rowRejectReason}
          error={rowRejectReason.trim().length === 0}
          helperText={rowRejectReason.trim().length === 0 ? 'Reason is required' : ''}
          onChange={(e) => setRowRejectReason(e.target.value)}
        />
      </ConfirmDialog>

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
    </PageContainer>
  );
};

export default TimeSheetDetail;
