import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Chip,
    Button,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Divider,
    Stack,
    Card,
    CardContent,
    CircularProgress,
    IconButton
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    ArrowBack as ArrowBackIcon,
    Timer as TimerIcon,
    Group as GroupIcon,
    Event as EventIcon,
    Image as ImageIcon,
    Audiotrack as AudioIcon,
    CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import TestService from '../../services/TestService';

const STORAGE_URL = 'http://localhost:8888/storage/files/';

export default function TestDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [test, setTest] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTestDetails();
    }, [id]);

    const fetchTestDetails = async () => {
        try {
            const response = await TestService.getTest(id);
            if (response.success || response.isSuccess) {
                setTest(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch test details", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!test) {
        return <Typography>Test not found.</Typography>;
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getFullUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        // Ensure we don't double slash or miss slash
        const baseUrl = STORAGE_URL.endsWith('/') ? STORAGE_URL : `${STORAGE_URL}/`;
        const relativePath = path.startsWith('/') ? path.substring(1) : path;
        return `${baseUrl}${relativePath}`;
    };

    const renderAudio = (path) => {
        const url = getFullUrl(path);
        if (!url) return null;
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'action.hover', p: 1, borderRadius: 1, width: 'fit-content', mb: 1 }}>
                <AudioIcon color="primary" fontSize="small" />
                <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                    {/* Try to show filename if possible, else generic text */}
                    Audio File
                </Typography>
                <audio controls src={url} style={{ height: 30 }} />
            </Box>
        );
    };

    const renderImage = (path) => {
        const url = getFullUrl(path);
        if (!url) return null;
        return (
            <Box sx={{ mt: 1, mb: 1, maxWidth: 300, borderRadius: 2, overflow: 'hidden', border: '1px solid #eee' }}>
                <img src={url} alt="Question" style={{ width: '100%', display: 'block' }} />
            </Box>
        );
    };

    const getAnswerLabel = (index) => {
        return ['A', 'B', 'C', 'D'][index - 1] || '?';
    };

    const renderAnswer = (correctAnswerInt) => {
        const label = getAnswerLabel(correctAnswerInt);
        return (
            <Chip
                icon={<CheckCircleIcon />}
                label={`Correct Answer: ${label}`}
                color="success"
                size="small"
                variant="outlined"
                sx={{ mt: 1, fontWeight: 'bold' }}
            />
        );
    };

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', pb: 5 }}>
            {/* Header */}
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/tests')}
                sx={{ mb: 3, color: 'text.secondary' }}
            >
                Back to Tests
            </Button>

            <Paper sx={{ p: 4, mb: 4, borderRadius: 3, boxShadow: 3 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        <Typography variant="h4" fontWeight="800" gutterBottom>
                            {test.testName}
                        </Typography>
                        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                            <Chip icon={<TimerIcon />} label={`${test.timerInMinutes} mins`} />
                            <Chip icon={<GroupIcon />} label={`${test.numOfParticipants} participants`} />
                            <Chip icon={<EventIcon />} label={formatDate(test.startTime)} />
                        </Stack>
                        <Typography variant="body1" color="text.secondary">
                            {test.description}
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>

            {/* Test Content */}
            <Box>
                <Typography variant="h5" fontWeight="700" sx={{ mb: 2 }}>
                    Test Content
                </Typography>

                {/* Part 1 */}
                <Accordion defaultExpanded sx={{ mb: 1, borderRadius: '12px !important', '&:before': { display: 'none' }, boxShadow: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6" fontWeight="600">Part 1: Photographs ({test.partOne?.length || 0})</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={2}>
                            {test.partOne?.map((q) => (
                                <Grid item xs={12} md={6} key={q.id}>
                                    <Card variant="outlined" sx={{ borderRadius: 2 }}>
                                        <CardContent>
                                            <Typography variant="subtitle2" gutterBottom>Question {q.questionNo}</Typography>
                                            {renderImage(q.image)}
                                            {renderAudio(q.audio)}
                                            {renderAnswer(q.correctAnswer)}
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </AccordionDetails>
                </Accordion>

                {/* Part 2 */}
                <Accordion sx={{ mb: 1, borderRadius: '12px !important', '&:before': { display: 'none' }, boxShadow: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6" fontWeight="600">Part 2: Question-Response ({test.partTwo?.length || 0})</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={2}>
                            {test.partTwo?.map((q) => (
                                <Grid item xs={12} md={6} key={q.id}>
                                    <Card variant="outlined" sx={{ borderRadius: 2 }}>
                                        <CardContent>
                                            <Typography variant="subtitle2" gutterBottom>Question {q.questionNo}</Typography>
                                            {renderAudio(q.audio)}
                                            {renderAnswer(q.correctAnswer)}
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </AccordionDetails>
                </Accordion>

                {/* Part 3 */}
                <Accordion sx={{ mb: 1, borderRadius: '12px !important', '&:before': { display: 'none' }, boxShadow: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6" fontWeight="600">Part 3: Conversations ({test.partThree?.length || 0} Sets)</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        {test.partThree?.map((group) => (
                            <Card variant="outlined" sx={{ mb: 2, borderRadius: 2 }} key={group.id}>
                                <CardContent>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle1" fontWeight="bold">Questions {group.questionList[0]?.questionNo}-{group.questionList[group.questionList.length - 1]?.questionNo}</Typography>
                                        {renderAudio(group.audio)}
                                        {renderImage(group.image)}
                                    </Box>
                                    <Divider sx={{ my: 1 }} />
                                    {group.questionList.map(q => (
                                        <Box key={q.id} sx={{ mt: 1, pl: 2, borderLeft: '3px solid #eee' }}>
                                            <Typography variant="body2" fontWeight="600">Q{q.questionNo}: {q.questionText}</Typography>
                                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mt: 0.5, mb: 1 }}>
                                                {['option1', 'option2', 'option3', 'option4'].map((optKey, idx) => (
                                                    <Typography key={optKey} variant="caption"
                                                        color={q.correctAnswer === (idx + 1) ? 'success.main' : 'text.secondary'}
                                                        fontWeight={q.correctAnswer === (idx + 1) ? 'bold' : 'normal'}
                                                    >
                                                        {getAnswerLabel(idx + 1)}. {q[optKey]}
                                                    </Typography>
                                                ))}
                                            </Box>
                                        </Box>
                                    ))}
                                </CardContent>
                            </Card>
                        ))}
                    </AccordionDetails>
                </Accordion>

                {/* Part 4 */}
                <Accordion sx={{ mb: 1, borderRadius: '12px !important', '&:before': { display: 'none' }, boxShadow: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6" fontWeight="600">Part 4: Talks ({test.partFour?.length || 0} Sets)</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        {test.partFour?.map((group) => (
                            <Card variant="outlined" sx={{ mb: 2, borderRadius: 2 }} key={group.id}>
                                <CardContent>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle1" fontWeight="bold">Questions {group.questionList[0]?.questionNo}-{group.questionList[group.questionList.length - 1]?.questionNo}</Typography>
                                        {renderAudio(group.audio)}
                                        {renderImage(group.image)}
                                    </Box>
                                    <Divider sx={{ my: 1 }} />
                                    {group.questionList.map(q => (
                                        <Box key={q.id} sx={{ mt: 1, pl: 2, borderLeft: '3px solid #eee' }}>
                                            <Typography variant="body2" fontWeight="600">Q{q.questionNo}: {q.questionText}</Typography>
                                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mt: 0.5, mb: 1 }}>
                                                {['option1', 'option2', 'option3', 'option4'].map((optKey, idx) => (
                                                    <Typography key={optKey} variant="caption"
                                                        color={q.correctAnswer === (idx + 1) ? 'success.main' : 'text.secondary'}
                                                        fontWeight={q.correctAnswer === (idx + 1) ? 'bold' : 'normal'}
                                                    >
                                                        {getAnswerLabel(idx + 1)}. {q[optKey]}
                                                    </Typography>
                                                ))}
                                            </Box>
                                        </Box>
                                    ))}
                                </CardContent>
                            </Card>
                        ))}
                    </AccordionDetails>
                </Accordion>

                {/* Part 5 */}
                <Accordion sx={{ mb: 1, borderRadius: '12px !important', '&:before': { display: 'none' }, boxShadow: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6" fontWeight="600">Part 5: Incomplete Sentences ({test.partFive?.length || 0})</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={2}>
                            {test.partFive?.map((q) => (
                                <Grid item xs={12} key={q.id}>
                                    <Card variant="outlined" sx={{ borderRadius: 2 }}>
                                        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                                            <Typography variant="body2" fontWeight="600" gutterBottom>Q{q.questionNo}: {q.questionText}</Typography>
                                            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                                                {['option1', 'option2', 'option3', 'option4'].map((optKey, idx) => (
                                                    <Typography key={optKey} variant="caption"
                                                        color={q.correctAnswer === (idx + 1) ? 'success.main' : 'text.secondary'}
                                                        fontWeight={q.correctAnswer === (idx + 1) ? 'bold' : 'normal'}
                                                    >
                                                        {getAnswerLabel(idx + 1)}. {q[optKey]}
                                                    </Typography>
                                                ))}
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </AccordionDetails>
                </Accordion>

                {/* Part 6 */}
                <Accordion sx={{ mb: 1, borderRadius: '12px !important', '&:before': { display: 'none' }, boxShadow: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6" fontWeight="600">Part 6: Text Completion ({test.partSix?.length || 0} Sets)</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        {test.partSix?.map((group) => (
                            <Card variant="outlined" sx={{ mb: 2, borderRadius: 2 }} key={group.id}>
                                <CardContent>
                                    <Box sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                                        <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{group.paragraph}</Typography>
                                    </Box>
                                    <Divider sx={{ my: 1 }} />
                                    {group.questionList.map(q => (
                                        <Box key={q.id} sx={{ mt: 1, pl: 2, borderLeft: '3px solid #eee' }}>
                                            <Typography variant="body2" fontWeight="600">Q{q.questionNo}: {q.questionText}</Typography>
                                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mt: 0.5, mb: 1 }}>
                                                {['option1', 'option2', 'option3', 'option4'].map((optKey, idx) => (
                                                    <Typography key={optKey} variant="caption"
                                                        color={q.correctAnswer === (idx + 1) ? 'success.main' : 'text.secondary'}
                                                        fontWeight={q.correctAnswer === (idx + 1) ? 'bold' : 'normal'}
                                                    >
                                                        {getAnswerLabel(idx + 1)}. {q[optKey]}
                                                    </Typography>
                                                ))}
                                            </Box>
                                        </Box>
                                    ))}
                                </CardContent>
                            </Card>
                        ))}
                    </AccordionDetails>
                </Accordion>

                {/* Part 7 */}
                <Accordion sx={{ mb: 1, borderRadius: '12px !important', '&:before': { display: 'none' }, boxShadow: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6" fontWeight="600">Part 7: Reading Comprehension ({test.partSeven?.length || 0} Sets)</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        {test.partSeven?.map((group) => (
                            <Card variant="outlined" sx={{ mb: 2, borderRadius: 2 }} key={group.id}>
                                <CardContent>
                                    <Box sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 2, maxHeight: 300, overflow: 'auto' }}>
                                        {renderImage(group.image)}
                                        <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{group.paragraph}</Typography>
                                    </Box>
                                    <Divider sx={{ my: 1 }} />
                                    {group.questionList.map(q => (
                                        <Box key={q.id} sx={{ mt: 1, pl: 2, borderLeft: '3px solid #eee' }}>
                                            <Typography variant="body2" fontWeight="600">Q{q.questionNo}: {q.questionText}</Typography>
                                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mt: 0.5, mb: 1 }}>
                                                {['option1', 'option2', 'option3', 'option4'].map((optKey, idx) => (
                                                    <Typography key={optKey} variant="caption"
                                                        color={q.correctAnswer === (idx + 1) ? 'success.main' : 'text.secondary'}
                                                        fontWeight={q.correctAnswer === (idx + 1) ? 'bold' : 'normal'}
                                                    >
                                                        {getAnswerLabel(idx + 1)}. {q[optKey]}
                                                    </Typography>
                                                ))}
                                            </Box>
                                        </Box>
                                    ))}
                                </CardContent>
                            </Card>
                        ))}
                    </AccordionDetails>
                </Accordion>

            </Box>
        </Box>
    );
}
