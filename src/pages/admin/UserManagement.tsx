import React from 'react';
import { Box, Typography, Paper, Stack, TextField, Button } from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { employeeService } from '@/services/employeeService';
import { Employee, PaginatedResponse } from '@/types';

const UserManagement: React.FC = () => {
  const [search, setSearch] = React.useState('');
  const [paginationModel, setPaginationModel] = React.useState<{ page: number; pageSize: number }>({ page: 0, pageSize: 10 });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['users', paginationModel.page, paginationModel.pageSize, search],
    queryFn: async () => employeeService.getAll({ page: paginationModel.page, size: paginationModel.pageSize, search: search || undefined }),
    placeholderData: keepPreviousData,
  });

  const page = data as PaginatedResponse<Employee> | undefined;
  const rows: Employee[] = page?.content ?? [];
  const rowCount = page?.totalElements ?? 0;

  const columns = React.useMemo<GridColDef<Employee>[]>(
    () => [
      { field: 'employeeCode', headerName: 'Code', width: 120 },
      { field: 'fullName', headerName: 'Name', flex: 1.2, minWidth: 160,
        valueGetter: (params) => params.row.fullName || `${params.row.firstName ?? ''} ${params.row.lastName ?? ''}`.trim(),
      },
      { field: 'email', headerName: 'Email', flex: 1.3, minWidth: 200 },
      { field: 'companyName', headerName: 'Company', flex: 1, minWidth: 140 },
      { field: 'departmentName', headerName: 'Department', flex: 1, minWidth: 140 },
      { field: 'status', headerName: 'Status', width: 120 },
    ],
    []
  );

  const handlePaginationChange = (model: GridPaginationModel) => {
    setPaginationModel({ page: model.page, pageSize: model.pageSize });
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        User Management
      </Typography>
      <Paper sx={{ p: 2, mt: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <TextField size="small" label="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Button variant="contained" onClick={() => refetch()}>Search</Button>
          <Box flexGrow={1} />
          <Button variant="outlined" onClick={() => refetch()}>Refresh</Button>
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
          />
        </div>
        {isError && (
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            Failed to load users.
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default UserManagement;