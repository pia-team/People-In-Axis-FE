import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, TextField, Button, Stack, Autocomplete, CircularProgress, Chip, Alert, Tooltip } from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { applicationService } from '@/services/cv-sharing';
import { userService } from '@/services/userService';
import type { KeycloakUser } from '@/types/user';
import type { Forwarding } from '@/types/cv-sharing';

const ForwardDialog: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [selectedUsers, setSelectedUsers] = useState<KeycloakUser[]>([]);
  const [options, setOptions] = useState<KeycloakUser[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [existingForwardings, setExistingForwardings] = useState<Forwarding[]>([]);
  const [loadingForwardings, setLoadingForwardings] = useState(true);

  // Load existing forwardings for this application
  useEffect(() => {
    const loadExistingForwardings = async () => {
      if (!id) return;
      try {
        setLoadingForwardings(true);
        const detail = await applicationService.getApplicationById(id);
        setExistingForwardings(detail.forwardings || []);
      } catch (e) {
        console.error('Failed to load existing forwardings', e);
      } finally {
        setLoadingForwardings(false);
      }
    };
    loadExistingForwardings();
  }, [id]);

  // Check if a user is already forwarded
  const isAlreadyForwarded = (userId: string) => {
    return existingForwardings.some(f => f.forwardedTo === userId);
  };

  // Get forwarding info for a user
  const getForwardingInfo = (userId: string): Forwarding | undefined => {
    return existingForwardings.find(f => f.forwardedTo === userId);
  };

  const fetchUsers = React.useCallback(async (q: string, allowEmpty = false) => {
    const term = q.trim();
    if (!allowEmpty && term.length < 2) {
      setOptions([]);
      return;
    }
    setLoadingUsers(true);
    try {
      // Fetch all users (max 1000) - backend supports up to 1000
      const data = await userService.searchKeycloakUsers(term, 1000);
      setOptions(data);
    } catch (e) {
      // Hata interceptor ile gösterilir; ek olarak uyarı verelim
      enqueueSnackbar(t('application.failedToLoadUsers') ?? 'Kullanıcı listesi alınamadı', { variant: 'error' });
    } finally {
      setLoadingUsers(false);
    }
  }, [enqueueSnackbar, t]);

  // Initial load to show selectable list without typing
  React.useEffect(() => {
    fetchUsers('', true);
  }, [fetchUsers]);

  // Fetch users on search input (debounced, only when length >= 2)
  React.useEffect(() => {
    const handler = setTimeout(() => {
      fetchUsers(inputValue, false);
    }, 300);
    return () => clearTimeout(handler);
  }, [inputValue, fetchUsers]);

  const formatLabel = (u: KeycloakUser) => {
    const name = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
    return name ? `${name} (${u.email})` : u.email;
  };

  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleInvite = async () => {
    const email = inputValue.trim();
    if (!email || !isValidEmail(email)) {
      enqueueSnackbar(t('application.pleaseEnterValidEmail') ?? 'Please enter a valid email address', { variant: 'warning' });
      return;
    }

    // Check if already selected
    if (selectedUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      enqueueSnackbar(t('application.userAlreadySelected') ?? 'User already selected', { variant: 'info' });
      return;
    }

    try {
      setInviting(true);
      const invitedUser = await userService.inviteUser({ email });
      setSelectedUsers([...selectedUsers, invitedUser]);
      setInputValue('');
      enqueueSnackbar(t('application.userInvited') ?? 'User invited successfully', { variant: 'success' });
    } catch (e: any) {
      const errorMsg = e?.response?.data?.message || e?.message || (t('application.failedToInviteUser') ?? 'Failed to invite user');
      enqueueSnackbar(errorMsg, { variant: 'error' });
    } finally {
      setInviting(false);
    }
  };

  const handleForward = async () => {
    if (!id) return;
    if (!selectedUsers.length) {
      enqueueSnackbar(t('application.pleaseEnterRecipientEmail'), { variant: 'warning' });
      return;
    }
    try {
      setSaving(true);
      const recipientIds = selectedUsers.map(u => u.id);
      const response = await applicationService.forwardApplication(id, { recipients: recipientIds, message });
      
      // Show appropriate messages based on response
      if (response.alreadyForwardedCount > 0 && response.successCount > 0) {
        // Some successful, some already forwarded
        const alreadyNames = response.alreadyForwardedRecipients.map(r => r.userName || r.email).join(', ');
        enqueueSnackbar(
          t('application.partialForwardSuccess', { 
            successCount: response.successCount,
            alreadyForwardedNames: alreadyNames 
          }),
          { variant: 'warning' }
        );
      } else if (response.alreadyForwardedCount > 0 && response.successCount === 0) {
        // All were already forwarded
        const alreadyNames = response.alreadyForwardedRecipients.map(r => r.userName || r.email).join(', ');
        enqueueSnackbar(
          t('application.allAlreadyForwarded', { names: alreadyNames }),
          { variant: 'warning' }
        );
      } else if (response.successCount > 0) {
        // All successful
        enqueueSnackbar(t('application.applicationForwarded'), { variant: 'success' });
      }
      
      navigate(`/cv-sharing/applications/${id}`);
    } catch (e) {
      enqueueSnackbar(t('application.failedToForwardApplication'), { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, maxWidth: 640, mx: 'auto' }}>
        <Typography variant="h5" gutterBottom>
          {t('application.forwardApplication')}
        </Typography>
        <Stack spacing={2}>
          <Autocomplete
            multiple
            options={options}
            value={selectedUsers}
            onChange={(_, value) => setSelectedUsers(value)}
            inputValue={inputValue}
            onInputChange={(_, value) => setInputValue(value)}
          onFocus={() => {
            if (!options.length) {
              fetchUsers('', true);
            }
          }}
            getOptionLabel={(option) => formatLabel(option)}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            loading={loadingUsers}
          disableCloseOnSelect
          openOnFocus
            renderInput={(params) => (
              <TextField
                {...params}
                label={t('application.recipients')}
              placeholder={t('application.searchUsersPlaceholder') ?? 'Kullanıcı seçin veya arayın (EMPLOYEE/MANAGER)'}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingUsers ? <CircularProgress color="inherit" size={18} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => {
                const alreadyForwarded = isAlreadyForwarded(option.id);
                const forwardingInfo = getForwardingInfo(option.id);
                return (
                  <Tooltip 
                    key={option.id}
                    title={alreadyForwarded 
                      ? t('application.alreadyForwardedToUser', { 
                          userName: option.firstName || option.email,
                          forwardedBy: forwardingInfo?.forwardedByName || '-'
                        }) 
                      : ''
                    }
                  >
                    <Chip
                      label={formatLabel(option)}
                      {...getTagProps({ index })}
                      color={alreadyForwarded ? 'warning' : 'default'}
                      icon={alreadyForwarded ? <WarningIcon /> : undefined}
                    />
                  </Tooltip>
                );
              })
            }
            noOptionsText={
              inputValue.trim() && isValidEmail(inputValue.trim()) ? (
                <Box sx={{ py: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={handleInvite}
                    disabled={inviting}
                    startIcon={inviting ? <CircularProgress size={16} /> : null}
                  >
                    {inviting ? (t('application.inviting') ?? 'Inviting...') : (t('application.inviteUser') ?? `Invite ${inputValue.trim()}`)}
                  </Button>
                </Box>
              ) : (
                t('application.noUsersFound') ?? 'No users found'
              )
            }
            fullWidth
          />
          <TextField
            label={t('application.messageOptional')}
            multiline
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            fullWidth
          />
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button variant="outlined" onClick={() => navigate(-1)} disabled={saving}>{t('common.cancel')}</Button>
            <Button variant="contained" onClick={handleForward} disabled={saving}>{t('common.send')}</Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};

export default ForwardDialog;
