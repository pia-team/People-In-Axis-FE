# Research and Technical Discovery

## Phase 0: Research Results

### 1. Database Technology
**Decision**: PostgreSQL  
**Rationale**: Already in use in the existing backend (confirmed in application.yml)  
**Alternatives considered**: None - maintaining consistency with existing infrastructure

### 2. Database Schema and Conventions
**Decision**: Use existing schema with Liquibase migrations  
**Details**:
- Database: `people_in_axis`
- Migration tool: Liquibase (enabled in application.yml)
- Changelog location: `db/changelog/db.changelog-master.xml`
- Naming convention: snake_case for tables and columns
- JPA/Hibernate with PostgreSQL dialect

### 3. File Storage
**Decision**: Local file system with configurable upload directory  
**Details**:
- Upload directory: `${FILE_UPLOAD_DIR:./uploads}`
- Max file size: 10MB
- Allowed extensions: pdf, doc, docx, xls, xlsx, png, jpg, jpeg
**Rationale**: Already configured in application.yml
**Future consideration**: Can migrate to S3/MinIO if needed

### 4. Email Service
**Decision**: SMTP with configurable provider  
**Details**:
- Default: Gmail SMTP (smtp.gmail.com:587)
- Configuration via environment variables
- STARTTLS enabled
- From address: `${MAIL_FROM:noreply@peopleinaxis.com}`
**Rationale**: Already configured and working

### 5. Frontend Stack
**Decision**: React 18 with TypeScript, Vite, and Material-UI  
**Details**:
- React: 18.2.0
- TypeScript: 5.3.3
- Build tool: Vite 6.3.6
- UI Library: Material-UI 5.15.10
- State Management: Redux Toolkit 2.2.1
- Data Fetching: TanStack Query 5.22.2
- Forms: React Hook Form 7.50.1
- Routing: React Router DOM 6.22.1
- Authentication: Keycloak JS 24.0.1
- Internationalization: i18next

### 6. Backend Stack
**Decision**: Spring Boot 3.3.4 with Java 21  
**Details**:
- Java version: 21
- Spring Boot: 3.3.4
- ORM: Spring Data JPA with Hibernate
- Security: Spring Security with OAuth2 Resource Server
- API Documentation: SpringDoc OpenAPI
- DTO Mapping: MapStruct
- Utilities: Lombok
- Build tool: Maven

### 7. API Conventions
**Decision**: RESTful API with JWT authentication  
**Details**:
- Base path: `/api`
- Version prefix: `/v1` for new endpoints
- Authentication: JWT tokens from Keycloak
- CORS enabled for configured origins
- OpenAPI documentation at `/swagger-ui.html`
- Standard HTTP status codes
- JSON request/response format

### 8. Authentication and Authorization
**Decision**: Keycloak with existing realm  
**Details**:
- Realm: `orbitant-realm`
- Server URL: `https://diam.dnext-pia.com`
- Client: `people-in-axis-backend`
- JWT validation via Spring Security OAuth2
- Role-based access control

### 9. Deployment and Infrastructure
**Decision**: Standard Spring Boot deployment  
**Details**:
- Port: 8080
- Context path: `/api`
- Actuator endpoints for health monitoring
- Logging to file and console
- Environment-based configuration (dev/prod)

### 10. Testing Framework
**Decision**: Existing test infrastructure  
**Frontend**:
- Unit tests: Vitest
- E2E tests: Playwright
**Backend**:
- JUnit for unit tests
- Spring Boot Test for integration tests

## Technical Decisions Summary

### Confirmed Technology Stack
- **Database**: PostgreSQL with Liquibase migrations
- **Backend**: Spring Boot 3.3.4, Java 21, Spring Data JPA
- **Frontend**: React 18, TypeScript, Material-UI, Vite
- **Authentication**: Keycloak (existing installation)
- **File Storage**: Local filesystem (configurable)
- **Email**: SMTP (configurable provider)
- **API Pattern**: RESTful with JWT

### Integration Strategy
1. **Backend Integration**:
   - Add new entities to existing JPA structure
   - Create new controllers in `com.pia.controller` package
   - Implement services in `com.pia.service` package
   - Add DTOs to `com.pia.dto` package
   - Extend existing security configuration

2. **Frontend Integration**:
   - Create new feature modules in `src/pages/cv-sharing/`
   - Add new services in `src/services/`
   - Extend existing types in `src/types/`
   - Use existing Material-UI theme and components
   - Integrate with existing Redux store if needed

3. **Database Integration**:
   - Create new Liquibase changesets
   - Follow existing naming conventions
   - Add proper indexes for performance
   - Maintain referential integrity

### Security Considerations
- Leverage existing Keycloak roles
- Implement company-scoped data access
- Use existing JWT validation
- Apply existing CORS configuration
- Encrypt sensitive data using existing patterns

### File Handling Strategy
- Use existing file upload configuration
- Implement virus scanning (ClamAV or cloud service - TBD)
- Generate signed URLs for secure access
- Store files in configured upload directory
- Implement file cleanup policies

### Email Integration
- Use existing Spring Mail configuration
- Create email templates for notifications
- Implement async email sending
- Add email queue for reliability

## Next Steps
With all technical unknowns resolved, we can proceed to:
1. Design the detailed data model
2. Create API contracts
3. Plan implementation tasks
4. Set up development environment
