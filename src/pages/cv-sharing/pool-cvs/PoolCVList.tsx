import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Stack,
  Badge,
  Card,
  CardContent,
  CardActions,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { ToggleButton, ToggleButtonGroup, ListItemAvatar } from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileDownload as DownloadIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  AttachFile as FileIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { poolCVService, positionService } from '@/services/cv-sharing';
import { PoolCV, PagedResponse } from '@/types/cv-sharing';
import { MatchedPosition } from '@/types/cv-sharing/matched-position';
import { useKeycloak } from '@/providers/KeycloakProvider';
import PageContainer from '@/components/ui/PageContainer';
import SectionCard from '@/components/ui/SectionCard';
import { Tooltip as MuiTooltip } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

interface MatchDialogData {
  open: boolean;
  poolCVId: string | null;
  positions: MatchedPosition[];
}

const PoolCVList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { hasAnyRole } = useKeycloak();
  const canEdit = hasAnyRole(['COMPANY_MANAGER', 'ADMIN']);
  // Note: COMPANY_MANAGER filtering is now handled server-side in the backend
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [experienceFilter, setExperienceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedCV, setSelectedCV] = useState<PoolCV | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [matchDialog, setMatchDialog] = useState<MatchDialogData>({
    open: false,
    poolCVId: null,
    positions: []
  });
  const [matchBusyId, setMatchBusyId] = useState<string | null>(null);
  const [confirmBusyId, setConfirmBusyId] = useState<string | null>(null);
  const [toggleBusyId, setToggleBusyId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'list' | 'compact'>('card');
  const [existingMatches, setExistingMatches] = useState<Record<string, boolean>>({});
  const [matchStatusLoading, setMatchStatusLoading] = useState(false);

  const { data, isPending, refetch } = useQuery<PagedResponse<PoolCV>>({
    queryKey: ['poolCVs', statusFilter, experienceFilter],
    queryFn: async () => {
      const params: Record<string, unknown> = {};
      if (statusFilter !== 'all') {
        params.active = statusFilter === 'active';
      }
      if (experienceFilter !== 'all') {
        const [min, max] = experienceFilter.split('-').map(Number);
        params.minExperience = min;
        params.maxExperience = max || 99;
      }
      return await poolCVService.getPoolCVs(params);
    }
  });


  const poolCVs = (data?.content || []);
  
  // Backend now handles COMPANY_MANAGER filtering server-side
  // No need for client-side filtering as backend returns only CVs created by COMPANY_MANAGER
  const companyManagerFilteredCVs = poolCVs;
  
  const filteredPoolCVs = companyManagerFilteredCVs.filter(cv =>
    cv.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cv.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cv.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cv.currentPosition?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cv.currentCompany?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleStatus = async (cvId: string, currentStatus: boolean) => {
    try {
      if (toggleBusyId === cvId) return;
      setToggleBusyId(cvId);
      await poolCVService.togglePoolCVStatus(cvId, !currentStatus);
      enqueueSnackbar(t('success.updated'), { variant: 'success' });
      await queryClient.invalidateQueries({ queryKey: ['poolCVs'] });
    } catch (error) {
      enqueueSnackbar(t('error.updateFailed'), { variant: 'error' });
    } finally {
      setToggleBusyId(null);
    }
  };

  const hydrateExistingMatches = React.useCallback(async (cvId: string | null, positions: MatchedPosition[]) => {
    if (!cvId || positions.length === 0) {
      setExistingMatches({});
      return;
    }
    setMatchStatusLoading(true);
    try {
      const entries = await Promise.all(
        positions.map(async (matched) => {
          try {
            const res = await positionService.getMatchesForPosition(matched.position.id, 0, 50);
            const isMatched = res.content?.some(existing => existing.poolCvId === cvId) ?? false;
            return [matched.position.id, isMatched] as const;
          } catch {
            return [matched.position.id, false] as const;
          }
        })
      );
      setExistingMatches(Object.fromEntries(entries));
    } finally {
      setMatchStatusLoading(false);
    }
  }, []);

  const handleConfirmMatch = async (cvId: string, positionId: string, matchScore?: number) => {
    try {
      if (confirmBusyId === positionId) return;
      setConfirmBusyId(positionId);
      await poolCVService.matchPosition(cvId, positionId, matchScore ? { matchScore } : undefined);
      enqueueSnackbar(t('poolCV.matchedSuccessfully'), { variant: 'success' });
      // Refresh dialog data
      const positions = await poolCVService.matchPositionsForPoolCV(cvId);
      setMatchDialog(md => ({ ...md, positions }));
      void hydrateExistingMatches(cvId, positions || []);
      // Invalidate position caches to refresh applications count and list
      await queryClient.invalidateQueries({ queryKey: ['position', positionId] });
      await queryClient.invalidateQueries({ queryKey: ['position-matches', positionId] });
    } catch (error) {
      enqueueSnackbar(t('error.createFailed'), { variant: 'error' });
    } finally {
      setConfirmBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!selectedCV) return;
    
    try {
      await poolCVService.deletePoolCV(selectedCV.id);
      enqueueSnackbar(t('poolCV.poolCVDeleted'), { variant: 'success' });
      setDeleteDialogOpen(false);
      setSelectedCV(null);
      await queryClient.invalidateQueries({ queryKey: ['poolCVs'] });
    } catch (error) {
      enqueueSnackbar(t('error.deleteFailed'), { variant: 'error' });
    }
  };

  const handleMatchPositions = async (cvId: string) => {
    try {
      if (matchBusyId === cvId) return;
      setMatchBusyId(cvId);
      const positions = await poolCVService.matchPositionsForPoolCV(cvId);
      setMatchDialog({
        open: true,
        poolCVId: cvId,
        positions: positions || []
      });
      void hydrateExistingMatches(cvId, positions || []);
    } catch (error) {
      enqueueSnackbar(t('error.loadFailed', { item: t('position.titlePlural').toLowerCase() }), { variant: 'error' });
    } finally {
      setMatchBusyId(null);
    }
  };

  const handleDownload = async (cvId: string) => {
    try {
      const detail = await poolCVService.getPoolCVById(cvId);
      const files = detail.files;
      if (!files || files.length === 0) {
        enqueueSnackbar(t('poolCV.noFiles'), { variant: 'info' });
        return;
      }
      const first = files[0];
      const blob = await poolCVService.downloadFile(cvId, first.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = first.fileName || 'cv-file';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      enqueueSnackbar(t('error.downloadFailed'), { variant: 'error' });
    }
  };

  const getExperienceColor = (years: number): 'default' | 'primary' | 'secondary' | 'success' => {
    if (years < 2) return 'default';
    if (years < 5) return 'primary';
    if (years < 10) return 'secondary';
    return 'success';
  };

  const listColumns: GridColDef[] = React.useMemo(() => [
    {
      field: 'name',
      headerName: t('common.name'),
      flex: 1,
      minWidth: 180,
      valueGetter: (params) => {
        const row = params.row as PoolCV;
        if (!row) return '';
        return `${row.firstName || ''} ${row.lastName || ''}`.trim();
      },
      renderCell: (params: GridRenderCellParams) => {
        const cv = params.row as PoolCV;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 28, height: 28 }}>
              {String(cv.firstName || '').charAt(0)}
              {String(cv.lastName || '').charAt(0)}
            </Avatar>
            <Typography variant="body2">
              {cv.firstName} {cv.lastName}
            </Typography>
          </Box>
        );
      }
    },
    { field: 'email', headerName: t('poolCV.email'), flex: 1, minWidth: 200 },
    { 
      field: 'phone', 
      headerName: t('poolCV.phone'), 
      width: 140, 
      valueGetter: (params) => (params.row as PoolCV)?.phone || ''
    },
    {
      field: 'role', 
      headerName: t('position.title'), 
      flex: 1, 
      minWidth: 180,
      valueGetter: (params) => {
        const row = params.row as PoolCV;
        if (!row) return '';
        return row.currentPosition ? `${row.currentPosition}${row.currentCompany ? ' • ' + row.currentCompany : ''}` : '';
      }
    },
    {
      field: 'isActive', 
      headerName: t('common.status'), 
      width: 120,
      valueGetter: (params) => (params.row as PoolCV)?.isActive ? 1 : 0,
      renderCell: (params: GridRenderCellParams) => {
        const r = params.row as PoolCV;
        return (
          <Chip
            size="small"
            icon={r.isActive ? <ActiveIcon /> : <InactiveIcon />}
            label={r.isActive ? t('poolCV.active') : t('poolCV.inactive')}
            color={r.isActive ? 'success' : 'default'}
          />
        );
      }
    },
    { 
      field: 'fileCount', 
      headerName: t('poolCV.files'), 
      width: 90, 
      type: 'number',
      valueGetter: (params) => (params.row as PoolCV)?.fileCount ?? 0
    },
    {
      field: 'actions', headerName: t('common.actions'), width: 220, sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const cv = params.row as PoolCV;
        return (
          <Box>
            <Tooltip title={t('common.view')}>
              <IconButton size="small" onClick={() => navigate(`/cv-sharing/pool-cvs/${cv.id}`)}>
                <ViewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {canEdit && (
              <Tooltip title={t('common.edit')}>
                <IconButton size="small" onClick={() => navigate(`/cv-sharing/pool-cvs/${cv.id}/edit`)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title={t('poolCV.matchPositions')}>
              <IconButton size="small" onClick={() => handleMatchPositions(cv.id)} disabled={matchBusyId === cv.id}>
                <WorkIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('poolCV.downloadCV')}>
              <IconButton size="small" onClick={() => handleDownload(cv.id)}>
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {canEdit && (
              <Tooltip title={cv.isActive ? t('common.deactivate') : t('common.activate')}>
                <IconButton size="small" onClick={() => handleToggleStatus(cv.id, cv.isActive)} disabled={toggleBusyId === cv.id}>
                  {cv.isActive ? <InactiveIcon fontSize="small" /> : <ActiveIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      }
    }
  ], [t, navigate, canEdit, handleMatchPositions, handleDownload, handleToggleStatus, matchBusyId, toggleBusyId]);


  return (
    <PageContainer
      title={t('poolCV.titlePlural')}
      actions={
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => refetch()}>{t('common.refresh')}</Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/cv-sharing/pool-cvs/new')}
          >
            {t('poolCV.createPoolCV')}
          </Button>
        </Stack>
      }
    >
      <Stack spacing={2}>
        <SectionCard>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <TextField
              size="small"
              placeholder={t('poolCV.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ flexGrow: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>{t('poolCV.experienceYears')}</InputLabel>
            <Select
              value={experienceFilter}
              onChange={(e) => setExperienceFilter(e.target.value)}
              label={t('poolCV.experienceYears')}
            >
              <MenuItem value="all">{t('common.all')}</MenuItem>
              <MenuItem value="0-2">0-2 {t('common.years')}</MenuItem>
              <MenuItem value="2-5">2-5 {t('common.years')}</MenuItem>
              <MenuItem value="5-10">5-10 {t('common.years')}</MenuItem>
              <MenuItem value="10-99">10+ {t('common.years')}</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>{t('common.status')}</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              label={t('common.status')}
            >
              <MenuItem value="all">{t('common.all')}</MenuItem>
              <MenuItem value="active">{t('poolCV.active')}</MenuItem>
              <MenuItem value="inactive">{t('poolCV.inactive')}</MenuItem>
            </Select>
          </FormControl>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={viewMode}
            onChange={(_, v) => v && setViewMode(v)}
            sx={{ ml: 'auto' }}
          >
            <ToggleButton value="card"><ViewIcon fontSize="small" /></ToggleButton>
            <ToggleButton value="list"><ViewIcon fontSize="small" /></ToggleButton>
            <ToggleButton value="compact"><WorkIcon fontSize="small" /></ToggleButton>
          </ToggleButtonGroup>
          </Stack>
        </SectionCard>
        <SectionCard>
          {viewMode === 'card' && (
            <Grid container spacing={3}>
              {filteredPoolCVs.map((cv) => (
                <Grid item xs={12} md={6} lg={4} key={cv.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ width: 56, height: 56, mr: 2 }}>
                        {cv.firstName[0]}{cv.lastName[0]}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6">
                          {cv.firstName} {cv.lastName}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            size="small"
                            icon={cv.isActive ? <ActiveIcon /> : <InactiveIcon />}
                            label={cv.isActive ? t('poolCV.active') : t('poolCV.inactive')}
                            color={cv.isActive ? 'success' : 'default'}
                          />
                          {(cv.fileCount ?? 0) > 0 && (
                            <Badge badgeContent={cv.fileCount} color="primary">
                              <FileIcon fontSize="small" />
                            </Badge>
                          )}
                        </Box>
                      </Box>
                    </Box>

                  <List dense>
                    <ListItem disableGutters>
                      <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <ListItemText primary={cv.email} />
                    </ListItem>
                    {cv.phone && (
                      <ListItem disableGutters>
                        <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <ListItemText primary={cv.phone} />
                      </ListItem>
                    )}
                    {cv.currentPosition && (
                      <ListItem disableGutters>
                        <WorkIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <ListItemText 
                          primary={cv.currentPosition}
                          secondary={cv.currentCompany}
                        />
                      </ListItem>
                    )}
                    {cv.experienceYears !== undefined && (
                      <ListItem disableGutters>
                        <SchoolIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <ListItemText>
                          <Chip
                            size="small"
                            label={`${cv.experienceYears} ${t('common.years')} ${t('poolCV.experience')}`}
                            color={getExperienceColor(cv.experienceYears)}
                          />
                        </ListItemText>
                      </ListItem>
                    )}
                  </List>
                </CardContent>

                <Divider />

                <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
                  <Box>
                    <Tooltip title={t('common.view')}>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/cv-sharing/pool-cvs/${cv.id}`)}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    {canEdit && (
                      <Tooltip title={t('common.edit')}>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/cv-sharing/pool-cvs/${cv.id}/edit`)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title={t('poolCV.downloadCV')}>
                      <IconButton size="small" onClick={() => handleDownload(cv.id)}>
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Box>
                    <Button
                      size="small"
                      onClick={() => handleMatchPositions(cv.id)}
                      disabled={matchBusyId === cv.id}
                    >
                      {t('poolCV.matchPositions')}
                    </Button>
                    {canEdit && (
                      <>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleStatus(cv.id, cv.isActive)}
                          color={cv.isActive ? 'default' : 'primary'}
                          disabled={toggleBusyId === cv.id}
                        >
                          {cv.isActive ? <InactiveIcon /> : <ActiveIcon />}
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedCV(cv);
                            setDeleteDialogOpen(true);
                          }}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
          )}

          {viewMode === 'list' && (
            <Box sx={{ width: '100%' }}>
              <DataGrid
                rows={filteredPoolCVs}
                columns={listColumns}
                getRowId={(row) => row.id}
                autoHeight
                disableRowSelectionOnClick
                pageSizeOptions={[10, 25, 50, 100]}
                initialState={{
                    pagination: { paginationModel: { pageSize: 100 } },
                    sorting: { sortModel: [{ field: 'name', sort: 'asc' }] }
                  }}
                onRowClick={(params) => navigate(`/cv-sharing/pool-cvs/${params.row.id}`)}
                sx={{ 
                  border: 'none',
                  '& .MuiDataGrid-row': {
                    cursor: 'pointer'
                  }
                }}
              />
            </Box>
          )}

          {viewMode === 'compact' && (
            <List>
              {filteredPoolCVs.map((cv) => (
                <ListItem key={cv.id}
                  secondaryAction={
                    <Button size="small" onClick={() => navigate(`/cv-sharing/pool-cvs/${cv.id}`)}>{t('common.view')}</Button>
                  }
                >
                  <ListItemAvatar>
                    <Avatar>{cv.firstName[0]}{cv.lastName[0]}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${cv.firstName} ${cv.lastName}`}
                    secondary={`${cv.email}${cv.currentPosition ? ' • ' + cv.currentPosition : ''}${cv.currentCompany ? ' @ ' + cv.currentCompany : ''}`}
                  />
                </ListItem>
              ))}
            </List>
          )}

          {filteredPoolCVs.length === 0 && !isPending && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                {t('poolCV.noCVsFound')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {t('poolCV.tryAdjustingFilters')}
              </Typography>
            </Box>
          )}
        </SectionCard>
      </Stack>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>{t('poolCV.deletePoolCV')}</DialogTitle>
          <DialogContent>
            <Typography>
              {t('poolCV.deleteConfirm')}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleDelete} color="error" variant="contained">
              {t('common.delete')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Match Positions Dialog */}
        <Dialog
          open={matchDialog.open}
          onClose={() => {
            setMatchDialog({ open: false, poolCVId: null, positions: [] });
            setExistingMatches({});
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>{t('poolCV.matchedPositions')}</DialogTitle>
          <DialogContent>
            {matchDialog.positions.length > 0 ? (
              <List>
                {matchDialog.positions.map((matched) => {
                  const getMatchColor = (score: number) => {
                    if (score >= 80) return 'success';
                    if (score >= 65) return 'primary';
                    if (score >= 50) return 'warning';
                    return 'error';
                  };
                  
                  return (
                    <ListItem key={matched.position.id}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {matched.position.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {matched.position.department || t('position.noDepartment')} • {matched.position.location || t('position.noLocation')}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                          <MuiTooltip 
                            title={
                              <Box>
                                <Typography variant="caption" display="block">
                                  {t('position.skills')}: {Math.round(matched.breakdown.skillsScore * 100)}%
                                </Typography>
                                <Typography variant="caption" display="block">
                                  {t('position.experienceYears')}: {Math.round(matched.breakdown.experienceScore * 100)}%
                                </Typography>
                                <Typography variant="caption" display="block">
                                  {t('position.languages')}: {Math.round(matched.breakdown.languageScore * 100)}%
                                </Typography>
                                <Typography variant="caption" display="block">
                                  {t('poolCV.aiSimilarity')}: {Math.round(matched.breakdown.semanticScore * 100)}%
                                </Typography>
                              </Box>
                            }
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" fontWeight="bold">
                                {t('common.score')}:
                              </Typography>
                              <Chip
                                label={`${matched.matchScore ?? '--'}%`}
                                color={getMatchColor(matched.matchScore ?? 0)}
                                size="small"
                              />
                            </Box>
                          </MuiTooltip>
                          
                          <Chip
                            label={t(`poolCV.matchLevel.${matched.matchLevel?.toUpperCase() || 'UNKNOWN'}`) || matched.matchLevel}
                            variant="outlined"
                            size="small"
                            color={getMatchColor(matched.matchScore ?? 0)}
                          />
                        </Box>
                        
                        {matched.missingRequiredSkills && matched.missingRequiredSkills.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" color="error">
                              {t('poolCV.missing')}: {matched.missingRequiredSkills.join(', ')}
                            </Typography>
                          </Box>
                        )}
                        
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                          {(() => {
                            // Map backend recommendation strings to translation keys
                            const recommendationMap: Record<string, string> = {
                              'Highly recommended candidate. Strong match across all criteria.': t('poolCV.highlyRecommended'),
                              'Good candidate with some skill gaps. Consider for interview with skills assessment.': t('poolCV.goodCandidateSkillGaps'),
                              'Strong skills but limited experience. Good potential for growth.': t('poolCV.strongSkillsLimitedExperience'),
                              'Solid candidate. Recommended for interview.': t('poolCV.solidCandidate'),
                              'Moderate match. Review specific requirements before proceeding.': t('poolCV.moderateMatch'),
                              'Limited match. Consider only if other candidates unavailable.': t('poolCV.limitedMatch'),
                            };
                            return recommendationMap[matched.recommendation] || matched.recommendation;
                          })()}
                        </Typography>
                      </Box>
                      
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => navigate(`/cv-sharing/positions/${matched.position.id}`)}
                        >
                          {t('position.viewPosition')}
                        </Button>
                        {!existingMatches[matched.position.id] && (
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleConfirmMatch(matchDialog.poolCVId!, matched.position.id, matched.matchScore)}
                            disabled={confirmBusyId === matched.position.id || matchStatusLoading}
                          >
                            {confirmBusyId === matched.position.id ? t('common.matching') : t('poolCV.confirmMatch')}
                          </Button>
                        )}
                      </Stack>
                      {existingMatches[matched.position.id] && (
                        <Typography variant="caption" color="success.main" sx={{ mt: 0.5, display: 'block' }}>
                          {t('poolCV.alreadyMatched')}
                        </Typography>
                      )}
                    </ListItem>
                  );
                })}
              </List>
            ) : (
              <Typography>{t('poolCV.noMatchingPositions')}</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setMatchDialog({ open: false, poolCVId: null, positions: [] })}>
              {t('common.close')}
            </Button>
          </DialogActions>
        </Dialog>
    </PageContainer>
  );
};

export default PoolCVList;
