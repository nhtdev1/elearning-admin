import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    TablePagination,
    Chip,
    Avatar,
    Card,
    InputAdornment,
    TextField
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    Person as PersonIcon,
    AdminPanelSettings as AdminIcon,
    SupervisedUserCircle as UserIcon,
    Block as BlockIcon,
    CheckCircle as CheckIcon
} from '@mui/icons-material';
import UserService from '../../services/UserService';
import { toast } from 'react-toastify';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Dialog
    const [open, setOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [selectedRole, setSelectedRole] = useState('ROLE_USER');
    const [selectedStatus, setSelectedStatus] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, [page, rowsPerPage]);

    const fetchUsers = async () => {
        try {
            const response = await UserService.getAllUsers(page, rowsPerPage);
            // Handle different potential response structures from backend/UserService
            // Should be structured as { users: [], totalElements: N } or standard Page

            let userList = [];
            let total = 0;

            if (response.data) {
                // Check if it's the Map structure or Page structure
                if (response.data.users) {
                    userList = response.data.users;
                    total = response.data['total-elements'] || response.data.totalElements || 0;
                } else if (response.data.content) {
                    userList = response.data.content;
                    total = response.data.totalElements || 0;
                }
            }

            setUsers(userList);
            setTotalUsers(total);
        } catch (error) {
            console.error("Failed to fetch users", error);
            toast.error("Could not load users");
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setSelectedRole(user.roles || 'ROLE_USER');
        setSelectedStatus(user.enabled !== false);
        setOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to disable this user?")) {
            try {
                await UserService.deleteUser(id);
                toast.success("User disabled");
                fetchUsers();
            } catch (error) {
                toast.error("Failed to disable user");
            }
        }
    }

    const handleSave = async () => {
        try {
            // Update Role
            if (editingUser.roles !== selectedRole) {
                await UserService.updateUser(editingUser.id, { role: selectedRole });
            }
            // Update Status
            if (editingUser.enabled !== selectedStatus) {
                await UserService.updateUser(editingUser.id, { hasEnable: selectedStatus });
            }

            toast.success("User updated");
            setOpen(false);
            fetchUsers();
        } catch (error) {
            toast.error("Update failed");
        }
    };

    const getRoleColor = (role) => {
        return role === 'ROLE_ADMIN' ? 'error' : 'info';
    };

    return (
        <Card sx={{ border: 'none', boxShadow: 3, overflow: 'hidden' }}>
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'secondary.light', color: 'secondary.main' }} variant="rounded">
                        <UserIcon />
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>User Management</Typography>
                </Box>
                {/* Search could be added here if backend supported it */}
            </Box>

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>User</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id} hover>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar src={user.avatar ? `http://localhost:7716/elearning${user.avatar}` : ''}>
                                            {user.firstName?.charAt(0)}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                {user.firstName} {user.lastName}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                ID: #{user.id}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={user.roles?.replace('ROLE_', '') || 'USER'}
                                        color={getRoleColor(user.roles)}
                                        size="small"
                                        variant="filled"
                                        sx={{ fontWeight: 600, borderRadius: 1 }}
                                    />
                                </TableCell>
                                <TableCell>
                                    {user.enabled ? (
                                        <Chip icon={<CheckIcon sx={{ fontSize: '14px !important' }} />} label="Active" color="success" size="small" variant="outlined" />
                                    ) : (
                                        <Chip icon={<BlockIcon sx={{ fontSize: '14px !important' }} />} label="Disabled" color="default" size="small" variant="outlined" />
                                    )}
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" color="primary" onClick={() => handleEdit(user)}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" color="error" onClick={() => handleDelete(user.id)} disabled={!user.enabled}>
                                        <BlockIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                count={totalUsers}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
            />

            {/* Edit Dialog */}
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                maxWidth="xs"
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
                    <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', width: 32, height: 32 }}>
                        <EditIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Typography variant="h6" fontWeight="700">
                        Edit User
                    </Typography>
                </DialogTitle>

                <DialogContent sx={{ pt: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
                        <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar src={editingUser?.avatar ? `http://localhost:7716/elearning${editingUser.avatar}` : ''}>
                                {editingUser?.firstName?.charAt(0)}
                            </Avatar>
                            <Box>
                                <Typography variant="subtitle2" fontWeight="600">
                                    {editingUser?.firstName} {editingUser?.lastName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {editingUser?.email}
                                </Typography>
                            </Box>
                        </Box>

                        <FormControl fullWidth size="medium">
                            <InputLabel>Role</InputLabel>
                            <Select
                                value={selectedRole}
                                label="Role"
                                onChange={(e) => setSelectedRole(e.target.value)}
                                sx={{ borderRadius: 2 }}
                            >
                                <MenuItem value="ROLE_USER">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <UserIcon fontSize="small" color="action" />
                                        User
                                    </Box>
                                </MenuItem>
                                <MenuItem value="ROLE_ADMIN">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <AdminIcon fontSize="small" color="primary" />
                                        <Typography color="primary" fontWeight="500">Admin</Typography>
                                    </Box>
                                </MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={selectedStatus ? 'true' : 'false'}
                                label="Status"
                                onChange={(e) => setSelectedStatus(e.target.value === 'true')}
                                sx={{ borderRadius: 2 }}
                            >
                                <MenuItem value="true">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CheckIcon fontSize="small" color="success" />
                                        Active
                                    </Box>
                                </MenuItem>
                                <MenuItem value="false">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <BlockIcon fontSize="small" color="error" />
                                        Disabled
                                    </Box>
                                </MenuItem>
                            </Select>
                        </FormControl>
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
                        sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}
                    >
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
}
