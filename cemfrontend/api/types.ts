export interface MinimalUser {
	id: string;
	username: string;
	first_name: string;
	last_name: string;
}

export type Location = {
	latitude: number;
	longitude: number;
};

export interface IncidentReport {
	id: string;
	reporter: MinimalUser;
	created_at: number;
	location?: Location;
}
