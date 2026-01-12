import axios from 'axios';

const BASE_URL = 'http://localhost:7716/elearning';
const API_URL_CATEGORIES = `${BASE_URL}/vocab-categories`;
const API_URL_WORDS = `${BASE_URL}/vocabularies`;

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };
};

/* --- CATEGORIES (TOPICS) --- */

const getAllCategories = async () => {
    try {
        const response = await axios.get(API_URL_CATEGORIES, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error("Error fetching categories", error);
        throw error;
    }
};

const getCategoryDetails = async (id) => {
    try {
        const response = await axios.get(`${API_URL_CATEGORIES}/${id}`, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error("Error fetching category details", error);
        throw error;
    }
};

const createCategory = async (data) => {
    try {
        const response = await axios.post(API_URL_CATEGORIES, data, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error("Error creating category", error);
        throw error;
    }
};

const updateCategory = async (id, data) => {
    try {
        const response = await axios.put(`${API_URL_CATEGORIES}/${id}`, data, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error("Error updating category", error);
        throw error;
    }
};

const deleteCategory = async (id) => {
    try {
        await axios.delete(`${API_URL_CATEGORIES}/${id}`, getAuthHeader());
        return { success: true };
    } catch (error) {
        console.error("Error deleting category", error);
        return { success: false, error };
    }
};

/* --- WORDS --- */

const addWordToCategory = async (categoryId, wordData) => {
    try {
        const response = await axios.post(`${API_URL_CATEGORIES}/${categoryId}`, wordData, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error("Error adding word", error);
        throw error;
    }
}

const updateWord = async (wordId, wordData) => {
    try {
        const response = await axios.put(`${API_URL_WORDS}/${wordId}`, wordData, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error("Error updating word", error);
        throw error;
    }
};

const deleteWord = async (wordId) => {
    try {
        await axios.delete(`${API_URL_WORDS}/${wordId}`, getAuthHeader());
        return { success: true };
    } catch (error) {
        console.error("Error deleting word", error);
        throw error;
    }
};

const uploadWordImage = async (wordId, file) => {
    const formData = new FormData();
    formData.append('image', file);
    try {
        const response = await axios.post(`${API_URL_WORDS}/${wordId}/upload-image`, formData, {
            ...getAuthHeader(),
            'Content-Type': 'multipart/form-data'
        });
        return response.data;
    } catch (error) {
        console.error("Error uploading word image", error);
        throw error;
    }
}

const uploadWordAudio = async (wordId, file) => {
    const formData = new FormData();
    formData.append('audio', file);
    try {
        const response = await axios.post(`${API_URL_WORDS}/${wordId}/upload-audio`, formData, {
            ...getAuthHeader(),
            'Content-Type': 'multipart/form-data'
        });
        return response.data;
    } catch (error) {
        console.error("Error uploading word audio", error);
        throw error;
    }
}

export default {
    getAllCategories,
    getCategoryDetails,
    createCategory,
    updateCategory,
    deleteCategory,
    addWordToCategory,
    updateWord,
    deleteWord,
    uploadWordImage,
    uploadWordAudio
};
