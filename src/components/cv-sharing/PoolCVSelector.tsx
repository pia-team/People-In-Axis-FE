import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Stack,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { poolCVService } from '@/services/cv-sharing';
import { PoolCV } from '@/types/cv-sharing';
import { useTranslation } from 'react-i18next';

interface PoolCVSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (cv: PoolCV) => void;
}

const PoolCVSelector: React.FC<PoolCVSelectorProps> = ({ open, onClose, onSelect }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<PoolCV[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [experience, setExperience] = useState<string>('all');

  useEffect(() => {
    if (open) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, status, experience]);

  const load = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (status !== 'all') params.active = status === 'active';
      if (experience !== 'all') {
        const [min, max] = experience.split('-').map(Number);
        params.minExperience = min;
        params.maxExperience = max || 99;
      }
      if (search.trim()) params.q = search.trim();
      const data = await poolCVService.getPoolCVs(params);
      setItems(data.content || []);
    } catch {
      // swallow, parent handles notifications
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" fullScreen={isMobile}>
      <DialogTitle>Select a Pool CV</DialogTitle>
      <DialogContent>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 2 }}>
          <TextField
            size="small"
            placeholder="Search by name, email, position..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
            fullWidth
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
            sx={{ flex: { xs: '1 1 100%', sm: '1 1 auto' } }}
          />
          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 120 } }}>
            <InputLabel>Status</InputLabel>
            <Select value={status} label="Status" onChange={(e) => setStatus(e.target.value as any)}>
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 150 } }}>
            <InputLabel>{t('poolCV.experienceYears')}</InputLabel>
            <Select value={experience} label={t('poolCV.experienceYears')} onChange={(e) => setExperience(e.target.value)}>
              <MenuItem value="all">{t('common.all')}</MenuItem>
              <MenuItem value="0-2">0-2 {t('common.years')}</MenuItem>
              <MenuItem value="2-5">2-5 {t('common.years')}</MenuItem>
              <MenuItem value="5-10">5-10 {t('common.years')}</MenuItem>
              <MenuItem value="10-99">10+ {t('common.years')}</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" onClick={load} sx={{ width: { xs: '100%', sm: 'auto' } }}>Apply</Button>
        </Stack>

        {loading ? <CircularProgress size={24} /> : (
          <List>
            {items.map(cv => (
              <ListItem key={cv.id} divider>
                <ListItemText
                  primary={`${cv.firstName} ${cv.lastName}`}
                  secondary={
                    <>
                      {cv.email} • {cv.currentPosition || '-'}
                      {cv.currentCompany ? ` @ ${cv.currentCompany}` : ''}
                    </>
                  }
                />
                <ListItemSecondaryAction sx={{ position: { xs: 'static', sm: 'absolute' }, mt: { xs: 1, sm: 0 } }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                    {cv.isActive ? <Chip size="small" label="Active" color="success" /> : <Chip size="small" label="Inactive" />}
                    <Button size="small" variant="contained" onClick={() => onSelect(cv)} fullWidth={isMobile}>Select</Button>
                  </Stack>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} fullWidth={isMobile}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PoolCVSelector;
