import React, { useEffect, useState } from 'react';
import { Box, Chip, TextField, Button, Divider } from '@mui/material';
import { useSnackbar } from 'notistack';
import { poolCVService } from '@/services/cv-sharing';

interface PoolCVTagsProps {
  poolCvId: string;
  tags: string[];
  onChange?: (tags: string[]) => void;
}

const PoolCVTags: React.FC<PoolCVTagsProps> = ({ poolCvId, tags, onChange }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [newTag, setNewTag] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const s = await poolCVService.getSuggestedTags();
        setSuggestions(s || []);
      } catch {}
    })();
  }, []);

  const add = async () => {
    const value = newTag.trim();
    if (!value) return;
    if (tags.includes(value)) {
      enqueueSnackbar('Tag already exists', { variant: 'info' });
      return;
    }
    try {
      setWorking(true);
      await poolCVService.addTags(poolCvId, [value]);
      const next = [...tags, value];
      onChange?.(next);
      setNewTag('');
      enqueueSnackbar('Tag added', { variant: 'success' });
    } catch (e) {
      enqueueSnackbar('Failed to add tag', { variant: 'error' });
    } finally {
      setWorking(false);
    }
  };

  const remove = async (tag: string) => {
    try {
      setWorking(true);
      await poolCVService.removeTag(poolCvId, tag);
      const next = tags.filter(t => t !== tag);
      onChange?.(next);
      enqueueSnackbar('Tag removed', { variant: 'success' });
    } catch (e) {
      enqueueSnackbar('Failed to remove tag', { variant: 'error' });
    } finally {
      setWorking(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
        {tags.map(t => (
          <Chip key={t} label={t} onDelete={() => remove(t)} />
        ))}
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          size="small"
          placeholder={suggestions.length ? `e.g. ${suggestions[0]}` : 'Add tag'}
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
        />
        <Button variant="outlined" onClick={add} disabled={working}>Add</Button>
      </Box>
      <Divider sx={{ mt: 1 }} />
    </Box>
  );
};

export default PoolCVTags;
