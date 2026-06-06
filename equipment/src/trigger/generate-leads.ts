import { task, logger } from "@trigger.dev/sdk/v3";
import FirecrawlApp from "@mendable/firecrawl-js";
import { createClient } from "@supabase/supabase-js";
import ws from "ws";

interface Payload {
  description: string;
  niche: string;
  geography?: string;
}

interface Lead {
  company_name: string | null;
  contact_name: string | null;
  email: string | null;
  website_url: string;
}

export const generateLeadsTask = task({
  id: "generate-leads",
  maxDuration: 300,
  run: async (payload: Payload, { ctx }) => {
    const { description, niche, geography } = payload;

    const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY! });
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { realtime: { transport: ws as unknown as typeof WebSocket } }
    );

    const searchQuery = [description, niche, geography, "company contact email"]
      .filter(Boolean)
      .join(" ");

    logger.log("Searching for leads", { searchQuery });

    const searchResult = await firecrawl.search(searchQuery, { limit: 15 });

    if (!searchResult.success || !searchResult.data?.length) {
      logger.warn("No search results found");
      return { leads: [] };
    }

    logger.log("Found pages", { count: searchResult.data.length });

    const leads: Lead[] = [];
    const seen = new Set<string>();

    for (const page of searchResult.data) {
      if (leads.length >= 10) break;
      if (!page.url) continue;
      if (seen.has(page.url)) continue;
      seen.add(page.url);

      try {
        const scrapeResult = await firecrawl.scrapeUrl(page.url, {
          formats: ["extract"],
          extract: {
            prompt:
              "Extract the company name, a contact person's full name, and their email address from this page. Return null for any field not found.",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            schema: {
              type: "object",
              properties: {
                company_name: { type: "string" },
                contact_name: { type: "string" },
                email: { type: "string" },
              },
            } as any,
          },
        });

        if (!scrapeResult.success) continue;

        const extracted = (scrapeResult as unknown as Record<string, unknown>).extract as Record<string, string> | undefined;

        leads.push({
          company_name: extracted?.company_name ?? null,
          contact_name: extracted?.contact_name ?? null,
          email: extracted?.email ?? null,
          website_url: page.url,
        });

        logger.log("Scraped lead", { url: page.url, company: extracted?.company_name });
      } catch (err) {
        logger.warn("Failed to scrape page", { url: page.url, error: String(err) });
      }
    }

    logger.log("Total leads scraped", { count: leads.length });

    if (leads.length === 0) {
      return { leads: [] };
    }

    const { data: inserted, error } = await supabase
      .from("leads")
      .insert(leads.map((lead) => ({ ...lead, run_id: ctx.run.id })))
      .select();

    if (error) {
      logger.error("Supabase insert failed", { error: error.message });
      throw new Error(`Supabase insert failed: ${error.message}`);
    }

    logger.log("Inserted leads into Supabase", { count: inserted?.length ?? 0 });

    return { leads: inserted ?? [] };
  },
});
