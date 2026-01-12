import axios from 'axios';

const API_URL = 'http://localhost:7716/elearning/dashboard';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };
};

const getStats = async () => {
    try {
        const response = await axios.get(`${API_URL}/stats`, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error("Error fetching dashboard stats", error);
        throw error;
    }
};

export default {
    getStats
};
