import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  BarChart as StatsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trainingService } from '@/services/cv-sharing/trainingService';
import { TrainingExample } from '@/types/cv-sharing/training';
import { useKeycloak } from '@/hooks/useKeycloak';
import PageContainer from '@/components/ui/PageContainer';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import TrainingStats from './TrainingStats';

const TrainingExampleList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { hasAnyRole } = useKeycloak();
  const canEdit = hasAnyRole(['HUMAN_RESOURCES', 'SYSTEM_ADMIN']);
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['trainingExamples', page, pageSize],
    queryFn: () => trainingService.getTrainingExamples(page, pageSize),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => trainingService.deleteTrainingExample(id),
    onSuccess: () => {
      enqueueSnackbar(t('training.trainingExampleDeleted'), { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['trainingExamples'] });
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || t('training.failedToDeleteTrainingExample'), {
        variant: 'error',
      });
    },
  });

  const exportMutation = useMutation({
    mutationFn: () => trainingService.exportTrainingData(),
    onSuccess: (data) => {
      enqueueSnackbar(t('training.exportedCount', { count: data.length }), { variant: 'success' });
      setExportDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['trainingExamples'] });
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || t('training.failedToExport'), {
        variant: 'error',
      });
    },
  });

  const getLabelColor = (label: number) => {
    switch (label) {
      case 0:
        return 'error';
      case 1:
        return 'warning';
      case 2:
        return 'info';
      case 3:
        return 'success';
      default:
        return 'default';
    }
  };

  const getLabelText = (label: number) => {
    switch (label) {
      case 0:
        return t('training.irrelevant');
      case 1:
        return t('training.somewhatRelevant');
      case 2:
        return t('training.relevant');
      case 3:
        return t('training.highlyRelevant');
      default:
        return t('training.unknown');
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: t('common.id'),
      width: 80,
    },
    {
      field: 'poolCvName',
      headerName: t('training.poolCV'),
      width: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">{params.value || params.row.poolCvId}</Typography>
      ),
    },
    {
      field: 'positionTitle',
      headerName: t('training.position'),
      width: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">{params.value || params.row.positionId}</Typography>
      ),
    },
    {
      field: 'relevanceLabel',
      headerName: t('training.label'),
      width: 180,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={`${params.value} - ${getLabelText(params.value)}`}
          size="small"
          color={getLabelColor(params.value) as any}
        />
      ),
    },
    {
      field: 'matchScore',
      headerName: t('training.matchScore'),
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">{params.value || t('common.notAvailable')}</Typography>
      ),
    },
    {
      field: 'labeledByName',
      headerName: t('training.labeledBy'),
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">{params.value || t('common.notAvailable')}</Typography>
      ),
    },
    {
      field: 'labeledAt',
      headerName: t('training.labeledAt'),
      width: 180,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {params.value ? new Date(params.value).toLocaleDateString() : t('common.notAvailable')}
        </Typography>
      ),
    },
    {
      field: 'exported',
      headerName: t('training.exported'),
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value ? t('model.yes') : t('model.no')}
          size="small"
          color={params.value ? 'success' : 'default'}
        />
      ),
    },
    {
      field: 'actions',
      headerName: t('common.actions'),
      width: 150,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const example = params.row as TrainingExample;
        return (
          <Stack direction="row" spacing={1}>
            <Tooltip title={t('common.view')}>
              <IconButton
                size="small"
                onClick={() => navigate(`/cv-sharing/training/${example.id}`)}
              >
                <ViewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {canEdit && (
              <>
                <Tooltip title={t('common.edit')}>
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/cv-sharing/training/${example.id}/edit`)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('common.delete')}>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => {
                      if (!canEdit) return;
                      if (window.confirm(t('training.deleteConfirm'))) {
                        deleteMutation.mutate(example.id);
                      }
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Stack>
        );
      },
    },
  ];

  const filteredExamples = data?.content?.filter((example) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      example.poolCvName?.toLowerCase().includes(search) ||
      example.positionTitle?.toLowerCase().includes(search) ||
      example.labeledByName?.toLowerCase().includes(search)
    );
  }) || [];

  return (
    <PageContainer>
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h4">{t('training.titlePlural')}</Typography>
          <Stack direction="row" spacing={2}>
            {canEdit && (
              <>
                <Button
                  variant="outlined"
                  startIcon={<StatsIcon />}
                  onClick={() => navigate('/cv-sharing/training/stats')}
                >
                  {t('training.statistics')}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => setExportDialogOpen(true)}
                >
                  {t('common.export')}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/cv-sharing/training/new')}
                >
                  {t('training.createExample')}
                </Button>
              </>
            )}
          </Stack>
        </Stack>

        {/* Stats Summary */}
        <TrainingStats />

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              placeholder={t('common.search')}
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ flexGrow: 1 }}
            />
            <IconButton onClick={() => refetch()}>
              <RefreshIcon />
            </IconButton>
          </Stack>
        </Paper>

        {/* Data Grid */}
        <Paper>
          <DataGrid
            rows={filteredExamples}
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

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('training.exportTrainingData')}</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mt: 2 }}>
            {t('training.exportInfo')}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (!canEdit) return;
              exportMutation.mutate();
            }}
            disabled={!canEdit || exportMutation.isPending}
          >
            {exportMutation.isPending ? t('training.exporting') : t('common.export')}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default TrainingExampleList;

