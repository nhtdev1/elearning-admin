import { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Chip,
    TablePagination,
    Avatar,
    Stack,
    CircularProgress
} from '@mui/material';
import {
    AssignmentInd as AssignmentIcon,
    AccessTime as TimeIcon,
    Score as ScoreIcon,
    CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import SubmissionService from '../../services/SubmissionService';
import { useNavigate } from 'react-router-dom';

export default function SubmissionsPage() {
    const navigate = useNavigate();
    const [submissions, setSubmissions] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubmissions();
    }, [page, rowsPerPage]);

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const response = await SubmissionService.getAllSubmissions(page, rowsPerPage);
            if (response.success || response.isSuccess) {
                // The backend returns a Page object inside data
                const { content, totalElements } = response.data;
                setSubmissions(content);
                setTotalElements(totalElements);
            }
        } catch (error) {
            console.error("Failed to fetch submissions", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const getScoreColor = (score) => {
        if (score >= 800) return 'success';
        if (score >= 600) return 'primary';
        if (score >= 450) return 'warning';
        return 'error';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Typography variant="h4" fontWeight="800" gutterBottom>
                        Submissions
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        View and manage student test attempts and scores.
                    </Typography>
                </div>
            </Box>

            <Paper sx={{ width: '100%', mb: 2, borderRadius: 3, boxShadow: 2, overflow: 'hidden' }}>
                <TableContainer>
                    <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
                        <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Student</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Test</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Mode</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Date & Time</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Details</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total Score</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : submissions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                        <Typography color="text.secondary">No submissions found.</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                submissions.map((row) => (
                                    <TableRow
                                        hover
                                        role="checkbox"
                                        tabIndex={-1}
                                        key={row.id}
                                        onClick={() => navigate(`/submissions/${row.id}`)}
                                        sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'rgba(37, 99, 235, 0.04)' } }}
                                    >
                                        <TableCell component="th" scope="row">
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light', fontSize: '0.875rem' }}>
                                                    {row.userAttempt?.firstName?.[0] || 'U'}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="subtitle2" fontWeight="600">
                                                        {row.userAttempt?.firstName} {row.userAttempt?.lastName}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {row.userAttempt?.email}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="500">
                                                {row.testAttempt?.testName || 'Unknown Test'}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                ID: {row.testAttempt?.id}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={row.testMode}
                                                size="small"
                                                color={row.testMode === 'FULL_TEST' ? 'secondary' : 'default'}
                                                variant="outlined"
                                                sx={{ borderRadius: 1 }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
                                                <TimeIcon sx={{ fontSize: 16 }} />
                                                <Typography variant="body2">
                                                    {formatDate(row.completedAt)}
                                                </Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="column" spacing={0.5}>
                                                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    Listening: <b>{row.listeningScore}</b>
                                                </Typography>
                                                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    Reading: <b>{row.readingScore}</b>
                                                </Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Chip
                                                icon={<ScoreIcon />}
                                                label={row.totalScore}
                                                color={getScoreColor(row.totalScore)}
                                                sx={{ fontWeight: 'bold', minWidth: 80 }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={totalElements}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </Box>
    );
}
