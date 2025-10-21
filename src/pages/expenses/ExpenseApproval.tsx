import React from 'react';
import { Box, Typography, Stack, Button, TextField } from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { useQuery, useMutation, keepPreviousData } from '@tanstack/react-query';
import { expenseService } from '@/services/expenseService';
import { Expense } from '@/types';
import PageContainer from '@/components/ui/PageContainer';
import SectionCard from '@/components/ui/SectionCard';
import { standardDataGridSx } from '@/components/ui/dataGridStyles';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';

const ExpenseApproval: React.FC = () => {
  const [paginationModel, setPaginationModel] = React.useState<{ page: number; pageSize: number }>(
    { page: 0, pageSize: 10 }
  );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['expenses', 'pending', paginationModel.page, paginationModel.pageSize],
    queryFn: async () => expenseService.getPending({ page: paginationModel.page, size: paginationModel.pageSize }),
    placeholderData: keepPreviousData,
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, comments }: { id: number; comments?: string }) => expenseService.approve(id, comments),
    onSuccess: () => refetch(),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => expenseService.reject(id, reason),
    onSuccess: () => refetch(),
  });

  const reimburseMutation = useMutation({
    mutationFn: ({ id, reference }: { id: number; reference?: string }) => expenseService.reimburse(id, reference),
    onSuccess: () => refetch(),
  });

  const rows: Expense[] = data?.content ?? [];
  const rowCount = data?.totalElements ?? 0;

  const [rejectOpen, setRejectOpen] = React.useState(false);
  const [rejectId, setRejectId] = React.useState<number | null>(null);
  const [rejectReason, setRejectReason] = React.useState('');
  const [reimburseOpen, setReimburseOpen] = React.useState(false);
  const [reimburseId, setReimburseId] = React.useState<number | null>(null);
  const [reimburseRef, setReimburseRef] = React.useState('');

  const columns = React.useMemo<GridColDef<Expense>[]>(
    () => [
      { field: 'employeeName', headerName: 'Employee', flex: 1.2, minWidth: 160 },
      { field: 'expenseTypeName', headerName: 'Type', flex: 1, minWidth: 140 },
      { field: 'projectName', headerName: 'Project', flex: 1.2, minWidth: 160 },
      { field: 'expenseDate', headerName: 'Date', width: 120 },
      { field: 'amount', headerName: 'Amount', width: 120 },
      { field: 'currency', headerName: 'Currency', width: 100 },
      { field: 'status', headerName: 'Status', width: 140 },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 320,
        sortable: false,
        renderCell: (params) => (
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="contained"
              onClick={() => approveMutation.mutate({ id: params.row.id })}
              disabled={approveMutation.isPending}
            >
              Approve
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={() => { setRejectId(params.row.id); setRejectReason(''); setRejectOpen(true); }}
              disabled={rejectMutation.isPending}
            >
              Reject
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => { setReimburseId(params.row.id); setReimburseRef(''); setReimburseOpen(true); }}
              disabled={reimburseMutation.isPending}
            >
              Reimburse
            </Button>
          </Stack>
        ),
      },
    ],
    [approveMutation.isPending, rejectMutation.isPending, reimburseMutation.isPending]
  );

  const handlePaginationChange = (model: GridPaginationModel) => {
    setPaginationModel({ page: model.page, pageSize: model.pageSize });
  };

  const NoPendingOverlay = React.useCallback(() => (
    <EmptyState
      title="No pending expenses"
      description="There are no expenses awaiting your approval."
    />
  ), [refetch]);

  return (
    <PageContainer title="Expense Approval" actions={<Button variant="outlined" onClick={() => refetch()}>Refresh</Button>}>
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
            Failed to load pending expenses.
          </Typography>
        )}
      </SectionCard>
      <ConfirmDialog
        open={rejectOpen}
        title="Reject Expense"
        description="Please provide a reason for rejection."
        confirmLabel="Reject"
        confirmColor="error"
        loading={rejectMutation.isPending}
        confirmDisabled={rejectReason.trim().length === 0}
        onClose={() => setRejectOpen(false)}
        onConfirm={() => {
          if (rejectId && rejectReason.trim()) {
            rejectMutation.mutate({ id: rejectId, reason: rejectReason.trim() });
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
      <ConfirmDialog
        open={reimburseOpen}
        title="Reimburse Expense"
        description="You can optionally provide a reimbursement reference."
        confirmLabel="Reimburse"
        confirmColor="primary"
        loading={reimburseMutation.isPending}
        onClose={() => setReimburseOpen(false)}
        onConfirm={() => {
          if (reimburseId) {
            const ref = reimburseRef.trim();
            reimburseMutation.mutate({ id: reimburseId, reference: ref === '' ? undefined : ref });
            setReimburseOpen(false);
          }
        }}
      >
        <TextField
          autoFocus
          fullWidth
          label="Reference (optional)"
          value={reimburseRef}
          onChange={(e) => setReimburseRef(e.target.value)}
        />
      </ConfirmDialog>
    </PageContainer>
  );
};

export default ExpenseApproval;