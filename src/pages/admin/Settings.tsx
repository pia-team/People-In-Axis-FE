import React from 'react';
import { Typography, Stack } from '@mui/material';
import PageContainer from '@/components/ui/PageContainer';
import SectionCard from '@/components/ui/SectionCard';

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
    <PageContainer title="Settings">
      <SectionCard>
        <Stack spacing={1}>
          <Typography variant="body2" color="text.secondary">Frontend environment configuration</Typography>
          {rows.map((r) => (
            <Stack key={r.label} direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <Typography sx={{ width: 240 }} color="text.secondary">{r.label}</Typography>
              <Typography>{String(r.value ?? '')}</Typography>
            </Stack>
          ))}
        </Stack>
      </SectionCard>
    </PageContainer>
  );
};

export default Settings;