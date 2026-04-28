import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
   //withCredentials: true,// csrf protection backend send xsrf_token front back send x-xcsrf_token
  headers: {
   
    // 'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// injection bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      toast.error('Session expirée, veuillez vous reconnecter');
    }
    return Promise.reject(error);
  }
);

export default api;