import FirecrawlApp from "@mendable/firecrawl-js";

if (!process.env.FIRECRAWL_API_KEY) {
  throw new Error("FIRECRAWL_API_KEY environment variable is required");
}

export const firecrawl = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY,
});

export interface SearchResult {
  url: string;
  title?: string;
  description?: string;
}

export async function searchCompanyPages(
  query: string,
  limit = 15
): Promise<SearchResult[]> {
  const response = await firecrawl.search(query, { limit });
  if (!response.success) {
    throw new Error(`Firecrawl search failed: ${JSON.stringify(response)}`);
  }
  return (response.data ?? []).map((item) => ({
    url: item.url ?? "",
    title: item.title,
    description: item.description,
  }));
}

const leadExtractionSchema = {
  type: "object",
  properties: {
    company_name: { type: "string", description: "Name of the company" },
    contact_name: { type: "string", description: "Name of a key contact or founder" },
    email: { type: "string", description: "Business contact email address" },
    website_url: { type: "string", description: "Company website or LinkedIn URL" },
  },
  required: ["company_name", "email"],
} as const;

export interface ScrapedLead {
  company_name: string;
  contact_name: string;
  email: string;
  website_url: string;
}

export async function scrapeLeadFromUrl(url: string): Promise<ScrapedLead | null> {
  try {
    const response = await firecrawl.scrapeUrl(url, {
      formats: ["extract"],
      extract: { schema: leadExtractionSchema },
    });

    if (!response.success || !response.extract) return null;

    const data = response.extract as Partial<ScrapedLead>;
    if (!data.company_name || !data.email) return null;

    return {
      company_name: data.company_name,
      contact_name: data.contact_name ?? "",
      email: data.email,
      website_url: data.website_url ?? url,
    };
  } catch {
    return null;
  }
}
