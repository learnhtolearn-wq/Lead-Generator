import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../lib/firecrawl.js", () => ({
  searchCompanyPages: vi.fn(),
  scrapeLeadFromUrl: vi.fn(),
}));

vi.mock("../lib/supabase.js", () => ({
  saveLeads: vi.fn(),
}));

vi.stubEnv("FIRECRAWL_API_KEY", "test-fc-key");
vi.stubEnv("SUPABASE_URL", "https://test.supabase.co");
vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-service-role-key");
vi.stubEnv("TRIGGER_SECRET_KEY", "tr_dev_test");

import { searchCompanyPages, scrapeLeadFromUrl } from "../lib/firecrawl.js";
import { saveLeads } from "../lib/supabase.js";
import { buildSearchQuery, processLeads } from "./generate-leads.js";

const mockSearch = vi.mocked(searchCompanyPages);
const mockScrape = vi.mocked(scrapeLeadFromUrl);
const mockSave = vi.mocked(saveLeads);

describe("buildSearchQuery", () => {
  it("includes niche and description in the query", () => {
    const query = buildSearchQuery({ niche: "restaurant tech", description: "SaaS tools for restaurants" });
    expect(query).toContain("restaurant tech");
    expect(query).toContain("B2B");
  });

  it("appends geography when provided", () => {
    const query = buildSearchQuery({ niche: "HR software", description: "HR tools for SMBs", geography: "United States" });
    expect(query).toContain("United States");
  });

  it("omits geography when not provided", () => {
    const query = buildSearchQuery({ niche: "HR software", description: "HR tools for SMBs" });
    expect(query).not.toContain("undefined");
    expect(query).not.toContain("null");
  });
});

describe("processLeads", () => {
  it("deduplicates leads by website_url", () => {
    const leads = [
      { company_name: "Acme", contact_name: "Alice", email: "alice@acme.com", website_url: "https://acme.com" },
      { company_name: "Acme Duplicate", contact_name: "Bob", email: "bob@acme.com", website_url: "https://acme.com" },
      { company_name: "Beta Corp", contact_name: "Carol", email: "carol@beta.com", website_url: "https://beta.com" },
    ];
    const result = processLeads(leads);
    expect(result).toHaveLength(2);
    expect(result[0].company_name).toBe("Acme");
    expect(result[1].company_name).toBe("Beta Corp");
  });

  it("caps results at 10 leads", () => {
    const leads = Array.from({ length: 15 }, (_, i) => ({
      company_name: `Company ${i}`,
      contact_name: `Contact ${i}`,
      email: `contact${i}@company${i}.com`,
      website_url: `https://company${i}.com`,
    }));
    const result = processLeads(leads);
    expect(result).toHaveLength(10);
  });

  it("returns empty array when given empty array", () => {
    expect(processLeads([])).toEqual([]);
  });
});
