import axios from 'axios';
import { getCookie, setCookie } from 'cookies-next';
import { Alert, IncidentReport, Person } from './types';
import { Location, Site } from './types';
import { Bounds } from '../app/(dashboard)/report/[incidentReportId]/MapView';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
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

		checkAuth: async (): Promise<boolean> => {
			let authenticated = false;
			const response = await axiosInstance
				.get('check-auth')
				.then(() => {
					authenticated = true;
				})
				.catch(() => {
					authenticated = false;
				});
			return authenticated;
		},

		reportIncident: async ({ location }: { location?: Location }): Promise<IncidentReport> => {
			const response = await axiosInstance.post<{ incident_report: IncidentReport }>(
				'report-incident',
				location ? { location } : undefined
			);
			return response.data.incident_report;
		},

		resolveIncident: async (incidentId: string): Promise<IncidentReport> => {
			const response = await axiosInstance.post<{ incident_report: IncidentReport }>(
				'resolve-incident',
				{ incident_id: incidentId }
			);
			return response.data.incident_report;
		},

		getIncidentReport: async (incidentId: string): Promise<IncidentReport> => {
			const response = await axiosInstance.get(`incident/${incidentId}/`);
			return response.data;
		},

		sendAlert: async (incidentId: string, body: string): Promise<Alert> => {
			const response = await axiosInstance.post<{ alert: Alert }>('alert/', {
				incident_report: incidentId,
				body,
			});
			return response.data.alert;
		},

		getPeople: async (): Promise<Person[]> => {
			const response = await axiosInstance.get<Person[]>('person/');
			return response.data;
		},

		createPerson: async ({
			firstName,
			lastName,
			phone,
		}: {
			firstName: string;
			lastName: string;
			phone: string;
		}): Promise<Person> => {
			const response = await axiosInstance.post<Person>(
				'person/',
				{ first_name: firstName, last_name: lastName, phone },
				{ method: 'CREATE' }
			);
			return response.data;
		},

		deletePerson: async (personId: string): Promise<void> => {
			await axiosInstance.delete(`person/${personId}/`);
		},

		createSite: async ({
			name,
			address,
			bounds,
			longitude,
			latitude,
			floorPlan,
			floorPlanBounds,
		}: {
			name: string;
			address: string;
			bounds: Bounds;
			longitude: number;
			latitude: number;
			floorPlan: File;
			floorPlanBounds: Bounds;
		}): Promise<Site> => {
			const formData = new FormData();
			formData.append('name', name); // Add other fields as required
			formData.append('address', address);
			formData.append('longitude', String(longitude));
			formData.append('latitude', String(latitude));
			formData.append('bounds', JSON.stringify(bounds));
			formData.append('floor_plan_bounds', JSON.stringify(floorPlanBounds));
			formData.append('floor_plan', floorPlan);

			const response = await axiosInstance.post<Site>('site/', formData, {
				method: 'CREATE',
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});
			return response.data;
		},

		getSites: async (): Promise<Site[]> => {
			const response = await axiosInstance.get<Site[]>('site/');
			return response.data;
		},
	};
})();

export default Api;
