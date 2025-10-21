import React from 'react';
import { Typography, Stack, TextField, Button } from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { departmentService } from '@/services/departmentService';
import { Department, PaginatedResponse } from '@/types';
import PageContainer from '@/components/ui/PageContainer';
import SectionCard from '@/components/ui/SectionCard';
import { standardDataGridSx, NoRowsOverlay } from '@/components/ui/dataGridStyles';

const DepartmentList: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = React.useState('');
  const [companyId, setCompanyId] = React.useState<number | ''>('');
  const [paginationModel, setPaginationModel] = React.useState<{ page: number; pageSize: number }>({ page: 0, pageSize: 10 });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['departments', paginationModel.page, paginationModel.pageSize, search, companyId],
    queryFn: async () => departmentService.getAll({
      page: paginationModel.page,
      size: paginationModel.pageSize,
      search: search || undefined,
      companyId: companyId === '' ? undefined : Number(companyId),
    }),
    placeholderData: keepPreviousData,
  });

  const page = data as PaginatedResponse<Department> | undefined;
  const rows: Department[] = page?.content ?? [];
  const rowCount = page?.totalElements ?? 0;

  const columns = React.useMemo<GridColDef<Department>[]>(
    () => [
      { field: 'code', headerName: 'Code', width: 140 },
      { field: 'name', headerName: 'Name', flex: 1.2, minWidth: 180 },
      { field: 'companyName', headerName: 'Company', flex: 1, minWidth: 160 },
      { field: 'managerName', headerName: 'Manager', flex: 1, minWidth: 160 },
      { field: 'location', headerName: 'Location', width: 160 },
      { field: 'budget', headerName: 'Budget', width: 120 },
    ],
    []
  );

  const handlePaginationChange = (model: GridPaginationModel) => {
    setPaginationModel({ page: model.page, pageSize: model.pageSize });
  };

  return (
    <PageContainer
      title="Departments"
      actions={
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => refetch()}>Refresh</Button>
          <Button variant="contained" onClick={() => navigate('/departments/new')}>New</Button>
        </Stack>
      }
    >
      <Stack spacing={2}>
        <SectionCard>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
            <TextField size="small" label="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
            <TextField size="small" label="Company ID" type="number" value={companyId} onChange={(e) => setCompanyId(e.target.value === '' ? '' : Number(e.target.value))} sx={{ width: { xs: '100%', sm: 160 } }} />
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
              onRowClick={(params) => navigate(`/departments/${params.id}`)}
              disableRowSelectionOnClick
              sx={standardDataGridSx}
              slots={{ noRowsOverlay: NoRowsOverlay }}
            />
          </div>
          {isError && (
            <Typography variant="body2" color="error" sx={{ mt: 2 }}>
              Failed to load departments.
            </Typography>
          )}
        </SectionCard>
      </Stack>
    </PageContainer>
  );
};

export default DepartmentList;