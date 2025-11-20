import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  Typography,
  MenuItem,
  Chip,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Alert,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { positionService } from '@/services/cv-sharing';
import { WorkType, LanguageProficiency } from '@/types/cv-sharing';
import { useKeycloak } from '@/providers/KeycloakProvider';

interface PositionFormData {
  name: string;
  title: string;
  department: string;
  location: string;
  workType: WorkType;
  minExperience: number;
  educationLevel: string;
  description: string;
  requirements: string;
  visibility: 'PUBLIC' | 'INTERNAL';
  applicationDeadline: string;
  salaryRangeMin: number;
  salaryRangeMax: number;
  skills: string[];
  languages: { code: string; level: string }[];
}

const PositionForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const { hasRole } = useKeycloak();
  const isHR = hasRole('HUMAN_RESOURCES');
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [languages, setLanguages] = useState<{ code: string; level: string }[]>([]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<PositionFormData>({
    defaultValues: {
      name: '',
      title: '',
      department: '',
      location: '',
      workType: WorkType.ONSITE,
      minExperience: 0,
      educationLevel: '',
      description: '',
      requirements: '',
      visibility: 'PUBLIC',
      applicationDeadline: '',
      salaryRangeMin: 0,
      salaryRangeMax: 0,
      skills: [],
      languages: []
    }
  });

  useEffect(() => {
    if (id) {
      loadPosition();
    } else if (location.state?.duplicateFrom) {
      // Load position data for duplication (create mode)
      loadPositionForDuplicate(location.state.duplicateFrom);
    }
  }, [id, location.state]);

  const loadPosition = async () => {
    try {
      setLoading(true);
      const position = await positionService.getPositionById(id!);
      reset({
        name: position.name,
        title: position.title,
        department: position.department || '',
        location: position.location || '',
        workType: position.workType,
        minExperience: position.minExperience || 0,
        educationLevel: position.educationLevel || '',
        description: position.description || '',
        requirements: position.requirements || '',
        visibility: (position.visibility as any) || 'PUBLIC',
        applicationDeadline: position.applicationDeadline || '',
        salaryRangeMin: position.salaryRangeMin || 0,
        salaryRangeMax: position.salaryRangeMax || 0,
        skills: [],
        languages: []
      });
      setSkills((position.skills || []).map((s: any) => s.name || s.skillName || ''));
      setLanguages((position.languages || []).map((l: any) => ({ code: l.code, level: l.proficiencyLevel })));
    } catch (error) {
      enqueueSnackbar('Failed to load position', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadPositionForDuplicate = async (positionId: string) => {
    try {
      setLoading(true);
      const position = await positionService.getPositionById(positionId);
      reset({
        name: (position.name || '') + ' (Copy)',
        title: (position.title || '') + ' (Copy)',
        department: position.department || '',
        location: position.location || '',
        workType: position.workType,
        minExperience: position.minExperience || 0,
        educationLevel: position.educationLevel || '',
        description: position.description || '',
        requirements: position.requirements || '',
        visibility: (position.visibility as any) || 'PUBLIC',
        applicationDeadline: position.applicationDeadline || '',
        salaryRangeMin: position.salaryRangeMin || 0,
        salaryRangeMax: position.salaryRangeMax || 0,
        skills: [],
        languages: []
      });
      setSkills((position.skills || []).map((s: any) => s.name || s.skillName || ''));
      setLanguages((position.languages || []).map((l: any) => ({ code: l.code, level: l.proficiencyLevel })));
    } catch (error) {
      enqueueSnackbar('Failed to load position for duplication', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const { mutate: savePosition, isPending: isSaving } = useMutation({
    mutationFn: (positionData: any) => 
      id 
        ? positionService.updatePosition(id, positionData) 
        : positionService.createPosition(positionData),
    onSuccess: (data: any) => {
      enqueueSnackbar(`Position ${id ? 'updated' : 'created'} successfully`, { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      if (id) {
        queryClient.invalidateQueries({ queryKey: ['position', id] });
      }
      navigate(`/cv-sharing/positions/${data.id}`);
    },
    onError: () => {
      enqueueSnackbar('Failed to save position', { variant: 'error' });
    }
  });

  const onSubmit = (data: PositionFormData) => {
    if (!isHR) {
      enqueueSnackbar('Yalnızca İnsan Kaynakları kaydedebilir', { variant: 'warning' });
      return;
    }
    const positionData = {
      ...data,
      skills: skills.map((skillName) => ({ skillName, isRequired: true })),
      languages: languages.map((l) => ({ languageCode: l.code, proficiencyLevel: l.level as LanguageProficiency }))
    };
    savePosition(positionData);
  };

  const addSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };


  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {id ? 'Edit Position' : 'Create New Position'}
        </Typography>
        {!isHR && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Bu ekran yalnızca görüntüleme içindir. Pozisyon {id ? 'düzenlemek' : 'oluşturmak'} için İnsan Kaynakları rolü gerekir.
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <fieldset disabled={!isHR || isSaving || loading} style={{ border: 0, padding: 0, margin: 0 }}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Position name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Position Name"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="title"
                control={control}
                rules={{ required: 'Position title is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Position Title"
                    error={!!errors.title}
                    helperText={errors.title?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="department"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Department"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="location"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Location"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="workType"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Work Type</InputLabel>
                    <Select {...field} label="Work Type">
                      <MenuItem value={WorkType.ONSITE}>Onsite</MenuItem>
                      <MenuItem value={WorkType.REMOTE}>Remote</MenuItem>
                      <MenuItem value={WorkType.HYBRID}>Hybrid</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            {/* Requirements */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Requirements
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="minExperience"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label="Minimum Experience (years)"
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="educationLevel"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Education Level"
                  />
                )}
              />
            </Grid>

            {/* Skills */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Required Skills
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add skill"
                  size="small"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={addSkill}
                  startIcon={<AddIcon />}
                >
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {skills.map((skill) => (
                  <Chip
                    key={skill}
                    label={skill}
                    onDelete={() => removeSkill(skill)}
                  />
                ))}
              </Box>
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={4}
                    label="Description"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="requirements"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={4}
                    label="Requirements"
                  />
                )}
              />
            </Grid>

            {/* Settings */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Settings
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="visibility"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Visibility</InputLabel>
                    <Select {...field} label="Visibility">
                      <MenuItem value={'PUBLIC'}>Public</MenuItem>
                      <MenuItem value={'INTERNAL'}>Internal</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="applicationDeadline"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="datetime-local"
                    label="Application Deadline"
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Grid>

            {/* Salary Range */}
            <Grid item xs={12} md={2}>
              <Controller
                name="salaryRangeMin"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label="Min Salary"
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <Controller
                name="salaryRangeMax"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label="Max Salary"
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                )}
              />
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={() => navigate('/cv-sharing/positions')}
                  disabled={isSaving || loading}
                >
                  Cancel
                </Button>
                <Tooltip title={isHR ? '' : 'Yalnızca İnsan Kaynakları kaydedebilir'}>
                  <span>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<SaveIcon />}
                      disabled={!isHR || isSaving || loading}
                    >
                      {id ? 'Update' : 'Create'} Position
                    </Button>
                  </span>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
          </fieldset>
        </form>
      </Paper>
    </Box>
  );
};

export default PositionForm;
