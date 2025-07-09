import axios from 'axios';

const createAPI = () => {
    const api = axios.create({
        baseURL: `${import.meta.env.VITE_URL_API_AI_RECOMMENDATION_SERVICE || 'http://localhost:8088'}`,
        headers: {
            "Content-Type": "application/json",
        },
        timeout: 60000, // Timeout sau 60 giây
    });

    return api;
};

export default createAPI;