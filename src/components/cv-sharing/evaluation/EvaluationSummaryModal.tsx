import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { evaluationService } from '@/services/cv-sharing/evaluationService';
import { EvaluationSummary, getScoreColor, getScoreBgColor } from '@/types/cv-sharing/evaluation';
import { Star, TrendingUp, Loader2 } from 'lucide-react';
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

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Aday Değerlendirme Özeti</DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : summary ? (
            <div className="space-y-6">
              {/* Average Score Card */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Ortalama Değerlendirme Puanı
                    </p>
                    <div className="flex items-center gap-2">
                      <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                      <span className={`text-4xl font-bold ${getScoreColor(summary.averageScore)}`}>
                        {summary.averageScore.toFixed(2)}
                      </span>
                      <span className="text-2xl text-gray-400">/10</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Toplam Değerlendirme
                    </p>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      <span className="text-3xl font-bold text-blue-600">
                        {summary.completedEvaluations}
                      </span>
                      <span className="text-gray-400">/ {summary.totalForwardings}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Evaluators List */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Değerlendirmeler</h3>
                {summary.evaluators.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Henüz değerlendirme yapılmamış
                  </div>
                ) : (
                  summary.evaluators.map(evaluator => (
                    <div
                      key={evaluator.evaluationId}
                      className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-colors"
                      onClick={() => setSelectedEvaluationId(evaluator.evaluationId)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {evaluator.evaluatorName}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {evaluator.evaluatorEmail}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {format(new Date(evaluator.evaluatedAt), 'dd MMMM yyyy, HH:mm', {
                              locale: tr,
                            })}
                          </p>
                        </div>
                        <div
                          className={`px-4 py-2 rounded-full ${getScoreBgColor(
                            evaluator.score
                          )}`}
                        >
                          <span className={`text-xl font-bold ${getScoreColor(evaluator.score)}`}>
                            {evaluator.score.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">Değerlendirme bulunamadı</div>
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

