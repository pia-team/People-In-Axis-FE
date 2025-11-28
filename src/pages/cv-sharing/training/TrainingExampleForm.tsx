import React, { useState, useEffect } from 'react';
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
  Autocomplete,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trainingService } from '@/services/cv-sharing/trainingService';
import { poolCVService } from '@/services/cv-sharing';
import { positionService } from '@/services/cv-sharing';
import { CreateTrainingExampleRequest } from '@/types/cv-sharing/training';
import { PoolCV, Position, PositionStatus } from '@/types/cv-sharing';
import { useKeycloak } from '@/hooks/useKeycloak';
import PageContainer from '@/components/ui/PageContainer';
import { useTranslation } from 'react-i18next';

const TrainingExampleForm: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { hasAnyRole } = useKeycloak();
  const canEdit = hasAnyRole(['HUMAN_RESOURCES', 'SYSTEM_ADMIN']);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<CreateTrainingExampleRequest>({
    poolCvId: '',
    positionId: '',
    relevanceLabel: 2,
    notes: '',
  });
  const [selectedPoolCV, setSelectedPoolCV] = useState<PoolCV | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);

  const { data: existingExample } = useQuery({
    queryKey: ['trainingExample', id],
    queryFn: () => trainingService.getTrainingExample(Number(id!)),
    enabled: !!id && id !== 'new',
  });

  const { data: poolCVs } = useQuery({
    queryKey: ['poolCVsForTraining'],
    queryFn: async () => {
      const response = await poolCVService.getPoolCVs({ active: true });
      return response.content || [];
    },
  });

  const { data: positions } = useQuery({
    queryKey: ['positionsForTraining'],
    queryFn: async () => {
      const response = await positionService.getPositions({ status: PositionStatus.ACTIVE });
      return response.content || [];
    },
  });

  useEffect(() => {
    if (existingExample) {
      setFormData({
        poolCvId: existingExample.poolCvId,
        positionId: existingExample.positionId,
        relevanceLabel: existingExample.relevanceLabel,
        notes: existingExample.notes || '',
      });
      if (poolCVs) {
        const poolCV = poolCVs.find((cv) => cv.id === existingExample.poolCvId);
        if (poolCV) setSelectedPoolCV(poolCV);
      }
      if (positions) {
        const position = positions.find((pos) => pos.id === existingExample.positionId);
        if (position) setSelectedPosition(position);
      }
    }
  }, [existingExample, poolCVs, positions]);

  const createMutation = useMutation({
    mutationFn: (request: CreateTrainingExampleRequest) =>
      trainingService.createTrainingExample(request),
    onSuccess: () => {
      enqueueSnackbar(t('training.trainingCreated'), { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['trainingExamples'] });
      navigate('/cv-sharing/training');
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || t('training.failedToCreate'), {
        variant: 'error',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (relevanceLabel: number) =>
      trainingService.updateTrainingExample(Number(id!), relevanceLabel),
    onSuccess: () => {
      enqueueSnackbar(t('training.trainingUpdated'), { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['trainingExamples'] });
      navigate('/cv-sharing/training');
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || t('training.failedToUpdate'), {
        variant: 'error',
      });
    },
  });

  const handleSubmit = () => {
    if (!formData.poolCvId || !formData.positionId) {
      enqueueSnackbar(t('training.pleaseSelectPoolCVAndPosition'), { variant: 'warning' });
      return;
    }

    if (!canEdit) {
      enqueueSnackbar(t('matching.permissionDenied'), { variant: 'error' });
      return;
    }

    if (id && id !== 'new') {
      updateMutation.mutate(formData.relevanceLabel);
    } else {
      createMutation.mutate(formData);
    }
  };

  const isEdit = id && id !== 'new';

  return (
    <PageContainer>
      <Box>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <IconButton onClick={() => navigate('/cv-sharing/training')}>
            <BackIcon />
          </IconButton>
          <Typography variant="h4">
            {isEdit ? t('training.editExample') : t('training.createTraining')}
          </Typography>
        </Stack>

        <Card>
          <CardContent>
            <Stack spacing={3}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    options={poolCVs || []}
                    getOptionLabel={(option) =>
                      `${option.firstName} ${option.lastName} (${option.email})`
                    }
                    value={selectedPoolCV}
                    onChange={(_, newValue) => {
                      setSelectedPoolCV(newValue);
                      setFormData({ ...formData, poolCvId: newValue?.id || '' });
                    }}
                    disabled={!!isEdit}
                    renderInput={(params) => (
                      <TextField {...params} label={t('training.poolCV')} required />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    options={positions || []}
                    getOptionLabel={(option) => option.title}
                    value={selectedPosition}
                    onChange={(_, newValue) => {
                      setSelectedPosition(newValue);
                      setFormData({ ...formData, positionId: newValue?.id || '' });
                    }}
                    disabled={!!isEdit}
                    renderInput={(params) => (
                      <TextField {...params} label={t('training.position')} required />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>{t('training.relevanceLabel')}</InputLabel>
                    <Select
                      value={formData.relevanceLabel}
                      label={t('training.relevanceLabel')}
                      onChange={(e) =>
                        setFormData({ ...formData, relevanceLabel: Number(e.target.value) as any })
                      }
                    >
                      <MenuItem value={0}>0 - {t('training.irrelevant')}</MenuItem>
                      <MenuItem value={1}>1 - {t('training.somewhatRelevant')}</MenuItem>
                      <MenuItem value={2}>2 - {t('training.relevant')}</MenuItem>
                      <MenuItem value={3}>3 - {t('training.highlyRelevant')}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label={t('training.notesOptional')}
                    multiline
                    rows={4}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    fullWidth
                  />
                </Grid>
              </Grid>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSubmit}
                  disabled={
                    createMutation.isPending ||
                    updateMutation.isPending ||
                    !formData.poolCvId ||
                    !formData.positionId
                  }
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                  {isEdit
                    ? updateMutation.isPending
                      ? t('training.updating')
                      : t('training.update')
                    : createMutation.isPending
                    ? t('training.creating')
                    : t('training.createTraining')}
                </Button>
                <Button variant="outlined" onClick={() => navigate('/cv-sharing/training')} sx={{ width: { xs: '100%', sm: 'auto' } }}>
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

export default TrainingExampleForm;

