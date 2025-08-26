import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error general:', error.message);
    return Promise.reject(error);
  }
);

export default api;
