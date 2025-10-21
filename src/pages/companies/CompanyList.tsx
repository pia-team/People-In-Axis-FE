import React from 'react';
import { Typography, Stack, TextField, Button } from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { companyService } from '@/services/companyService';
import { Company, PaginatedResponse } from '@/types';
import PageContainer from '@/components/ui/PageContainer';
import SectionCard from '@/components/ui/SectionCard';
import { standardDataGridSx } from '@/components/ui/dataGridStyles';
import EmptyState from '@/components/ui/EmptyState';

const CompanyList: React.FC = () => {
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
      { field: 'code', headerName: 'Code', width: 140 },
      { field: 'name', headerName: 'Name', flex: 1.2, minWidth: 180 },
      { field: 'taxNumber', headerName: 'Tax No', width: 140 },
      { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
      { field: 'phone', headerName: 'Phone', width: 140 },
      { field: 'city', headerName: 'City', width: 120 },
      { field: 'country', headerName: 'Country', width: 140 },
    ],
    []
  );

  const handlePaginationChange = (model: GridPaginationModel) => {
    setPaginationModel({ page: model.page, pageSize: model.pageSize });
  };

  const NoCompaniesOverlay = React.useCallback(() => (
    <EmptyState
      title="No companies"
      description="There are no companies to display."
    />
  ), [refetch]);

  return (
    <PageContainer
      title="Companies"
      actions={
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => refetch()}>Refresh</Button>
          <Button variant="contained" onClick={() => navigate('/companies/new')}>New</Button>
        </Stack>
      }
    >
      <Stack spacing={2}>
        <SectionCard>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
            <TextField size="small" label="Search" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ minWidth: { xs: '100%', sm: 260 } }} />
            <Button variant="contained" onClick={() => refetch()}>Search</Button>
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
              Failed to load companies.
            </Typography>
          )}
        </SectionCard>
      </Stack>
    </PageContainer>
  );
};

export default CompanyList;