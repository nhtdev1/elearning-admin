import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Grid,
    Divider,
    IconButton,
    Paper,
    InputAdornment
} from '@mui/material';
import {
    CloudUpload as CloudUploadIcon,
    Close as CloseIcon,
    Image as ImageIcon,
    Headphones as AudioIcon,
    CheckCircle as CheckCircleIcon,
    SentimentVerySatisfied as VeryEasyIcon,
    SentimentSatisfied as EasyIcon,
    SentimentNeutral as MediumIcon,
    SentimentDissatisfied as HardIcon,
    SentimentVeryDissatisfied as VeryHardIcon
} from '@mui/icons-material';
import StorageService from '../../services/StorageService';
import { blue, green, orange, red } from '@mui/material/colors';

const DIFFICULTY_CONFIG = {
    'VERY_EASY': { label: 'Very Easy', color: green[500], icon: <VeryEasyIcon /> },
    'EASY': { label: 'Easy', color: blue[500], icon: <EasyIcon /> },
    'INTERMEDIATE': { label: 'Intermediate', color: orange[500], icon: <MediumIcon /> },
    'HARD': { label: 'Hard', color: red[400], icon: <HardIcon /> },
    'VERY_HARD': { label: 'Very Hard', color: red[800], icon: <VeryHardIcon /> }
};

export default function TestPartDialog({ open, onClose, partType, onSave, initialData, suggestedQuestionNo }) {
    const [formData, setFormData] = useState({});
    const [files, setFiles] = useState({ audio: null, image: null });
    const [transcripts, setTranscripts] = useState({ A: '', B: '', C: '', D: '' });

    useEffect(() => {
        if (open) {
            if (initialData) {
                // If Part 3 or Part 4, structure might be different or we need to map it back
                // If Part 3, 4, 6, 7 structure might be different or we need to map it back
                if (['part-three', 'part-four', 'part-six', 'part-seven'].includes(partType)) {
                    // Default question count: 3 for Part 3/4, 4 for Part 6, 5 or user defined for Part 7
                    let defaultCount = 3;
                    if (partType === 'part-six') defaultCount = 4;
                    if (partType === 'part-seven') defaultCount = 2; // Default to 2 for Part 7

                    const defaultQuestions = Array(defaultCount).fill().map(() => createEmptyQuestion());

                    setFormData({
                        ...initialData,
                        questionsList: initialData.questionsList || initialData.questionList || defaultQuestions
                    });
                } else {
                    setFormData({
                        ...initialData,
                        difficultyLevel: initialData.difficultyLevel || 'INTERMEDIATE',
                        correctAnswer: initialData.correctAnswer || 1
                    });
                }
                setFiles({ audio: null, image: null });

                // Handle Part 1/2 Transcripts for auto-generation
                if ((partType === 'part-one' || partType === 'part-two') && initialData.explanationAnswer) {
                    const text = initialData.explanationAnswer;
                    const newTranscripts = { A: '', B: '', C: '', D: '' };
                    const matchA = text.match(/<p>\(A\) (.*?)<\/p>/);
                    const matchB = text.match(/<p>\(B\) (.*?)<\/p>/);
                    const matchC = text.match(/<p>\(C\) (.*?)<\/p>/);

                    if (matchA) newTranscripts.A = matchA[1];
                    if (matchB) newTranscripts.B = matchB[1];
                    if (matchC) newTranscripts.C = matchC[1];

                    if (partType === 'part-one') {
                        const matchD = text.match(/<p>\(D\) (.*?)<\/p>/);
                        if (matchD) newTranscripts.D = matchD[1];
                    }
                    setTranscripts(newTranscripts);
                } else {
                    setTranscripts({ A: '', B: '', C: '', D: '' });
                }
            } else {
                // Reset for new entry
                setFormData(getInitialFormData(partType));
                setFiles({ audio: null, image: null });
                setTranscripts({ A: '', B: '', C: '', D: '' });
            }
        }
    }, [open, partType, initialData]);

    const createEmptyQuestion = () => ({
        questionText: '',
        option1: '',
        option2: '',
        option3: '',
        option4: '',
        correctAnswer: 1,
        explanationAnswer: '',
        difficultyLevel: 'INTERMEDIATE',
        audioDuration: 0
    });

    const getInitialFormData = (type) => {
        const base = {
            questionNo: 0,
            correctAnswer: 1,
            explanationAnswer: '',
            difficultyLevel: 'INTERMEDIATE',
        };

        if (type === 'part-three' || type === 'part-four') {
            return {
                questionNo: 0,
                transcript: '',
                vietnameseTranscript: '',
                questionsList: [
                    createEmptyQuestion(),
                    createEmptyQuestion(),
                    createEmptyQuestion()
                ]
            };
        }

        if (['part-one', 'part-two', 'part-five'].includes(type)) {
            if (type === 'part-five') {
                return { ...base, questionText: '', option1: '', option2: '', option3: '', option4: '' };
            }
            return base;
        }

        if (type === 'part-six') {
            return {
                questionNo: 0,
                passageText: '',
                inVietnamese: '',
                passageType: 'Text',
                questionsList: [
                    createEmptyQuestion(),
                    createEmptyQuestion(),
                    createEmptyQuestion(),
                    createEmptyQuestion()
                ]
            };
        }

        if (type === 'part-seven') {
            return {
                questionNo: 0,
                numOfPassages: 1,
                passageText: '',
                inVietnamese: '',
                passageType: 'Single Passage',
                questionsList: [
                    createEmptyQuestion(),
                    createEmptyQuestion()
                ]
            };
        }

        return base;
    };

    // Auto-update explanation for Part 1/2
    useEffect(() => {
        if (partType === 'part-one' || partType === 'part-two') {
            const { A, B, C, D } = transcripts;
            if (A || B || C || (partType === 'part-one' && D)) {
                let html = `<p>(A) ${A || '...'}</p>\n<p>(B) ${B || '...'}</p>\n<p>(C) ${C || '...'}</p>`;
                if (partType === 'part-one') html += `\n<p>(D) ${D || '...'}</p>`;
                setFormData(prev => ({ ...prev, explanationAnswer: html }));
            }
        }
    }, [transcripts, partType]);

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleQuestionChange = (index, field, value) => {
        const updatedList = [...formData.questionsList];
        updatedList[index] = { ...updatedList[index], [field]: value };
        setFormData({ ...formData, questionsList: updatedList });
    };

    const handleTranscriptChange = (key, value) => {
        setTranscripts(prev => ({ ...prev, [key]: value }));
    };

    const handleFileChange = (field, event) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setFiles({ ...files, [field]: file });
            if (field === 'audio') {
                const audio = new Audio(URL.createObjectURL(file));
                audio.onloadedmetadata = () => {
                    // For Part 3/4, we don't strictly need duration on the parent DTO usually, 
                    // but can store it if needed.
                    setFormData(prev => ({ ...prev, audioDuration: Math.round(audio.duration) }));
                    URL.revokeObjectURL(audio.src);
                };
            }
        }
    };

    const handleSubmit = async () => {
        let updatedFormData = { ...formData }; // clone

        try {
            // Upload Audio
            if (files.audio) {
                const audioResponse = await StorageService.uploadFile(files.audio);
                if (audioResponse?.data?.id) updatedFormData.audio = audioResponse.data.id;
            }
            // Upload Image (Only if files.image is set, effectively skipped for Part 4 if UI doesn't allow it)
            if (files.image) {
                const imageResponse = await StorageService.uploadFile(files.image);
                if (imageResponse?.data?.id) updatedFormData.image = imageResponse.data.id;
            }

            // For Part 3/4, we are sending the structure as is (updatedFormData now has audio/image IDs)
            onSave(partType, updatedFormData, null);
        } catch (error) {
            console.error("File upload failed", error);
            alert("Failed to upload files. Please try again.");
        }
    };

    const renderFileUpload = (type, label) => {
        // Determine preview URL
        let previewUrl = null;
        if (files[type]) {
            previewUrl = URL.createObjectURL(files[type]);
        } else if (formData[type]) {
            previewUrl = formData[type].startsWith('http') ? formData[type] : `http://localhost:8888/storage/files/${formData[type]}`;
        } else if (initialData && initialData[type]) {
            previewUrl = initialData[type].startsWith('http') ? initialData[type] : `http://localhost:8888/storage/files/${initialData[type]}`;
        }

        return (
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2, display: 'flex', flexDirection: 'column', gap: 1, bgcolor: 'background.paper' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />} size="small">
                        {(formData[type] || files[type]) ? 'Change' : 'Upload'} {label}
                        <input type="file" hidden accept={`${type}/*`} onChange={(e) => handleFileChange(type, e)} />
                    </Button>
                    <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
                        {files[type] ? files[type].name : (formData[type] ? 'Existing file' : 'No file selected')}
                    </Typography>
                </Box>
                {previewUrl && (
                    <Box sx={{ mt: 1, p: 1, bgcolor: '#f5f5f5', borderRadius: 1, textAlign: 'center' }}>
                        <Typography variant="caption" display="block" sx={{ mb: 1, color: 'text.secondary' }}>Preview</Typography>
                        {type === 'image' ? (
                            <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: 150, objectFit: 'contain' }} />
                        ) : (
                            <audio controls src={previewUrl} style={{ width: '100%' }}>Your browser does not support the audio element.</audio>
                        )}
                    </Box>
                )}
            </Box>
        );
    };

    const renderCommonFields = (data, onChangePrefix, isSubQuestion = false, showDifficulty = true) => (
        <Grid container spacing={3}>
            {/* Answer & Explanation Fields */}
            <Grid item xs={12} md={6}>
                <FormControl fullWidth size={isSubQuestion ? 'small' : 'medium'}>
                    <InputLabel>Correct Answer</InputLabel>
                    <Select
                        value={data.correctAnswer || 1}
                        label="Correct Answer"
                        onChange={(e) => isSubQuestion
                            ? handleQuestionChange(onChangePrefix, 'correctAnswer', parseInt(e.target.value))
                            : handleChange('correctAnswer', parseInt(e.target.value))
                        }
                    >
                        {(partType === 'part-two' ? [1, 2, 3] : [1, 2, 3, 4]).map(i => (
                            <MenuItem key={i} value={i}>Option {['A', 'B', 'C', 'D'][i - 1]}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            {/* Transcript Builder (Part 1/2 only) */}
            {!isSubQuestion && (partType === 'part-one' || partType === 'part-two') && (
                <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>Transcript</Typography>
                    <Grid container spacing={2}>
                        {['A', 'B', 'C'].concat(partType === 'part-one' ? ['D'] : []).map((opt) => (
                            <Grid item xs={12} sm={6} key={opt}>
                                <TextField label={`Option (${opt})`} fullWidth size="small" value={transcripts[opt]} onChange={(e) => handleTranscriptChange(opt, e.target.value)} />
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
            )}
            <Grid item xs={12}>
                <TextField
                    label="Explanation"
                    fullWidth
                    multiline
                    rows={isSubQuestion ? 2 : 4}
                    size={isSubQuestion ? 'small' : 'medium'}
                    value={data.explanationAnswer || ''}
                    onChange={(e) => isSubQuestion
                        ? handleQuestionChange(onChangePrefix, 'explanationAnswer', e.target.value)
                        : handleChange('explanationAnswer', e.target.value)
                    }
                />
            </Grid>
            {/* Difficulty */}
            {showDifficulty && (
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth size={isSubQuestion ? 'small' : 'medium'}>
                        <InputLabel>Difficulty</InputLabel>
                        <Select
                            value={data.difficultyLevel || 'INTERMEDIATE'}
                            label="Difficulty"
                            onChange={(e) => isSubQuestion
                                ? handleQuestionChange(onChangePrefix, 'difficultyLevel', e.target.value)
                                : handleChange('difficultyLevel', e.target.value)
                            }
                        >
                            {Object.keys(DIFFICULTY_CONFIG).map(key => (
                                <MenuItem key={key} value={key}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: DIFFICULTY_CONFIG[key].color }}>
                                        {DIFFICULTY_CONFIG[key].icon}
                                        <Typography variant="body2">{DIFFICULTY_CONFIG[key].label}</Typography>
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
            )}
        </Grid>
    );

    const renderGroupForm = () => {
        const isPart6 = partType === 'part-six';
        const isPart7 = partType === 'part-seven';
        const isTextOnly = isPart6 || isPart7;

        const handleQuestionCountChange = (count) => {
            const currentList = formData.questionsList || [];
            if (count > currentList.length) {
                const additional = Array(count - currentList.length).fill().map(() => createEmptyQuestion());
                setFormData({ ...formData, questionsList: [...currentList, ...additional] });
            } else if (count < currentList.length) {
                setFormData({ ...formData, questionsList: currentList.slice(0, count) });
            }
        };

        return (
            <Box sx={{ mt: 1 }}>
                {/* Parent Level Info */}
                <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2, bgcolor: '#f8f9fa' }}>
                    <Typography variant="subtitle2" color="primary" sx={{ mb: 2, fontWeight: 'bold', letterSpacing: '0.05em' }}>
                        GROUP INFORMATION
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                            <TextField
                                label="Starting Question No"
                                fullWidth
                                disabled
                                value={formData.questionNo > 0 ? formData.questionNo : 'Auto-generated'}
                                helperText="Assigned automatically"
                                size="small"
                            />
                        </Grid>
                        {isPart7 && (
                            <Grid item xs={12} md={4}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Number of Passages</InputLabel>
                                    <Select
                                        value={formData.numOfPassages || 1}
                                        label="Number of Passages"
                                        onChange={(e) => handleChange('numOfPassages', e.target.value)}
                                    >
                                        <MenuItem value={1}>Single Passage</MenuItem>
                                        <MenuItem value={2}>Double Passage</MenuItem>
                                        <MenuItem value={3}>Triple Passage</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        )}
                        {/* Spacer or Question Count for Part 7 */}
                        <Grid item xs={12} md={isPart7 ? 4 : 8}>
                            {isPart7 && (
                                <FormControl fullWidth size="small">
                                    <InputLabel>Number of Questions</InputLabel>
                                    <Select
                                        value={formData.questionsList?.length || 2}
                                        label="Number of Questions"
                                        disabled={!!initialData} // Disable valid change during edit to avoid backend sync issues for now
                                        onChange={(e) => handleQuestionCountChange(e.target.value)}
                                    >
                                        {[2, 3, 4, 5].map(n => <MenuItem key={n} value={n}>{n} Questions</MenuItem>)}
                                    </Select>
                                </FormControl>
                            )}
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label={isTextOnly ? "Passage Text" : "Transcript (English)"}
                                fullWidth
                                multiline
                                rows={4}
                                value={isTextOnly ? (formData.passageText || '') : (formData.transcript || '')}
                                onChange={(e) => handleChange(isTextOnly ? 'passageText' : 'transcript', e.target.value)}
                                placeholder={isTextOnly ? "Enter the reading passage..." : "Conversation text..."}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label={isTextOnly ? "Vietnamese Translation" : "Transcript (Vietnamese)"}
                                fullWidth
                                multiline
                                rows={4}
                                value={isTextOnly ? (formData.inVietnamese || '') : (formData.vietnameseTranscript || '')}
                                onChange={(e) => handleChange(isTextOnly ? 'inVietnamese' : 'vietnameseTranscript', e.target.value)}
                                placeholder="Vietnamese translation..."
                            />
                        </Grid>
                        {(isPart6 || isPart7) && (
                            <Grid item xs={12} md={4}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Passage Type</InputLabel>
                                    <Select
                                        value={formData.passageType || (isPart7 ? 'Single Passage' : 'Text')}
                                        label="Passage Type"
                                        onChange={(e) => handleChange('passageType', e.target.value)}
                                    >
                                        <MenuItem value="Text">Text</MenuItem>
                                        <MenuItem value="Email">Email</MenuItem>
                                        <MenuItem value="Letter">Letter</MenuItem>
                                        <MenuItem value="Notice">Notice</MenuItem>
                                        <MenuItem value="Advertisement">Advertisement</MenuItem>
                                        <MenuItem value="Article">Article</MenuItem>
                                        <MenuItem value="Memo">Memo</MenuItem>
                                        {isPart7 && <MenuItem value="Report">Report</MenuItem>}
                                        {isPart7 && <MenuItem value="Announcement">Announcement</MenuItem>}
                                    </Select>
                                </FormControl>
                            </Grid>
                        )}
                    </Grid>
                </Paper>

                {/* Media - Hide for Part 6, Show Image for Part 7 (No Audio) */}
                {!isPart6 && (
                    <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                        <Typography variant="subtitle2" color="primary" sx={{ mb: 2, fontWeight: 'bold', letterSpacing: '0.05em' }}>
                            MEDIA FILES
                        </Typography>
                        <Grid container spacing={2}>
                            {/* Part 7: No Audio */}
                            {partType !== 'part-seven' && (
                                <Grid item xs={12} md={partType === 'part-four' ? 12 : 6}>
                                    {renderFileUpload('audio', 'Group Audio')}
                                </Grid>
                            )}
                            {partType !== 'part-four' && (
                                <Grid item xs={12} md={6}>
                                    {renderFileUpload('image', 'Context Image')}
                                </Grid>
                            )}
                        </Grid>
                    </Paper>
                )}

                {/* Sub Questions */}
                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="primary" sx={{ mb: 2, fontWeight: 'bold', letterSpacing: '0.05em' }}>
                        QUESTIONS ({formData.questionsList?.length || (isPart6 ? 4 : 3)} ITEMS)
                    </Typography>
                    {formData.questionsList?.map((q, index) => (
                        <Paper key={index} elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, pb: 1, borderBottom: '1px solid #eee' }}>
                                <Box sx={{
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    width: 24,
                                    height: 24,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mr: 1.5,
                                    fontSize: '0.875rem',
                                    fontWeight: 'bold'
                                }}>
                                    {index + 1}
                                </Box>
                                <Typography variant="subtitle1" fontWeight="bold">Question Details</Typography>
                            </Box>

                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Question Text"
                                        fullWidth
                                        value={q.questionText}
                                        onChange={(e) => handleQuestionChange(index, 'questionText', e.target.value)}
                                    />
                                </Grid>
                                {[1, 2, 3, 4].map(opt => (
                                    <Grid item xs={12} sm={6} key={opt}>
                                        <TextField
                                            label={`Option ${['A', 'B', 'C', 'D'][opt - 1]}`}
                                            fullWidth
                                            size="small"
                                            value={q[`option${opt}`]}
                                            onChange={(e) => handleQuestionChange(index, `option${opt}`, e.target.value)}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Typography variant="body2" fontWeight="bold" color="text.secondary">
                                                            {['(A)', '(B)', '(C)', '(D)'][opt - 1]}
                                                        </Typography>
                                                    </InputAdornment>
                                                )
                                            }}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                            <Divider sx={{ my: 3, width: '100%' }} />
                            {renderCommonFields(q, index, true, true)}
                        </Paper>
                    ))}
                </Box>
            </Box>
        );
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
            <DialogTitle sx={{ borderBottom: '1px solid #eee', pb: 2, fontWeight: 'bold' }}>
                {initialData ? 'Edit Question' : 'Add Question'} - {partType?.replace('-', ' ').toUpperCase()}
            </DialogTitle>
            <DialogContent sx={{ py: 3 }}>
                {['part-three', 'part-four', 'part-six', 'part-seven'].includes(partType) ? renderGroupForm() : (
                    <Box sx={{ mt: 1 }}>
                        {/* Default Single Question Form (Part 1, 2, 5) */}
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={12} md={6}>
                                <TextField label="Question No" fullWidth disabled value={formData.questionNo > 0 ? formData.questionNo : 'Auto-generated'} />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Difficulty</InputLabel>
                                    <Select value={formData.difficultyLevel || 'INTERMEDIATE'} label="Difficulty" onChange={(e) => handleChange('difficultyLevel', e.target.value)}>
                                        {Object.keys(DIFFICULTY_CONFIG).map(key => (
                                            <MenuItem key={key} value={key}>{DIFFICULTY_CONFIG[key].label}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>

                        {/* Media for Single Parts */}
                        {['part-one', 'part-two'].includes(partType) && (
                            <Box sx={{ mb: 4 }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>{renderFileUpload('audio', 'Audio')}</Grid>
                                    {partType === 'part-one' && <Grid item xs={12} md={6}>{renderFileUpload('image', 'Image')}</Grid>}
                                </Grid>
                            </Box>
                        )}

                        {/* Part 5 Question Text */}
                        {partType === 'part-five' && (
                            <Box sx={{ mb: 4 }}>
                                <TextField label="Question Text" fullWidth multiline rows={2} value={formData.questionText || ''} onChange={(e) => handleChange('questionText', e.target.value)} sx={{ mb: 2 }} />
                                <Grid container spacing={2}>
                                    {[1, 2, 3, 4].map(opt => (
                                        <Grid item xs={12} sm={6} key={opt}>
                                            <TextField
                                                label={`Option ${['A', 'B', 'C', 'D'][opt - 1]}`}
                                                fullWidth value={formData[`option${opt}`] || ''}
                                                onChange={(e) => handleChange(`option${opt}`, e.target.value)}
                                                InputProps={{ startAdornment: <InputAdornment position="start">{['A', 'B', 'C', 'D'][opt - 1]}</InputAdornment> }}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}

                        {renderCommonFields(formData, null, false, false)}
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2.5, borderTop: '1px solid #eee' }}>
                <Button onClick={onClose} sx={{ color: 'text.secondary' }}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" disableElevation sx={{ px: 3 }}>
                    {initialData ? 'Update Question' : 'Save Question'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
