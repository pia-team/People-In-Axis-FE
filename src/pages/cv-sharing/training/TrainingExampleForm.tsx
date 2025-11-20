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
  Alert,
  LinearProgress,
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
import { PoolCV } from '@/types/cv-sharing';
import { Position } from '@/types/cv-sharing';
import { useKeycloak } from '@/hooks/useKeycloak';
import PageContainer from '@/components/ui/PageContainer';

const TrainingExampleForm: React.FC = () => {
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
      const response = await positionService.getPositions({ status: 'ACTIVE' });
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
      enqueueSnackbar('Training example created successfully', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['trainingExamples'] });
      navigate('/cv-sharing/training');
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || 'Failed to create training example', {
        variant: 'error',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (relevanceLabel: number) =>
      trainingService.updateTrainingExample(Number(id!), relevanceLabel),
    onSuccess: () => {
      enqueueSnackbar('Training example updated successfully', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['trainingExamples'] });
      navigate('/cv-sharing/training');
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || 'Failed to update training example', {
        variant: 'error',
      });
    },
  });

  const handleSubmit = () => {
    if (!formData.poolCvId || !formData.positionId) {
      enqueueSnackbar('Please select both Pool CV and Position', { variant: 'warning' });
      return;
    }

    if (!canEdit) {
      enqueueSnackbar('You do not have permission to perform this action', { variant: 'error' });
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
            {isEdit ? 'Edit Training Example' : 'Create Training Example'}
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
                    disabled={isEdit}
                    renderInput={(params) => (
                      <TextField {...params} label="Pool CV" required />
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
                    disabled={isEdit}
                    renderInput={(params) => (
                      <TextField {...params} label="Position" required />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Relevance Label</InputLabel>
                    <Select
                      value={formData.relevanceLabel}
                      label="Relevance Label"
                      onChange={(e) =>
                        setFormData({ ...formData, relevanceLabel: Number(e.target.value) as any })
                      }
                    >
                      <MenuItem value={0}>0 - Irrelevant</MenuItem>
                      <MenuItem value={1}>1 - Somewhat Relevant</MenuItem>
                      <MenuItem value={2}>2 - Relevant</MenuItem>
                      <MenuItem value={3}>3 - Highly Relevant</MenuItem>
                    </Select>
                  </FormControl>
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
                  disabled={
                    createMutation.isPending ||
                    updateMutation.isPending ||
                    !formData.poolCvId ||
                    !formData.positionId
                  }
                >
                  {isEdit
                    ? updateMutation.isPending
                      ? 'Updating...'
                      : 'Update'
                    : createMutation.isPending
                    ? 'Creating...'
                    : 'Create'}
                </Button>
                <Button variant="outlined" onClick={() => navigate('/cv-sharing/training')}>
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

export default TrainingExampleForm;

