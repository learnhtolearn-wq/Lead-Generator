# Lead Generation Workflow — SOP

## Purpose

This document describes the standard operating procedure for the AI Lead Generator pipeline. It is the authoritative reference for understanding how data flows through the system and what each component is responsible for.

---

## Actors

| Actor | Technology | Responsibility |
|---|---|---|
| User | Browser | Submits search parameters |
| Frontend | Next.js 15 | Collects input, triggers job, polls status, displays results |
| API Route | Next.js Route Handler | Validates input, triggers Trigger.dev job, returns runId |
| Job | Trigger.dev v3 | Orchestrates Firecrawl + Supabase, returns leads |
| Scraper | Firecrawl | Finds and extracts structured lead data from web pages |
| Database | Supabase Postgres | Persists leads per run |

---

## Data Shapes

### Job Payload (frontend → job)

```typescript
interface JobPayload {
  description: string;  // e.g. "SaaS companies selling to restaurants"
  niche: string;        // e.g. "restaurant tech"
  geography?: string;   // e.g. "United States" (optional)
}
```

### Lead (job output + DB row)

```typescript
interface Lead {
  company_name: string;
  contact_name: string;
  email: string;
  website_url: string;
}
```

### Leads Table Row

```typescript
interface LeadRow extends Lead {
  id: string;          // uuid
  run_id: string;      // Trigger.dev run ID
  created_at: string;  // ISO timestamp
}
```

---

## Step-by-Step Workflow

### Phase 1 — User Input (Browser)

1. User lands on `http://localhost:3000` (or production URL).
2. Sees a form with three fields:
   - **Business description** (textarea, required) — what kind of leads to find.
   - **Industry / niche** (text input, required) — narrows Firecrawl search query.
   - **Target geography** (text input, optional) — appended to search query if provided.
3. Clicks **Generate Leads**.
4. Form enters a loading state (button disabled, spinner shown).

### Phase 2 — Job Trigger (API Route)

5. Browser sends `POST /api/generate` with JSON body: `{ description, niche, geography }`.
6. API route validates all required fields are non-empty strings.
7. API route calls `tasks.trigger("generate-leads", payload)` using `TRIGGER_SECRET_KEY`.
8. Returns `200 { runId: "run_abc123" }` to browser.
9. If validation fails, returns `400 { error: "..." }`.

### Phase 3 — Job Execution (Trigger.dev)

10. Job receives `{ description, niche, geography }`.
11. Constructs Firecrawl search query: `"{niche} B2B companies {geography} contact information"`.
12. Calls `firecrawl.search(query, { limit: 15 })` — returns up to 15 page URLs.
13. For each URL (up to 15), calls `firecrawl.scrapeUrl(url, { formats: ["extract"], extract: { schema: LeadSchema } })` to extract structured lead data.
14. Filters out results with missing `company_name` or `email`.
15. Deduplicates by `website_url`.
16. Caps the list at 10 leads.
17. Inserts all leads into Supabase `leads` table with the `run_id`.
18. Returns the leads array as job output.

### Phase 4 — Polling (Browser)

19. Browser calls `runs.retrieve(runId)` every 3 seconds using `NEXT_PUBLIC_TRIGGER_PUBLIC_API_KEY`.
20. Possible statuses: `QUEUED`, `EXECUTING`, `COMPLETED`, `FAILED`, `CANCELED`.
21. Shows a spinner and status message while not `COMPLETED` or `FAILED`.
22. On `COMPLETED`: reads `run.output` (the leads array) and renders the table.
23. On `FAILED`: shows an error message.

---

## Error Handling Rules

| Scenario | Behaviour |
|---|---|
| Firecrawl search returns 0 results | Job returns empty array; frontend shows "No leads found" |
| Firecrawl scrape returns no valid fields | That URL is skipped |
| Supabase insert fails | Job throws; Trigger.dev marks run as FAILED; frontend shows error |
| API route missing required fields | Returns 400 with descriptive error |
| Job runs longer than 5 minutes | Trigger.dev auto-cancels (set `maxDuration: 300` in task config) |

---

## Firecrawl Query Construction

```
"{niche} B2B companies {geography} contact information"
```

Examples:
- `"restaurant tech B2B companies United States contact information"`
- `"HR software B2B companies Europe contact information"`
- `"cybersecurity B2B companies contact information"` (no geography)

---

## Deduplication Logic

After scraping, build a `Set<string>` of seen `website_url` values. Skip any lead whose `website_url` is already in the set. Apply before the 10-lead cap.
