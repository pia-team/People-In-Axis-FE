import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Stack } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { applicationService } from '@/services/cv-sharing';

const ForwardDialog: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [recipients, setRecipients] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const handleForward = async () => {
    if (!id) return;
    const emails = recipients
      .split(',')
      .map(e => e.trim())
      .filter(Boolean);
    if (emails.length === 0) {
      enqueueSnackbar('Please enter at least one recipient email', { variant: 'warning' });
      return;
    }
    try {
      setSaving(true);
      await applicationService.forwardApplication(id, { recipients: emails, message });
      enqueueSnackbar('Application forwarded', { variant: 'success' });
      navigate(`/applications/${id}`);
    } catch (e) {
      enqueueSnackbar('Failed to forward application', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, maxWidth: 640, mx: 'auto' }}>
        <Typography variant="h5" gutterBottom>
          Forward Application
        </Typography>
        <Stack spacing={2}>
          <TextField
            label="Recipients (comma separated emails)"
            placeholder="user1@company.com, user2@company.com"
            value={recipients}
            onChange={(e) => setRecipients(e.target.value)}
            fullWidth
          />
          <TextField
            label="Message (optional)"
            multiline
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            fullWidth
          />
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button variant="outlined" onClick={() => navigate(-1)} disabled={saving}>Cancel</Button>
            <Button variant="contained" onClick={handleForward} disabled={saving}>Send</Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};

export default ForwardDialog;
