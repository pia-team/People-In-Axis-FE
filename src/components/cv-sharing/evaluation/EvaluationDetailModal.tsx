import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { evaluationService } from '@/services/cv-sharing/evaluationService';
import {
  EvaluationResponse,
  getScoreColor,
  getScoreBgColor,
  CATEGORY_COLORS,
} from '@/types/cv-sharing/evaluation';
import { Loader2, Star, User, Mail, Calendar } from 'lucide-react';
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Değerlendirme Detayı</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : evaluation ? (
          <div className="space-y-6">
            {/* Evaluator Info Card */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Değerlendiren
                  </h3>
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">{evaluation.evaluatedBy.fullName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {evaluation.evaluatedBy.email}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Değerlendirme Bilgileri
                  </h3>
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      {format(new Date(evaluation.evaluatedAt), 'dd MMMM yyyy, HH:mm', {
                        locale: tr,
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className={`text-lg font-bold ${getScoreColor(evaluation.totalScore)}`}>
                      {evaluation.totalScore.toFixed(2)} / 10
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Questions and Answers */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Sorular ve Cevaplar</h3>
              {evaluation.answers.map((answer, index) => (
                <div key={answer.questionId} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-500">
                          Soru {answer.questionOrder}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            CATEGORY_COLORS[answer.questionCategory] ||
                            'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {answer.questionCategory}
                        </span>
                      </div>
                      <p className="font-medium">{answer.questionText}</p>
                    </div>
                    <div
                      className={`ml-4 px-3 py-1 rounded-full ${getScoreBgColor(answer.score)}`}
                    >
                      <span className={`text-lg font-bold ${getScoreColor(answer.score)}`}>
                        {answer.score}/10
                      </span>
                    </div>
                  </div>
                  {answer.comment && (
                    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{answer.comment}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* General Comment */}
            {evaluation.generalComment && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Genel Değerlendirme</h3>
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {evaluation.generalComment}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">Değerlendirme bulunamadı</div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EvaluationDetailModal;

