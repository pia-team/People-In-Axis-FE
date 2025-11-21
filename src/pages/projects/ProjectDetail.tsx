import React from 'react';
import { Typography, Stack, Divider, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { projectService } from '@/services/projectService';
import { Project } from '@/types';
import PageContainer from '@/components/ui/PageContainer';
import SectionCard from '@/components/ui/SectionCard';

const ProjectDetail: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => projectService.getById(Number(id)),
    enabled: !!id,
  });

  const project = data as Project | undefined;

  return (
    <PageContainer
      title={t('project.projectDetails')}
      actions={
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => navigate('/projects')}>{t('common.back')}</Button>
          <Button variant="contained" onClick={() => navigate(`/projects/${id}/edit`)}>{t('common.edit')}</Button>
        </Stack>
      }
    >
      <SectionCard>
        {isLoading && <Typography>{t('common.loading')}</Typography>}
        {isError && <Typography color="error">{t('error.loadFailed', { item: t('project.title').toLowerCase() })}</Typography>}
        {project && (
          <Stack spacing={1}>
            <Typography variant="h6">{project.name} ({project.code || '-'})</Typography>
            <Divider sx={{ my: 1 }} />
            <Typography>{t('employee.company')}: {project.companyName || '-'}</Typography>
            <Typography>{t('project.manager')}: {project.projectManagerName || '-'}</Typography>
            <Typography>{t('common.status')}: {project.status || '-'}</Typography>
            <Typography>{t('project.startDate')}: {project.startDate || '-'}</Typography>
            <Typography>{t('project.endDate')}: {project.endDate || '-'}</Typography>
            <Typography>{t('project.deadline')}: {project.deadline || '-'}</Typography>
            <Typography>{t('project.budget')}: {project.budget ?? '-'}</Typography>
            <Typography>{t('project.spent')}: {project.spentAmount ?? '-'}</Typography>
            <Typography>{t('expense.currency')}: {project.currency || '-'}</Typography>
            <Typography>{t('project.priority')}: {project.priority || '-'}</Typography>
            <Typography>{t('project.client')}: {project.clientName || '-'}</Typography>
            <Typography>{t('project.contact')}: {project.clientContact || '-'}</Typography>
            {project.description && (
              <>
                <Divider sx={{ my: 1 }} />
                <Typography>{t('common.description')}: {project.description}</Typography>
              </>
            )}
          </Stack>
        )}
      </SectionCard>
    </PageContainer>
  );
};

export default ProjectDetail;
