import axios from 'axios';
import { getCookie } from 'cookies-next';
import { produce } from 'immer';

const AUTH_TOKEN_KEY = 'auth-token';

axios.interceptors.request.use(
    (config) => {
        const authToken = getCookie(AUTH_TOKEN_KEY);

        return produce(config, (draftConfig) => {
            if (authToken) {
                draftConfig.headers.Authorization = `Token ${authToken}`;
            }
        });
    }, 
    (error) => {
        // Do something with request error
        return Promise.reject(error);
    }
);

const Api = (() => {
    const instance = axios.create({
        baseURL: 'http://127.0.0.1:8000/api/',
    });

    return {
        login: (username: string, password: string) => {
            console.log(username, password);
            instance.post('auth', { username, password }).then(console.log);
        }
    };
})();

export default Api;