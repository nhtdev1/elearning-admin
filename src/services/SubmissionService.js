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

const getAllSubmissions = async (page = 0, size = 10, keyword = '', testMode = '', sortBy = 'completedAt', order = 'desc') => {
    try {
        let url = `${API_URL}/attempts?page=${page}&size=${size}&keyword=${keyword}&sortBy=${sortBy}&order=${order}`;
        if (testMode) {
            url += `&testMode=${testMode}`;
        }
        const response = await axios.get(url, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error("Error fetching submissions", error);
        throw error;
    }
};

export default {
    getAllSubmissions
};
