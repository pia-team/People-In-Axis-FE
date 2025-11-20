import React from 'react';
import { Card, CardContent, Typography, Grid } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { trainingService } from '@/services/cv-sharing/trainingService';
import { LinearProgress } from '@mui/material';

const TrainingStats: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['trainingStats'],
    queryFn: () => trainingService.getTrainingStats(),
  });

  if (isLoading) {
    return <LinearProgress sx={{ mb: 3 }} />;
  }

  if (!stats) {
    return null;
  }

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={2.4}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Examples
            </Typography>
            <Typography variant="h5">{stats.total}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={2.4}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Exported
            </Typography>
            <Typography variant="h5" color="success.main">
              {stats.exported}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={2.4}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Label 0 (Irrelevant)
            </Typography>
            <Typography variant="h5" color="error.main">
              {stats.label0 || 0}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={2.4}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Label 1 (Somewhat)
            </Typography>
            <Typography variant="h5" color="warning.main">
              {stats.label1 || 0}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={2.4}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Label 2 (Relevant)
            </Typography>
            <Typography variant="h5" color="info.main">
              {stats.label2 || 0}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={2.4}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Label 3 (Highly Relevant)
            </Typography>
            <Typography variant="h5" color="success.main">
              {stats.label3 || 0}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default TrainingStats;

