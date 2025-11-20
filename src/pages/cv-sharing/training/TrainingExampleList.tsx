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
  Stack,
  IconButton,
  Tooltip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trainingService } from '@/services/cv-sharing/trainingService';
import { TrainingExample } from '@/types/cv-sharing/training';
import { useKeycloak } from '@/hooks/useKeycloak';
import PageContainer from '@/components/ui/PageContainer';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import TrainingStats from './TrainingStats';

const TrainingExampleList: React.FC = () => {
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
      enqueueSnackbar('Training example deleted', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['trainingExamples'] });
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || 'Failed to delete training example', {
        variant: 'error',
      });
    },
  });

  const exportMutation = useMutation({
    mutationFn: () => trainingService.exportTrainingData(),
    onSuccess: (data) => {
      enqueueSnackbar(`Exported ${data.length} training examples`, { variant: 'success' });
      setExportDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['trainingExamples'] });
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || 'Failed to export training data', {
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
        return 'Irrelevant';
      case 1:
        return 'Somewhat Relevant';
      case 2:
        return 'Relevant';
      case 3:
        return 'Highly Relevant';
      default:
        return 'Unknown';
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
        <Typography variant="body2">{params.value || params.row.poolCvId}</Typography>
      ),
    },
    {
      field: 'positionTitle',
      headerName: 'Position',
      width: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">{params.value || params.row.positionId}</Typography>
      ),
    },
    {
      field: 'relevanceLabel',
      headerName: 'Label',
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
      headerName: 'Match Score',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">{params.value || 'N/A'}</Typography>
      ),
    },
    {
      field: 'labeledByName',
      headerName: 'Labeled By',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">{params.value || 'N/A'}</Typography>
      ),
    },
    {
      field: 'labeledAt',
      headerName: 'Labeled At',
      width: 180,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {params.value ? new Date(params.value).toLocaleDateString() : 'N/A'}
        </Typography>
      ),
    },
    {
      field: 'exported',
      headerName: 'Exported',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value ? 'Yes' : 'No'}
          size="small"
          color={params.value ? 'success' : 'default'}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const example = params.row as TrainingExample;
        return (
          <Stack direction="row" spacing={1}>
            <Tooltip title="View">
              <IconButton
                size="small"
                onClick={() => navigate(`/cv-sharing/training/${example.id}`)}
              >
                <ViewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {canEdit && (
              <>
                <Tooltip title="Edit">
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/cv-sharing/training/${example.id}/edit`)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => {
                      if (!canEdit) return;
                      if (window.confirm('Are you sure you want to delete this training example?')) {
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
          <Typography variant="h4">Training Examples</Typography>
          <Stack direction="row" spacing={2}>
            {canEdit && (
              <>
                <Button
                  variant="outlined"
                  startIcon={<StatsIcon />}
                  onClick={() => navigate('/cv-sharing/training/stats')}
                >
                  Statistics
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => setExportDialogOpen(true)}
                >
                  Export
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/cv-sharing/training/new')}
                >
                  Create Example
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
            page={page}
            pageSize={pageSize}
            onPaginationModelChange={(model) => {
              setPage(model.page);
              setPageSize(model.pageSize);
            }}
            disableRowSelectionOnClick
            sx={{ minHeight: 400 }}
          />
        </Paper>
      </Box>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Export Training Data</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mt: 2 }}>
            This will export all unexported training examples and mark them as exported.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (!canEdit) return;
              exportMutation.mutate();
            }}
            disabled={!canEdit || exportMutation.isPending}
          >
            {exportMutation.isPending ? 'Exporting...' : 'Export'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default TrainingExampleList;

