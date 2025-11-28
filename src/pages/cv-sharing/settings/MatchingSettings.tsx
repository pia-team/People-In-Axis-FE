import React, { useMemo, useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid, 
  Slider, 
  Switch, 
  FormControlLabel, 
  TextField, 
  Button, 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody, 
  IconButton, 
  Stack, 
  Divider,
  CircularProgress,
  Alert,
  Chip,
  Tooltip,
  InputAdornment
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { matchingService } from '@/services/cv-sharing/matchingService';
import { MatchingConfig, SkillAliasItem } from '@/types/cv-sharing/matching';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';
import { useKeycloak } from '@/hooks/useKeycloak';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

type WeightKey =
  | 'weightSkills'
  | 'weightExperience'
  | 'weightLanguage'
  | 'weightEducation'
  | 'weightLocation'
  | 'weightSalary'
  | 'weightSemantic';

const MatchingSettings: React.FC = () => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { data: cfg } = useQuery({ 
    queryKey: ['matching','config'], 
    queryFn: matchingService.getConfig 
  });
  const { 
    data: aliases, 
    isLoading: aliasesLoading, 
    error: aliasesError,
    refetch: refetchAliases 
  } = useQuery({ 
    queryKey: ['matching','aliases'], 
    queryFn: matchingService.listAliases,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  // Debug: Log aliases data
  React.useEffect(() => {
    console.log('[MatchingSettings] Aliases data:', { aliases, isLoading: aliasesLoading, error: aliasesError });
  }, [aliases, aliasesLoading, aliasesError]);
  const { hasAnyRole } = useKeycloak();
  const canEdit = hasAnyRole(['HUMAN_RESOURCES', 'COMPANY_MANAGER']);

  const [localCfg, setLocalCfg] = useState<MatchingConfig | undefined>(undefined);
  const [aliasForm, setAliasForm] = useState<{ alias: string; canonicalSkill: string }>({ alias: '', canonicalSkill: '' });
  const [editingAlias, setEditingAlias] = useState<SkillAliasItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  React.useEffect(() => {
    if (cfg && !localCfg) setLocalCfg(cfg);
  }, [cfg, localCfg]);

  const weights: Record<WeightKey, number> = useMemo(() => ({
    weightSkills: localCfg?.weightSkills ?? 0.35,
    weightExperience: localCfg?.weightExperience ?? 0.2,
    weightLanguage: localCfg?.weightLanguage ?? 0.1,
    weightEducation: localCfg?.weightEducation ?? 0.05,
    weightLocation: localCfg?.weightLocation ?? 0.1,
    weightSalary: localCfg?.weightSalary ?? 0.05,
    weightSemantic: localCfg?.weightSemantic ?? 0.15,
  }), [localCfg]);

  const totalWeight = Object.values(weights).reduce((a, b) => a + (b || 0), 0);
  const tolerance = 0.01; // ±1%
  const diff = Math.abs(1 - totalWeight);
  const weightColor = diff <= tolerance ? 'success.main' : diff <= 0.05 ? 'warning.main' : 'error.main';

  const updateCfg = useMutation({
    mutationFn: (next: MatchingConfig) => matchingService.updateConfig(next),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['matching','config'] });
      enqueueSnackbar(t('matching.settingsUpdated'), { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || t('matching.failedToUpdateConfiguration'), { variant: 'error' });
    }
  });

  const upsertAlias = useMutation({
    mutationFn: (payload: { alias: string; canonicalSkill: string; isEdit?: boolean }) => {
      const trimmedPayload = {
        alias: payload.alias.trim(),
        canonicalSkill: payload.canonicalSkill.trim()
      };
      return matchingService.upsertAlias(trimmedPayload);
    },
    onSuccess: async (data) => {
      const wasEditing = editingAlias !== null;
      console.log('[MatchingSettings] upsertAlias success:', { data, wasEditing });
      setAliasForm({ alias: '', canonicalSkill: '' });
      setEditingAlias(null);
      
      // Invalidate and refetch to ensure UI is updated
      qc.invalidateQueries({ queryKey: ['matching','aliases'] });
      
      // Also manually refetch after a short delay to ensure backend has processed
      setTimeout(async () => {
        try {
          const result = await refetchAliases();
          console.log('[MatchingSettings] Refetch result:', result);
          if (result.data && result.data.length > 0) {
            console.log('[MatchingSettings] Aliases after refetch:', result.data);
          } else {
            console.warn('[MatchingSettings] No aliases returned after refetch');
          }
        } catch (error) {
          console.error('[MatchingSettings] Refetch error:', error);
        }
      }, 300);
      
      enqueueSnackbar(wasEditing ? t('matching.aliasUpdated', { alias: data.alias }) : t('matching.aliasAdded', { alias: data.alias }), { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || t('matching.failedToSaveAlias'), { variant: 'error' });
    }
  });

  const deleteAlias = useMutation({
    mutationFn: (id: string) => matchingService.deleteAlias(id),
    onSuccess: () => {
      // Invalidate and refetch
      qc.invalidateQueries({ queryKey: ['matching','aliases'] });
      setTimeout(() => {
        refetchAliases();
      }, 300);
      enqueueSnackbar(t('matching.aliasDeleted'), { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || t('matching.failedToDeleteAlias'), { variant: 'error' });
    }
  });

  const handleWeight = (key: WeightKey) => (_: any, v: number | number[]) => {
    const val = Array.isArray(v) ? v[0] : v;
    setLocalCfg(prev => ({ ...(prev || {}), [key]: Math.round(val * 100) / 100 }));
  };

  const handleSave = () => {
    if (!localCfg) return;
    if (!canEdit) {
      enqueueSnackbar(t('matching.permissionDenied'), { variant: 'error' });
      return;
    }
    updateCfg.mutate({ ...localCfg });
  };

  const handleEditAlias = (alias: SkillAliasItem) => {
    setEditingAlias(alias);
    setAliasForm({ alias: alias.alias, canonicalSkill: alias.canonicalSkill });
  };

  const handleCancelEdit = () => {
    setEditingAlias(null);
    setAliasForm({ alias: '', canonicalSkill: '' });
  };

  const handleSubmitAlias = () => {
    if (!aliasForm.alias.trim() || !aliasForm.canonicalSkill.trim()) {
      enqueueSnackbar(t('matching.fillBothFields'), { variant: 'warning' });
      return;
    }
    if (!canEdit) {
      enqueueSnackbar(t('matching.permissionDenied'), { variant: 'error' });
      return;
    }
    upsertAlias.mutate({ ...aliasForm, isEdit: editingAlias !== null });
  };

  // Filter aliases based on search term
  const filteredAliases = useMemo(() => {
    if (!aliases) return [];
    if (!searchTerm.trim()) return aliases;
    const term = searchTerm.toLowerCase().trim();
    return aliases.filter((a: SkillAliasItem) => 
      a.alias?.toLowerCase().includes(term) || 
      a.canonicalSkill?.toLowerCase().includes(term)
    );
  }, [aliases, searchTerm]);

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Typography variant="h5">{t('matching.title')}</Typography>

      <Paper sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{t('matching.weightsAndThreshold')}</Typography>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="caption" sx={{ color: weightColor, fontWeight: 600 }}>
              {t('matching.total')}: {totalWeight.toFixed(2)} ({t('matching.target')}: 1.00)
            </Typography>
            {diff > tolerance && (
              <Tooltip title={t('matching.weightTotalMustEqual')}>
                <Alert 
                  severity="error" 
                  sx={{ 
                    py: 0, 
                    px: 1, 
                    fontSize: '0.75rem',
                    '& .MuiAlert-message': { fontSize: '0.75rem', py: 0.5 }
                  }}
                >
                  {t('matching.adjustWeightsToTotal')}
                </Alert>
              </Tooltip>
            )}
          </Stack>
        </Stack>
        
        {diff > tolerance && (
          <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
            <Typography variant="body2">
              <strong>{t('matching.weightTotalMustEqual1')}</strong>
              <br />
              {t('matching.weightTotalDescription', { total: totalWeight.toFixed(2) })}
            </Typography>
          </Alert>
        )}

        {diff <= tolerance && diff > 0 && (
          <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
            <Typography variant="body2">
              {t('matching.weightTotalWithinRange')}
            </Typography>
          </Alert>
        )}

        <Grid container spacing={3} sx={{ mt: 1 }}>
          {(
            [
              [t('matching.skillWeight'),'weightSkills'],
              [t('matching.experienceWeight'),'weightExperience'],
              [t('matching.languageWeight'),'weightLanguage'],
              [t('matching.educationWeight'),'weightEducation'],
              [t('matching.locationWeight'),'weightLocation'],
              [t('matching.salaryWeight'),'weightSalary'],
              [t('matching.semanticWeight'),'weightSemantic'],
            ] as [string, WeightKey][]
          ).map(([label, key]) => (
            <Grid item xs={12} md={6} key={key}>
              <Typography gutterBottom>{label}: {Number(weights[key]).toFixed(2)}</Typography>
              <Slider step={0.01} min={0} max={1} value={Number(weights[key])} onChange={handleWeight(key)} disabled={!canEdit} />
            </Grid>
          ))}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="number"
              label={t('matching.minThreshold')}
              value={localCfg?.minThreshold ?? ''}
              onChange={(e) => setLocalCfg(prev => ({ ...(prev || {}), minThreshold: Number(e.target.value) }))}
              inputProps={{ min: 0, max: 100 }}
              disabled={!canEdit}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControlLabel
              control={<Switch checked={Boolean(localCfg?.requireAllRequiredSkills)} onChange={(e) => setLocalCfg(prev => ({ ...(prev || {}), requireAllRequiredSkills: e.target.checked }))} disabled={!canEdit} />}
              label={t('matching.requireAllRequiredSkills')}
            />
          </Grid>
          <Grid item xs={12}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Button 
                variant="contained" 
                onClick={handleSave} 
                disabled={!canEdit || updateCfg.isPending || diff > tolerance}
              >
                {updateCfg.isPending ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
                {t('matching.saveConfiguration')}
              </Button>
              {diff > tolerance && (
                <Typography variant="caption" color="error" sx={{ fontStyle: 'italic' }}>
                  {t('matching.cannotSave', { total: totalWeight.toFixed(2) })}
                </Typography>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">{t('matching.skillAliases')}</Typography>
          {aliases && aliases.length > 0 && (
            <Chip label={`${aliases.length} ${aliases.length !== 1 ? t('matching.alias') + 'es' : t('matching.alias')}`} size="small" color="primary" />
          )}
        </Stack>

        {aliasesError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {t('matching.failedToLoadAliases', { error: aliasesError instanceof Error ? aliasesError.message : 'Unknown error' })}
          </Alert>
        )}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
          <TextField 
            label={t('matching.alias')} 
            value={aliasForm.alias} 
            onChange={(e) => setAliasForm({ ...aliasForm, alias: e.target.value })} 
            disabled={!canEdit || upsertAlias.isPending}
            placeholder="e.g., JS, React.js"
            fullWidth
            helperText={t('matching.alternativeNameForSkill')}
          />
          <TextField 
            label={t('matching.canonicalSkill')} 
            value={aliasForm.canonicalSkill} 
            onChange={(e) => setAliasForm({ ...aliasForm, canonicalSkill: e.target.value })} 
            disabled={!canEdit || upsertAlias.isPending}
            placeholder="e.g., JavaScript"
            fullWidth
            helperText={t('matching.standardNameForSkill')}
          />
          <Stack direction="row" spacing={1}>
            {editingAlias ? (
              <>
                <Tooltip title={t('matching.saveChanges')}>
                  <IconButton 
                    color="primary" 
                    onClick={handleSubmitAlias} 
                    disabled={!canEdit || !aliasForm.alias.trim() || !aliasForm.canonicalSkill.trim() || upsertAlias.isPending}
                  >
                    {upsertAlias.isPending ? <CircularProgress size={20} /> : <CheckIcon />}
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('matching.cancelEditing')}>
                  <IconButton 
                    color="default" 
                    onClick={handleCancelEdit} 
                    disabled={upsertAlias.isPending}
                  >
                    <CancelIcon />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <Button 
                variant="contained" 
                startIcon={upsertAlias.isPending ? <CircularProgress size={16} /> : <AddIcon />}
                onClick={handleSubmitAlias} 
                disabled={!canEdit || !aliasForm.alias.trim() || !aliasForm.canonicalSkill.trim() || upsertAlias.isPending}
                sx={{ minWidth: 140 }}
              >
                {t('matching.addAlias')}
              </Button>
            )}
          </Stack>
        </Stack>

        <Divider sx={{ my: 3 }} />

        {/* Search and filter */}
        {aliases && aliases.length > 0 && (
          <TextField
            fullWidth
            size="small"
            placeholder={t('matching.searchAliases')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
        )}

        {/* Loading state */}
        {aliasesLoading && (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        )}

        {/* Empty state */}
        {!aliasesLoading && (!aliases || aliases.length === 0) && (
          <Alert severity="info" sx={{ mt: 2 }}>
            {t('matching.noAliasesFound')}
            <br />
            <Typography variant="caption" component="div" sx={{ mt: 1 }}>
              {t('matching.aliasExample')}
            </Typography>
          </Alert>
        )}

        {/* Filtered empty state */}
        {!aliasesLoading && aliases && aliases.length > 0 && filteredAliases.length === 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            {t('matching.noAliasesMatchSearch', { term: searchTerm })}
          </Alert>
        )}

        {/* Debug info - remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <Alert severity="info" sx={{ mt: 1, mb: 2 }}>
            <Typography variant="caption">
              <strong>{t('matching.debugInfo')}</strong> {t('matching.aliasesCount')}: {aliases?.length || 0}, {t('matching.filtered')}: {filteredAliases?.length || 0}, 
              {t('matching.loading')}: {String(aliasesLoading)}, {t('matching.error')}: {aliasesError ? String(aliasesError) : t('matching.none')}
            </Typography>
          </Alert>
        )}

        {/* Aliases table */}
        {!aliasesLoading && filteredAliases && filteredAliases.length > 0 && (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>{t('matching.alias')}</strong></TableCell>
                <TableCell><strong>{t('matching.canonicalSkill')}</strong></TableCell>
                <TableCell align="right"><strong>{t('common.actions')}</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAliases.map((a: SkillAliasItem) => (
                <TableRow key={a.id || `alias-${a.alias}`} hover>
                  <TableCell>
                    <Chip label={a.alias} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {a.canonicalSkill}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <Tooltip title={t('matching.editAlias')}>
                        <IconButton 
                          size="small" 
                          color="primary" 
                          onClick={() => handleEditAlias(a)} 
                          disabled={!canEdit || editingAlias !== null}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('matching.deleteAlias')}>
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => {
                            if (!canEdit) return;
                            if (window.confirm(t('matching.deleteAliasConfirm', { alias: a.alias }))) {
                              deleteAlias.mutate(a.id);
                            }
                          }} 
                          disabled={!canEdit || deleteAlias.isPending}
                        >
                          {deleteAlias.isPending ? <CircularProgress size={16} /> : <DeleteIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Info box */}
        {!aliasesLoading && aliases && aliases.length > 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>{t('matching.howItWorks')}</strong> {t('matching.howItWorksDescription')}
            </Typography>
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default MatchingSettings;
