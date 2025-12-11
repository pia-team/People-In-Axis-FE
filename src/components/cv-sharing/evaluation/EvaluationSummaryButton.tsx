import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import EvaluationSummaryModal from './EvaluationSummaryModal';

interface Props {
  applicationId: string;
  evaluationCount?: number;
}

/**
 * Button component for HR/MANAGER users to view evaluation summaries
 * Shows count of evaluations
 */
const EvaluationSummaryButton: React.FC<Props> = ({ applicationId, evaluationCount = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Don't show button if no evaluations
  if (evaluationCount === 0) {
    return null;
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
        size="default"
      >
        <FileText className="w-4 h-4 mr-2" />
        Değerlendirmeleri Gör ({evaluationCount})
      </Button>

      <EvaluationSummaryModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        applicationId={applicationId}
      />
    </>
  );
};

export default EvaluationSummaryButton;

