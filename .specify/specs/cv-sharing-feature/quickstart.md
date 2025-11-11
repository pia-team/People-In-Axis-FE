# CV Sharing Feature - Developer Quickstart Guide

## Overview
This guide helps developers quickly set up and start working on the CV Sharing and Application feature for the People-In-Axis platform.

## Prerequisites
- Java 21
- Node.js 18+
- PostgreSQL 14+
- Maven 3.8+
- Git
- Access to Keycloak instance (https://diam.dnext-pia.com)

## Project Structure

### Backend (People-In-Axis-BE)
```
src/main/java/com/pia/
├── controller/
│   ├── PositionController.java
│   ├── ApplicationController.java
│   └── PoolCVController.java
├── service/
│   ├── PositionService.java
│   ├── ApplicationService.java
│   └── PoolCVService.java
├── entity/
│   ├── Position.java
│   ├── Application.java
│   └── PoolCV.java
├── dto/
│   ├── position/
│   ├── application/
│   └── poolcv/
└── repository/
    ├── PositionRepository.java
    ├── ApplicationRepository.java
    └── PoolCVRepository.java
```

### Frontend (People-In-Axis-FE)
```
src/
├── pages/
│   └── cv-sharing/
│       ├── positions/
│       │   ├── PositionList.tsx
│       │   ├── PositionForm.tsx
│       │   └── PositionDetail.tsx
│       ├── applications/
│       │   ├── ApplicationList.tsx
│       │   ├── ApplicationForm.tsx
│       │   └── ApplicationDetail.tsx
│       └── pool-cvs/
│           ├── PoolCVList.tsx
│           ├── PoolCVForm.tsx
│           └── PoolCVDetail.tsx
├── services/
│   ├── positionService.ts
│   ├── applicationService.ts
│   └── poolCVService.ts
└── types/
    └── cv-sharing.ts
```

## Quick Setup

### 1. Backend Setup

```bash
# Navigate to backend directory
cd C:\Users\kizirb\Documents\People-In-Axis-BE

# Install dependencies
mvn clean install

# Set environment variables (create .env file)
DB_USERNAME=postgres
DB_PASSWORD=postgres
KEYCLOAK_CLIENT_SECRET=your-secret
MAIL_USERNAME=your-email
MAIL_PASSWORD=your-password

# Run database migrations
mvn liquibase:update

# Start the backend server
mvn spring-boot:run
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd C:\Users\kizirb\Documents\People-In-Axis-FE

# Install dependencies
npm install

# Start development server
npm run dev
```

### 3. Database Setup

Create the database if it doesn't exist:
```sql
CREATE DATABASE people_in_axis;
```

The Liquibase migrations will automatically create the required tables.

## Development Workflow

### Creating a New Feature

#### Backend
1. Create entity in `entity/` package
2. Create repository in `repository/` package
3. Create DTOs in `dto/` package
4. Implement service in `service/` package
5. Create controller in `controller/` package
6. Add Liquibase migration in `resources/db/changelog/`

#### Frontend
1. Define types in `types/cv-sharing.ts`
2. Create service in `services/`
3. Build components in `pages/cv-sharing/`
4. Add routes in `App.tsx`
5. Implement state management if needed

### API Development

All new endpoints follow this pattern:
```
/api/v1/{resource}
```

Example:
```java
@RestController
@RequestMapping("/api/v1/positions")
public class PositionController {
    // Implementation
}
```

### Authentication

All endpoints are protected by JWT authentication. Include the bearer token in requests:
```typescript
const response = await axios.get('/api/v1/positions', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## Key Implementation Files

### Backend Files to Create

1. **Entities** (in `entity/` package):
   - Position.java
   - Application.java
   - PoolCV.java
   - Comment.java
   - Rating.java
   - Meeting.java

2. **Repositories** (in `repository/` package):
   - PositionRepository.java
   - ApplicationRepository.java
   - PoolCVRepository.java

3. **Services** (in `service/` package):
   - PositionService.java
   - ApplicationService.java
   - PoolCVService.java
   - FileService.java
   - EmailService.java

4. **Controllers** (in `controller/` package):
   - PositionController.java
   - ApplicationController.java
   - PoolCVController.java
   - FileController.java

### Frontend Files to Create

1. **Types** (`types/cv-sharing.ts`):
```typescript
export interface Position {
  id: string;
  name: string;
  title: string;
  // ... other fields
}

export interface Application {
  id: string;
  positionId: string;
  firstName: string;
  lastName: string;
  // ... other fields
}
```

2. **Services** (`services/positionService.ts`):
```typescript
import { apiClient } from '@/config/api';

export const positionService = {
  getAll: (params) => apiClient.get('/v1/positions', { params }),
  getById: (id) => apiClient.get(`/v1/positions/${id}`),
  create: (data) => apiClient.post('/v1/positions', data),
  update: (id, data) => apiClient.patch(`/v1/positions/${id}`, data),
};
```

3. **Components** (`pages/cv-sharing/positions/PositionList.tsx`):
```tsx
import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useQuery } from '@tanstack/react-query';
import { positionService } from '@/services/positionService';

export const PositionList: React.FC = () => {
  // Implementation
};
```

## Testing

### Backend Testing
```bash
# Run unit tests
mvn test

# Run integration tests
mvn verify
```

### Frontend Testing
```bash
# Run unit tests
npm test

# Run E2E tests
npm run e2e
```

## Common Tasks

### Adding a New Database Table
1. Create Liquibase changeset in `resources/db/changelog/`
2. Run `mvn liquibase:update`

### Adding a New API Endpoint
1. Add method to controller
2. Document with OpenAPI annotations
3. Add corresponding service method
4. Create DTOs for request/response

### Adding a New Frontend Page
1. Create component in `pages/cv-sharing/`
2. Add route in `App.tsx`
3. Add navigation link if needed
4. Create service methods for API calls

## Environment Variables

### Backend (.env)
```
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=people_in_axis

KEYCLOAK_AUTH_SERVER_URL=https://diam.dnext-pia.com
KEYCLOAK_REALM=orbitant-realm
KEYCLOAK_CLIENT_SECRET=your-secret

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email
MAIL_PASSWORD=your-password

FILE_UPLOAD_DIR=./uploads
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8080/api
VITE_KEYCLOAK_URL=https://diam.dnext-pia.com
VITE_KEYCLOAK_REALM=orbitant-realm
VITE_KEYCLOAK_CLIENT_ID=people-in-axis-frontend
```

## Troubleshooting

### Common Issues

1. **Database connection error**
   - Check PostgreSQL is running
   - Verify database credentials
   - Ensure database exists

2. **Keycloak authentication fails**
   - Verify Keycloak is accessible
   - Check client configuration
   - Ensure realm settings are correct

3. **Frontend can't connect to backend**
   - Check CORS configuration
   - Verify API URL in frontend config
   - Ensure backend is running

## Support

For questions or issues:
1. Check existing documentation in `/dist/docs/`
2. Review the specification in `.specify/specs/cv-sharing-feature/`
3. Contact the development team

## Next Steps

1. Review the full specification in `spec.md`
2. Check the data model in `data-model.md`
3. Review API contracts in `contracts/api-spec.yaml`
4. Start with implementing basic CRUD operations
5. Add business logic and validations
6. Implement security and access controls
7. Add comprehensive testing
