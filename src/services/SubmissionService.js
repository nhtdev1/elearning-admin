import axios from 'axios';

const API_URL = 'http://localhost:7716/elearning';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };
};

const getAllSubmissions = async (page = 0, size = 10) => {
    try {
        const response = await axios.get(`${API_URL}/attempts?page=${page}&size=${size}`, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error("Error fetching submissions", error);
        throw error;
    }
};

export default {
    getAllSubmissions
};
