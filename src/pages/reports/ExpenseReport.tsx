import React from 'react';
import { Typography, Stack, Button } from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { expenseService } from '@/services/expenseService';
import { Expense, PaginatedResponse } from '@/types';
import PageContainer from '@/components/ui/PageContainer';
import SectionCard from '@/components/ui/SectionCard';
import { standardDataGridSx, NoRowsOverlay } from '@/components/ui/dataGridStyles';

const ExpenseReport: React.FC = () => {
  const [paginationModel, setPaginationModel] = React.useState<{ page: number; pageSize: number }>(
    { page: 0, pageSize: 10 }
  );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['expenses', 'report', paginationModel.page, paginationModel.pageSize],
    queryFn: async () => expenseService.getAll({ page: paginationModel.page, size: paginationModel.pageSize }),
    placeholderData: keepPreviousData,
  });

  const page = data as PaginatedResponse<Expense> | undefined;
  const rows: Expense[] = page?.content ?? [];
  const rowCount = page?.totalElements ?? 0;

  const columns = React.useMemo<GridColDef<Expense>[]>(
    () => [
      { field: 'employeeName', headerName: 'Employee', flex: 1, minWidth: 160 },
      { field: 'expenseTypeName', headerName: 'Type', flex: 1, minWidth: 140 },
      { field: 'projectName', headerName: 'Project', flex: 1.2, minWidth: 180 },
      { field: 'expenseDate', headerName: 'Date', width: 120 },
      { field: 'amount', headerName: 'Amount', width: 120 },
      { field: 'currency', headerName: 'Currency', width: 100 },
      { field: 'status', headerName: 'Status', width: 140 },
    ],
    []
  );

  const handlePaginationChange = (model: GridPaginationModel) => {
    setPaginationModel({ page: model.page, pageSize: model.pageSize });
  };

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportExcel = async () => {
    const blob = await expenseService.exportExcel({ page: 0, size: 1000 });
    triggerDownload(blob as unknown as Blob, 'expenses.xlsx');
  };

  return (
    <PageContainer title="Expense Report" actions={<Button variant="outlined" onClick={() => refetch()}>Refresh</Button>}>
      <SectionCard>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Button variant="contained" onClick={exportExcel}>Export</Button>
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
            sx={standardDataGridSx}
            slots={{ noRowsOverlay: NoRowsOverlay }}
          />
        </div>
        {isError && (
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            Failed to load expenses.
          </Typography>
        )}
      </SectionCard>
    </PageContainer>
  );
};

export default ExpenseReport;