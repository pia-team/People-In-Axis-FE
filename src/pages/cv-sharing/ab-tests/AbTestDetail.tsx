import React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Chip,
  Divider,
  IconButton,
  Alert,
  LinearProgress,
  Paper,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  PlayArrow as StartIcon,
  Pause as PauseIcon,
  CheckCircle as CompleteIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { abTestService } from '@/services/cv-sharing/abTestService';
import { useKeycloak } from '@/hooks/useKeycloak';
import PageContainer from '@/components/ui/PageContainer';

const AbTestDetail: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { hasAnyRole } = useKeycloak();
  const canEdit = hasAnyRole(['HUMAN_RESOURCES', 'SYSTEM_ADMIN']);
  const queryClient = useQueryClient();

  const { data: test, isLoading } = useQuery({
    queryKey: ['abTest', id],
    queryFn: () => abTestService.getAbTest(Number(id!)),
    enabled: !!id,
  });

  const startMutation = useMutation({
    mutationFn: () => abTestService.startAbTest(Number(id!)),
    onSuccess: () => {
      enqueueSnackbar(t('abTest.abTestStartedShort'), { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['abTests'] });
      queryClient.invalidateQueries({ queryKey: ['abTest', id] });
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || t('abTest.failedToStart'), {
        variant: 'error',
      });
    },
  });

  const pauseMutation = useMutation({
    mutationFn: () => abTestService.pauseAbTest(Number(id!)),
    onSuccess: () => {
      enqueueSnackbar(t('abTest.abTestPausedShort'), { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['abTests'] });
      queryClient.invalidateQueries({ queryKey: ['abTest', id] });
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || t('abTest.failedToPause'), {
        variant: 'error',
      });
    },
  });

  const completeMutation = useMutation({
    mutationFn: () => abTestService.completeAbTest(Number(id!)),
    onSuccess: () => {
      enqueueSnackbar(t('abTest.abTestCompletedShort'), { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['abTests'] });
      queryClient.invalidateQueries({ queryKey: ['abTest', id] });
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || t('abTest.failedToComplete'), {
        variant: 'error',
      });
    },
  });

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'DRAFT':
        return 'default';
      case 'ACTIVE':
        return 'success';
      case 'PAUSED':
        return 'warning';
      case 'COMPLETED':
        return 'info';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <LinearProgress />
      </PageContainer>
    );
  }

  if (!test) {
    return (
      <PageContainer>
        <Alert severity="error">{t('abTest.abTestNotFound')}</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Box>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <IconButton onClick={() => navigate('/cv-sharing/ab-tests')}>
            <BackIcon />
          </IconButton>
          <Typography variant="h4">{test.testName}</Typography>
        </Stack>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Chip
                      label={test.status}
                      color={getStatusColor(test.status) as any}
                      size="small"
                    />
                  </Stack>

                  <Divider />

                  {test.description && (
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        {t('abTest.description')}
                      </Typography>
                      <Typography variant="body1">{test.description}</Typography>
                    </Box>
                  )}

                  <Grid container spacing={2}>
                    {test.startDate && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="textSecondary">
                          {t('abTest.startDate')}
                        </Typography>
                        <Typography variant="body1">
                          {new Date(test.startDate).toLocaleString()}
                        </Typography>
                      </Grid>
                    )}
                    {test.endDate && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="textSecondary">
                          {t('abTest.endDate')}
                        </Typography>
                        <Typography variant="body1">
                          {new Date(test.endDate).toLocaleString()}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>

                  {test.variants && (
                    <>
                      <Divider />
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          {t('abTest.variants')}
                        </Typography>
                        <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                          <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                            {JSON.stringify(test.variants, null, 2)}
                          </pre>
                        </Paper>
                      </Box>
                    </>
                  )}

                  {test.trafficSplit && (
                    <>
                      <Divider />
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          {t('abTest.trafficSplit')}
                        </Typography>
                        <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                          <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                            {JSON.stringify(test.trafficSplit, null, 2)}
                          </pre>
                        </Paper>
                      </Box>
                    </>
                  )}

                  {test.results && (
                    <>
                      <Divider />
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          {t('abTest.results')}
                        </Typography>
                        <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                          <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                            {JSON.stringify(test.results, null, 2)}
                          </pre>
                        </Paper>
                      </Box>
                    </>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {canEdit && (
              <Card>
                <CardContent>
                  <Stack direction="row" spacing={2}>
                    {test.status === 'DRAFT' && (
                      <Button
                        variant="contained"
                        startIcon={<StartIcon />}
                        onClick={() => {
                          if (!canEdit) return;
                          startMutation.mutate();
                        }}
                        disabled={!canEdit || startMutation.isPending}
                      >
                        {startMutation.isPending ? t('abTest.starting') : t('abTest.startTest')}
                      </Button>
                    )}
                    {test.status === 'ACTIVE' && (
                      <>
                        <Button
                          variant="outlined"
                          startIcon={<PauseIcon />}
                          onClick={() => {
                            if (!canEdit) return;
                            pauseMutation.mutate();
                          }}
                          disabled={pauseMutation.isPending}
                        >
                          {pauseMutation.isPending ? t('abTest.pausing') : t('abTest.pauseTest')}
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={<CompleteIcon />}
                          onClick={() => {
                            if (!canEdit) return;
                            completeMutation.mutate();
                          }}
                          disabled={!canEdit || completeMutation.isPending}
                        >
                          {completeMutation.isPending ? t('abTest.completing') : t('abTest.completeTest')}
                        </Button>
                      </>
                    )}
                    {test.status === 'PAUSED' && (
                      <>
                        <Button
                          variant="contained"
                          startIcon={<StartIcon />}
                          onClick={() => {
                            if (!canEdit) return;
                            startMutation.mutate();
                          }}
                          disabled={!canEdit || startMutation.isPending}
                        >
                          {startMutation.isPending ? t('abTest.starting') : t('abTest.resumeTest')}
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<CompleteIcon />}
                          onClick={() => {
                            if (!canEdit) return;
                            completeMutation.mutate();
                          }}
                          disabled={!canEdit || completeMutation.isPending}
                        >
                          {completeMutation.isPending ? t('abTest.completing') : t('abTest.completeTest')}
                        </Button>
                      </>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('abTest.quickActions')}
                </Typography>
                <Stack spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<BackIcon />}
                    onClick={() => navigate('/cv-sharing/ab-tests')}
                    fullWidth
                  >
                    {t('abTest.backToList')}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default AbTestDetail;

