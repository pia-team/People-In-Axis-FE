import React from 'react';
import { Box, TextField, Button, Stack, MenuItem, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { employeeService } from '@/services/employeeService';
import { Employee, PaginatedResponse } from '@/types';
import PageContainer from '@/components/ui/PageContainer';
import SectionCard from '@/components/ui/SectionCard';

const EmployeeList: React.FC = () => {
  const { t } = useTranslation();
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
      { field: 'employeeCode', headerName: t('employee.employeeCode'), flex: 1, minWidth: 120 },
      { field: 'fullName', headerName: t('employee.fullName'), flex: 1.2, minWidth: 160,
        valueGetter: (params) => params.row.fullName || `${params.row.firstName ?? ''} ${params.row.lastName ?? ''}`.trim(),
      },
      { field: 'email', headerName: t('employee.email'), flex: 1.3, minWidth: 200 },
      { field: 'companyName', headerName: t('employee.company'), flex: 1, minWidth: 140 },
      { field: 'departmentName', headerName: t('employee.department'), flex: 1, minWidth: 140 },
      { field: 'status', headerName: t('common.status'), width: 120 },
    ],
    [t]
  );

  const handlePaginationChange = (model: GridPaginationModel) => {
    setPaginationModel({ page: model.page, pageSize: model.pageSize });
  };

  const handleSortModelChange = (model: GridSortModel) => {
    setSortModel(model);
  };

  return (
    <PageContainer
      title={t('employee.titlePlural')}
      actions={
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => refetch()}>{t('common.refresh')}</Button>
          <Button variant="contained" onClick={() => navigate('/employees/new')}>{t('common.add')}</Button>
        </Stack>
      }
    >
      <Stack spacing={2}>
        <SectionCard>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }} flexWrap="wrap">
            <TextField
              size="small"
              label={t('common.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ minWidth: { xs: '100%', sm: 240 } }}
            />
            <TextField
              size="small"
              label={t('employee.company') + ' ID'}
              type="number"
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value === '' ? '' : Number(e.target.value))}
              sx={{ width: { xs: '100%', sm: 160 } }}
            />
            <TextField
              size="small"
              label={t('employee.department') + ' ID'}
              type="number"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value === '' ? '' : Number(e.target.value))}
              sx={{ width: { xs: '100%', sm: 180 } }}
            />
            <TextField
              size="small"
              label={t('common.status')}
              select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              sx={{ width: { xs: '100%', sm: 180 } }}
            >
              <MenuItem value="">{t('common.all')}</MenuItem>
              <MenuItem value="ACTIVE">{t('employee.active')}</MenuItem>
              <MenuItem value="INACTIVE">{t('employee.inactive')}</MenuItem>
              <MenuItem value="ON_LEAVE">{t('status.onLeave')}</MenuItem>
              <MenuItem value="TERMINATED">{t('status.terminated')}</MenuItem>
            </TextField>
            <Box sx={{ flexGrow: 1 }} />
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={() => refetch()}>{t('common.reset')}</Button>
              <Button variant="contained" onClick={() => refetch()}>{t('common.search')}</Button>
            </Stack>
          </Stack>
        </SectionCard>

        <SectionCard>
          <Box sx={{ height: 620, width: '100%' }}>
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
              sx={{
                borderRadius: 2,
                backgroundColor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: 'background.default',
                  borderBottom: '1px solid rgba(0,0,0,0.08)'
                },
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid rgba(0,0,0,0.05)'
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: 'rgba(79,70,229,0.04)'
                },
              }}
            />
          </Box>
          {isError && (
            <Typography variant="body2" color="error" sx={{ mt: 2 }}>
              {t('error.loadFailed', { item: t('employee.titlePlural').toLowerCase() })}
            </Typography>
          )}
        </SectionCard>
      </Stack>
    </PageContainer>
  );
};

export default EmployeeList;
