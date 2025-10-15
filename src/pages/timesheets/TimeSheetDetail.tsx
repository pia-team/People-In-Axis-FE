import React from 'react';
import { Box, Typography, Paper, Stack, Divider, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { timeSheetService } from '@/services/timesheetService';

const TimeSheetDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['timesheet', id],
    queryFn: async () => timeSheetService.getById(Number(id)),
    enabled: !!id,
  });

  const submitMutation = useMutation({
    mutationFn: () => timeSheetService.submit(Number(id)),
    onSuccess: () => refetch(),
  });

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" component="h1" gutterBottom>
          TimeSheet Detail
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => navigate('/timesheets')}>Back</Button>
          <Button
            variant="contained"
            onClick={() => submitMutation.mutate()}
            disabled={
              !data || !['DRAFT', 'REVISION_REQUESTED'].includes(String(data.status)) || submitMutation.isPending
            }
          >
            Submit
          </Button>
        </Stack>
      </Stack>
      <Paper sx={{ p: 3, mt: 2 }}>
        {isLoading && (
          <Typography variant="body1">Loading...</Typography>
        )}
        {isError && (
          <Typography variant="body1" color="error">Failed to load timesheet.</Typography>
        )}
        {data && (
          <Stack spacing={1}>
            <Typography variant="h6">{data.employeeName} - {data.projectName}</Typography>
            <Divider sx={{ my: 1 }} />
            <Typography>Date: {data.workDate}</Typography>
            <Typography>Hours: {data.hoursWorked}</Typography>
            {data.overtimeHours !== undefined && (
              <Typography>Overtime: {data.overtimeHours}</Typography>
            )}
            <Typography>Status: {data.status || '-'}</Typography>
            <Typography>Billable: {data.billable ? 'Yes' : 'No'}</Typography>
            <Typography>Task: {data.taskDescription || '-'}</Typography>
          </Stack>
        )}
      </Paper>
    </Box>
  );
};

export default TimeSheetDetail;
