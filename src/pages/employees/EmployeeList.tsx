import React from 'react';
import { Box, Typography, Paper, TextField, Button, Stack, MenuItem } from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { employeeService } from '@/services/employeeService';
import { Employee, PaginatedResponse } from '@/types';

const EmployeeList: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = React.useState('');
  const [companyId, setCompanyId] = React.useState<number | ''>('');
  const [departmentId, setDepartmentId] = React.useState<number | ''>('');
  const [status, setStatus] = React.useState<string>('');
  const [sortModel, setSortModel] = React.useState<GridSortModel>([]);
  const [paginationModel, setPaginationModel] = React.useState<{
    page: number;
    pageSize: number;
  }>({ page: 0, pageSize: 10 });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['employees', paginationModel.page, paginationModel.pageSize, search, companyId, departmentId, status, sortModel],
    queryFn: async () =>
      employeeService.getAll({
        page: paginationModel.page,
        size: paginationModel.pageSize,
        search: search || undefined,
        companyId: companyId === '' ? undefined : Number(companyId),
        departmentId: departmentId === '' ? undefined : Number(departmentId),
        status: status || undefined,
        sort: (() => {
          if (!sortModel.length) return undefined;
          const s = sortModel[0];
          const fieldMap: Record<string, string> = {
            employeeCode: 'employeeCode',
            fullName: 'lastName',
            email: 'email',
            status: 'status',
          };
          const field = fieldMap[s.field] || s.field;
          return `${field},${s.sort || 'asc'}`;
        })(),
      }),
    placeholderData: keepPreviousData,
  });

  const page = data as PaginatedResponse<Employee> | undefined;
  const rows: Employee[] = page?.content ?? [];
  const rowCount = page?.totalElements ?? 0;

  const columns = React.useMemo<GridColDef<Employee>[]>(
    () => [
      { field: 'employeeCode', headerName: 'Code', flex: 1, minWidth: 120 },
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

  const handleSortModelChange = (model: GridSortModel) => {
    setSortModel(model);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Employees
      </Typography>
      <Paper sx={{ p: 2, mt: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <TextField
            size="small"
            label="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <TextField
            size="small"
            label="Company ID"
            type="number"
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value === '' ? '' : Number(e.target.value))}
            sx={{ width: 140 }}
          />
          <TextField
            size="small"
            label="Department ID"
            type="number"
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value === '' ? '' : Number(e.target.value))}
            sx={{ width: 160 }}
          />
          <TextField
            size="small"
            label="Status"
            select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            sx={{ width: 160 }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="ACTIVE">ACTIVE</MenuItem>
            <MenuItem value="INACTIVE">INACTIVE</MenuItem>
            <MenuItem value="ON_LEAVE">ON_LEAVE</MenuItem>
            <MenuItem value="TERMINATED">TERMINATED</MenuItem>
          </TextField>
          <Button variant="contained" onClick={() => refetch()}>Search</Button>
          <Box flexGrow={1} />
          <Button variant="outlined" onClick={() => refetch()}>Refresh</Button>
          <Button variant="contained" onClick={() => navigate('/employees/new')}>New</Button>
        </Stack>
        <div style={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={(row) => row.id}
            loading={isLoading}
            paginationMode="server"
            sortingMode="server"
            rowCount={rowCount}
            pageSizeOptions={[5, 10, 25, 50]}
            paginationModel={{ page: paginationModel.page, pageSize: paginationModel.pageSize }}
            onPaginationModelChange={handlePaginationChange}
            sortModel={sortModel}
            onSortModelChange={handleSortModelChange}
            onRowClick={(params) => navigate(`/employees/${params.id}`)}
            disableRowSelectionOnClick
          />
        </div>
        {isError && (
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            Failed to load employees.
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default EmployeeList;