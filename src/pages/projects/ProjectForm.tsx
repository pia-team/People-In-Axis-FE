import React from 'react';
import { Stack, TextField, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { projectService } from '@/services/projectService';
import { Project, ProjectCreateDTO, ProjectUpdateDTO } from '@/types';
import PageContainer from '@/components/ui/PageContainer';
import SectionCard from '@/components/ui/SectionCard';

const ProjectForm: React.FC = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => projectService.getById(Number(id)),
    enabled: isEdit,
  });

  const existing = (data as Project | undefined) || undefined;

  const [form, setForm] = React.useState<Partial<ProjectCreateDTO & ProjectUpdateDTO>>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    deadline: '',
    status: '',
    budget: undefined,
    spentAmount: undefined,
    currency: '',
    completionPercentage: undefined,
    priority: '',
    clientName: '',
    clientContact: '',
    companyId: undefined,
    projectManagerId: undefined,
  });

  React.useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name,
        description: existing.description,
        startDate: existing.startDate || '',
        endDate: existing.endDate || '',
        deadline: existing.deadline || '',
        status: existing.status || '',
        budget: existing.budget as any,
        spentAmount: existing.spentAmount as any,
        currency: existing.currency || '',
        completionPercentage: existing.completionPercentage,
        priority: existing.priority || '',
        clientName: existing.clientName || '',
        clientContact: existing.clientContact || '',
        companyId: existing.companyId,
        projectManagerId: existing.projectManagerId,
      });
    }
  }, [existing]);

  const { mutateAsync: save, isPending } = useMutation({
    mutationFn: async () => {
      const payload = form as ProjectCreateDTO;
      if (!payload.name || !payload.companyId) throw new Error('Name and Company ID are required');
      if (isEdit) {
        return projectService.update(Number(id), payload as ProjectUpdateDTO);
      }
      return projectService.create(payload);
    },
  });

  const handleChange = (key: keyof (ProjectCreateDTO & ProjectUpdateDTO)) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [key]: value === '' ? '' : value }));
  };

  const handleNumber = (key: keyof (ProjectCreateDTO & ProjectUpdateDTO)) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [key]: value === '' ? undefined : Number(value) }));
  };

  const onSubmit = async () => {
    try {
      await save();
      navigate('/projects');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  };

  return (
    <PageContainer title={isEdit ? 'Edit Project' : 'New Project'}>
      <SectionCard>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Name" value={form.name || ''} onChange={handleChange('name')} fullWidth required />
            <TextField label="Company ID" type="number" value={form.companyId ?? ''} onChange={handleNumber('companyId')} sx={{ minWidth: 200 }} required />
            <TextField label="Manager ID" type="number" value={form.projectManagerId ?? ''} onChange={handleNumber('projectManagerId')} sx={{ minWidth: 200 }} />
          </Stack>
          <TextField label="Description" value={form.description || ''} onChange={handleChange('description')} multiline minRows={3} />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Start Date" type="date" value={form.startDate || ''} onChange={handleChange('startDate')} InputLabelProps={{ shrink: true }} />
            <TextField label="End Date" type="date" value={form.endDate || ''} onChange={handleChange('endDate')} InputLabelProps={{ shrink: true }} />
            <TextField label="Deadline" type="date" value={form.deadline || ''} onChange={handleChange('deadline')} InputLabelProps={{ shrink: true }} />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Status" value={form.status || ''} onChange={handleChange('status')} sx={{ minWidth: 200 }} />
            <TextField label="Budget" type="number" value={form.budget ?? ''} onChange={handleNumber('budget')} sx={{ minWidth: 200 }} />
            <TextField label="Spent" type="number" value={form.spentAmount ?? ''} onChange={handleNumber('spentAmount')} sx={{ minWidth: 200 }} />
            <TextField label="Currency" value={form.currency || ''} onChange={handleChange('currency')} sx={{ minWidth: 140 }} />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Completion %" type="number" value={form.completionPercentage ?? ''} onChange={handleNumber('completionPercentage')} sx={{ minWidth: 200 }} />
            <TextField label="Priority" value={form.priority || ''} onChange={handleChange('priority')} sx={{ minWidth: 200 }} />
            <TextField label="Client" value={form.clientName || ''} onChange={handleChange('clientName')} sx={{ minWidth: 200 }} />
            <TextField label="Contact" value={form.clientContact || ''} onChange={handleChange('clientContact')} sx={{ minWidth: 200 }} />
          </Stack>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={() => navigate('/projects')}>Cancel</Button>
            <Button variant="contained" onClick={onSubmit} disabled={isPending}>{isEdit ? 'Save' : 'Create'}</Button>
          </Stack>
        </Stack>
      </SectionCard>
    </PageContainer>
  );
};

export default ProjectForm;