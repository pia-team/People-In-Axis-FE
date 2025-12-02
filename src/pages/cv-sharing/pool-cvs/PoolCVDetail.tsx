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
  LinearProgress,
  useMediaQuery,
  useTheme
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
import { MatchedPosition } from '@/types/cv-sharing/matched-position';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

const PoolCVDetail: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { hasAnyRole } = useKeycloak();
  const canEdit = hasAnyRole(['COMPANY_MANAGER', 'ADMIN']);
  const queryClient = useQueryClient();
  const { data: detail, isPending, isError } = useQuery<
    PoolCVDetailType,
    Error,
    PoolCVDetailType,
    [string, string | undefined]
  >({
    queryKey: ['poolCV', id],
    queryFn: () => poolCVService.getPoolCVById(id!),
    enabled: !!id
  });
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [matchOpen, setMatchOpen] = useState(false);
  const [matchedPositions, setMatchedPositions] = useState<MatchedPosition[]>([]);
  const [toggling, setToggling] = useState(false);
  const [matching, setMatching] = useState(false);

  useEffect(() => {
    // Handle error side-effect
    if (isError) {
      enqueueSnackbar(t('error.loadFailed', { item: t('poolCV.title').toLowerCase() }), { variant: 'error' });
      navigate('/cv-sharing/pool-cvs');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError]);

  const handleToggleActive = async () => {
    if (!detail) return;
    try {
      if (toggling) return;
      setToggling(true);
      await poolCVService.togglePoolCVStatus(detail.id, !detail.isActive);
      enqueueSnackbar(t('success.updated'), { variant: 'success' });
      await queryClient.invalidateQueries({ queryKey: ['poolCV', id] });
    } catch (e) {
      enqueueSnackbar(t('error.updateFailed'), { variant: 'error' });
    } finally {
      setToggling(false);
    }
  };

  const handleUpload = async () => {
    if (!detail || files.length === 0) return;
    try {
      setUploading(true);
      await poolCVService.uploadFiles(detail.id, files);
      setFiles([]);
      enqueueSnackbar(t('poolCV.fileUploaded'), { variant: 'success' });
      await queryClient.invalidateQueries({ queryKey: ['poolCV', id] });
    } catch (e) {
      enqueueSnackbar(t('error.uploadFailed'), { variant: 'error' });
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
      enqueueSnackbar(t('error.downloadFailed'), { variant: 'error' });
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!detail) return;
    try {
      await poolCVService.deleteFile(detail.id, fileId);
      enqueueSnackbar(t('poolCV.fileDeleted'), { variant: 'success' });
      await queryClient.invalidateQueries({ queryKey: ['poolCV', id] });
    } catch (e) {
      enqueueSnackbar(t('error.deleteFailed'), { variant: 'error' });
    }
  };

  

  const handleMatchPositions = async () => {
    if (!id) return;
    try {
      if (matching) return;
      setMatching(true);
      const positions = await poolCVService.matchPositionsForPoolCV(id);
      setMatchedPositions(positions || []);
      setMatchOpen(true);
    } catch (e) {
      enqueueSnackbar(t('error.loadFailed', { item: t('position.titlePlural').toLowerCase() }), { variant: 'error' });
    } finally {
      setMatching(false);
    }
  };

  if (isPending || !detail) {
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
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
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
                      label={detail.isActive ? t('poolCV.active') : t('poolCV.inactive')}
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
                    <Tooltip title={detail.isActive ? t('common.deactivate') : t('common.activate')}>
                      <span>
                        <Button variant="outlined" onClick={handleToggleActive} startIcon={detail.isActive ? <InactiveIcon /> : <ActiveIcon />} disabled={toggling}>{t('common.status')}</Button>
                      </span>
                    </Tooltip>
                    <Button variant="outlined" startIcon={<EditIcon />} onClick={() => navigate(`/cv-sharing/pool-cvs/${detail.id}/edit`)}>{t('common.edit')}</Button>
                  </>
                )}
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={8}>
            <Typography variant="h6">{t('application.contact')}</Typography>
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
                  <ListItemText primary={`${t('poolCV.tckn')}: ${detail.tckn}`} />
                </ListItem>
              )}
              {detail.currentPosition && (
                <ListItem>
                  <ListItemIcon><WorkIcon /></ListItemIcon>
                  <ListItemText primary={detail.currentPosition} secondary={detail.currentCompany} />
                </ListItem>
              )}
            </List>

            <Typography variant="h6" sx={{ mt: 3 }}>{t('poolCV.skills')}</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {(detail.skills || []).map((s) => (
                <Chip key={s.name} label={`${s.name}${s.yearsOfExperience ? ` • ${s.yearsOfExperience}y` : ''}`} />
              ))}
            </Box>

            <Typography variant="h6" sx={{ mt: 3 }}>{t('poolCV.languages')}</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {(detail.languages || []).map((l) => {
                const code = l.code || '';
                const proficiency = l.proficiencyLevel || '';
                return code ? (
                  <Chip key={`${code}-${proficiency}`} label={`${code.toUpperCase()} • ${proficiency}`} />
                ) : null;
              })}
            </Box>

            <Typography variant="h6" sx={{ mt: 3 }}>{t('poolCV.files')}</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box>
              {canEdit && (
                <>
                  <FileUpload onFilesChange={setFiles} value={files} />
                  <Button sx={{ mt: 1 }} variant="contained" onClick={handleUpload} disabled={files.length === 0 || uploading}>
                    {uploading ? t('common.uploading') : t('poolCV.uploadFiles')}
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
            <Typography variant="h6">{t('poolCV.tags')}</Typography>
            <Divider sx={{ mb: 2 }} />
            {canEdit ? (
              <PoolCVTags
                poolCvId={detail.id}
                tags={detail.tags || []}
                onChange={(tags) => queryClient.setQueryData(['poolCV', id], (d: PoolCVDetailType | undefined) => d ? { ...d, tags } : d)}
              />
            ) : (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {(detail.tags || []).map((t) => (
                  <Chip key={t} label={t} />
                ))}
              </Box>
            )}

            <Typography variant="h6" sx={{ mt: 3 }}>{t('common.actions')}</Typography>
            <Divider sx={{ mb: 2 }} />
            <Button fullWidth variant="outlined" startIcon={<MatchIcon />} onClick={handleMatchPositions} disabled={matching}>{t('poolCV.matchPositions')}</Button>
          </Grid>
        </Grid>

        <Dialog open={matchOpen} onClose={() => setMatchOpen(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
          <DialogTitle>{t('poolCV.matchedPositions')}</DialogTitle>
          <DialogContent>
            {matchedPositions.length > 0 ? (
              <List>
                {matchedPositions.map((matched) => (
                  <ListItem key={matched.position.id}
                    secondaryAction={
                      <Button size="small" onClick={() => navigate(`/cv-sharing/positions/${matched.position.id}`)}>{t('common.view')}</Button>
                    }
                  >
                    <ListItemText
                      primary={matched.position.title}
                      secondary={`${matched.position.department || ''}${matched.matchScore ? ` • ${t('common.match')} ${matched.matchScore}%` : ''}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography>{t('poolCV.noMatchingPositions')}</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setMatchOpen(false)}>{t('common.close')}</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default PoolCVDetail;
