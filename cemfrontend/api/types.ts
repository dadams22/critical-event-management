interface MinimalUser {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
}

interface IncidentReport {
    id: string;
    reporter: MinimalUser;
    created_at: number;
}
