import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  Typography,
  Stepper,
  Step,
  StepLabel,
  FormControlLabel,
  Checkbox,
  Alert,
  Divider,
  Card,
  CardContent,
  IconButton,
  LinearProgress
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Send as SendIcon,
  ArrowBack as BackIcon,
  ArrowForward as NextIcon,
  AttachFile as FileIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { applicationService } from '@/services/cv-sharing';
import { positionService } from '@/services/cv-sharing';
import PoolCVSelector from '@/components/cv-sharing/PoolCVSelector';
import { Position, PoolCV, CreateApplicationRequest } from '@/types/cv-sharing';
import { isValidTCKN } from '@/utils/tckn';
import { useTranslation } from 'react-i18next';

interface ApplicationFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  tckn: string;
  birthDate: string;
  address: string;
  experienceYears: number;
  expectedSalary: number;
  availableStartDate: string;
  noticePeriodDays: number;
  coverLetter: string;
  kvkkConsent: boolean;
}

const getSteps = (t: (key: string) => string) => [
  t('application.personalInformation'),
  t('application.professionalDetails'),
  t('application.documentsAndConsent')
];

const ApplicationForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { positionId } = useParams<{ positionId: string }>();
  const { enqueueSnackbar } = useSnackbar();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const steps = getSteps(t);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [selectedPoolCV, setSelectedPoolCV] = useState<PoolCV | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    trigger,
    watch
  } = useForm<ApplicationFormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      tckn: '',
      birthDate: '',
      address: '',
      experienceYears: 0,
      expectedSalary: 0,
      availableStartDate: '',
      noticePeriodDays: 0,
      coverLetter: '',
      kvkkConsent: false
    }
  });

  const kvkkConsent = watch('kvkkConsent');

  useEffect(() => {
    if (positionId) {
      loadPosition();
    }
  }, [positionId]);

  const loadPosition = async () => {
    try {
      setLoading(true);
      const positionData = await positionService.getPositionById(positionId!);
      setPosition(positionData);
    } catch (error) {
      enqueueSnackbar(t('application.failedToLoadPosition'), { variant: 'error' });
      navigate('/positions');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    let fieldsToValidate: (keyof ApplicationFormData)[] = [];
    
    if (activeStep === 0) {
      fieldsToValidate = ['firstName', 'lastName', 'email', 'phone', 'tckn', 'birthDate', 'address'];
    } else if (activeStep === 1) {
      fieldsToValidate = ['experienceYears', 'expectedSalary', 'availableStartDate', 'noticePeriodDays'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files).filter(file => {
        const isValid = file.size <= 10 * 1024 * 1024; // 10MB per plan.md
        if (!isValid) {
          enqueueSnackbar(t('error.fileTooLarge'), { variant: 'error' });
        }
        return isValid;
      });
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ApplicationFormData) => {
    if (!kvkkConsent) {
      enqueueSnackbar(t('application.kvkkConsentRequired'), { variant: 'error' });
      return;
    }

    if (uploadedFiles.length === 0) {
      enqueueSnackbar(t('application.uploadAtLeastOneDocument'), { variant: 'error' });
      return;
    }

    try {
      setSubmitting(true);
      // Create application first, then upload files
      const createPayload: CreateApplicationRequest = {
        positionId: positionId!,
        poolCvId: selectedPoolCV?.id,
        firstName: data.firstName,
        lastName: data.lastName,
        tckn: data.tckn,
        birthDate: data.birthDate,
        email: data.email,
        phone: data.phone,
        address: data.address,
        experienceYears: data.experienceYears,
        expectedSalary: data.expectedSalary,
        availableStartDate: data.availableStartDate,
        noticePeriodDays: data.noticePeriodDays,
        coverLetter: data.coverLetter,
        kvkkConsent: data.kvkkConsent
      };

      const created = await applicationService.createApplication(createPayload);
      if (uploadedFiles.length > 0) {
        await applicationService.uploadFiles(created.id, uploadedFiles);
      }
      enqueueSnackbar(t('application.applicationCreated'), { variant: 'success' });
      navigate(`/cv-sharing/applications/${created.id}`);
    } catch (error: any) {
      enqueueSnackbar(error.message || t('error.createFailed'), { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {position && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Applying for: {position.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {position.department} • {position.location} • {position.workType}
            </Typography>
          </CardContent>
        </Card>
      )}

      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {t('application.createApplication')}
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <form onSubmit={handleSubmit(onSubmit)}>
          {activeStep === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {t('application.personalInformation')}
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="firstName"
                  control={control}
                  rules={{ required: t('validation.required') }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t('application.firstName')}
                      error={!!errors.firstName}
                      helperText={errors.firstName?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="lastName"
                  control={control}
                  rules={{ required: t('validation.required') }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t('application.lastName')}
                      error={!!errors.lastName}
                      helperText={errors.lastName?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="email"
                  control={control}
                  rules={{
                    required: t('validation.required'),
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: t('validation.invalidEmail')
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t('application.email')}
                      type="email"
                      error={!!errors.email}
                      helperText={errors.email?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="phone"
                  control={control}
                  rules={{ required: t('validation.required') }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t('application.phone')}
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="tckn"
                  control={control}
                  rules={{
                    required: t('validation.required'),
                    pattern: {
                      value: /^[0-9]{11}$/,
                      message: t('validation.tcknMustBe11Digits')
                    },
                    validate: (v) => isValidTCKN(v) || t('validation.invalidTCKN')
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t('application.tckn')}
                      error={!!errors.tckn}
                      helperText={errors.tckn?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="birthDate"
                  control={control}
                  rules={{ required: t('validation.required') }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="date"
                      label={t('application.birthDate')}
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.birthDate}
                      helperText={errors.birthDate?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="address"
                  control={control}
                  rules={{ required: t('validation.required') }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      rows={2}
                      label={t('application.address')}
                      error={!!errors.address}
                      helperText={errors.address?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          )}

          {activeStep === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {t('application.professionalDetails')}
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="experienceYears"
                  control={control}
                  rules={{ required: t('validation.required'), min: 0 }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label={t('application.experienceYears')}
                      InputProps={{ inputProps: { min: 0 } }}
                      error={!!errors.experienceYears}
                      helperText={errors.experienceYears?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="expectedSalary"
                  control={control}
                  rules={{ required: t('validation.required'), min: 0 }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label={t('application.expectedSalary')}
                      InputProps={{ inputProps: { min: 0 } }}
                      error={!!errors.expectedSalary}
                      helperText={errors.expectedSalary?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="availableStartDate"
                  control={control}
                  rules={{ required: t('validation.required') }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="date"
                      label={t('application.availableStartDate')}
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.availableStartDate}
                      helperText={errors.availableStartDate?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="noticePeriodDays"
                  control={control}
                  rules={{ required: t('validation.required'), min: 0 }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label={t('application.noticePeriodDays')}
                      InputProps={{ inputProps: { min: 0 } }}
                      error={!!errors.noticePeriodDays}
                      helperText={errors.noticePeriodDays?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="coverLetter"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      rows={6}
                      label={t('application.coverLetter')}
                      placeholder={t('application.coverLetterPlaceholder')}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {t('application.attachPoolCV')}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                  {selectedPoolCV ? (
                    <>
                      <Typography variant="body2">
                        {t('common.selected')}: {selectedPoolCV.firstName} {selectedPoolCV.lastName} • {selectedPoolCV.email}
                      </Typography>
                      <Button size="small" variant="outlined" onClick={() => setSelectorOpen(true)}>{t('common.change')}</Button>
                      <Button size="small" onClick={() => setSelectedPoolCV(null)}>{t('common.clear')}</Button>
                    </>
                  ) : (
                    <Button variant="outlined" onClick={() => setSelectorOpen(true)}>{t('application.selectFromPoolCVs')}</Button>
                  )}
                </Box>
              </Grid>
            </Grid>
          )}

          {activeStep === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {t('application.uploadDocuments')}
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ border: '2px dashed #ccc', borderRadius: 2, p: 3, textAlign: 'center' }}>
                  <input
                    accept=".pdf,.doc,.docx"
                    style={{ display: 'none' }}
                    id="file-upload"
                    multiple
                    type="file"
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="file-upload">
                    <Button
                      variant="contained"
                      component="span"
                      startIcon={<UploadIcon />}
                    >
                      {t('application.uploadCVAndDocuments')}
                    </Button>
                  </label>
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    {t('application.acceptedFormats')}
                  </Typography>
                </Box>

                {uploadedFiles.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    {uploadedFiles.map((file, index) => (
                      <Card key={index} sx={{ mb: 1 }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
                          <FileIcon sx={{ mr: 2 }} />
                          <Typography variant="body2" sx={{ flexGrow: 1 }}>
                            {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => removeFile(index)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                )}
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  {t('application.kvkkConsent')}
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    {t('application.kvkkConsentInfo')}
                  </Typography>
                </Alert>

                <Controller
                  name="kvkkConsent"
                  control={control}
                  rules={{ required: t('application.kvkkConsentRequired') }}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          {...field}
                          checked={field.value}
                          color="primary"
                        />
                      }
                      label={t('application.kvkkConsentLabel')}
                    />
                  )}
                />
                {errors.kvkkConsent && (
                  <Typography color="error" variant="caption" display="block">
                    {errors.kvkkConsent.message}
                  </Typography>
                )}
              </Grid>
            </Grid>
          )}

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', gap: 2, mt: 4 }}>
            <Button
              disabled={activeStep === 0 || submitting}
              onClick={handleBack}
              startIcon={<BackIcon />}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              {t('common.back')}
            </Button>

            {activeStep === steps.length - 1 ? (
              <Button
                type="submit"
                variant="contained"
                disabled={!kvkkConsent || uploadedFiles.length === 0 || submitting}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
                startIcon={submitting ? null : <SendIcon />}
              >
                {submitting ? t('common.submitting') : t('application.submitApplication')}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
                endIcon={<NextIcon />}
              >
                {t('common.next')}
              </Button>
            )}
          </Box>
        </form>
      </Paper>
      <PoolCVSelector
        open={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        onSelect={(cv) => { setSelectedPoolCV(cv); setSelectorOpen(false); }}
      />
    </Box>
  );
};

export default ApplicationForm;
