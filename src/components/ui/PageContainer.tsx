import React from 'react';
import { Box, Stack, Typography } from '@mui/material';

interface PageContainerProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

const PageContainer: React.FC<PageContainerProps> = ({ title, subtitle, actions, children }) => {
  return (
    <Box>
      {(title || subtitle || actions) && (
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" spacing={1.5} sx={{ mb: 2 }}>
          <Box>
            {title && (
              <Typography variant="h5" sx={{ fontWeight: 700, mb: subtitle ? 0.5 : 0 }}>{title}</Typography>
            )}
            {subtitle && (
              <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
            )}
          </Box>
          {actions && <Box>{actions}</Box>}
        </Stack>
      )}
      <Box>
        {children}
      </Box>
    </Box>
  );
};

export default PageContainer;
