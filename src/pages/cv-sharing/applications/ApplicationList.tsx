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
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { applicationService, positionService } from '@/services/cv-sharing';
import { Application, ApplicationStatus, Position } from '@/types/cv-sharing';
import PageContainer from '@/components/ui/PageContainer';
import SectionCard from '@/components/ui/SectionCard';
// import { standardDataGridSx } from '@/components/ui/dataGridStyles';
import EmptyState from '@/components/ui/EmptyState';
import { useKeycloak } from '@/hooks/useKeycloak';

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

  const handleStatusChange = async (applicationId: string, newStatus: ApplicationStatus) => {
    try {
      await applicationService.updateApplicationStatus(applicationId, { status: newStatus });
      enqueueSnackbar('Status updated successfully', { variant: 'success' });
      refetch();
    } catch (error) {
      enqueueSnackbar('Failed to update status', { variant: 'error' });
    }
  };

  const handleAddComment = async () => {
    if (!commentDialog.applicationId || !commentDialog.comment) return;
    
    try {
      await applicationService.addComment(commentDialog.applicationId, {
        content: commentDialog.comment,
        isInternal: true
      });
      enqueueSnackbar('Comment added successfully', { variant: 'success' });
      setCommentDialog({ open: false, applicationId: null, comment: '' });
      refetch();
    } catch (error) {
      enqueueSnackbar('Failed to add comment', { variant: 'error' });
    }
  };

  const handleAddRating = async () => {
    if (!ratingDialog.applicationId || !ratingDialog.score) return;
    
    try {
      await applicationService.addRating(ratingDialog.applicationId, { score: ratingDialog.score });
      enqueueSnackbar('Rating added successfully', { variant: 'success' });
      setRatingDialog({ open: false, applicationId: null, score: 0 });
      refetch();
    } catch (error) {
      enqueueSnackbar('Failed to add rating', { variant: 'error' });
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

  const columns: GridColDef[] = [
    {
      field: 'applicant',
      headerName: 'Applicant',
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
      headerName: 'Position',
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {params.row.positionTitle || '-'}
        </Typography>
      )
    },
    {
      field: 'appliedAt',
      headerName: 'Applied Date',
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {new Date(params.row.appliedAt).toLocaleDateString()}
        </Typography>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.row.status.replace('_', ' ')}
          color={getStatusColor(params.row.status)}
          size="small"
        />
      )
    },
    {
      field: 'rating',
      headerName: 'Rating',
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
              No ratings
            </Typography>
          )}
        </Box>
      )
    },
    {
      field: 'comments',
      headerName: 'Comments',
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
      headerName: 'Actions',
      width: 160,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Tooltip title="View">
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
          <Tooltip title="Add Comment">
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
          <Tooltip title="Add Rating">
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
  ];

  const NoApplicationsOverlay = React.useCallback(() => (
    <EmptyState
      title="No applications"
      description="There are no applications to display."
    />
  ), []);

  return (
    <PageContainer
      title="Applications"
      actions={
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => refetch()}>Refresh</Button>
        </Stack>
      }
    >
      <Stack spacing={2}>
        <SectionCard>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
            <TextField
              placeholder="Search applications..."
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
              <InputLabel>Department</InputLabel>
              <Select
                value={departmentFilter}
                label="Department"
                onChange={(e) => {
                  setDepartmentFilter(e.target.value as string);
                  if (paginationModel.page !== 0) setPaginationModel(p => ({ ...p, page: 0 }));
                }}
              >
                <MenuItem value="">All Departments</MenuItem>
                {departmentOptions.map((dep) => (
                  <MenuItem key={dep} value={dep}>{dep}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: { xs: '100%', sm: 260 } }}>
              <InputLabel>Position</InputLabel>
              <Select
                value={positionIdFilter}
                label="Position"
                onChange={(e) => {
                  setPositionIdFilter(e.target.value as string);
                  if (paginationModel.page !== 0) setPaginationModel(p => ({ ...p, page: 0 }));
                }}
                renderValue={(val) => {
                  if (!val) return 'All Positions';
                  const found = positionOptions.find((p: Position) => p.id === val);
                  return found?.title || String(val);
                }}
              >
                <MenuItem value="">All Positions</MenuItem>
                {positionOptions.map((p: Position) => (
                  <MenuItem key={p.id} value={p.id}>{p.title}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: { xs: '100%', sm: 250 } }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as ApplicationStatus | '');
                  if (paginationModel.page !== 0) setPaginationModel(p => ({ ...p, page: 0 }));
                }}
                label="Status"
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value={ApplicationStatus.NEW}>New</MenuItem>
                <MenuItem value={ApplicationStatus.IN_REVIEW}>In Review</MenuItem>
                <MenuItem value={ApplicationStatus.FORWARDED}>Forwarded</MenuItem>
                <MenuItem value={ApplicationStatus.MEETING_SCHEDULED}>Meeting Scheduled</MenuItem>
                <MenuItem value={ApplicationStatus.ACCEPTED}>Accepted</MenuItem>
                <MenuItem value={ApplicationStatus.REJECTED}>Rejected</MenuItem>
                <MenuItem value={ApplicationStatus.WITHDRAWN}>Withdrawn</MenuItem>
                <MenuItem value={ApplicationStatus.ARCHIVED}>Archived</MenuItem>
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
            Failed to load applications.
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
            Forward to Reviewer
          </MenuItem>
          <MenuItem onClick={() => {
            if (selectedApplication) {
              handleStatusChange(selectedApplication.id, ApplicationStatus.IN_REVIEW);
            }
            handleMenuClose();
          }}>
            Mark as In Review
          </MenuItem>
          <MenuItem onClick={() => {
            if (selectedApplication) {
              handleStatusChange(selectedApplication.id, ApplicationStatus.ACCEPTED);
            }
            handleMenuClose();
          }}>
            Accept Application
          </MenuItem>
          <MenuItem onClick={() => {
            if (selectedApplication) {
              handleStatusChange(selectedApplication.id, ApplicationStatus.REJECTED);
            }
            handleMenuClose();
          }}>
            Reject Application
          </MenuItem>
        </Menu>

        {/* Comment Dialog */}
        <Dialog
          open={commentDialog.open}
          onClose={() => setCommentDialog({ open: false, applicationId: null, comment: '' })}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Add Comment</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Enter your comment..."
              value={commentDialog.comment}
              onChange={(e) => setCommentDialog({ ...commentDialog, comment: e.target.value })}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCommentDialog({ open: false, applicationId: null, comment: '' })}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleAddComment}>
              Add Comment
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
          <DialogTitle>Add Rating</DialogTitle>
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
              Cancel
            </Button>
            <Button variant="contained" onClick={handleAddRating} disabled={isCompanyManager || !ratingDialog.score}>
              Add Rating
            </Button>
          </DialogActions>
        </Dialog>
    </PageContainer>
  );
};

export default ApplicationList;
