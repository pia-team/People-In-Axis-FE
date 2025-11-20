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
  Paper,
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

const AbTestForm: React.FC = () => {
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
      enqueueSnackbar('A/B test created successfully', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['abTests'] });
      navigate('/cv-sharing/ab-tests');
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || 'Failed to create A/B test', {
        variant: 'error',
      });
    },
  });

  const handleSubmit = () => {
    if (!formData.testName || !formData.variants || !formData.trafficSplit) {
      enqueueSnackbar('Please fill in all required fields', { variant: 'warning' });
      return;
    }

    // Validate traffic split sums to 1.0
    const total = Object.values(formData.trafficSplit).reduce((sum, val) => sum + val, 0);
    if (Math.abs(total - 1.0) > 0.01) {
      enqueueSnackbar('Traffic split must sum to 1.0', { variant: 'error' });
      return;
    }

    if (!canEdit) {
      enqueueSnackbar('You do not have permission to perform this action', { variant: 'error' });
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
          <Typography variant="h4">Create A/B Test</Typography>
        </Stack>

        <Card>
          <CardContent>
            <Stack spacing={3}>
              <Alert severity="info">
                Configure an A/B test to compare different matching strategies. Define variants and
                traffic split percentages.
              </Alert>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Test Name"
                    value={formData.testName}
                    onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Description"
                    multiline
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Variants (JSON)"
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
                    helperText="Define test variants with their configurations"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Traffic Split (JSON)"
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
                    helperText="Traffic percentages for each variant (must sum to 1.0)"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Start Date (Optional)"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="End Date (Optional)"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>

              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || !formData.testName}
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Test'}
                </Button>
                <Button variant="outlined" onClick={() => navigate('/cv-sharing/ab-tests')}>
                  Cancel
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

