import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Typography,
  CircularProgress,
  TablePagination,
  IconButton,
  Tooltip,
  Collapse,
  Alert,
  Grid,
  TextField,
  InputAdornment,
  TableSortLabel,
  Stack,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { positionService } from '@/services/cv-sharing';
import { MatchedCVResponse } from '@/types/cv-sharing';

interface BestCandidatesDialogProps {
  open: boolean;
  onClose: () => void;
  positionId: string;
}

type SortField = 'name' | 'email' | 'experienceYears' | 'matchScore' | 'matchLevel';
type SortDirection = 'asc' | 'desc';

const BestCandidatesDialog: React.FC<BestCandidatesDialogProps> = ({
  open,
  onClose,
  positionId
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('matchScore');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const { data, isPending, error } = useQuery({
    queryKey: ['position-match-all-cvs', positionId],
    queryFn: () => positionService.matchAllCVsForPosition(positionId, 0, 1000), // Get all for client-side filtering/sorting
    enabled: open && !!positionId
  });

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const toggleRowExpansion = (poolCvId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(poolCvId)) {
      newExpanded.delete(poolCvId);
    } else {
      newExpanded.add(poolCvId);
    }
    setExpandedRows(newExpanded);
  };

  const getMatchLevelColor = (level?: string) => {
    switch (level) {
      case 'EXCELLENT':
        return 'success';
      case 'GOOD':
        return 'info';
      case 'FAIR':
        return 'warning';
      case 'POOR':
        return 'error';
      default:
        return 'default';
    }
  };

  const getMatchLevelLabel = (level?: string): string => {
    if (!level) return '-';
    const levelKey = level.toLowerCase();
    // Direct translation with fallback
    const translationKey = `position.matchLevel.${levelKey}`;
    const translated = t(translationKey, { defaultValue: level });
    
    // If translation returns an object (shouldn't happen but safety check)
    if (typeof translated === 'object') {
      const fallbackMap: Record<string, string> = {
        'excellent': 'Excellent',
        'good': 'Good',
        'fair': 'Fair',
        'poor': 'Poor'
      };
      return fallbackMap[levelKey] || level;
    }
    
    return translated;
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'default';
    if (score >= 80) return 'success';
    if (score >= 60) return 'info';
    if (score >= 40) return 'warning';
    return 'error';
  };

  const formatScore = (score?: number) => {
    if (score === undefined || score === null) return '-';
    return `${score}%`;
  };

  const formatBreakdownScore = (score?: number) => {
    if (score === undefined || score === null) return '-';
    return `${Math.round(score * 100)}%`;
  };

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    if (!data?.content) return [];

    let filtered = data.content.filter((match: MatchedCVResponse) => {
      const poolCV = match.poolCV;
      const fullName = `${poolCV.firstName} ${poolCV.lastName}`.toLowerCase();
      const email = poolCV.email?.toLowerCase() || '';
      const query = searchQuery.toLowerCase();

      return fullName.includes(query) || email.includes(query);
    });

    // Sort
    filtered.sort((a: MatchedCVResponse, b: MatchedCVResponse) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = `${a.poolCV.firstName} ${a.poolCV.lastName}`.toLowerCase();
          bValue = `${b.poolCV.firstName} ${b.poolCV.lastName}`.toLowerCase();
          break;
        case 'email':
          aValue = a.poolCV.email?.toLowerCase() || '';
          bValue = b.poolCV.email?.toLowerCase() || '';
          break;
        case 'experienceYears':
          aValue = a.poolCV.experienceYears ?? 0;
          bValue = b.poolCV.experienceYears ?? 0;
          break;
        case 'matchScore':
          aValue = a.matchScore ?? 0;
          bValue = b.matchScore ?? 0;
          break;
        case 'matchLevel':
          const levelOrder = { EXCELLENT: 4, GOOD: 3, FAIR: 2, POOR: 1 };
          aValue = levelOrder[a.matchLevel as keyof typeof levelOrder] ?? 0;
          bValue = levelOrder[b.matchLevel as keyof typeof levelOrder] ?? 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [data?.content, searchQuery, sortField, sortDirection]);

  // Paginate
  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredAndSortedData.slice(start, end);
  }, [filteredAndSortedData, page, rowsPerPage]);

  const SortableHeader: React.FC<{ field: SortField; children: React.ReactNode }> = ({ field, children }) => (
    <TableCell>
      <TableSortLabel
        active={sortField === field}
        direction={sortField === field ? sortDirection : 'asc'}
        onClick={() => handleSort(field)}
        IconComponent={() => (
          <Box sx={{ display: 'flex', flexDirection: 'column', ml: 0.5 }}>
            <ArrowUpwardIcon
              sx={{
                fontSize: 12,
                opacity: sortField === field && sortDirection === 'asc' ? 1 : 0.3,
                mb: -0.5
              }}
            />
            <ArrowDownwardIcon
              sx={{
                fontSize: 12,
                opacity: sortField === field && sortDirection === 'desc' ? 1 : 0.3
              }}
            />
          </Box>
        )}
      >
        {children}
      </TableSortLabel>
    </TableCell>
  );

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xl" 
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '90vh',
          height: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{t('position.bestCandidates')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {filteredAndSortedData.length} {filteredAndSortedData.length === 1 ? t('common.candidates') : t('common.candidates_plural')}
          </Typography>
        </Stack>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Search and Filters */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <TextField
            fullWidth
            size="small"
            placeholder={t('common.search')}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              )
            }}
          />
        </Box>

        {/* Table Container */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {isPending && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ m: 2 }}>
              {t('error.loadFailed')}
            </Alert>
          )}

          {!isPending && !error && (
            <TableContainer>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell width="5%"></TableCell>
                    <SortableHeader field="name">{t('poolCV.fullName')}</SortableHeader>
                    <SortableHeader field="email">{t('poolCV.email')}</SortableHeader>
                    <SortableHeader field="experienceYears">{t('poolCV.experienceYears')}</SortableHeader>
                    <SortableHeader field="matchScore">{t('position.matchScore')}</SortableHeader>
                    <SortableHeader field="matchLevel">{t('position.matchLevelLabel')}</SortableHeader>
                    <TableCell sx={{ minWidth: 250 }}>{t('position.recommendation')}</TableCell>
                    <TableCell align="center" width="80">{t('common.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          {searchQuery ? t('common.noResults') : t('position.noCandidatesFound')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((match: MatchedCVResponse) => {
                      const poolCV = match.poolCV;
                      const poolCvId = poolCV.id;
                      const isExpanded = expandedRows.has(poolCvId);
                      const fullName = `${poolCV.firstName} ${poolCV.lastName}`;

                      return (
                        <React.Fragment key={poolCvId}>
                          <TableRow hover>
                            <TableCell>
                              <IconButton
                                size="small"
                                onClick={() => toggleRowExpansion(poolCvId)}
                              >
                                {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                              </IconButton>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={500}>
                                {fullName}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {poolCV.email}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {poolCV.experienceYears !== null && poolCV.experienceYears !== undefined
                                ? `${poolCV.experienceYears} ${t('common.years')}`
                                : '-'}
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={formatScore(match.matchScore)}
                                color={getScoreColor(match.matchScore) as any}
                                size="small"
                                sx={{ fontWeight: 600 }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              {match.matchLevel ? (
                                <Chip
                                  label={getMatchLevelLabel(match.matchLevel)}
                                  color={getMatchLevelColor(match.matchLevel) as any}
                                  size="small"
                                />
                              ) : (
                                '-'
                              )}
                            </TableCell>
                            <TableCell>
                              <Tooltip title={match.recommendation || '-'} arrow>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    maxWidth: 300
                                  }}
                                >
                                  {match.recommendation || '-'}
                                </Typography>
                              </Tooltip>
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title={t('common.view')}>
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    navigate(`/cv-sharing/pool-cvs/${poolCvId}`);
                                    onClose();
                                  }}
                                >
                                  <ViewIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell colSpan={8} sx={{ py: 0, border: 0 }}>
                              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                <Card variant="outlined" sx={{ m: 1, bgcolor: 'background.default' }}>
                                  <CardContent>
                                    <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                                      {t('position.detailedAnalysis')}
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />
                                    {match.breakdown && (
                                      <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6} md={4}>
                                          <Box>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                              {t('position.skillsScore')}
                                            </Typography>
                                            <Typography variant="h6" color="primary">
                                              {formatBreakdownScore(match.breakdown.skillsScore)}
                                            </Typography>
                                          </Box>
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={4}>
                                          <Box>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                              {t('position.experienceScore')}
                                            </Typography>
                                            <Typography variant="h6" color="primary">
                                              {formatBreakdownScore(match.breakdown.experienceScore)}
                                            </Typography>
                                          </Box>
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={4}>
                                          <Box>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                              {t('position.languageScore')}
                                            </Typography>
                                            <Typography variant="h6" color="primary">
                                              {formatBreakdownScore(match.breakdown.languageScore)}
                                            </Typography>
                                          </Box>
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={4}>
                                          <Box>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                              {t('position.educationScore')}
                                            </Typography>
                                            <Typography variant="h6" color="primary">
                                              {formatBreakdownScore(match.breakdown.educationScore)}
                                            </Typography>
                                          </Box>
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={4}>
                                          <Box>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                              {t('position.locationScore')}
                                            </Typography>
                                            <Typography variant="h6" color="primary">
                                              {formatBreakdownScore(match.breakdown.locationScore)}
                                            </Typography>
                                          </Box>
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={4}>
                                          <Box>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                              {t('position.salaryScore')}
                                            </Typography>
                                            <Typography variant="h6" color="primary">
                                              {formatBreakdownScore(match.breakdown.salaryScore)}
                                            </Typography>
                                          </Box>
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={4}>
                                          <Box>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                              {t('position.semanticScore')}
                                            </Typography>
                                            <Typography variant="h6" color="primary">
                                              {formatBreakdownScore(match.breakdown.semanticScore)}
                                            </Typography>
                                          </Box>
                                        </Grid>
                                      </Grid>
                                    )}
                                    {match.matchedSkills && match.matchedSkills.length > 0 && (
                                      <Box sx={{ mt: 3 }}>
                                        <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                                          {t('position.matchedSkills')}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                                          {match.matchedSkills.map((skill, idx) => (
                                            <Chip key={idx} label={skill} size="small" color="success" variant="outlined" />
                                          ))}
                                        </Box>
                                      </Box>
                                    )}
                                    {match.missingRequiredSkills && match.missingRequiredSkills.length > 0 && (
                                      <Box sx={{ mt: 2 }}>
                                        <Typography variant="subtitle2" gutterBottom fontWeight={600} color="error">
                                          {t('position.missingRequiredSkills')}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                                          {match.missingRequiredSkills.map((skill, idx) => (
                                            <Chip key={idx} label={skill} size="small" color="error" />
                                          ))}
                                        </Box>
                                      </Box>
                                    )}
                                  </CardContent>
                                </Card>
                              </Collapse>
                            </TableCell>
                          </TableRow>
                        </React.Fragment>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>

        {/* Pagination */}
        {!isPending && !error && filteredAndSortedData.length > 0 && (
          <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
            <TablePagination
              component="div"
              count={filteredAndSortedData.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[10, 20, 50, 100]}
              labelRowsPerPage={t('common.rowsPerPage')}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 2, py: 1.5, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={onClose} variant="contained">{t('common.close')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default BestCandidatesDialog;
