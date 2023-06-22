import axios from 'axios';
import { getCookie, setCookie } from 'cookies-next';
import { produce } from 'immer';

export const AUTH_TOKEN_KEY = 'auth-token';

const Api = (() => {
    const instance = axios.create({
        baseURL: 'http://127.0.0.1:8000/api/',
    });

    instance.interceptors.request.use(
        (config) => {
            const authToken = getCookie(AUTH_TOKEN_KEY);
            
            if (authToken) {
                config.headers.Authorization = `Token ${authToken}`;
            }

            return config;
        }, 
        (error) => {
            // Do something with request error
            return Promise.reject(error);
        }
    );

    return {
        login: async (username: string, password: string) => {
            const response = await instance.post<{token: string}>('auth', { username, password })

            if (response.status === 200) {
                setCookie(AUTH_TOKEN_KEY, response.data.token);
            }
        },
        reportIncident: async () => {
            const response = await instance.post<{}>('report-incident')
        }
    };
})();

export default Api;