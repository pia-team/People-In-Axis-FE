import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { languageService, LanguageDto } from '@/services/languageService';
import {
  Box,
  Paper,
  Stack,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Tooltip,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import PageContainer from '@/components/ui/PageContainer';

const LanguagesPage: React.FC = () => {
  const qc = useQueryClient();
  const { data: active = [] } = useQuery({ queryKey: ['languages', 'active'], queryFn: languageService.getActive });
  const { data: all = [] } = useQuery({ queryKey: ['languages', 'all'], queryFn: languageService.getAll });

  const [addOpen, setAddOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<string>('');

  const availableToAdd = useMemo(() => {
    const set = new Set(active.map(a => a.code));
    return all.filter(a => !set.has(a.code));
  }, [active, all]);

  const addMutation = useMutation({
    mutationFn: ({ code, name }: LanguageDto) => languageService.add(code, name),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['languages', 'active'] });
      setAddOpen(false);
      setSelectedCode('');
    },
  });

  const delMutation = useMutation({
    mutationFn: (code: string) => languageService.remove(code),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['languages', 'active'] });
    },
  });

  const selectedMeta = availableToAdd.find(l => l.code === selectedCode);

  return (
    <PageContainer title="Languages">
      <Stack spacing={2}>
        <Paper sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">Active Languages</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddOpen(true)}>Add</Button>
          </Stack>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Language Name</TableCell>
                <TableCell>Code</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {active.map((l) => (
                <TableRow key={l.code}>
                  <TableCell>{l.name}</TableCell>
                  <TableCell>{l.code}</TableCell>
                  <TableCell align="right">
                    {l.code === 'en' ? (
                      <Tooltip title="Default language cannot be deleted">
                        <span>
                          <IconButton size="small" disabled>
                            <DeleteOutlineIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                    ) : (
                      <IconButton size="small" color="error" onClick={() => delMutation.mutate(l.code)}>
                        <DeleteOutlineIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Stack>

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Language</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel id="lang-select-label">Language</InputLabel>
              <Select
                labelId="lang-select-label"
                value={selectedCode}
                label="Language"
                onChange={(e) => setSelectedCode(e.target.value)}
              >
                {availableToAdd.map((l) => (
                  <MenuItem key={l.code} value={l.code}>{l.name} ({l.code})</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!selectedMeta}
            onClick={() => selectedMeta && addMutation.mutate(selectedMeta)}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default LanguagesPage;
