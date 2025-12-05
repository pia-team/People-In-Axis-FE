import React from 'react';
import {
  Typography,
  Stack,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel, GridRenderCellParams } from '@mui/x-data-grid';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import InfoIcon from '@mui/icons-material/Info';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import PageContainer from '@/components/ui/PageContainer';
import SectionCard from '@/components/ui/SectionCard';
import { standardDataGridSx, NoRowsOverlay } from '@/components/ui/dataGridStyles';
import {
  auditLogService,
  AuditLog,
  parseChanges,
  getActionLabel,
  getEntityTypeLabel,
  getActionColor,
  FieldChange,
} from '@/services/auditLogService';

const AuditLogList: React.FC = () => {
  const [paginationModel, setPaginationModel] = React.useState<{ page: number; pageSize: number }>({
    page: 0,
    pageSize: 20,
  });
  const [entityTypeFilter, setEntityTypeFilter] = React.useState<string>('');
  const [actionFilter, setActionFilter] = React.useState<string>('');
  const [selectedLog, setSelectedLog] = React.useState<AuditLog | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = React.useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['audit-logs', paginationModel.page, paginationModel.pageSize],
    queryFn: async () =>
      auditLogService.getAll({
        page: paginationModel.page,
        size: paginationModel.pageSize,
      }),
    placeholderData: keepPreviousData,
  });

  const rows = React.useMemo(() => {
    let filtered = data?.content ?? [];
    if (entityTypeFilter) {
      filtered = filtered.filter((log) => log.entityType === entityTypeFilter);
    }
    if (actionFilter) {
      filtered = filtered.filter((log) => log.action.includes(actionFilter));
    }
    return filtered;
  }, [data?.content, entityTypeFilter, actionFilter]);

  const rowCount = data?.totalElements ?? 0;

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setDetailDialogOpen(true);
  };

  const columns = React.useMemo<GridColDef<AuditLog>[]>(
    () => [
      {
        field: 'createdAt',
        headerName: 'Tarih',
        width: 170,
        valueFormatter: (params) => {
          if (!params.value) return '';
          return format(new Date(params.value as string), 'dd.MM.yyyy HH:mm', { locale: tr });
        },
      },
      {
        field: 'username',
        headerName: 'Kullanıcı',
        flex: 1,
        minWidth: 150,
        valueGetter: (params) => params.row.username || 'Sistem',
      },
      {
        field: 'action',
        headerName: 'İşlem',
        width: 200,
        renderCell: (params: GridRenderCellParams<AuditLog>) => (
          <Chip
            label={getActionLabel(params.row.action)}
            color={getActionColor(params.row.action)}
            size="small"
            variant="outlined"
          />
        ),
      },
      {
        field: 'entityType',
        headerName: 'Tür',
        width: 120,
        valueFormatter: (params) => getEntityTypeLabel(params.value as string),
      },
      {
        field: 'entityName',
        headerName: 'Kayıt',
        flex: 1.5,
        minWidth: 200,
        valueGetter: (params) => params.row.entityName || params.row.entityId || '-',
      },
      {
        field: 'details',
        headerName: 'Açıklama',
        flex: 2,
        minWidth: 250,
        renderCell: (params: GridRenderCellParams<AuditLog>) => (
          <Tooltip title={params.row.details || ''} arrow>
            <Typography
              variant="body2"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '100%',
              }}
            >
              {params.row.details || '-'}
            </Typography>
          </Tooltip>
        ),
      },
      {
        field: 'actions',
        headerName: 'Detay',
        width: 80,
        sortable: false,
        renderCell: (params: GridRenderCellParams<AuditLog>) => (
          <IconButton size="small" onClick={() => handleViewDetails(params.row)} color="primary">
            <InfoIcon />
          </IconButton>
        ),
      },
    ],
    []
  );

  const handlePaginationChange = (model: GridPaginationModel) => {
    setPaginationModel({ page: model.page, pageSize: model.pageSize });
  };

  const entityTypes = ['PoolCV', 'Position', 'Application', 'Meeting', 'MatchingConfig', 'SkillAlias'];
  const actionTypes = ['CREATED', 'UPDATED', 'DELETED', 'STATUS_CHANGED', 'FORWARDED'];

  return (
    <PageContainer
      title="İşlem Geçmişi (Audit Log)"
      actions={
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => refetch()}>
          Yenile
        </Button>
      }
    >
      <Stack spacing={2}>
        {/* Filters */}
        <SectionCard>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
            <FilterListIcon color="action" />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Entity Tipi</InputLabel>
              <Select
                value={entityTypeFilter}
                label="Entity Tipi"
                onChange={(e) => setEntityTypeFilter(e.target.value)}
              >
                <MenuItem value="">Tümü</MenuItem>
                {entityTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {getEntityTypeLabel(type)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>İşlem Tipi</InputLabel>
              <Select value={actionFilter} label="İşlem Tipi" onChange={(e) => setActionFilter(e.target.value)}>
                <MenuItem value="">Tümü</MenuItem>
                {actionTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.replace('_', ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="text"
              onClick={() => {
                setEntityTypeFilter('');
                setActionFilter('');
              }}
            >
              Filtreleri Temizle
            </Button>
          </Stack>
        </SectionCard>

        {/* Data Grid */}
        <SectionCard>
          <div style={{ height: 650, width: '100%' }}>
            <DataGrid
              rows={rows}
              columns={columns}
              getRowId={(row) => row.id}
              loading={isLoading}
              paginationMode="server"
              rowCount={rowCount}
              pageSizeOptions={[10, 20, 50, 100]}
              paginationModel={{ page: paginationModel.page, pageSize: paginationModel.pageSize }}
              onPaginationModelChange={handlePaginationChange}
              disableRowSelectionOnClick
              sx={standardDataGridSx}
              slots={{ noRowsOverlay: NoRowsOverlay }}
            />
          </div>
          {isError && (
            <Typography variant="body2" color="error" sx={{ mt: 2 }}>
              İşlem geçmişi yüklenirken hata oluştu.
            </Typography>
          )}
        </SectionCard>
      </Stack>

      {/* Detail Dialog */}
      <AuditLogDetailDialog log={selectedLog} open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} />
    </PageContainer>
  );
};

interface AuditLogDetailDialogProps {
  log: AuditLog | null;
  open: boolean;
  onClose: () => void;
}

const AuditLogDetailDialog: React.FC<AuditLogDetailDialogProps> = ({ log, open, onClose }) => {
  if (!log) return null;

  const changes: FieldChange[] = parseChanges(log.changesJson);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="h6">İşlem Detayı</Typography>
          <Chip label={getActionLabel(log.action)} color={getActionColor(log.action)} size="small" />
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          {/* Basic Info */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Genel Bilgiler
            </Typography>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', width: 150 }}>Tarih</TableCell>
                  <TableCell>
                    {format(new Date(log.createdAt), 'dd MMMM yyyy HH:mm:ss', { locale: tr })}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Kullanıcı</TableCell>
                  <TableCell>{log.username || 'Sistem'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Entity Tipi</TableCell>
                  <TableCell>{getEntityTypeLabel(log.entityType)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Kayıt</TableCell>
                  <TableCell>{log.entityName || log.entityId}</TableCell>
                </TableRow>
                {log.ipAddress && (
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>IP Adresi</TableCell>
                    <TableCell>{log.ipAddress}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>

          {/* Description */}
          {log.details && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Açıklama
              </Typography>
              <Typography variant="body2" sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                {log.details}
              </Typography>
            </Box>
          )}

          {/* Changes */}
          {changes.length > 0 && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Değişiklikler
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Alan</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Eski Değer</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Yeni Değer</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {changes.map((change, index) => (
                    <TableRow key={index}>
                      <TableCell>{change.fieldLabel}</TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            textDecoration: 'line-through',
                            color: 'error.main',
                            opacity: 0.7,
                          }}
                        >
                          {change.oldValue || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 'medium' }}>
                          {change.newValue || '-'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Kapat</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AuditLogList;

