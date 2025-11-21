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
import { useTranslation } from 'react-i18next';

const PositionList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { hasRole } = useKeycloak();
  const isHR = hasRole('HUMAN_RESOURCES');
  const isCompanyManager = hasRole('COMPANY_MANAGER');
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

  const handleDuplicate = (id: string) => {
    // Navigate to new position form with duplicate data
    navigate('/cv-sharing/positions/new', {
      state: { duplicateFrom: id }
    });
  };

  const handleArchive = async (id: string) => {
    try {
      await positionService.archivePosition(id);
      enqueueSnackbar(t('position.positionArchived'), { variant: 'success' });
      refetch();
    } catch (error) {
      enqueueSnackbar(t('error.updateFailed'), { variant: 'error' });
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
      enqueueSnackbar(t('position.positionUpdated'), { variant: 'success' });
      refetch();
    } catch (error) {
      enqueueSnackbar(t('error.updateFailed'), { variant: 'error' });
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

  const columns: GridColDef[] = React.useMemo(() => [
    { field: 'title', headerName: t('position.jobTitle'), flex: 1, minWidth: 200 },
    { field: 'name', headerName: t('position.name'), width: 180 },
    {
      field: 'requirements',
      headerName: t('position.requirements'),
      flex: 1.2,
      minWidth: 220,
      renderCell: (params: GridRenderCellParams) => (
        <Typography noWrap sx={{ maxWidth: '100%' }}>{params.value || '-'}</Typography>
      )
    },
    { field: 'department', headerName: t('position.department'), width: 150 },
    { field: 'location', headerName: t('position.location'), width: 150 },
    {
      field: 'workType',
      headerName: t('position.workType'),
      width: 120,
      renderCell: (params: GridRenderCellParams) => {
        const workType = params.value as WorkType;
        const workTypeKey = workType?.toLowerCase().replace(/\s+/g, '') || '';
        return <Chip label={t(`position.${workTypeKey}`) || workType} size="small" variant="outlined" />;
      }
    },
    { field: 'minExperience', headerName: t('position.experienceYears'), width: 120, valueFormatter: (p) => p.value ?? t('common.notAvailable') },
    { field: 'educationLevel', headerName: t('common.education'), width: 140, valueFormatter: (p) => p.value ?? t('common.notAvailable') },
    { field: 'visibility', headerName: t('common.visibility'), width: 120 },
    {
      field: 'salaryRange',
      headerName: t('position.salaryRange'),
      width: 160,
      valueGetter: (params) => {
        const min = params.row.salaryRangeMin;
        const max = params.row.salaryRangeMax;
        if (min == null && max == null) return t('common.notAvailable');
        if (min != null && max != null) return `${min} - ${max}`;
        if (min != null) return `${min} +`;
        return `${t('common.upTo')} ${max}`;
      }
    },
    {
      field: 'status',
      headerName: t('common.status'),
      width: 120,
      renderCell: (params: GridRenderCellParams) => {
        const status = params.value as PositionStatus;
        const statusKey = status?.toLowerCase() || '';
        return <Chip label={t(`position.${statusKey}`) || status} color={getStatusColor(status)} size="small" />;
      }
    },
    { field: 'applicationCount', headerName: t('position.applications'), width: 110, align: 'center' },
    {
      field: 'applicationDeadline',
      headerName: t('position.applicationDeadline'),
      width: 120,
      valueFormatter: (params) => (params.value ? format(new Date(params.value), 'dd/MM/yyyy') : t('common.notAvailable'))
    },
    { field: 'createdBy', headerName: t('common.createdBy'), width: 160, valueFormatter: (p) => p.value || t('common.system') },
    {
      field: 'createdAt',
      headerName: t('common.createdAt'),
      width: 140,
      valueFormatter: (params) => (params.value ? format(new Date(params.value), 'dd/MM/yyyy HH:mm') : t('common.notAvailable'))
    },
    {
      field: 'updatedAt',
      headerName: t('common.updatedAt'),
      width: 140,
      valueFormatter: (params) => (params.value ? format(new Date(params.value), 'dd/MM/yyyy HH:mm') : t('common.notAvailable'))
    },
    {
      field: 'actions',
      headerName: t('common.actions'),
      width: 200,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const position = params.row as Position;
        return (
          <Box>
            <Tooltip title={t('common.view')}>
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
            <Tooltip title={isCompanyManager ? t('common.viewOnly') : (isHR ? t('common.edit') : t('common.onlyHR'))}>
              <span>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/cv-sharing/positions/${position.id}/edit`);
                  }}
                  disabled={!isHR || isCompanyManager}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={isCompanyManager ? t('common.viewOnly') : (isHR ? t('position.duplicatePosition') : t('common.onlyHR'))}>
              <span>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDuplicate(position.id);
                  }}
                  disabled={!isHR || isCompanyManager}
                >
                  <DuplicateIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={isCompanyManager ? t('common.viewOnly') : (isHR ? t('position.archivePosition') : t('common.onlyHR'))}>
              <span>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleArchive(position.id);
                  }}
                  disabled={!isHR || isCompanyManager || position.status === PositionStatus.ARCHIVED}
                >
                  <ArchiveIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={isCompanyManager ? t('common.viewOnly') : (isHR ? t('common.changeStatus') : t('common.onlyHR'))}>
              <span>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMenuOpen(e, position);
                  }}
                  disabled={!isHR || isCompanyManager}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        );
      }
    }
  ], [t, isHR, isCompanyManager, navigate]);

  const NoPositionsOverlay = React.useCallback(() => (
    <EmptyState
      title={t('common.noData')}
      description={t('common.noResults')}
    />
  ), [t]);

  return (
    <PageContainer
      title={t('position.titlePlural')}
      actions={
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => refetch()}>{t('common.refresh')}</Button>
          <Tooltip title={isHR ? '' : t('common.onlyHR')}>
            <span>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/cv-sharing/positions/new')}
                disabled={!isHR}
              >
                {t('position.createPosition')}
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
              placeholder={t('common.search') + '...'}
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
              <InputLabel>{t('common.status')}</InputLabel>
              <Select
                value={isHR ? (statusFilter as any) : PositionStatus.ACTIVE}
                label={t('common.status')}
                onChange={(e) => setStatusFilter(e.target.value as PositionStatus | '')}
                disabled={!isHR}
              >
                {isHR ? (
                  [
                    <MenuItem key="all" value="">{t('common.all')}</MenuItem>,
                    <MenuItem key="draft" value={PositionStatus.DRAFT}>{t('position.draft')}</MenuItem>,
                    <MenuItem key="active" value={PositionStatus.ACTIVE}>{t('position.active')}</MenuItem>,
                    <MenuItem key="passive" value={PositionStatus.PASSIVE}>{t('position.passive')}</MenuItem>,
                    <MenuItem key="closed" value={PositionStatus.CLOSED}>{t('position.closed')}</MenuItem>,
                    <MenuItem key="archived" value={PositionStatus.ARCHIVED}>{t('position.archived')}</MenuItem>,
                  ]
                ) : (
                  <MenuItem value={PositionStatus.ACTIVE}>{t('position.active')}</MenuItem>
                )}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: { xs: '100%', sm: 200 } }}>
              <InputLabel>{t('position.department')}</InputLabel>
              <Select
                value={departmentFilter}
                label={t('position.department')}
                onChange={(e) => setDepartmentFilter(e.target.value as string)}
              >
                <MenuItem value="">{t('common.all')}</MenuItem>
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
{t('common.apply')}
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
{t('error.loadFailed', { item: t('position.titlePlural').toLowerCase() })}
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
{t('common.setAs')} {t(`position.${status.toLowerCase()}`)}
            </MenuItem>
          ))}
      </Menu>
    </PageContainer>
  );
};

export default PositionList;
