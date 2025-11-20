import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Grid,
  Divider,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress
} from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  AttachFile as FileIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Comment as CommentIcon,
  Star as StarIcon,
  Schedule as ScheduleIcon,
  Save as SaveIcon,
  ForwardToInbox as ForwardIcon,
  Person as PersonIcon,
  Fingerprint as IdIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { applicationService } from '@/services/cv-sharing';
import { ApplicationDetail as ApplicationDetailType, ApplicationStatus, CreateMeetingRequest, MeetingProvider, MeetingStatus } from '@/types/cv-sharing';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useKeycloak } from '@/hooks/useKeycloak';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

const statusOptions: ApplicationStatus[] = [
  ApplicationStatus.NEW,
  ApplicationStatus.IN_REVIEW,
  ApplicationStatus.FORWARDED,
  ApplicationStatus.MEETING_SCHEDULED,
  ApplicationStatus.ACCEPTED,
  ApplicationStatus.REJECTED,
  ApplicationStatus.WITHDRAWN,
  ApplicationStatus.ARCHIVED
];

const statusColor = (status: ApplicationStatus): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (status) {
    case ApplicationStatus.NEW:
      return 'info';
    case ApplicationStatus.IN_REVIEW:
      return 'primary';
    case ApplicationStatus.FORWARDED:
      return 'secondary';
    case ApplicationStatus.MEETING_SCHEDULED:
      return 'warning';
    case ApplicationStatus.ACCEPTED:
      return 'success';
    case ApplicationStatus.REJECTED:
    case ApplicationStatus.WITHDRAWN:
      return 'error';
    case ApplicationStatus.ARCHIVED:
    default:
      return 'default';
  }
};

const ApplicationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { hasRole, tokenParsed } = useKeycloak();
  const isCompanyManager = hasRole('COMPANY_MANAGER');
  const currentUserId = tokenParsed?.sub;
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();
  const { data: detail, isPending, isError } = useQuery<
    ApplicationDetailType,
    Error,
    ApplicationDetailType,
    [string, string | undefined]
  >({
    queryKey: ['application', id],
    queryFn: () => applicationService.getApplicationById(id!),
    enabled: !!id
  });
  const [newStatus, setNewStatus] = useState<ApplicationStatus | ''>('');
  const [commentText, setCommentText] = useState('');
  const [ratingScore, setRatingScore] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [commentSaving, setCommentSaving] = useState(false);
  const [ratingSaving, setRatingSaving] = useState(false);
  const [editingRating, setEditingRating] = useState<string | null>(null);
  const [editScore, setEditScore] = useState<number | null>(null);
  const [meetingSaving, setMeetingSaving] = useState(false);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [meetingOpen, setMeetingOpen] = useState(false);
  const [meeting, setMeeting] = useState<Partial<CreateMeetingRequest>>({
    title: '',
    startTime: '',
    durationMinutes: 30,
    participants: [],
    provider: MeetingProvider.TEAMS,
    meetingLink: ''
  });
  const [deleteFileDialogOpen, setDeleteFileDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const [isDeletingFile, setIsDeletingFile] = useState(false);

  useEffect(() => {
    if (detail) setNewStatus(detail.status);
  }, [detail?.id]);
  useEffect(() => {
    if (isError) {
      enqueueSnackbar('Failed to load application', { variant: 'error' });
      navigate('/cv-sharing/applications');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError]);

  const handleStatusChange = async () => {
    if (!detail || !newStatus) return;
    try {
      setSaving(true);
      await applicationService.updateApplicationStatus(detail.id, { status: newStatus });
      enqueueSnackbar('Status updated', { variant: 'success' });
      // Invalidate both detail and list caches
      await queryClient.invalidateQueries({ queryKey: ['application', id] });
      await queryClient.invalidateQueries({ queryKey: ['applications'] });
    } catch (error) {
      enqueueSnackbar('Failed to update status', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelMeeting = async (meetingId: string) => {
    if (!detail) return;
    if (!window.confirm('Cancel this meeting?')) return;
    try {
      await applicationService.updateMeeting(detail.id, meetingId, { status: MeetingStatus.CANCELLED });
      enqueueSnackbar('Meeting cancelled', { variant: 'success' });
      await queryClient.invalidateQueries({ queryKey: ['application', id] });
    } catch (error) {
      enqueueSnackbar('Failed to cancel meeting', { variant: 'error' });
    }
  };

  const handleDeleteFileClick = (fileId: string) => {
    setFileToDelete(fileId);
    setDeleteFileDialogOpen(true);
  };

  const handleDeleteFile = async () => {
    if (!detail || !fileToDelete) return;
    try {
      setIsDeletingFile(true);
      await applicationService.deleteFile(detail.id, fileToDelete);
      enqueueSnackbar('File deleted', { variant: 'success' });
      await queryClient.invalidateQueries({ queryKey: ['application', id] });
      setDeleteFileDialogOpen(false);
      setFileToDelete(null);
    } catch (error) {
      enqueueSnackbar('Failed to delete file', { variant: 'error' });
    } finally {
      setIsDeletingFile(false);
    }
  };

  const handleAddComment = async () => {
    if (!detail || !commentText.trim()) return;
    try {
      if (commentSaving) return;
      setCommentSaving(true);
      await applicationService.addComment(detail.id, { content: commentText, isInternal: true });
      setCommentText('');
      enqueueSnackbar('Comment added', { variant: 'success' });
      await queryClient.invalidateQueries({ queryKey: ['application', id] });
    } catch (error) {
      enqueueSnackbar('Failed to add comment', { variant: 'error' });
    } finally {
      setCommentSaving(false);
    }
  };

  const handleAddRating = async () => {
    if (!detail || !ratingScore) return;
    try {
      if (ratingSaving) return;
      setRatingSaving(true);
      await applicationService.addRating(detail.id, { score: ratingScore });
      setRatingScore(null);
      enqueueSnackbar('Rating added', { variant: 'success' });
      await queryClient.invalidateQueries({ queryKey: ['application', id] });
    } catch (error) {
      enqueueSnackbar('Failed to add rating', { variant: 'error' });
    } finally {
      setRatingSaving(false);
    }
  };

  const onFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const arr = Array.from(files);
    const valid = arr.filter(f => f.size <= 10 * 1024 * 1024);
    if (valid.length !== arr.length) {
      enqueueSnackbar('Some files exceed 10MB limit and were skipped', { variant: 'error' });
    }
    setFilesToUpload(valid);
  };

  const handleUploadFiles = async () => {
    if (!detail || filesToUpload.length === 0) return;
    try {
      setUploading(true);
      await applicationService.uploadFiles(detail.id, filesToUpload);
      setFilesToUpload([]);
      enqueueSnackbar('Files uploaded', { variant: 'success' });
      await queryClient.invalidateQueries({ queryKey: ['application', id] });
    } catch (error) {
      enqueueSnackbar('Failed to upload files', { variant: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (fileId: string, fileName: string) => {
    if (!detail) return;
    try {
      const blob = await applicationService.downloadFile(detail.id, fileId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      enqueueSnackbar('Failed to download file', { variant: 'error' });
    }
  };

  const openMeetingDialog = () => setMeetingOpen(true);
  const closeMeetingDialog = () => setMeetingOpen(false);

  const handleScheduleMeeting = async () => {
    if (!detail || !meeting.title || !meeting.startTime || !meeting.durationMinutes) return;
    try {
      if (meetingSaving) return;
      setMeetingSaving(true);
      await applicationService.scheduleMeeting(detail.id, meeting as CreateMeetingRequest);
      enqueueSnackbar('Meeting scheduled', { variant: 'success' });
      setMeeting({ title: '', startTime: '', durationMinutes: 30, participants: [] });
      closeMeetingDialog();
      await queryClient.invalidateQueries({ queryKey: ['application', id] });
    } catch (error) {
      enqueueSnackbar('Failed to schedule meeting', { variant: 'error' });
    } finally {
      setMeetingSaving(false);
    }
  };

  if (isPending || !detail) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar>
                  {detail.firstName[0]}{detail.lastName[0]}
                </Avatar>
                <Box>
                  <Typography variant="h5">
                    {detail.firstName} {detail.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Applying for: {detail.positionTitle || detail.positionId}
                  </Typography>
                </Box>
              </Box>
              <Chip label={detail.status.replace('_', ' ')} color={statusColor(detail.status)} />
            </Box>
          </Grid>

          <Grid item xs={12} md={8}>
            <Typography variant="h6">Contact</Typography>
            <Divider sx={{ mb: 2 }} />
            <List>
              <ListItem>
                <ListItemIcon><EmailIcon /></ListItemIcon>
                <ListItemText primary={detail.email} />
              </ListItem>
              {detail.phone && (
                <ListItem>
                  <ListItemIcon><PhoneIcon /></ListItemIcon>
                  <ListItemText primary={detail.phone} />
                </ListItem>
              )}
              {detail.tckn && (
                <ListItem>
                  <ListItemIcon><IdIcon /></ListItemIcon>
                  <ListItemText primary={`TCKN: ${detail.tckn}`} />
                </ListItem>
              )}
              {detail.availableStartDate && (
                <ListItem>
                  <ListItemIcon><CalendarIcon /></ListItemIcon>
                  <ListItemText primary={`Available from ${new Date(detail.availableStartDate).toLocaleDateString()}`} />
                </ListItem>
              )}
            </List>

            <Typography variant="h6" sx={{ mt: 3 }}>Files</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box>
              <input
                id="upload-files"
                type="file"
                multiple
                style={{ display: 'none' }}
                onChange={onFilesSelected}
                accept=".pdf,.doc,.docx"
              />
              <label htmlFor="upload-files">
                <Button variant="outlined" component="span" startIcon={<FileIcon />}>Select Files</Button>
              </label>
              <Button
                sx={{ ml: 2 }}
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleUploadFiles}
                disabled={filesToUpload.length === 0 || uploading}
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </Box>
            {detail.files && detail.files.length > 0 && (
              <List>
                {detail.files.map(f => (
                  <ListItem key={f.id}
                    secondaryAction={
                      <Box>
                        <IconButton edge="end" onClick={() => handleDownload(f.id, f.fileName)} aria-label="download">
                          <DownloadIcon />
                        </IconButton>
                        <IconButton edge="end" onClick={() => handleDeleteFileClick(f.id)} aria-label="delete" sx={{ ml: 1 }}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemIcon><FileIcon /></ListItemIcon>
                    <ListItemText primary={f.fileName} secondary={`${(f.fileSize / 1024).toFixed(0)} KB`} />
                  </ListItem>
                ))}
              </List>
            )}

            <Typography variant="h6" sx={{ mt: 3 }}>Meetings</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Button startIcon={<ScheduleIcon />} variant="outlined" onClick={openMeetingDialog}>Schedule Meeting</Button>
              <Button startIcon={<CalendarIcon />} variant="outlined" onClick={() => navigate(`/applications/${detail.id}/meetings`)}>Open Scheduler</Button>
            </Box>
            {detail.meetings && detail.meetings.length > 0 && (
              <List>
                {detail.meetings.map(m => (
                  <ListItem key={m.id}
                    secondaryAction={
                      <Button size="small" color="warning" onClick={() => handleCancelMeeting(m.id)} disabled={m.status === 'CANCELLED'}>
                        {m.status === 'CANCELLED' ? 'Cancelled' : 'Cancel Meeting'}
                      </Button>
                    }
                  >
                    <ListItemIcon><CalendarIcon /></ListItemIcon>
                    <ListItemText
                      primary={`${m.title} • ${new Date(m.startTime).toLocaleString()} (${m.durationMinutes}m)`}
                      secondary={m.location || m.meetingLink}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="h6">Status</Typography>
            <Divider sx={{ mb: 2 }} />
            {/* Status selector */}
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select value={newStatus} label="Status" onChange={(e) => setNewStatus(e.target.value as ApplicationStatus)}>
                {statusOptions.map(s => (
                  <MenuItem key={s} value={s}>{s.replace('_', ' ')}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button sx={{ mt: 2 }} fullWidth variant="contained" onClick={handleStatusChange} disabled={saving}>
              Update Status
            </Button>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              {detail.poolCvId && (
                <Button 
                  size="small" 
                  startIcon={<PersonIcon />} 
                  onClick={() => navigate(`/cv-sharing/pool-cvs/${detail.poolCvId}`)}
                  variant="outlined"
                >
                  View Applicant Details
                </Button>
              )}
              <Button size="small" startIcon={<ForwardIcon />} onClick={() => navigate(`/cv-sharing/applications/${detail.id}/forward`)}>Forward</Button>
            </Box>

            <Typography variant="h6" sx={{ mt: 3 }}>Ratings</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Rating value={ratingScore || 0} onChange={(_, v) => setRatingScore(v)} />
              <Button size="small" variant="outlined" startIcon={<StarIcon />} onClick={handleAddRating} disabled={isCompanyManager || !ratingScore || ratingSaving}>Rate</Button>
            </Box>
            {detail.ratings && detail.ratings.length > 0 && (
              <List>
                {detail.ratings.map(r => {
                  const isOwnRating = currentUserId === r.userId;
                  
                  const handleEditRating = () => {
                    setEditingRating(r.id);
                    setEditScore(r.score);
                  };
                  
                  const handleSaveRating = async () => {
                    if (!editScore || editingRating !== r.id) return;
                    try {
                      setRatingSaving(true);
                      await applicationService.addRating(detail.id, { score: editScore });
                      enqueueSnackbar('Rating updated', { variant: 'success' });
                      setEditingRating(null);
                      setEditScore(null);
                      await queryClient.invalidateQueries({ queryKey: ['application', id] });
                    } catch (e) {
                      enqueueSnackbar('Failed to update rating', { variant: 'error' });
                    } finally {
                      setRatingSaving(false);
                    }
                  };
                  
                  const handleCancelEdit = () => {
                    setEditingRating(null);
                    setEditScore(null);
                  };
                  
                  return (
                    <ListItem 
                      key={r.id}
                      secondaryAction={
                        isOwnRating && !isCompanyManager && (
                          editingRating === r.id ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Rating 
                                value={editScore || 0} 
                                onChange={(_, v) => setEditScore(v)} 
                                size="small"
                              />
                              <IconButton 
                                size="small" 
                                onClick={handleSaveRating} 
                                disabled={ratingSaving || !editScore}
                                color="primary"
                              >
                                <SaveIcon />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                onClick={handleCancelEdit}
                                disabled={ratingSaving}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          ) : (
                            <IconButton 
                              size="small" 
                              onClick={handleEditRating}
                              disabled={isCompanyManager || ratingSaving}
                            >
                              <EditIcon />
                            </IconButton>
                          )
                        )
                      }
                    >
                      <ListItemIcon><StarIcon /></ListItemIcon>
                      <ListItemText 
                        primary={editingRating === r.id ? 'Editing...' : `${r.score}/5 by ${r.userName || r.userId}`} 
                        secondary={new Date(r.createdAt).toLocaleString()} 
                      />
                    </ListItem>
                  );
                })}
              </List>
            )}

            {detail.recentComments && detail.recentComments.length > 0 && (
              <>
                <Typography variant="h6" sx={{ mt: 3 }}>Recent Comments</Typography>
                <Divider sx={{ mb: 2 }} />
                <List>
                  {detail.recentComments.map(c => (
                    <ListItem key={c.id}>
                      <ListItemIcon><CommentIcon /></ListItemIcon>
                      <ListItemText primary={c.content} secondary={`${c.userName || c.userId} • ${new Date(c.createdAt).toLocaleString()}`} />
                    </ListItem>
                  ))}
                </List>
              </>
            )}

            <Typography variant="h6" sx={{ mt: 3 }}>Comments</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField fullWidth size="small" placeholder="Add a comment..." value={commentText} onChange={(e) => setCommentText(e.target.value)} />
              <Button variant="outlined" startIcon={<CommentIcon />} onClick={handleAddComment} disabled={commentSaving || !commentText.trim()}>
                Add
              </Button>
            </Box>
            {detail.comments && detail.comments.length > 0 && (
              <List>
                {detail.comments.map(c => (
                  <ListItem key={c.id}>
                    <ListItemIcon><CommentIcon /></ListItemIcon>
                    <ListItemText primary={c.content} secondary={`${c.userName || c.userId} • ${new Date(c.createdAt).toLocaleString()}`} />
                  </ListItem>
                ))}
              </List>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* Meeting Dialog */}
      <Dialog open={meetingOpen} onClose={closeMeetingDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Schedule Meeting</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            sx={{ mt: 1 }}
            value={meeting.title || ''}
            onChange={(e) => setMeeting(m => ({ ...m, title: e.target.value }))}
          />
          <FormControl fullWidth size="small" sx={{ mt: 2 }}>
            <InputLabel>Provider</InputLabel>
            <Select
              label="Provider"
              value={meeting.provider || MeetingProvider.TEAMS}
              onChange={(e) => setMeeting(m => ({ ...m, provider: e.target.value as MeetingProvider }))}
            >
              <MenuItem value={MeetingProvider.TEAMS}>TEAMS</MenuItem>
              <MenuItem value={MeetingProvider.ZOOM}>ZOOM</MenuItem>
              <MenuItem value={MeetingProvider.MEET}>MEET</MenuItem>
              <MenuItem value={MeetingProvider.OTHER}>OTHER</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            type="datetime-local"
            label="Start Time"
            InputLabelProps={{ shrink: true }}
            sx={{ mt: 2 }}
            value={meeting.startTime || ''}
            onChange={(e) => setMeeting(m => ({ ...m, startTime: e.target.value }))}
          />
          <TextField
            fullWidth
            type="number"
            label="Duration (minutes)"
            sx={{ mt: 2 }}
            InputProps={{ inputProps: { min: 15 } }}
            value={meeting.durationMinutes || 30}
            onChange={(e) => setMeeting(m => ({ ...m, durationMinutes: Number(e.target.value) }))}
          />
          <TextField
            fullWidth
            label="Meeting Link"
            sx={{ mt: 2 }}
            value={meeting.meetingLink || ''}
            onChange={(e) => setMeeting(m => ({ ...m, meetingLink: e.target.value }))}
          />
          <TextField
            fullWidth
            label="Location or Link"
            sx={{ mt: 2 }}
            value={meeting.location || ''}
            onChange={(e) => setMeeting(m => ({ ...m, location: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeMeetingDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleScheduleMeeting} disabled={meetingSaving}>Schedule</Button>
        </DialogActions>
      </Dialog>

      {/* Delete File Confirmation Dialog */}
      <ConfirmDialog
        open={deleteFileDialogOpen}
        title="Delete File"
        description="Are you sure you want to delete this file? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmColor="error"
        loading={isDeletingFile}
        onClose={() => {
          setDeleteFileDialogOpen(false);
          setFileToDelete(null);
        }}
        onConfirm={handleDeleteFile}
      />
    </Box>
  );
};

export default ApplicationDetail;

