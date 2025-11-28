import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  Grid,
  Stack,
  IconButton,
  Alert,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { abTestService } from '@/services/cv-sharing/abTestService';
import { CreateAbTestRequest } from '@/types/cv-sharing/ab-test';
import PageContainer from '@/components/ui/PageContainer';
import { useKeycloak } from '@/hooks/useKeycloak';
import { useTranslation } from 'react-i18next';

const AbTestForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { hasAnyRole } = useKeycloak();
  const canEdit = hasAnyRole(['HUMAN_RESOURCES', 'SYSTEM_ADMIN']);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<CreateAbTestRequest>({
    testName: '',
    description: '',
    variants: {
      baseline: { weight: 0.5, model: null },
      ranker: { weight: 0.3, model: 'v1.0.0' },
    },
    trafficSplit: {
      baseline: 0.5,
      ranker: 0.3,
      ranker_reranker: 0.2,
    },
    metrics: ['click_through_rate', 'application_rate'],
    startDate: '',
    endDate: '',
  });

  const createMutation = useMutation({
    mutationFn: (request: CreateAbTestRequest) => abTestService.createAbTest(request),
    onSuccess: () => {
      enqueueSnackbar(t('abTest.abTestCreated'), { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['abTests'] });
      navigate('/cv-sharing/ab-tests');
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || t('abTest.failedToCreate'), {
        variant: 'error',
      });
    },
  });

  const handleSubmit = () => {
    if (!formData.testName || !formData.variants || !formData.trafficSplit) {
      enqueueSnackbar(t('model.pleaseFillAllRequiredFields'), { variant: 'warning' });
      return;
    }

    // Validate traffic split sums to 1.0
    const total = Object.values(formData.trafficSplit).reduce((sum, val) => sum + val, 0);
    if (Math.abs(total - 1.0) > 0.01) {
      enqueueSnackbar(t('abTest.trafficSplitMustSum'), { variant: 'error' });
      return;
    }

    if (!canEdit) {
      enqueueSnackbar(t('matching.permissionDenied'), { variant: 'error' });
      return;
    }

    createMutation.mutate(formData);
  };

  return (
    <PageContainer>
      <Box>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <IconButton onClick={() => navigate('/cv-sharing/ab-tests')}>
            <BackIcon />
          </IconButton>
          <Typography variant="h4">{t('abTest.createAbTest')}</Typography>
        </Stack>

        <Card>
          <CardContent>
            <Stack spacing={3}>
              <Alert severity="info">
                {t('abTest.configureAbTest')}
              </Alert>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label={t('abTest.testName')}
                    value={formData.testName}
                    onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label={t('abTest.description')}
                    multiline
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label={t('abTest.variantsJson')}
                    multiline
                    rows={6}
                    value={JSON.stringify(formData.variants, null, 2)}
                    onChange={(e) => {
                      try {
                        const variants = JSON.parse(e.target.value);
                        setFormData({ ...formData, variants });
                      } catch (err) {
                        // Invalid JSON, keep old value
                      }
                    }}
                    fullWidth
                    helperText={t('abTest.defineVariants')}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label={t('abTest.trafficSplitJson')}
                    multiline
                    rows={4}
                    value={JSON.stringify(formData.trafficSplit, null, 2)}
                    onChange={(e) => {
                      try {
                        const trafficSplit = JSON.parse(e.target.value);
                        setFormData({ ...formData, trafficSplit });
                      } catch (err) {
                        // Invalid JSON, keep old value
                      }
                    }}
                    fullWidth
                    helperText={t('abTest.trafficPercentages')}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label={t('abTest.startDateOptional')}
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label={t('abTest.endDateOptional')}
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || !formData.testName}
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                  {createMutation.isPending ? t('abTest.creating') : t('abTest.createTest')}
                </Button>
                <Button variant="outlined" onClick={() => navigate('/cv-sharing/ab-tests')} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                  {t('common.cancel')}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </PageContainer>
  );
};

export default AbTestForm;

