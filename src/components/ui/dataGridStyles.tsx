import { SxProps, Theme } from '@mui/material/styles';
import EmptyState from './EmptyState';

export const standardDataGridSx: SxProps<Theme> = {
  borderRadius: 2,
  backgroundColor: 'background.paper',
  border: '1px solid',
  borderColor: 'divider',
  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: 'background.default',
    borderBottom: '1px solid rgba(0,0,0,0.08)'
  },
  '& .MuiDataGrid-cell': {
    borderBottom: '1px solid rgba(0,0,0,0.05)'
  },
  '& .MuiDataGrid-row:hover': {
    backgroundColor: 'rgba(79,70,229,0.04)'
  },
};

export const NoRowsOverlay = () => (
  <EmptyState />
);
