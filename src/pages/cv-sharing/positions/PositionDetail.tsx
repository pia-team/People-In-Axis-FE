import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Chip,
  Button,
  Grid,
  Divider,
  Stack,
  IconButton,
  Alert,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Tooltip,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Archive as ArchiveIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  AttachMoney as SalaryIcon,
  CalendarToday as CalendarIcon,
  Business as DepartmentIcon,
  CheckCircle as CheckIcon,
  School as EducationIcon,
  Language as LanguageIcon,
  Psychology as SkillIcon,
  ArrowBack as BackIcon,
  People as ApplicantsIcon,
  Visibility as ViewIcon,
  Share as ShareIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { positionService } from '@/services/cv-sharing';
import { PositionStatus, WorkType } from '@/types/cv-sharing';
import { format } from 'date-fns';
import PageContainer from '@/components/ui/PageContainer';
import SectionCard from '@/components/ui/SectionCard';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useKeycloak } from '@/providers/KeycloakProvider';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`position-tabpanel-${index}`}
      aria-labelledby={`position-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const PositionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [tabValue, setTabValue] = useState(0);
  const queryClient = useQueryClient();
  const { hasRole } = useKeycloak();
  const isHR = hasRole('HUMAN_RESOURCES');
  const isCompanyManager = hasRole('COMPANY_MANAGER');
  const [isArchiving, setIsArchiving] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [statusMenuAnchor, setStatusMenuAnchor] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: position, isPending } = useQuery({
    queryKey: ['position', id],
    queryFn: () => positionService.getPositionById(id!),
    enabled: !!id
  });

  const [appsPage, setAppsPage] = useState(0);
  const appsPageSize = 10;
  const { data: matchesPage } = useQuery({
    queryKey: ['position-matches', id, appsPage, appsPageSize],
    queryFn: () => positionService.getMatchesForPosition(id!, appsPage, appsPageSize),
    enabled: !!id
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenStatusMenu = (e: React.MouseEvent<HTMLElement>) => {
    setStatusMenuAnchor(e.currentTarget);
  };

  const handleCloseStatusMenu = () => {
    setStatusMenuAnchor(null);
  };

  const handleStatusChange = async (newStatus: PositionStatus) => {
    if (!id) return;
    try {
      const updated = await positionService.updatePositionStatus(id, newStatus);
      // Update detail cache for instant UI reflection
      queryClient.setQueryData(['position', id], updated);
      enqueueSnackbar(`Position status updated to ${newStatus}`, { variant: 'success' });
      // Sync lists
      queryClient.invalidateQueries({ queryKey: ['positions'] });
    } catch (error) {
      enqueueSnackbar('Failed to update position status', { variant: 'error' });
    } finally {
      handleCloseStatusMenu();
    }
  };

  // Use matches page total elements for accurate count, fallback to position applicationCount
  const applicationsCount = matchesPage?.pageInfo?.totalElements ?? position?.applicationCount ?? 0;

  const handleActivate = async () => {
    try {
      setIsActivating(true);
      const updated = await positionService.updatePositionStatus(id!, PositionStatus.ACTIVE);
      // Update detail cache for instant UI reflection
      queryClient.setQueryData(['position', id], updated);
      enqueueSnackbar('Position activated successfully', { variant: 'success' });
      // Sync lists
      queryClient.invalidateQueries({ queryKey: ['positions'] });
    } catch (error) {
      enqueueSnackbar('Failed to activate position', { variant: 'error' });
    } finally {
      setIsActivating(false);
    }
  };

  const handleEdit = () => {
    navigate(`/cv-sharing/positions/${id}/edit`);
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await positionService.deletePosition(id!);
      enqueueSnackbar('Position deleted successfully', { variant: 'success' });
      // Invalidate positions list cache to refresh the list
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      queryClient.invalidateQueries({ queryKey: ['position', id] });
      navigate('/cv-sharing/positions');
    } catch (error) {
      enqueueSnackbar('Failed to delete position', { variant: 'error' });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleDuplicate = () => {
    // Navigate to new position form with duplicate data
    navigate('/cv-sharing/positions/new', {
      state: { duplicateFrom: id }
    });
  };

  const handleArchive = async () => {
    try {
      setIsArchiving(true);
      const updated = await positionService.updatePositionStatus(id!, PositionStatus.ARCHIVED);
      // Update the detail cache immediately for instant UI feedback
      queryClient.setQueryData(['position', id], updated);
      enqueueSnackbar('Position archived successfully', { variant: 'success' });
      // Keep list views in sync
      queryClient.invalidateQueries({ queryKey: ['positions'] });
    } catch (error) {
      enqueueSnackbar('Failed to archive position', { variant: 'error' });
    } finally {
      setIsArchiving(false);
    }
  };

  const getStatusColor = (status: PositionStatus) => {
    switch (status) {
      case PositionStatus.DRAFT:
        return 'default';
      case PositionStatus.ACTIVE:
        return 'success';
      case PositionStatus.PASSIVE:
        return 'warning';
      case PositionStatus.CLOSED:
        return 'error';
      case PositionStatus.ARCHIVED:
        return 'default';
      default:
        return 'default';
    }
  };

  const getWorkTypeColor = (type: WorkType) => {
    switch (type) {
      case WorkType.REMOTE:
        return 'primary';
      case WorkType.HYBRID:
        return 'secondary';
      case WorkType.ONSITE:
        return 'default';
      default:
        return 'default';
    }
  };

  if (isPending) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!position) {
    return (
      <PageContainer>
        <Alert severity="error">Position not found</Alert>
      </PageContainer>
    );
  }

  // Restrict non-HR from viewing non-active positions
  if (!isHR && position.status !== PositionStatus.ACTIVE) {
    return (
      <PageContainer>
        <Alert severity="warning">You can only view active positions.</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={position.title}
      actions={
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<BackIcon />}
            onClick={() => navigate('/cv-sharing/positions')}
          >
            Back
          </Button>
          <Button
            variant="outlined"
            startIcon={<ShareIcon />}
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              enqueueSnackbar('Link copied to clipboard', { variant: 'success' });
            }}
          >
            Share
          </Button>
          <Tooltip title={isCompanyManager ? 'Company Manager sadece görüntüleme yapabilir' : (isHR ? 'Duplicate' : 'Yalnızca İnsan Kaynakları kopyalayabilir')}>
            <span>
              <Button
                variant="outlined"
                startIcon={<CopyIcon />}
                onClick={handleDuplicate}
                disabled={!isHR || isCompanyManager}
              >
                Duplicate
              </Button>
            </span>
          </Tooltip>
          <Tooltip title={isCompanyManager ? 'Company Manager sadece görüntüleme yapabilir' : (isHR ? 'Change Status' : 'Yalnızca İnsan Kaynakları durumu değiştirebilir')}>
            <span>
              <IconButton
                size="small"
                onClick={handleOpenStatusMenu}
                disabled={!isHR || isCompanyManager}
              >
                <MoreVertIcon />
              </IconButton>
            </span>
          </Tooltip>
          {position.status === PositionStatus.ARCHIVED ? (
            <Tooltip title={isCompanyManager ? 'Company Manager sadece görüntüleme yapabilir' : (isHR ? 'Activate' : 'Yalnızca İnsan Kaynakları aktive edebilir')}>
              <span>
                <Button
                  variant="outlined"
                  startIcon={<CheckIcon />}
                  onClick={handleActivate}
                  disabled={!isHR || isCompanyManager || isActivating}
                >
                  Activate
                </Button>
              </span>
            </Tooltip>
          ) : (
            <Tooltip title={isCompanyManager ? 'Company Manager sadece görüntüleme yapabilir' : (isHR ? 'Archive' : 'Yalnızca İnsan Kaynakları arşivleyebilir')}>
              <span>
                <Button
                  variant="outlined"
                  startIcon={<ArchiveIcon />}
                  onClick={handleArchive}
                  disabled={!isHR || isCompanyManager || isArchiving}
                >
                  Archive
                </Button>
              </span>
            </Tooltip>
          )}
          <Tooltip title={isCompanyManager ? 'Company Manager sadece görüntüleme yapabilir' : (isHR ? 'Edit' : 'Yalnızca İnsan Kaynakları düzenleyebilir')}>
            <span>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleEdit}
                disabled={!isHR || isCompanyManager}
              >
                Edit
              </Button>
            </span>
          </Tooltip>
          <Tooltip title={isCompanyManager ? 'Company Manager sadece görüntüleme yapabilir' : (isHR ? 'Delete' : 'Yalnızca İnsan Kaynakları silebilir')}>
            <span>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteDialogOpen(true)}
                disabled={!isHR || isCompanyManager}
              >
                Delete
              </Button>
            </span>
          </Tooltip>
        </Stack>
      }
    >
      <Stack spacing={3}>
        {/* Header Card */}
        <SectionCard>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="h4" gutterBottom>
                    {position.title}
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Chip
                      label={position.status}
                      color={getStatusColor(position.status)}
                      size="small"
                    />
                    <Chip
                      label={position.workType}
                      color={getWorkTypeColor(position.workType as WorkType)}
                      size="small"
                      icon={<WorkIcon />}
                    />
                    <Chip
                      label={`${applicationsCount} Applications`}
                      color="info"
                      size="small"
                      icon={<ApplicantsIcon />}
                    />
                  </Stack>
                </Box>
                <Typography variant="body1" color="text.secondary">
                  {position.description}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DepartmentIcon color="action" />
                  <Typography variant="body2">
                    <strong>Department:</strong> {position.department}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationIcon color="action" />
                  <Typography variant="body2">
                    <strong>Location:</strong> {position.location}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarIcon color="action" />
                  <Typography variant="body2">
                    <strong>Deadline:</strong> {position.applicationDeadline ? format(new Date(position.applicationDeadline), 'dd/MM/yyyy') : 'No deadline'}
                  </Typography>
                </Box>
                {(position.salaryRangeMin != null || position.salaryRangeMax != null) && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SalaryIcon color="action" />
                    <Typography variant="body2">
                      <strong>Salary:</strong> {
                        position.salaryRangeMin != null && position.salaryRangeMax != null
                          ? `$${position.salaryRangeMin.toLocaleString()} - $${position.salaryRangeMax.toLocaleString()}`
                          : position.salaryRangeMin != null
                            ? `$${position.salaryRangeMin.toLocaleString()} +`
                            : `up to $${position.salaryRangeMax!.toLocaleString()}`
                      }
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Grid>
          </Grid>
        </SectionCard>

        {/* Tabs */}
        <Paper sx={{ width: '100%' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="position tabs">
            <Tab label="Requirements" />
            <Tab label="Applications" />
            <Tab label="Details" />
          </Tabs>
        </Paper>

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Textual Requirements */}
            {position.requirements && (
              <Grid item xs={12}>
                <SectionCard>
                  <Typography variant="h6" gutterBottom>
                    Requirements
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {position.requirements}
                  </Typography>
                </SectionCard>
              </Grid>
            )}
            {/* Required Skills */}
            {position.skills && position.skills.length > 0 && (
              <Grid item xs={12} md={6}>
                <SectionCard>
                  <Typography variant="h6" gutterBottom>
                    <SkillIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Required Skills
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {position.skills.map((skill, index) => {
                      const label = `${skill.name}${skill.proficiencyLevel ? ` (${skill.proficiencyLevel})` : ''}`;
                      return (
                        <Chip
                          key={index}
                          label={label}
                          variant="outlined"
                          color="primary"
                          size="small"
                        />
                      );
                    })}
                  </Stack>
                </SectionCard>
              </Grid>
            )}

            {/* Required Languages */}
            {position.languages && position.languages.length > 0 && (
              <Grid item xs={12} md={6}>
                <SectionCard>
                  <Typography variant="h6" gutterBottom>
                    <LanguageIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Required Languages
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <List dense>
                    {position.languages.map((lang, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckIcon color="success" />
                        </ListItemIcon>
                        <ListItemText
                          primary={lang.code}
                          secondary={`Level: ${lang.proficiencyLevel}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </SectionCard>
              </Grid>
            )}

            {/* Education Requirements */}
            {position.educationLevel && (
              <Grid item xs={12} md={6}>
                <SectionCard>
                  <Typography variant="h6" gutterBottom>
                    <EducationIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Education Requirements
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body1">
                    {position.educationLevel}
                  </Typography>
                </SectionCard>
              </Grid>
            )}

            {/* Experience */}
            {position.minExperience !== undefined && (
              <Grid item xs={12} md={6}>
                <SectionCard>
                  <Typography variant="h6" gutterBottom>
                    <WorkIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Experience Required
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h4" color="primary">
                    {position.minExperience}+ years
                  </Typography>
                </SectionCard>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <SectionCard>
            <Typography variant="h6" gutterBottom>
              Applications ({applicationsCount})
            </Typography>
            <Divider sx={{ my: 2 }} />
            {matchesPage && (matchesPage.content?.length ?? 0) > 0 ? (
              <List>
                {matchesPage.content.map((m: any, idx: number) => (
                  <ListItem
                    key={`${m.poolCvId}-${idx}`}
                    secondaryAction={
                      <Stack direction="row" spacing={1} alignItems="center">
                        {m.matchScore != null && (
                          <Chip label={`Score: ${m.matchScore}`} size="small" color="primary" />
                        )}
                        {m.matchedAt ? (
                          <Chip label={format(new Date(m.matchedAt), 'dd/MM/yyyy')} size="small" />
                        ) : (
                          <Chip label="N/A" size="small" variant="outlined" />
                        )}
                        {!isCompanyManager && (
                          <IconButton
                            edge="end"
                            aria-label="view"
                            onClick={() => navigate(`/cv-sharing/applications?positionId=${id}`)}
                          >
                            <ViewIcon />
                          </IconButton>
                        )}
                      </Stack>
                    }
                  >
                    <ListItemIcon>
                      <Avatar>
                        {m.firstName?.[0]}{m.lastName?.[0]}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={`${m.firstName} ${m.lastName}`}
                      secondary={m.email}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No matches found
              </Typography>
            )}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                disabled={!matchesPage || appsPage <= 0}
                onClick={() => setAppsPage((p) => Math.max(0, p - 1))}
              >
                Previous
              </Button>
              <Typography variant="body2" color="text.secondary">
                Page {appsPage + 1} of {matchesPage?.pageInfo?.totalPages ?? 1}
              </Typography>
              <Button
                variant="outlined"
                disabled={!matchesPage || (appsPage + 1) >= (matchesPage.pageInfo?.totalPages ?? 1)}
                onClick={() => setAppsPage((p) => p + 1)}
              >
                Next
              </Button>
            </Box>
          </SectionCard>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <SectionCard>
            <Typography variant="h6" gutterBottom>
              Additional Details
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Created At
                </Typography>
                <Typography variant="body1">
                  {position.createdAt ? format(new Date(position.createdAt), 'dd/MM/yyyy HH:mm') : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Updated At
                </Typography>
                <Typography variant="body1">
                  {position.updatedAt ? format(new Date(position.updatedAt), 'dd/MM/yyyy HH:mm') : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Internal Name
                </Typography>
                <Typography variant="body1">
                  {position.name || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Created By
                </Typography>
                <Typography variant="body1">
                  {position.createdBy || 'System'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Created By ID
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                  {position.createdById || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Visibility
                </Typography>
                <Typography variant="body1">
                  {position.visibility || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Position ID
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                  {position.id}
                </Typography>
              </Grid>
            </Grid>
          </SectionCard>
        </TabPanel>
      </Stack>
      <Menu
        anchorEl={statusMenuAnchor}
        open={Boolean(statusMenuAnchor)}
        onClose={handleCloseStatusMenu}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {Object.values(PositionStatus)
          .filter((s) => s !== position.status && s !== PositionStatus.ARCHIVED)
          .map((status) => (
            <MenuItem key={status} onClick={() => handleStatusChange(status)}>
              Set as {status}
            </MenuItem>
          ))}
      </Menu>
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Position"
        description="Are you sure you want to delete this position? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmColor="error"
        loading={isDeleting}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
      />
    </PageContainer>
  );
};

export default PositionDetail;
