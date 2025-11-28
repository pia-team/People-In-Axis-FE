import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Paper,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  CheckCircle as ActiveIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { modelRegistryService } from '@/services/cv-sharing/modelRegistryService';
import { ModelRegistry } from '@/types/cv-sharing/model';
import { useKeycloak } from '@/hooks/useKeycloak';
import PageContainer from '@/components/ui/PageContainer';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';

const ModelRegistryList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { hasAnyRole } = useKeycloak();
  const canEdit = hasAnyRole(['HUMAN_RESOURCES', 'SYSTEM_ADMIN']);
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['models', page, pageSize],
    queryFn: () => modelRegistryService.getModels(page, pageSize),
  });

  const { data: activeModel } = useQuery({
    queryKey: ['activeModel'],
    queryFn: () => modelRegistryService.getActiveModel(),
    retry: false,
  });

  const activateMutation = useMutation({
    mutationFn: (id: number) => modelRegistryService.activateModel(id),
    onSuccess: () => {
      enqueueSnackbar(t('model.modelActivated'), { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['models'] });
      queryClient.invalidateQueries({ queryKey: ['activeModel'] });
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || t('model.failedToActivateModel'), {
        variant: 'error',
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'TRAINING':
        return 'info';
      case 'DEPRECATED':
        return 'default';
      case 'FAILED':
        return 'error';
      default:
        return 'default';
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: t('common.id'),
      width: 80,
    },
    {
      field: 'version',
      headerName: t('model.version'),
      width: 150,
    },
    {
      field: 'modelType',
      headerName: t('model.modelType'),
      width: 150,
    },
    {
      field: 'status',
      headerName: t('model.status'),
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          size="small"
          color={getStatusColor(params.value) as any}
        />
      ),
    },
    {
      field: 'isActive',
      headerName: t('model.active'),
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value ? t('model.yes') : t('model.no')}
          size="small"
          color={params.value ? 'success' : 'default'}
          icon={params.value ? <ActiveIcon /> : undefined}
        />
      ),
    },
    {
      field: 'trainingExamplesCount',
      headerName: t('model.trainingExamples'),
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">{params.value || t('common.notAvailable')}</Typography>
      ),
    },
    {
      field: 'activatedAt',
      headerName: t('model.activatedAt'),
      width: 180,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {params.value ? new Date(params.value).toLocaleDateString() : t('common.notAvailable')}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: t('common.actions'),
      width: 150,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const model = params.row as ModelRegistry;
        return (
          <Stack direction="row" spacing={1}>
            <Tooltip title={t('abTest.viewDetails')}>
              <IconButton
                size="small"
                onClick={() => navigate(`/cv-sharing/models/${model.id}`)}
              >
                <ViewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {canEdit && !model.isActive && model.status === 'ACTIVE' && (
              <Tooltip title={t('model.activate')}>
                <IconButton
                  size="small"
                  color="success"
                  onClick={() => {
                    if (!canEdit) return;
                    if (window.confirm(t('model.activateConfirm'))) {
                      activateMutation.mutate(model.id);
                    }
                  }}
                >
                  <ActiveIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        );
      },
    },
  ];

  return (
    <PageContainer>
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h4">{t('model.titlePlural')}</Typography>
          {canEdit && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/cv-sharing/models/new')}
            >
              {t('model.registerModel')}
            </Button>
          )}
        </Stack>

        {activeModel && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {t('model.activeModel')}: <strong>{activeModel.version}</strong> ({activeModel.modelType})
          </Alert>
        )}

        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton onClick={() => refetch()}>
              <RefreshIcon />
            </IconButton>
          </Stack>
        </Paper>

        <Paper>
          <DataGrid
            rows={data?.content || []}
            columns={columns}
            loading={isLoading}
            paginationMode="server"
            rowCount={data?.totalElements || 0}
            paginationModel={{ page, pageSize }}
            onPaginationModelChange={(model) => {
              setPage(model.page);
              setPageSize(model.pageSize);
            }}
            disableRowSelectionOnClick
            sx={{ minHeight: 400 }}
            localeText={{
              MuiTablePagination: {
                labelRowsPerPage: t('common.rowsPerPage'),
                labelDisplayedRows: ({ from, to, count }: { from: number; to: number; count: number }) => {
                  if (count === -1) {
                    return `${from}–${to}`;
                  }
                  const currentPage = Math.floor(from / pageSize) + 1;
                  const totalPages = Math.ceil(count / pageSize);
                  return t('common.pageOf', { current: currentPage, total: totalPages });
                },
              },
              columnMenuSortAsc: t('common.sortByAsc'),
              columnMenuSortDesc: t('common.sortByDesc'),
              columnMenuFilter: t('common.filter'),
              columnMenuHideColumn: t('common.hideColumn'),
              columnMenuManageColumns: t('common.manageColumns'),
            } as any}
          />
        </Paper>
      </Box>
    </PageContainer>
  );
};

export default ModelRegistryList;

