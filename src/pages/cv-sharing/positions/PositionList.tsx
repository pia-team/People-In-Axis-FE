import React, { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  IconButton,
  TextField,
  Typography,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  ContentCopy as DuplicateIcon,
  Archive as ArchiveIcon
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { positionService } from '@/services/cv-sharing/positionService';
import { Position, PositionStatus, WorkType } from '@/types/cv-sharing';
import { format } from 'date-fns';
import PageContainer from '@/components/ui/PageContainer';
import SectionCard from '@/components/ui/SectionCard';
import { standardDataGridSx } from '@/components/ui/dataGridStyles';
import EmptyState from '@/components/ui/EmptyState';

const PositionList: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PositionStatus | ''>('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  // Fetch positions
  const { data, isLoading, isError, refetch } = useQuery({
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
        return format(new Date(params.value), 'dd/MM/yyyy');
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
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/cv-sharing/positions/${position.id}`);
                }}
              >
                <ViewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/cv-sharing/positions/${position.id}/edit`);
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Duplicate">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDuplicate(position.id);
                }}
              >
                <DuplicateIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Archive">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleArchive(position.id);
                }}
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

  const NoPositionsOverlay = React.useCallback(() => (
    <EmptyState
      title="No positions"
      description="There are no positions to display."
    />
  ), []);

  return (
    <PageContainer
      title="Positions"
      actions={
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => refetch()}>Refresh</Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/cv-sharing/positions/new')}
          >
            Create Position
          </Button>
        </Stack>
      }
    >
      <Stack spacing={2}>
        <SectionCard>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
            <TextField
              variant="outlined"
              placeholder="Search positions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ flex: { xs: '1 1 100%', md: '1 1 auto' } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
            <FormControl sx={{ minWidth: { xs: '100%', sm: 180 } }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value as PositionStatus | '')}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value={PositionStatus.DRAFT}>Draft</MenuItem>
                <MenuItem value={PositionStatus.ACTIVE}>Active</MenuItem>
                <MenuItem value={PositionStatus.PASSIVE}>Passive</MenuItem>
                <MenuItem value={PositionStatus.CLOSED}>Closed</MenuItem>
                <MenuItem value={PositionStatus.ARCHIVED}>Archived</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Department"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              sx={{ minWidth: { xs: '100%', sm: 200 } }}
            />
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => refetch()}
              sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
            >
              Apply Filters
            </Button>
          </Box>
        </SectionCard>

        <SectionCard>
          <Box sx={{ width: '100%' }}>
            <DataGrid
              rows={data?.content || []}
              columns={columns}
              getRowId={(row) => row.id}
              loading={isLoading}
              paginationMode="server"
              rowCount={data?.pageInfo?.totalElements || 0}
              pageSizeOptions={[5, 10, 25, 50]}
              paginationModel={{ page, pageSize }}
              onPaginationModelChange={(model) => {
                setPage(model.page);
                setPageSize(model.pageSize);
              }}
              onCellClick={(params) => {
                // Don't navigate if clicking on actions column
                if (params.field !== 'actions') {
                  navigate(`/cv-sharing/positions/${params.id}`);
                }
              }}
              disableRowSelectionOnClick
              autoHeight
              sx={{
                border: 'none',
                '& .MuiDataGrid-cell': {
                  py: 1.5,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: 'background.default',
                  borderBottom: 2,
                  borderColor: 'divider',
                },
                '& .MuiDataGrid-row:hover': {
                  cursor: 'pointer',
                  backgroundColor: 'action.hover',
                },
                '& .MuiDataGrid-footerContainer': {
                  borderTop: '2px solid',
                  borderColor: 'divider',
                },
              }}
              slots={{ noRowsOverlay: NoPositionsOverlay }}
            />
          </Box>
        </SectionCard>
        {isError && (
          <Typography variant="body2" color="error" sx={{ mt: -1 }}>
            Failed to load positions.
          </Typography>
        )}
      </Stack>
    </PageContainer>
  );
};

export default PositionList;
