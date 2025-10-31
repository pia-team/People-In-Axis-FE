import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
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
  Badge
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Comment as CommentIcon,
  Star as StarIcon,
  Forward as ForwardIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { applicationService } from '@/services/cv-sharing';
import { Application, ApplicationStatus } from '@/types/cv-sharing';

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
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'ALL'>('ALL');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
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

  useEffect(() => {
    loadApplications();
  }, [statusFilter]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== 'ALL' ? { status: statusFilter } : {};
      const data = await applicationService.getApplications(params);
      setApplications(data.content || []);
    } catch (error) {
      enqueueSnackbar('Failed to load applications', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredApplications = applications.filter(app =>
    app.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.positionTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      loadApplications();
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
      loadApplications();
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
      loadApplications();
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
      width: 250,
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
      width: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {params.row.positionTitle || '-'}
        </Typography>
      )
    },
    {
      field: 'appliedAt',
      headerName: 'Applied Date',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {new Date(params.row.appliedAt).toLocaleDateString()}
        </Typography>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
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
      width: 120,
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
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Badge badgeContent={params.row.commentCount} color="primary">
          <CommentIcon fontSize="small" />
        </Badge>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Tooltip title="View">
            <IconButton
              size="small"
              onClick={() => navigate(`/applications/${params.row.id}`)}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Add Comment">
            <IconButton
              size="small"
              onClick={() => setCommentDialog({
                open: true,
                applicationId: params.row.id,
                comment: ''
              })}
            >
              <CommentIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Add Rating">
            <IconButton
              size="small"
              onClick={() => setRatingDialog({
                open: true,
                applicationId: params.row.id,
                score: 0
              })}
            >
              <StarIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <IconButton
            size="small"
            onClick={(e) => handleMenuOpen(e, params.row)}
          >
            <MoreIcon fontSize="small" />
          </IconButton>
        </Box>
      )
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            Applications
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              size="small"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | 'ALL')}
                label="Status"
              >
                <MenuItem value="ALL">All Status</MenuItem>
                <MenuItem value={ApplicationStatus.NEW}>New</MenuItem>
                <MenuItem value={ApplicationStatus.IN_REVIEW}>In Review</MenuItem>
                <MenuItem value={ApplicationStatus.FORWARDED}>Forwarded</MenuItem>
                <MenuItem value={ApplicationStatus.MEETING_SCHEDULED}>Meeting Scheduled</MenuItem>
                <MenuItem value={ApplicationStatus.ACCEPTED}>Accepted</MenuItem>
                <MenuItem value={ApplicationStatus.REJECTED}>Rejected</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        <DataGrid
          rows={filteredApplications}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 }
            }
          }}
          pageSizeOptions={[10, 25, 50]}
          loading={loading}
          autoHeight
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell:focus': {
              outline: 'none'
            }
          }}
        />

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => {
            if (selectedApplication) {
              navigate(`/applications/${selectedApplication.id}/forward`);
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
            <Button variant="contained" onClick={handleAddRating} disabled={!ratingDialog.score}>
              Add Rating
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default ApplicationList;
