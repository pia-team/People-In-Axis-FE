import React from 'react';
import { Typography, Stack, TextField, Button } from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { projectService } from '@/services/projectService';
import { Project, PaginatedResponse } from '@/types';
import PageContainer from '@/components/ui/PageContainer';
import SectionCard from '@/components/ui/SectionCard';
import { standardDataGridSx } from '@/components/ui/dataGridStyles';
import EmptyState from '@/components/ui/EmptyState';

const ProjectList: React.FC = () => {
  const { t } = useTranslation();
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
      { field: 'code', headerName: t('project.code'), width: 140 },
      { field: 'name', headerName: t('project.name'), flex: 1.2, minWidth: 180 },
      { field: 'companyName', headerName: t('employee.company'), flex: 1, minWidth: 160 },
      { field: 'projectManagerName', headerName: t('project.manager'), flex: 1, minWidth: 160 },
      { field: 'status', headerName: t('common.status'), width: 140 },
      { field: 'startDate', headerName: t('project.startDate'), width: 120 },
      { field: 'deadline', headerName: t('project.deadline'), width: 120 },
    ],
    [t]
  );

  const handlePaginationChange = (model: GridPaginationModel) => {
    setPaginationModel({ page: model.page, pageSize: model.pageSize });
  };

  const NoProjectsOverlay = React.useCallback(() => (
    <EmptyState
      title={t('common.noData')}
      description={t('common.noResults')}
    />
  ), [t, refetch]);

  return (
    <PageContainer
      title={t('project.titlePlural')}
      actions={
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => refetch()}>{t('common.refresh')}</Button>
          <Button variant="contained" onClick={() => navigate('/projects/new')}>{t('common.add')}</Button>
        </Stack>
      }
    >
      <Stack spacing={2}>
        <SectionCard>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
            <TextField size="small" label={t('common.search')} value={search} onChange={(e) => setSearch(e.target.value)} />
            <TextField size="small" label={t('employee.company') + ' ID'} type="number" value={companyId} onChange={(e) => setCompanyId(e.target.value === '' ? '' : Number(e.target.value))} sx={{ width: { xs: '100%', sm: 160 } }} />
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
              onRowClick={(params) => navigate(`/projects/${params.id}`)}
              disableRowSelectionOnClick
              sx={standardDataGridSx}
              slots={{ noRowsOverlay: NoProjectsOverlay }}
            />
          </div>
          {isError && (
            <Typography variant="body2" color="error" sx={{ mt: 2 }}>
              {t('error.loadFailed', { item: t('project.titlePlural').toLowerCase() })}
            </Typography>
          )}
        </SectionCard>
      </Stack>
    </PageContainer>
  );
};

export default ProjectList;
