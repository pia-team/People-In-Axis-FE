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

const steps = ['Personal Information', 'Professional Details', 'Documents & Consent'];

const ApplicationForm: React.FC = () => {
  const navigate = useNavigate();
  const { positionId } = useParams<{ positionId: string }>();
  const { enqueueSnackbar } = useSnackbar();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
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
      enqueueSnackbar('Failed to load position details', { variant: 'error' });
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
          enqueueSnackbar(`File ${file.name} exceeds 10MB limit`, { variant: 'error' });
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
      enqueueSnackbar('Please accept KVKK consent to proceed', { variant: 'error' });
      return;
    }

    if (uploadedFiles.length === 0) {
      enqueueSnackbar('Please upload at least one document', { variant: 'error' });
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
      enqueueSnackbar('Application submitted successfully!', { variant: 'success' });
      navigate(`/cv-sharing/applications/${created.id}`);
    } catch (error: any) {
      enqueueSnackbar(error.message || 'Failed to submit application', { variant: 'error' });
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
          Job Application
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
                  Personal Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="firstName"
                  control={control}
                  rules={{ required: 'First name is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="First Name"
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
                  rules={{ required: 'Last name is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Last Name"
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
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Email"
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
                  rules={{ required: 'Phone number is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Phone Number"
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
                    required: 'TCKN is required',
                    pattern: {
                      value: /^[0-9]{11}$/,
                      message: 'TCKN must be 11 digits'
                    },
                    validate: (v) => isValidTCKN(v) || 'Invalid TCKN checksum'
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="TCKN"
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
                  rules={{ required: 'Birth date is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="date"
                      label="Birth Date"
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
                  rules={{ required: 'Address is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      rows={2}
                      label="Address"
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
                  Professional Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="experienceYears"
                  control={control}
                  rules={{ required: 'Experience is required', min: 0 }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Years of Experience"
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
                  rules={{ required: 'Expected salary is required', min: 0 }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Expected Salary (Monthly)"
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
                  rules={{ required: 'Start date is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="date"
                      label="Available Start Date"
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
                  rules={{ required: 'Notice period is required', min: 0 }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Notice Period (Days)"
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
                      label="Cover Letter (Optional)"
                      placeholder="Tell us why you're interested in this position..."
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Attach Pool CV (Optional)
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                  {selectedPoolCV ? (
                    <>
                      <Typography variant="body2">
                        Selected: {selectedPoolCV.firstName} {selectedPoolCV.lastName} • {selectedPoolCV.email}
                      </Typography>
                      <Button size="small" variant="outlined" onClick={() => setSelectorOpen(true)}>Change</Button>
                      <Button size="small" onClick={() => setSelectedPoolCV(null)}>Clear</Button>
                    </>
                  ) : (
                    <Button variant="outlined" onClick={() => setSelectorOpen(true)}>Select from Pool CVs</Button>
                  )}
                </Box>
              </Grid>
            </Grid>
          )}

          {activeStep === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Upload Documents
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
                      Upload CV and Documents
                    </Button>
                  </label>
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Accepted formats: PDF, DOC, DOCX (Max 10MB per file)
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
                  KVKK Consent
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    Your personal data will be processed in accordance with KVKK/GDPR regulations
                    for the purposes of evaluating your job application. Your data will be stored
                    securely and will only be accessed by authorized personnel.
                  </Typography>
                </Alert>

                <Controller
                  name="kvkkConsent"
                  control={control}
                  rules={{ required: 'You must accept KVKK consent to proceed' }}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          {...field}
                          checked={field.value}
                          color="primary"
                        />
                      }
                      label="I consent to the processing of my personal data for recruitment purposes"
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

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0 || submitting}
              onClick={handleBack}
              startIcon={<BackIcon />}
            >
              Back
            </Button>

            {activeStep === steps.length - 1 ? (
              <Button
                type="submit"
                variant="contained"
                disabled={!kvkkConsent || uploadedFiles.length === 0 || submitting}
                startIcon={submitting ? null : <SendIcon />}
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<NextIcon />}
              >
                Next
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
