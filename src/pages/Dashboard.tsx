import PageContainer from '@/components/ui/PageContainer';
import React from 'react';
import { Box, Typography, Grid, Paper, Stack, Button, Skeleton, Table, TableBody, TableCell, TableHead, TableRow, Divider } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboardService';
import { useNavigate } from 'react-router-dom';
import { useKeycloak } from '@/hooks/useKeycloak';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip as RTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import PlaylistAddCheckOutlinedIcon from '@mui/icons-material/PlaylistAddCheckOutlined';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { hasRole, hasAnyRole } = useKeycloak();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'metrics'],
    queryFn: () => dashboardService.getMetrics(),
    staleTime: 30_000,
  });

  const formatNumber = (n?: number) => new Intl.NumberFormat().format(n ?? 0);
  const value = (n?: number) => (
    isLoading ? <Skeleton variant="text" width={56} height={42} /> : <Typography variant="h3" sx={{ fontWeight: 700 }}>{formatNumber(n)}</Typography>
  );

  const toChartData = (m?: Record<string, number>, top: number = 6) => {
    const entries = Object.entries(m ?? {})
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
    if (entries.length <= top) return entries;
    const head = entries.slice(0, top);
    const rest = entries.slice(top).reduce((sum, e) => sum + (e.value ?? 0), 0);
    return rest > 0 ? [...head, { name: 'OTHER', value: rest }] : head;
  };

  const COLORS = ['#4F46E5', '#06B6D4', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#14B8A6', '#E11D48'];

  const CardBase: React.FC<React.PropsWithChildren<{ title: string; action?: React.ReactNode }>> = ({ title, action, children }) => (
    <Paper sx={{ p: 2.5, height: '100%', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
      <Stack spacing={1} height="100%">
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{title}</Typography>
          {action}
        </Stack>
        {children}
      </Stack>
    </Paper>
  );

  const MetricCard: React.FC<{ title: string; value?: number; loading?: boolean; to?: string; icon?: React.ReactNode }>
    = ({ title, value: v, loading, to, icon }) => (
      <CardBase
        title={title}
        action={to ? <Button size="small" onClick={() => navigate(to)}>View</Button> : undefined}
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
          {icon}
          {loading ? <Skeleton variant="text" width={56} height={42} /> : <Typography variant="h3" sx={{ fontWeight: 700 }}>{formatNumber(v)}</Typography>}
        </Stack>
      </CardBase>
  );

  const ChartCard: React.FC<React.PropsWithChildren<{ title: string }>> = ({ title, children }) => (
    <CardBase title={title}>
      <Box sx={{ mt: 1, height: 300 }}>{children}</Box>
    </CardBase>
  );

  return (
    <PageContainer title="Dashboard">
      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard title="Total Employees" value={data?.totalEmployees} loading={isLoading} to="/employees" icon={<PeopleAltIcon color="primary" />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard title="Active Projects" value={data?.activeProjects} loading={isLoading} to="/projects" icon={<WorkOutlineIcon color="primary" />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard title="Pending Timesheets (Manager)" value={data?.pendingTimesheetsManager} loading={isLoading}
            to={hasAnyRole(['TEAM_MANAGER', 'HUMAN_RESOURCES']) ? '/timesheets/approval' : undefined}
            icon={<AssignmentTurnedInIcon color="primary" />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard title="Pending Timesheets (Admin)" value={data?.pendingTimesheetsAdmin} loading={isLoading}
            to={hasRole('ADMIN') ? '/timesheets/admin-approval' : undefined}
            icon={<AdminPanelSettingsOutlinedIcon color="primary" />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard title="Pending Expenses" value={data?.pendingExpenses} loading={isLoading}
            to={hasAnyRole(['TEAM_MANAGER', 'HUMAN_RESOURCES', 'FINANCE']) ? '/expenses/approval' : undefined}
            icon={<ReceiptLongOutlinedIcon color="primary" />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard title="Assigned Rows (Team Lead)" value={data?.teamLeadAssignedRows} loading={isLoading}
            to={hasRole('TEAM_MANAGER') ? '/timesheets/assigned' : undefined}
            icon={<PlaylistAddCheckOutlinedIcon color="primary" />} />
        </Grid>

        {/* HR Metrics (CV Sharing) */}
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard title="Total Positions" value={data?.totalPositions} loading={isLoading}
            to="/cv-sharing/positions"
            icon={<BusinessCenterOutlinedIcon sx={{ color: 'primary.main' }} />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard title="Total Applications" value={data?.totalApplications} loading={isLoading}
            to="/cv-sharing/applications"
            icon={<DescriptionOutlinedIcon sx={{ color: 'success.main' }} />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard title="Pool CVs" value={data?.totalPoolCVs} loading={isLoading}
            to="/cv-sharing/pool-cvs"
            icon={<FolderOpenOutlinedIcon sx={{ color: 'secondary.main' }} />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard title="Active Meetings" value={data?.activeMeetings} loading={isLoading}
            to="/meetings"
            icon={<CalendarMonthOutlinedIcon sx={{ color: 'warning.main' }} />} />
        </Grid>

        {/* Company-scoped cards */}
        {data?.companyId && (
          <>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 1 }}>Company ({data.companyName})</Typography>
              <Divider sx={{ mb: 1 }} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2 }}>
                <Stack spacing={1}>
                  <Typography variant="body2">Employees (Company)</Typography>
                  {value(data.companyTotalEmployees)}
                </Stack>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2 }}>
                <Stack spacing={1}>
                  <Typography variant="body2">Active Projects (Company)</Typography>
                  {value(data.companyActiveProjects)}
                </Stack>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2 }}>
                <Stack spacing={1}>
                  <Typography variant="body2">Pending Timesheets (Company)</Typography>
                  {value(data.companyPendingTimesheets)}
                </Stack>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2 }}>
                <Stack spacing={1}>
                  <Typography variant="body2">Pending Expenses (Company)</Typography>
                  {value(data.companyPendingExpenses)}
                </Stack>
              </Paper>
            </Grid>
          </>
        )}

        {/* Charts */}
        <Grid item xs={12} md={6}>
          <ChartCard title="Timesheet Base Status">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={toChartData(data?.timesheetBaseStatusCounts)} dataKey="value" nameKey="name" cx="45%" cy="50%" outerRadius={105} label>
                  {toChartData(data?.timesheetBaseStatusCounts).map((entry, index) => (
                    <Cell key={`ts-${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ paddingLeft: 8 }} />
                <RTooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <ChartCard title="Expense Status">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={toChartData(data?.expenseStatusCounts)} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" interval={0} angle={-25} textAnchor="end" height={50} />
                <YAxis allowDecimals={false} />
                <RTooltip />
                <Legend />
                <Bar dataKey="value" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        {/* Recent lists */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Recent Timesheets</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Employee</TableCell>
                  <TableCell>Project</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(data?.recentTimesheets ?? []).map((r) => (
                  <TableRow 
                    key={r.id} 
                    hover 
                    onClick={() => navigate(`/timesheets/${r.id}`)} 
                    sx={{ cursor: 'pointer' }}>
                    <TableCell>{r.id}</TableCell>
                    <TableCell>{r.employeeName}</TableCell>
                    <TableCell>{r.projectName}</TableCell>
                    <TableCell>{r.baseStatus}</TableCell>
                    <TableCell>{r.createdAt?.slice(0, 19).replace('T', ' ')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Recent Expenses</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Employee</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(data?.recentExpenses ?? []).map((r) => (
                  <TableRow 
                    key={r.id} 
                    hover 
                    onClick={() => navigate(`/expenses/${r.id}`)} 
                    sx={{ cursor: 'pointer' }}>
                    <TableCell>{r.id}</TableCell>
                    <TableCell>{r.employeeName}</TableCell>
                    <TableCell>{(r.amount ?? 0).toLocaleString()} {r.currency}</TableCell>
                    <TableCell>{r.status}</TableCell>
                    <TableCell>{r.createdAt?.slice(0, 19).replace('T', ' ')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Dashboard;
