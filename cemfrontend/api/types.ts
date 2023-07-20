export interface MinimalUser {
	id: string;
	username: string;
	first_name: string;
	last_name: string;
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
