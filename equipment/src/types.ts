export interface Lead {
  company_name: string;
  contact_name: string;
  email: string;
  website_url: string;
}

export interface JobPayload {
  description: string;
  niche: string;
  geography?: string;
}
