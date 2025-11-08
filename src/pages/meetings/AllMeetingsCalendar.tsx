import React, { useEffect, useMemo, useState } from 'react';
import { Box, Paper, Stack, Typography, ToggleButtonGroup, ToggleButton, Divider, LinearProgress, Chip, List, ListItem, ListItemText, ListSubheader } from '@mui/material';
import { applicationService } from '@/services/cv-sharing';
import { Meeting } from '@/types/cv-sharing';

const formatDateKey = (iso: string) => new Date(iso).toISOString().split('T')[0];

const AllMeetingsCalendar: React.FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [today] = useState(new Date());

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await applicationService.getCompanyMeetings();
        setMeetings(data || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const start = new Date(today);
    const end = new Date(today);
    if (view === 'day') {
      // same day
    } else if (view === 'week') {
      const day = start.getDay();
      start.setDate(start.getDate() - day);
      end.setDate(start.getDate() + 6);
    } else {
      start.setDate(1);
      end.setMonth(start.getMonth() + 1);
      end.setDate(0);
    }
    return meetings.filter(m => {
      const d = new Date(m.startTime);
      return d >= start && d <= end;
    }).sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [meetings, today, view]);

  const grouped = useMemo(() => {
    const map: Record<string, Meeting[]> = {};
    for (const m of filtered) {
      const key = formatDateKey(m.startTime as any);
      if (!map[key]) map[key] = [];
      map[key].push(m);
    }
    return map;
  }, [filtered]);

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h5">Company Meetings</Typography>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={view}
            onChange={(_, v) => v && setView(v)}
          >
            <ToggleButton value="month">Month</ToggleButton>
            <ToggleButton value="week">Week</ToggleButton>
            <ToggleButton value="day">Day</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
        <Divider sx={{ my: 2 }} />
        {loading && <LinearProgress />}
        {!loading && filtered.length === 0 && (
          <Typography variant="body2" color="text.secondary">No meetings found for this period.</Typography>
        )}
        <List sx={{ width: '100%', bgcolor: 'transparent' }}>
          {Object.keys(grouped).sort().map(dateKey => (
            <li key={dateKey}>
              <ul>
                <ListSubheader sx={{ bgcolor: 'transparent', px: 0 }}>{new Date(dateKey).toLocaleDateString()}</ListSubheader>
                {grouped[dateKey].map(m => (
                  <ListItem key={m.id} sx={{ px: 0 }}>
                    <ListItemText
                      primary={`${m.title} • ${new Date(m.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (${m.durationMinutes}m)`}
                      secondary={(m.meetingLink || m.location || m.provider) as any}
                    />
                    <Chip size="small" label={m.status} color={m.status === 'CANCELLED' ? 'default' : 'success'} />
                  </ListItem>
                ))}
              </ul>
            </li>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default AllMeetingsCalendar;
