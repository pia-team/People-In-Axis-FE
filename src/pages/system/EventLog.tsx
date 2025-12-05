import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Stack,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  BugReport as BugReportIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
} from '@mui/icons-material';
import { eventService, EventEntry } from '@/services/eventService';

const REFRESH_INTERVAL = 5000; // 5 seconds

const EventLog: React.FC = () => {
  const [events, setEvents] = useState<EventEntry[]>([]);
  const [count, setCount] = useState(0);
  const [maxSize, setMaxSize] = useState(50);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventService.getEvents();
      setEvents(response.events);
      setCount(response.count);
      setMaxSize(response.maxSize);
    } catch (err) {
      setError('Failed to fetch events');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleClearEvents = async () => {
    if (!window.confirm('Are you sure you want to clear all events?')) {
      return;
    }
    try {
      await eventService.clearEvents();
      await fetchEvents();
    } catch (err) {
      console.error('Error clearing events:', err);
    }
  };

  const handleAddTestEvent = async () => {
    try {
      await eventService.addTestEvent('Manual test event at ' + new Date().toISOString());
      await fetchEvents();
    } catch (err) {
      console.error('Error adding test event:', err);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchEvents();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchEvents]);

  return (
    <Box sx={{ p: 3, minHeight: '100vh', bgcolor: 'background.default' }}>
      <Paper sx={{ p: 3 }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <BugReportIcon sx={{ fontSize: 32, color: 'error.main' }} />
            <Typography variant="h4" component="h1">
              System Events
            </Typography>
            <Chip
              label={`${count} / ${maxSize}`}
              color={count > maxSize * 0.8 ? 'warning' : 'default'}
              size="small"
            />
          </Stack>

          <Stack direction="row" alignItems="center" spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  size="small"
                />
              }
              label={
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  {autoRefresh ? (
                    <PlayArrowIcon fontSize="small" color="success" />
                  ) : (
                    <PauseIcon fontSize="small" color="disabled" />
                  )}
                  <Typography variant="body2">
                    Auto Refresh ({REFRESH_INTERVAL / 1000}s)
                  </Typography>
                </Stack>
              }
            />

            <Tooltip title="Refresh now">
              <IconButton onClick={fetchEvents} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>

            <Button
              variant="outlined"
              size="small"
              startIcon={<BugReportIcon />}
              onClick={handleAddTestEvent}
            >
              Add Test
            </Button>

            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<DeleteIcon />}
              onClick={handleClearEvents}
              disabled={count === 0}
            >
              Clear All
            </Button>
          </Stack>
        </Stack>

        {/* Info Alert */}
        <Alert severity="info" sx={{ mb: 2 }}>
          This page shows real-time error events from the backend cv-integration services.
          Events are stored in memory (max {maxSize}) with FIFO behavior.
          <strong> This page is not visible in the menu - access via URL only.</strong>
        </Alert>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Loading */}
        {loading && events.length === 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Empty State */}
        {!loading && events.length === 0 && (
          <Alert severity="success" sx={{ mb: 2 }}>
            No error events recorded. System is running smoothly!
          </Alert>
        )}

        {/* Events Table */}
        {events.length > 0 && (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', width: 50 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: 180 }}>Timestamp</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Message</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.map((event, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      '&:hover': { bgcolor: 'action.hover' },
                      bgcolor: index === 0 ? 'error.dark' : 'inherit',
                      '& td': index === 0 ? { color: 'error.contrastText' } : {},
                    }}
                  >
                    <TableCell>
                      <Chip
                        label={index + 1}
                        size="small"
                        color={index === 0 ? 'error' : 'default'}
                        variant={index === 0 ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {event.timestamp}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: 'monospace',
                          wordBreak: 'break-word',
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {event.message}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Footer */}
        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">
            Last updated: {new Date().toLocaleString()} | Newest events are shown first (highlighted in red)
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default EventLog;

