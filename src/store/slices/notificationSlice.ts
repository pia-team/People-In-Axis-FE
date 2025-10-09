import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number;
  timestamp: number;
}

interface NotificationState {
  notifications: Notification[];
}

const initialState: NotificationState = {
  notifications: [],
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: `${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const { addNotification, removeNotification, clearNotifications } = notificationSlice.actions;

// Helper action creators
export const showSuccess = (message: string, title?: string, duration?: number) =>
  addNotification({ type: 'success', message, title, duration });

export const showError = (message: string, title?: string, duration?: number) =>
  addNotification({ type: 'error', message, title, duration });

export const showWarning = (message: string, title?: string, duration?: number) =>
  addNotification({ type: 'warning', message, title, duration });

export const showInfo = (message: string, title?: string, duration?: number) =>
  addNotification({ type: 'info', message, title, duration });

export default notificationSlice.reducer;
