param(
    [switch]$Json,
    [switch]$RequireTasks,
    [switch]$IncludeTasks
)

$FEATURE_DIR = Resolve-Path '.specify\specs\cv-sharing-feature'
$AVAILABLE_DOCS = @()

# Check for available documents
$docs = @('spec.md', 'plan.md', 'tasks.md', 'research.md', 'data-model.md', 'quickstart.md', 'README.md')
foreach ($doc in $docs) {
    $docPath = Join-Path $FEATURE_DIR $doc
    if (Test-Path $docPath) {
        $AVAILABLE_DOCS += (Resolve-Path $docPath).Path
    }
}

# Check for contracts directory
$contractsDir = Join-Path $FEATURE_DIR 'contracts'
if (Test-Path $contractsDir) {
    $contracts = Get-ChildItem -Path $contractsDir -File
    foreach ($contract in $contracts) {
        $AVAILABLE_DOCS += $contract.FullName
    }
}

# Check for checklists directory
$checklistsDir = Join-Path $FEATURE_DIR 'checklists'
$CHECKLISTS_EXIST = Test-Path $checklistsDir

$result = @{
    FEATURE_DIR = $FEATURE_DIR.Path
    AVAILABLE_DOCS = $AVAILABLE_DOCS
    TASKS_REQUIRED = $RequireTasks
    TASKS_EXIST = (Test-Path (Join-Path $FEATURE_DIR 'tasks.md'))
    CHECKLISTS_EXIST = $CHECKLISTS_EXIST
}

if ($Json) {
    $result | ConvertTo-Json
} else {
    Write-Host "Feature Directory: $($result.FEATURE_DIR)"
    Write-Host "Available Documents:"
    $result.AVAILABLE_DOCS | ForEach-Object { Write-Host "  - $_" }
    if ($RequireTasks -and -not $result.TASKS_EXIST) {
        Write-Host "ERROR: tasks.md is required but not found!" -ForegroundColor Red
    }
}
