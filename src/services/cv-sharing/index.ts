export { positionService } from './positionService';
export { applicationService } from './applicationService';
export { poolCVService } from './poolCVService';
export { evaluationService } from './evaluationService';

// Re-export all services as a namespace for convenience
import { positionService } from './positionService';
import { applicationService } from './applicationService';
import { poolCVService } from './poolCVService';
import { evaluationService } from './evaluationService';

export const cvSharingServices = {
  position: positionService,
  application: applicationService,
  poolCV: poolCVService,
  evaluation: evaluationService
};
