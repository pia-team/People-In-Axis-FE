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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
import { modelRegistryService } from '@/services/cv-sharing/modelRegistryService';
import { CreateModelRequest } from '@/types/cv-sharing/model';
import PageContainer from '@/components/ui/PageContainer';
import { useKeycloak } from '@/hooks/useKeycloak';

const ModelRegistryForm: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { hasAnyRole } = useKeycloak();
  const canEdit = hasAnyRole(['HUMAN_RESOURCES', 'SYSTEM_ADMIN']);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<CreateModelRequest>({
    version: '',
    modelType: 'LAMBDA_MART',
    modelPath: '',
    notes: '',
  });

  const createMutation = useMutation({
    mutationFn: (request: CreateModelRequest) => modelRegistryService.registerModel(request),
    onSuccess: () => {
      enqueueSnackbar('Model registered successfully', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['models'] });
      navigate('/cv-sharing/models');
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || 'Failed to register model', {
        variant: 'error',
      });
    },
  });

  const handleSubmit = () => {
    if (!formData.version || !formData.modelPath) {
      enqueueSnackbar('Please fill in all required fields', { variant: 'warning' });
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
          <IconButton onClick={() => navigate('/cv-sharing/models')}>
            <BackIcon />
          </IconButton>
          <Typography variant="h4">Register Model</Typography>
        </Stack>

        <Card>
          <CardContent>
            <Stack spacing={3}>
              <Alert severity="info">
                Register a trained LambdaMART model. The model file should be accessible at the
                specified path.
              </Alert>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Version"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    placeholder="e.g., v1.0.0"
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Model Type</InputLabel>
                    <Select
                      value={formData.modelType}
                      label="Model Type"
                      onChange={(e) => setFormData({ ...formData, modelType: e.target.value })}
                    >
                      <MenuItem value="LAMBDA_MART">LambdaMART</MenuItem>
                      <MenuItem value="XGBOOST">XGBoost</MenuItem>
                      <MenuItem value="LIGHTGBM">LightGBM</MenuItem>
                      <MenuItem value="NEURAL_RANKER">Neural Ranker</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Model Path"
                    value={formData.modelPath}
                    onChange={(e) => setFormData({ ...formData, modelPath: e.target.value })}
                    placeholder="e.g., s3://bucket/models/v1.0.0/model.pkl"
                    required
                    fullWidth
                    helperText="Path to the model file (S3, local filesystem, etc.)"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Notes (Optional)"
                    multiline
                    rows={4}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    fullWidth
                  />
                </Grid>
              </Grid>

              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || !formData.version || !formData.modelPath}
                >
                  {createMutation.isPending ? 'Registering...' : 'Register Model'}
                </Button>
                <Button variant="outlined" onClick={() => navigate('/cv-sharing/models')}>
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

export default ModelRegistryForm;
