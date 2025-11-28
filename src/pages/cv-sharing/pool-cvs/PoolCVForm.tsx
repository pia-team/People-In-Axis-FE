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
import { useQueryClient } from '@tanstack/react-query';
import FileUpload from '@/components/ui/FileUpload';
import { poolCVService } from '@/services/cv-sharing';
import { CreatePoolCVRequest, PoolCVDetail, LanguageProficiency } from '@/types/cv-sharing';
import { isValidTCKN } from '@/utils/tckn';
import { useTranslation } from 'react-i18next';

type FormData = CreatePoolCVRequest & { isActive?: boolean };

const PoolCVForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [skills, setSkills] = useState<{ name: string; yearsOfExperience?: number }[]>([]);
  const [languages, setLanguages] = useState<{ code: string; proficiencyLevel: LanguageProficiency }[]>([]);
  const [hasKvkkConsent, setHasKvkkConsent] = useState(false);

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
      const hasConsent = !!data.kvkkConsentId;
      setHasKvkkConsent(hasConsent);
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
        kvkkConsent: hasConsent,
        isActive: data.isActive
      } as any);
      setSkills((data.skills || []).map(s => ({ name: s.name, yearsOfExperience: s.yearsOfExperience })));
      setLanguages((data.languages || []).map(l => ({ code: l.code, proficiencyLevel: l.proficiencyLevel })));
    } catch (e) {
      enqueueSnackbar(t('error.loadFailed', { item: t('poolCV.title').toLowerCase() }), { variant: 'error' });
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
        // Include all fields including kvkkConsent (backend will handle it appropriately)
        await poolCVService.updatePoolCV(id, {
          ...payload,
          isActive: data.isActive
        });
      } else {
        const created = await poolCVService.createPoolCV(payload);
        poolCvId = created.id;
      }

      if (poolCvId && files.length > 0) {
        await poolCVService.uploadFiles(poolCvId, files);
        // Invalidate cache to refresh files list
        await queryClient.invalidateQueries({ queryKey: ['poolCV', poolCvId] });
      }

      // Invalidate cache to ensure updated data is shown
      await queryClient.invalidateQueries({ queryKey: ['poolCV', poolCvId || id] });
      await queryClient.invalidateQueries({ queryKey: ['poolCVs'] });

      enqueueSnackbar(id ? t('poolCV.poolCVUpdated') : t('poolCV.poolCVCreated'), { variant: 'success' });
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
        enqueueSnackbar(t('poolCV.alreadySubmitted'), { variant: 'info' });
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
        let msg = resp?.message || e.message || t('error.saveFailed');
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
          {id ? t('poolCV.editPoolCV') : t('poolCV.addCVToTalentPool')}
        </Typography>

        <form onSubmit={handleSubmit(onSubmit, (errors) => {
          // Show validation errors
          const errorMessages = Object.keys(errors).map(key => {
            const error = errors[key as keyof typeof errors];
            return error?.message || `${key} is invalid`;
          });
          if (errorMessages.length > 0) {
            enqueueSnackbar(t('validation.formErrors', { errors: errorMessages.join(', ') }), { variant: 'error' });
          }
        })}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6">{t('application.personalInformation')}</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="firstName"
                control={control}
                rules={{ required: t('validation.required') }}
                render={({ field }) => (
                  <TextField {...field} label={t('poolCV.firstName')} fullWidth error={!!errors.firstName} helperText={errors.firstName?.message} />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="lastName"
                control={control}
                rules={{ required: t('validation.required') }}
                render={({ field }) => (
                  <TextField {...field} label={t('poolCV.lastName')} fullWidth error={!!errors.lastName} helperText={errors.lastName?.message} />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="email"
                control={control}
                rules={{ required: t('validation.required') }}
                render={({ field }) => (
                  <TextField {...field} label={t('poolCV.email')} type="email" fullWidth error={!!errors.email} helperText={errors.email?.message} />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label={t('poolCV.phone')} fullWidth />
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
                    message: t('validation.tcknMustBe11Digits')
                  },
                  validate: (v) => !v || v.length === 0 || isValidTCKN(v) || t('validation.invalidTCKN')
                }}
                render={({ field }) => (
                  <TextField {...field} label={t('poolCV.tckn')} fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="birthDate"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label={t('poolCV.birthDate')} type="date" InputLabelProps={{ shrink: true }} fullWidth />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label={t('poolCV.address')} fullWidth multiline rows={2} />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6">{t('application.professionalDetails')}</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="experienceYears"
                control={control}
                render={({ field }) => (
                  <TextField {...field} type="number" label={t('poolCV.experienceYears')} fullWidth InputProps={{ inputProps: { min: 0 } }} />
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Controller
                name="currentPosition"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label={t('poolCV.currentPosition')} fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Controller
                name="currentCompany"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label={t('poolCV.currentCompany')} fullWidth />
                )}
              />
            </Grid>

            {/* Skills */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>{t('poolCV.skills')}</Typography>
              <Button size="small" startIcon={<AddIcon />} onClick={addSkill}>{t('poolCV.addSkill')}</Button>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {skills.map((s, i) => (
                  <Grid item xs={12} md={6} key={i}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        fullWidth
                        label={t('poolCV.skillName')}
                        value={s.name}
                        onChange={(e) => updateSkill(i, 'name', e.target.value)}
                      />
                      <TextField
                        label={t('common.years')}
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
              <Typography variant="subtitle1" gutterBottom>{t('poolCV.languages')}</Typography>
              <Button size="small" startIcon={<AddIcon />} onClick={addLanguage}>{t('poolCV.addLanguage')}</Button>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {languages.map((l, i) => (
                  <Grid item xs={12} md={6} key={i}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        fullWidth
                        label={t('poolCV.languageCode')}
                        value={l.code}
                        onChange={(e) => updateLanguage(i, 'code', e.target.value)}
                      />
                      <TextField
                        label={t('poolCV.proficiency')}
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
                    <Typography variant="subtitle1" gutterBottom>{t('poolCV.tags')}</Typography>
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
                      <TextField size="small" placeholder={t('poolCV.addTag')} onKeyDown={(e) => {
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
              <Typography variant="h6" gutterBottom>{t('poolCV.files')}</Typography>
              <FileUpload onFilesChange={setFiles} value={files} />
            </Grid>

            {/* Consent and Active */}
            <Grid item xs={12}>
              <Controller
                name="kvkkConsent"
                control={control}
                rules={!id ? { required: 'KVKK consent is required' } : {}}
                render={({ field }) => (
                  <FormControl error={!!errors.kvkkConsent}>
                    <FormControlLabel 
                      control={
                        <Checkbox 
                          {...field} 
                          checked={!!field.value} 
                          disabled={!!(id && hasKvkkConsent)}
                        />
                      } 
                      label={
                        id && hasKvkkConsent 
                          ? "KVKK consent has been given (cannot be changed)" 
                          : "I consent to the processing of my personal data (KVKK)"
                      } 
                    />
                    {errors.kvkkConsent && (
                      <FormHelperText>{errors.kvkkConsent.message as any}</FormHelperText>
                    )}
                    {id && hasKvkkConsent && (
                      <FormHelperText>
                        KVKK consent was provided when this CV was created and cannot be modified.
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
              />
              {id && (
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel 
                      control={<Checkbox {...field} checked={!!field.value} />} 
                      label={t('poolCV.active')} 
                      sx={{ mt: 1 }}
                    />
                  )}
                />
              )}
            </Grid>

            {/* Actions */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'flex-end', gap: 2 }}>
                <Button variant="outlined" startIcon={<CancelIcon />} onClick={() => navigate('/cv-sharing/pool-cvs')} disabled={loading} sx={{ width: { xs: '100%', sm: 'auto' } }}>{t('common.cancel')}</Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  startIcon={<SaveIcon />}
                  sx={{ width: { xs: '100%', sm: 'auto' } }} 
                  disabled={loading}
                  onClick={(e) => {
                    // Ensure form validation runs
                    if (!e.isDefaultPrevented()) {
                      // Let the form handle submit normally
                    }
                  }}
                >
                  {id ? t('common.save') : t('poolCV.createPoolCV')}
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
