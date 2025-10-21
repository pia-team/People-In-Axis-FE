import React from 'react';
import { Box, Typography, Stack, Button, TextField } from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { useQuery, useMutation, keepPreviousData } from '@tanstack/react-query';
import { timeSheetService } from '@/services/timesheetService';
import { TimeSheet } from '@/types';
import { useNavigate } from 'react-router-dom';
import PageContainer from '@/components/ui/PageContainer';
import SectionCard from '@/components/ui/SectionCard';
import { standardDataGridSx } from '@/components/ui/dataGridStyles';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';

const AdminTimeSheetApproval: React.FC = () => {
  const [paginationModel, setPaginationModel] = React.useState<{ page: number; pageSize: number }>(
    { page: 0, pageSize: 10 }
  );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['timesheets', 'admin-pending', paginationModel.page, paginationModel.pageSize],
    queryFn: async () => timeSheetService.getAdminPending({ page: paginationModel.page, size: paginationModel.pageSize }),
    placeholderData: keepPreviousData,
  });

  const adminApproveMutation = useMutation({
    mutationFn: ({ id }: { id: number }) => timeSheetService.adminApprove(id),
    onSuccess: () => refetch(),
  });

  const adminRejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => timeSheetService.adminReject(id, reason),
    onSuccess: () => refetch(),
  });

  const navigate = useNavigate();

  const rows: TimeSheet[] = data?.content ?? [];
  const rowCount = data?.totalElements ?? 0;

  const [rejectOpen, setRejectOpen] = React.useState(false);
  const [rejectId, setRejectId] = React.useState<number | null>(null);
  const [rejectReason, setRejectReason] = React.useState('');

  const columns = React.useMemo<GridColDef<TimeSheet>[]>(
    () => [
      { field: 'employeeName', headerName: 'Employee', flex: 1.2, minWidth: 160 },
      { field: 'projectName', headerName: 'Project', flex: 1.2, minWidth: 160 },
      { field: 'workDate', headerName: 'Date', width: 120 },
      { field: 'hoursWorked', headerName: 'Hours', width: 100 },
      { field: 'status', headerName: 'Status', width: 140 },
      { field: 'baseStatus', headerName: 'Base Status', width: 180, valueFormatter: ({ value }) => (value === 'COMPLETED' ? 'Closed' : value) },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 260,
        sortable: false,
        renderCell: (params) => (
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="text"
              onClick={() => navigate(`/timesheets/${params.row.id}`)}
            >
              Details
            </Button>
            <Button
              size="small"
              variant="contained"
              color="success"
              onClick={() => adminApproveMutation.mutate({ id: params.row.id })}
              disabled={adminApproveMutation.isPending}
            >
              Approve
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={() => { setRejectId(params.row.id); setRejectReason(''); setRejectOpen(true); }}
              disabled={adminRejectMutation.isPending}
            >
              Reject
            </Button>
          </Stack>
        ),
      },
    ],
    [adminApproveMutation.isPending, adminRejectMutation.isPending]
  );

  const handlePaginationChange = (model: GridPaginationModel) => {
    setPaginationModel({ page: model.page, pageSize: model.pageSize });
  };

  const NoPendingOverlay = React.useCallback(() => (
    <EmptyState
      title="No admin pending timesheets"
      description="There are no timesheets awaiting admin approval."
    />
  ), [refetch]);

  return (
    <PageContainer title="Admin TimeSheet Approval" actions={<Button variant="outlined" onClick={() => refetch()}>Refresh</Button>}>
      <SectionCard>
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={(row) => row.id}
            loading={isLoading}
            paginationMode="server"
            rowCount={rowCount}
            pageSizeOptions={[5, 10, 25, 50]}
            paginationModel={{ page: paginationModel.page, pageSize: paginationModel.pageSize }}
            onPaginationModelChange={handlePaginationChange}
            disableRowSelectionOnClick
            sx={standardDataGridSx}
            slots={{ noRowsOverlay: NoPendingOverlay }}
          />
        </Box>
        {isError && (
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            Failed to load admin pending timesheets.
          </Typography>
        )}
      </SectionCard>
      <ConfirmDialog
        open={rejectOpen}
        title="Admin Reject Timesheet"
        description="Please provide a reason for admin rejection."
        confirmLabel="Reject"
        confirmColor="error"
        loading={adminRejectMutation.isPending}
        confirmDisabled={rejectReason.trim().length === 0}
        onClose={() => setRejectOpen(false)}
        onConfirm={() => {
          if (rejectId && rejectReason.trim()) {
            adminRejectMutation.mutate({ id: rejectId, reason: rejectReason.trim() });
            setRejectOpen(false);
          }
        }}
      >
        <TextField
          autoFocus
          fullWidth
          label="Reason"
          multiline
          minRows={2}
          value={rejectReason}
          error={rejectReason.trim().length === 0}
          helperText={rejectReason.trim().length === 0 ? 'Reason is required' : ''}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </ConfirmDialog>
    </PageContainer>
  );
};

export default AdminTimeSheetApproval;
