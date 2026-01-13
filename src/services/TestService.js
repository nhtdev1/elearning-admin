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

const uploadTestsByExcel = async (file) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axios.post(`${API_URL}/upload-tests-by-excel`, formData, {
            ...getAuthHeader(),
            headers: {
                ...getAuthHeader().headers,
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error uploading excel tests", error);
        throw error;
    }
};

const addQuestionPartOne = async (testId, data) => {
    return _addQuestionToPart(testId, 'part-one', data);
};
const addQuestionPartTwo = async (testId, data) => {
    return _addQuestionToPart(testId, 'part-two', data);
};
const addQuestionPartThree = async (testId, data) => {
    return _addQuestionToPart(testId, 'part-three', data);
};
const addQuestionPartFour = async (testId, data) => {
    return _addQuestionToPart(testId, 'part-four', data);
};
const addQuestionPartFive = async (testId, data) => {
    return _addQuestionToPart(testId, 'part-five', data);
};
const addQuestionPartSix = async (testId, data) => {
    return _addQuestionToPart(testId, 'part-six', data);
};
const addQuestionPartSeven = async (testId, data) => {
    return _addQuestionToPart(testId, 'part-seven', data);
};

const _addQuestionToPart = async (testId, partEndpoint, data) => {
    try {
        const response = await axios.post(`${API_URL}/${testId}/${partEndpoint}`, data, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error(`Error adding question to ${partEndpoint}`, error);
        throw error;
    }
};

const uploadQuestionMedia = async (partEndpoint, questionId, audioFile, imageFile) => {
    try {
        const formData = new FormData();
        if (audioFile) formData.append('audio', audioFile);
        if (imageFile) formData.append('image', imageFile);

        const response = await axios.post(`http://localhost:7716/elearning/questions/${partEndpoint}/upload-file/${questionId}`, formData, {
            ...getAuthHeader(),
            headers: {
                ...getAuthHeader().headers,
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error uploading media", error);
        throw error;
    }
};

const updateQuestionPartOne = async (questionId, data) => _updateQuestionInPart('part-one', questionId, data);
const updateQuestionPartTwo = async (questionId, data) => _updateQuestionInPart('part-two', questionId, data);
const updateQuestionPartThree = async (questionId, data) => _updateQuestionInPart('part-three', questionId, data);
const updateQuestionPartFour = async (questionId, data) => _updateQuestionInPart('part-four', questionId, data);
const updateQuestionPartFive = async (questionId, data) => _updateQuestionInPart('part-five', questionId, data);
const updateQuestionPartSix = async (questionId, data) => _updateQuestionInPart('part-six', questionId, data);
const updateQuestionPartSeven = async (questionId, data) => _updateQuestionInPart('part-seven', questionId, data);

const _updateQuestionInPart = async (partEndpoint, questionId, data) => {
    try {
        const response = await axios.put(`http://localhost:7716/elearning/questions/${partEndpoint}/${questionId}`, data, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error(`Error updating question in ${partEndpoint}`, error);
        throw error;
    }
};

const TestService = {
    getAllTests,
    createTest,
    getTest,
    updateTest,
    deleteTest,
    getAttemptDetails,
    uploadTestsByExcel,
    addQuestionPartOne,
    addQuestionPartTwo,
    addQuestionPartThree,
    addQuestionPartFour,
    addQuestionPartFive,
    addQuestionPartSix,
    addQuestionPartSeven,
    updateQuestionPartOne,
    updateQuestionPartTwo,
    updateQuestionPartThree,
    updateQuestionPartFour,
    updateQuestionPartFive,
    updateQuestionPartSix,
    updateQuestionPartSeven,
    uploadQuestionMedia
};

export default TestService;
