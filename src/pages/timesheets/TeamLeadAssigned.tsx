import React from 'react';
import { Box, Typography, Stack, Button, TextField } from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { useQuery, useMutation, keepPreviousData } from '@tanstack/react-query';
import { timeSheetService } from '@/services/timesheetService';
import type { TimeSheetRow } from '@/types';
import PageContainer from '@/components/ui/PageContainer';
import SectionCard from '@/components/ui/SectionCard';
import { standardDataGridSx } from '@/components/ui/dataGridStyles';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';

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

  const [rejectOpen, setRejectOpen] = React.useState(false);
  const [rejectRowId, setRejectRowId] = React.useState<number | null>(null);
  const [rejectReason, setRejectReason] = React.useState('');

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
              disabled={
                approveRowMutation.isPending ||
                ['TEAM_LEAD_APPROVE', 'TEAM_LEAD_REJECT', 'COMPLETED', 'ADMIN_REJECTED'].includes(String(params.row.status)) ||
                !params.row.assignedToEmployeeId
              }
            >
              Approve
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={() => { setRejectRowId(params.row.id); setRejectReason(''); setRejectOpen(true); }}
              disabled={
                rejectRowMutation.isPending ||
                ['TEAM_LEAD_APPROVE', 'TEAM_LEAD_REJECT', 'COMPLETED', 'ADMIN_REJECTED'].includes(String(params.row.status)) ||
                !params.row.assignedToEmployeeId
              }
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

  const NoAssignedOverlay = React.useCallback(() => (
    <EmptyState
      title="No assigned rows"
      description="There are no timesheet rows assigned to you."
    />
  ), [refetch]);

  return (
    <PageContainer title="TeamLead Assigned Rows" actions={<Button variant="outlined" onClick={() => refetch()}>Refresh</Button>}>
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
            slots={{ noRowsOverlay: NoAssignedOverlay }}
          />
        </Box>
        {isError && (
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            Failed to load assigned rows.
          </Typography>
        )}
      </SectionCard>
      <ConfirmDialog
        open={rejectOpen}
        title="Reject Row"
        description="Please provide a reason for rejection."
        confirmLabel="Reject"
        confirmColor="error"
        loading={rejectRowMutation.isPending}
        confirmDisabled={rejectReason.trim().length === 0}
        onClose={() => setRejectOpen(false)}
        onConfirm={() => {
          if (rejectRowId && rejectReason.trim()) {
            // timesheetId is available in rows list; use the selected row from rows state
            const tsId = rows.find(r => r.id === rejectRowId)?.timesheetId;
            if (tsId) {
              rejectRowMutation.mutate({ timesheetId: tsId, rowId: rejectRowId, reason: rejectReason.trim() });
              setRejectOpen(false);
            }
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

export default TeamLeadAssigned;
