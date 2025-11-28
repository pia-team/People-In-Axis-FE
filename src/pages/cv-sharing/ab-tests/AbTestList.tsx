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
  PlayArrow as StartIcon,
  Pause as PauseIcon,
  CheckCircle as CompleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { abTestService } from '@/services/cv-sharing/abTestService';
import { AbTest, AbTestStatus } from '@/types/cv-sharing/ab-test';
import { useKeycloak } from '@/hooks/useKeycloak';
import PageContainer from '@/components/ui/PageContainer';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';

const AbTestList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { hasAnyRole } = useKeycloak();
  const canEdit = hasAnyRole(['HUMAN_RESOURCES', 'SYSTEM_ADMIN']);
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['abTests', page, pageSize],
    queryFn: () => abTestService.getAbTests(page, pageSize),
  });

  const startMutation = useMutation({
    mutationFn: (id: number) => abTestService.startAbTest(id),
    onSuccess: () => {
      enqueueSnackbar(t('abTest.abTestStartedShort'), { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['abTests'] });
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || t('abTest.failedToStart'), {
        variant: 'error',
      });
    },
  });

  const pauseMutation = useMutation({
    mutationFn: (id: number) => abTestService.pauseAbTest(id),
    onSuccess: () => {
      enqueueSnackbar(t('abTest.abTestPausedShort'), { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['abTests'] });
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || t('abTest.failedToPause'), {
        variant: 'error',
      });
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id: number) => abTestService.completeAbTest(id),
    onSuccess: () => {
      enqueueSnackbar(t('abTest.abTestCompletedShort'), { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['abTests'] });
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || t('abTest.failedToComplete'), {
        variant: 'error',
      });
    },
  });

  const getStatusColor = (status: AbTestStatus) => {
    switch (status) {
      case 'DRAFT':
        return 'default';
      case 'ACTIVE':
        return 'success';
      case 'PAUSED':
        return 'warning';
      case 'COMPLETED':
        return 'info';
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
      field: 'testName',
      headerName: t('abTest.testName'),
      width: 200,
    },
    {
      field: 'status',
      headerName: t('abTest.status'),
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
      field: 'startDate',
      headerName: t('abTest.startDate'),
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {params.value ? new Date(params.value).toLocaleDateString() : t('common.notAvailable')}
        </Typography>
      ),
    },
    {
      field: 'endDate',
      headerName: t('abTest.endDate'),
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {params.value ? new Date(params.value).toLocaleDateString() : t('common.notAvailable')}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: t('common.actions'),
      width: 200,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const test = params.row as AbTest;
        return (
          <Stack direction="row" spacing={1}>
            <Tooltip title={t('abTest.viewDetails')}>
              <IconButton
                size="small"
                onClick={() => navigate(`/cv-sharing/ab-tests/${test.id}`)}
              >
                <ViewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {canEdit && test.status === 'DRAFT' && (
              <Tooltip title={t('abTest.startTest')}>
                <IconButton
                  size="small"
                  color="success"
                  onClick={() => {
                    if (!canEdit) return;
                    startMutation.mutate(test.id);
                  }}
                >
                  <StartIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {canEdit && test.status === 'ACTIVE' && (
              <Tooltip title={t('abTest.pauseTest')}>
                <IconButton
                  size="small"
                  color="warning"
                  onClick={() => {
                    if (!canEdit) return;
                    pauseMutation.mutate(test.id);
                  }}
                >
                  <PauseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {canEdit && (test.status === 'ACTIVE' || test.status === 'PAUSED') && (
              <Tooltip title={t('abTest.completeTest')}>
                <IconButton
                  size="small"
                  color="info"
                  onClick={() => {
                    if (!canEdit) return;
                    completeMutation.mutate(test.id);
                  }}
                >
                  <CompleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        );
      },
    },
  ];

  const activeTests = data?.content?.filter((test) => test.status === 'ACTIVE') || [];

  return (
    <PageContainer>
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h4">{t('abTest.titlePlural')}</Typography>
          {canEdit && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/cv-sharing/ab-tests/new')}
            >
              {t('abTest.createTest')}
            </Button>
          )}
        </Stack>

        {activeTests.length > 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {t('abTest.activeTestsRunning', { count: activeTests.length })}
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

export default AbTestList;

