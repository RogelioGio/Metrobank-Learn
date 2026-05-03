import axios from 'axios';
import { Navigate } from 'react-router-dom';

const axiosClient = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`
});

let isRefreshing = false;
let failedQueue = [];


const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        }
        else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
}

axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('ACCESS_TOKEN');

        // User Inactivity handling
        const lastActivity = parseInt(localStorage.getItem('LAST_ACTIVITY'), 10);
        const inactivityTime = 5 * 60 * 60 * 1000; // 5 hours

        if (lastActivity && Date.now() - lastActivity > inactivityTime) {
            localStorage.removeItem('ACCESS_TOKEN');
            localStorage.removeItem('LAST_ACTIVITY');
            return Promise.reject(new Error('User is inactive'));
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            localStorage.setItem('LAST_ACTIVITY', Date.now()); // Update activity timestamp
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// axiosClient.interceptors.response.use(
//     (response) => {
//         // Do something with response data
//         return response;
//     }, (error) => {
//         // Do something with response error
//         const {response} = error;

//         return Promise.reject(error)
//     });

axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const refreshToken = localStorage.getItem('REFRESH_TOKEN');
        const token = localStorage.getItem('ACCESS_TOKEN');

        if (error.response?.status === 401 && !originalRequest._retry && refreshToken) {
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers['Authorization'] = 'Bearer ' + token;
                        return axiosClient(originalRequest);
                    })
                .catch(err => Promise.reject(err));
            }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/refresh-token`, {
            refresh_token: refreshToken
            });

            const newAccessToken = res.data.access_token;
            localStorage.setItem('ACCESS_TOKEN', newAccessToken);
            localStorage.setItem('REFRESH_TOKEN', res.data.refresh_token);

            processQueue(null, newAccessToken);

            originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
            return axiosClient(originalRequest);
        } catch (err) {
            processQueue(err, null);
            localStorage.removeItem('ACCESS_TOKEN');
            localStorage.removeItem('REFRESH_TOKEN');
            window.location.href = '/login';
        } finally {
            isRefreshing = false;
        }
    }

        return Promise.reject(error);
    }
);


export default axiosClient;

export const uploadPhoto = axios.create({
    baseURL: "https://api.cloudinary.com/v1_1/ddqp4u84v",
})


