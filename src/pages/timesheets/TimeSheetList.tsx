import React from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { timeSheetService } from '@/services/timesheetService';
import { TimeSheet, PaginatedResponse } from '@/types';
import PageContainer from '@/components/ui/PageContainer';
import SectionCard from '@/components/ui/SectionCard';
import { standardDataGridSx } from '@/components/ui/dataGridStyles';
import EmptyState from '@/components/ui/EmptyState';

const TimeSheetList: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [paginationModel, setPaginationModel] = React.useState<{ page: number; pageSize: number }>(
    { page: 0, pageSize: 10 }
  );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['timesheets', paginationModel.page, paginationModel.pageSize],
    queryFn: async () => timeSheetService.getAll({ page: paginationModel.page, size: paginationModel.pageSize }),
    placeholderData: keepPreviousData,
  });

  const page = data as PaginatedResponse<TimeSheet> | undefined;
  const rows: TimeSheet[] = page?.content ?? [];
  const rowCount = page?.totalElements ?? 0;

  const columns = React.useMemo<GridColDef<TimeSheet>[]>(
    () => [
      { field: 'employeeName', headerName: 'Employee', flex: 1.2, minWidth: 160 },
      { field: 'projectName', headerName: 'Project', flex: 1.2, minWidth: 160 },
      { field: 'workDate', headerName: 'Date', width: 120 },
      { field: 'hoursWorked', headerName: 'Hours', width: 100 },
      { field: 'status', headerName: 'Status', width: 120 },
    ],
    []
  );

  const handlePaginationChange = (model: GridPaginationModel) => {
    setPaginationModel({ page: model.page, pageSize: model.pageSize });
  };

  const NoTimeSheetsOverlay = React.useCallback(() => (
    <EmptyState
      title="No timesheets"
      description="There are no timesheets to display."
    />
  ), [refetch]);

  return (
    <PageContainer
      title="TimeSheets"
      actions={
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => refetch()}>Refresh</Button>
          <Button
            variant="outlined"
            onClick={async () => {
              const blob = await timeSheetService.exportExcel({ page: paginationModel.page, size: paginationModel.pageSize });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'timesheets.xlsx';
              a.click();
              window.URL.revokeObjectURL(url);
            }}
          >
            Export
          </Button>
          <Button variant="contained" onClick={() => navigate('/timesheets/new')}>New</Button>
        </Stack>
      }
    >
      <Stack spacing={2}>
        <SectionCard>
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            <Button variant="outlined" onClick={() => fileInputRef.current?.click()}>Import</Button>
            <input
              type="file"
              accept=".xlsx,.xls"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                await timeSheetService.importExcel(file);
                e.currentTarget.value = '';
                refetch();
              }}
            />
          </Stack>
        </SectionCard>

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
              onRowClick={(params) => navigate(`/timesheets/${params.id}`)}
              disableRowSelectionOnClick
              sx={standardDataGridSx}
              slots={{ noRowsOverlay: NoTimeSheetsOverlay }}
            />
          </Box>
        </SectionCard>
        {isError && (
          <Typography variant="body2" color="error" sx={{ mt: -1 }}>
            Failed to load timesheets.
          </Typography>
        )}
      </Stack>
    </PageContainer>
  );
};

export default TimeSheetList;