import axios from 'axios';
import { getCookie, setCookie } from 'cookies-next';
import { produce } from 'immer';
import { Alert, IncidentReport } from './types';
import { Location } from './types';

const BASE_URL = 'http://127.0.0.1:8000/api';
export const AUTH_TOKEN_KEY = 'auth-token';

const Api = (() => {
	const axiosInstance = axios.create({
		baseURL: BASE_URL,
		headers: {
			'Content-Type': 'application/json',
		},
	});

	axiosInstance.interceptors.request.use(function (config) {
		const token = getCookie(AUTH_TOKEN_KEY);

		if (token) {
			config.headers['Authorization'] = `Token ${token}`;
		}

		return config;
	});

	return {
		login: async (username: string, password: string) => {
			const response = await axiosInstance.post('auth', { username, password });

			if (response.status === 200) {
				setCookie(AUTH_TOKEN_KEY, response.data.token);
			}
		},

		reportIncident: async ({ location }: { location?: Location }): Promise<IncidentReport> => {
			const response = await axiosInstance.post(
				'report-incident',
				location ? { location } : undefined
			);
			return response.data.incident_report;
		},

		getIncidentReport: async (incidentId: string): Promise<IncidentReport> => {
			const response = await axiosInstance.get(`incident/${incidentId}/`);
			return response.data;
		},

        sendAlert: async (incidentId: string, body: string): Promise<Alert> => {
            const response = await axiosInstance.post<{ alert: Alert }>('alert/', { incident_report: incidentId, body });
            return response.data.alert;
        }
	};
})();

export default Api;
