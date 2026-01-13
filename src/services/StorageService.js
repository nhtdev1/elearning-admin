import axios from 'axios';

const STORAGE_API_URL = 'http://localhost:8888/storage/files';

const uploadFile = async (file) => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post(`${STORAGE_API_URL}/upload-file`, formData);

        // Return the full data object as requested
        return response.data;
    } catch (error) {
        console.error("Error uploading file to storage", error);
        throw error;
    }
};

const StorageService = {
    uploadFile
};

export default StorageService;
