param(
    [switch]$Json
)

# Configuration
$SPECS_DIR = ".specify\specs"
$FEATURE_NAME = "cv-sharing-feature"
$BRANCH = "feature/cv-sharing-integration"

# Paths
$FEATURE_SPEC = Join-Path $SPECS_DIR "$FEATURE_NAME\spec.md"
$IMPL_PLAN = Join-Path $SPECS_DIR "$FEATURE_NAME\plan.md"

# Ensure directories exist
$specPath = Join-Path $SPECS_DIR $FEATURE_NAME
if (-not (Test-Path $specPath)) {
    New-Item -ItemType Directory -Path $specPath -Force | Out-Null
}

# Copy plan template if it doesn't exist
if (-not (Test-Path $IMPL_PLAN)) {
    $templatePath = ".specify\templates\plan.md"
    if (-not (Test-Path $templatePath)) {
        # Create a basic plan template
        $planTemplate = @"
# Implementation Plan

## Feature
CV Sharing and Application System

## Technical Context
- **Existing Backend**: People-In-Axis-BE
- **Existing Frontend**: People-In-Axis-FE
- **Authentication**: Keycloak (existing installation)
- **Database**: [NEEDS CLARIFICATION - PostgreSQL/MySQL?]
- **File Storage**: [NEEDS CLARIFICATION - S3/MinIO/Local?]
- **Email Service**: [NEEDS CLARIFICATION - SMTP/SendGrid?]

## Constitution Check
- [ ] Integration with existing platform
- [ ] No breaking changes
- [ ] Design consistency maintained
- [ ] KVKK compliance implemented
- [ ] Performance standards met
- [ ] Multi-tenancy enforced

## Phase 0: Research and Clarification

### Unknowns to Resolve
1. Database technology and schema location
2. File storage solution
3. Email service configuration
4. Existing API patterns and conventions
5. Current frontend component library
6. Deployment pipeline

## Phase 1: Design and Contracts

### Data Model Design
- To be generated after research

### API Contracts
- To be generated after research

### Integration Points
- To be defined after research

## Phase 2: Implementation Tasks

### Backend Tasks
- To be generated after design

### Frontend Tasks
- To be generated after design

### Infrastructure Tasks
- To be generated after design

## Risk Assessment
- Integration complexity with existing system
- Data migration requirements
- Performance impact on existing features
- Security vulnerabilities

## Success Metrics
- All acceptance criteria met
- Performance targets achieved
- Zero breaking changes
- Full KVKK compliance
"@
        New-Item -ItemType Directory -Path ".specify\templates" -Force -ErrorAction SilentlyContinue | Out-Null
        Set-Content -Path $templatePath -Value $planTemplate
    }
    
    if (Test-Path $templatePath) {
        Copy-Item $templatePath $IMPL_PLAN -Force
    }
}

# Output configuration
if ($Json) {
    $output = @{
        FEATURE_SPEC = (Resolve-Path $FEATURE_SPEC).Path
        IMPL_PLAN = (Resolve-Path $IMPL_PLAN).Path
        SPECS_DIR = (Resolve-Path $SPECS_DIR).Path
        BRANCH = $BRANCH
    }
    $output | ConvertTo-Json
} else {
    Write-Host "Setup complete for CV Sharing Feature" -ForegroundColor Green
    Write-Host "Feature Spec: $FEATURE_SPEC"
    Write-Host "Implementation Plan: $IMPL_PLAN"
    Write-Host "Branch: $BRANCH"
}
