import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080', // API Gateway
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Send cookies with cross-origin requests
});

export default api;
