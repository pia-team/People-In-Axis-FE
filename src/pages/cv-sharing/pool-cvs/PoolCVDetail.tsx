import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  AttachFile as FileIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  SavedSearch as MatchIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import FileUpload from '@/components/ui/FileUpload';
import PoolCVTags from '@/components/cv-sharing/PoolCVTags';
import { poolCVService } from '@/services/cv-sharing';
import { PoolCVDetail as PoolCVDetailType } from '@/types/cv-sharing';
import { useKeycloak } from '@/hooks/useKeycloak';
import { Fingerprint as IdIcon } from '@mui/icons-material';
import { maskTCKN } from '@/utils/tckn';

const PoolCVDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { hasAnyRole } = useKeycloak();
  const canEdit = hasAnyRole(['COMPANY_MANAGER', 'ADMIN']);
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<PoolCVDetailType | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [matchOpen, setMatchOpen] = useState(false);
  const [matchedPositions, setMatchedPositions] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      loadDetail();
    }
  }, [id]);

  const loadDetail = async () => {
    try {
      setLoading(true);
      const data = await poolCVService.getPoolCVById(id!);
      setDetail(data);
    } catch (e) {
      enqueueSnackbar('Failed to load CV', { variant: 'error' });
      navigate('/pool-cvs');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (!detail) return;
    try {
      await poolCVService.togglePoolCVStatus(detail.id, !detail.isActive);
      enqueueSnackbar('Status updated', { variant: 'success' });
      await loadDetail();
    } catch (e) {
      enqueueSnackbar('Failed to update status', { variant: 'error' });
    }
  };

  const handleUpload = async () => {
    if (!detail || files.length === 0) return;
    try {
      setUploading(true);
      await poolCVService.uploadFiles(detail.id, files);
      setFiles([]);
      enqueueSnackbar('Files uploaded', { variant: 'success' });
      await loadDetail();
    } catch (e) {
      enqueueSnackbar('Failed to upload files', { variant: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (fileId: string, fileName: string) => {
    if (!detail) return;
    try {
      const blob = await poolCVService.downloadFile(detail.id, fileId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      enqueueSnackbar('Failed to download file', { variant: 'error' });
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!detail) return;
    try {
      await poolCVService.deleteFile(detail.id, fileId);
      enqueueSnackbar('File deleted', { variant: 'success' });
      await loadDetail();
    } catch (e) {
      enqueueSnackbar('Failed to delete file', { variant: 'error' });
    }
  };

  

  const handleMatchPositions = async () => {
    if (!id) return;
    try {
      const positions = await poolCVService.matchPositionsForPoolCV(id);
      setMatchedPositions(positions || []);
      setMatchOpen(true);
    } catch (e) {
      enqueueSnackbar('Failed to fetch matching positions', { variant: 'error' });
    }
  };

  if (loading || !detail) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar>
                  {detail.firstName[0]}{detail.lastName[0]}
                </Avatar>
                <Box>
                  <Typography variant="h5">
                    {detail.firstName} {detail.lastName}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Chip
                      size="small"
                      icon={detail.isActive ? <ActiveIcon /> : <InactiveIcon />}
                      label={detail.isActive ? 'Active' : 'Inactive'}
                      color={detail.isActive ? 'success' : 'default'}
                    />
                    {(detail.experienceYears ?? 0) > 0 && (
                      <Chip size="small" icon={<SchoolIcon />} label={`${detail.experienceYears} yrs`} />
                    )}
                  </Box>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {canEdit && (
                  <>
                    <Tooltip title={detail.isActive ? 'Deactivate' : 'Activate'}>
                      <Button variant="outlined" onClick={handleToggleActive} startIcon={detail.isActive ? <InactiveIcon /> : <ActiveIcon />}>Status</Button>
                    </Tooltip>
                    <Button variant="outlined" startIcon={<EditIcon />} onClick={() => navigate(`/pool-cvs/${detail.id}/edit`)}>Edit</Button>
                  </>
                )}
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={8}>
            <Typography variant="h6">Contact</Typography>
            <Divider sx={{ mb: 2 }} />
            <List>
              <ListItem>
                <ListItemIcon><EmailIcon /></ListItemIcon>
                <ListItemText primary={detail.email} />
              </ListItem>
              {detail.phone && (
                <ListItem>
                  <ListItemIcon><PhoneIcon /></ListItemIcon>
                  <ListItemText primary={detail.phone} />
                </ListItem>
              )}
              {detail.tckn && (
                <ListItem>
                  <ListItemIcon><IdIcon /></ListItemIcon>
                  <ListItemText primary={`TCKN: ${maskTCKN(detail.tckn)}`} />
                </ListItem>
              )}
              {detail.currentPosition && (
                <ListItem>
                  <ListItemIcon><WorkIcon /></ListItemIcon>
                  <ListItemText primary={detail.currentPosition} secondary={detail.currentCompany} />
                </ListItem>
              )}
            </List>

            <Typography variant="h6" sx={{ mt: 3 }}>Skills</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {(detail.skills || []).map((s) => (
                <Chip key={s.name} label={`${s.name}${s.yearsOfExperience ? ` • ${s.yearsOfExperience}y` : ''}`} />
              ))}
            </Box>

            <Typography variant="h6" sx={{ mt: 3 }}>Languages</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {(detail.languages || []).map((l) => (
                <Chip key={`${l.code}-${l.proficiencyLevel}`} label={`${l.code.toUpperCase()} • ${l.proficiencyLevel}`} />
              ))}
            </Box>

            <Typography variant="h6" sx={{ mt: 3 }}>Files</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box>
              {canEdit && (
                <>
                  <FileUpload onFilesChange={setFiles} value={files} />
                  <Button sx={{ mt: 1 }} variant="contained" onClick={handleUpload} disabled={files.length === 0 || uploading}>
                    {uploading ? 'Uploading...' : 'Upload Files'}
                  </Button>
                </>
              )}
            </Box>
            {(detail.files && detail.files.length > 0) && (
              <List>
                {detail.files.map(f => (
                  <ListItem key={f.id}
                    secondaryAction={
                      <Box>
                        <IconButton edge="end" onClick={() => handleDownload(f.id, f.fileName)}>
                          <DownloadIcon />
                        </IconButton>
                        {canEdit && (
                          <IconButton edge="end" color="error" onClick={() => handleDeleteFile(f.id)}>
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Box>
                    }
                  >
                    <ListItemIcon><FileIcon /></ListItemIcon>
                    <ListItemText primary={f.fileName} secondary={`${(f.fileSize / 1024).toFixed(0)} KB`} />
                  </ListItem>
                ))}
              </List>
            )}
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="h6">Tags</Typography>
            <Divider sx={{ mb: 2 }} />
            {canEdit ? (
              <PoolCVTags
                poolCvId={detail.id}
                tags={detail.tags || []}
                onChange={(tags) => setDetail(d => d ? { ...d, tags } : d)}
              />
            ) : (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {(detail.tags || []).map((t) => (
                  <Chip key={t} label={t} />
                ))}
              </Box>
            )}

            <Typography variant="h6" sx={{ mt: 3 }}>Actions</Typography>
            <Divider sx={{ mb: 2 }} />
            <Button fullWidth variant="outlined" startIcon={<MatchIcon />} onClick={handleMatchPositions}>Match Positions</Button>
          </Grid>
        </Grid>

        <Dialog open={matchOpen} onClose={() => setMatchOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Matching Positions</DialogTitle>
          <DialogContent>
            {matchedPositions.length > 0 ? (
              <List>
                {matchedPositions.map((p: any) => (
                  <ListItem key={p.id}
                    secondaryAction={
                      <Button size="small" onClick={() => navigate(`/positions/${p.id}`)}>View</Button>
                    }
                  >
                    <ListItemText primary={p.title} secondary={`${p.department || ''}${p.matchScore ? ` • Match ${p.matchScore}%` : ''}`} />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography>No matching positions found</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setMatchOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default PoolCVDetail;
