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
      enqueueSnackbar('Model activated successfully', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['models'] });
      queryClient.invalidateQueries({ queryKey: ['activeModel'] });
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || 'Failed to activate model', {
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
      headerName: 'ID',
      width: 80,
    },
    {
      field: 'version',
      headerName: 'Version',
      width: 150,
    },
    {
      field: 'modelType',
      headerName: 'Type',
      width: 150,
    },
    {
      field: 'status',
      headerName: 'Status',
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
      headerName: 'Active',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value ? 'Yes' : 'No'}
          size="small"
          color={params.value ? 'success' : 'default'}
          icon={params.value ? <ActiveIcon /> : undefined}
        />
      ),
    },
    {
      field: 'trainingExamplesCount',
      headerName: 'Training Examples',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">{params.value || 'N/A'}</Typography>
      ),
    },
    {
      field: 'activatedAt',
      headerName: 'Activated At',
      width: 180,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {params.value ? new Date(params.value).toLocaleDateString() : 'N/A'}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const model = params.row as ModelRegistry;
        return (
          <Stack direction="row" spacing={1}>
            <Tooltip title="View Details">
              <IconButton
                size="small"
                onClick={() => navigate(`/cv-sharing/models/${model.id}`)}
              >
                <ViewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {canEdit && !model.isActive && model.status === 'ACTIVE' && (
              <Tooltip title="Activate">
                <IconButton
                  size="small"
                  color="success"
                  onClick={() => {
                    if (!canEdit) return;
                    if (window.confirm('Activate this model? Other models will be deactivated.')) {
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
              Register Model
            </Button>
          )}
        </Stack>

        {activeModel && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Active Model: <strong>{activeModel.version}</strong> ({activeModel.modelType})
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
          />
        </Paper>
      </Box>
    </PageContainer>
  );
};

export default ModelRegistryList;

