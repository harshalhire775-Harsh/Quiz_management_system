import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api',
});

API.interceptors.request.use((req) => {
    const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
    if (userInfo) {
        req.headers.Authorization = `Bearer ${userInfo.token}`;
    }
    return req;
});

API.interceptors.response.use(
    (response) => response,
    (error) => {
        // Only logout on 401 (Unauthorized). 
        // 403 (Forbidden) means authenticated but no permission, so we shouldn't log out.
        if (error.response && error.response.status === 401) {
            sessionStorage.removeItem('userInfo');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default API;
