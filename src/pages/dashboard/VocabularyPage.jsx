import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    List,
    ListItem,
    ListItemText,
    ListItemButton,
    ListItemAvatar,
    ListItemSecondaryAction,
    IconButton,
    Button,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress,
    Avatar,
    Card,
    CardHeader,
    CardContent,
    Chip,
    Tooltip,
    InputAdornment
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Image as ImageIcon,
    VolumeUp as AudioIcon,
    Search as SearchIcon,
    School as TopicIcon,
    Category as CategoryIcon
} from '@mui/icons-material';
import VocabularyService from '../../services/VocabularyService';
import { toast } from 'react-toastify';

export default function VocabularyPage() {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(false);
    const [wordsLoading, setWordsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Dialogs State
    const [topicDialogOpen, setTopicDialogOpen] = useState(false);
    const [editingTopic, setEditingTopic] = useState(null);

    const [wordDialogOpen, setWordDialogOpen] = useState(false);
    const [editingWord, setEditingWord] = useState(null);

    // Upload State
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [uploadType, setUploadType] = useState('image'); // 'image' or 'audio'
    const [uploadingWord, setUploadingWord] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    // Initial Load
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await VocabularyService.getAllCategories();
            if (response.success || response.isSuccess) {
                setCategories(response.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch topics", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectCategory = async (category) => {
        setWordsLoading(true);
        setSelectedCategory(null);
        try {
            const response = await VocabularyService.getCategoryDetails(category.id);
            if (response.success || response.isSuccess) {
                setSelectedCategory(response.data);
            }
        } catch (error) {
            toast.error("Failed to load topic details");
        } finally {
            setWordsLoading(false);
        }
    };

    // --- TOPIC ACTIONS ---

    const handleSaveTopic = async () => {
        try {
            if (editingTopic.id) {
                await VocabularyService.updateCategory(editingTopic.id, editingTopic);
                toast.success("Topic updated");
            } else {
                await VocabularyService.createCategory(editingTopic);
                toast.success("Topic created");
            }
            setTopicDialogOpen(false);
            fetchCategories();
        } catch (error) {
            toast.error("Failed to save topic");
        }
    };

    const handleDeleteTopic = async (id) => {
        if (window.confirm("Are you sure? This will delete all words in this topic.")) {
            try {
                await VocabularyService.deleteCategory(id);
                toast.success("Topic deleted");
                fetchCategories();
                if (selectedCategory?.id === id) setSelectedCategory(null);
            } catch (error) {
                toast.error("Failed to delete topic");
            }
        }
    };

    // --- WORD ACTIONS ---

    const handleSaveWord = async () => {
        try {
            if (editingWord.id) {
                await VocabularyService.updateWord(editingWord.id, editingWord);
                toast.success("Word updated");
            } else {
                await VocabularyService.addWordToCategory(selectedCategory.id, editingWord);
                toast.success("Word added");
            }
            setWordDialogOpen(false);
            handleSelectCategory({ id: selectedCategory.id });
        } catch (error) {
            toast.error("Failed to save word");
        }
    };

    const handleDeleteWord = async (id) => {
        if (window.confirm("Delete this word?")) {
            try {
                await VocabularyService.deleteWord(id);
                toast.success("Word deleted");
                handleSelectCategory({ id: selectedCategory.id });
            } catch (error) {
                toast.error("Failed to delete word");
            }
        }
    };

    // --- UPLOAD ACTIONS ---

    const handleOpenUpload = (word, type) => {
        setUploadingWord(word);
        setUploadType(type);
        setSelectedFile(null);
        setUploadDialogOpen(true);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.warning("Please select a file");
            return;
        }
        try {
            if (uploadType === 'image') {
                await VocabularyService.uploadWordImage(uploadingWord.id, selectedFile);
                toast.success("Image uploaded");
            } else if (uploadType === 'audio') {
                await VocabularyService.uploadWordAudio(uploadingWord.id, selectedFile);
                toast.success("Audio uploaded");
            }
            setUploadDialogOpen(false);
            handleSelectCategory({ id: selectedCategory.id });
        } catch (error) {
            toast.error("Upload failed");
            console.error(error);
        }
    };

    // --- FILTERS ---
    const filteredCategories = categories.filter(c =>
        c.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- RENDER HELPERS ---

    const renderTopicList = () => (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: 'none', boxShadow: 3 }}>
            <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CategoryIcon /> Topics
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    {categories.length} total categories
                </Typography>
                <Box sx={{ mt: 2 }}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Search topics..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'white', opacity: 0.7 }} /></InputAdornment>,
                            sx: { bgcolor: 'rgba(255,255,255,0.15)', color: 'white', borderRadius: 2, '& input': { color: 'white' } }
                        }}
                    />
                </Box>
            </Box>

            <List sx={{ overflow: 'auto', flexGrow: 1, p: 1 }}>
                <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AddIcon />}
                    sx={{ mb: 2, borderStyle: 'dashed', borderWidth: 2 }}
                    onClick={() => { setEditingTopic({ categoryName: '' }); setTopicDialogOpen(true); }}
                >
                    Add New Topic
                </Button>

                {filteredCategories.map((cat) => (
                    <ListItemButton
                        key={cat.id}
                        selected={selectedCategory?.id === cat.id}
                        onClick={() => handleSelectCategory(cat)}
                        sx={{ mb: 1, borderRadius: 2 }}
                    >
                        <ListItemAvatar>
                            <Avatar sx={{ bgcolor: selectedCategory?.id === cat.id ? 'primary.dark' : 'grey.200', color: selectedCategory?.id === cat.id ? 'white' : 'grey.600' }}>
                                <TopicIcon />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={cat.categoryName}
                            secondary={`${cat.totalWords || 0} words`}
                            primaryTypographyProps={{ fontWeight: 600 }}
                        />
                        <ListItemSecondaryAction>
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); setEditingTopic(cat); setTopicDialogOpen(true); }}>
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItemButton>
                ))}
            </List>
        </Card>
    );

    const renderWordList = () => {
        if (!selectedCategory) {
            return (
                <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'text.secondary', gap: 2 }}>
                    <TopicIcon sx={{ fontSize: 60, opacity: 0.2 }} />
                    <Typography variant="h6">Select a topic to manage vocabulary</Typography>
                </Box>
            );
        }

        return (
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: 'none', boxShadow: 3 }}>
                <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="overline" color="primary">Current Topic</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 800 }}>{selectedCategory.categoryName}</Typography>
                    </Box>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => {
                        setEditingWord({ english: '', vietnamese: '', pronunciation: '', attributes: '' });
                        setWordDialogOpen(true);
                    }} sx={{ px: 3, borderRadius: 4 }}>
                        Add Word
                    </Button>
                </Box>

                {wordsLoading ? (
                    <Box sx={{ p: 5, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
                ) : (
                    <TableContainer sx={{ flexGrow: 1 }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ pl: 4 }}>Assets</TableCell>
                                    <TableCell>Word / Definition</TableCell>
                                    <TableCell>Pronunciation</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell align="center">Upload</TableCell>
                                    <TableCell align="right" sx={{ pr: 4 }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {selectedCategory.vocabularies?.map((word) => (
                                    <TableRow key={word.id} hover>
                                        <TableCell sx={{ pl: 4 }}>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Avatar
                                                    src={word.image ? `http://localhost:7716/elearning${word.image}` : ''}
                                                    variant="rounded"
                                                    sx={{ width: 48, height: 48, bgcolor: 'grey.100' }}
                                                >
                                                    <ImageIcon sx={{ color: 'grey.300' }} />
                                                </Avatar>
                                                {word.audio && (
                                                    <Tooltip title="Audio Available">
                                                        <Chip icon={<AudioIcon sx={{ fontSize: '14px !important' }} />} label="Audio" size="small" color="primary" variant="outlined" />
                                                    </Tooltip>
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="subtitle1" fontWeight="bold" color="primary.main">{word.english}</Typography>
                                            <Typography variant="body2" color="text.secondary">{word.vietnamese}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', px: 1, py: 0.5, borderRadius: 1, display: 'inline-block' }}>
                                                {word.pronunciation ? `/${word.pronunciation}/` : '-'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {word.attributes && <Chip label={word.attributes} size="small" color="secondary" sx={{ fontWeight: 500 }} />}
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton size="small" color="default" onClick={() => handleOpenUpload(word, 'image')} sx={{ '&:hover': { color: 'primary.main' } }}>
                                                <ImageIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" color="default" onClick={() => handleOpenUpload(word, 'audio')} sx={{ '&:hover': { color: 'secondary.main' } }}>
                                                <AudioIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                        <TableCell align="right" sx={{ pr: 4 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                <IconButton size="small" color="primary" onClick={() => { setEditingWord(word); setWordDialogOpen(true); }}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small" color="error" onClick={() => handleDeleteWord(word.id)}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {selectedCategory.vocabularies?.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 8, color: 'text.secondary' }}>
                                            <TopicIcon sx={{ fontSize: 48, opacity: 0.2, mb: 1 }} />
                                            <Typography>No words in this topic yet.</Typography>
                                            <Button variant="text" onClick={() => { setEditingWord({ english: '', vietnamese: '', pronunciation: '', attributes: '' }); setWordDialogOpen(true); }}>
                                                Add the first word
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Card>
        );
    };

    return (
        <Box sx={{ height: 'calc(100vh - 100px)' }}>
            <Grid container spacing={3} sx={{ height: '100%' }}>
                <Grid item xs={12} md={3} sx={{ height: '100%' }}>
                    {renderTopicList()}
                </Grid>
                <Grid item xs={12} md={9} sx={{ height: '100%' }}>
                    {renderWordList()}
                </Grid>
            </Grid>

            {/* Topic Dialog */}
            <Dialog open={topicDialogOpen} onClose={() => setTopicDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>{editingTopic?.id ? 'Edit Topic' : 'New Topic'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1 }}>
                        <TextField
                            autoFocus
                            label="Topic Name"
                            fullWidth
                            variant="outlined"
                            value={editingTopic?.categoryName || ''}
                            onChange={(e) => setEditingTopic({ ...editingTopic, categoryName: e.target.value })}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setTopicDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveTopic}>Save Topic</Button>
                </DialogActions>
            </Dialog>

            {/* Word Dialog */}
            <Dialog open={wordDialogOpen} onClose={() => setWordDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingWord?.id ? 'Edit Word' : 'Add New Word'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    label="English Word"
                                    fullWidth
                                    required
                                    value={editingWord?.english || ''}
                                    onChange={(e) => setEditingWord({ ...editingWord, english: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Vietnamese Definition"
                                    fullWidth
                                    required
                                    value={editingWord?.vietnamese || ''}
                                    onChange={(e) => setEditingWord({ ...editingWord, vietnamese: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="Pronunciation (IPA)"
                                    fullWidth
                                    placeholder="/.../"
                                    value={editingWord?.pronunciation || ''}
                                    onChange={(e) => setEditingWord({ ...editingWord, pronunciation: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="Attributes (Type)"
                                    fullWidth
                                    placeholder="noun, verb..."
                                    value={editingWord?.attributes || ''}
                                    onChange={(e) => setEditingWord({ ...editingWord, attributes: e.target.value })}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setWordDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveWord}>Save Word</Button>
                </DialogActions>
            </Dialog>

            {/* Upload Dialog */}
            <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)}>
                <DialogTitle>Upload {uploadType === 'image' ? 'Image' : 'Audio'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2, p: 3, border: '2px dashed grey', borderRadius: 2, textAlign: 'center', cursor: 'pointer' }}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                            Select a {uploadType} file to upload
                        </Typography>
                        <input
                            type="file"
                            id="upload-file-input"
                            accept={uploadType === 'image' ? "image/*" : "audio/*"}
                            style={{ display: 'none' }}
                            onChange={(e) => setSelectedFile(e.target.files[0])}
                        />
                        <label htmlFor="upload-file-input">
                            <Button variant="outlined" component="span">
                                Choose File
                            </Button>
                        </label>
                        {selectedFile && (
                            <Typography variant="body2" sx={{ mt: 2, color: 'primary.main' }}>
                                Selected: {selectedFile.name}
                            </Typography>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" disabled={!selectedFile} onClick={handleUpload}>Upload</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
