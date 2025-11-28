import React, { useMemo, useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Grid, InputAdornment } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useQuery } from '@tanstack/react-query';
import { logService } from '@/services/logService';
import { Search as SearchIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const Logs: React.FC = () => {
  const { t } = useTranslation();
  const [entityType, setEntityType] = useState('');
  const [entityId, setEntityId] = useState('');
  const [action, setAction] = useState('');
  const [userId, setUserId] = useState('');

  const { data, isPending, refetch } = useQuery({
    queryKey: ['logs', entityType, entityId, action, userId],
    queryFn: () => logService.getLogs({ entityType: entityType || undefined, entityId: entityId || undefined, action: action || undefined, userId: userId || undefined }),
  });

  const rows = useMemo(() => (data?.content || []).map((l, idx) => ({ ...l, id: String(l.id ?? idx) })), [data]);

  const columns: GridColDef[] = [
    { field: 'createdAt', headerName: t('log.time'), width: 180, valueGetter: (p) => new Date(p.row.createdAt).toLocaleString() },
    { field: 'actorName', headerName: t('log.actor'), width: 180 },
    { field: 'action', headerName: t('log.action'), width: 160 },
    { field: 'entityType', headerName: t('log.entity'), width: 140 },
    { field: 'entityId', headerName: t('log.entityId'), width: 180 },
    { field: 'description', headerName: t('log.description'), width: 320 },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>{t('log.title')}</Typography>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={3}>
            <TextField size="small" label={t('log.entityType')} value={entityType} onChange={(e) => setEntityType(e.target.value)} fullWidth InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField size="small" label={t('log.entityId')} value={entityId} onChange={(e) => setEntityId(e.target.value)} fullWidth />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField size="small" label={t('log.action')} value={action} onChange={(e) => setAction(e.target.value)} fullWidth />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField size="small" label={t('log.userId')} value={userId} onChange={(e) => setUserId(e.target.value)} fullWidth />
          </Grid>
          <Grid item xs={12}>
            <Button variant="outlined" onClick={() => refetch()}>{t('common.search')}</Button>
          </Grid>
        </Grid>

        <div style={{ width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={isPending}
            autoHeight
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            disableRowSelectionOnClick
          />
        </div>
      </Paper>
    </Box>
  );
};

export default Logs;
