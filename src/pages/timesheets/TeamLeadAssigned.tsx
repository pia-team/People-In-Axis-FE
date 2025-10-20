import React from 'react';
import { Box, Typography, Paper, Stack, Button } from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { useQuery, useMutation, keepPreviousData } from '@tanstack/react-query';
import { timeSheetService } from '@/services/timesheetService';
import type { TimeSheetRow } from '@/types';

const TeamLeadAssigned: React.FC = () => {
  const [paginationModel, setPaginationModel] = React.useState<{ page: number; pageSize: number }>({ page: 0, pageSize: 10 });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['timesheets', 'teamlead-assigned-rows', paginationModel.page, paginationModel.pageSize],
    queryFn: async () => timeSheetService.getTeamLeadAssignedRows({ page: paginationModel.page, size: paginationModel.pageSize }),
    placeholderData: keepPreviousData,
  });

  const approveRowMutation = useMutation({
    mutationFn: ({ timesheetId, rowId }: { timesheetId: number; rowId: number }) =>
      timeSheetService.approveRow(timesheetId, rowId),
    onSuccess: () => refetch(),
  });

  const rejectRowMutation = useMutation({
    mutationFn: ({ timesheetId, rowId, reason }: { timesheetId: number; rowId: number; reason: string }) =>
      timeSheetService.rejectRow(timesheetId, rowId, reason),
    onSuccess: () => refetch(),
  });

  const rows: TimeSheetRow[] = data?.content ?? [];
  const rowCount = data?.totalElements ?? 0;

  const columns = React.useMemo<GridColDef<TimeSheetRow>[]>(
    () => [
      { field: 'id', headerName: 'Row ID', width: 100 },
      { field: 'timesheetId', headerName: 'Timesheet ID', width: 130 },
      { field: 'workDate', headerName: 'Date', width: 120 },
      { field: 'hours', headerName: 'Hours', width: 100 },
      { field: 'status', headerName: 'Status', width: 160 },
      { field: 'assignedToName', headerName: 'Assigned To', width: 180 },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 240,
        sortable: false,
        renderCell: (params) => (
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="contained"
              onClick={() => approveRowMutation.mutate({ timesheetId: params.row.timesheetId, rowId: params.row.id })}
              disabled={approveRowMutation.isPending}
            >
              Approve
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={() => {
                const reason = window.prompt('Reject reason?') || '';
                if (reason.trim()) rejectRowMutation.mutate({ timesheetId: params.row.timesheetId, rowId: params.row.id, reason });
              }}
              disabled={rejectRowMutation.isPending}
            >
              Reject
            </Button>
          </Stack>
        ),
      },
    ],
    [approveRowMutation.isPending, rejectRowMutation.isPending]
  );

  const handlePaginationChange = (model: GridPaginationModel) => {
    setPaginationModel({ page: model.page, pageSize: model.pageSize });
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        TeamLead Assigned Rows
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
            Failed to load assigned rows.
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default TeamLeadAssigned;
