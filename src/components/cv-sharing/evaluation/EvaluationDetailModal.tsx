import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  CircularProgress,
  Stack,
  Paper,
  Chip,
  Grid,
} from '@mui/material';
import { Star, Person as UserIcon, Mail, CalendarToday } from '@mui/icons-material';
import { evaluationService } from '@/services/cv-sharing/evaluationService';
import {
  EvaluationResponse,
} from '@/types/cv-sharing/evaluation';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  evaluationId: string;
}

/**
 * Modal for viewing detailed evaluation
 * Shows all 10 questions with scores and comments
 */
const EvaluationDetailModal: React.FC<Props> = ({
  isOpen,
  onClose,
  applicationId,
  evaluationId,
}) => {
  const [evaluation, setEvaluation] = useState<EvaluationResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && evaluationId) {
      loadEvaluation();
    }
  }, [isOpen, evaluationId, applicationId]);

  const loadEvaluation = async () => {
    try {
      setLoading(true);
      const data = await evaluationService.getEvaluationDetail(applicationId, evaluationId);
      setEvaluation(data);
    } catch (error) {
      console.error('Error loading evaluation:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number): 'success' | 'warning' | 'error' => {
    if (score >= 8) return 'success';
    if (score >= 6) return 'warning';
    return 'error';
  };

  const getCategoryColor = (category: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    if (category.includes('Teknik')) return 'primary';
    if (category.includes('İletişim')) return 'success';
    if (category.includes('Ekip')) return 'secondary';
    if (category.includes('Analitik')) return 'warning';
    if (category.includes('Motivasyon')) return 'error';
    return 'info';
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Değerlendirme Detayı</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : evaluation ? (
          <Stack spacing={3}>
            {/* Evaluator Info Card */}
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                    Değerlendiren
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <UserIcon fontSize="small" color="action" />
                    <Typography variant="body1" fontWeight="medium">
                      {evaluation.evaluatedBy.fullName}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Mail fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {evaluation.evaluatedBy.email}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                    Değerlendirme Bilgileri
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <CalendarToday fontSize="small" color="action" />
                    <Typography variant="body2">
                      {format(new Date(evaluation.evaluatedAt), 'dd MMMM yyyy, HH:mm', {
                        locale: tr,
                      })}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Star sx={{ color: '#ffc107' }} />
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color={getScoreColor(evaluation.totalScore) + '.main'}
                    >
                      {evaluation.totalScore.toFixed(2)} / 10
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>

            {/* Questions and Answers */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Sorular ve Cevaplar
              </Typography>
              <Stack spacing={2}>
                {evaluation.answers.map((answer) => (
                  <Paper key={answer.questionId} sx={{ p: 2, border: 1, borderColor: 'divider' }}>
                    <Stack spacing={2}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box sx={{ flex: 1 }}>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              Soru {answer.questionOrder}
                            </Typography>
                            <Chip
                              label={answer.questionCategory}
                              size="small"
                              color={getCategoryColor(answer.questionCategory)}
                            />
                          </Stack>
                          <Typography variant="body1" fontWeight="medium">
                            {answer.questionText}
                          </Typography>
                        </Box>
                        <Chip
                          label={`${answer.score}/10`}
                          color={getScoreColor(answer.score)}
                          sx={{ fontWeight: 'bold', minWidth: 70 }}
                        />
                      </Stack>
                      {answer.comment && (
                        <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {answer.comment}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Box>

            {/* General Comment */}
            {evaluation.generalComment && (
              <Box>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Genel Değerlendirme
                </Typography>
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: 'primary.light',
                    border: 1,
                    borderColor: 'primary.main',
                  }}
                >
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {evaluation.generalComment}
                  </Typography>
                </Paper>
              </Box>
            )}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
            Değerlendirme bulunamadı
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EvaluationDetailModal;
