import axios from 'axios';
import { getCookie, setCookie } from 'cookies-next';
import {
  Alert,
  Asset,
  IncidentReport,
  MaintenanceLog,
  Person,
  Location,
  Site,
  AssetType,
  Bounds, MinimalUser, Building, Floor,
} from './types';
import {FloorDraft} from "../app/(dashboard)/assets/components/filter/createBuilding/useCreateBuildingState";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
export const AUTH_TOKEN_KEY = 'auth-token';

async function fileToBase64(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result)); // Extract base64 string
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

const Api = (() => {
  const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  axiosInstance.interceptors.request.use((config) => {
    const token = getCookie(AUTH_TOKEN_KEY);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  return {
    login: async (username: string, password: string) => {
      const response = await axiosInstance.post('auth', { username, password });

      if (response.status === 200) {
        setCookie(AUTH_TOKEN_KEY, response.data.access_token);
      }
    },

    checkAuth: async (): Promise<boolean> => {
      let authenticated = false;
      const response = await axiosInstance
        .get('check_auth')
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
        'report_incident',
        location ? { location } : undefined
      );
      return response.data.incident_report;
    },

    resolveIncident: async (incidentId: string): Promise<IncidentReport> => {
      const response = await axiosInstance.post<{ incident_report: IncidentReport }>(
        'resolve_incident',
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
    }: {
      name: string;
      address: string;
      bounds: Bounds;
      longitude: number;
      latitude: number;
    }): Promise<Site> => {
      const response = await axiosInstance.post<Site>(
        'site/',
        {
          name,
          address,
          longitude,
          latitude,
          bounds,
        },
        {
          method: 'CREATE',
        }
      );
      return response.data;
    },

    getSites: async (): Promise<Site[]> => {
      const response = await axiosInstance.get<Site[]>('site/');
      return response.data;
    },

    createBuilding: async ({
      siteId,
       name,
       floors,
     }: {
      siteId: string;
      name: string;
      floors: FloorDraft[];
    }): Promise<Site> => {
      const formattedFloors = await Promise.all(
        floors.map(async ({ name: floorName, floorPlanImage, floorPlanBounds }, i) => {
          const base64Image = await fileToBase64(floorPlanImage!);
          return {
            name: floorName,
            floor_plan: base64Image,
            floor_plan_bounds: floorPlanBounds,
            sort_order: i,
          };
        })
      );

      const response = await axiosInstance.post<Building>(
          'building/',
          {
            site: siteId,
            name,
            floors: formattedFloors,
          },
          {
            method: 'CREATE',
          }
      );
      return response.data;
    },

    getAssetTypes: async (): Promise<AssetType[]> => {
      const response = await axiosInstance.get<AssetType[]>('asset_type/');
      return response.data;
    },

    createAssetType: async ({ name, iconIdentifier }: { name: string; iconIdentifier: string }) => {
      const response = await axiosInstance.post<AssetType>('asset_type/', {
        name,
        icon_identifier: iconIdentifier,
      });
      return response.data;
    },

    getAssets: async (): Promise<Asset[]> => {
      const response = await axiosInstance.get<Asset[]>('asset/');
      return response.data;
    },

    createAsset: async ({
      floor,
      name,
      assetType,
      longitude,
      latitude,
      photo,
      nextMaintenanceDate,
      managedBy,
    }: {
      floor: string;
      name: string;
      assetType: string;
      longitude: number;
      latitude: number;
      photo?: File;
      nextMaintenanceDate: Date;
      managedBy?: string;
    }): Promise<Asset> => {
      const payload = {
        floor,
        name,
        asset_type: assetType,
        longitude,
        latitude,
        next_maintenance_date: nextMaintenanceDate.toISOString().split('T')[0],
        managed_by: managedBy,
      };

      if (photo) payload.photo = await fileToBase64(photo);

      const response = await axiosInstance.post('asset/', payload, {
        method: 'CREATE',
      });
      return response.data;
    },

    createMaintenanceLog: async ({
      assetId,
      notes,
      photo,
      nextMaintenanceDate,
    }: {
      assetId: string;
      notes: string;
      photo?: File;
      nextMaintenanceDate?: Date;
    }) => {
      const payload = {
        asset: assetId,
        notes,
        next_maintenance_date: nextMaintenanceDate?.toISOString().split('T')[0],
      };

      if (photo) {
        payload.photo = await fileToBase64(photo);
      }

      const response = await axiosInstance.post<MaintenanceLog>('maintenance_log/', payload, {
        method: 'CREATE',
      });
      return response.data;
    },

    getUsers: async (): Promise<MinimalUser[]> => {
      const response = await axiosInstance.get('user/');
      return response.data;
    },
  };
})();

export default Api;
