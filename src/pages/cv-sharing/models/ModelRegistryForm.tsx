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
import { useTranslation } from 'react-i18next';

const ModelRegistryForm: React.FC = () => {
  const { t } = useTranslation();
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
      enqueueSnackbar(t('model.modelRegistered'), { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['models'] });
      navigate('/cv-sharing/models');
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || t('model.failedToRegisterModel'), {
        variant: 'error',
      });
    },
  });

  const handleSubmit = () => {
    if (!formData.version || !formData.modelPath) {
      enqueueSnackbar(t('model.pleaseFillAllRequiredFields'), { variant: 'warning' });
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
          <IconButton onClick={() => navigate('/cv-sharing/models')}>
            <BackIcon />
          </IconButton>
          <Typography variant="h4">{t('model.registerModel')}</Typography>
        </Stack>

        <Card>
          <CardContent>
            <Stack spacing={3}>
              <Alert severity="info">
                {t('model.registerModelInfo')}
              </Alert>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label={t('model.version')}
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    placeholder={t('model.versionPlaceholder')}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>{t('model.modelType')}</InputLabel>
                    <Select
                      value={formData.modelType}
                      label={t('model.modelType')}
                      onChange={(e) => setFormData({ ...formData, modelType: e.target.value })}
                    >
                      <MenuItem value="LAMBDA_MART">{t('model.lambdaMart')}</MenuItem>
                      <MenuItem value="XGBOOST">{t('model.xgboost')}</MenuItem>
                      <MenuItem value="LIGHTGBM">{t('model.lightgbm')}</MenuItem>
                      <MenuItem value="NEURAL_RANKER">{t('model.neuralRanker')}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label={t('model.modelPath')}
                    value={formData.modelPath}
                    onChange={(e) => setFormData({ ...formData, modelPath: e.target.value })}
                    placeholder={t('model.modelPathPlaceholder')}
                    required
                    fullWidth
                    helperText={t('model.modelPathHelper')}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label={t('model.notesOptional')}
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
                  {createMutation.isPending ? t('model.registering') : t('model.registerModel')}
                </Button>
                <Button variant="outlined" onClick={() => navigate('/cv-sharing/models')}>
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

export default ModelRegistryForm;
