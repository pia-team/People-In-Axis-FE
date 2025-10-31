import React, { useMemo, useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Grid, InputAdornment } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useQuery } from '@tanstack/react-query';
import { logService } from '@/services/logService';
import { Search as SearchIcon } from '@mui/icons-material';

const Logs: React.FC = () => {
  const [entityType, setEntityType] = useState('');
  const [entityId, setEntityId] = useState('');
  const [action, setAction] = useState('');
  const [userId, setUserId] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['logs', entityType, entityId, action, userId],
    queryFn: () => logService.getLogs({ entityType: entityType || undefined, entityId: entityId || undefined, action: action || undefined, userId: userId || undefined }),
  });

  const rows = useMemo(() => (data?.content || []).map((l, idx) => ({ ...l, id: String(l.id ?? idx) })), [data]);

  const columns: GridColDef[] = [
    { field: 'createdAt', headerName: 'Time', width: 180, valueGetter: (p) => new Date(p.row.createdAt).toLocaleString() },
    { field: 'actorName', headerName: 'Actor', width: 180 },
    { field: 'action', headerName: 'Action', width: 160 },
    { field: 'entityType', headerName: 'Entity', width: 140 },
    { field: 'entityId', headerName: 'Entity ID', width: 180 },
    { field: 'description', headerName: 'Description', width: 320 },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Audit Logs</Typography>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={3}>
            <TextField size="small" label="Entity Type" value={entityType} onChange={(e) => setEntityType(e.target.value)} fullWidth InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField size="small" label="Entity ID" value={entityId} onChange={(e) => setEntityId(e.target.value)} fullWidth />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField size="small" label="Action" value={action} onChange={(e) => setAction(e.target.value)} fullWidth />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField size="small" label="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} fullWidth />
          </Grid>
          <Grid item xs={12}>
            <Button variant="outlined" onClick={() => refetch()}>Search</Button>
          </Grid>
        </Grid>

        <div style={{ width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={isLoading}
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
