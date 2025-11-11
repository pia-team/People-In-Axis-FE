import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, TextField, Button, Stack, Divider, Rating, LinearProgress } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { applicationService } from '@/services/cv-sharing';
import { ApplicationDetail, ApplicationStatus } from '@/types/cv-sharing';

const ApplicationReview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<ApplicationDetail | null>(null);
  const [comment, setComment] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      load();
    }
  }, [id]);

  const load = async () => {
    try {
      setLoading(true);
      const data = await applicationService.getApplicationById(id!);
      setDetail(data);
    } catch (e) {
      enqueueSnackbar('Failed to load application', { variant: 'error' });
      navigate('/applications');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!id || !comment.trim()) return;
    try {
      setSaving(true);
      await applicationService.addComment(id, { content: comment.trim(), isInternal: true });
      enqueueSnackbar('Comment added', { variant: 'success' });
      setComment('');
      await load();
    } catch (e) {
      enqueueSnackbar('Failed to add comment', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddRating = async () => {
    if (!id || !score) return;
    try {
      setSaving(true);
      await applicationService.addRating(id, { score });
      enqueueSnackbar('Rating added', { variant: 'success' });
      setScore(null);
      await load();
    } catch (e) {
      enqueueSnackbar('Failed to add rating', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDecision = async (status: ApplicationStatus) => {
    if (!id) return;
    try {
      setSaving(true);
      await applicationService.updateApplicationStatus(id, { status });
      enqueueSnackbar(`Application ${status.toLowerCase()}`, { variant: 'success' });
      navigate(`/applications/${id}`);
    } catch (e) {
      enqueueSnackbar('Failed to update status', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !detail) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Typography variant="h5" gutterBottom>
          Review Application
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {detail.firstName} {detail.lastName} • {detail.positionTitle || detail.positionId}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Rating value={score || 0} onChange={(_, v) => setScore(v)} />
          <Button variant="outlined" onClick={handleAddRating} disabled={!score || saving}>Add Rating</Button>
        </Stack>

        <Stack spacing={1} sx={{ mb: 2 }}>
          <TextField
            label="Add Internal Comment"
            multiline
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            fullWidth
          />
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button variant="outlined" onClick={handleAddComment} disabled={!comment.trim() || saving}>Add Comment</Button>
          </Stack>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="flex-end">
          <Button variant="outlined" onClick={() => navigate(-1)} disabled={saving}>Back</Button>
          <Button color="error" variant="contained" onClick={() => handleDecision(ApplicationStatus.REJECTED)} disabled={saving}>Reject</Button>
          <Button color="success" variant="contained" onClick={() => handleDecision(ApplicationStatus.ACCEPTED)} disabled={saving}>Accept</Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default ApplicationReview;
