import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  TextField,
  MenuItem,
  Grid,
  Tooltip,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Archive as ArchiveIcon,
  ContentCopy as DuplicateIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { positionService } from '@/services/cv-sharing';
import { Position, PositionStatus, WorkType } from '@/types/cv-sharing';

const PositionList: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PositionStatus | ''>('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  // Fetch positions
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['positions', page, pageSize, searchQuery, statusFilter, departmentFilter],
    queryFn: () => positionService.getPositions({
      page,
      size: pageSize,
      q: searchQuery,
      status: statusFilter || undefined,
      department: departmentFilter || undefined
    })
  });

  // status change handled in detail/edit views; not used here

  const handleDuplicate = async (id: string) => {
    try {
      const newPosition = await positionService.duplicatePosition(id);
      enqueueSnackbar('Position duplicated successfully', { variant: 'success' });
      navigate(`/positions/${newPosition.id}/edit`);
    } catch (error) {
      enqueueSnackbar('Failed to duplicate position', { variant: 'error' });
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await positionService.archivePosition(id);
      enqueueSnackbar('Position archived successfully', { variant: 'success' });
      refetch();
    } catch (error) {
      enqueueSnackbar('Failed to archive position', { variant: 'error' });
    }
  };

  const getStatusColor = (status: PositionStatus) => {
    switch (status) {
      case PositionStatus.ACTIVE:
        return 'success';
      case PositionStatus.DRAFT:
        return 'default';
      case PositionStatus.PASSIVE:
        return 'warning';
      case PositionStatus.CLOSED:
        return 'error';
      case PositionStatus.ARCHIVED:
        return 'default';
      default:
        return 'default';
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'title',
      headerName: 'Position Title',
      flex: 1,
      minWidth: 200
    },
    {
      field: 'department',
      headerName: 'Department',
      width: 150
    },
    {
      field: 'location',
      headerName: 'Location',
      width: 150
    },
    {
      field: 'workType',
      headerName: 'Work Type',
      width: 120,
      renderCell: (params: GridRenderCellParams) => {
        const workType = params.value as WorkType;
        return (
          <Chip
            label={workType}
            size="small"
            variant="outlined"
          />
        );
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params: GridRenderCellParams) => {
        const status = params.value as PositionStatus;
        return (
          <Chip
            label={status}
            color={getStatusColor(status)}
            size="small"
          />
        );
      }
    },
    {
      field: 'applicationCount',
      headerName: 'Applications',
      width: 100,
      align: 'center'
    },
    {
      field: 'applicationDeadline',
      headerName: 'Deadline',
      width: 120,
      valueFormatter: (params) => {
        if (!params.value) return '-';
        return new Date(params.value).toLocaleDateString();
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const position = params.row as Position;
        return (
          <Box>
            <Tooltip title="View">
              <IconButton
                size="small"
                onClick={() => navigate(`/positions/${position.id}`)}
              >
                <ViewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => navigate(`/positions/${position.id}/edit`)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Duplicate">
              <IconButton
                size="small"
                onClick={() => handleDuplicate(position.id)}
              >
                <DuplicateIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Archive">
              <IconButton
                size="small"
                onClick={() => handleArchive(position.id)}
                disabled={position.status === PositionStatus.ARCHIVED}
              >
                <ArchiveIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      }
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Positions
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/positions/new')}
        >
          Create Position
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search positions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as PositionStatus | '')}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value={PositionStatus.DRAFT}>Draft</MenuItem>
              <MenuItem value={PositionStatus.ACTIVE}>Active</MenuItem>
              <MenuItem value={PositionStatus.PASSIVE}>Passive</MenuItem>
              <MenuItem value={PositionStatus.CLOSED}>Closed</MenuItem>
              <MenuItem value={PositionStatus.ARCHIVED}>Archived</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Department"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => refetch()}
            >
              Apply Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <DataGrid
            rows={data?.content || []}
            columns={columns}
            loading={isLoading}
            paginationMode="server"
            rowCount={data?.pageInfo.totalElements || 0}
            paginationModel={{ page, pageSize }}
            onPaginationModelChange={(model) => {
              setPage(model.page);
              setPageSize(model.pageSize);
            }}
            pageSizeOptions={[10, 25, 50]}
            disableRowSelectionOnClick
            autoHeight
            sx={{
              '& .MuiDataGrid-root': {
                border: 'none'
              }
            }}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default PositionList;
