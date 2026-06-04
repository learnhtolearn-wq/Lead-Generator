import { task } from "@trigger.dev/sdk/v3";
import { searchCompanyPages, scrapeLeadFromUrl } from "../lib/firecrawl.js";
import { saveLeads } from "../lib/supabase.js";
import type { Lead, JobPayload } from "../types.js";

const MAX_LEADS = 10;
const MAX_SEARCH_RESULTS = 15;

export function buildSearchQuery(
  payload: Pick<JobPayload, "niche" | "description" | "geography">
): string {
  const geo = payload.geography ? ` ${payload.geography}` : "";
  return `${payload.niche} B2B companies${geo} contact information email`;
}

export function processLeads(leads: Lead[]): Lead[] {
  const seen = new Set<string>();
  const unique: Lead[] = [];

  for (const lead of leads) {
    if (!seen.has(lead.website_url)) {
      seen.add(lead.website_url);
      unique.push(lead);
    }
    if (unique.length >= MAX_LEADS) break;
  }

  return unique;
}

export const generateLeadsTask = task({
  id: "generate-leads",
  maxDuration: 300,
  run: async (payload: JobPayload, { ctx }) => {
    const runId = ctx.run.id;

    const query = buildSearchQuery(payload);
    console.log(`Searching Firecrawl with query: "${query}"`);

    const searchResults = await searchCompanyPages(query, MAX_SEARCH_RESULTS);
    console.log(`Found ${searchResults.length} pages to scrape`);

    if (searchResults.length === 0) return { leads: [] };

    const scrapePromises = searchResults.map((result) => scrapeLeadFromUrl(result.url));
    const scrapeResults = await Promise.all(scrapePromises);

    const rawLeads: Lead[] = scrapeResults.filter((lead): lead is Lead => lead !== null);
    console.log(`Extracted ${rawLeads.length} raw leads before dedup`);

    const leads = processLeads(rawLeads);
    console.log(`Final lead count after dedup: ${leads.length}`);

    await saveLeads(runId, leads);
    console.log(`Saved ${leads.length} leads to Supabase for run ${runId}`);

    return { leads };
  },
});
