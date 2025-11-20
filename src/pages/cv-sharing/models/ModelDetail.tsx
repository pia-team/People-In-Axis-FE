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
  CheckCircle as ActivateIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { modelRegistryService } from '@/services/cv-sharing/modelRegistryService';
import { useKeycloak } from '@/hooks/useKeycloak';
import PageContainer from '@/components/ui/PageContainer';

const ModelDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { hasAnyRole } = useKeycloak();
  const canEdit = hasAnyRole(['HUMAN_RESOURCES', 'SYSTEM_ADMIN']);
  const queryClient = useQueryClient();

  const { data: model, isLoading } = useQuery({
    queryKey: ['model', id],
    queryFn: () => modelRegistryService.getModel(Number(id!)),
    enabled: !!id,
  });

  const activateMutation = useMutation({
    mutationFn: () => modelRegistryService.activateModel(Number(id!)),
    onSuccess: () => {
      enqueueSnackbar('Model activated successfully', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['models'] });
      queryClient.invalidateQueries({ queryKey: ['activeModel'] });
      queryClient.invalidateQueries({ queryKey: ['model', id] });
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || 'Failed to activate model', {
        variant: 'error',
      });
    },
  });

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'TRAINING':
        return 'info';
      case 'DEPRECATED':
        return 'default';
      case 'FAILED':
        return 'error';
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

  if (!model) {
    return (
      <PageContainer>
        <Alert severity="error">Model not found</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Box>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <IconButton onClick={() => navigate('/cv-sharing/models')}>
            <BackIcon />
          </IconButton>
          <Typography variant="h4">Model: {model.version}</Typography>
        </Stack>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Chip
                      label={model.status}
                      color={getStatusColor(model.status) as any}
                      size="small"
                    />
                    {model.isActive && (
                      <Chip label="Active" color="success" size="small" icon={<ActivateIcon />} />
                    )}
                  </Stack>

                  <Divider />

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="textSecondary">
                        Version
                      </Typography>
                      <Typography variant="body1">{model.version}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="textSecondary">
                        Model Type
                      </Typography>
                      <Typography variant="body1">{model.modelType}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="textSecondary">
                        Model Path
                      </Typography>
                      <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                        {model.modelPath}
                      </Typography>
                    </Grid>
                    {model.trainingExamplesCount && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="textSecondary">
                          Training Examples
                        </Typography>
                        <Typography variant="body1">{model.trainingExamplesCount}</Typography>
                      </Grid>
                    )}
                    {model.trainingDateFrom && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="textSecondary">
                          Training Period
                        </Typography>
                        <Typography variant="body1">
                          {new Date(model.trainingDateFrom).toLocaleDateString()} -{' '}
                          {model.trainingDateTo
                            ? new Date(model.trainingDateTo).toLocaleDateString()
                            : 'Ongoing'}
                        </Typography>
                      </Grid>
                    )}
                    {model.activatedAt && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="textSecondary">
                          Activated At
                        </Typography>
                        <Typography variant="body1">
                          {new Date(model.activatedAt).toLocaleString()}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>

                  {model.metrics && (
                    <>
                      <Divider />
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Metrics
                        </Typography>
                        <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                          <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                            {JSON.stringify(model.metrics, null, 2)}
                          </pre>
                        </Paper>
                      </Box>
                    </>
                  )}

                  {model.notes && (
                    <>
                      <Divider />
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Notes
                        </Typography>
                        <Typography variant="body2">{model.notes}</Typography>
                      </Box>
                    </>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {canEdit && !model.isActive && model.status === 'ACTIVE' && (
              <Card>
                <CardContent>
                  <Button
                    variant="contained"
                    startIcon={<ActivateIcon />}
                    onClick={() => {
                      if (!canEdit) return;
                      if (window.confirm('Activate this model? Other models will be deactivated.')) {
                        activateMutation.mutate();
                      }
                    }}
                    disabled={activateMutation.isPending}
                  >
                    {activateMutation.isPending ? 'Activating...' : 'Activate Model'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Stack spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<BackIcon />}
                    onClick={() => navigate('/cv-sharing/models')}
                    fullWidth
                  >
                    Back to List
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

export default ModelDetail;

