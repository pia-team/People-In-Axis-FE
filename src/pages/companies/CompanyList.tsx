import React from 'react';
import { Typography, Stack, TextField, Button } from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { companyService } from '@/services/companyService';
import { Company, PaginatedResponse } from '@/types';
import PageContainer from '@/components/ui/PageContainer';
import SectionCard from '@/components/ui/SectionCard';
import { standardDataGridSx } from '@/components/ui/dataGridStyles';
import EmptyState from '@/components/ui/EmptyState';

const CompanyList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = React.useState('');
  const [paginationModel, setPaginationModel] = React.useState<{ page: number; pageSize: number }>(
    { page: 0, pageSize: 10 }
  );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['companies', paginationModel.page, paginationModel.pageSize, search],
    queryFn: async () => companyService.getAll({ page: paginationModel.page, size: paginationModel.pageSize, search: search || undefined }),
    placeholderData: keepPreviousData,
  });

  const page = data as PaginatedResponse<Company> | undefined;
  const rows: Company[] = page?.content ?? [];
  const rowCount = page?.totalElements ?? 0;

  const columns = React.useMemo<GridColDef<Company>[]>(
    () => [
      { field: 'code', headerName: t('company.code'), width: 140 },
      { field: 'name', headerName: t('company.name'), flex: 1.2, minWidth: 180 },
      { field: 'taxNumber', headerName: t('company.taxNumber'), width: 140 },
      { field: 'email', headerName: t('employee.email'), flex: 1, minWidth: 200 },
      { field: 'phone', headerName: t('employee.phone'), width: 140 },
      { field: 'city', headerName: t('company.city'), width: 120 },
      { field: 'country', headerName: t('company.country'), width: 140 },
    ],
    [t]
  );

  const handlePaginationChange = (model: GridPaginationModel) => {
    setPaginationModel({ page: model.page, pageSize: model.pageSize });
  };

  const NoCompaniesOverlay = React.useCallback(() => (
    <EmptyState
      title={t('common.noData')}
      description={t('common.noResults')}
    />
  ), [t, refetch]);

  return (
    <PageContainer
      title={t('company.titlePlural')}
      actions={
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => refetch()}>{t('common.refresh')}</Button>
          <Button variant="contained" onClick={() => navigate('/companies/new')}>{t('common.add')}</Button>
        </Stack>
      }
    >
      <Stack spacing={2}>
        <SectionCard>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
            <TextField size="small" label={t('common.search')} value={search} onChange={(e) => setSearch(e.target.value)} sx={{ minWidth: { xs: '100%', sm: 260 } }} />
            <Button variant="contained" onClick={() => refetch()}>{t('common.search')}</Button>
          </Stack>
        </SectionCard>
        <SectionCard>
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
              onRowClick={(params) => navigate(`/companies/${params.id}`)}
              disableRowSelectionOnClick
              sx={standardDataGridSx}
              slots={{ noRowsOverlay: NoCompaniesOverlay }}
            />
          </div>
          {isError && (
            <Typography variant="body2" color="error" sx={{ mt: 2 }}>
              {t('error.loadFailed', { item: t('company.titlePlural').toLowerCase() })}
            </Typography>
          )}
        </SectionCard>
      </Stack>
    </PageContainer>
  );
};

export default CompanyList;
