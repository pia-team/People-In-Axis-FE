import React from 'react';
import { Box, Typography, Paper, Stack, TextField, Button } from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { companyService } from '@/services/companyService';
import { Company, PaginatedResponse } from '@/types';

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

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Companies
      </Typography>
      <Paper sx={{ p: 2, mt: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <TextField size="small" label="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Button variant="contained" onClick={() => refetch()}>Search</Button>
          <Box flexGrow={1} />
          <Button variant="outlined" onClick={() => refetch()}>Refresh</Button>
          <Button variant="contained" onClick={() => navigate('/companies/new')}>New</Button>
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
            onRowClick={(params) => navigate(`/companies/${params.id}`)}
            disableRowSelectionOnClick
          />
        </div>
        {isError && (
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            Failed to load companies.
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default CompanyList;