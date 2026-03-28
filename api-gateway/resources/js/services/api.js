import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/v1',   // بورت الـ API Gateway
    withCredentials: true,                     // مهم جداً لـ Sanctum
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
});

// جلب CSRF Token (ضروري قبل كل طلب POST)
export const getCsrfToken = async () => {
    await api.get('/sanctum/csrf-cookie');
};

export const registerUser = async (userData) => {
    await getCsrfToken();
    const response = await api.post('/auth/register', userData);
    return response.data;
};

export const loginUser = async (credentials) => {
    await getCsrfToken();
    const response = await api.post('/auth/login', credentials);
    return response.data;
};

export const logoutUser = async () => {
    const response = await api.post('/auth/logout');
    return response.data;
};

export default api;