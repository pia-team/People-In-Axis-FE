import React from 'react';
import { Typography, Stack, Divider, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { expenseService } from '@/services/expenseService';
import PageContainer from '@/components/ui/PageContainer';
import SectionCard from '@/components/ui/SectionCard';

const ExpenseDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['expense', id],
    queryFn: async () => expenseService.getById(Number(id)),
    enabled: !!id,
  });

  const submitMutation = useMutation({
    mutationFn: () => expenseService.submit(Number(id)),
    onSuccess: () => refetch(),
  });

  return (
    <PageContainer
      title="Expense Detail"
      actions={
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => navigate('/expenses')}>Back</Button>
          <Button
            variant="contained"
            onClick={() => submitMutation.mutate()}
            disabled={!data || !['PENDING', 'REJECTED'].includes(String(data?.status)) || submitMutation.isPending}
          >
            Submit
          </Button>
        </Stack>
      }
    >
      <SectionCard>
        {isLoading && (
          <Typography variant="body1">Loading...</Typography>
        )}
        {isError && (
          <Typography variant="body1" color="error">Failed to load expense.</Typography>
        )}
        {data && (
          <Stack spacing={1}>
            <Typography variant="h6">{data.employeeName} - {data.expenseTypeName}</Typography>
            <Divider sx={{ my: 1 }} />
            <Typography>Date: {data.expenseDate}</Typography>
            <Typography>Project: {data.projectName || '-'}</Typography>
            <Typography>Amount: {data.amount} {data.currency || ''}</Typography>
            <Typography>Status: {data.status || '-'}</Typography>
          </Stack>
        )}
      </SectionCard>
    </PageContainer>
  );
};

export default ExpenseDetail;
