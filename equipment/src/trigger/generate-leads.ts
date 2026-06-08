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
  contact_title: string | null;
  email: string | null;
  website_url: string;
  location: string | null;
  score: number;
}

export const generateLeadsTask = task({
  id: "generate-leads",
  maxDuration: 300,
  run: async (payload: Payload, { ctx }) => {
    const { description, niche, geography } = payload;

    logger.log("Job started", { runId: ctx.run.id, description, niche, geography: geography ?? "(none)" });

    const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY! });
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { realtime: { transport: ws as unknown as typeof WebSocket } }
    );

    const searchQuery = [description, niche, geography, "company contact email"]
      .filter(Boolean)
      .join(" ");

    logger.log("Searching Firecrawl", { searchQuery });

    let searchResult: Awaited<ReturnType<typeof firecrawl.search>>;
    try {
      searchResult = await firecrawl.search(searchQuery, { limit: 15 });
    } catch (err) {
      logger.error("Firecrawl search threw an exception", {
        endpoint: "firecrawl.search",
        payload: { query: searchQuery, limit: 15 },
        timestamp: new Date().toISOString(),
        error: String(err),
      });
      return { leads: [] };
    }

    if (!searchResult.success || !searchResult.data?.length) {
      logger.warn("No search results returned from Firecrawl");
      return { leads: [] };
    }

    logger.log("Pages found to scrape", { count: searchResult.data.length });

    const leads: Lead[] = [];
    const seen = new Set<string>();

    for (const [i, page] of searchResult.data.entries()) {
      if (leads.length >= 10) {
        logger.log("Lead cap reached, stopping early", { cap: 10, pagesRemaining: searchResult.data.length - i });
        break;
      }
      if (!page.url) {
        logger.log("Skipping page with no URL", { index: i + 1 });
        continue;
      }
      if (seen.has(page.url)) {
        logger.log("Skipping duplicate URL", { url: page.url });
        continue;
      }
      seen.add(page.url);

      logger.log("Scraping page", { url: page.url, index: i + 1, total: searchResult.data.length });

      try {
        const scrapeResult = await firecrawl.scrapeUrl(page.url, {
          formats: ["extract"],
          extract: {
            prompt:
              "Extract from this page: the company name, a contact person's full name, their job title/role, their email address, and the company's city and country/state location. Return null for any field not found.",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            schema: {
              type: "object",
              properties: {
                company_name: { type: "string" },
                contact_name: { type: "string" },
                contact_title: { type: "string" },
                email: { type: "string" },
                location: { type: "string" },
              },
            } as any,
          },
        });

        if (!scrapeResult.success) {
          logger.warn("Scrape returned unsuccessful result", { url: page.url });
          continue;
        }

        const extracted = (scrapeResult as unknown as Record<string, unknown>).extract as Record<string, string> | undefined;

        // compute fit score: base 55 + data-quality bonuses + url-hash variation
        const urlHash = page.url.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
        let score = 55 + (urlHash % 8);
        if (extracted?.email) score += 18;
        if (extracted?.contact_name) score += 10;
        if (extracted?.contact_title) score += 8;
        if (extracted?.location) score += 5;
        score = Math.min(score, 99);

        leads.push({
          company_name: extracted?.company_name ?? null,
          contact_name: extracted?.contact_name ?? null,
          contact_title: extracted?.contact_title ?? null,
          email: extracted?.email ?? null,
          website_url: page.url,
          location: extracted?.location ?? null,
          score,
        });

        logger.log("Lead extracted", {
          url: page.url,
          company: extracted?.company_name ?? "(none)",
          contact: extracted?.contact_name ?? "(none)",
          email: extracted?.email ?? "(none)",
        });
      } catch (err) {
        logger.warn("Exception while scraping page", {
          endpoint: "firecrawl.scrapeUrl",
          payload: { url: page.url, formats: ["extract"] },
          timestamp: new Date().toISOString(),
          error: String(err),
        });
      }
    }

    logger.log("Scraping complete", { leadsFound: leads.length });

    if (leads.length === 0) {
      logger.warn("No leads extracted — returning empty result");
      return { leads: [] };
    }

    logger.log("Inserting leads into Supabase", { count: leads.length, runId: ctx.run.id });

    let inserted: Lead[] | null = null;
    try {
      const { data, error } = await supabase
        .from("leads")
        .insert(leads.map((lead) => ({ ...lead, run_id: ctx.run.id })))
        .select();

      if (error) {
        logger.error("Supabase insert returned an error", {
          endpoint: "supabase.from(leads).insert",
          payload: { count: leads.length, runId: ctx.run.id },
          timestamp: new Date().toISOString(),
          error: error.message,
        });
        throw new Error(`Supabase insert failed: ${error.message}`);
      }
      inserted = data;
    } catch (err) {
      if (err instanceof Error && err.message.startsWith("Supabase insert failed")) throw err;
      logger.error("Supabase insert threw an exception", {
        endpoint: "supabase.from(leads).insert",
        payload: { count: leads.length, runId: ctx.run.id },
        timestamp: new Date().toISOString(),
        error: String(err),
      });
      throw err;
    }

    logger.log("Leads saved successfully", { count: inserted?.length ?? 0, runId: ctx.run.id });

    logger.log("Job complete", { runId: ctx.run.id, totalLeadsReturned: inserted?.length ?? 0 });

    return { leads: inserted ?? [] };
  },
});
