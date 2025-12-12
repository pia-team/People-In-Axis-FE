import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Stack,
  Paper,
  Chip,
} from '@mui/material';
import { Star, TrendingUp } from '@mui/icons-material';
import { evaluationService } from '@/services/cv-sharing/evaluationService';
import { EvaluationSummary } from '@/types/cv-sharing/evaluation';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import EvaluationDetailModal from './EvaluationDetailModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
}

/**
 * Modal for HR/MANAGER users to view evaluation summary
 * Shows average score, evaluator list, and allows viewing individual evaluations
 */
const EvaluationSummaryModal: React.FC<Props> = ({ isOpen, onClose, applicationId }) => {
  const [summary, setSummary] = useState<EvaluationSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedEvaluationId, setSelectedEvaluationId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadSummary();
    }
  }, [isOpen, applicationId]);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const data = await evaluationService.getEvaluationSummary(applicationId);
      setSummary(data);
    } catch (error) {
      console.error('Error loading summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number): 'success' | 'warning' | 'error' => {
    if (score >= 8) return 'success';
    if (score >= 6) return 'warning';
    return 'error';
  };

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Aday Değerlendirme Özeti</DialogTitle>
        <DialogContent dividers>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : summary ? (
            <Stack spacing={3}>
              {/* Average Score Card */}
              <Paper
                sx={{
                  p: 3,
                  background: 'linear-gradient(to right, #e3f2fd, #e8eaf6)',
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Ortalama Değerlendirme Puanı
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Star sx={{ color: '#ffc107' }} />
                      <Typography
                        variant="h3"
                        fontWeight="bold"
                        color={getScoreColor(summary.averageScore) + '.main'}
                      >
                        {summary.averageScore.toFixed(2)}
                      </Typography>
                      <Typography variant="h5" color="text.secondary">
                        /10
                      </Typography>
                    </Stack>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Toplam Değerlendirme
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <TrendingUp color="primary" />
                      <Typography variant="h4" fontWeight="bold" color="primary">
                        {summary.completedEvaluations}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        / {summary.totalForwardings}
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              </Paper>

              {/* Evaluators List */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Değerlendirmeler
                </Typography>
                {summary.evaluators.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                    Henüz değerlendirme yapılmamış
                  </Typography>
                ) : (
                  <List>
                    {summary.evaluators.map(evaluator => (
                      <ListItem
                        key={evaluator.evaluationId}
                        sx={{
                          border: 1,
                          borderColor: 'divider',
                          borderRadius: 1,
                          mb: 1,
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover' },
                        }}
                        onClick={() => setSelectedEvaluationId(evaluator.evaluationId)}
                      >
                        <ListItemText
                          primary={evaluator.evaluatorName}
                          secondary={
                            <Box>
                              <Typography variant="caption" display="block">
                                {evaluator.evaluatorEmail}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {format(new Date(evaluator.evaluatedAt), 'dd MMMM yyyy, HH:mm', {
                                  locale: tr,
                                })}
                              </Typography>
                            </Box>
                          }
                        />
                        <Chip
                          label={`${evaluator.score.toFixed(1)}/10`}
                          color={getScoreColor(evaluator.score)}
                          size="medium"
                          sx={{ fontWeight: 'bold', fontSize: '1rem', minWidth: 80 }}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
              Değerlendirme bulunamadı
            </Typography>
          )}
        </DialogContent>
      </Dialog>

      {selectedEvaluationId && (
        <EvaluationDetailModal
          isOpen={!!selectedEvaluationId}
          onClose={() => setSelectedEvaluationId(null)}
          applicationId={applicationId}
          evaluationId={selectedEvaluationId}
        />
      )}
    </>
  );
};

export default EvaluationSummaryModal;
