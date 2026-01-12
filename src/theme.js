import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#2563eb', // Modern Blue (Tailwind-like)
            light: '#60a5fa',
            dark: '#1e40af',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#7c3aed', // Violet
            light: '#a78bfa',
            dark: '#5b21b6',
            contrastText: '#ffffff',
        },
        background: {
            default: '#f3f4f6', // Light Gray background
            paper: '#ffffff',
        },
        text: {
            primary: '#111827', // Gray 900
            secondary: '#4b5563', // Gray 600
        },
        success: {
            main: '#10b981',
        },
        error: {
            main: '#ef4444',
        }
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h4: {
            fontWeight: 700,
            fontSize: '1.75rem',
            color: '#111827',
        },
        h5: {
            fontWeight: 600,
            color: '#374151',
        },
        h6: {
            fontWeight: 600,
            fontSize: '1.1rem',
        },
        button: {
            textTransform: 'none', // Remove all-caps
            fontWeight: 600,
        }
    },
    shape: {
        borderRadius: 12, // More rounded
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                    },
                },
                containedPrimary: {
                    background: 'linear-gradient(45deg, #2563eb 30%, #3b82f6 90%)',
                }
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)', // Subtle shadow
                    backgroundImage: 'none',
                },
                rounded: {
                    borderRadius: 16,
                }
            },
        },
        MuiTableCell: {
            styleOverrides: {
                head: {
                    backgroundColor: '#f9fafb',
                    fontWeight: 600,
                    color: '#374151',
                    borderBottom: '1px solid #e5e7eb',
                },
                root: {
                    borderBottom: '1px solid #f3f4f6',
                }
            }
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    '&:hover': {
                        backgroundColor: '#f9fafb', // Hover state
                    }
                }
            }
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    marginBottom: 4,
                    '&.Mui-selected': {
                        backgroundColor: '#eff6ff', // Light blue bg
                        color: '#2563eb',
                        borderLeft: '4px solid #2563eb',
                        '&:hover': {
                            backgroundColor: '#dbeafe',
                        }
                    }
                }
            }
        }
    },
});

export default theme;
