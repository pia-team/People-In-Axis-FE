import React, { useState, useEffect } from 'react';
import { evaluationService } from '@/services/cv-sharing/evaluationService';
import { EvaluationProgress as EvaluationProgressType } from '@/types/cv-sharing/evaluation';
import { CheckCircle, Schedule, TrendingUp } from '@mui/icons-material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Stack,
} from '@mui/material';

interface Props {
  applicationId: string;
}

/**
 * Component for HR/MANAGER users to view evaluation progress
 * Shows completion percentage and list of evaluators (completed/pending)
 */
const EvaluationProgress: React.FC<Props> = ({ applicationId }) => {
  const [progress, setProgress] = useState<EvaluationProgressType | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProgress();
  }, [applicationId]);

  const loadProgress = async () => {
    try {
      setLoading(true);
      const data = await evaluationService.getEvaluationProgress(applicationId);
      setProgress(data);
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  if (!progress || progress.totalForwardings === 0) {
    return null;
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <TrendingUp color="primary" />
          <Typography variant="h6">Değerlendirme Durumu</Typography>
        </Stack>
        <Typography variant="h4" fontWeight="bold" color="primary">
          {progress.completedEvaluations}/{progress.totalForwardings}
        </Typography>
      </Stack>

      {/* Progress Bar */}
      <Box sx={{ mb: 2 }}>
        <LinearProgress
          variant="determinate"
          value={progress.completionPercentage}
          sx={{ height: 8, borderRadius: 4 }}
        />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          %{progress.completionPercentage.toFixed(0)} tamamlandı
        </Typography>
      </Box>

      {/* Forwarding List */}
      <Box>
        <Typography variant="subtitle2" fontWeight="medium" sx={{ mb: 1 }}>
          İletilen Kullanıcılar
        </Typography>
        <List>
          {progress.forwardings.map(f => (
            <ListItem
              key={f.forwardingId}
              sx={{
                bgcolor: f.isCompleted ? 'success.light' : 'background.paper',
                border: 1,
                borderColor: f.isCompleted ? 'success.main' : 'divider',
                borderRadius: 1,
                mb: 1,
              }}
            >
              <ListItemText
                primary={f.forwardedToName}
                secondary={f.forwardedToEmail}
              />
              <Box>
                {f.isCompleted ? (
                  <Stack direction="row" spacing={1} alignItems="center" color="success.main">
                    <CheckCircle />
                    <Typography variant="caption">
                      {f.evaluatedAt &&
                        format(new Date(f.evaluatedAt), 'dd MMM yyyy', { locale: tr })}
                    </Typography>
                  </Stack>
                ) : (
                  <Stack direction="row" spacing={1} alignItems="center" color="text.disabled">
                    <Schedule />
                    <Typography variant="caption">Beklemede</Typography>
                  </Stack>
                )}
              </Box>
            </ListItem>
          ))}
        </List>
      </Box>
    </Paper>
  );
};

export default EvaluationProgress;
