import React from 'react';
import { Paper, Stack, Typography, Box } from '@mui/material';

interface SectionCardProps {
  title?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ title, actions, children }) => {
  return (
    <Paper sx={{ p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
      {(title || actions) && (
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
          {title && <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{title}</Typography>}
          {actions && <Box>{actions}</Box>}
        </Stack>
      )}
      <Box>
        {children}
      </Box>
    </Paper>
  );
};

export default SectionCard;
