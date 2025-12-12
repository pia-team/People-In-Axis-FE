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
  Divider,
  TablePagination
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
  Person as PersonIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { poolCVService, positionService } from '@/services/cv-sharing';
import { PoolCV, PagedResponse } from '@/types/cv-sharing';
import { MatchedPosition } from '@/types/cv-sharing/matched-position';
import { useKeycloak } from '@/providers/KeycloakProvider';
import PageContainer from '@/components/ui/PageContainer';
import SectionCard from '@/components/ui/SectionCard';
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
  const { hasAnyRole, hasRole } = useKeycloak();
  // EMPLOYEE can only view pool CVs (no edit, delete, match, toggle)
  const isEmployee = hasRole('EMPLOYEE') && !hasAnyRole(['HUMAN_RESOURCES', 'MANAGER', 'COMPANY_MANAGER']);
  const canEdit = hasAnyRole(['COMPANY_MANAGER', 'ADMIN', 'HUMAN_RESOURCES', 'MANAGER']) && !isEmployee;
  // Note: COMPANY_MANAGER filtering is now handled server-side in the backend
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [experienceFilter, setExperienceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [createdByFilter, setCreatedByFilter] = useState<string>('all');
  const [companyFilter, setCompanyFilter] = useState<string>('all');
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
  const [cardPage, setCardPage] = useState(0);
  const [cardRowsPerPage, setCardRowsPerPage] = useState(12);
  const [existingMatches, setExistingMatches] = useState<Record<string, boolean>>({});
  const [matchStatusLoading, setMatchStatusLoading] = useState(false);

  // Fetch all data for filter options (without createdBy and company filters)
  const { data: allDataForFilters } = useQuery<PagedResponse<PoolCV>>({
    queryKey: ['poolCVs', 'all-for-filters', statusFilter, experienceFilter, searchTerm],
    queryFn: async () => {
      const params: Record<string, unknown> = {
        size: 1000, // Get all records to extract filter options
        page: 0
      };
      if (statusFilter !== 'all') {
        params.active = statusFilter === 'active';
      }
      if (experienceFilter !== 'all') {
        const [min, max] = experienceFilter.split('-').map(Number);
        params.minExperience = min;
        params.maxExperience = max || 99;
      }
      if (searchTerm) {
        params.q = searchTerm;
      }
      // Don't apply createdBy and company filters here - we need all options
      return await poolCVService.getPoolCVs(params);
    }
  });

  // Fetch filtered data
  const { data, isPending, refetch } = useQuery<PagedResponse<PoolCV>>({
    queryKey: ['poolCVs', statusFilter, experienceFilter, searchTerm, createdByFilter, companyFilter],
    queryFn: async () => {
      const params: Record<string, unknown> = {
        size: 1000, // Get all records to support client-side filtering
        page: 0
      };
      if (statusFilter !== 'all') {
        params.active = statusFilter === 'active';
      }
      if (experienceFilter !== 'all') {
        const [min, max] = experienceFilter.split('-').map(Number);
        params.minExperience = min;
        params.maxExperience = max || 99;
      }
      if (searchTerm) {
        params.q = searchTerm;
      }
      if (createdByFilter !== 'all') {
        params.createdById = createdByFilter;
      }
      if (companyFilter !== 'all') {
        params.companyId = companyFilter;
      }
      return await poolCVService.getPoolCVs(params);
    }
  });


  const poolCVs = (data?.content || []);
  const allPoolCVsForFilters = (allDataForFilters?.content || []);
  
  // Backend now handles COMPANY_MANAGER filtering server-side
  // No need for client-side filtering as backend returns only CVs created by COMPANY_MANAGER
  const companyManagerFilteredCVs = poolCVs;
  
  // Extract unique createdBy and company options from ALL data (not filtered by createdBy/company)
  const createdByOptions = React.useMemo(() => {
    const unique = new Map<string, { id: string; name: string }>();
    allPoolCVsForFilters.forEach(cv => {
      if (cv.createdById && cv.createdByName) {
        unique.set(cv.createdById, { id: cv.createdById, name: cv.createdByName });
      }
    });
    return Array.from(unique.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [allPoolCVsForFilters]);

  const companyOptions = React.useMemo(() => {
    const unique = new Map<string, { id: string; name: string }>();
    allPoolCVsForFilters.forEach(cv => {
      if (cv.companyId && cv.companyName) {
        unique.set(cv.companyId, { id: cv.companyId, name: cv.companyName });
      }
    });
    return Array.from(unique.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [allPoolCVsForFilters]);
  
  const filteredPoolCVs = companyManagerFilteredCVs.filter(cv =>
    cv.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cv.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cv.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cv.currentPosition?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cv.currentCompany?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset card pagination when filters change
  React.useEffect(() => {
    setCardPage(0);
  }, [searchTerm, experienceFilter, statusFilter, createdByFilter, companyFilter]);

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
    } catch (error: any) {
      // Check if the error is due to matched positions or active applications
      const errorMessage = error?.response?.data?.message || error?.message || '';
      if (errorMessage.includes('POOL_CV_HAS_MATCHED_POSITIONS')) {
        enqueueSnackbar(t('poolCV.cannotDeleteHasMatchedPositions'), { variant: 'error' });
      } else if (errorMessage.includes('POOL_CV_HAS_ACTIVE_APPLICATIONS') || errorMessage.includes('active')) {
        enqueueSnackbar(t('poolCV.cannotDeleteHasActiveApplications'), { variant: 'error' });
      } else {
        enqueueSnackbar(t('error.deleteFailed'), { variant: 'error' });
      }
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
      field: 'createdBy',
      headerName: t('poolCV.createdBy'),
      flex: 1,
      minWidth: 150,
      valueGetter: (params) => {
        const row = params.row as PoolCV;
        return row.createdByName || '';
      },
      renderCell: (params: GridRenderCellParams) => {
        const cv = params.row as PoolCV;
        if (!cv.createdByName) return '';
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
              {cv.createdByName.charAt(0)}
            </Avatar>
            <Typography variant="body2">
              {cv.createdByName}
            </Typography>
          </Box>
        );
      }
    },
    {
      field: 'company',
      headerName: t('common.company'),
      flex: 1,
      minWidth: 150,
      valueGetter: (params) => {
        const row = params.row as PoolCV;
        return row.companyName || '';
      },
      renderCell: (params: GridRenderCellParams) => {
        const cv = params.row as PoolCV;
        if (!cv.companyName) return '';
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BusinessIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            <Typography variant="body2">
              {cv.companyName}
            </Typography>
          </Box>
        );
      }
    },
    {
      field: 'actions', 
      headerName: t('common.actions'), 
      width: 180, 
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const cv = params.row as PoolCV;
        return (
          <Box onClick={(e) => e.stopPropagation()}>
            <Tooltip title={t('common.view')}>
              <IconButton 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/cv-sharing/pool-cvs/${cv.id}`);
                }}
              >
                <ViewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('poolCV.matchPositions')}>
              <IconButton 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleMatchPositions(cv.id);
                }} 
                disabled={matchBusyId === cv.id}
              >
                <WorkIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('poolCV.downloadCV')}>
              <IconButton 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(cv.id);
                }}
              >
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      }
    }
  ], [t, navigate, handleMatchPositions, handleDownload, matchBusyId]);


  return (
    <PageContainer
      title={t('poolCV.titlePlural')}
      actions={
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => refetch()}>{t('common.refresh')}</Button>
          {/* Create Pool CV button - hidden for EMPLOYEE */}
          {canEdit && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/cv-sharing/pool-cvs/new')}
            >
              {t('poolCV.createPoolCV')}
            </Button>
          )}
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
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>{t('poolCV.createdBy')}</InputLabel>
            <Select
              value={createdByFilter}
              onChange={(e) => setCreatedByFilter(e.target.value)}
              label={t('poolCV.createdBy')}
            >
              <MenuItem value="all">{t('common.all')}</MenuItem>
              {createdByOptions.map(option => (
                <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>{t('common.company')}</InputLabel>
            <Select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              label={t('common.company')}
            >
              <MenuItem value="all">{t('common.all')}</MenuItem>
              {companyOptions.map(option => (
                <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
              ))}
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
            <>
            <Grid container spacing={3}>
              {filteredPoolCVs
                .slice(cardPage * cardRowsPerPage, cardPage * cardRowsPerPage + cardRowsPerPage)
                .map((cv) => (
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
                    {cv.experienceYears != null && cv.experienceYears !== undefined && (
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
                    {cv.createdByName && (
                      <ListItem disableGutters>
                        <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <ListItemText 
                          primary={cv.createdByName}
                          secondary={t('poolCV.createdBy')}
                          primaryTypographyProps={{ variant: 'body2' }}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItem>
                    )}
                    {cv.companyName && (
                      <ListItem disableGutters>
                        <BusinessIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <ListItemText 
                          primary={cv.companyName}
                          secondary={t('common.company')}
                          primaryTypographyProps={{ variant: 'body2' }}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
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
            <TablePagination
              component="div"
              count={filteredPoolCVs.length}
              page={cardPage}
              onPageChange={(_, newPage) => setCardPage(newPage)}
              rowsPerPage={cardRowsPerPage}
              onRowsPerPageChange={(e) => {
                setCardRowsPerPage(parseInt(e.target.value, 10));
                setCardPage(0);
              }}
              rowsPerPageOptions={[6, 12, 24, 48]}
              labelRowsPerPage={t('common.rowsPerPage')}
              sx={{ mt: 2 }}
            />
            </>
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
                onRowClick={(params, event) => {
                  // Only navigate if clicking on the row itself, not on action buttons
                  const target = event.target as HTMLElement;
                  if (target.closest('.MuiIconButton-root') || target.closest('.MuiButton-root')) {
                    return; // Don't navigate if clicking on buttons
                  }
                  navigate(`/cv-sharing/pool-cvs/${params.row.id}`);
                }}
                localeText={{
                  MuiTablePagination: {
                    labelRowsPerPage: t('common.rowsPerPage'),
                  },
                  columnMenuSortAsc: t('common.sortByAsc'),
                  columnMenuSortDesc: t('common.sortByDesc'),
                  columnMenuFilter: t('common.filter'),
                  columnMenuHideColumn: t('common.hideColumn'),
                  columnMenuManageColumns: t('common.manageColumns'),
                } as any}
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
            <>
              <List>
                {filteredPoolCVs
                  .slice(cardPage * cardRowsPerPage, cardPage * cardRowsPerPage + cardRowsPerPage)
                  .map((cv) => (
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
                        secondary={
                          <Box>
                            <Typography variant="body2" component="span">
                              {cv.email}
                            </Typography>
                            {cv.currentPosition && (
                              <Typography variant="body2" component="span" sx={{ display: 'block' }}>
                                {cv.currentPosition}{cv.currentCompany ? ' @ ' + cv.currentCompany : ''}
                              </Typography>
                            )}
                            {cv.createdByName && (
                              <Typography variant="caption" color="text.secondary" component="span" sx={{ display: 'block' }}>
                                {t('poolCV.createdBy')}: {cv.createdByName}
                              </Typography>
                            )}
                            {cv.companyName && (
                              <Typography variant="caption" color="text.secondary" component="span" sx={{ display: 'block' }}>
                                {t('common.company')}: {cv.companyName}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
              </List>
              <TablePagination
                component="div"
                count={filteredPoolCVs.length}
                page={cardPage}
                onPageChange={(_, newPage) => setCardPage(newPage)}
                rowsPerPage={cardRowsPerPage}
                onRowsPerPageChange={(e) => {
                  setCardRowsPerPage(parseInt(e.target.value, 10));
                  setCardPage(0);
                }}
                rowsPerPageOptions={[6, 12, 24, 48]}
                labelRowsPerPage={t('common.rowsPerPage')}
                sx={{ mt: 2 }}
              />
            </>
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
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6" fontWeight="bold">
                {t('poolCV.matchedPositions')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {matchDialog.positions.length} {t('poolCV.positionsFound')}
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            {matchDialog.positions.length > 0 ? (
              <Stack spacing={2} sx={{ mt: 1 }}>
                {matchDialog.positions.map((matched) => {
                  const getMatchColor = (score: number) => {
                    if (score >= 80) return 'success';
                    if (score >= 65) return 'primary';
                    if (score >= 50) return 'warning';
                    return 'error';
                  };
                  
                  const isAlreadyMatched = existingMatches[matched.position.id];
                  const matchColor = getMatchColor(matched.matchScore ?? 0);

                  return (
                    <Card
                      key={matched.position.id}
                      sx={{
                        border: isAlreadyMatched ? '2px solid' : '1px solid',
                        borderColor: isAlreadyMatched ? 'success.main' : 'divider',
                        backgroundColor: isAlreadyMatched ? 'success.50' : 'background.paper',
                        position: 'relative'
                      }}
                      elevation={isAlreadyMatched ? 2 : 1}
                    >
                      {isAlreadyMatched && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            backgroundColor: 'success.main',
                            color: 'white',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5
                          }}
                        >
                          <ActiveIcon sx={{ fontSize: 16 }} />
                          <Typography variant="caption" fontWeight="bold">
                            {t('poolCV.alreadyMatched')}
                          </Typography>
                        </Box>
                      )}

                      <CardContent>
                        {/* Position Header */}
                        <Box sx={{ mb: 2, pr: isAlreadyMatched ? 10 : 0 }}>
                          <Typography variant="h6" fontWeight="bold" gutterBottom>
                            {matched.position.title}
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                            <Chip
                              label={matched.position.department || t('position.noDepartment')}
                              size="small"
                              variant="outlined"
                            />
                            <Chip
                              label={matched.position.location || t('position.noLocation')}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        {/* Match Score Section */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {t('common.score')}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip
                                label={`${matched.matchScore ?? '--'}%`}
                                color={matchColor}
                                size="medium"
                                sx={{ fontSize: '1rem', fontWeight: 'bold', px: 1 }}
                              />
                              <Chip
                                label={t(`poolCV.matchLevel.${matched.matchLevel?.toUpperCase() || 'UNKNOWN'}`) || matched.matchLevel}
                                variant="outlined"
                                size="small"
                                color={matchColor}
                              />
                            </Box>
                          </Box>
                        </Box>

                        {/* Breakdown Details */}
                        {matched.breakdown && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                              {t('poolCV.breakdown')}
                            </Typography>
                            <Grid container spacing={1} sx={{ mt: 0.5 }}>
                              <Grid item xs={6} sm={3}>
                                <Box>
                                  <Typography variant="caption" color="text.secondary">
                                    {t('position.skills')}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    fontWeight="medium"
                                    color={(!matched.position.skills || matched.position.skills.length === 0) ? 'text.secondary' : 'text.primary'}
                                  >
                                    {(!matched.position.skills || matched.position.skills.length === 0)
                                      ? t('common.notSpecified')
                                      : `${Math.round((matched.breakdown.skillsScore || 0) * 100)}%`}
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={6} sm={3}>
                                <Box>
                                  <Typography variant="caption" color="text.secondary">
                                    {t('position.experienceYears')}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    fontWeight="medium"
                                    color={(!matched.position.minExperience || matched.position.minExperience === 0) ? 'text.secondary' : 'text.primary'}
                                  >
                                    {(!matched.position.minExperience || matched.position.minExperience === 0)
                                      ? t('common.notSpecified')
                                      : `${Math.round((matched.breakdown.experienceScore || 0) * 100)}%`}
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={6} sm={3}>
                                <Box>
                                  <Typography variant="caption" color="text.secondary">
                                    {t('position.languages')}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    fontWeight="medium"
                                    color={(!matched.position.languages || matched.position.languages.length === 0) ? 'text.secondary' : 'text.primary'}
                                  >
                                    {(!matched.position.languages || matched.position.languages.length === 0)
                                      ? t('common.notSpecified')
                                      : `${Math.round((matched.breakdown.languageScore || 0) * 100)}%`}
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={6} sm={3}>
                                <Box>
                                  <Typography variant="caption" color="text.secondary">
                                    {t('poolCV.aiSimilarity')}
                                  </Typography>
                                  <Typography variant="body2" fontWeight="medium">
                                    {Math.round((matched.breakdown.semanticScore || 0) * 100)}%
                                  </Typography>
                                </Box>
                              </Grid>
                            </Grid>
                          </Box>
                        )}

                        {/* Missing Skills */}
                        {matched.missingRequiredSkills && matched.missingRequiredSkills.length > 0 && (
                          <Box sx={{ mb: 2, p: 1.5, bgcolor: 'error.50', borderRadius: 1, border: '1px solid', borderColor: 'error.200' }}>
                            <Typography variant="subtitle2" color="error.main" fontWeight="bold" gutterBottom>
                              {t('poolCV.missingRequiredSkills')}
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {matched.missingRequiredSkills.map((skill, idx) => (
                                <Chip
                                  key={idx}
                                  label={skill}
                                  size="small"
                                  color="error"
                                  variant="outlined"
                                />
                              ))}
                            </Box>
                          </Box>
                        )}

                        {/* Matched Skills */}
                        {matched.matchedSkills && matched.matchedSkills.length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="success.main" fontWeight="bold" gutterBottom>
                              {t('poolCV.matchedSkills')} ({matched.matchedSkills.length})
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {matched.matchedSkills.slice(0, 10).map((skill, idx) => (
                                <Chip
                                  key={idx}
                                  label={skill}
                                  size="small"
                                  color="success"
                                  variant="outlined"
                                />
                              ))}
                              {matched.matchedSkills.length > 10 && (
                                <Chip
                                  label={`+${matched.matchedSkills.length - 10} ${t('common.more')}`}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          </Box>
                        )}
                        
                        {/* Recommendation */}
                        {matched.recommendation && (
                          <Box sx={{
                            mt: 2,
                            p: 2,
                            bgcolor: 'info.50',
                            borderRadius: 1,
                            borderLeft: '4px solid',
                            borderColor: matchColor === 'success' ? 'success.main' :
                                       matchColor === 'primary' ? 'primary.main' :
                                       matchColor === 'warning' ? 'warning.main' : 'error.main'
                          }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                              {t('poolCV.recommendation')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                              {matched.recommendation}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                      
                      <CardActions sx={{ justifyContent: 'flex-end', gap: 1, px: 2, pb: 2 }}>
                        <Button
                          variant="outlined"
                          startIcon={<ViewIcon />}
                          onClick={() => navigate(`/cv-sharing/positions/${matched.position.id}`)}
                          sx={{ minWidth: 150 }}
                        >
                          {t('position.viewPosition')}
                        </Button>
                        {!isAlreadyMatched && (
                          <Tooltip
                            title={isEmployee ? t('poolCV.employeeCannotConfirmMatch') : ''}
                            arrow
                          >
                            <span>
                              <Button
                                variant="contained"
                                color={matchColor}
                                onClick={() => handleConfirmMatch(matchDialog.poolCVId!, matched.position.id, matched.matchScore)}
                                disabled={confirmBusyId === matched.position.id || matchStatusLoading || isEmployee}
                                sx={{ minWidth: 150 }}
                              >
                                {confirmBusyId === matched.position.id ? t('common.matching') : t('poolCV.confirmMatch')}
                              </Button>
                            </span>
                          </Tooltip>
                        )}
                      </CardActions>
                    </Card>
                  );
                })}
              </Stack>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  {t('poolCV.noMatchingPositions')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {t('poolCV.tryAdjustingFilters')}
                </Typography>
              </Box>
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
