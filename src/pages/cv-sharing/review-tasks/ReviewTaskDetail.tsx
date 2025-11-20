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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewTaskService } from '@/services/cv-sharing/reviewTaskService';
import { CompleteReviewTaskRequest } from '@/types/cv-sharing/review-task';
import { useKeycloak } from '@/hooks/useKeycloak';
import PageContainer from '@/components/ui/PageContainer';

const ReviewTaskDetail: React.FC = () => {
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
      enqueueSnackbar('Review task completed successfully', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['reviewTasks'] });
      queryClient.invalidateQueries({ queryKey: ['reviewTaskStats'] });
      navigate('/cv-sharing/review-tasks');
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || 'Failed to complete review task', {
        variant: 'error',
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => reviewTaskService.cancelReviewTask(Number(id!)),
    onSuccess: () => {
      enqueueSnackbar('Review task cancelled', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['reviewTasks'] });
      queryClient.invalidateQueries({ queryKey: ['reviewTaskStats'] });
      navigate('/cv-sharing/review-tasks');
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || 'Failed to cancel review task', {
        variant: 'error',
      });
    },
  });

  const handleComplete = () => {
    if (!relevanceLabel && relevanceLabel !== 0) {
      enqueueSnackbar('Please select a relevance label', { variant: 'warning' });
      return;
    }
    if (!canEdit) {
      enqueueSnackbar('You do not have permission to complete this task', { variant: 'error' });
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
        <Alert severity="error">Review task not found</Alert>
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
          <Typography variant="h4">Review Task #{task.id}</Typography>
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
                        Pool CV
                      </Typography>
                      <Typography variant="body1">{task.poolCvName || task.poolCvId}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="textSecondary">
                        Position
                      </Typography>
                      <Typography variant="body1">{task.positionTitle || task.positionId}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="textSecondary">
                        Uncertainty Score
                      </Typography>
                      <Typography variant="body1">
                        {(task.uncertaintyScore * 100).toFixed(1)}%
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="textSecondary">
                        Match Score
                      </Typography>
                      <Typography variant="body1">{task.matchScore || 'N/A'}</Typography>
                    </Grid>
                    {task.assignedToName && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="textSecondary">
                          Assigned To
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
                          Notes
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
                    Complete Review Task
                  </Typography>
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    <FormControl fullWidth>
                      <InputLabel>Relevance Label</InputLabel>
                      <Select
                        value={relevanceLabel}
                        label="Relevance Label"
                        onChange={(e) => setRelevanceLabel(Number(e.target.value) as 0 | 1 | 2 | 3)}
                      >
                        <MenuItem value={0}>0 - Irrelevant</MenuItem>
                        <MenuItem value={1}>1 - Somewhat Relevant</MenuItem>
                        <MenuItem value={2}>2 - Relevant</MenuItem>
                        <MenuItem value={3}>3 - Highly Relevant</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      label="Notes (Optional)"
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
                        {completeMutation.isPending ? 'Completing...' : 'Complete Task'}
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
                        Cancel Task
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            )}

            {task.status === 'COMPLETED' && task.relevanceLabel !== undefined && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Task completed with relevance label: {task.relevanceLabel}
              </Alert>
            )}
          </Grid>

          {/* Actions Sidebar */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Stack spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<BackIcon />}
                    onClick={() => navigate('/cv-sharing/review-tasks')}
                    fullWidth
                  >
                    Back to List
                  </Button>
                  {task.poolCvId && (
                    <Button
                      variant="outlined"
                      onClick={() => navigate(`/cv-sharing/pool-cvs/${task.poolCvId}`)}
                      fullWidth
                    >
                      View Pool CV
                    </Button>
                  )}
                  {task.positionId && (
                    <Button
                      variant="outlined"
                      onClick={() => navigate(`/cv-sharing/positions/${task.positionId}`)}
                      fullWidth
                    >
                      View Position
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

