import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { evaluationService } from '@/services/cv-sharing/evaluationService';
import EvaluationFormModal from './EvaluationFormModal';

interface Props {
  applicationId: string;
  onEvaluationComplete?: () => void;
}

/**
 * Button component for EMPLOYEE users to evaluate applications
 * Only shows if user can evaluate (forwarded to them and not yet evaluated)
 */
const EvaluationButton: React.FC<Props> = ({ applicationId, onEvaluationComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [canEvaluate, setCanEvaluate] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkEvaluationPermission();
  }, [applicationId]);

  const checkEvaluationPermission = async () => {
    try {
      setLoading(true);
      const result = await evaluationService.canEvaluate(applicationId);
      setCanEvaluate(result);
    } catch (error) {
      console.error('Error checking evaluation permission:', error);
      setCanEvaluate(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    setIsOpen(false);
    setCanEvaluate(false); // Hide button after successful evaluation
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
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white"
        size="default"
      >
        <Star className="w-4 h-4 mr-2" />
        Aday Değerlendirme
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

