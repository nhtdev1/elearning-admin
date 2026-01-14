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
    Stack,
    Chip,
    InputAdornment
} from '@mui/material';
import {
    CloudUpload as CloudUploadIcon,
    Close as CloseIcon,
    Image as ImageIcon,
    Headphones as AudioIcon,
    Description as DescriptionIcon,
    CheckCircle as CheckCircleIcon,
    HelpOutline as HelpOutlineIcon,
    Quiz as QuizIcon,
    SentimentVerySatisfied as VeryEasyIcon,
    SentimentSatisfied as EasyIcon,
    SentimentNeutral as MediumIcon,
    SentimentDissatisfied as HardIcon,
    SentimentVeryDissatisfied as VeryHardIcon
} from '@mui/icons-material';
import StorageService from '../../services/StorageService';
import { pink, green, blue, orange, red } from '@mui/material/colors';

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
                setFormData({
                    ...initialData,
                    difficultyLevel: initialData.difficultyLevel || 'INTERMEDIATE',
                    correctAnswer: initialData.correctAnswer || 1
                });
                setFiles({ audio: null, image: null });

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
                setFormData(getInitialFormData(partType, suggestedQuestionNo));
                setFiles({ audio: null, image: null });
                setTranscripts({ A: '', B: '', C: '', D: '' });
            }
        }
    }, [open, partType, initialData]);

    // Auto-update explanation when transcripts change
    useEffect(() => {
        if (partType === 'part-one' || partType === 'part-two') {
            const { A, B, C, D } = transcripts;
            if (A || B || C || (partType === 'part-one' && D)) {
                let html = `<p>(A) ${A || '...'}</p>\n<p>(B) ${B || '...'}</p>\n<p>(C) ${C || '...'}</p>`;
                if (partType === 'part-one') {
                    html += `\n<p>(D) ${D || '...'}</p>`;
                }
                setFormData(prev => ({ ...prev, explanationAnswer: html }));
            }
        }
    }, [transcripts, partType]);

    const getInitialFormData = (type, suggested) => {
        // Common base
        const base = {
            questionNo: 0, // Auto-generated
            correctAnswer: 1,
            explanationAnswer: '',
            difficultyLevel: 'INTERMEDIATE',
        };

        if (['part-one', 'part-two', 'part-five'].includes(type)) {
            // Single questions
            if (type === 'part-five') {
                return { ...base, questionText: '', option1: '', option2: '', option3: '', option4: '' };
            }
            return base;
        }

        // Group questions (simplified for now or placeholder)
        if (['part-three', 'part-four', 'part-six', 'part-seven'].includes(type)) {
            return { ...base, transcript: '', questionText: 'Sub-question 1', option1: '', option2: '', option3: '', option4: '' };
        }
        return base;
    };

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleTranscriptChange = (key, value) => {
        setTranscripts(prev => ({ ...prev, [key]: value }));
    };

    const handleFileChange = (field, event) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setFiles({ ...files, [field]: file });

            // Calculate audio duration
            if (field === 'audio') {
                const audio = new Audio(URL.createObjectURL(file));
                audio.onloadedmetadata = () => {
                    const duration = Math.round(audio.duration);
                    setFormData(prev => ({ ...prev, audioDuration: duration }));
                    URL.revokeObjectURL(audio.src); // Cleanup
                };
            }
        }
    };



    const handleSubmit = async () => {
        // Validate (Question No is now auto-generated)
        // if (!formData.questionNo) { ... }

        let updatedFormData = { ...formData };

        try {
            // Upload Audio
            if (files.audio) {
                const audioResponse = await StorageService.uploadFile(files.audio);
                if (audioResponse && audioResponse.data && audioResponse.data.id) {
                    updatedFormData.audio = audioResponse.data.id;
                }
            }

            // Upload Image
            if (files.image) {
                const imageResponse = await StorageService.uploadFile(files.image);
                if (imageResponse && imageResponse.data && imageResponse.data.id) {
                    updatedFormData.image = imageResponse.data.id;
                }
            }

            // Pass the updated form data with file URLs (IDs) to onSave
            onSave(partType, updatedFormData, null); // Set files to null as we handled them
        } catch (error) {
            console.error("File upload failed", error);
            alert("Failed to upload files. Please try again.");
        }
    };

    const renderCommonFields = () => (
        <Grid container spacing={3}>
            {/* Answer Section */}
            <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                    <InputLabel>Correct Answer</InputLabel>
                    <Select
                        value={formData.correctAnswer || 1}
                        label="Correct Answer"
                        onChange={(e) => handleChange('correctAnswer', parseInt(e.target.value))}
                    >
                        {(partType === 'part-two' ? [1, 2, 3] : [1, 2, 3, 4]).map(i => (
                            <MenuItem key={i} value={i}>
                                Option {['A', 'B', 'C', 'D'][i - 1]}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>

            {/* Transcript Builder for Part 1 and Part 2 */}
            {(partType === 'part-one' || partType === 'part-two') && (
                <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                        Transcript (Auto-generates Explanation)
                    </Typography>
                    <Grid container spacing={2}>
                        {['A', 'B', 'C'].concat(partType === 'part-one' ? ['D'] : []).map((opt) => (
                            <Grid item xs={12} sm={6} key={opt}>
                                <TextField
                                    label={`Option (${opt})`}
                                    fullWidth
                                    size="small"
                                    value={transcripts[opt]}
                                    onChange={(e) => handleTranscriptChange(opt, e.target.value)}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
            )}

            {/* Explanation */}
            <Grid item xs={12}>
                <TextField
                    label="Explanation"
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Enter explanation for the correct answer..."
                    value={formData.explanationAnswer || ''}
                    onChange={(e) => handleChange('explanationAnswer', e.target.value)}
                    helperText={(partType === 'part-one' || partType === 'part-two') ? "Auto-generated from transcript fields above, or edit manually." : ""}
                />
            </Grid>
        </Grid>
    );

    const STORAGE_BASE_URL = 'http://localhost:8888/storage/files/';

    const renderFileUpload = (type, label) => {
        // Determine preview URL
        let previewUrl = null;
        if (files[type]) {
            previewUrl = URL.createObjectURL(files[type]);
        } else if (formData[type]) { // Check formData which holds the current value (initial or updated)
            // If it's a full URL (rare), use it; otherwise prepend base
            previewUrl = formData[type].startsWith('http') ? formData[type] : `${STORAGE_BASE_URL}${formData[type]}`;
        } else if (initialData && initialData[type]) {
            // Fallback to initialData if formData doesn't cover it yet (though formData init should cover this)
            previewUrl = initialData[type].startsWith('http') ? initialData[type] : `${STORAGE_BASE_URL}${initialData[type]}`;
        }

        return (
            <Box
                sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    bgcolor: 'background.paper'
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                        component="label"
                        variant="outlined"
                        startIcon={<CloudUploadIcon />}
                        size="small"
                    >
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
                            <audio controls src={previewUrl} style={{ width: '100%' }}>
                                Your browser does not support the audio element.
                            </audio>
                        )}
                    </Box>
                )}

                {initialData && initialData[type] && !files[type] && !formData[type] && (
                    <Typography variant="caption" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CheckCircleIcon fontSize="inherit" /> Current {label} exists in DB
                    </Typography>
                )}
            </Box>
        );
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{ sx: { borderRadius: 2 } }}
        >
            <DialogTitle sx={{ borderBottom: '1px solid #eee', pb: 2, fontWeight: 'bold' }}>
                {initialData ? 'Edit Question' : 'Add Question'} - {partType?.replace('-', ' ').toUpperCase().replace('PART', 'PART ')}
            </DialogTitle>

            <DialogContent sx={{ py: 3 }}>
                <Box sx={{ mt: 1 }}>
                    {/* Row 1: Question No & Difficulty */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Question No"
                                type="text"
                                fullWidth
                                disabled
                                value={formData.questionNo > 0 ? formData.questionNo : 'Auto-generated'}
                                helperText="Number will be assigned automatically"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Difficulty</InputLabel>
                                <Select
                                    value={formData.difficultyLevel || 'INTERMEDIATE'}
                                    label="Difficulty"
                                    onChange={(e) => handleChange('difficultyLevel', e.target.value)}
                                    renderValue={(selected) => {
                                        const config = DIFFICULTY_CONFIG[selected] || DIFFICULTY_CONFIG['INTERMEDIATE'];
                                        return (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: config.color }}>
                                                {config.icon}
                                                <Typography variant="body2" sx={{ color: 'text.primary' }}>{config.label}</Typography>
                                            </Box>
                                        );
                                    }}
                                >
                                    {Object.keys(DIFFICULTY_CONFIG).map(key => (
                                        <MenuItem key={key} value={key}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: DIFFICULTY_CONFIG[key].color }}>
                                                {DIFFICULTY_CONFIG[key].icon}
                                                <Typography variant="body2" sx={{ color: 'text.primary' }}>{DIFFICULTY_CONFIG[key].label}</Typography>
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    {/* Media Upload Section */}
                    {['part-one', 'part-two', 'part-three', 'part-four', 'part-seven'].includes(partType) && (
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700 }}>
                                Media Assets
                            </Typography>
                            <Grid container spacing={2}>
                                {['part-one', 'part-two', 'part-three', 'part-four'].includes(partType) && (
                                    <Grid item xs={12} md={6}>
                                        {renderFileUpload('audio', 'Audio')}
                                    </Grid>
                                )}
                                {['part-one', 'part-three', 'part-four', 'part-seven'].includes(partType) && (
                                    <Grid item xs={12} md={6}>
                                        {renderFileUpload('image', 'Image')}
                                    </Grid>
                                )}
                            </Grid>
                        </Box>
                    )}

                    {/* Part 5 Specific Text Question */}
                    {partType === 'part-five' && (
                        <Box sx={{ mb: 4 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Question Text"
                                        fullWidth
                                        multiline
                                        rows={2}
                                        value={formData.questionText || ''}
                                        onChange={(e) => handleChange('questionText', e.target.value)}
                                    />
                                </Grid>
                                {[1, 2, 3, 4].map(opt => (
                                    <Grid item xs={12} sm={6} key={opt}>
                                        <TextField
                                            label={`Option ${['A', 'B', 'C', 'D'][opt - 1]}`}
                                            fullWidth
                                            value={formData[`option${opt}`] || ''}
                                            onChange={(e) => handleChange(`option${opt}`, e.target.value)}
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start" sx={{ width: 20 }}>{['A', 'B', 'C', 'D'][opt - 1]}</InputAdornment>,
                                            }}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}

                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700 }}>
                        Question Details
                    </Typography>
                    {renderCommonFields()}
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2.5, borderTop: '1px solid #eee' }}>
                <Button onClick={onClose} sx={{ color: 'text.secondary' }}>Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disableElevation
                    sx={{ px: 3 }}
                >
                    {initialData ? 'Update Question' : 'Save Question'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
