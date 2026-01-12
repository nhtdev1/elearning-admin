import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Box,
    Button,
    Checkbox,
    Container,
    FormControlLabel,
    Grid,
    Link,
    TextField,
    Typography,
    Paper,
    InputAdornment,
    IconButton,
    CircularProgress,
    Avatar
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    Email as EmailIcon,
    Lock as LockIcon,
    Login as LoginIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';

export default function LoginPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: 'admin@gmail.com',
        password: 'password'
    });

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:7716/elearning/auth/login', formData);

            // Backend returns ResponseModel(success, data={token, ...})
            if (response.data.success || response.data.isSuccess) {
                const token = response.data.data.tokens.access.token;
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(response.data.data.user)); // Store user info
                toast.success("Welcome back!");
                navigate('/');
            } else {
                toast.error("Login failed: " + (response.data.message || "Unknown error"));
            }
        } catch (error) {
            console.error("Login error", error);
            if (error.response?.status === 401) {
                toast.error("Invalid email or password");
            } else {
                toast.error("Network error or server unreachable");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Grid container component="main" sx={{ height: '100vh', overflow: 'hidden' }}>
            {/* Left Side - Image/Brand */}
            <Grid
                item
                xs={false}
                sm={4}
                md={7}
                sx={{
                    backgroundImage: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: 'white',
                    p: 4
                }}
            >
                <Box sx={{ animation: 'fadeIn 1s ease-in', textAlign: 'center' }}>
                    <Typography variant="h2" component="h1" sx={{ fontWeight: 800, letterSpacing: 2, mb: 2 }}>
                        E-Learning
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 300, opacity: 0.9 }}>
                        Admin Dashboard & Management Console
                    </Typography>
                </Box>
                {/* Decorative circles */}
                <Box sx={{
                    position: 'absolute',
                    top: -100,
                    left: -100,
                    width: 300,
                    height: 300,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.1)'
                }} />
                <Box sx={{
                    position: 'absolute',
                    bottom: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.05)'
                }} />
            </Grid>

            {/* Right Side - Form */}
            <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box
                    sx={{
                        my: 8,
                        mx: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        maxWidth: 400,
                        width: '100%'
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: 'secondary.main', width: 56, height: 56 }}>
                        <LockIcon fontSize="large" />
                    </Avatar>
                    <Typography component="h1" variant="h4" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
                        Sign in
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                        Access your admin panel
                    </Typography>

                    <Box component="form" noValidate onSubmit={handleLogin} sx={{ mt: 1, width: '100%' }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EmailIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            autoComplete="current-password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockIcon color="action" />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                        <FormControlLabel
                            control={<Checkbox value="remember" color="primary" />}
                            label="Remember me"
                            sx={{ mt: 1 }}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: 2, fontSize: '1.1rem' }}
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </Button>
                        <Grid container>
                            <Grid item xs>
                                <Link href="#" variant="body2" underline="hover">
                                    Forgot password?
                                </Link>
                            </Grid>
                        </Grid>

                        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 5 }}>
                            Copyright © E-Learning Admin {new Date().getFullYear()}
                        </Typography>
                    </Box>
                </Box>
            </Grid>
        </Grid>
    );
}
