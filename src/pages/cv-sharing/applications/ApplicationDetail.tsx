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
  LinearProgress,
  useMediaQuery,
  useTheme
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
  Fingerprint as IdIcon,
  Edit as EditIcon,
  Undo as UndoIcon,
  Work as WorkIcon,
  AccountCircle as AccountCircleIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { applicationService, poolCVService } from '@/services/cv-sharing';
import { ApplicationDetail as ApplicationDetailType, ApplicationStatus, CreateMeetingRequest, MeetingProvider, MeetingStatus } from '@/types/cv-sharing';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useKeycloak } from '@/hooks/useKeycloak';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { hasRole, tokenParsed } = useKeycloak();
  const isCompanyManager = hasRole('COMPANY_MANAGER');
  const isHR = hasRole('HUMAN_RESOURCES');
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
  const [cancelMeetingDialogOpen, setCancelMeetingDialogOpen] = useState(false);
  const [meetingToCancel, setMeetingToCancel] = useState<string | null>(null);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  useEffect(() => {
    if (detail) setNewStatus(detail.status);
  }, [detail?.id]);
  useEffect(() => {
    if (isError) {
      enqueueSnackbar(t('error.loadFailed', { item: t('application.title').toLowerCase() }), { variant: 'error' });
      navigate('/cv-sharing/applications');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError]);

  const handleStatusChange = async () => {
    if (!detail || !newStatus) return;
    try {
      setSaving(true);
      await applicationService.updateApplicationStatus(detail.id, { status: newStatus });
      enqueueSnackbar(t('success.updated'), { variant: 'success' });
      // Invalidate both detail and list caches
      await queryClient.invalidateQueries({ queryKey: ['application', id] });
      await queryClient.invalidateQueries({ queryKey: ['applications'] });
    } catch (error) {
      enqueueSnackbar(t('error.updateFailed'), { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelMeetingClick = (meetingId: string) => {
    setMeetingToCancel(meetingId);
    setCancelMeetingDialogOpen(true);
  };

  const handleCancelMeeting = async () => {
    if (!detail || !meetingToCancel) return;
    try {
      await applicationService.updateMeeting(detail.id, meetingToCancel, { status: MeetingStatus.CANCELLED });
      enqueueSnackbar(t('meeting.meetingCancelled'), { variant: 'success' });
      await queryClient.invalidateQueries({ queryKey: ['application', id] });
      setCancelMeetingDialogOpen(false);
      setMeetingToCancel(null);
    } catch (error) {
      enqueueSnackbar(t('error.updateFailed'), { variant: 'error' });
    }
  };

  const handleWithdrawApplication = async () => {
    if (!detail) return;
    try {
      setIsWithdrawing(true);

      // Use different endpoint based on role
      if (isCompanyManager) {
        // Company Manager uses the special endpoint that validates ownership
        await applicationService.withdrawApplicationByManager(detail.id);
      } else {
        // Other roles use the standard withdraw
        await applicationService.withdrawApplication(detail.id);
      }

      // If there's a linked pool CV, reactivate it so it can be matched again
      if (detail.poolCvId) {
        try {
          await poolCVService.togglePoolCVStatus(detail.poolCvId, true);
        } catch (poolCvError) {
          console.warn('Failed to reactivate pool CV:', poolCvError);
          // Don't fail the withdraw if pool CV reactivation fails
        }
      }

      enqueueSnackbar(t('application.applicationWithdrawn'), { variant: 'success' });
      setWithdrawDialogOpen(false);
      // Refetch to update the UI with new status
      await queryClient.refetchQueries({ queryKey: ['application', id] });
      await queryClient.invalidateQueries({ queryKey: ['applications'] });
      await queryClient.invalidateQueries({ queryKey: ['pool-cvs'] });
      // Also invalidate position matches since the match is deleted on withdraw
      await queryClient.invalidateQueries({ queryKey: ['position-matches'] });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || t('application.failedToWithdraw');
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleRejectApplication = async () => {
    if (!detail) return;
    try {
      setIsRejecting(true);
      await applicationService.rejectApplication(detail.id);

      enqueueSnackbar(t('application.applicationRejected'), { variant: 'success' });
      setRejectDialogOpen(false);
      // Refetch to update the UI with new status
      await queryClient.refetchQueries({ queryKey: ['application', id] });
      await queryClient.invalidateQueries({ queryKey: ['applications'] });
      await queryClient.invalidateQueries({ queryKey: ['pool-cvs'] });
      // Also invalidate position matches since the match is deleted on reject
      await queryClient.invalidateQueries({ queryKey: ['position-matches'] });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || t('application.failedToReject');
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setIsRejecting(false);
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
      enqueueSnackbar(t('application.fileDeletedShort'), { variant: 'success' });
      await queryClient.invalidateQueries({ queryKey: ['application', id] });
      setDeleteFileDialogOpen(false);
      setFileToDelete(null);
    } catch (error) {
      enqueueSnackbar(t('application.failedToDeleteFile'), { variant: 'error' });
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
      enqueueSnackbar(t('application.commentAddedShort'), { variant: 'success' });
      await queryClient.invalidateQueries({ queryKey: ['application', id] });
    } catch (error) {
      enqueueSnackbar(t('application.failedToAddComment'), { variant: 'error' });
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
      enqueueSnackbar(t('application.ratingAdded'), { variant: 'success' });
      await queryClient.invalidateQueries({ queryKey: ['application', id] });
    } catch (error) {
      enqueueSnackbar(t('error.createFailed'), { variant: 'error' });
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
      enqueueSnackbar(t('error.fileTooLarge'), { variant: 'error' });
    }
    setFilesToUpload(valid);
  };

  const handleUploadFiles = async () => {
    if (!detail || filesToUpload.length === 0) return;
    try {
      setUploading(true);
      await applicationService.uploadFiles(detail.id, filesToUpload);
      setFilesToUpload([]);
      enqueueSnackbar(t('application.fileUploaded'), { variant: 'success' });
      await queryClient.invalidateQueries({ queryKey: ['application', id] });
    } catch (error) {
      enqueueSnackbar(t('error.uploadFailed'), { variant: 'error' });
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
      enqueueSnackbar(t('error.downloadFailed'), { variant: 'error' });
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
      enqueueSnackbar(t('application.meetingScheduledSuccess'), { variant: 'success' });
      setMeeting({ title: '', startTime: '', durationMinutes: 30, participants: [] });
      closeMeetingDialog();
      await queryClient.invalidateQueries({ queryKey: ['application', id] });
    } catch (error) {
      enqueueSnackbar(t('error.createFailed'), { variant: 'error' });
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
            {/* Top action buttons */}
            <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {/* HR Reject Button - Only for HR and not already REJECTED/WITHDRAWN/ACCEPTED */}
              {isHR &&
               detail.status !== ApplicationStatus.REJECTED &&
               detail.status !== ApplicationStatus.WITHDRAWN &&
               detail.status !== ApplicationStatus.ACCEPTED && (
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setRejectDialogOpen(true)}
                  size="small"
                >
                  {t('application.rejectApplication')}
                </Button>
              )}

              {/* Company Manager Withdraw Button - Only for Company Manager and their own applications */}
              {isCompanyManager &&
               detail.status !== ApplicationStatus.WITHDRAWN &&
               detail.status !== ApplicationStatus.REJECTED &&
               detail.status !== ApplicationStatus.ACCEPTED && (
                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={<UndoIcon />}
                  onClick={() => setWithdrawDialogOpen(true)}
                  size="small"
                >
                  {t('application.withdrawApplication')}
                </Button>
              )}

              {/* General Withdraw Button - For non-Company Manager roles */}
              {!isCompanyManager &&
               detail.status !== ApplicationStatus.WITHDRAWN &&
               detail.status !== ApplicationStatus.REJECTED &&
               detail.status !== ApplicationStatus.ACCEPTED && (
                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={<UndoIcon />}
                  onClick={() => setWithdrawDialogOpen(true)}
                  size="small"
                >
                  {t('application.withdrawApplication')}
                </Button>
              )}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                <Avatar sx={{ width: 56, height: 56 }}>
                  {detail.firstName[0]}{detail.lastName[0]}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" gutterBottom>
                    {detail.firstName} {detail.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {t('application.applyingFor')}: {detail.positionTitle || detail.positionId}
                  </Typography>
                  {detail.poolCvId && (
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      startIcon={<AccountCircleIcon />}
                      onClick={() => navigate(`/cv-sharing/pool-cvs/${detail.poolCvId}`)}
                      sx={{ mt: 1 }}
                    >
                      {t('application.viewApplicantProfile')}
                    </Button>
                  )}
                </Box>
              </Box>
              <Chip label={t(`application.${detail.status?.toLowerCase().replace(/_/g, '') || ''}`) || detail.status.replace('_', ' ')} color={statusColor(detail.status)} />
            </Box>
          </Grid>

          <Grid item xs={12} md={8}>
            <Typography variant="h6">{t('application.contact')}</Typography>
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
                  <ListItemText primary={`${t('application.tckn')}: ${detail.tckn}`} />
                </ListItem>
              )}
              {detail.availableStartDate && (
                <ListItem>
                  <ListItemIcon><CalendarIcon /></ListItemIcon>
                  <ListItemText primary={`${t('application.availableFrom')} ${new Date(detail.availableStartDate).toLocaleDateString()}`} />
                </ListItem>
              )}
            </List>

            <Typography variant="h6" sx={{ mt: 3 }}>{t('application.files')}</Typography>
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
                <Button variant="outlined" component="span" startIcon={<FileIcon />}>{t('application.selectFile')}</Button>
              </label>
              <Button
                sx={{ ml: 2 }}
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleUploadFiles}
                disabled={filesToUpload.length === 0 || uploading}
              >
                {uploading ? t('common.uploading') : t('common.upload')}
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
                        {!isCompanyManager && (
                          <IconButton edge="end" onClick={() => handleDeleteFileClick(f.id)} aria-label="delete" sx={{ ml: 1 }}>
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Box>
                    }
                  >
                    <ListItemIcon><FileIcon /></ListItemIcon>
                    <ListItemText primary={f.fileName} secondary={`${(f.fileSize / 1024).toFixed(0)} KB`} />
                  </ListItem>
                ))}
              </List>
            )}

            <Typography variant="h6" sx={{ mt: 3 }}>{t('application.meetings')}</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Button startIcon={<ScheduleIcon />} variant="outlined" onClick={openMeetingDialog} disabled={isCompanyManager}>{t('application.scheduleMeeting')}</Button>
              <Button startIcon={<CalendarIcon />} variant="outlined" onClick={() => navigate(`/applications/${detail.id}/meetings`)} disabled={isCompanyManager}>{t('application.openScheduler')}</Button>
            </Box>
            {detail.meetings && detail.meetings.length > 0 && (
              <List>
                {detail.meetings.map(m => (
                  <ListItem key={m.id}
                    secondaryAction={
                      <Button size="small" color="warning" onClick={() => handleCancelMeetingClick(m.id)} disabled={m.status === 'CANCELLED' || isCompanyManager}>
                        {m.status === 'CANCELLED' ? t('meeting.cancelled') : t('meeting.cancelMeeting')}
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
            <Typography variant="h6">{t('common.status')}</Typography>
            <Divider sx={{ mb: 2 }} />
            {/* Status selector */}
            {!isCompanyManager && (
              <>
                <FormControl fullWidth size="small">
                  <InputLabel>{t('common.status')}</InputLabel>
                  <Select
                value={newStatus}
                label={t('common.status')}
                onChange={(e) => setNewStatus(e.target.value as ApplicationStatus)}
                renderValue={(value) => {
                  // Map status enum values to translation keys for display
                  const statusMap: Record<ApplicationStatus, string> = {
                    [ApplicationStatus.NEW]: t('application.new'),
                    [ApplicationStatus.IN_REVIEW]: t('application.inReview'),
                    [ApplicationStatus.FORWARDED]: t('application.forwarded'),
                    [ApplicationStatus.MEETING_SCHEDULED]: t('application.meetingScheduled'),
                    [ApplicationStatus.ACCEPTED]: t('application.accepted'),
                    [ApplicationStatus.REJECTED]: t('application.rejected'),
                    [ApplicationStatus.WITHDRAWN]: t('application.withdrawn'),
                    [ApplicationStatus.ARCHIVED]: t('application.archived'),
                  };
                  return statusMap[value as ApplicationStatus] || (value as string).replace(/_/g, ' ');
                }}
              >
                    {statusOptions.map(s => {
                  // Map status enum values to translation keys
                      const statusMap: Record<ApplicationStatus, string> = {
                    [ApplicationStatus.NEW]: t('application.new'),
                    [ApplicationStatus.IN_REVIEW]: t('application.inReview'),
                    [ApplicationStatus.FORWARDED]: t('application.forwarded'),
                    [ApplicationStatus.MEETING_SCHEDULED]: t('application.meetingScheduled'),
                    [ApplicationStatus.ACCEPTED]: t('application.accepted'),
                    [ApplicationStatus.REJECTED]: t('application.rejected'),
                    [ApplicationStatus.WITHDRAWN]: t('application.withdrawn'),
                    [ApplicationStatus.ARCHIVED]: t('application.archived'),
                  };
                  const label = statusMap[s] || s.replace(/_/g, ' ');
                      return (
                        <MenuItem key={s} value={s}>{label}</MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
                <Button sx={{ mt: 2 }} fullWidth variant="contained" onClick={handleStatusChange} disabled={saving}>
                  {t('application.updateStatus')}
                </Button>
              </>
            )}
            {isCompanyManager && (
              <Typography variant="body2" color="text.secondary">
                {t(`application.${detail.status?.toLowerCase().replace(/_/g, '') || ''}`) || detail.status.replace('_', ' ')}
              </Typography>
            )}
            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              {detail.poolCvId && (
                <Button
                  size="small"
                  startIcon={<PersonIcon />}
                  onClick={() => navigate(`/cv-sharing/pool-cvs/${detail.poolCvId}`)}
                  variant="outlined"
                >
                  {t('application.viewApplicantDetails')}
                </Button>
              )}
              <Button
                size="small"
                startIcon={<WorkIcon />}
                onClick={() => navigate(`/cv-sharing/positions/${detail.positionId}`)}
                variant="outlined"
              >
                {t('application.viewPositionDetails')}
              </Button>
              <Button size="small" startIcon={<ForwardIcon />} onClick={() => navigate(`/cv-sharing/applications/${detail.id}/forward`)} disabled={isCompanyManager}>{t('application.forwardToReviewer')}</Button>
            </Box>

            <Typography variant="h6" sx={{ mt: 3 }}>{t('application.ratings')}</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Rating value={ratingScore || 0} onChange={(_, v) => setRatingScore(v)} disabled={isCompanyManager} />
              <Button size="small" variant="outlined" startIcon={<StarIcon />} onClick={handleAddRating} disabled={isCompanyManager || !ratingScore || ratingSaving}>{t('application.rate')}</Button>
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
                      enqueueSnackbar(t('application.ratingUpdated'), { variant: 'success' });
                      setEditingRating(null);
                      setEditScore(null);
                      await queryClient.invalidateQueries({ queryKey: ['application', id] });
                    } catch (e) {
                      enqueueSnackbar(t('error.updateFailed'), { variant: 'error' });
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
                        primary={editingRating === r.id ? t('common.editing') : `${r.score}/5 ${t('common.by')} ${r.userName || r.userId}`} 
                        secondary={new Date(r.createdAt).toLocaleString()} 
                      />
                    </ListItem>
                  );
                })}
              </List>
            )}

            {detail.recentComments && detail.recentComments.length > 0 && (
              <>
                <Typography variant="h6" sx={{ mt: 3 }}>{t('application.recentComments')}</Typography>
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

            <Typography variant="h6" sx={{ mt: 3 }}>{t('application.comments')}</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField fullWidth size="small" placeholder={t('application.commentPlaceholder')} value={commentText} onChange={(e) => setCommentText(e.target.value)} disabled={isCompanyManager} />
              <Button variant="outlined" startIcon={<CommentIcon />} onClick={handleAddComment} disabled={commentSaving || !commentText.trim() || isCompanyManager}>
                {t('common.add')}
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
      <Dialog
        open={meetingOpen}
        onClose={closeMeetingDialog}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>{t('application.scheduleMeeting')}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label={t('meeting.meetingTitle')}
            sx={{ mt: 1 }}
            value={meeting.title || ''}
            onChange={(e) => setMeeting(m => ({ ...m, title: e.target.value }))}
          />
          <FormControl fullWidth size="small" sx={{ mt: 2 }}>
            <InputLabel>{t('meeting.provider')}</InputLabel>
            <Select
              label={t('meeting.provider')}
              value={meeting.provider || MeetingProvider.TEAMS}
              onChange={(e) => setMeeting(m => ({ ...m, provider: e.target.value as MeetingProvider }))}
            >
              <MenuItem value={MeetingProvider.TEAMS}>{t('meeting.teams')}</MenuItem>
              <MenuItem value={MeetingProvider.ZOOM}>{t('meeting.zoom')}</MenuItem>
              <MenuItem value={MeetingProvider.MEET}>{t('meeting.meet')}</MenuItem>
              <MenuItem value={MeetingProvider.OTHER}>{t('meeting.other')}</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            type="datetime-local"
            label={t('meeting.startTime')}
            InputLabelProps={{ shrink: true }}
            sx={{ mt: 2 }}
            value={meeting.startTime || ''}
            onChange={(e) => setMeeting(m => ({ ...m, startTime: e.target.value }))}
          />
          <TextField
            fullWidth
            type="number"
            label={t('meeting.duration')}
            sx={{ mt: 2 }}
            InputProps={{ inputProps: { min: 15 } }}
            value={meeting.durationMinutes || 30}
            onChange={(e) => setMeeting(m => ({ ...m, durationMinutes: Number(e.target.value) }))}
          />
          <TextField
            fullWidth
            label={t('meeting.meetingLink')}
            sx={{ mt: 2 }}
            value={meeting.meetingLink || ''}
            onChange={(e) => setMeeting(m => ({ ...m, meetingLink: e.target.value }))}
          />
          <TextField
            fullWidth
            label={t('meeting.location')}
            sx={{ mt: 2 }}
            value={meeting.location || ''}
            onChange={(e) => setMeeting(m => ({ ...m, location: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeMeetingDialog}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleScheduleMeeting} disabled={meetingSaving}>{t('application.scheduleMeeting')}</Button>
        </DialogActions>
      </Dialog>

      {/* Delete File Confirmation Dialog */}
      <ConfirmDialog
        open={deleteFileDialogOpen}
        title={t('application.deleteFile')}
        description={t('application.deleteFileConfirm')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        confirmColor="error"
        loading={isDeletingFile}
        onClose={() => {
          setDeleteFileDialogOpen(false);
          setFileToDelete(null);
        }}
        onConfirm={handleDeleteFile}
      />

      {/* Cancel Meeting Confirmation Dialog */}
      <ConfirmDialog
        open={cancelMeetingDialogOpen}
        title={t('meeting.cancelMeeting')}
        description={t('meeting.cancelConfirm')}
        confirmLabel={t('meeting.cancelMeeting')}
        cancelLabel={t('common.cancel')}
        confirmColor="warning"
        onClose={() => {
          setCancelMeetingDialogOpen(false);
          setMeetingToCancel(null);
        }}
        onConfirm={handleCancelMeeting}
      />

      {/* Withdraw Application Confirmation Dialog */}
      <ConfirmDialog
        open={withdrawDialogOpen}
        title={t('application.withdrawApplication')}
        description={t('application.withdrawConfirm')}
        confirmLabel={t('application.withdrawApplication')}
        cancelLabel={t('common.cancel')}
        confirmColor="warning"
        loading={isWithdrawing}
        onClose={() => setWithdrawDialogOpen(false)}
        onConfirm={handleWithdrawApplication}
      />

      {/* Reject Application Confirmation Dialog */}
      <ConfirmDialog
        open={rejectDialogOpen}
        title={t('application.rejectApplication')}
        description={t('application.rejectConfirm')}
        confirmLabel={t('application.rejectApplication')}
        cancelLabel={t('common.cancel')}
        confirmColor="error"
        loading={isRejecting}
        onClose={() => setRejectDialogOpen(false)}
        onConfirm={handleRejectApplication}
      />
    </Box>
  );
};

export default ApplicationDetail;

