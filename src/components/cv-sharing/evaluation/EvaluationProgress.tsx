import React, { useState, useEffect } from 'react';
import { evaluationService } from '@/services/cv-sharing/evaluationService';
import { EvaluationProgress as EvaluationProgressType } from '@/types/cv-sharing/evaluation';
import { CheckCircle, Clock, Loader2, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

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
      <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
        <div className="flex justify-center items-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (!progress || progress.totalForwardings === 0) {
    return null;
  }

  return (
    <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Değerlendirme Durumu
        </h3>
        <span className="text-2xl font-bold text-blue-600">
          {progress.completedEvaluations}/{progress.totalForwardings}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-4">
        <div
          className="bg-blue-600 h-4 rounded-full transition-all duration-500 flex items-center justify-center"
          style={{ width: `${progress.completionPercentage}%` }}
        >
          {progress.completionPercentage > 10 && (
            <span className="text-xs font-medium text-white">
              %{progress.completionPercentage.toFixed(0)}
            </span>
          )}
        </div>
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        %{progress.completionPercentage.toFixed(0)} tamamlandı
      </div>

      {/* Forwarding List */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          İletilen Kullanıcılar
        </h4>
        {progress.forwardings.map(f => (
          <div
            key={f.forwardingId}
            className={`flex items-center justify-between p-3 rounded border transition-colors ${
              f.isCompleted
                ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="flex-1">
              <div className="font-medium">{f.forwardedToName}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{f.forwardedToEmail}</div>
            </div>

            {f.isCompleted ? (
              <div className="text-green-600 dark:text-green-400 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">
                  {f.evaluatedAt &&
                    format(new Date(f.evaluatedAt), 'dd MMM yyyy', { locale: tr })}
                </span>
              </div>
            ) : (
              <div className="text-gray-400 dark:text-gray-500 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span className="text-sm">Beklemede</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EvaluationProgress;

