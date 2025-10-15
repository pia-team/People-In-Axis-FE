import React from 'react';
import { Box, Typography, Paper, Stack, Divider, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { projectService } from '@/services/projectService';
import { Project } from '@/types';

const ProjectDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => projectService.getById(Number(id)),
    enabled: !!id,
  });

  const project = data as Project | undefined;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" component="h1" gutterBottom>
          Project Detail
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => navigate('/projects')}>Back</Button>
          <Button variant="contained" onClick={() => navigate(`/projects/${id}/edit`)}>Edit</Button>
        </Stack>
      </Stack>
      <Paper sx={{ p: 3, mt: 2 }}>
        {isLoading && <Typography>Loading...</Typography>}
        {isError && <Typography color="error">Failed to load project.</Typography>}
        {project && (
          <Stack spacing={1}>
            <Typography variant="h6">{project.name} ({project.code || '-'})</Typography>
            <Divider sx={{ my: 1 }} />
            <Typography>Company: {project.companyName || '-'}</Typography>
            <Typography>Manager: {project.projectManagerName || '-'}</Typography>
            <Typography>Status: {project.status || '-'}</Typography>
            <Typography>Start: {project.startDate || '-'}</Typography>
            <Typography>End: {project.endDate || '-'}</Typography>
            <Typography>Deadline: {project.deadline || '-'}</Typography>
            <Typography>Budget: {project.budget ?? '-'}</Typography>
            <Typography>Spent: {project.spentAmount ?? '-'}</Typography>
            <Typography>Currency: {project.currency || '-'}</Typography>
            <Typography>Priority: {project.priority || '-'}</Typography>
            <Typography>Client: {project.clientName || '-'}</Typography>
            <Typography>Contact: {project.clientContact || '-'}</Typography>
            {project.description && (
              <>
                <Divider sx={{ my: 1 }} />
                <Typography>Description: {project.description}</Typography>
              </>
            )}
          </Stack>
        )}
      </Paper>
    </Box>
  );
};

export default ProjectDetail;