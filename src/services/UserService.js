import axios from 'axios';

const API_URL = 'http://localhost:7716/elearning/users';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
};

const getAllUsers = async (page = 0, size = 10, keyword = '') => {
    try {
        const response = await axios.get(`${API_URL}?pageNumber=${page}&pageSize=${size}&keyword=${keyword}`, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error("Error fetching users", error);
        throw error;
    }
};

const deleteUser = async (id) => {
    // We map 'deletion' to disabling the user
    try {
        const response = await axios.patch(`${API_URL}/${id}/status?enabled=false`, {}, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error("Error deleting user", error);
        throw error;
    }
};

const updateUser = async (id, data) => {
    try {
        // Update basic profile is complex (separate DTO), but for Admin Dashboard usually we update Role and Status.
        // We will make separate calls for Role and Status if they changed.

        const promises = [];

        if (data.enabled !== undefined) {
            promises.push(axios.patch(`${API_URL}/${id}/status?enabled=${data.enabled}`, {}, getAuthHeader()));
        }

        if (data.roles !== undefined) {
            promises.push(axios.patch(`${API_URL}/${id}/role?role=${data.roles}`, {}, getAuthHeader()));
        }

        await Promise.all(promises);
        return { success: true };
    } catch (error) {
        console.error("Error updating user", error);
        throw error;
    }
};

export default {
    getAllUsers,
    deleteUser,
    updateUser
};
