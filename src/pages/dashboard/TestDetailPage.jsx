import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
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
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    ArrowBack as ArrowBackIcon,
    Timer as TimerIcon,
    Group as GroupIcon,
    Event as EventIcon,
    Image as ImageIcon,
    Audiotrack as AudioIcon,
    CheckCircle as CheckCircleIcon,
    Print as PrintIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import {
    Checkbox
} from '@mui/material';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import SortableItem from '../../components/SortableItem';

import TestService from '../../services/TestService';
import TestPaper from './TestPaper';
import TestPartDialog from './TestPartDialog';
import { toast } from 'react-toastify';

const STORAGE_URL = 'http://localhost:8888/storage/files/';

export default function TestDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [test, setTest] = useState(null);
    const [loading, setLoading] = useState(true);
    const componentRef = useRef(null);

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [activePart, setActivePart] = useState('');

    const [editingQuestion, setEditingQuestion] = useState(null);
    const [selectedQuestions, setSelectedQuestions] = useState({}); // part -> Set(ids)

    // Delete Confirmation State
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deletePartTarget, setDeletePartTarget] = useState(null);

    // DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = async (event, part, items, setItems) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over.id);

            // Optimistic UI update
            const newItems = arrayMove(items, oldIndex, newIndex);
            setItems(newItems);

            try {
                // Calculate swaps needed to move item from oldIndex to newIndex
                // "Move" logic via swaps: bubble it through neighbors
                // e.g. move 0 to 2: swap(0,1), swap(1,2) effectively.
                // Wait, if we use swapQuestions(id1, id2), we physically swap contents.
                // Backend swaps questionNo.
                // Depending on direction:
                if (oldIndex < newIndex) {
                    for (let i = oldIndex; i < newIndex; i++) {
                        await swap(part, newItems[i].id, newItems[i + 1].id);
                    }
                } else {
                    for (let i = oldIndex; i > newIndex; i--) {
                        await swap(part, newItems[i].id, newItems[i - 1].id);
                    }
                }
            } catch (error) {
                console.error("Swap failed", error);
                toast.error("Failed to reorder items");
                fetchTestDetails(); // Revert
            }
        }
    };

    const swap = async (part, id1, id2) => {
        // Map part string to service call
        switch (part) {
            case 'part-one': await TestService.swapQuestionPartOne(id1, id2); break;
            case 'part-two': await TestService.swapQuestionPartTwo(id1, id2); break;
            case 'part-three': await TestService.swapQuestionPartThree(id1, id2); break;
            case 'part-four': await TestService.swapQuestionPartFour(id1, id2); break;
            case 'part-five': await TestService.swapQuestionPartFive(id1, id2); break;
            case 'part-six': await TestService.swapQuestionPartSix(id1, id2); break;
            case 'part-seven': await TestService.swapQuestionPartSeven(id1, id2); break;
        }
    };


    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: test ? `${test.testName} - Exam Paper` : 'Exam Paper',
    });

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

    const handleOpenDialog = (part, event, questionData = null) => {
        event.stopPropagation();
        setActivePart(part);
        setEditingQuestion(questionData);
        setDialogOpen(true);
    };

    const handleSaveQuestion = async (part, data, files) => {
        try {
            let response;

            if (editingQuestion) {
                // Update Logic
                const questionId = editingQuestion.id;
                switch (part) {
                    case 'part-one': response = await TestService.updateQuestionPartOne(questionId, data); break;
                    case 'part-two': response = await TestService.updateQuestionPartTwo(questionId, data); break;
                    case 'part-three': response = await TestService.updateQuestionPartThree(questionId, data); break;
                    case 'part-four': response = await TestService.updateQuestionPartFour(questionId, data); break;
                    case 'part-five': response = await TestService.updateQuestionPartFive(questionId, data); break;
                    case 'part-six': response = await TestService.updateQuestionPartSix(questionId, data); break;
                    case 'part-seven': response = await TestService.updateQuestionPartSeven(questionId, data); break;
                    default: break;
                }
            } else {
                // Create Logic
                switch (part) {
                    case 'part-one': response = await TestService.addQuestionPartOne(id, data); break;
                    case 'part-two': response = await TestService.addQuestionPartTwo(id, data); break;
                    case 'part-three': response = await TestService.addQuestionPartThree(id, data); break;
                    case 'part-four': response = await TestService.addQuestionPartFour(id, data); break;
                    case 'part-five': response = await TestService.addQuestionPartFive(id, data); break;
                    case 'part-six': response = await TestService.addQuestionPartSix(id, data); break;
                    case 'part-seven': response = await TestService.addQuestionPartSeven(id, data); break;
                    default: break;
                }
            }

            if (response && response.success) {
                const questionId = editingQuestion ? editingQuestion.id : response.data.id;

                // Upload logic is now handled in TestPartDialog via StorageService
                // The file paths (IDs) are already in the data object

                toast.success(`Question ${editingQuestion ? 'updated' : 'added'} successfully`);
                setDialogOpen(false);
                setEditingQuestion(null);
                fetchTestDetails(); // Refresh
            }
        } catch (error) {
            console.error("Failed to save question", error);
            toast.error("Failed to save question");
        }
    };

    const handleToggleSelect = (part, id) => {
        const currentSelected = selectedQuestions[part] || new Set();
        const newSelected = new Set(currentSelected);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedQuestions({ ...selectedQuestions, [part]: newSelected });
    };

    const handleSelectAll = (part, questions) => {
        const currentSelected = selectedQuestions[part] || new Set();
        const allIds = questions.map(q => q.id);
        const newSelected = new Set(currentSelected.size === allIds.length ? [] : allIds);
        setSelectedQuestions({ ...selectedQuestions, [part]: newSelected });
    };

    const handleDeleteSelected = (part) => {
        const selected = selectedQuestions[part];
        if (!selected || selected.size === 0) return;
        setDeletePartTarget(part);
        setDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        const part = deletePartTarget;
        const selected = selectedQuestions[part];

        if (!selected || selected.size === 0) {
            setDeleteConfirmOpen(false);
            return;
        }

        try {
            const deletePromises = Array.from(selected).map(id => {
                switch (part) {
                    case 'part-one': return TestService.deleteQuestionPartOne(id);
                    case 'part-two': return TestService.deleteQuestionPartTwo(id);
                    case 'part-three': return TestService.deleteQuestionPartThree(id);
                    case 'part-four': return TestService.deleteQuestionPartFour(id);
                    case 'part-five': return TestService.deleteQuestionPartFive(id);
                    case 'part-six': return TestService.deleteQuestionPartSix(id);
                    case 'part-seven': return TestService.deleteQuestionPartSeven(id);
                    default: return Promise.resolve();
                }
            });

            await Promise.all(deletePromises);
            toast.success("Deleted successfully");
            fetchTestDetails();
            setSelectedQuestions(prev => ({ ...prev, [part]: new Set() }));
        } catch (error) {
            console.error("Failed to delete", error);
            toast.error("Failed to delete some items");
        } finally {
            setDeleteConfirmOpen(false);
            setDeletePartTarget(null);
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

    // Helper to render Edit Button
    const renderEditButton = (part, questionData, parentData = {}) => (
        <IconButton
            size="small"
            color="primary"
            onClick={(e) => handleOpenDialog(part, e, { ...questionData, ...parentData })}
            sx={{ ml: 1 }}
        >
            <EditIcon fontSize="small" />
        </IconButton>
    );

    const renderSelectionHeader = (part, questions) => {
        const questionList = questions || [];
        const selected = selectedQuestions[part] || new Set();
        const isAllSelected = questionList.length > 0 && selected.size === questionList.length;

        return (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {questionList.length > 0 && (
                    <>
                        <Checkbox
                            checked={isAllSelected}
                            indeterminate={selected.size > 0 && selected.size < questionList.length}
                            onChange={() => handleSelectAll(part, questionList)}
                        />
                        <Typography variant="body2" sx={{ mr: 2 }}>Select All</Typography>
                    </>
                )}

                {selected.size > 0 && (
                    <Button
                        variant="contained"
                        color="error"
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteSelected(part)}
                    >
                        Delete Selected ({selected.size})
                    </Button>
                )}

                <Box sx={{ flexGrow: 1 }} />

                <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={(e) => handleOpenDialog(part, e)}
                >
                    Add Question
                </Button>
            </Box>
        );
    };

    const renderQuestionCheckbox = (part, questionId) => (
        <Checkbox
            checked={(selectedQuestions[part] || new Set()).has(questionId)}
            onChange={() => handleToggleSelect(part, questionId)}
            onClick={(e) => e.stopPropagation()}
            sx={{ p: 0, mr: 1 }}
        />
    );



    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', pb: 5 }}>
            {/* Hidden Print Component - Use off-screen instead of display:none to ensure ref works */}
            <div style={{ position: 'absolute', top: '-10000px', left: '-10000px' }}>
                <TestPaper ref={componentRef} test={test} />
            </div>

            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/tests')}
                    sx={{ color: 'text.secondary' }}
                >
                    Back to Tests
                </Button>
                <Button
                    variant="contained"
                    startIcon={<PrintIcon />}
                    onClick={handlePrint}
                    sx={{ bgcolor: 'primary.main', fontWeight: 'bold' }}
                >
                    Export to PDF
                </Button>
            </Box>

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
                        {renderSelectionHeader('part-one', test.partOne)}
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={(e) => handleDragEnd(e, 'part-one', test.partOne, (newItems) => setTest({ ...test, partOne: newItems }))}
                        >
                            <SortableContext
                                items={test.partOne || []}
                                strategy={verticalListSortingStrategy}
                            >
                                <Grid container spacing={2}>
                                    {test.partOne?.map((q) => (
                                        <Grid item xs={12} md={6} key={q.id}>
                                            <SortableItem id={q.id}>
                                                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                                                    <CardContent>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                {renderQuestionCheckbox('part-one', q.id)}
                                                                <Typography variant="subtitle2" gutterBottom>Question {q.questionNo}</Typography>
                                                            </Box>
                                                            {renderEditButton('part-one', q)}
                                                        </Box>
                                                        {renderImage(q.image)}
                                                        {renderAudio(q.audio)}
                                                        {renderAnswer(q.correctAnswer)}
                                                    </CardContent>
                                                </Card>
                                            </SortableItem>
                                        </Grid>
                                    ))}
                                </Grid>
                            </SortableContext>
                        </DndContext>
                    </AccordionDetails>
                </Accordion>

                {/* Part 2 */}
                <Accordion sx={{ mb: 1, borderRadius: '12px !important', '&:before': { display: 'none' }, boxShadow: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6" fontWeight="600">Part 2: Question-Response ({test.partTwo?.length || 0})</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        {renderSelectionHeader('part-two', test.partTwo)}
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={(e) => handleDragEnd(e, 'part-two', test.partTwo, (newItems) => setTest({ ...test, partTwo: newItems }))}
                        >
                            <SortableContext
                                items={test.partTwo || []}
                                strategy={verticalListSortingStrategy}
                            >
                                <Grid container spacing={2}>
                                    {test.partTwo?.map((q) => (
                                        <Grid item xs={12} md={6} key={q.id}>
                                            <SortableItem id={q.id}>
                                                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                                                    <CardContent>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                {renderQuestionCheckbox('part-two', q.id)}
                                                                <Typography variant="subtitle2" gutterBottom>Question {q.questionNo}</Typography>
                                                            </Box>
                                                            {renderEditButton('part-two', q)}
                                                        </Box>
                                                        {renderAudio(q.audio)}
                                                        {renderAnswer(q.correctAnswer)}
                                                    </CardContent>
                                                </Card>
                                            </SortableItem>
                                        </Grid>
                                    ))}
                                </Grid>
                            </SortableContext>
                        </DndContext>
                    </AccordionDetails>
                </Accordion>

                {/* Part 3 */}
                <Accordion sx={{ mb: 1, borderRadius: '12px !important', '&:before': { display: 'none' }, boxShadow: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6" fontWeight="600">Part 3: Conversations ({test.partThree?.length || 0} Sets)</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        {renderSelectionHeader('part-three', test.partThree)}
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={(e) => handleDragEnd(e, 'part-three', test.partThree, (newItems) => setTest({ ...test, partThree: newItems }))}
                        >
                            <SortableContext
                                items={test.partThree || []}
                                strategy={verticalListSortingStrategy}
                            >
                                {test.partThree?.map((group) => (
                                    <SortableItem key={group.id} id={group.id}>
                                        <Card variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
                                            <CardContent>
                                                <Box sx={{ mb: 2 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                        {renderQuestionCheckbox('part-three', group.id)}
                                                        <Typography variant="subtitle1" fontWeight="bold">Questions {group.questionList[0]?.questionNo}-{group.questionList[group.questionList.length - 1]?.questionNo}</Typography>
                                                    </Box>
                                                    {renderAudio(group.audio)}
                                                    {renderImage(group.image)}
                                                </Box>
                                                <Divider sx={{ my: 1 }} />
                                                {group.questionList.map(q => (
                                                    <Box key={q.id} sx={{ mt: 1, pl: 2, borderLeft: '3px solid #eee' }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <Typography variant="body2" fontWeight="600">Q{q.questionNo}: {q.questionText}</Typography>
                                                            {renderEditButton('part-three', group)}
                                                        </Box>
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
                                    </SortableItem>
                                ))}
                            </SortableContext>
                        </DndContext>
                    </AccordionDetails>
                </Accordion>

                {/* Part 4 */}
                <Accordion sx={{ mb: 1, borderRadius: '12px !important', '&:before': { display: 'none' }, boxShadow: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6" fontWeight="600">Part 4: Talks ({test.partFour?.length || 0} Sets)</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        {renderSelectionHeader('part-four', test.partFour)}
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={(e) => handleDragEnd(e, 'part-four', test.partFour, (newItems) => setTest({ ...test, partFour: newItems }))}
                        >
                            <SortableContext
                                items={test.partFour || []}
                                strategy={verticalListSortingStrategy}
                            >
                                {test.partFour?.map((group) => (
                                    <SortableItem key={group.id} id={group.id}>
                                        <Card variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
                                            <CardContent>
                                                <Box sx={{ mb: 2 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                        {renderQuestionCheckbox('part-four', group.id)}
                                                        <Typography variant="subtitle1" fontWeight="bold">Questions {group.questionList[0]?.questionNo}-{group.questionList[group.questionList.length - 1]?.questionNo}</Typography>
                                                    </Box>
                                                    {renderAudio(group.audio)}
                                                    {renderImage(group.image)}
                                                </Box>
                                                <Divider sx={{ my: 1 }} />
                                                {group.questionList.map(q => (
                                                    <Box key={q.id} sx={{ mt: 1, pl: 2, borderLeft: '3px solid #eee' }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <Typography variant="body2" fontWeight="600">Q{q.questionNo}: {q.questionText}</Typography>
                                                            {renderEditButton('part-four', q, { audioUrl: group.audio, imageUrl: group.image })}
                                                        </Box>
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
                                    </SortableItem>
                                ))}
                            </SortableContext>
                        </DndContext>
                    </AccordionDetails>
                </Accordion>

                {/* Part 5 */}
                <Accordion sx={{ mb: 1, borderRadius: '12px !important', '&:before': { display: 'none' }, boxShadow: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6" fontWeight="600">Part 5: Incomplete Sentences ({test.partFive?.length || 0})</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        {renderSelectionHeader('part-five', test.partFive)}
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={(e) => handleDragEnd(e, 'part-five', test.partFive, (newItems) => setTest({ ...test, partFive: newItems }))}
                        >
                            <SortableContext
                                items={test.partFive || []}
                                strategy={verticalListSortingStrategy}
                            >
                                <Grid container spacing={2}>
                                    {test.partFive?.map((q) => (
                                        <Grid item xs={12} key={q.id}>
                                            <SortableItem id={q.id}>
                                                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                                                    <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                {renderQuestionCheckbox('part-five', q.id)}
                                                                <Typography variant="body2" fontWeight="600" gutterBottom>Q{q.questionNo}: {q.questionText}</Typography>
                                                            </Box>
                                                            {renderEditButton('part-five', q)}
                                                        </Box>
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
                                            </SortableItem>
                                        </Grid>
                                    ))}
                                </Grid>
                            </SortableContext>
                        </DndContext>
                    </AccordionDetails>
                </Accordion>

                {/* Part 6 */}
                <Accordion sx={{ mb: 1, borderRadius: '12px !important', '&:before': { display: 'none' }, boxShadow: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6" fontWeight="600">Part 6: Text Completion ({test.partSix?.length || 0} Sets)</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        {renderSelectionHeader('part-six', test.partSix)}
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={(e) => handleDragEnd(e, 'part-six', test.partSix, (newItems) => setTest({ ...test, partSix: newItems }))}
                        >
                            <SortableContext
                                items={test.partSix || []}
                                strategy={verticalListSortingStrategy}
                            >
                                {test.partSix?.map((group) => (
                                    <SortableItem key={group.id} id={group.id}>
                                        <Card variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
                                            <CardContent>
                                                <Box sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                        {renderQuestionCheckbox('part-six', group.id)}
                                                        <Typography variant="subtitle2" color="text.secondary">Group ID: {group.id}</Typography>
                                                    </Box>
                                                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{group.paragraph}</Typography>
                                                </Box>
                                                <Divider sx={{ my: 1 }} />
                                                {group.questionList.map(q => (
                                                    <Box key={q.id} sx={{ mt: 1, pl: 2, borderLeft: '3px solid #eee' }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <Typography variant="body2" fontWeight="600">Q{q.questionNo}: {q.questionText}</Typography>
                                                            {renderEditButton('part-six', q, { paragraph: group.paragraph })}
                                                        </Box>
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
                                    </SortableItem>
                                ))}
                            </SortableContext>
                        </DndContext>
                    </AccordionDetails>
                </Accordion>

                {/* Part 7 */}
                <Accordion sx={{ mb: 1, borderRadius: '12px !important', '&:before': { display: 'none' }, boxShadow: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6" fontWeight="600">Part 7: Reading Comprehension ({test.partSeven?.length || 0} Sets)</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        {renderSelectionHeader('part-seven', test.partSeven)}
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={(e) => handleDragEnd(e, 'part-seven', test.partSeven, (newItems) => setTest({ ...test, partSeven: newItems }))}
                        >
                            <SortableContext
                                items={test.partSeven || []}
                                strategy={verticalListSortingStrategy}
                            >
                                {test.partSeven?.map((group) => (
                                    <SortableItem key={group.id} id={group.id}>
                                        <Card variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
                                            <CardContent>
                                                <Box sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 2, maxHeight: 300, overflow: 'auto' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                        {renderQuestionCheckbox('part-seven', group.id)}
                                                        <Typography variant="subtitle2" color="text.secondary">Group ID: {group.id}</Typography>
                                                    </Box>
                                                    {renderImage(group.image)}
                                                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{group.paragraph}</Typography>
                                                </Box>
                                                <Divider sx={{ my: 1 }} />
                                                {group.questionList.map(q => (
                                                    <Box key={q.id} sx={{ mt: 1, pl: 2, borderLeft: '3px solid #eee' }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <Typography variant="body2" fontWeight="600">Q{q.questionNo}: {q.questionText}</Typography>
                                                            {renderEditButton('part-seven', q, { imageUrl: group.image, paragraph: group.paragraph })}
                                                        </Box>
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
                                    </SortableItem>
                                ))}
                            </SortableContext>
                        </DndContext>
                    </AccordionDetails>
                </Accordion>

            </Box>

            <TestPartDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                partType={activePart}
                onSave={handleSaveQuestion}
                initialData={editingQuestion}
                suggestedQuestionNo={0}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
            >
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete {selectedQuestions[deletePartTarget]?.size || 0} selected items?
                        This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit">
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmDelete} color="error" autoFocus variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
