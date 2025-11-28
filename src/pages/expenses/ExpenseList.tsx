import React from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { expenseService } from '@/services/expenseService';
import { Expense, PaginatedResponse } from '@/types';
import PageContainer from '@/components/ui/PageContainer';
import SectionCard from '@/components/ui/SectionCard';
import { standardDataGridSx } from '@/components/ui/dataGridStyles';
import EmptyState from '@/components/ui/EmptyState';
import { useTranslation } from 'react-i18next';

const ExpenseList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [paginationModel, setPaginationModel] = React.useState<{ page: number; pageSize: number }>(
    { page: 0, pageSize: 10 }
  );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['expenses', paginationModel.page, paginationModel.pageSize],
    queryFn: async () => expenseService.getAll({ page: paginationModel.page, size: paginationModel.pageSize }),
    placeholderData: keepPreviousData,
  });

  const page = data as PaginatedResponse<Expense> | undefined;
  const rows: Expense[] = page?.content ?? [];
  const rowCount = page?.totalElements ?? 0;

  const columns = React.useMemo<GridColDef<Expense>[]>(
    () => [
      { field: 'employeeName', headerName: 'Employee', flex: 1.2, minWidth: 160 },
      { field: 'expenseTypeName', headerName: 'Type', flex: 1, minWidth: 140 },
      { field: 'projectName', headerName: 'Project', flex: 1.2, minWidth: 160 },
      { field: 'expenseDate', headerName: 'Date', width: 120 },
      { field: 'amount', headerName: 'Amount', width: 120 },
      { field: 'currency', headerName: 'Currency', width: 100 },
      { field: 'status', headerName: 'Status', width: 120 },
    ],
    []
  );

  const handlePaginationChange = (model: GridPaginationModel) => {
    setPaginationModel({ page: model.page, pageSize: model.pageSize });
  };

  const NoExpensesOverlay = React.useCallback(() => (
    <EmptyState
      title={t('expense.noExpenses')}
      description={t('expense.noExpensesDescription')}
    />
  ), [refetch, t]);

  return (
    <PageContainer
      title={t('expense.expensesTitle')}
      actions={
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button variant="outlined" onClick={() => refetch()} sx={{ width: { xs: '100%', sm: 'auto' } }}>{t('timesheet.refresh')}</Button>
          <Button
            variant="outlined"
            onClick={async () => {
              const blob = await expenseService.exportExcel({ page: paginationModel.page, size: paginationModel.pageSize });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'expenses.xlsx';
              a.click();
              window.URL.revokeObjectURL(url);
            }}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            {t('common.export')}
          </Button>
          <Button variant="contained" onClick={() => navigate('/expenses/new')} sx={{ width: { xs: '100%', sm: 'auto' } }}>{t('timesheet.new')}</Button>
        </Stack>
      }
    >
      <Stack spacing={2}>
        <SectionCard>
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            <Button variant="outlined" onClick={() => fileInputRef.current?.click()}>{t('common.import')}</Button>
            <input
              type="file"
              accept=".xlsx,.xls"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                await expenseService.importExcel(file);
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
              onRowClick={(params) => navigate(`/expenses/${params.id}`)}
              disableRowSelectionOnClick
              sx={standardDataGridSx}
              slots={{ noRowsOverlay: NoExpensesOverlay }}
            />
          </Box>
          {isError && (
            <Typography variant="body2" color="error" sx={{ mt: 2 }}>
              {t('expense.failedToLoadExpenses')}
            </Typography>
          )}
        </SectionCard>
      </Stack>
    </PageContainer>
  );
};

export default ExpenseList;