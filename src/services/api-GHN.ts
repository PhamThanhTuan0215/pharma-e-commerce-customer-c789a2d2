import axios from 'axios';

const createAPI = () => {
    const api = axios.create({
        baseURL: `${import.meta.env.VITE_URL_API_GHN || 'https://online-gateway.ghn.vn/shiip/public-api'}`,
        headers: {
            "Content-Type": "application/json",
            "Token": `${import.meta.env.VITE_TOKEN_GHN}`
        }
    });

    return api;
};

export default createAPI;