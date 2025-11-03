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
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Alert,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Badge
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
  Share as ShareIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { positionService, applicationService } from '@/services/cv-sharing';
import { Position, PositionStatus, WorkType } from '@/types/cv-sharing';
import { format } from 'date-fns';
import PageContainer from '@/components/ui/PageContainer';
import SectionCard from '@/components/ui/SectionCard';

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

  const { data: position, isLoading } = useQuery({
    queryKey: ['position', id],
    queryFn: () => positionService.getPositionById(id!),
    enabled: !!id
  });

  const { data: applications } = useQuery({
    queryKey: ['applications', 'position', id],
    queryFn: () => applicationService.getApplicationsByPosition(id!),
    enabled: !!id
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEdit = () => {
    navigate(`/cv-sharing/positions/${id}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this position?')) {
      try {
        await positionService.deletePosition(id!);
        enqueueSnackbar('Position deleted successfully', { variant: 'success' });
        navigate('/cv-sharing/positions');
      } catch (error) {
        enqueueSnackbar('Failed to delete position', { variant: 'error' });
      }
    }
  };

  const handleDuplicate = async () => {
    try {
      const newPosition = await positionService.duplicatePosition(id!);
      enqueueSnackbar('Position duplicated successfully', { variant: 'success' });
      navigate(`/cv-sharing/positions/${newPosition.id}/edit`);
    } catch (error) {
      enqueueSnackbar('Failed to duplicate position', { variant: 'error' });
    }
  };

  const handleArchive = async () => {
    try {
      await positionService.updatePositionStatus(id!, PositionStatus.ARCHIVED);
      enqueueSnackbar('Position archived successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to archive position', { variant: 'error' });
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

  if (isLoading) {
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

  return (
    <PageContainer
      title={position.title}
      breadcrumbs={[
        { label: 'CV Sharing', path: '/cv-sharing' },
        { label: 'Positions', path: '/cv-sharing/positions' },
        { label: position.title }
      ]}
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
          <Button
            variant="outlined"
            startIcon={<CopyIcon />}
            onClick={handleDuplicate}
          >
            Duplicate
          </Button>
          <Button
            variant="outlined"
            startIcon={<ArchiveIcon />}
            onClick={handleArchive}
            disabled={position.status === PositionStatus.ARCHIVED}
          >
            Archive
          </Button>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleEdit}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
          >
            Delete
          </Button>
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
                      color={getWorkTypeColor(position.workType)}
                      size="small"
                      icon={<WorkIcon />}
                    />
                    <Chip
                      label={`${position.applicationCount || 0} Applications`}
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
                {position.salaryMin && position.salaryMax && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SalaryIcon color="action" />
                    <Typography variant="body2">
                      <strong>Salary:</strong> ${position.salaryMin.toLocaleString()} - ${position.salaryMax.toLocaleString()}
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
            {/* Required Skills */}
            {position.requiredSkills && position.requiredSkills.length > 0 && (
              <Grid item xs={12} md={6}>
                <SectionCard>
                  <Typography variant="h6" gutterBottom>
                    <SkillIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Required Skills
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {position.requiredSkills.map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill.name}
                        variant="outlined"
                        color="primary"
                        size="small"
                        icon={skill.level ? <Badge badgeContent={skill.level} color="primary" /> : undefined}
                      />
                    ))}
                  </Stack>
                </SectionCard>
              </Grid>
            )}

            {/* Required Languages */}
            {position.requiredLanguages && position.requiredLanguages.length > 0 && (
              <Grid item xs={12} md={6}>
                <SectionCard>
                  <Typography variant="h6" gutterBottom>
                    <LanguageIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Required Languages
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <List dense>
                    {position.requiredLanguages.map((lang, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckIcon color="success" />
                        </ListItemIcon>
                        <ListItemText
                          primary={lang.name}
                          secondary={`Level: ${lang.level}`}
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
                  {position.educationField && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Field: {position.educationField}
                    </Typography>
                  )}
                </SectionCard>
              </Grid>
            )}

            {/* Experience */}
            {position.experienceYears !== undefined && (
              <Grid item xs={12} md={6}>
                <SectionCard>
                  <Typography variant="h6" gutterBottom>
                    <WorkIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Experience Required
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h4" color="primary">
                    {position.experienceYears}+ years
                  </Typography>
                </SectionCard>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <SectionCard>
            <Typography variant="h6" gutterBottom>
              Applications ({applications?.length || 0})
            </Typography>
            <Divider sx={{ my: 2 }} />
            {applications && applications.length > 0 ? (
              <List>
                {applications.slice(0, 10).map((app: any) => (
                  <ListItem
                    key={app.id}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        aria-label="view"
                        onClick={() => navigate(`/cv-sharing/applications/${app.id}`)}
                      >
                        <ViewIcon />
                      </IconButton>
                    }
                  >
                    <ListItemIcon>
                      <Avatar>
                        {app.firstName?.[0]}{app.lastName?.[0]}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={`${app.firstName} ${app.lastName}`}
                      secondary={`Applied on ${format(new Date(app.appliedAt), 'dd/MM/yyyy')}`}
                    />
                    <Chip
                      label={app.status}
                      size="small"
                      color={app.status === 'NEW' ? 'info' : 'default'}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No applications yet
              </Typography>
            )}
            {applications && applications.length > 10 && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/cv-sharing/applications?positionId=${id}`)}
                >
                  View All Applications
                </Button>
              </Box>
            )}
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
                  Created By
                </Typography>
                <Typography variant="body1">
                  {position.createdBy || 'System'}
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
    </PageContainer>
  );
};

export default PositionDetail;
