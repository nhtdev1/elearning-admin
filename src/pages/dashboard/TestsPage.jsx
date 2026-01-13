import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TablePagination,
    Card,
    InputAdornment,
    Chip,
    Avatar
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    Quiz as QuizIcon,
    Timer as TimerIcon,
    Visibility as VisibilityIcon,
    FilterList as FilterListIcon,
    Clear as ClearIcon,
    UploadFile as UploadFileIcon
} from '@mui/icons-material';
import TestService from '../../services/TestService';
import { toast } from 'react-toastify';
import { useRef } from 'react';

export default function TestsPage() {
    const navigate = useNavigate();
    const [tests, setTests] = useState([]);
    const [totalTests, setTotalTests] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [keyword, setKeyword] = useState('');
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    // Dialog State
    const [open, setOpen] = useState(false);
    const [editingTest, setEditingTest] = useState(null);
    const [formData, setFormData] = useState({
        testName: '',
        description: '',
        timerInMinutes: 60,
        startTime: new Date().toISOString()
    });

    useEffect(() => {
        fetchTests();
    }, [page, rowsPerPage, keyword]);

    const fetchTests = async () => {
        try {
            const response = await TestService.getAllTests(page, rowsPerPage, keyword);
            if (response.success || response.isSuccess) {
                setTests(response.data.data || []);
                setTotalTests(response.data.totalElement || 0);
            }
        } catch (error) {
            console.error("Failed to fetch tests", error);
        }
    };

    const handleSearch = (e) => {
        setKeyword(e.target.value);
        setPage(0);
    };

    const handleOpenDialog = (test = null) => {
        if (test) {
            setEditingTest(test);
            setFormData({
                testName: test.testName || '',
                description: test.description || '',
                timerInMinutes: test.timerInMinutes || 60,
                startTime: test.startTime || new Date().toISOString()
            });
        } else {
            setEditingTest(null);
            setFormData({
                testName: '',
                description: '',
                timerInMinutes: 60,
                startTime: new Date().toISOString()
            });
        }
        setOpen(true);
    };

    const handleSave = async () => {
        try {
            if (editingTest) {
                await TestService.updateTest(editingTest.id, formData);
                toast.success("Test updated successfully");
            } else {
                await TestService.createTest(formData);
                toast.success("Test created successfully");
            }
            setOpen(false);
            fetchTests();
        } catch (error) {
            toast.error("Failed to save test");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this test?")) {
            try {
                await TestService.deleteTest(id);
                toast.success("Test deleted");
                fetchTests();
            } catch (error) {
                toast.error("Failed to delete test");
            }
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            await TestService.uploadTestsByExcel(file);
            toast.success("Tests imported successfully from Excel");
            fetchTests();
        } catch (error) {
            toast.error("Failed to import tests. Please check the file format.");
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <Card sx={{ border: 'none', boxShadow: 3, overflow: 'hidden' }}>
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main' }} variant="rounded">
                        <QuizIcon />
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>Test Management</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <input
                        type="file"
                        accept=".xlsx, .xls"
                        style={{ display: 'none' }}
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                    />
                    <Button
                        variant="outlined"
                        startIcon={<UploadFileIcon />}
                        onClick={() => fileInputRef.current.click()}
                        disabled={uploading}
                    >
                        {uploading ? 'Importing...' : 'Import Excel'}
                    </Button>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
                        Create Test
                    </Button>
                </Box>
            </Box>

            {/* Search Toolbar */}
            <Paper sx={{ p: 2, mb: 3, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', mr: 1 }}>
                    <FilterListIcon />
                    <Typography variant="subtitle2" sx={{ ml: 1, fontWeight: 600 }}>Search:</Typography>
                </Box>

                <TextField
                    placeholder="Search tests by name or description..."
                    size="small"
                    value={keyword}
                    onChange={handleSearch}
                    sx={{ flexGrow: 1 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                        endAdornment: keyword && (
                            <InputAdornment position="end">
                                <IconButton size="small" onClick={() => { setKeyword(''); setPage(0); }}>
                                    <ClearIcon fontSize="small" />
                                </IconButton>
                            </InputAdornment>
                        )
                    }}
                />

                {keyword && (
                    <Button
                        color="inherit"
                        size="small"
                        onClick={() => {
                            setKeyword('');
                            setPage(0);
                        }}
                        startIcon={<ClearIcon />}
                    >
                        Clear Search
                    </Button>
                )}
            </Paper>

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Test Name</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Duration</TableCell>
                            <TableCell>Parts</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tests.map((test) => (
                            <TableRow key={test.id} hover>
                                <TableCell>#{test.id}</TableCell>
                                <TableCell>
                                    <Typography
                                        variant="subtitle2"
                                        sx={{
                                            fontWeight: 600,
                                            color: 'primary.main',
                                            cursor: 'pointer',
                                            '&:hover': { textDecoration: 'underline' }
                                        }}
                                        onClick={() => navigate(`/tests/${test.id}`)}
                                    >
                                        {test.testName}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 300 }} noWrap>
                                        {test.description || 'No description'}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        icon={<TimerIcon sx={{ fontSize: '14px !important' }} />}
                                        label={`${test.timerInMinutes} min`}
                                        size="small"
                                        variant="outlined"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                        {/* Mocking parts indicator for visual flair */}
                                        <Chip label="P1" size="small" sx={{ height: 20, fontSize: 10, bgcolor: 'grey.100' }} />
                                        <Chip label="P7" size="small" sx={{ height: 20, fontSize: 10, bgcolor: 'grey.100' }} />
                                        {/* In real app, check test.questionPartOne, etc */}
                                    </Box>
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" color="info" onClick={() => navigate(`/tests/${test.id}`)}>
                                        <VisibilityIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" color="primary" onClick={() => handleOpenDialog(test)}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" color="error" onClick={() => handleDelete(test.id)}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {tests.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                    <Typography color="text.secondary">No tests found</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                count={totalTests}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
            />

            {/* Create/Edit Dialog */}
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        boxShadow: 24,
                        backgroundImage: 'none'
                    }
                }}
            >
                <DialogTitle sx={{
                    pb: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5
                }}>
                    <Avatar sx={{ bgcolor: editingTest ? 'primary.light' : 'success.light', color: editingTest ? 'primary.main' : 'success.main', width: 32, height: 32 }}>
                        {editingTest ? <EditIcon sx={{ fontSize: 18 }} /> : <AddIcon sx={{ fontSize: 18 }} />}
                    </Avatar>
                    <Typography variant="h6" component="span" fontWeight="700">
                        {editingTest ? 'Edit Test' : 'New Test'}
                    </Typography>
                </DialogTitle>

                <DialogContent sx={{ pt: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
                        <TextField
                            label="Test Name"
                            fullWidth
                            value={formData.testName}
                            onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
                            variant="outlined"
                            InputProps={{ sx: { borderRadius: 2 } }}
                        />
                        <TextField
                            label="Description"
                            fullWidth
                            multiline
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            variant="outlined"
                            InputProps={{ sx: { borderRadius: 2 } }}
                        />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="Duration (Minutes)"
                                type="number"
                                fullWidth
                                value={formData.timerInMinutes}
                                onChange={(e) => setFormData({ ...formData, timerInMinutes: e.target.value })}
                                InputProps={{
                                    sx: { borderRadius: 2 },
                                    startAdornment: <InputAdornment position="start"><TimerIcon fontSize="small" /></InputAdornment>
                                }}
                            />
                            {/* Potential future field: Difficulty or Category */}
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button
                        onClick={() => setOpen(false)}
                        sx={{ borderRadius: 2, px: 2, color: 'text.secondary' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disableElevation
                        startIcon={editingTest ? <EditIcon /> : <AddIcon />}
                        sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}
                    >
                        {editingTest ? 'Save Changes' : 'Create Test'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Card >
    );
}
