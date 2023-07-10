import axios from 'axios';
import { getCookie, setCookie } from 'cookies-next';
import { produce } from 'immer';

const BASE_URL = 'http://127.0.0.1:8000/api';
export const AUTH_TOKEN_KEY = 'auth-token';

interface CustomRequestInit extends Omit<RequestInit, 'body'> {
    body?: object | string;
}

const Api = (() => {
    const fetchInstance = (url: string, fetchOptions?: CustomRequestInit): ReturnType<typeof fetch> => {
        const token = getCookie(AUTH_TOKEN_KEY);

        const options = produce(fetchOptions, draftOptions => {
            if (token) {
                draftOptions = draftOptions ?? {};
                draftOptions.headers = {
                    ...draftOptions?.headers,
                    Authorization: `Token ${token}`,
                };
            }

            if (draftOptions?.body) {
                draftOptions.body = JSON.stringify(draftOptions.body);
            }
        })

        return fetch(`${BASE_URL}/${url}`, options as RequestInit);
    };


    return {
        login: async (username: string, password: string) => {
            const response = await fetchInstance('auth', { method: 'POST', body: { username, password } });
            const { token }: { token: string } = await response.json();

            if (response.status === 200) {
                setCookie(AUTH_TOKEN_KEY, token);
            }
        },

        reportIncident: async (): Promise<IncidentReport> => {
            const response = await fetchInstance('report-incident', { method: 'POST' });
            const { incident_report }: { incident_report: IncidentReport } = await response.json();
            return incident_report;
        },

        getIncidentReport: async (incidentId: string): Promise<IncidentReport> => {
            const response = await fetchInstance(`incident/${incidentId}/`);
            const incident_report: IncidentReport = await response.json();
            return incident_report;
        }
    };
})();

export default Api;