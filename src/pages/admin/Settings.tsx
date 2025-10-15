import React from 'react';
import { Box, Typography, Paper, Stack } from '@mui/material';

const Settings: React.FC = () => {
  const env = import.meta.env;
  const rows: { label: string; value: string | boolean | undefined }[] = [
    { label: 'VITE_API_BASE_URL', value: env.VITE_API_BASE_URL },
    { label: 'VITE_AUTH_ENABLED', value: env.VITE_AUTH_ENABLED },
    { label: 'VITE_KEYCLOAK_URL', value: env.VITE_KEYCLOAK_URL },
    { label: 'VITE_KEYCLOAK_REALM', value: env.VITE_KEYCLOAK_REALM },
    { label: 'VITE_KEYCLOAK_CLIENT_ID', value: env.VITE_KEYCLOAK_CLIENT_ID },
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
        <Stack spacing={1}>
          <Typography variant="body2" color="text.secondary">Frontend environment configuration</Typography>
          {rows.map((r) => (
            <Stack key={r.label} direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <Typography sx={{ width: 240 }} color="text.secondary">{r.label}</Typography>
              <Typography>{String(r.value ?? '')}</Typography>
            </Stack>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
};

export default Settings;