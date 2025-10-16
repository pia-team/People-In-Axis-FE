import React from 'react';
import { Box, Typography, Paper, Stack, TextField, Button } from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { projectService } from '@/services/projectService';
import { Project, PaginatedResponse } from '@/types';

const ProjectList: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = React.useState('');
  const [companyId, setCompanyId] = React.useState<number | ''>('');
  const [paginationModel, setPaginationModel] = React.useState<{ page: number; pageSize: number }>({ page: 0, pageSize: 10 });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['projects', paginationModel.page, paginationModel.pageSize, search, companyId],
    queryFn: async () => projectService.getAll({
      page: paginationModel.page,
      size: paginationModel.pageSize,
      search: search || undefined,
      companyId: companyId === '' ? undefined : Number(companyId),
    }),
    placeholderData: keepPreviousData,
  });

  const page = data as PaginatedResponse<Project> | undefined;
  const rows: Project[] = page?.content ?? [];
  const rowCount = page?.totalElements ?? 0;

  const columns = React.useMemo<GridColDef<Project>[]>(
    () => [
      { field: 'code', headerName: 'Code', width: 140 },
      { field: 'name', headerName: 'Name', flex: 1.2, minWidth: 180 },
      { field: 'companyName', headerName: 'Company', flex: 1, minWidth: 160 },
      { field: 'projectManagerName', headerName: 'Manager', flex: 1, minWidth: 160 },
      { field: 'status', headerName: 'Status', width: 140 },
      { field: 'startDate', headerName: 'Start', width: 120 },
      { field: 'deadline', headerName: 'Deadline', width: 120 },
    ],
    []
  );

  const handlePaginationChange = (model: GridPaginationModel) => {
    setPaginationModel({ page: model.page, pageSize: model.pageSize });
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Projects
      </Typography>
      <Paper sx={{ p: 2, mt: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <TextField size="small" label="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
          <TextField size="small" label="Company ID" type="number" value={companyId} onChange={(e) => setCompanyId(e.target.value === '' ? '' : Number(e.target.value))} sx={{ width: 140 }} />
          <Button variant="contained" onClick={() => refetch()}>Search</Button>
          <Box flexGrow={1} />
          <Button variant="outlined" onClick={() => refetch()}>Refresh</Button>
          <Button variant="contained" onClick={() => navigate('/projects/new')}>New</Button>
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
            onRowClick={(params) => navigate(`/projects/${params.id}`)}
            disableRowSelectionOnClick
          />
        </div>
        {isError && (
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            Failed to load projects.
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default ProjectList;