export interface Lead {
  id?: string;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  website_url: string;
  run_id?: string;
  created_at?: string;
}

export interface GenerateFormValues {
  description: string;
  niche: string;
  geography: string;
}

export interface HistoryEntry {
  id: string;
  niche: string;
  geo: string;
  leads: Lead[];
  createdAt: string;
}
