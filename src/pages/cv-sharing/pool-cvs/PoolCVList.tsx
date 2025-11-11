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
import { poolCVService } from '@/services/cv-sharing';
import { PoolCV, FileInfo, PagedResponse } from '@/types/cv-sharing';
import { MatchedPosition } from '@/types/cv-sharing/matched-position';
import { useKeycloak } from '@/hooks/useKeycloak';
import PageContainer from '@/components/ui/PageContainer';
import SectionCard from '@/components/ui/SectionCard';
import { Tooltip as MuiTooltip } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface MatchDialogData {
  open: boolean;
  poolCVId: string | null;
  positions: MatchedPosition[];
}

const PoolCVList: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { hasAnyRole } = useKeycloak();
  const canEdit = hasAnyRole(['COMPANY_MANAGER', 'ADMIN']);
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

  const { data, isLoading, refetch } = useQuery<PagedResponse<PoolCV>>({
    queryKey: ['poolCVs', statusFilter, experienceFilter],
    queryFn: async () => {
      const params: any = {};
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
  const filteredPoolCVs = poolCVs.filter(cv =>
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
      enqueueSnackbar('Status updated successfully', { variant: 'success' });
      await queryClient.invalidateQueries({ queryKey: ['poolCVs'] });
    } catch (error) {
      enqueueSnackbar('Failed to update status', { variant: 'error' });
    } finally {
      setToggleBusyId(null);
    }
  };

  const handleConfirmMatch = async (cvId: string, positionId: string, matchScore?: number) => {
    try {
      if (confirmBusyId === positionId) return;
      setConfirmBusyId(positionId);
      await poolCVService.matchPosition(cvId, positionId, matchScore ? { matchScore } : undefined);
      enqueueSnackbar('Matched successfully!', { variant: 'success' });
      // Refresh dialog data
      const positions = await poolCVService.matchPositionsForPoolCV(cvId);
      setMatchDialog(md => ({ ...md, positions }));
    } catch (error) {
      enqueueSnackbar('Failed to record match', { variant: 'error' });
    } finally {
      setConfirmBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!selectedCV) return;
    
    try {
      await poolCVService.deletePoolCV(selectedCV.id);
      enqueueSnackbar('Pool CV deleted successfully', { variant: 'success' });
      setDeleteDialogOpen(false);
      setSelectedCV(null);
      await queryClient.invalidateQueries({ queryKey: ['poolCVs'] });
    } catch (error) {
      enqueueSnackbar('Failed to delete pool CV', { variant: 'error' });
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
    } catch (error) {
      enqueueSnackbar('Failed to match positions', { variant: 'error' });
    } finally {
      setMatchBusyId(null);
    }
  };

  const handleDownload = async (cvId: string) => {
    try {
      const detail = await poolCVService.getPoolCVById(cvId);
      const files = (detail as any).files as FileInfo[] | undefined;
      if (!files || files.length === 0) {
        enqueueSnackbar('No files found for this CV', { variant: 'info' });
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
      enqueueSnackbar('Failed to download CV', { variant: 'error' });
    }
  };

  const getExperienceColor = (years: number): 'default' | 'primary' | 'secondary' | 'success' => {
    if (years < 2) return 'default';
    if (years < 5) return 'primary';
    if (years < 10) return 'secondary';
    return 'success';
  };

  const listColumns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 28, height: 28 }}>
            {String((params.row as PoolCV).firstName || '').charAt(0)}
            {String((params.row as PoolCV).lastName || '').charAt(0)}
          </Avatar>
          <Typography variant="body2">
            {(params.row as PoolCV).firstName} {(params.row as PoolCV).lastName}
          </Typography>
        </Box>
      )
    },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
    { field: 'phone', headerName: 'Phone', width: 140, valueGetter: (p) => (p.row as PoolCV).phone || '-' },
    {
      field: 'role', headerName: 'Position', flex: 1, minWidth: 180,
      valueGetter: (p) => {
        const r = p.row as PoolCV;
        return r.currentPosition ? `${r.currentPosition}${r.currentCompany ? ' • ' + r.currentCompany : ''}` : '-';
      }
    },
    {
      field: 'active', headerName: 'Status', width: 120,
      renderCell: (params: GridRenderCellParams) => {
        const r = params.row as PoolCV;
        return (
          <Chip
            size="small"
            icon={r.isActive ? <ActiveIcon /> : <InactiveIcon />}
            label={r.isActive ? 'Active' : 'Inactive'}
            color={r.isActive ? 'success' : 'default'}
          />
        );
      }
    },
    { field: 'fileCount', headerName: 'Files', width: 90, valueGetter: (p) => (p.row as PoolCV).fileCount ?? 0 },
    {
      field: 'actions', headerName: 'Actions', width: 220, sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const cv = params.row as PoolCV;
        return (
          <Box>
            <Tooltip title="View Details">
              <IconButton size="small" onClick={() => navigate(`/cv-sharing/pool-cvs/${cv.id}`)}>
                <ViewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {canEdit && (
              <Tooltip title="Edit">
                <IconButton size="small" onClick={() => navigate(`/cv-sharing/pool-cvs/${cv.id}/edit`)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Match">
              <IconButton size="small" onClick={() => handleMatchPositions(cv.id)} disabled={matchBusyId === cv.id}>
                <WorkIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download CV">
              <IconButton size="small" onClick={() => handleDownload(cv.id)}>
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {canEdit && (
              <Tooltip title={cv.isActive ? 'Deactivate' : 'Activate'}>
                <IconButton size="small" onClick={() => handleToggleStatus(cv.id, cv.isActive)} disabled={toggleBusyId === cv.id}>
                  {cv.isActive ? <InactiveIcon fontSize="small" /> : <ActiveIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      }
    }
  ];


  return (
    <PageContainer
      title="Pool CVs"
      actions={
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => refetch()}>Refresh</Button>
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
                        onClick={() => navigate(`/cv-sharing/pool-cvs/${cv.id}`)}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    {canEdit && (
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/cv-sharing/pool-cvs/${cv.id}/edit`)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Download CV">
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
                      Match
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
                sx={{ border: 'none' }}
              />
            </Box>
          )}

          {viewMode === 'compact' && (
            <List>
              {filteredPoolCVs.map((cv) => (
                <ListItem key={cv.id}
                  secondaryAction={
                    <Button size="small" onClick={() => navigate(`/cv-sharing/pool-cvs/${cv.id}`)}>View</Button>
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

          {filteredPoolCVs.length === 0 && !isLoading && (
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
                          {matched.position.department || 'No department'} • {matched.position.location || 'No location'}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                          <MuiTooltip 
                            title={
                              <Box>
                                <Typography variant="caption" display="block">
                                  Skills: {Math.round(matched.breakdown.skillsScore * 100)}%
                                </Typography>
                                <Typography variant="caption" display="block">
                                  Experience: {Math.round(matched.breakdown.experienceScore * 100)}%
                                </Typography>
                                <Typography variant="caption" display="block">
                                  Languages: {Math.round(matched.breakdown.languageScore * 100)}%
                                </Typography>
                                <Typography variant="caption" display="block">
                                  AI Similarity: {Math.round(matched.breakdown.semanticScore * 100)}%
                                </Typography>
                              </Box>
                            }
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" fontWeight="bold">
                                Match Score:
                              </Typography>
                              <Chip
                                label={`${matched.matchScore ?? '--'}%`}
                                color={getMatchColor(matched.matchScore ?? 0)}
                                size="small"
                              />
                            </Box>
                          </MuiTooltip>
                          
                          <Chip
                            label={matched.matchLevel}
                            variant="outlined"
                            size="small"
                            color={getMatchColor(matched.matchScore ?? 0)}
                          />
                        </Box>
                        
                        {matched.missingRequiredSkills && matched.missingRequiredSkills.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" color="error">
                              Missing: {matched.missingRequiredSkills.join(', ')}
                            </Typography>
                          </Box>
                        )}
                        
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                          {matched.recommendation}
                        </Typography>
                      </Box>
                      
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => navigate(`/cv-sharing/positions/${matched.position.id}`)}
                        >
                          View Position
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleConfirmMatch(matchDialog.poolCVId!, matched.position.id, matched.matchScore)}
                          disabled={confirmBusyId === matched.position.id}
                        >
                          {confirmBusyId === matched.position.id ? 'Matching...' : 'Match'}
                        </Button>
                      </Stack>
                    </ListItem>
                  );
                })}
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
