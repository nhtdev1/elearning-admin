import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Chip,
    Button,
    Stack,
    CircularProgress,
    Card,
    CardContent,
    Divider
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Event as EventIcon,
    Score as ScoreIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Audiotrack as AudioIcon
} from '@mui/icons-material';
import TestService from '../../services/TestService';

const STORAGE_URL = 'http://localhost:8888/storage/files/';

export default function SubmissionDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubmissionDetails();
    }, [id]);

    const fetchSubmissionDetails = async () => {
        try {
            const response = await TestService.getAttemptDetails(id);
            if (response.success || response.isSuccess) {
                setResult(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch submission details", error);
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

    if (!result) {
        return <Typography>Submission not found.</Typography>;
    }

    const { overview } = result;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getFullUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
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
                <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>Audio</Typography>
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

    const renderQuestionStatus = (isCorrect) => {
        return isCorrect ?
            <Chip icon={<CheckCircleIcon />} label="Correct" color="success" size="small" variant="outlined" /> :
            <Chip icon={<CancelIcon />} label="Incorrect" color="error" size="small" variant="outlined" />;
    };

    // Helper to render options with user selection and correct answer highlighting
    const renderOptions = (question, options = ['option1', 'option2', 'option3', 'option4']) => {
        return (
            <Box sx={{ ml: 2, mt: 1 }}>
                {options.map((optKey, idx) => {
                    const optionIndex = idx + 1;
                    const isSelected = question.userAnswer === optionIndex;
                    const isCorrect = question.correctAnswer === optionIndex;

                    let bg = 'transparent';
                    if (isSelected && isCorrect) bg = '#e8f5e9'; // Light green
                    else if (isSelected && !isCorrect) bg = '#ffebee'; // Light red

                    return (
                        <Box key={optKey} sx={{
                            p: 1,
                            borderRadius: 1,
                            bgcolor: bg,
                            border: isSelected ? (isCorrect ? '1px solid #66bb6a' : '1px solid #ef5350') : '1px solid transparent',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }}>
                            <Typography
                                variant="body2"
                                fontWeight={isSelected || isCorrect ? 'bold' : 'normal'}
                                color={isCorrect ? 'success.main' : (isSelected ? 'error.main' : 'text.primary')}
                            >
                                ({getAnswerLabel(optionIndex)}) {question[optKey]}
                            </Typography>
                            {isSelected && <Chip label="Selected" size="small" color={isCorrect ? "success" : "error"} sx={{ height: 20, fontSize: '0.6rem' }} />}
                            {isCorrect && !isSelected && <Chip label="Correct Answer" size="small" color="success" variant="outlined" sx={{ height: 20, fontSize: '0.6rem' }} />}
                        </Box>
                    );
                })}
            </Box>
        );
    };

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', pb: 5 }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                sx={{ mb: 3, color: 'text.secondary' }}
            >
                Back
            </Button>

            {/* Score Overview */}
            <Paper sx={{ p: 4, mb: 4, borderRadius: 3, boxShadow: 3, bgcolor: '#f8fbfc' }}>
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={8}>
                        <Typography variant="h4" fontWeight="800" gutterBottom color="primary.main">
                            Evaluation Result
                        </Typography>
                        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                            <Chip icon={<ScoreIcon />} label={`Total Score: ${overview.totalScore}`} color="primary" sx={{ fontWeight: 'bold' }} />
                            <Chip label={`Listening: ${overview.listeningScore}`} variant="outlined" />
                            <Chip label={`Reading: ${overview.readingScore}`} variant="outlined" />
                            <Chip icon={<EventIcon />} label={formatDate(overview.completedAt)} />
                        </Stack>
                    </Grid>
                </Grid>
            </Paper>

            {/* Part 1 */}
            {result.partOne && result.partOne.length > 0 && (
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Part 1: Photographs</Typography>
                    {result.partOne.map(q => (
                        <Box key={q.id} sx={{ mb: 3, pb: 3, borderBottom: '1px solid #eee' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="subtitle1" fontWeight="bold">Question {q.questionNo}</Typography>
                                {renderQuestionStatus(q.correct)}
                            </Box>
                            {renderImage(q.image)}
                            {renderAudio(q.audio)}
                            <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary', mb: 1 }}>
                                (Transcript should be here if user wants to see)
                            </Typography>
                            <Box sx={{ ml: 2 }}>
                                {renderOptions(q, ['A', 'B', 'C', 'D'].map(l => `Option ${l}`))}
                                {/* Note: Part 1 usually doesn't have text options in DB, just A,B,C,D placeholders. logic might need adjustment if DTO doesn't have text options */}
                            </Box>
                        </Box>
                    ))}
                </Paper>
            )}

            {/* Part 2: Question-Response (Audio only typically) */}
            {result.partTwo && result.partTwo.length > 0 && (
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Part 2: Question-Response</Typography>
                    {result.partTwo.map(q => (
                        <Box key={q.id} sx={{ mb: 2, pb: 2, borderBottom: '1px solid #eee' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="subtitle1" fontWeight="bold">Question {q.questionNo}</Typography>
                                {renderQuestionStatus(q.correct)}
                            </Box>
                            {renderAudio(q.audio)}
                            {/* Part 2 options are usually A,B,C */}
                            <Box sx={{ ml: 2, mt: 1 }}>
                                {[1, 2, 3].map(idx => {
                                    const isSelected = q.userAnswer === idx;
                                    const isCorrect = q.correctAnswer === idx;
                                    return (
                                        <Typography key={idx} variant="body2" color={isCorrect ? 'success.main' : (isSelected ? 'error.main' : 'text.primary')} fontWeight={isSelected || isCorrect ? 'bold' : 'normal'}>
                                            {getAnswerLabel(idx)} {isSelected ? '(Selected)' : ''} {isCorrect ? '(Correct)' : ''}
                                        </Typography>
                                    )
                                })}
                            </Box>
                        </Box>
                    ))}
                </Paper>
            )}

            {/* Part 3 & 4 (Groups) */}
            {[result.partThree, result.partFour].map((part, pIdx) => (
                part && part.length > 0 && (
                    <Paper key={pIdx} sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Part {pIdx + 3}: Conversations/Talks</Typography>
                        {part.map(group => (
                            <Box key={group.id} sx={{ mb: 4, p: 2, bgcolor: '#fafafa', borderRadius: 2 }}>
                                {renderImage(group.image)}
                                {renderAudio(group.audio)}
                                {group.answerList.map(q => (
                                    <Box key={q.id} sx={{ mt: 2, pl: 2, borderLeft: '3px solid #ddd' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="subtitle2" fontWeight="bold">Q{q.questionNo}: {q.questionText}</Typography>
                                            {renderQuestionStatus(q.correct)}
                                        </Box>
                                        {renderOptions(q)}
                                    </Box>
                                ))}
                            </Box>
                        ))}
                    </Paper>
                )
            ))}

            {/* Part 5 */}
            {result.partFive && result.partFive.length > 0 && (
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Part 5: Incomplete Sentences</Typography>
                    {result.partFive.map(q => (
                        <Box key={q.id} sx={{ mb: 2, pb: 2, borderBottom: '1px solid #eee' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body1" fontWeight="bold">Q{q.questionNo}: {q.questionText}</Typography>
                                {renderQuestionStatus(q.correct)}
                            </Box>
                            {renderOptions(q)}
                        </Box>
                    ))}
                </Paper>
            )}

            {/* Part 6 & 7 (Groups) */}
            {[result.partSix, result.partSeven].map((part, pIdx) => (
                part && part.length > 0 && (
                    <Paper key={pIdx} sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Part {pIdx + 6}: Text Completion / Reading</Typography>
                        {part.map(group => (
                            <Box key={group.id} sx={{ mb: 4, p: 2, bgcolor: '#fafafa', borderRadius: 2 }}>
                                {renderImage(group.image)}
                                {group.paragraph && (
                                    <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: '#fff', fontFamily: 'serif' }}>
                                        <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{group.paragraph}</Typography>
                                    </Paper>
                                )}
                                {group.answerList.map(q => (
                                    <Box key={q.id} sx={{ mt: 2, pl: 2, borderLeft: '3px solid #ddd' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="subtitle2" fontWeight="bold">Q{q.questionNo}: {q.questionText}</Typography>
                                            {renderQuestionStatus(q.correct)}
                                        </Box>
                                        {renderOptions(q)}
                                    </Box>
                                ))}
                            </Box>
                        ))}
                    </Paper>
                )
            ))}

        </Box>
    );
}
