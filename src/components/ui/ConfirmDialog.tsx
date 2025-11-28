import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, useMediaQuery, useTheme } from '@mui/material';

export type ConfirmDialogProps = {
  open: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: 'primary' | 'error' | 'inherit' | 'secondary' | 'success' | 'info' | 'warning';
  loading?: boolean;
  confirmDisabled?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  children?: React.ReactNode;
};

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmColor = 'primary',
  loading = false,
  confirmDisabled = false,
  onClose,
  onConfirm,
  children,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth fullScreen={isMobile}>
      {title && <DialogTitle>{title}</DialogTitle>}
      <DialogContent>
        {description && (
          <Typography variant="body2" color="text.secondary" paragraph>
            {description}
          </Typography>
        )}
        {children}
      </DialogContent>
      <DialogActions sx={{ flexDirection: { xs: 'column-reverse', sm: 'row' }, gap: 1 }}>
        <Button onClick={onClose} disabled={loading} fullWidth={isMobile}>{cancelLabel}</Button>
        <Button onClick={onConfirm} variant="contained" color={confirmColor} disabled={loading || confirmDisabled} fullWidth={isMobile}>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
