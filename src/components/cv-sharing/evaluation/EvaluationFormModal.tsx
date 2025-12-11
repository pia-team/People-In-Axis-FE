import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { evaluationService } from '@/services/cv-sharing/evaluationService';
import {
  EvaluationQuestion,
  CreateEvaluationRequest,
  CATEGORY_COLORS,
} from '@/types/cv-sharing/evaluation';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

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
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadQuestions();
    }
  }, [isOpen, applicationId]);

  const loadQuestions = async () => {
    try {
      setLoadingQuestions(true);
      const data = await evaluationService.getQuestions(applicationId);
      setQuestions(data);

      // Initialize answers with default score of 5
      const initialAnswers: Record<string, { score: number; comment: string }> = {};
      data.forEach(q => {
        initialAnswers[q.id] = { score: 5, comment: '' };
      });
      setAnswers(initialAnswers);
    } catch (error: any) {
      console.error('Error loading questions:', error);
      toast({
        title: 'Hata',
        description: error.response?.data?.message || 'Sorular yüklenirken hata oluştu',
        variant: 'destructive',
      });
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
        toast({
          title: 'Eksik Bilgi',
          description: 'Lütfen tüm soruları cevaplayın',
          variant: 'destructive',
        });
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

      await evaluationService.createEvaluation(applicationId, request);

      toast({
        title: 'Başarılı',
        description: 'Değerlendirme başarıyla kaydedildi',
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error submitting evaluation:', error);
      toast({
        title: 'Hata',
        description: error.response?.data?.message || 'Değerlendirme kaydedilirken hata oluştu',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Aday Değerlendirme Formu</DialogTitle>
          <DialogDescription>
            Lütfen aşağıdaki 10 soruyu 0-10 arası puanlayarak cevaplayınız. Her soru için
            opsiyonel olarak yorum ekleyebilirsiniz.
          </DialogDescription>
        </DialogHeader>

        {loadingQuestions ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {questions.map((question, index) => (
              <div key={question.id} className="border-b pb-6 last:border-0">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-500">
                        Soru {index + 1}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          CATEGORY_COLORS[question.questionCategory] ||
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {question.questionCategory}
                      </span>
                    </div>
                    <Label className="text-base font-medium">{question.questionText}</Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Slider
                        value={[answers[question.id]?.score || 5]}
                        onValueChange={([value]) => handleScoreChange(question.id, value)}
                        min={0}
                        max={10}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between mt-1 text-xs text-gray-500">
                        <span>0</span>
                        <span>5</span>
                        <span>10</span>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-blue-600 min-w-[60px] text-center">
                      {answers[question.id]?.score || 5}/10
                    </div>
                  </div>

                  <Textarea
                    placeholder="İsteğe bağlı yorum ekleyin..."
                    value={answers[question.id]?.comment || ''}
                    onChange={e => handleCommentChange(question.id, e.target.value)}
                    rows={2}
                    className="resize-none"
                  />
                </div>
              </div>
            ))}

            <div className="space-y-2 pt-4">
              <Label htmlFor="generalComment" className="text-base font-medium">
                Genel Değerlendirme Yorumu
              </Label>
              <Textarea
                id="generalComment"
                placeholder="Aday hakkında genel görüşlerinizi yazın..."
                value={generalComment}
                onChange={e => setGeneralComment(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            İptal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || loadingQuestions}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              'Değerlendirmeyi Kaydet'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EvaluationFormModal;

