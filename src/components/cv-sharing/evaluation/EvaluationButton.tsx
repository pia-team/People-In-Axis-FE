import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import { Star as StarIcon, Edit as EditIcon } from '@mui/icons-material';
import { evaluationService } from '@/services/cv-sharing/evaluationService';
import EvaluationFormModal from './EvaluationFormModal';

interface Props {
  applicationId: string;
  onEvaluationComplete?: () => void;
}

/**
 * Button component for EMPLOYEE users to evaluate/edit applications
 * Shows if user can evaluate (forwarded to them) - allows both new evaluation and editing existing one
 */
const EvaluationButton: React.FC<Props> = ({ applicationId, onEvaluationComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [canEvaluate, setCanEvaluate] = useState(false);
  const [hasExistingEvaluation, setHasExistingEvaluation] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkEvaluationPermission();
  }, [applicationId]);

  const checkEvaluationPermission = async () => {
    try {
      setLoading(true);
      const canEval = await evaluationService.canEvaluate(applicationId);
      setCanEvaluate(canEval);
      
      // Check if there's an existing evaluation
      const existingEval = await evaluationService.getMyEvaluation(applicationId);
      setHasExistingEvaluation(!!existingEval);
    } catch (error) {
      console.error('Error checking evaluation permission:', error);
      setCanEvaluate(false);
      setHasExistingEvaluation(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    setIsOpen(false);
    // Refresh evaluation status
    checkEvaluationPermission();
    if (onEvaluationComplete) {
      onEvaluationComplete();
    }
  };

  if (loading || !canEvaluate) {
    return null;
  }

  return (
    <>
      <Button
        variant="contained"
        color={hasExistingEvaluation ? "secondary" : "primary"}
        onClick={() => setIsOpen(true)}
        startIcon={hasExistingEvaluation ? <EditIcon /> : <StarIcon />}
      >
        {hasExistingEvaluation ? 'Değerlendirmeyi Düzenle' : 'Aday Değerlendirme'}
      </Button>

      <EvaluationFormModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        applicationId={applicationId}
        onSuccess={handleSuccess}
      />
    </>
  );
};

export default EvaluationButton;

