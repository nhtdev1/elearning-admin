import { forwardRef } from 'react';
import {
    Box,
    Typography,
    Grid,
    Divider,
    Card,
    CardContent
} from '@mui/material';

const STORAGE_URL = 'http://localhost:8888/storage/files/';

const TestPaper = forwardRef(({ test }, ref) => {
    if (!test) return null;

    const getFullUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        const baseUrl = STORAGE_URL.endsWith('/') ? STORAGE_URL : `${STORAGE_URL}/`;
        const relativePath = path.startsWith('/') ? path.substring(1) : path;
        return `${baseUrl}${relativePath}`;
    };

    const renderImage = (path) => {
        const url = getFullUrl(path);
        if (!url) return null;
        return (
            <Box sx={{ mt: 1, mb: 1, maxWidth: '100%', maxHeight: 300, overflow: 'hidden', border: '1px solid #ccc' }}>
                <img src={url} alt="Question" style={{ maxWidth: '100%', maxHeight: '300px', display: 'block', margin: '0 auto' }} />
            </Box>
        );
    };

    const renderAudioPlaceholder = (path) => {
        if (!path) return null;
        return (
            <Typography variant="caption" sx={{ display: 'block', fontFamily: 'monospace', mb: 1, color: '#666', border: '1px dashed #ccc', p: 0.5, width: 'fit-content' }}>
                [Audio Track]
            </Typography>
        );
    };

    const getAnswerLabel = (index) => {
        return ['A', 'B', 'C', 'D'][index - 1] || '?';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    // Styles for printing
    const pageStyle = `
        @page {
            size: A4;
            margin: 20mm;
        }
        @media print {
            body {
                -webkit-print-color-adjust: exact;
            }
            .page-break {
                page-break-after: always;
            }
            .avoid-break {
                page-break-inside: avoid;
            }
        }
    `;

    return (
        <div ref={ref} style={{ padding: '20px', fontFamily: '"Times New Roman", Times, serif', color: '#000', backgroundColor: '#fff' }}>
            <style>{pageStyle}</style>

            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4, borderBottom: '2px solid #000', pb: 2 }}>
                <Typography variant="h4" fontWeight="bold" sx={{ textTransform: 'uppercase' }}>
                    {test.testName}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                    Duration: {test.timerInMinutes} minutes | Total Questions: {
                        (test.partOne?.length || 0) + (test.partTwo?.length || 0) +
                        (test.partThree?.reduce((acc, g) => acc + g.questionList.length, 0) || 0) +
                        (test.partFour?.reduce((acc, g) => acc + g.questionList.length, 0) || 0) +
                        (test.partFive?.length || 0) +
                        (test.partSix?.reduce((acc, g) => acc + g.questionList.length, 0) || 0) +
                        (test.partSeven?.reduce((acc, g) => acc + g.questionList.length, 0) || 0)
                    }
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Printed on: {new Date().toLocaleDateString()}
                </Typography>
            </Box>

            <Box>
                {/* Part 1 */}
                {test.partOne && test.partOne.length > 0 && (
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ textTransform: 'uppercase', mb: 2 }}>Part 1: Photographs</Typography>
                        <Grid container spacing={2}>
                            {test.partOne.map((q) => (
                                <Grid item xs={6} key={q.id} className="avoid-break">
                                    <Box sx={{ border: '1px solid #ccc', p: 2, height: '100%' }}>
                                        <Typography variant="subtitle2" fontWeight="bold">Question {q.questionNo}</Typography>
                                        {renderImage(q.image)}
                                        {renderAudioPlaceholder(q.audio)}
                                        <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>(Listen to the audio to answer)</Typography>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}

                {/* Part 2 */}
                {test.partTwo && test.partTwo.length > 0 && (
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ textTransform: 'uppercase', mb: 2 }}>Part 2: Question-Response</Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>(Listen to the audio to answer)</Typography>
                        <Grid container spacing={2}>
                            {test.partTwo.map((q) => (
                                <Grid item xs={12} sm={6} md={4} key={q.id} className="avoid-break">
                                    <Box sx={{ mb: 1 }}>
                                        <Typography variant="body2" fontWeight="bold">Question {q.questionNo}</Typography>
                                        {renderAudioPlaceholder(q.audio)}
                                        <Box sx={{ ml: 2, mt: 1 }}>
                                            <Typography variant="body2">[ ] A  [ ] B  [ ] C</Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}

                {/* Part 3 */}
                {test.partThree && test.partThree.length > 0 && (
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ textTransform: 'uppercase', mb: 2 }}>Part 3: Conversations</Typography>
                        {test.partThree.map((group) => (
                            <Box key={group.id} sx={{ mb: 3 }} className="avoid-break">
                                <Box sx={{ mb: 1, bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
                                    <Typography variant="subtitle2" fontWeight="bold">Questions {group.questionList[0]?.questionNo}-{group.questionList[group.questionList.length - 1]?.questionNo}</Typography>
                                    {renderAudioPlaceholder(group.audio)}
                                    {renderImage(group.image)}
                                </Box>
                                {group.questionList.map(q => (
                                    <Box key={q.id} sx={{ mt: 1, pl: 2, mb: 2 }}>
                                        <Typography variant="body2" fontWeight="bold">Q{q.questionNo}: {q.questionText}</Typography>
                                        <Box sx={{ ml: 2, mt: 0.5 }}>
                                            {['option1', 'option2', 'option3', 'option4'].map((optKey, idx) => (
                                                <Typography key={optKey} variant="body2" sx={{ mb: 0.5 }}>
                                                    ({getAnswerLabel(idx + 1)}) {q[optKey]}
                                                </Typography>
                                            ))}
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        ))}
                    </Box>
                )}

                {/* Part 4 */}
                {test.partFour && test.partFour.length > 0 && (
                    <Box sx={{ mb: 4 }}>
                        <div className="page-break"></div>
                        <Typography variant="h6" fontWeight="bold" sx={{ textTransform: 'uppercase', mb: 2 }}>Part 4: Talks</Typography>
                        {test.partFour.map((group) => (
                            <Box key={group.id} sx={{ mb: 3 }} className="avoid-break">
                                <Box sx={{ mb: 1, bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
                                    <Typography variant="subtitle2" fontWeight="bold">Questions {group.questionList[0]?.questionNo}-{group.questionList[group.questionList.length - 1]?.questionNo}</Typography>
                                    {renderAudioPlaceholder(group.audio)}
                                    {renderImage(group.image)}
                                </Box>
                                {group.questionList.map(q => (
                                    <Box key={q.id} sx={{ mt: 1, pl: 2, mb: 2 }}>
                                        <Typography variant="body2" fontWeight="bold">Q{q.questionNo}: {q.questionText}</Typography>
                                        <Box sx={{ ml: 2, mt: 0.5 }}>
                                            {['option1', 'option2', 'option3', 'option4'].map((optKey, idx) => (
                                                <Typography key={optKey} variant="body2" sx={{ mb: 0.5 }}>
                                                    ({getAnswerLabel(idx + 1)}) {q[optKey]}
                                                </Typography>
                                            ))}
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        ))}
                    </Box>
                )}

                {/* Part 5 */}
                {test.partFive && test.partFive.length > 0 && (
                    <Box sx={{ mb: 4 }}>
                        <div className="page-break"></div>
                        <Typography variant="h6" fontWeight="bold" sx={{ textTransform: 'uppercase', mb: 2 }}>Part 5: Incomplete Sentences</Typography>
                        {test.partFive.map((q) => (
                            <Box key={q.id} sx={{ mb: 2 }} className="avoid-break">
                                <Typography variant="body2" fontWeight="bold" gutterBottom>Q{q.questionNo}: {q.questionText}</Typography>
                                <Box sx={{ ml: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                    {['option1', 'option2', 'option3', 'option4'].map((optKey, idx) => (
                                        <Typography key={optKey} variant="body2">
                                            ({getAnswerLabel(idx + 1)}) {q[optKey]}
                                        </Typography>
                                    ))}
                                </Box>
                            </Box>
                        ))}
                    </Box>
                )}

                {/* Part 6 */}
                {test.partSix && test.partSix.length > 0 && (
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ textTransform: 'uppercase', mb: 2 }}>Part 6: Text Completion</Typography>
                        {test.partSix.map((group) => (
                            <Box key={group.id} sx={{ mb: 4, border: '1px solid #eee', p: 2 }} className="avoid-break">
                                <Box sx={{ mb: 2, p: 2, bgcolor: '#f9f9f9', fontFamily: 'serif', whiteSpace: 'pre-line' }}>
                                    {group.paragraph}
                                </Box>
                                {group.questionList.map(q => (
                                    <Box key={q.id} sx={{ mt: 1, pl: 2, mb: 1 }}>
                                        <Typography variant="body2" fontWeight="bold">Q{q.questionNo}: {q.questionText}</Typography>
                                        <Box sx={{ ml: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                            {['option1', 'option2', 'option3', 'option4'].map((optKey, idx) => (
                                                <Typography key={optKey} variant="body2">
                                                    ({getAnswerLabel(idx + 1)}) {q[optKey]}
                                                </Typography>
                                            ))}
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        ))}
                    </Box>
                )}

                {/* Part 7 */}
                {test.partSeven && test.partSeven.length > 0 && (
                    <Box sx={{ mb: 4 }}>
                        <div className="page-break"></div>
                        <Typography variant="h6" fontWeight="bold" sx={{ textTransform: 'uppercase', mb: 2 }}>Part 7: Reading Comprehension</Typography>
                        {test.partSeven.map((group) => (
                            <Box key={group.id} sx={{ mb: 4, border: '1px solid #eee', p: 2 }} className="avoid-break">
                                <Box sx={{ mb: 2, p: 2, bgcolor: '#f9f9f9' }}>
                                    {renderImage(group.image)}
                                    <Typography variant="body2" sx={{ fontFamily: 'serif', whiteSpace: 'pre-line' }}>{group.paragraph}</Typography>
                                </Box>
                                {group.questionList.map(q => (
                                    <Box key={q.id} sx={{ mt: 1, pl: 2, mb: 1 }}>
                                        <Typography variant="body2" fontWeight="bold">Q{q.questionNo}: {q.questionText}</Typography>
                                        <Box sx={{ ml: 2 }}>
                                            {['option1', 'option2', 'option3', 'option4'].map((optKey, idx) => (
                                                <Typography key={optKey} variant="body2" sx={{ mb: 0.5 }}>
                                                    ({getAnswerLabel(idx + 1)}) {q[optKey]}
                                                </Typography>
                                            ))}
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        ))}
                    </Box>
                )}
            </Box>
        </div>
    );
});

TestPaper.displayName = 'TestPaper';
export default TestPaper;
