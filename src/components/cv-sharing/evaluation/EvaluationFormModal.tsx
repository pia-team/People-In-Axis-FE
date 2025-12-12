import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Slider,
  Chip,
  CircularProgress,
  FormLabel,
  Stack,
} from '@mui/material';
import { evaluationService } from '@/services/cv-sharing/evaluationService';
import {
  EvaluationQuestion,
  CreateEvaluationRequest,
  EvaluationResponse,
} from '@/types/cv-sharing/evaluation';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  onSuccess: () => void;
}

/**
 * Modal form for EMPLOYEE users to evaluate applications
 * Contains 10 questions with score sliders (0-10) and optional comments
 */
const EvaluationFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  applicationId,
  onSuccess,
}) => {
  const [questions, setQuestions] = useState<EvaluationQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, { score: number; comment: string }>>({});
  const [generalComment, setGeneralComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [existingEvaluation, setExistingEvaluation] = useState<EvaluationResponse | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (isOpen) {
      loadData();
    } else {
      // Reset when modal closes
      setExistingEvaluation(null);
      setAnswers({});
      setGeneralComment('');
    }
  }, [isOpen, applicationId]);

  const loadData = async () => {
    try {
      setLoadingQuestions(true);
      
      // Load existing evaluation first (404 is expected if no evaluation exists)
      let evaluation: EvaluationResponse | null = null;
      try {
        evaluation = await evaluationService.getMyEvaluation(applicationId);
      } catch (error: any) {
        // 404 is expected when no evaluation exists - silently ignore
        if (error?.response?.status !== 404) {
          console.error('Error loading existing evaluation:', error);
        }
        evaluation = null;
      }
      
      // Load questions
      const questionsData = await evaluationService.getQuestions(applicationId);
      setQuestions(questionsData);

      if (evaluation) {
        // Pre-fill form with existing evaluation data
        setExistingEvaluation(evaluation);
        const existingAnswers: Record<string, { score: number; comment: string }> = {};
        evaluation.answers.forEach(answer => {
          existingAnswers[answer.questionId] = {
            score: answer.score,
            comment: answer.comment || '',
          };
        });
        // Ensure all questions have answers (in case new questions were added)
        questionsData.forEach(q => {
          if (!existingAnswers[q.id]) {
            existingAnswers[q.id] = { score: 5, comment: '' };
          }
        });
        setAnswers(existingAnswers);
        setGeneralComment(evaluation.generalComment || '');
      } else {
        // Initialize answers with default score of 5
        const initialAnswers: Record<string, { score: number; comment: string }> = {};
        questionsData.forEach(q => {
          initialAnswers[q.id] = { score: 5, comment: '' };
        });
        setAnswers(initialAnswers);
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Veriler yüklenirken hata oluştu',
        { variant: 'error' }
      );
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleScoreChange = (questionId: string, score: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], score },
    }));
  };

  const handleCommentChange = (questionId: string, comment: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], comment },
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Validate all questions are answered
      if (Object.keys(answers).length !== questions.length) {
        enqueueSnackbar('Lütfen tüm soruları cevaplayın', { variant: 'warning' });
        return;
      }

      const request: CreateEvaluationRequest = {
        answers: Object.entries(answers).map(([questionId, data]) => ({
          questionId,
          score: data.score,
          comment: data.comment || undefined,
        })),
        generalComment: generalComment || undefined,
      };

      const wasExisting = !!existingEvaluation;
      const result = await evaluationService.createEvaluation(applicationId, request);
      
      // Update existing evaluation state
      setExistingEvaluation(result);

      enqueueSnackbar(
        wasExisting ? 'Değerlendirme başarıyla güncellendi' : 'Değerlendirme başarıyla kaydedildi',
        { variant: 'success' }
      );

      onSuccess();
    } catch (error: any) {
      console.error('Error submitting evaluation:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Değerlendirme kaydedilirken hata oluştu',
        { variant: 'error' }
      );
    } finally {
      setLoading(false);
    }
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
      <DialogTitle>Aday Değerlendirme Formu</DialogTitle>
      <DialogContent dividers>
        {existingEvaluation?.updatedAt && (
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
            Son kayıt: {format(new Date(existingEvaluation.updatedAt), 'dd/MM/yyyy HH:mm')}
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Lütfen aşağıdaki 10 soruyu 0-10 arası puanlayarak cevaplayınız. Her soru için
          opsiyonel olarak yorum ekleyebilirsiniz.
        </Typography>

        {loadingQuestions ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={4} sx={{ py: 2 }}>
            {questions.map((question, index) => (
              <Box key={question.id} sx={{ borderBottom: index < questions.length - 1 ? 1 : 0, borderColor: 'divider', pb: 3 }}>
                <Stack spacing={2}>
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Soru {index + 1}
                      </Typography>
                      <Chip
                        label={question.questionCategory}
                        size="small"
                        color={getCategoryColor(question.questionCategory)}
                      />
                    </Stack>
                    <FormLabel>
                      <Typography variant="body1" fontWeight="medium">
                        {question.questionText}
                      </Typography>
                    </FormLabel>
                  </Box>

                  <Stack spacing={2}>
                    <Box>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ flex: 1 }}>
                          <Slider
                            value={answers[question.id]?.score || 5}
                            onChange={(_, value) => handleScoreChange(question.id, value as number)}
                            min={0}
                            max={10}
                            step={1}
                            marks
                            valueLabelDisplay="auto"
                          />
                          <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">0</Typography>
                            <Typography variant="caption" color="text.secondary">5</Typography>
                            <Typography variant="caption" color="text.secondary">10</Typography>
                          </Stack>
                        </Box>
                        <Typography variant="h5" fontWeight="bold" color="primary" sx={{ minWidth: 60, textAlign: 'center' }}>
                          {answers[question.id]?.score || 5}/10
                        </Typography>
                      </Stack>
                    </Box>

                    <TextField
                      placeholder="İsteğe bağlı yorum ekleyin..."
                      value={answers[question.id]?.comment || ''}
                      onChange={(e) => handleCommentChange(question.id, e.target.value)}
                      multiline
                      rows={2}
                      fullWidth
                      size="small"
                    />
                  </Stack>
                </Stack>
              </Box>
            ))}

            <Box sx={{ pt: 2 }}>
              <FormLabel>
                <Typography variant="body1" fontWeight="medium" sx={{ mb: 1 }}>
                  Genel Değerlendirme Yorumu
                </Typography>
              </FormLabel>
              <TextField
                placeholder="Aday hakkında genel görüşlerinizi yazın..."
                value={generalComment}
                onChange={(e) => setGeneralComment(e.target.value)}
                multiline
                rows={4}
                fullWidth
              />
            </Box>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          İptal
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading || loadingQuestions}
          variant="contained"
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {loading ? 'Kaydediliyor...' : 'Değerlendirmeyi Kaydet'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EvaluationFormModal;
