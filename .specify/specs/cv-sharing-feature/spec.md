# CV Sharing and Application Feature Specification

## Feature Overview
**Feature Name**: CV Sharing and Application System  
**Type**: Feature Extension  
**Target Projects**: People-In-Axis-BE (Backend), People-In-Axis-FE (Frontend)  
**Integration Type**: Extension of existing platform  

## Context and Constraints

### Project Integration Requirements
- **MUST** integrate with existing People-In-Axis projects (BE and FE)
- **MUST NOT** change existing screens or current look & feel
- **MUST** follow existing project style and patterns
- **MUST** use existing Keycloak installation for authentication
- **MUST** maintain compatibility with existing user roles and permissions

### Technical Constraints
- Backend: Integrate with existing People-In-Axis-BE architecture
- Frontend: Extend People-In-Axis-FE with new modules
- Authentication: Leverage existing Keycloak realm and configurations
- Database: Extend existing database schema
- UI/UX: Follow existing design system and component library

## Functional Requirements

### Core Features (from plan.md)

#### 1. Position Management (HR)
- Create, edit, activate/deactivate positions
- Template-based position creation
- Multi-field position details (department, location, skills, languages, experience)
- Position lifecycle: Draft → Active → Passive/Closed → Archive

#### 2. Application Management
- Application submission via form or Pool CV selection
- Application states: New → In Review → Forwarded → Meeting Scheduled → Decision → Archive
- Support for withdrawal by applicant
- KVKK compliance with explicit consent

#### 3. Pool CV Management
- Company users can create/edit their pool CVs
- HR can view/download/comment/rate (no editing)
- Tag-based organization
- Pre-fill application forms from Pool CV

#### 4. Review and Forwarding System
- Multi-recipient forwarding (Employee/Manager)
- Comment and rating system (1-5 scale)
- Manager can forward to other reviewers
- Audit trail for all actions

#### 5. Meeting Scheduling
- Calendar integration with .ics support
- Provider support (Teams/Zoom/Meet/Other)
- Email notifications with calendar invites
- Reschedule and cancellation capabilities

#### 6. Security and Compliance
- KVKK/GDPR compliance
- PII encryption at rest
- Masked display of sensitive data (TCKN)
- Signed URLs for secure file access
- Complete audit logging

## Non-Functional Requirements

### Performance
- List API p95 < 500ms
- Detail API p95 < 350ms
- Signed URL generation < 200ms

### Security
- TLS encryption in transit
- AES-256 encryption at rest
- Role-based access control (RBAC)
- Tenant isolation
- Rate limiting on auth and file endpoints

### Scalability
- Pagination for all list endpoints
- Database indexing strategy
- Async processing for heavy operations

## User Roles and Permissions

### Platform Admin
- Tenant/company management
- User/role management
- Global settings
- No default access to PII/CV content

### HR (Company-wide)
- Full position management
- Application review and management
- Meeting scheduling
- View-only access to Pool CVs
- Access to audit logs

### Company User
- Apply to positions
- Manage own Pool CVs
- View own applications
- Withdraw applications

### Employee
- Review forwarded applications
- Add comments and ratings
- View assigned applications

### Manager
- Employee permissions plus
- Forward applications to others

## Integration Points

### Existing Systems
- **Keycloak**: User authentication and authorization
- **People-In-Axis-BE**: Backend API extensions
- **People-In-Axis-FE**: Frontend module integration
- **Existing Database**: Schema extensions

### New Components
- CV storage service
- File upload/download with virus scanning
- Email notification service
- Calendar integration service

## Data Model Extensions

### New Entities
- Position
- Application
- PoolCV
- Comment
- Rating
- Forwarding
- Meeting
- KVKKConsent
- AuditLog

### Relationships
- All entities scoped by `company_id`
- Cross-tenant access prevented
- User-entity relationships maintained

## API Endpoints

### New API Routes (v1)
- `/v1/positions/*` - Position management
- `/v1/applications/*` - Application management
- `/v1/pool-cvs/*` - Pool CV management
- `/v1/files/*` - File operations
- `/v1/notifications/*` - Notifications
- `/v1/logs/*` - Audit logs

## Implementation Phases

### Phase 1 (MVP)
- Core position management
- Basic application flow
- Pool CV functionality
- Comment/rating system
- Email notifications
- Basic KVKK compliance

### Phase 2
- Advanced filtering and search
- Templates
- Enhanced reporting
- File scanning queue

### Phase 3
- External calendar OAuth integrations
- Multi-language support
- Advanced analytics

## Success Criteria
- Seamless integration with existing platform
- No disruption to current functionality
- Consistent UI/UX with existing design
- All KVKK compliance requirements met
- Performance targets achieved

## Dependencies
- Existing Keycloak configuration
- Current database access
- Email service provider (TBD)
- Antivirus scanning service (TBD)
- File storage solution (S3-compatible)
