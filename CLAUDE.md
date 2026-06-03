# AI Lead Generator — Project Bible

## ABE Framework

This project follows the ABE (Architect / Blueprints / Equipment) structure:

| Folder | Role |
|---|---|
| `blueprints/` | **B — Blueprints.** SOP documentation, workflow diagrams, and decision records. Read these before touching code. |
| `equipment/` | **E — Equipment.** The Trigger.dev background job runtime. An independent npm workspace. Runs separately from the frontend. |
| `frontend/` | **A — Architect surface.** Next.js 15 web app. Collects user input, triggers jobs, polls for results, displays leads. Deployed to Vercel. |

The root directory holds only shared config (`.gitignore`, `CLAUDE.md`). There is no root `package.json` — each workspace manages its own dependencies.

---

## Running the Equipment (Trigger.dev dev server)

```bash
cd equipment
cp .env.example .env          # fill in real values
npm install
npx trigger.dev@latest dev    # streams logs from your Trigger.dev cloud project
```

The dev server connects to your Trigger.dev cloud project and hot-reloads on file changes. Keep this terminal open while testing the frontend locally.

---

## Running the Frontend (Next.js dev server)

```bash
cd frontend
cp .env.local.example .env.local   # fill in real values
npm install
npm run dev                         # http://localhost:3000
```

Both servers must be running simultaneously for end-to-end local testing.

---

## Environment Variables

### equipment/.env

| Variable | Description |
|---|---|
| `TRIGGER_SECRET_KEY` | Trigger.dev secret key (starts with `tr_dev_` for dev, `tr_prod_` for prod) |
| `FIRECRAWL_API_KEY` | Firecrawl API key |
| `SUPABASE_URL` | Supabase project URL (`https://<ref>.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (bypasses RLS — keep secret) |

### frontend/.env.local

| Variable | Description |
|---|---|
| `TRIGGER_SECRET_KEY` | Same Trigger.dev secret key (used server-side to trigger jobs) |
| `NEXT_PUBLIC_TRIGGER_PUBLIC_API_KEY` | Trigger.dev public key (safe to expose — used client-side to poll runs) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (subject to RLS) |

---

## Lead Generation Pipeline (End-to-End)

```
Browser                  Next.js API Route            Trigger.dev Job              Supabase
  |                            |                             |                         |
  |-- POST /api/generate ----→ |                             |                         |
  |   { description,           |                             |                         |
  |     niche, geography }     |                             |                         |
  |                            |-- tasks.trigger() --------→ |                         |
  |                            |                             | Firecrawl.search()      |
  |                            |                             | (find company pages)    |
  |                            |                             |                         |
  |                            |                             | Firecrawl.scrape()      |
  |                            |                             | (extract lead fields    |
  |                            |                             |  per page)              |
  |                            |                             |                         |
  |                            |                             | dedup + cap at 10       |
  |                            |                             |                         |
  |                            |                             |-- INSERT leads --------→|
  |                            |                             |                         |
  |← { runId } --------------- |                             |← leads[] -------------- |
  |                            |                             |                         |
  | poll runs.retrieve(runId)  |                             |                         |
  | every 3s until COMPLETED   |                             |                         |
  |                            |                             |                         |
  | render leads table         |                             |                         |
```

1. User submits the form (`description`, `niche`, `geography`).
2. `POST /api/generate` calls `tasks.trigger("generate-leads", payload)` and returns `{ runId }`.
3. Browser polls `@trigger.dev/sdk` `runs.retrieve(runId)` every 3 seconds using the public API key.
4. The Trigger.dev job: searches Firecrawl for company pages → scrapes each → deduplicates by `website_url` → caps at 10 → inserts into `leads` table → returns the array as job output.
5. When `run.status === "COMPLETED"`, the browser reads `run.output` and renders the table.

---

## Supabase Table

Run this SQL in your Supabase project's SQL editor (Dashboard → SQL Editor):

```sql
create table leads (
  id uuid primary key default gen_random_uuid(),
  run_id text not null,
  company_name text,
  contact_name text,
  email text,
  website_url text,
  created_at timestamptz default now()
);
```

---

## Deployment

### Equipment (Trigger.dev)

```bash
cd equipment
npx trigger.dev@latest deploy
```

This builds and uploads the task to Trigger.dev cloud. Use your production `TRIGGER_SECRET_KEY` (`tr_prod_...`). Set it in your Trigger.dev project environment variables dashboard.

### Frontend (Vercel)

1. Push the repo to GitHub.
2. Import the project in Vercel → set **Root Directory** to `frontend`.
3. Add all `frontend/.env.local` variables in Vercel's Environment Variables UI.
4. Deploy. Vercel auto-deploys on every push to `main`.
