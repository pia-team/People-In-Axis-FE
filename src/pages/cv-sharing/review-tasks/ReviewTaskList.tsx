import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  IconButton,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  PlayArrow as GenerateIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewTaskService } from '@/services/cv-sharing/reviewTaskService';
import { ReviewTask, ReviewTaskStatus } from '@/types/cv-sharing/review-task';
import { useKeycloak } from '@/hooks/useKeycloak';
import PageContainer from '@/components/ui/PageContainer';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';

const ReviewTaskList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { hasAnyRole } = useKeycloak();
  const canEdit = hasAnyRole(['HUMAN_RESOURCES', 'SYSTEM_ADMIN']);
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState<ReviewTaskStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [generateParams, setGenerateParams] = useState({
    minUncertainty: 0.5,
    limit: 100,
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['reviewTasks', page, pageSize, statusFilter],
    queryFn: () =>
      reviewTaskService.getReviewTasks(
        page,
        pageSize,
        statusFilter === 'all' ? undefined : statusFilter
      ),
  });

  const { data: stats } = useQuery({
    queryKey: ['reviewTaskStats'],
    queryFn: () => reviewTaskService.getReviewTaskStats(),
  });

  const generateMutation = useMutation({
    mutationFn: () =>
      reviewTaskService.generateReviewTasks({
        minUncertainty: generateParams.minUncertainty,
        limit: generateParams.limit,
      }),
    onSuccess: (data) => {
      enqueueSnackbar(`${data.created} review tasks created`, { variant: 'success' });
      setGenerateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['reviewTasks'] });
      queryClient.invalidateQueries({ queryKey: ['reviewTaskStats'] });
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || 'Failed to generate review tasks', {
        variant: 'error',
      });
    },
  });

  const getStatusColor = (status: ReviewTaskStatus) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'ASSIGNED':
      case 'IN_PROGRESS':
        return 'info';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'error';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
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
      field: 'poolCvName',
      headerName: 'Pool CV',
      width: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">{params.value || 'N/A'}</Typography>
      ),
    },
    {
      field: 'positionTitle',
      headerName: 'Position',
      width: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">{params.value || 'N/A'}</Typography>
      ),
    },
    {
      field: 'uncertaintyScore',
      headerName: 'Uncertainty',
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={(params.value * 100).toFixed(0) + '%'}
          size="small"
          color={params.value >= 0.7 ? 'error' : params.value >= 0.5 ? 'warning' : 'info'}
        />
      ),
    },
    {
      field: 'matchScore',
      headerName: 'Match Score',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">{params.value || 'N/A'}</Typography>
      ),
    },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          size="small"
          color={getPriorityColor(params.value) as any}
        />
      ),
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
      field: 'assignedToName',
      headerName: 'Assigned To',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">{params.value || 'Unassigned'}</Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const task = params.row as ReviewTask;
        return (
          <Stack direction="row" spacing={1}>
            <Tooltip title="View Details">
              <IconButton
                size="small"
                onClick={() => navigate(`/cv-sharing/review-tasks/${task.id}`)}
              >
                <ViewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        );
      },
    },
  ];

  const filteredTasks = data?.content?.filter((task) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      task.poolCvName?.toLowerCase().includes(search) ||
      task.positionTitle?.toLowerCase().includes(search) ||
      task.assignedToName?.toLowerCase().includes(search)
    );
  }) || [];

  return (
    <PageContainer>
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h4">{t('reviewTask.titlePlural')}</Typography>
          {canEdit && (
            <Button
              variant="contained"
              startIcon={<GenerateIcon />}
              onClick={() => setGenerateDialogOpen(true)}
            >
              Generate Tasks
            </Button>
          )}
        </Stack>

        {/* Stats Cards */}
        {stats && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total
                  </Typography>
                  <Typography variant="h5">{stats.total}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Pending
                  </Typography>
                  <Typography variant="h5" color="warning.main">
                    {stats.pending}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Assigned
                  </Typography>
                  <Typography variant="h5" color="info.main">
                    {stats.assigned}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    In Progress
                  </Typography>
                  <Typography variant="h5" color="info.main">
                    {stats.inProgress}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Completed
                  </Typography>
                  <Typography variant="h5" color="success.main">
                    {stats.completed}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              placeholder="Search..."
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
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="ASSIGNED">Assigned</MenuItem>
                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
              </Select>
            </FormControl>
            <IconButton onClick={() => refetch()}>
              <RefreshIcon />
            </IconButton>
          </Stack>
        </Paper>

        {/* Data Grid */}
        <Paper>
          <DataGrid
            rows={filteredTasks}
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

      {/* Generate Dialog */}
      <Dialog open={generateDialogOpen} onClose={() => setGenerateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Review Tasks</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Minimum Uncertainty"
              type="number"
              value={generateParams.minUncertainty}
              onChange={(e) =>
                setGenerateParams({ ...generateParams, minUncertainty: parseFloat(e.target.value) })
              }
              inputProps={{ min: 0, max: 1, step: 0.1 }}
              helperText="Tasks with uncertainty score above this value will be created"
              fullWidth
            />
            <TextField
              label="Limit"
              type="number"
              value={generateParams.limit}
              onChange={(e) =>
                setGenerateParams({ ...generateParams, limit: parseInt(e.target.value) })
              }
              inputProps={{ min: 1, max: 1000 }}
              helperText="Maximum number of tasks to create"
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGenerateDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (!canEdit) return;
              generateMutation.mutate();
            }}
            disabled={!canEdit || generateMutation.isPending}
          >
            {generateMutation.isPending ? 'Generating...' : 'Generate'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default ReviewTaskList;

