import { useState, useEffect } from 'react';
import { Grid, Paper, Typography, Box, Card, Avatar, LinearProgress } from '@mui/material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import {
    People as PeopleIcon,
    LibraryBooks as TestsIcon,
    History as HistoryIcon,
    TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import DashboardService from '../../services/DashboardService';

export default function DashboardPage() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalTests: 0,
        totalAttempts: 0,
        weeklyActivity: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await DashboardService.getStats();
            if (response.success || response.isSuccess) {
                setStats(response.data);
            }
        } catch (error) {
            console.error("Failed to load dashboard stats", error);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, icon, color, subtitle }) => (
        <Card sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: 2, borderRadius: 3 }}>
            <Box>
                <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                    {title}
                </Typography>
                <Typography variant="h4" fontWeight="800" sx={{ my: 1, color: 'text.primary' }}>
                    {loading ? '-' : value.toLocaleString()}
                </Typography>
                <Typography variant="caption" color={color} fontWeight="bold">
                    {subtitle}
                </Typography>
            </Box>
            <Avatar variant="rounded" sx={{ bgcolor: `${color}15`, color: color, width: 56, height: 56 }}>
                {icon}
            </Avatar>
        </Card>
    );

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="800" gutterBottom>
                    Dashboard Overview
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Welcome back! Here's what's happening with your learning platform today.
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {/* Stats Cards */}
                <Grid item xs={12} md={4}>
                    <StatCard
                        title="TOTAL USERS"
                        value={stats.totalUsers}
                        icon={<PeopleIcon />}
                        color="#2563eb"
                        subtitle="Active Learners"
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatCard
                        title="AVAILABLE TESTS"
                        value={stats.totalTests}
                        icon={<TestsIcon />}
                        color="#7c3aed"
                        subtitle="Ready for practice"
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatCard
                        title="TOTAL ATTEMPTS"
                        value={stats.totalAttempts}
                        icon={<HistoryIcon />}
                        color="#059669"
                        subtitle="Completed sessions"
                    />
                </Grid>

                {/* Activity Chart */}
                <Grid item xs={12}>
                    <Card sx={{ p: 3, boxShadow: 2, borderRadius: 3 }}>
                        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box>
                                <Typography variant="h6" fontWeight="bold">Activity Overview</Typography>
                                <Typography variant="body2" color="text.secondary">Test attempts over the last 7 days</Typography>
                            </Box>
                        </Box>

                        <Box sx={{ width: '100%', height: 350 }}>
                            {loading ? (
                                <LinearProgress />
                            ) : (
                                <ResponsiveContainer>
                                    <AreaChart data={stats.weeklyActivity}>
                                        <defs>
                                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                        <XAxis
                                            dataKey="label"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#6b7280' }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#6b7280' }}
                                        />
                                        <Tooltip
                                            contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#2563eb"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorValue)"
                                            name="Attempts"
                                            animationDuration={1500}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </Box>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
