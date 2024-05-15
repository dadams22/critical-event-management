import { AssetIconIdentifier } from '../app/(icons)/assetTypes';

export interface MinimalUser {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface Person {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
}

export interface PersonStatus {
  id: string;
  person: string;
  safe: boolean;
}

export type Location = {
  latitude: number;
  longitude: number;
};

export interface Alert {
  id: string;
  body: string;
  created_at: number;
  sender: MinimalUser;
}

export interface IncidentReport {
  id: string;
  reporter: MinimalUser;
  created_at: number;
  resolved_at?: string;
  location?: Location;
  alerts: Alert[];
  statuses: PersonStatus[];
}

export type Bounds = [number, number][];

export interface Floor {
  id: string;
  name: string;
  sort_order: number;
  floor_plan: string;
  floor_plan_bounds: Bounds;
}

export interface Site {
  id: string;
  name: string;
  address: string;
  longitude: number;
  latitude: number;
  location: Location;
  bounds: Bounds;
  floors: Floor[];
}

export interface AssetType {
  id: string;
  name: string;
  icon_identifier: AssetIconIdentifier;
}

export enum MaintenanceStatus {
  OUT_OF_COMPLIANCE = 'OUT_OF_COMPLIANCE',
  NEEDS_MAINTENANCE = 'NEEDS_MAINTENANCE',
  COMPLIANT = 'COMPLIANT',
}

export interface MaintenanceLog {
  id: string;
  created_at: string;
  notes: string;
  photo?: string;
}

export interface Asset {
  id: string;
  floor: Floor;
  name: string;
  asset_type: AssetType;
  longitude: number;
  latitude: number;
  photo: string;
  next_maintenance_date: string;
  maintenance_status: MaintenanceStatus;
  maintenance_logs: MaintenanceLog[];
  managed_by?: MinimalUser;
}
