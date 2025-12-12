import React, { useState } from 'react';
import { Button } from '@mui/material';
import { Description as FileTextIcon } from '@mui/icons-material';
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
        variant="outlined"
        color="success"
        startIcon={<FileTextIcon />}
      >
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
