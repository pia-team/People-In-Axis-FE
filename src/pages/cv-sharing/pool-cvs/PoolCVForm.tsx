import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Divider,
  Chip,
  IconButton,
  FormControlLabel,
  Checkbox,
  FormControl,
  FormHelperText
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import FileUpload from '@/components/ui/FileUpload';
import { poolCVService } from '@/services/cv-sharing';
import { CreatePoolCVRequest, PoolCVDetail, LanguageProficiency } from '@/types/cv-sharing';
import { isValidTCKN } from '@/utils/tckn';

type FormData = CreatePoolCVRequest & { isActive?: boolean };

const PoolCVForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [skills, setSkills] = useState<{ name: string; yearsOfExperience?: number }[]>([]);
  const [languages, setLanguages] = useState<{ code: string; proficiencyLevel: LanguageProficiency }[]>([]);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      tckn: '',
      birthDate: '',
      address: '',
      experienceYears: undefined,
      currentPosition: '',
      currentCompany: '',
      kvkkConsent: false,
      skills: [],
      languages: [],
      tags: []
    }
  });

  useEffect(() => {
    if (id) {
      loadPoolCV();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadPoolCV = async () => {
    try {
      setLoading(true);
      const data: PoolCVDetail = await poolCVService.getPoolCVById(id!);
      reset({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || '',
        tckn: data.tckn || '',
        birthDate: data.birthDate || '',
        address: data.address || '',
        experienceYears: data.experienceYears,
        currentPosition: data.currentPosition || '',
        currentCompany: data.currentCompany || '',
        skills: data.skills as any,
        languages: data.languages as any,
        tags: data.tags || [],
        kvkkConsent: true,
        isActive: data.isActive
      } as any);
      setSkills((data.skills || []).map(s => ({ name: s.name, yearsOfExperience: s.yearsOfExperience })));
      setLanguages((data.languages || []).map(l => ({ code: l.code, proficiencyLevel: l.proficiencyLevel })));
    } catch (e) {
      enqueueSnackbar('Failed to load CV', { variant: 'error' });
      navigate('/cv-sharing/pool-cvs');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (loading) return;
      setLoading(true);
      const payload: CreatePoolCVRequest = {
        ...data,
        tckn: data.tckn?.trim() ? data.tckn.trim() : undefined,
        birthDate: data.birthDate?.trim() ? data.birthDate.trim() : undefined,
        email: data.email?.trim(),
        phone: data.phone?.trim() ? data.phone.trim() : undefined,
        address: data.address?.trim() ? data.address.trim() : undefined,
        experienceYears:
          (data as any).experienceYears === '' || (data as any).experienceYears === undefined || (data as any).experienceYears === null
            ? undefined
            : Number((data as any).experienceYears),
        currentPosition: data.currentPosition?.trim() ? data.currentPosition.trim() : undefined,
        currentCompany: data.currentCompany?.trim() ? data.currentCompany.trim() : undefined,
        skills: skills.map(s => ({ name: s.name, yearsOfExperience: s.yearsOfExperience })),
        languages: languages.map(l => ({ code: l.code, proficiencyLevel: l.proficiencyLevel })),
      } as any;

      let poolCvId = id;
      if (id) {
        const { kvkkConsent, ...updateData } = payload;
        await poolCVService.updatePoolCV(id, {
          ...updateData,
          isActive: data.isActive
        });
      } else {
        const created = await poolCVService.createPoolCV(payload);
        poolCvId = created.id;
      }

      if (poolCvId && files.length > 0) {
        await poolCVService.uploadFiles(poolCvId, files);
      }

      enqueueSnackbar(`CV ${id ? 'updated' : 'created'} successfully`, { variant: 'success' });
      const targetId = poolCvId || id;
      if (targetId) {
        navigate(`/cv-sharing/pool-cvs/${targetId}`);
      } else {
        navigate('/cv-sharing/pool-cvs');
      }
    } catch (e: any) {
      const status = e?.response?.status;
      const headers = e?.response?.headers || {};
      const ideReject = headers['x-idempotency-reject'] === 'true' || headers['X-Idempotency-Reject'] === 'true';
      if (status === 409 && ideReject) {
        enqueueSnackbar('Already submitted recently. Using the previous result.', { variant: 'info' });
        try {
          const my = await poolCVService.getMyPoolCVs(0, 20);
          const found = (my?.content || []).find((p: any) => p?.email === data.email);
          if (found?.id) {
            navigate(`/cv-sharing/pool-cvs/${found.id}`);
          } else {
            navigate('/cv-sharing/pool-cvs');
          }
        } catch (_) {
          navigate('/cv-sharing/pool-cvs');
        }
      } else {
        const resp = e?.response?.data;
        let msg = resp?.message || e.message || 'Failed to save CV';
        if (resp?.errors && Array.isArray(resp.errors) && resp.errors.length > 0) {
          msg = resp.errors.map((er: any) => er?.message || `${er?.field ?? 'field'} is invalid`).join(', ');
        }
        enqueueSnackbar(msg, { variant: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => setSkills(prev => [...prev, { name: '' }]);
  const removeSkill = (index: number) => setSkills(prev => prev.filter((_, i) => i !== index));
  const updateSkill = (index: number, field: 'name' | 'yearsOfExperience', value: string) => {
    const next = [...skills];
    (next[index] as any)[field] = field === 'yearsOfExperience' ? Number(value) : value;
    setSkills(next);
  };

  const addLanguage = () => setLanguages(prev => [...prev, { code: '', proficiencyLevel: LanguageProficiency.B1 }]);
  const removeLanguage = (index: number) => setLanguages(prev => prev.filter((_, i) => i !== index));
  const updateLanguage = (index: number, field: 'code' | 'proficiencyLevel', value: string) => {
    const next = [...languages];
    (next[index] as any)[field] = value as any;
    setLanguages(next);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {id ? 'Edit Pool CV' : 'Add CV to Talent Pool'}
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6">Personal Information</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="firstName"
                control={control}
                rules={{ required: 'First name is required' }}
                render={({ field }) => (
                  <TextField {...field} label="First Name" fullWidth error={!!errors.firstName} helperText={errors.firstName?.message} />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="lastName"
                control={control}
                rules={{ required: 'Last name is required' }}
                render={({ field }) => (
                  <TextField {...field} label="Last Name" fullWidth error={!!errors.lastName} helperText={errors.lastName?.message} />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="email"
                control={control}
                rules={{ required: 'Email is required' }}
                render={({ field }) => (
                  <TextField {...field} label="Email" type="email" fullWidth error={!!errors.email} helperText={errors.email?.message} />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Phone" fullWidth />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="tckn"
                control={control}
                rules={{
                  pattern: {
                    value: /^\d{11}$/,
                    message: 'TCKN must be 11 digits'
                  },
                  validate: (v) => !v || v.length === 0 || isValidTCKN(v) || 'Invalid TCKN checksum'
                }}
                render={({ field }) => (
                  <TextField {...field} label="TCKN" fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="birthDate"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Birth Date" type="date" InputLabelProps={{ shrink: true }} fullWidth />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Address" fullWidth multiline rows={2} />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6">Professional</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="experienceYears"
                control={control}
                render={({ field }) => (
                  <TextField {...field} type="number" label="Experience (years)" fullWidth InputProps={{ inputProps: { min: 0 } }} />
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Controller
                name="currentPosition"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Current Position" fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Controller
                name="currentCompany"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Current Company" fullWidth />
                )}
              />
            </Grid>

            {/* Skills */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>Skills</Typography>
              <Button size="small" startIcon={<AddIcon />} onClick={addSkill}>Add Skill</Button>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {skills.map((s, i) => (
                  <Grid item xs={12} md={6} key={i}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        fullWidth
                        label="Skill Name"
                        value={s.name}
                        onChange={(e) => updateSkill(i, 'name', e.target.value)}
                      />
                      <TextField
                        label="Years"
                        type="number"
                        value={s.yearsOfExperience || ''}
                        onChange={(e) => updateSkill(i, 'yearsOfExperience', e.target.value)}
                        sx={{ width: 120 }}
                        InputProps={{ inputProps: { min: 0 } }}
                      />
                      <IconButton onClick={() => removeSkill(i)}><DeleteIcon /></IconButton>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Languages */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>Languages</Typography>
              <Button size="small" startIcon={<AddIcon />} onClick={addLanguage}>Add Language</Button>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {languages.map((l, i) => (
                  <Grid item xs={12} md={6} key={i}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        fullWidth
                        label="Language Code (e.g., en, tr)"
                        value={l.code}
                        onChange={(e) => updateLanguage(i, 'code', e.target.value)}
                      />
                      <TextField
                        label="Proficiency (A1..C2/NATIVE)"
                        value={l.proficiencyLevel}
                        onChange={(e) => updateLanguage(i, 'proficiencyLevel', e.target.value)}
                        sx={{ width: 200 }}
                      />
                      <IconButton onClick={() => removeLanguage(i)}><DeleteIcon /></IconButton>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Tags */}
            <Grid item xs={12}>
              <Controller
                name="tags"
                control={control}
                render={({ field }) => (
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>Tags</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {(field.value || []).map((t: string, i: number) => (
                        <Chip key={`${t}-${i}`} label={t} onDelete={() => {
                          const next = [...(field.value || [])];
                          next.splice(i, 1);
                          field.onChange(next);
                        }} />
                      ))}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <TextField size="small" placeholder="Add tag" onKeyDown={(e) => {
                        const input = e.target as HTMLInputElement;
                        if (e.key === 'Enter' && input.value.trim()) {
                          e.preventDefault();
                          field.onChange([...(field.value || []), input.value.trim()]);
                          input.value = '';
                        }
                      }} />
                    </Box>
                  </Box>
                )}
              />
            </Grid>

            {/* Files */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Files</Typography>
              <FileUpload onFilesChange={setFiles} value={files} />
            </Grid>

            {/* Consent and Active */}
            <Grid item xs={12}>
              {!id && (
                <Controller
                  name="kvkkConsent"
                  control={control}
                  rules={{ required: 'KVKK consent is required' }}
                  render={({ field }) => (
                    <FormControl error={!!errors.kvkkConsent}>
                      <FormControlLabel control={<Checkbox {...field} checked={!!field.value} />} label="I consent to the processing of my personal data (KVKK)" />
                      {errors.kvkkConsent && (
                        <FormHelperText>{errors.kvkkConsent.message as any}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              )}
              {id && (
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel control={<Checkbox {...field} checked={!!field.value} />} label="Active" />
                  )}
                />
              )}
            </Grid>

            {/* Actions */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button variant="outlined" startIcon={<CancelIcon />} onClick={() => navigate('/cv-sharing/pool-cvs')} disabled={loading}>Cancel</Button>
                <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={loading}>
                  {id ? 'Save Changes' : 'Create CV'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default PoolCVForm;
