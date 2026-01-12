import axios from 'axios';

const API_URL = 'http://localhost:7716/elearning/tests';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };
};

const getAllTests = async (page = 0, size = 10, keyword = '') => {
    try {
        const response = await axios.get(`${API_URL}?pageNumber=${page}&pageSize=${size}&keyword=${keyword}`, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error("Error fetching tests", error);
        throw error;
    }
};

const createTest = async (testData) => {
    try {
        const response = await axios.post(API_URL, testData, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error("Error creating test", error);
        throw error;
    }
};

const updateTest = async (id, testData) => {
    try {
        const response = await axios.put(`${API_URL}/${id}`, testData, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error("Error updating test", error);
        throw error;
    }
};

const deleteTest = async (id) => {
    try {
        await axios.delete(`${API_URL}/${id}`, getAuthHeader());
        return { success: true };
    } catch (error) {
        console.error("Error deleting test", error);
        throw error;
    }
};

const getTest = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error("Error fetching test details", error);
        throw error;
    }
};



const getAttemptDetails = async (attemptId) => {
    try {
        // Use the new endpoint for full details
        const response = await axios.get(`${API_URL.replace('/tests', '')}/attempt-result/${attemptId}/full-details`, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error("Error fetching attempt details", error);
        throw error;
    }
};

const TestService = {
    getAllTests,
    createTest,
    getTest,
    updateTest,
    deleteTest,
    getAttemptDetails
};

export default TestService;
