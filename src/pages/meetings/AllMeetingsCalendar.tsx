import React, { useEffect, useMemo, useState } from 'react';
import { Box, Paper, Stack, Typography, Divider, LinearProgress } from '@mui/material';
import { applicationService } from '@/services/cv-sharing';
import { Meeting } from '@/types/cv-sharing';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { parse, startOfWeek, getDay, format } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useTranslation } from 'react-i18next';

const locales = { 'en-US': enUS } as any;
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

type RbcView = 'month' | 'week' | 'day' | 'work_week' | 'agenda';
const RBCalendar = Calendar as unknown as React.ComponentType<any>;

type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status?: string;
  resource?: Meeting;
};

const AllMeetingsCalendar: React.FC = () => {
  const { t } = useTranslation();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<RbcView>('month');
  const [date, setDate] = useState<Date>(new Date());

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

  const events: CalendarEvent[] = useMemo(() => {
    return (meetings || []).map(m => {
      const start = new Date(m.startTime as any);
      const end = new Date(start.getTime() + (m.durationMinutes || 30) * 60000);
      return {
        id: m.id,
        title: m.title,
        start,
        end,
        status: (m as any).status,
        resource: m,
      };
    });
  }, [meetings]);

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h5">{t('meeting.companyMeetings')}</Typography>
        </Stack>
        <Divider sx={{ mb: 2 }} />
        {loading && <LinearProgress />}
        {!loading && (
          <RBCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            views={["month", "week", "day"]}
            view={view}
            onView={setView}
            date={date}
            onNavigate={(d: Date) => setDate(d)}
            style={{ height: 800 }}
            toolbar
            popup
            selectable={false}
            eventPropGetter={(event: CalendarEvent) => {
              const cancelled = event.status === 'CANCELLED';
              const style: React.CSSProperties = {
                backgroundColor: cancelled ? '#9ca3af' : '#2563eb',
                borderColor: cancelled ? '#9ca3af' : '#1d4ed8',
                color: '#fff',
              };
              return { style };
            }}
          />
        )}
      </Paper>
    </Box>
  );
};

export default AllMeetingsCalendar;
