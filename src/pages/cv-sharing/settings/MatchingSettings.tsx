import React, { useMemo, useState } from 'react';
import { Box, Paper, Typography, Grid, Slider, Switch, FormControlLabel, TextField, Button, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Stack, Divider } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { matchingService } from '@/services/cv-sharing/matchingService';
import { MatchingConfig, SkillAliasItem } from '@/types/cv-sharing/matching';
import DeleteIcon from '@mui/icons-material/Delete';
import { useKeycloak } from '@/hooks/useKeycloak';

type WeightKey =
  | 'weightSkills'
  | 'weightExperience'
  | 'weightLanguage'
  | 'weightEducation'
  | 'weightLocation'
  | 'weightSalary'
  | 'weightSemantic';

const MatchingSettings: React.FC = () => {
  const qc = useQueryClient();
  const { data: cfg } = useQuery({ queryKey: ['matching','config'], queryFn: matchingService.getConfig });
  const { data: aliases } = useQuery({ queryKey: ['matching','aliases'], queryFn: matchingService.listAliases });
  const { hasAnyRole } = useKeycloak();
  const canEdit = hasAnyRole(['HUMAN_RESOURCES', 'COMPANY_MANAGER']);

  const [localCfg, setLocalCfg] = useState<MatchingConfig | undefined>(undefined);
  const [aliasForm, setAliasForm] = useState<{ alias: string; canonicalSkill: string }>({ alias: '', canonicalSkill: '' });

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
    }
  });

  const upsertAlias = useMutation({
    mutationFn: (payload: { alias: string; canonicalSkill: string }) => matchingService.upsertAlias(payload),
    onSuccess: () => {
      setAliasForm({ alias: '', canonicalSkill: '' });
      qc.invalidateQueries({ queryKey: ['matching','aliases'] });
    }
  });

  const deleteAlias = useMutation({
    mutationFn: (id: string) => matchingService.deleteAlias(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['matching','aliases'] });
    }
  });

  const handleWeight = (key: WeightKey) => (_: any, v: number | number[]) => {
    const val = Array.isArray(v) ? v[0] : v;
    setLocalCfg(prev => ({ ...(prev || {}), [key]: Math.round(val * 100) / 100 }));
  };

  const handleSave = () => {
    if (!localCfg) return;
    updateCfg.mutate({ ...localCfg });
  };

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Typography variant="h5">Matching Settings</Typography>

      <Paper sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Weights & Threshold</Typography>
          <Typography variant="caption" sx={{ color: weightColor, fontWeight: 600 }}>
            Total: {totalWeight.toFixed(2)} (target: 1.00)
          </Typography>
        </Stack>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {(
            [
              ['Skills','weightSkills'],
              ['Experience','weightExperience'],
              ['Language','weightLanguage'],
              ['Education','weightEducation'],
              ['Location','weightLocation'],
              ['Salary','weightSalary'],
              ['Semantic','weightSemantic'],
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
              label="Min Threshold"
              value={localCfg?.minThreshold ?? ''}
              onChange={(e) => setLocalCfg(prev => ({ ...(prev || {}), minThreshold: Number(e.target.value) }))}
              inputProps={{ min: 0, max: 100 }}
              disabled={!canEdit}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControlLabel
              control={<Switch checked={Boolean(localCfg?.requireAllRequiredSkills)} onChange={(e) => setLocalCfg(prev => ({ ...(prev || {}), requireAllRequiredSkills: e.target.checked }))} disabled={!canEdit} />}
              label="Require all required skills"
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" onClick={handleSave} disabled={!canEdit || updateCfg.isPending || diff > tolerance}>Save</Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6">Skill Aliases</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
          <TextField label="Alias" value={aliasForm.alias} onChange={(e) => setAliasForm({ ...aliasForm, alias: e.target.value })} disabled={!canEdit} />
          <TextField label="Canonical Skill" value={aliasForm.canonicalSkill} onChange={(e) => setAliasForm({ ...aliasForm, canonicalSkill: e.target.value })} disabled={!canEdit} />
          <Button variant="outlined" onClick={() => upsertAlias.mutate(aliasForm)} disabled={!canEdit || !aliasForm.alias || !aliasForm.canonicalSkill}>Add / Update</Button>
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Alias</TableCell>
              <TableCell>Canonical Skill</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(aliases || []).map((a: SkillAliasItem) => (
              <TableRow key={a.id} hover>
                <TableCell>{a.alias}</TableCell>
                <TableCell>{a.canonicalSkill}</TableCell>
                <TableCell align="right">
                  <IconButton color="error" onClick={() => deleteAlias.mutate(a.id)} disabled={!canEdit}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default MatchingSettings;
