import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Stack,
  Divider,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Link as LinkIcon,
  Place as PlaceIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { applicationService } from '@/services/cv-sharing';
import { CreateMeetingRequest, Meeting, MeetingProvider } from '@/types/cv-sharing';

const MeetingScheduler: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [provider, setProvider] = useState<MeetingProvider | undefined>(undefined);
  const [meetingLink, setMeetingLink] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [participants, setParticipants] = useState<{ email: string; name?: string }[]>([]);
  const [participantEmail, setParticipantEmail] = useState('');
  const [participantName, setParticipantName] = useState('');

  useEffect(() => {
    if (id) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const load = async () => {
    try {
      setLoading(true);
      const data = await applicationService.getMeetings(id!);
      setMeetings(data || []);
    } catch (e) {
      enqueueSnackbar(t('meeting.failedToLoadMeetings'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const addParticipant = () => {
    const email = participantEmail.trim();
    if (!email) return;
    setParticipants([...participants, { email, name: participantName.trim() || undefined }]);
    setParticipantEmail('');
    setParticipantName('');
  };

  const removeParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const clearForm = () => {
    setTitle('');
    setStartTime('');
    setDurationMinutes(30);
    setProvider(undefined);
    setMeetingLink('');
    setLocation('');
    setDescription('');
    setParticipants([]);
  };

  const schedule = async () => {
    if (!id) return;
    if (!title || !startTime || !durationMinutes) {
      enqueueSnackbar(t('meeting.pleaseFillRequiredFields'), { variant: 'warning' });
      return;
    }
    const payload: CreateMeetingRequest = {
      title,
      startTime,
      durationMinutes,
      provider,
      meetingLink: meetingLink || undefined,
      location: location || undefined,
      description: description || undefined,
      participants: participants.map(p => ({ email: p.email, name: p.name }))
    };
    try {
      setSaving(true);
      await applicationService.scheduleMeeting(id, payload);
      enqueueSnackbar(t('application.meetingScheduledSuccess'), { variant: 'success' });
      clearForm();
      await load();
    } catch (e) {
      enqueueSnackbar(t('meeting.failedToScheduleMeeting'), { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const cancelMeeting = async (meetingId: string) => {
    if (!id) return;
    try {
      await applicationService.cancelMeeting(id, meetingId);
      enqueueSnackbar(t('meeting.meetingCancelledShort'), { variant: 'success' });
      await load();
    } catch (e) {
      enqueueSnackbar(t('meeting.failedToCancelMeeting'), { variant: 'error' });
    }
  };

  if (loading && meetings.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
        <Typography variant="h5" gutterBottom>
          {t('meeting.scheduleMeeting')}
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Stack spacing={2}>
              <TextField label={t('meeting.meetingTitle')} value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />
              <TextField
                label={t('meeting.startTime')}
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                fullWidth
              />
              <TextField
                label={t('meeting.duration')}
                type="number"
                inputProps={{ min: 15 }}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                fullWidth
              />
              <Select
                displayEmpty
                value={provider || ''}
                onChange={(e) => setProvider((e.target.value || undefined) as MeetingProvider | undefined)}
              >
                <MenuItem value="">
                  <em>{t('meeting.providerOptional')}</em>
                </MenuItem>
                <MenuItem value={MeetingProvider.TEAMS}>{t('meeting.teams')}</MenuItem>
                <MenuItem value={MeetingProvider.ZOOM}>{t('meeting.zoom')}</MenuItem>
                <MenuItem value={MeetingProvider.MEET}>{t('meeting.googleMeet')}</MenuItem>
                <MenuItem value={MeetingProvider.OTHER}>{t('meeting.other')}</MenuItem>
              </Select>
              <TextField label={t('meeting.meetingLink')} value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} fullWidth 
                InputProps={{ startAdornment: <InputAdornment position="start"><LinkIcon /></InputAdornment> }} />
              <TextField label={t('meeting.location')} value={location} onChange={(e) => setLocation(e.target.value)} fullWidth 
                InputProps={{ startAdornment: <InputAdornment position="start"><PlaceIcon /></InputAdornment> }} />
              <TextField label={t('meeting.notes')} value={description} onChange={(e) => setDescription(e.target.value)} fullWidth multiline rows={3} />

              <Divider />

              <Typography variant="subtitle1">{t('meeting.participants')}</Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
                <TextField label={t('meeting.email')} value={participantEmail} onChange={(e) => setParticipantEmail(e.target.value)} fullWidth />
                <TextField label={t('meeting.nameOptional')} value={participantName} onChange={(e) => setParticipantName(e.target.value)} fullWidth />
                <Button variant="outlined" onClick={addParticipant}>{t('common.add')}</Button>
              </Stack>
              <List>
                {participants.map((p, i) => (
                  <ListItem key={`${p.email}-${i}`} secondaryAction={
                    <IconButton edge="end" onClick={() => removeParticipant(i)}>
                      <DeleteIcon />
                    </IconButton>
                  }>
                    <ListItemIcon><CalendarIcon /></ListItemIcon>
                    <ListItemText primary={p.email} secondary={p.name} />
                  </ListItem>
                ))}
              </List>

              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button variant="outlined" onClick={() => navigate(-1)} disabled={saving}>{t('common.back')}</Button>
                <Button variant="contained" onClick={schedule} disabled={saving}>{t('meeting.scheduleMeeting')}</Button>
              </Stack>
            </Stack>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="h6">{t('meeting.existingMeetings')}</Typography>
            <Divider sx={{ mb: 1 }} />
            {meetings.length === 0 && (
              <Typography variant="body2" color="text.secondary">{t('meeting.noMeetingsYet')}</Typography>
            )}
            <List>
              {meetings.map((m) => (
                <ListItem key={m.id} secondaryAction={
                  <IconButton edge="end" color="error" onClick={() => cancelMeeting(m.id)}>
                    <DeleteIcon />
                  </IconButton>
                }>
                  <ListItemIcon><CalendarIcon /></ListItemIcon>
                  <ListItemText primary={`${m.title} • ${new Date(m.startTime).toLocaleString()} (${m.durationMinutes}m)`} secondary={m.location || m.meetingLink || m.provider} />
                </ListItem>
              ))}
            </List>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default MeetingScheduler;
