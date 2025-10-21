import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { expenseService } from '@/services/expenseService';
import { Expense, PaginatedResponse } from '@/types';
import PageContainer from '@/components/ui/PageContainer';
import SectionCard from '@/components/ui/SectionCard';
import { standardDataGridSx, NoRowsOverlay } from '@/components/ui/dataGridStyles';

const MyExpenses: React.FC = () => {
  const [paginationModel, setPaginationModel] = React.useState<{ page: number; pageSize: number }>(
    { page: 0, pageSize: 10 }
  );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['expenses', 'my', paginationModel.page, paginationModel.pageSize],
    queryFn: async () => expenseService.getMy({ page: paginationModel.page, size: paginationModel.pageSize }),
    placeholderData: keepPreviousData,
  });

  const page = data as PaginatedResponse<Expense> | undefined;
  const rows: Expense[] = page?.content ?? [];
  const rowCount = page?.totalElements ?? 0;

  const columns = React.useMemo<GridColDef<Expense>[]>(
    () => [
      { field: 'expenseTypeName', headerName: 'Type', flex: 1, minWidth: 140 },
      { field: 'projectName', headerName: 'Project', flex: 1.2, minWidth: 160 },
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

  return (
    <PageContainer title="My Expenses" actions={<Button variant="outlined" onClick={() => refetch()}>Refresh</Button>}>
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
            slots={{ noRowsOverlay: NoRowsOverlay }}
          />
        </Box>
        {isError && (
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            Failed to load your expenses.
          </Typography>
        )}
      </SectionCard>
    </PageContainer>
  );
};

export default MyExpenses;