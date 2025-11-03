import React, { useState, useEffect } from 'react';
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
import { poolCVService } from '@/services/cv-sharing';
import { PoolCV } from '@/types/cv-sharing';
import { useKeycloak } from '@/hooks/useKeycloak';
import PageContainer from '@/components/ui/PageContainer';
import SectionCard from '@/components/ui/SectionCard';

interface MatchDialogData {
  open: boolean;
  poolCVId: string | null;
  positions: any[];
}

const PoolCVList: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { hasAnyRole } = useKeycloak();
  const canEdit = hasAnyRole(['COMPANY_MANAGER', 'ADMIN']);
  const [poolCVs, setPoolCVs] = useState<PoolCV[]>([]);
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    loadPoolCVs();
  }, [statusFilter, experienceFilter]);

  const loadPoolCVs = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (statusFilter !== 'all') {
        params.active = statusFilter === 'active';
      }
      
      if (experienceFilter !== 'all') {
        const [min, max] = experienceFilter.split('-').map(Number);
        params.minExperience = min;
        params.maxExperience = max || 99;
      }
      
      const data = await poolCVService.getPoolCVs(params);
      setPoolCVs(data.content || []);
    } catch (error) {
      enqueueSnackbar('Failed to load pool CVs', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };


  const filteredPoolCVs = poolCVs.filter(cv =>
    cv.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cv.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cv.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cv.currentPosition?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cv.currentCompany?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleStatus = async (cvId: string, currentStatus: boolean) => {
    try {
      await poolCVService.togglePoolCVStatus(cvId, !currentStatus);
      enqueueSnackbar('Status updated successfully', { variant: 'success' });
      loadPoolCVs();
    } catch (error) {
      enqueueSnackbar('Failed to update status', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!selectedCV) return;
    
    try {
      await poolCVService.deletePoolCV(selectedCV.id);
      enqueueSnackbar('Pool CV deleted successfully', { variant: 'success' });
      setDeleteDialogOpen(false);
      setSelectedCV(null);
      loadPoolCVs();
    } catch (error) {
      enqueueSnackbar('Failed to delete pool CV', { variant: 'error' });
    }
  };

  const handleMatchPositions = async (cvId: string) => {
    try {
      const positions = await poolCVService.matchPositionsForPoolCV(cvId);
      setMatchDialog({
        open: true,
        poolCVId: cvId,
        positions: positions || []
      });
    } catch (error) {
      enqueueSnackbar('Failed to match positions', { variant: 'error' });
    }
  };

  const getExperienceColor = (years: number): 'default' | 'primary' | 'secondary' | 'success' => {
    if (years < 2) return 'default';
    if (years < 5) return 'primary';
    if (years < 10) return 'secondary';
    return 'success';
  };


  return (
    <PageContainer
      title="Pool CVs"
      actions={
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => loadPoolCVs()}>Refresh</Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/cv-sharing/pool-cvs/new')}
          >
            Add Pool CV
          </Button>
        </Stack>
      }
    >
      <Stack spacing={2}>
        <SectionCard>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <TextField
              size="small"
              placeholder="Search pool CVs..."
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
            <InputLabel>Experience</InputLabel>
            <Select
              value={experienceFilter}
              onChange={(e) => setExperienceFilter(e.target.value)}
              label="Experience"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="0-2">0-2 years</MenuItem>
              <MenuItem value="2-5">2-5 years</MenuItem>
              <MenuItem value="5-10">5-10 years</MenuItem>
              <MenuItem value="10-99">10+ years</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              label="Status"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
          </Stack>
        </SectionCard>
        <SectionCard>
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
                            label={cv.isActive ? 'Active' : 'Inactive'}
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
                            label={`${cv.experienceYears} years experience`}
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
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/pool-cvs/${cv.id}`)}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    {canEdit && (
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/pool-cvs/${cv.id}/edit`)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Download CV">
                      <IconButton size="small" onClick={() => navigate(`/pool-cvs/${cv.id}`)}>
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Box>
                    <Button
                      size="small"
                      onClick={() => handleMatchPositions(cv.id)}
                    >
                      Match
                    </Button>
                    {canEdit && (
                      <>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleStatus(cv.id, cv.isActive)}
                          color={cv.isActive ? 'default' : 'primary'}
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

        {filteredPoolCVs.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No CVs found in the talent pool
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Try adjusting your filters or add new CVs to the pool
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
          <DialogTitle>Delete Pool CV</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this CV from the talent pool?
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDelete} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Match Positions Dialog */}
        <Dialog
          open={matchDialog.open}
          onClose={() => setMatchDialog({ open: false, poolCVId: null, positions: [] })}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Matching Positions</DialogTitle>
          <DialogContent>
            {matchDialog.positions.length > 0 ? (
              <List>
                {matchDialog.positions.map((position: any) => (
                  <ListItem key={position.id}>
                    <ListItemText
                      primary={position.title}
                      secondary={`${position.department} • Match Score: ${position.matchScore}%`}
                    />
                    <Button
                      size="small"
                      onClick={() => navigate(`/positions/${position.id}`)}
                    >
                      View
                    </Button>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography>No matching positions found</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setMatchDialog({ open: false, poolCVId: null, positions: [] })}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
    </PageContainer>
  );
};

export default PoolCVList;
