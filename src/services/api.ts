import axios from 'axios';

const createAPI = (service: string) => {
    const api = axios.create({
        baseURL: `${import.meta.env.VITE_URL_API_GATEWAY || 'http://localhost:3000'}/${service}`,
        headers: {
            "Content-Type": "application/json"
        }
    });

    // Add a request interceptor
    api.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Add a response interceptor
    api.interceptors.response.use(
        (response) => response,
        (error) => {
            return Promise.reject(error);
        }
    );

    return api;
};

export default createAPI;
