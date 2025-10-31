# Data Model Design

## Entity Definitions

### 1. Position
```sql
CREATE TABLE positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    location VARCHAR(255),
    work_type VARCHAR(50), -- ONSITE, REMOTE, HYBRID
    min_experience INTEGER,
    education_level VARCHAR(50),
    description TEXT,
    requirements TEXT,
    visibility VARCHAR(50) DEFAULT 'PUBLIC', -- PUBLIC, INTERNAL
    application_deadline TIMESTAMP,
    salary_range_min DECIMAL(10,2),
    salary_range_max DECIMAL(10,2),
    status VARCHAR(50) NOT NULL, -- DRAFT, ACTIVE, PASSIVE, CLOSED, ARCHIVED
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_position_company FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE INDEX idx_positions_company ON positions(company_id);
CREATE INDEX idx_positions_status ON positions(status);
CREATE INDEX idx_positions_deadline ON positions(application_deadline);
```

### 2. Position Skills
```sql
CREATE TABLE position_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    position_id UUID NOT NULL REFERENCES positions(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_position_skills_position ON position_skills(position_id);
```

### 3. Position Languages
```sql
CREATE TABLE position_languages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    position_id UUID NOT NULL REFERENCES positions(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL,
    proficiency_level VARCHAR(20) NOT NULL, -- A1, A2, B1, B2, C1, C2, NATIVE
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_position_languages_position ON position_languages(position_id);
```

### 4. Pool CV
```sql
CREATE TABLE pool_cvs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    tckn VARCHAR(255), -- Encrypted
    birth_date DATE,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    experience_years INTEGER,
    current_position VARCHAR(255),
    current_company VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    kvkk_consent_id UUID,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pool_cvs_company ON pool_cvs(company_id);
CREATE INDEX idx_pool_cvs_email ON pool_cvs(email);
CREATE INDEX idx_pool_cvs_active ON pool_cvs(is_active);
```

### 5. Pool CV Skills
```sql
CREATE TABLE pool_cv_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pool_cv_id UUID NOT NULL REFERENCES pool_cvs(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    proficiency_level VARCHAR(50),
    years_of_experience INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pool_cv_skills_cv ON pool_cv_skills(pool_cv_id);
```

### 6. Pool CV Languages
```sql
CREATE TABLE pool_cv_languages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pool_cv_id UUID NOT NULL REFERENCES pool_cvs(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL,
    proficiency_level VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pool_cv_languages_cv ON pool_cv_languages(pool_cv_id);
```

### 7. Pool CV Tags
```sql
CREATE TABLE pool_cv_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pool_cv_id UUID NOT NULL REFERENCES pool_cvs(id) ON DELETE CASCADE,
    tag_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pool_cv_tags_cv ON pool_cv_tags(pool_cv_id);
CREATE INDEX idx_pool_cv_tags_name ON pool_cv_tags(tag_name);
```

### 8. Applications
```sql
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    position_id UUID NOT NULL REFERENCES positions(id),
    company_id UUID NOT NULL REFERENCES companies(id),
    pool_cv_id UUID REFERENCES pool_cvs(id),
    -- Applicant Information (can be from pool or manual entry)
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    tckn VARCHAR(255), -- Encrypted
    birth_date DATE,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    experience_years INTEGER,
    -- Application specific fields
    expected_salary DECIMAL(10,2),
    available_start_date DATE,
    notice_period_days INTEGER,
    cover_letter TEXT,
    status VARCHAR(50) NOT NULL, -- NEW, IN_REVIEW, FORWARDED, MEETING_SCHEDULED, ACCEPTED, REJECTED, WITHDRAWN, ARCHIVED
    kvkk_consent_id UUID,
    applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    withdrawn_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_applications_position ON applications(position_id);
CREATE INDEX idx_applications_company ON applications(company_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_email ON applications(email);
```

### 9. Application Files
```sql
CREATE TABLE application_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    pool_cv_id UUID REFERENCES pool_cvs(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    mime_type VARCHAR(100),
    is_cv BOOLEAN DEFAULT false,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_parent CHECK (
        (application_id IS NOT NULL AND pool_cv_id IS NULL) OR 
        (application_id IS NULL AND pool_cv_id IS NOT NULL)
    )
);

CREATE INDEX idx_application_files_application ON application_files(application_id);
CREATE INDEX idx_application_files_pool_cv ON application_files(pool_cv_id);
```

### 10. Comments
```sql
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_comments_application ON comments(application_id);
CREATE INDEX idx_comments_user ON comments(user_id);
```

### 11. Ratings
```sql
CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(application_id, user_id)
);

CREATE INDEX idx_ratings_application ON ratings(application_id);
CREATE INDEX idx_ratings_user ON ratings(user_id);
```

### 12. Forwardings
```sql
CREATE TABLE forwardings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    forwarded_by UUID NOT NULL REFERENCES users(id),
    forwarded_to UUID NOT NULL REFERENCES users(id),
    message TEXT,
    forwarded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_forwardings_application ON forwardings(application_id);
CREATE INDEX idx_forwardings_to ON forwardings(forwarded_to);
```

### 13. Meetings
```sql
CREATE TABLE meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id),
    organized_by UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    duration_minutes INTEGER NOT NULL,
    provider VARCHAR(50), -- TEAMS, ZOOM, MEET, OTHER
    meeting_link TEXT,
    location VARCHAR(255),
    description TEXT,
    status VARCHAR(50) NOT NULL, -- SCHEDULED, COMPLETED, CANCELLED
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_meetings_application ON meetings(application_id);
CREATE INDEX idx_meetings_start ON meetings(start_time);
CREATE INDEX idx_meetings_status ON meetings(status);
```

### 14. Meeting Participants
```sql
CREATE TABLE meeting_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    is_required BOOLEAN DEFAULT true,
    response_status VARCHAR(50), -- PENDING, ACCEPTED, DECLINED, TENTATIVE
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_meeting_participants_meeting ON meeting_participants(meeting_id);
```

### 15. KVKK Consents
```sql
CREATE TABLE kvkk_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL, -- APPLICATION, POOL_CV
    entity_id UUID NOT NULL,
    consent_text TEXT NOT NULL,
    version VARCHAR(20) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    given_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP
);

CREATE INDEX idx_kvkk_consents_entity ON kvkk_consents(entity_type, entity_id);
```

### 16. Audit Logs
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
```

### 17. Position Templates
```sql
CREATE TABLE position_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    template_name VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    title VARCHAR(255),
    department VARCHAR(100),
    location VARCHAR(255),
    work_type VARCHAR(50),
    min_experience INTEGER,
    education_level VARCHAR(50),
    description TEXT,
    requirements TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_position_templates_company ON position_templates(company_id);
```

## Relationships

### Primary Relationships
1. **Position** → Company (many-to-one)
2. **Application** → Position (many-to-one)
3. **Application** → Pool CV (many-to-one, optional)
4. **Comment** → Application (many-to-one)
5. **Rating** → Application (many-to-one)
6. **Meeting** → Application (many-to-one)
7. **Forwarding** → Application (many-to-one)

### Security Relationships
- All entities scoped by `company_id` for multi-tenancy
- User references for audit trail
- KVKK consent tracking for compliance

## Data Encryption Strategy

### At-Rest Encryption
- TCKN fields: AES-256 encryption
- Sensitive personal data: Column-level encryption
- File storage: Encrypted filesystem

### In-Transit Encryption
- TLS 1.3 for all API communications
- Signed URLs for file access
- JWT tokens for authentication

## Indexing Strategy

### Performance Indexes
- Foreign key indexes for all relationships
- Status field indexes for filtering
- Date field indexes for sorting
- Email/TCKN indexes for searching (hashed)

### Composite Indexes
```sql
CREATE INDEX idx_applications_company_status ON applications(company_id, status);
CREATE INDEX idx_positions_company_status ON positions(company_id, status);
CREATE INDEX idx_pool_cvs_company_active ON pool_cvs(company_id, is_active);
```

## Migration Strategy

### Liquibase Changesets
1. Create base tables
2. Add foreign key constraints
3. Create indexes
4. Insert initial data
5. Add triggers for updated_at

### Rollback Plan
- Each changeset with rollback SQL
- Data backup before migration
- Staged deployment approach
