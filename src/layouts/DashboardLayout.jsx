import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    CssBaseline,
    AppBar,
    Toolbar,
    Typography,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    IconButton,
    Avatar,
    Menu,
    MenuItem
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    LibraryBooks as TestsIcon,
    School as VocabIcon,
    Assignment as AssignmentIcon,
    Logout as LogoutIcon
} from '@mui/icons-material';

const drawerWidth = 280;

export default function DashboardLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        handleClose();
        navigate('/login');
    };

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
        { text: 'Users', icon: <PeopleIcon />, path: '/users' },
        { text: 'TOEIC Tests', icon: <TestsIcon />, path: '/tests' },
        { text: 'Submissions', icon: <AssignmentIcon />, path: '/submissions' },
        { text: 'Vocabulary', icon: <VocabIcon />, path: '/vocabulary' },
    ];

    // Get user from local storage for avatar
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userInitials = (user.firstName?.[0] || 'A') + (user.lastName?.[0] || '');

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />

            {/* Main AppBar - White and Clean */}
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    color: 'text.primary',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                }}
            >
                <Toolbar>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700, color: 'text.primary' }}>
                            {menuItems.find(item => item.path === location.pathname)?.text || 'Dashboard'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                            sx={{
                                bgcolor: 'primary.main',
                                cursor: 'pointer',
                                width: 40,
                                height: 40,
                                boxShadow: 2
                            }}
                            onClick={handleMenu}
                        >
                            {userInitials || 'A'}
                        </Avatar>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorEl}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                            PaperProps={{
                                elevation: 0,
                                sx: {
                                    overflow: 'visible',
                                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                                    mt: 1.5,
                                    '& .MuiAvatar-root': {
                                        width: 32,
                                        height: 32,
                                        ml: -0.5,
                                        mr: 1,
                                    },
                                    '&:before': {
                                        content: '""',
                                        display: 'block',
                                        position: 'absolute',
                                        top: 0,
                                        right: 14,
                                        width: 10,
                                        height: 10,
                                        bgcolor: 'background.paper',
                                        transform: 'translateY(-50%) rotate(45deg)',
                                        zIndex: 0,
                                    },
                                },
                            }}
                        >
                            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                                <ListItemIcon>
                                    <LogoutIcon fontSize="small" color="error" />
                                </ListItemIcon>
                                Logout
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Dark Sidebar */}
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        bgcolor: '#111827', // Dark Gray/Black
                        color: '#9ca3af',   // Light Gray Text
                        borderRight: 'none'
                    },
                }}
            >
                {/* Brand Area */}
                <Box sx={{
                    p: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    color: 'white',
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <Avatar
                        variant="rounded"
                        sx={{
                            bgcolor: 'primary.main',
                            background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                            width: 40,
                            height: 40
                        }}
                    >
                        E
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle1" fontWeight="800" sx={{ letterSpacing: 1, lineHeight: 1.2 }}>
                            E-LEARNING
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                            Admin Console
                        </Typography>
                    </Box>
                </Box>

                {/* Navigation Items */}
                <Box sx={{ overflow: 'auto', p: 2, mt: 2 }}>
                    <Typography variant="overline" sx={{ px: 2, mb: 1, display: 'block', color: 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: '0.7rem' }}>
                        MENU
                    </Typography>
                    <List>
                        {menuItems.map((item) => {
                            const active = location.pathname === item.path;
                            return (
                                <ListItem
                                    key={item.text}
                                    disablePadding
                                    sx={{ mb: 1 }}
                                >
                                    <IconButton
                                        onClick={() => navigate(item.path)}
                                        sx={{
                                            width: '100%',
                                            justifyContent: 'flex-start',
                                            borderRadius: 2,
                                            px: 2,
                                            py: 1.5,
                                            color: active ? 'white' : 'inherit',
                                            bgcolor: active ? 'primary.main' : 'transparent',
                                            '&:hover': {
                                                bgcolor: active ? 'primary.dark' : 'rgba(255,255,255,0.05)',
                                                color: 'white'
                                            },
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <ListItemIcon sx={{
                                            minWidth: 40,
                                            color: active ? 'white' : 'inherit'
                                        }}>
                                            {item.icon}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={item.text}
                                            primaryTypographyProps={{
                                                fontSize: '0.9rem',
                                                fontWeight: active ? 600 : 500
                                            }}
                                        />
                                        {active && (
                                            <Box sx={{
                                                width: 6,
                                                height: 6,
                                                bgcolor: 'white',
                                                borderRadius: '50%',
                                                ml: 1
                                            }} />
                                        )}
                                    </IconButton>
                                </ListItem>
                            );
                        })}
                    </List>
                </Box>

                {/* Bottom Profile/Info Section */}
                <Box sx={{ mt: 'auto', p: 3, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <Box sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'rgba(255,255,255,0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                    }}>
                        <Avatar src={user.avatar ? `http://localhost:7716/elearning${user.avatar}` : ''} sx={{ width: 32, height: 32 }} />
                        <Box sx={{ overflow: 'hidden' }}>
                            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }} noWrap>
                                {user.firstName || 'Admin'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }} noWrap display="block">
                                {user.email || 'admin@gmail.com'}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Drawer>

            {/* Main Content Area */}
            <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, bgcolor: '#f3f4f6', minHeight: '100vh' }}>
                <Toolbar /> {/* Spacer for Fixed AppBar */}
                <Box sx={{ mt: 2 }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
}
