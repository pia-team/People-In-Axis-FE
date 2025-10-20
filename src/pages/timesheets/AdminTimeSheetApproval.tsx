import React from 'react';
import { Box, Typography, Paper, Stack, Button } from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { useQuery, useMutation, keepPreviousData } from '@tanstack/react-query';
import { timeSheetService } from '@/services/timesheetService';
import { TimeSheet } from '@/types';
import { useNavigate } from 'react-router-dom';

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

  const columns = React.useMemo<GridColDef<TimeSheet>[]>(
    () => [
      { field: 'employeeName', headerName: 'Employee', flex: 1.2, minWidth: 160 },
      { field: 'projectName', headerName: 'Project', flex: 1.2, minWidth: 160 },
      { field: 'workDate', headerName: 'Date', width: 120 },
      { field: 'hoursWorked', headerName: 'Hours', width: 100 },
      { field: 'status', headerName: 'Status', width: 140 },
      { field: 'baseStatus', headerName: 'Base Status', width: 180 },
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
              onClick={() => {
                const reason = window.prompt('Reject reason?') || '';
                if (reason.trim()) adminRejectMutation.mutate({ id: params.row.id, reason });
              }}
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

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin TimeSheet Approval
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
            Failed to load admin pending timesheets.
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default AdminTimeSheetApproval;
