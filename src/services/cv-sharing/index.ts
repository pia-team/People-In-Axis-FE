export { positionService } from './positionService';
export { applicationService } from './applicationService';
export { poolCVService } from './poolCVService';

// Re-export all services as a namespace for convenience
import { positionService } from './positionService';
import { applicationService } from './applicationService';
import { poolCVService } from './poolCVService';

export const cvSharingServices = {
  position: positionService,
  application: applicationService,
  poolCV: poolCVService
};
