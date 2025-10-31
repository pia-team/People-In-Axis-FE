import React from 'react';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { positionService } from '@/services/cv-sharing';

const PositionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: position, isLoading } = useQuery({
    queryKey: ['position', id],
    queryFn: () => positionService.getPositionById(id!),
    enabled: !!id
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {position?.title}
        </Typography>
        <Typography variant="body1">
          Position details will be implemented here
        </Typography>
      </Paper>
    </Box>
  );
};

export default PositionDetail;
