import React from 'react';
import { Box, Typography, Paper, Stack, Button } from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { useQuery, useMutation, keepPreviousData } from '@tanstack/react-query';
import { expenseService } from '@/services/expenseService';
import { Expense } from '@/types';

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
              onClick={() => {
                const reason = window.prompt('Reject reason?') || '';
                if (reason.trim()) rejectMutation.mutate({ id: params.row.id, reason });
              }}
              disabled={rejectMutation.isPending}
            >
              Reject
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                const ref = window.prompt('Reimbursement reference (optional)') || undefined;
                reimburseMutation.mutate({ id: params.row.id, reference: ref });
              }}
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

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Expense Approval
      </Typography>
      <Paper sx={{ p: 2, mt: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Button variant="outlined" onClick={() => refetch()}>Refresh</Button>
        </Stack>
        <div style={{ height: 600, width: '100%' }}>
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
          />
        </div>
        {isError && (
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            Failed to load pending expenses.
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default ExpenseApproval;