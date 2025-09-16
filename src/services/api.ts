// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de request: agrega el token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // o desde cookies
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error general:', error.message);
    return Promise.reject(error);
  }
);

export default api;
