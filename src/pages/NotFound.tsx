import React from 'react';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NotFound: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
      <Paper sx={{ p: 4 }}>
        <Stack spacing={2}>
          <Typography variant="h4">404 - {t('error.pageNotFound')}</Typography>
          <Typography variant="body2" color="text.secondary">{t('error.pageNotFoundDescription')}</Typography>
          <Button variant="contained" onClick={() => navigate('/')}>{t('error.goHome')}</Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default NotFound;
