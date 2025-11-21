import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  FormControl,
  InputLabel,
  Select,
  Avatar,
  Tooltip,
  Badge,
  Stack
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Comment as CommentIcon,
  Star as StarIcon,
  Forward as ForwardIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { applicationService, positionService } from '@/services/cv-sharing';
import { Application, ApplicationStatus, Position } from '@/types/cv-sharing';
import PageContainer from '@/components/ui/PageContainer';
import SectionCard from '@/components/ui/SectionCard';
// import { standardDataGridSx } from '@/components/ui/dataGridStyles';
import EmptyState from '@/components/ui/EmptyState';
import { useKeycloak } from '@/hooks/useKeycloak';
import { useTranslation } from 'react-i18next';

interface CommentDialogData {
  open: boolean;
  applicationId: string | null;
  comment: string;
}

interface RatingDialogData {
  open: boolean;
  applicationId: string | null;
  score: number;
}

const ApplicationList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [paginationModel, setPaginationModel] = React.useState<GridPaginationModel>(
    { page: 0, pageSize: 10 }
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | ''>('');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [positionIdFilter, setPositionIdFilter] = useState<string>('');
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [commentDialog, setCommentDialog] = useState<CommentDialogData>({
    open: false,
    applicationId: null,
    comment: ''
  });
  const [ratingDialog, setRatingDialog] = useState<RatingDialogData>({
    open: false,
    applicationId: null,
    score: 0
  });
  const { hasRole } = useKeycloak();
  const isCompanyManager = hasRole('COMPANY_MANAGER');

  // Load positions for dropdowns
  const { data: positionsPage } = useQuery({
    queryKey: ['positions', 'for-applications-filter'],
    queryFn: () => positionService.getPositions({ page: 0, size: 200 }),
    staleTime: 5 * 60 * 1000,
  });
  const positionOptions = positionsPage?.content ?? [];
  const departmentOptions: string[] = React.useMemo(() => {
    const set = new Set<string>();
    positionOptions.forEach((p) => { 
      if (p?.department) {
        set.add(p.department);
      }
    });
    return Array.from(set);
  }, [positionOptions]);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['applications', paginationModel.page, paginationModel.pageSize, statusFilter, searchTerm, departmentFilter, positionIdFilter, sortModel],
    queryFn: async () => applicationService.getApplications({
      page: paginationModel.page,
      size: paginationModel.pageSize,
      status: statusFilter || undefined,
      q: searchTerm || undefined,
      department: departmentFilter || undefined,
      positionId: positionIdFilter || undefined,
      sort: sortModel?.[0]?.field ? `${sortModel[0].field},${sortModel[0].sort === 'asc' ? 'asc' : 'desc'}` : undefined,
    }),
    placeholderData: keepPreviousData,
  });

  const rows = data?.content ?? [];
  const rowCount = data?.pageInfo?.totalElements ?? 0;

  const handlePaginationChange = (model: GridPaginationModel) => {
    setPaginationModel({ page: model.page, pageSize: model.pageSize });
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    if (paginationModel.page !== 0) setPaginationModel(p => ({ ...p, page: 0 }));
  };

  // handlers inlined in Select onChange

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, application: Application) => {
    setAnchorEl(event.currentTarget);
    setSelectedApplication(application);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedApplication(null);
  };

  const queryClient = useQueryClient();

  const handleStatusChange = async (applicationId: string, newStatus: ApplicationStatus) => {
    try {
      await applicationService.updateApplicationStatus(applicationId, { status: newStatus });
      enqueueSnackbar(t('success.updated'), { variant: 'success' });
      // Invalidate applications cache to refresh the list
      await queryClient.invalidateQueries({ queryKey: ['applications'] });
      refetch();
    } catch (error) {
      enqueueSnackbar(t('error.updateFailed'), { variant: 'error' });
    }
  };

  const handleAddComment = async () => {
    if (!commentDialog.applicationId || !commentDialog.comment) return;
    
    try {
      await applicationService.addComment(commentDialog.applicationId, {
        content: commentDialog.comment,
        isInternal: true
      });
      enqueueSnackbar(t('application.commentAdded'), { variant: 'success' });
      setCommentDialog({ open: false, applicationId: null, comment: '' });
      refetch();
    } catch (error) {
      enqueueSnackbar(t('error.createFailed'), { variant: 'error' });
    }
  };

  const handleAddRating = async () => {
    if (!ratingDialog.applicationId || !ratingDialog.score) return;
    
    try {
      await applicationService.addRating(ratingDialog.applicationId, { score: ratingDialog.score });
      enqueueSnackbar(t('application.ratingAdded'), { variant: 'success' });
      setRatingDialog({ open: false, applicationId: null, score: 0 });
      refetch();
    } catch (error) {
      enqueueSnackbar(t('error.createFailed'), { variant: 'error' });
    }
  };

  const getStatusColor = (status: ApplicationStatus) => {
    const statusColors: Record<ApplicationStatus, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
      [ApplicationStatus.NEW]: 'info',
      [ApplicationStatus.IN_REVIEW]: 'primary',
      [ApplicationStatus.FORWARDED]: 'secondary',
      [ApplicationStatus.MEETING_SCHEDULED]: 'warning',
      [ApplicationStatus.ACCEPTED]: 'success',
      [ApplicationStatus.REJECTED]: 'error',
      [ApplicationStatus.WITHDRAWN]: 'default',
      [ApplicationStatus.ARCHIVED]: 'default'
    };
    return statusColors[status] || 'default';
  };

  const columns: GridColDef[] = React.useMemo(() => [
    {
      field: 'applicant',
      headerName: t('application.applicant'),
      //sortField: 'surname'
      flex: 1.5,
      minWidth: 250,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32 }}>
            {params.row.firstName[0]}{params.row.lastName[0]}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {params.row.firstName} {params.row.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.email}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      field: 'positionTitle',
      headerName: t('application.position'),
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {params.row.positionTitle || t('common.notAvailable')}
        </Typography>
      )
    },
    {
      field: 'appliedAt',
      headerName: t('application.appliedAt'),
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {new Date(params.row.appliedAt).toLocaleDateString()}
        </Typography>
      )
    },
    {
      field: 'status',
      headerName: t('common.status'),
      width: 140,
      renderCell: (params: GridRenderCellParams) => {
        const statusKey = params.row.status?.toLowerCase().replace(/_/g, '') || '';
        return (
        <Chip
          label={t(`application.${statusKey}`) || params.row.status.replace('_', ' ')}
          color={getStatusColor(params.row.status)}
          size="small"
        />
        );
      }
    },
    {
      field: 'rating',
      headerName: t('application.ratings'),
      width: 140,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {params.row.averageRating ? (
            <>
              <Rating value={params.row.averageRating} readOnly size="small" />
              <Typography variant="caption">
                ({params.row.ratingCount})
              </Typography>
            </>
          ) : (
            <Typography variant="caption" color="text.secondary">
              {t('application.noRatings')}
            </Typography>
          )}
        </Box>
      )
    },
    {
      field: 'comments',
      headerName: t('application.comments'),
      width: 110,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <Badge badgeContent={params.row.commentCount} color="primary">
          <CommentIcon fontSize="small" />
        </Badge>
      )
    },
    {
      field: 'actions',
      headerName: t('common.actions'),
      width: 160,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Tooltip title={t('common.view')}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/cv-sharing/applications/${params.row.id}`);
              }}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('application.addComment')}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setCommentDialog({
                  open: true,
                  applicationId: params.row.id,
                  comment: ''
                });
              }}
            >
              <CommentIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('application.addRating')}>
            <IconButton
              size="small"
              disabled={isCompanyManager}
              onClick={(e) => {
                e.stopPropagation();
                setRatingDialog({
                  open: true,
                  applicationId: params.row.id,
                  score: 0
                });
              }}
            >
              <StarIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleMenuOpen(e, params.row);
            }}
          >
            <MoreIcon fontSize="small" />
          </IconButton>
        </Box>
      )
    }
  ], [t, navigate, isCompanyManager, setCommentDialog, setRatingDialog, handleMenuOpen]);

  const NoApplicationsOverlay = React.useCallback(() => (
    <EmptyState
      title={t('application.noApplications')}
      description={t('application.noApplicationsDescription')}
    />
  ), []);

  return (
    <PageContainer
      title={t('application.titlePlural')}
      actions={
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => refetch()}>{t('common.refresh')}</Button>
        </Stack>
      }
    >
      <Stack spacing={2}>
        <SectionCard>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
            <TextField
              placeholder={t('application.searchPlaceholder')}
              value={searchTerm}
              onChange={handleSearch}
              sx={{ flex: { xs: '1 1 100%', md: '1 1 auto' } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
            <FormControl sx={{ minWidth: { xs: '100%', sm: 220 } }}>
              <InputLabel>{t('position.department')}</InputLabel>
              <Select
                value={departmentFilter}
                label={t('position.department')}
                onChange={(e) => {
                  setDepartmentFilter(e.target.value as string);
                  if (paginationModel.page !== 0) setPaginationModel(p => ({ ...p, page: 0 }));
                }}
              >
                <MenuItem value="">{t('common.all')} {t('position.department')}s</MenuItem>
                {departmentOptions.map((dep) => (
                  <MenuItem key={dep} value={dep}>{dep}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: { xs: '100%', sm: 260 } }}>
              <InputLabel>{t('application.position')}</InputLabel>
              <Select
                value={positionIdFilter}
                label={t('application.position')}
                onChange={(e) => {
                  setPositionIdFilter(e.target.value as string);
                  if (paginationModel.page !== 0) setPaginationModel(p => ({ ...p, page: 0 }));
                }}
                renderValue={(val) => {
                  if (!val) return t('common.all') + ' ' + t('position.titlePlural');
                  const found = positionOptions.find((p: Position) => p.id === val);
                  return found?.title || String(val);
                }}
              >
                <MenuItem value="">{t('common.all')} {t('position.titlePlural')}</MenuItem>
                {positionOptions.map((p: Position) => (
                  <MenuItem key={p.id} value={p.id}>{p.title}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: { xs: '100%', sm: 250 } }}>
              <InputLabel>{t('common.status')}</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as ApplicationStatus | '');
                  if (paginationModel.page !== 0) setPaginationModel(p => ({ ...p, page: 0 }));
                }}
                label={t('common.status')}
              >
                <MenuItem value="">{t('common.all')} {t('common.status')}</MenuItem>
                <MenuItem value={ApplicationStatus.NEW}>{t('application.new')}</MenuItem>
                <MenuItem value={ApplicationStatus.IN_REVIEW}>{t('application.inReview')}</MenuItem>
                <MenuItem value={ApplicationStatus.FORWARDED}>{t('application.forwarded')}</MenuItem>
                <MenuItem value={ApplicationStatus.MEETING_SCHEDULED}>{t('application.meetingScheduled')}</MenuItem>
                <MenuItem value={ApplicationStatus.ACCEPTED}>{t('application.accepted')}</MenuItem>
                <MenuItem value={ApplicationStatus.REJECTED}>{t('application.rejected')}</MenuItem>
                <MenuItem value={ApplicationStatus.WITHDRAWN}>{t('application.withdrawn')}</MenuItem>
                <MenuItem value={ApplicationStatus.ARCHIVED}>{t('application.archived')}</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </SectionCard>

        <SectionCard>
          <Box sx={{ width: '100%' }}>
            <DataGrid
              rows={rows}
              columns={columns}
              getRowId={(row) => row.id}
              loading={isPending}
              paginationMode="server"
              sortingMode="server"
              rowCount={rowCount}
              pageSizeOptions={[5, 10, 25, 50]}
              paginationModel={paginationModel}
              onPaginationModelChange={handlePaginationChange}
              sortModel={sortModel}
              onSortModelChange={(model) => {
                setSortModel(model);
                if (paginationModel.page !== 0) setPaginationModel(p => ({ ...p, page: 0 }));
              }}
              onCellClick={(params) => {
                // Don't navigate if clicking on actions column
                if (params.field !== 'actions') {
                  navigate(`/cv-sharing/applications/${params.id}`);
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
              slots={{ noRowsOverlay: NoApplicationsOverlay }}
            />
          </Box>
        </SectionCard>
        {isError && (
          <Typography variant="body2" color="error" sx={{ mt: -1 }}>
            {t('error.loadFailed', { item: t('application.titlePlural').toLowerCase() })}
          </Typography>
        )}
      </Stack>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => {
            if (selectedApplication) {
              navigate(`/cv-sharing/applications/${selectedApplication.id}/forward`);
            }
            handleMenuClose();
          }}>
            <ForwardIcon fontSize="small" sx={{ mr: 1 }} />
            {t('application.forwardToReviewer')}
          </MenuItem>
          <MenuItem onClick={() => {
            if (selectedApplication) {
              handleStatusChange(selectedApplication.id, ApplicationStatus.IN_REVIEW);
            }
            handleMenuClose();
          }}>
            {t('common.setAs')} {t('application.inReview')}
          </MenuItem>
          <MenuItem onClick={() => {
            if (selectedApplication) {
              handleStatusChange(selectedApplication.id, ApplicationStatus.ACCEPTED);
            }
            handleMenuClose();
          }}>
            {t('application.acceptApplication')}
          </MenuItem>
          <MenuItem onClick={() => {
            if (selectedApplication) {
              handleStatusChange(selectedApplication.id, ApplicationStatus.REJECTED);
            }
            handleMenuClose();
          }}>
            {t('application.rejectApplication')}
          </MenuItem>
        </Menu>

        {/* Comment Dialog */}
        <Dialog
          open={commentDialog.open}
          onClose={() => setCommentDialog({ open: false, applicationId: null, comment: '' })}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>{t('application.addComment')}</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder={t('application.commentPlaceholder')}
              value={commentDialog.comment}
              onChange={(e) => setCommentDialog({ ...commentDialog, comment: e.target.value })}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCommentDialog({ open: false, applicationId: null, comment: '' })}>
              {t('common.cancel')}
            </Button>
            <Button variant="contained" onClick={handleAddComment}>
              {t('application.addComment')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Rating Dialog */}
        <Dialog
          open={ratingDialog.open}
          onClose={() => setRatingDialog({ open: false, applicationId: null, score: 0 })}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>{t('application.addRating')}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Rating
                value={ratingDialog.score}
                onChange={(_, value) => setRatingDialog({ ...ratingDialog, score: value || 0 })}
                size="large"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRatingDialog({ open: false, applicationId: null, score: 0 })}>
              {t('common.cancel')}
            </Button>
            <Button variant="contained" onClick={handleAddRating} disabled={isCompanyManager || !ratingDialog.score}>
              {t('application.addRating')}
            </Button>
          </DialogActions>
        </Dialog>
    </PageContainer>
  );
};

export default ApplicationList;
