import React, { useState, useEffect } from 'react';
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
  Tooltip,
  Menu
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  ContentCopy as DuplicateIcon,
  Archive as ArchiveIcon,
  MoreVert as MoreVertIcon
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
// import { standardDataGridSx } from '@/components/ui/dataGridStyles';
import EmptyState from '@/components/ui/EmptyState';
import { useKeycloak } from '@/providers/KeycloakProvider';

const PositionList: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { hasRole } = useKeycloak();
  const isHR = hasRole('HUMAN_RESOURCES');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PositionStatus | ''>('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [departments, setDepartments] = useState<string[]>([]);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);

  // Fetch positions
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['positions', page, pageSize, searchQuery, statusFilter, departmentFilter],
    queryFn: () => positionService.getPositions({
      page,
      size: pageSize,
      q: searchQuery,
      status: isHR ? (statusFilter || undefined) : PositionStatus.ACTIVE,
      department: departmentFilter || undefined
    })
  });

  // Ensure non-HR users are locked to ACTIVE status
  useEffect(() => {
    if (!isHR && statusFilter !== PositionStatus.ACTIVE) {
      setStatusFilter(PositionStatus.ACTIVE);
    }
  }, [isHR]);

  // Recompute department options from loaded rows (after data is defined)
  useEffect(() => {
    const items = (data?.content ?? []) as any[];
    const unique = Array.from(new Set(items.map((p: any) => p?.department).filter((d: any) => !!d))) as string[];
    setDepartments(unique);
  }, [data?.content]);

  // status change handled in detail/edit views; not used here

  const handleDuplicate = async (id: string) => {
    try {
      const newPosition = await positionService.duplicatePosition(id);
      enqueueSnackbar('Position duplicated successfully', { variant: 'success' });
      navigate(`/cv-sharing/positions/${newPosition.id}/edit`);
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

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, position: Position) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedPosition(position);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedPosition(null);
  };

  const handleStatusChange = async (newStatus: PositionStatus) => {
    if (!selectedPosition) return;

    try {
      await positionService.updatePositionStatus(selectedPosition.id, newStatus);
      enqueueSnackbar(`Position status updated to ${newStatus}`, { variant: 'success' });
      refetch();
    } catch (error) {
      enqueueSnackbar('Failed to update position status', { variant: 'error' });
    } finally {
      handleMenuClose();
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
    { field: 'title', headerName: 'Position Title', flex: 1, minWidth: 200 },
    { field: 'name', headerName: 'Internal Name', width: 180 },
    {
      field: 'requirements',
      headerName: 'Requirements',
      flex: 1.2,
      minWidth: 220,
      renderCell: (params: GridRenderCellParams) => (
        <Typography noWrap sx={{ maxWidth: '100%' }}>{params.value || '-'}</Typography>
      )
    },
    { field: 'department', headerName: 'Department', width: 150 },
    { field: 'location', headerName: 'Location', width: 150 },
    {
      field: 'workType',
      headerName: 'Work Type',
      width: 120,
      renderCell: (params: GridRenderCellParams) => {
        const workType = params.value as WorkType;
        return <Chip label={workType} size="small" variant="outlined" />;
      }
    },
    { field: 'minExperience', headerName: 'Min Exp (yrs)', width: 120, valueFormatter: (p) => p.value ?? '-' },
    { field: 'educationLevel', headerName: 'Education', width: 140, valueFormatter: (p) => p.value ?? '-' },
    { field: 'visibility', headerName: 'Visibility', width: 120 },
    {
      field: 'salaryRange',
      headerName: 'Salary Range',
      width: 160,
      valueGetter: (params) => {
        const min = params.row.salaryRangeMin;
        const max = params.row.salaryRangeMax;
        if (min == null && max == null) return '-';
        if (min != null && max != null) return `${min} - ${max}`;
        if (min != null) return `${min} +`;
        return `up to ${max}`;
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params: GridRenderCellParams) => {
        const status = params.value as PositionStatus;
        return <Chip label={status} color={getStatusColor(status)} size="small" />;
      }
    },
    { field: 'applicationCount', headerName: 'Applications', width: 110, align: 'center' },
    {
      field: 'applicationDeadline',
      headerName: 'Deadline',
      width: 120,
      valueFormatter: (params) => (params.value ? format(new Date(params.value), 'dd/MM/yyyy') : '-')
    },
    { field: 'createdBy', headerName: 'Created By', width: 160, valueFormatter: (p) => p.value || 'System' },
    {
      field: 'createdAt',
      headerName: 'Created At',
      width: 140,
      valueFormatter: (params) => (params.value ? format(new Date(params.value), 'dd/MM/yyyy HH:mm') : '-')
    },
    {
      field: 'updatedAt',
      headerName: 'Updated At',
      width: 140,
      valueFormatter: (params) => (params.value ? format(new Date(params.value), 'dd/MM/yyyy HH:mm') : '-')
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
            <Tooltip title={isHR ? 'Edit' : 'Yalnızca İnsan Kaynakları düzenleyebilir'}>
              <span>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/cv-sharing/positions/${position.id}/edit`);
                  }}
                  disabled={!isHR}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={isHR ? 'Duplicate' : 'Yalnızca İnsan Kaynakları kopyalayabilir'}>
              <span>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDuplicate(position.id);
                  }}
                  disabled={!isHR}
                >
                  <DuplicateIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={isHR ? 'Archive' : 'Yalnızca İnsan Kaynakları arşivleyebilir'}>
              <span>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleArchive(position.id);
                  }}
                  disabled={!isHR || position.status === PositionStatus.ARCHIVED}
                >
                  <ArchiveIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={isHR ? 'Change Status' : 'Yalnızca İnsan Kaynakları durumu değiştirebilir'}>
              <span>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMenuOpen(e, position);
                  }}
                  disabled={!isHR}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </span>
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
          <Tooltip title={isHR ? '' : 'Yalnızca İnsan Kaynakları pozisyon oluşturabilir'}>
            <span>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/cv-sharing/positions/new')}
                disabled={!isHR}
              >
                Create Position
              </Button>
            </span>
          </Tooltip>
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
                value={isHR ? (statusFilter as any) : PositionStatus.ACTIVE}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value as PositionStatus | '')}
                disabled={!isHR}
              >
                {isHR ? (
                  [
                    <MenuItem key="all" value="">All</MenuItem>,
                    <MenuItem key="draft" value={PositionStatus.DRAFT}>Draft</MenuItem>,
                    <MenuItem key="active" value={PositionStatus.ACTIVE}>Active</MenuItem>,
                    <MenuItem key="passive" value={PositionStatus.PASSIVE}>Passive</MenuItem>,
                    <MenuItem key="closed" value={PositionStatus.CLOSED}>Closed</MenuItem>,
                    <MenuItem key="archived" value={PositionStatus.ARCHIVED}>Archived</MenuItem>,
                  ]
                ) : (
                  <MenuItem value={PositionStatus.ACTIVE}>Active</MenuItem>
                )}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: { xs: '100%', sm: 200 } }}>
              <InputLabel>Department</InputLabel>
              <Select
                value={departmentFilter}
                label="Department"
                onChange={(e) => setDepartmentFilter(e.target.value as string)}
              >
                <MenuItem value="">All</MenuItem>
                {departments.map((name) => (
                  <MenuItem key={name} value={name}>{name}</MenuItem>
                ))}
              </Select>
            </FormControl>
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
              loading={isPending}
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
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {Object.values(PositionStatus)
          .filter(s => s !== selectedPosition?.status && s !== PositionStatus.ARCHIVED)
          .map((status) => (
            <MenuItem key={status} onClick={() => handleStatusChange(status)}>
              Set as {status}
            </MenuItem>
          ))}
      </Menu>
    </PageContainer>
  );
};

export default PositionList;
