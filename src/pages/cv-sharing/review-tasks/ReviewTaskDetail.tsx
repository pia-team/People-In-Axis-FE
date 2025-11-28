import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Chip,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  LinearProgress,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  CheckCircle as CompleteIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewTaskService } from '@/services/cv-sharing/reviewTaskService';
import { CompleteReviewTaskRequest } from '@/types/cv-sharing/review-task';
import { useKeycloak } from '@/hooks/useKeycloak';
import PageContainer from '@/components/ui/PageContainer';

const ReviewTaskDetail: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { hasAnyRole } = useKeycloak();
  const canEdit = hasAnyRole(['HUMAN_RESOURCES', 'SYSTEM_ADMIN']);
  const queryClient = useQueryClient();

  const [relevanceLabel, setRelevanceLabel] = useState<0 | 1 | 2 | 3>(2);
  const [notes, setNotes] = useState('');

  const { data: task, isLoading } = useQuery({
    queryKey: ['reviewTask', id],
    queryFn: () => reviewTaskService.getReviewTask(Number(id)),
    enabled: !!id,
  });

  const completeMutation = useMutation({
    mutationFn: (request: CompleteReviewTaskRequest) =>
      reviewTaskService.completeReviewTask(Number(id!), request),
    onSuccess: () => {
      enqueueSnackbar(t('reviewTask.taskCompleted'), { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['reviewTasks'] });
      queryClient.invalidateQueries({ queryKey: ['reviewTaskStats'] });
      navigate('/cv-sharing/review-tasks');
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || t('reviewTask.failedToCompleteReviewTask'), {
        variant: 'error',
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => reviewTaskService.cancelReviewTask(Number(id!)),
    onSuccess: () => {
      enqueueSnackbar(t('reviewTask.reviewTaskCancelled'), { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['reviewTasks'] });
      queryClient.invalidateQueries({ queryKey: ['reviewTaskStats'] });
      navigate('/cv-sharing/review-tasks');
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || t('reviewTask.failedToCancelReviewTask'), {
        variant: 'error',
      });
    },
  });

  const handleComplete = () => {
    if (!relevanceLabel && relevanceLabel !== 0) {
      enqueueSnackbar(t('reviewTask.pleaseSelectRelevanceLabel'), { variant: 'warning' });
      return;
    }
    if (!canEdit) {
      enqueueSnackbar(t('reviewTask.noPermissionToCompleteTask'), { variant: 'error' });
      return;
    }
    completeMutation.mutate({ relevanceLabel, notes });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'ASSIGNED':
      case 'IN_PROGRESS':
        return 'info';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'HIGH':
        return 'error';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'info';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <LinearProgress />
      </PageContainer>
    );
  }

  if (!task) {
    return (
      <PageContainer>
        <Alert severity="error">{t('reviewTask.reviewTaskNotFound')}</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Box>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <IconButton onClick={() => navigate('/cv-sharing/review-tasks')}>
            <BackIcon />
          </IconButton>
          <Typography variant="h4">{t('reviewTask.reviewTaskNumber')}{task.id}</Typography>
        </Stack>

        <Grid container spacing={3}>
          {/* Task Info */}
          <Grid item xs={12} md={8}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Chip
                      label={task.status}
                      color={getStatusColor(task.status) as any}
                      size="small"
                    />
                    <Chip
                      label={task.priority}
                      color={getPriorityColor(task.priority) as any}
                      size="small"
                    />
                  </Stack>

                  <Divider />

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="textSecondary">
                        {t('reviewTask.poolCV')}
                      </Typography>
                      <Typography variant="body1">{task.poolCvName || task.poolCvId}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="textSecondary">
                        {t('reviewTask.position')}
                      </Typography>
                      <Typography variant="body1">{task.positionTitle || task.positionId}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="textSecondary">
                        {t('reviewTask.uncertaintyScore')}
                      </Typography>
                      <Typography variant="body1">
                        {(task.uncertaintyScore * 100).toFixed(1)}%
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="textSecondary">
                        {t('reviewTask.matchScore')}
                      </Typography>
                      <Typography variant="body1">{task.matchScore || 'N/A'}</Typography>
                    </Grid>
                    {task.assignedToName && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="textSecondary">
                          {t('reviewTask.assignedTo')}
                        </Typography>
                        <Typography variant="body1">{task.assignedToName}</Typography>
                      </Grid>
                    )}
                  </Grid>

                  {task.notes && (
                    <>
                      <Divider />
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          {t('reviewTask.notes')}
                        </Typography>
                        <Typography variant="body2">{task.notes}</Typography>
                      </Box>
                    </>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Completion Form */}
            {canEdit && task.status !== 'COMPLETED' && task.status !== 'CANCELLED' && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('reviewTask.completeReviewTask')}
                  </Typography>
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    <FormControl fullWidth>
                      <InputLabel>{t('reviewTask.relevanceLabel')}</InputLabel>
                      <Select
                        value={relevanceLabel}
                        label={t('reviewTask.relevanceLabel')}
                        onChange={(e) => setRelevanceLabel(Number(e.target.value) as 0 | 1 | 2 | 3)}
                      >
                        <MenuItem value={0}>0 - {t('reviewTask.irrelevant')}</MenuItem>
                        <MenuItem value={1}>1 - {t('reviewTask.somewhatRelevant')}</MenuItem>
                        <MenuItem value={2}>2 - {t('reviewTask.relevant')}</MenuItem>
                        <MenuItem value={3}>3 - {t('reviewTask.highlyRelevant')}</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      label={t('reviewTask.notesOptional')}
                      multiline
                      rows={4}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      fullWidth
                    />
                    <Stack direction="row" spacing={2}>
                      <Button
                        variant="contained"
                        startIcon={<CompleteIcon />}
                        onClick={handleComplete}
                        disabled={!canEdit || completeMutation.isPending}
                      >
                        {completeMutation.isPending ? t('reviewTask.completing') : t('reviewTask.completeTask')}
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<CancelIcon />}
                        onClick={() => {
                          if (!canEdit) return;
                          cancelMutation.mutate();
                        }}
                        disabled={!canEdit || cancelMutation.isPending}
                        color="error"
                      >
                        {t('reviewTask.cancelTask')}
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            )}

            {task.status === 'COMPLETED' && task.relevanceLabel !== undefined && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {t('reviewTask.taskCompletedWithLabel')} {task.relevanceLabel}
              </Alert>
            )}
          </Grid>

          {/* Actions Sidebar */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('reviewTask.quickActions')}
                </Typography>
                <Stack spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<BackIcon />}
                    onClick={() => navigate('/cv-sharing/review-tasks')}
                    fullWidth
                  >
                    {t('reviewTask.backToList')}
                  </Button>
                  {task.poolCvId && (
                    <Button
                      variant="outlined"
                      onClick={() => navigate(`/cv-sharing/pool-cvs/${task.poolCvId}`)}
                      fullWidth
                    >
                      {t('reviewTask.viewPoolCV')}
                    </Button>
                  )}
                  {task.positionId && (
                    <Button
                      variant="outlined"
                      onClick={() => navigate(`/cv-sharing/positions/${task.positionId}`)}
                      fullWidth
                    >
                      {t('reviewTask.viewPosition')}
                    </Button>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default ReviewTaskDetail;

