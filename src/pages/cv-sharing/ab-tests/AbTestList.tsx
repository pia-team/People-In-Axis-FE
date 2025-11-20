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

const AbTestList: React.FC = () => {
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
      enqueueSnackbar('A/B test started', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['abTests'] });
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || 'Failed to start A/B test', {
        variant: 'error',
      });
    },
  });

  const pauseMutation = useMutation({
    mutationFn: (id: number) => abTestService.pauseAbTest(id),
    onSuccess: () => {
      enqueueSnackbar('A/B test paused', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['abTests'] });
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || 'Failed to pause A/B test', {
        variant: 'error',
      });
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id: number) => abTestService.completeAbTest(id),
    onSuccess: () => {
      enqueueSnackbar('A/B test completed', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['abTests'] });
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || 'Failed to complete A/B test', {
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
      headerName: 'ID',
      width: 80,
    },
    {
      field: 'testName',
      headerName: 'Test Name',
      width: 200,
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
      field: 'startDate',
      headerName: 'Start Date',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {params.value ? new Date(params.value).toLocaleDateString() : 'N/A'}
        </Typography>
      ),
    },
    {
      field: 'endDate',
      headerName: 'End Date',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {params.value ? new Date(params.value).toLocaleDateString() : 'N/A'}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const test = params.row as AbTest;
        return (
          <Stack direction="row" spacing={1}>
            <Tooltip title="View Details">
              <IconButton
                size="small"
                onClick={() => navigate(`/cv-sharing/ab-tests/${test.id}`)}
              >
                <ViewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {canEdit && test.status === 'DRAFT' && (
              <Tooltip title="Start Test">
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
              <Tooltip title="Pause Test">
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
              <Tooltip title="Complete Test">
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
          <Typography variant="h4">A/B Tests</Typography>
          {canEdit && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/cv-sharing/ab-tests/new')}
            >
              Create Test
            </Button>
          )}
        </Stack>

        {activeTests.length > 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {activeTests.length} active A/B test(s) running
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

export default AbTestList;

