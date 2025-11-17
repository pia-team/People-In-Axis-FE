import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Stack,
  Paper,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  MarkEmailRead as MarkReadIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/notificationService';
import { Notification } from '@/types/cv-sharing';
import PageContainer from '@/components/ui/PageContainer';
import SectionCard from '@/components/ui/SectionCard';
import LoadingState from '@/components/ui/LoadingState';
import ErrorState from '@/components/ui/ErrorState';
// Using native Date for relative time formatting
const formatRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const then = typeof date === 'string' ? new Date(date) : date;
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return then.toLocaleDateString();
};

const NotificationList: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'unread'>('unread');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const queryClient = useQueryClient();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['notifications', 'list', filter],
    queryFn: () => notificationService.getNotifications({
      unread: filter === 'unread' ? true : undefined,
      page: 0,
      size: 50,
    }),
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setMenuAnchor(null);
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setMenuAnchor(null);
    },
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, notification: Notification) => {
    setMenuAnchor(event.currentTarget);
    setSelectedNotification(notification);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedNotification(null);
  };

  const handleMarkAsRead = () => {
    if (selectedNotification) {
      markAsReadMutation.mutate(selectedNotification.id);
    }
  };

  const handleDelete = () => {
    if (selectedNotification) {
      if (window.confirm('Delete this notification?')) {
        deleteMutation.mutate(selectedNotification.id);
      }
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'SUCCESS':
        return 'success';
      case 'ERROR':
        return 'error';
      case 'WARNING':
        return 'warning';
      case 'INFO':
      default:
        return 'info';
    }
  };

  if (isPending) {
    return (
      <PageContainer title="Notifications">
        <LoadingState message="Loading notifications..." />
      </PageContainer>
    );
  }

  if (isError) {
    return (
      <PageContainer title="Notifications">
        <ErrorState
          title="Failed to load notifications"
          message={error instanceof Error ? error.message : 'An error occurred'}
          onRetry={() => queryClient.invalidateQueries({ queryKey: ['notifications'] })}
        />
      </PageContainer>
    );
  }

  const notifications = data?.content ?? [];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <PageContainer title="Notifications">
      <SectionCard>
        <Stack spacing={2}>
          {/* Filters and Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Stack direction="row" spacing={1}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filter === 'all'}
                    onChange={(e) => setFilter(e.target.checked ? 'all' : 'unread')}
                  />
                }
                label="Show all"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filter === 'unread'}
                    onChange={(e) => setFilter(e.target.checked ? 'unread' : 'all')}
                  />
                }
                label="Unread only"
              />
            </Stack>
            {unreadCount > 0 && (
              <Button
                variant="outlined"
                startIcon={<CheckCircleIcon />}
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
              >
                Mark all as read
              </Button>
            )}
          </Box>

          <Divider />

          {/* Notifications List */}
          {notifications.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No notifications
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {filter === 'unread' ? 'You have no unread notifications' : 'You have no notifications'}
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1}>
              {notifications.map((notification) => (
                <Paper
                  key={notification.id}
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: notification.isRead ? 'divider' : 'primary.main',
                    bgcolor: notification.isRead ? 'background.paper' : 'action.hover',
                    position: 'relative',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <Chip
                          label={notification.type || 'INFO'}
                          color={getNotificationColor(notification.type) as any}
                          size="small"
                        />
                        {!notification.isRead && (
                          <Chip label="Unread" color="primary" size="small" variant="outlined" />
                        )}
                        <Typography variant="caption" color="text.secondary">
                          {formatRelativeTime(notification.createdAt)}
                        </Typography>
                      </Stack>
                      <Typography variant="subtitle2" sx={{ fontWeight: notification.isRead ? 400 : 600, mb: 0.5 }}>
                        {notification.subject}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {notification.content}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, notification)}
                      sx={{ ml: 1 }}
                    >
                      <MoreIcon />
                    </IconButton>
                  </Box>
                </Paper>
              ))}
            </Stack>
          )}
        </Stack>
      </SectionCard>

      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        {selectedNotification && !selectedNotification.isRead && (
          <MenuItem onClick={handleMarkAsRead}>
            <ListItemIcon>
              <MarkReadIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Mark as read</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </PageContainer>
  );
};

export default NotificationList;

