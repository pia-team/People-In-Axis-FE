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
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { poolCVService } from '@/services/cv-sharing';
import { PoolCV } from '@/types/cv-sharing';

interface PoolCVSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (cv: PoolCV) => void;
}

const PoolCVSelector: React.FC<PoolCVSelectorProps> = ({ open, onClose, onSelect }) => {
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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Select a Pool CV</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            size="small"
            placeholder="Search by name, email, position..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
            fullWidth
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select value={status} label="Status" onChange={(e) => setStatus(e.target.value as any)}>
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Experience</InputLabel>
            <Select value={experience} label="Experience" onChange={(e) => setExperience(e.target.value)}>
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="0-2">0-2</MenuItem>
              <MenuItem value="2-5">2-5</MenuItem>
              <MenuItem value="5-10">5-10</MenuItem>
              <MenuItem value="10-99">10+</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" onClick={load}>Apply</Button>
        </Box>

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
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {cv.isActive ? <Chip size="small" label="Active" color="success" /> : <Chip size="small" label="Inactive" />}
                    <Button size="small" variant="contained" onClick={() => onSelect(cv)}>Select</Button>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PoolCVSelector;
