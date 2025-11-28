import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, TextField, Button, Stack, Divider, Rating, LinearProgress } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { applicationService } from '@/services/cv-sharing';
import { ApplicationDetail, ApplicationStatus } from '@/types/cv-sharing';

const ApplicationReview: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
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
      enqueueSnackbar(t('application.failedToLoadApplication'), { variant: 'error' });
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
      enqueueSnackbar(t('application.commentAddedShort'), { variant: 'success' });
      setComment('');
      await load();
    } catch (e) {
      enqueueSnackbar(t('application.failedToAddComment'), { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddRating = async () => {
    if (!id || !score) return;
    try {
      setSaving(true);
      await applicationService.addRating(id, { score });
      enqueueSnackbar(t('application.ratingAddedShort'), { variant: 'success' });
      setScore(null);
      await load();
    } catch (e) {
      enqueueSnackbar(t('application.failedToAddRating'), { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDecision = async (status: ApplicationStatus) => {
    if (!id) return;
    try {
      setSaving(true);
      await applicationService.updateApplicationStatus(id, { status });
      const statusKey = status.toLowerCase().replace(/_/g, '');
      enqueueSnackbar(t(`application.${statusKey}`) || status, { variant: 'success' });
      // Invalidate both detail and list caches
      await queryClient.invalidateQueries({ queryKey: ['application', id] });
      await queryClient.invalidateQueries({ queryKey: ['applications'] });
      navigate(`/cv-sharing/applications/${id}`);
    } catch (e) {
      enqueueSnackbar(t('application.failedToUpdateStatus'), { variant: 'error' });
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
          {t('application.reviewApplication')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {detail.firstName} {detail.lastName} • {detail.positionTitle || detail.positionId}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Rating value={score || 0} onChange={(_, v) => setScore(v)} />
          <Button variant="outlined" onClick={handleAddRating} disabled={!score || saving}>{t('application.addRating')}</Button>
        </Stack>

        <Stack spacing={1} sx={{ mb: 2 }}>
          <TextField
            label={t('application.addInternalComment')}
            multiline
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            fullWidth
          />
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button variant="outlined" onClick={handleAddComment} disabled={!comment.trim() || saving}>{t('application.addComment')}</Button>
          </Stack>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="flex-end">
          <Button variant="outlined" onClick={() => navigate(-1)} disabled={saving}>{t('common.back')}</Button>
          <Button color="error" variant="contained" onClick={() => handleDecision(ApplicationStatus.REJECTED)} disabled={saving}>{t('application.reject')}</Button>
          <Button color="success" variant="contained" onClick={() => handleDecision(ApplicationStatus.ACCEPTED)} disabled={saving}>{t('application.accept')}</Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default ApplicationReview;
