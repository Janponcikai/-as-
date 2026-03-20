# CLAUDE.md — RASI Process Manager

This file is the authoritative reference for AI assistants working in this repository. Reading this file alone should be sufficient to implement or maintain the project without needing any external brief.

---

## Project Overview

**RASI Process Manager** replaces a SharePoint + Excel solution for managing process documentation in a multinational industrial company. It provides a 4-level process hierarchy with RASI responsibility matrices, flow diagrams, job descriptions, and checklists.

**Key principles:**
- **Minimum text** — show what, who, when. Do not explain.
- **Enterprise look** — must feel like an expensive product
- **Multi-tenant from day 1** — every DB table has `tenantId`; every query filters by it
- **Zero-cost hosting** — Vercel free tier + Supabase free tier

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Runtime | Node.js 20+ |
| Framework | Next.js 14 (App Router, TypeScript strict mode) |
| Styling | Tailwind CSS + shadcn/ui |
| Flow diagrams | ReactFlow |
| Auth | NextAuth.js v5 (credentials provider — email + password) |
| Database | PostgreSQL via Supabase |
| ORM | Prisma |
| Email | Resend.com |
| File storage | Supabase Storage |
| Error tracking | Sentry |
| Import | xlsx + papaparse + pdf-parse |
| Export | @react-pdf/renderer |

---

## Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type-check
npx tsc --noEmit

# Lint
npm run lint

# Database — apply migrations
npx prisma migrate deploy

# Database — run in dev (with migration creation)
npx prisma migrate dev

# Database — seed with demo data
npx prisma db seed

# Open Prisma Studio
npx prisma studio
```

---

## Environment Variables

Copy `.env.example` to `.env.local`. Never commit actual values.

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Supabase PostgreSQL connection string | Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server only) | Yes |
| `NEXTAUTH_SECRET` | Random secret for NextAuth session signing | Yes |
| `NEXTAUTH_URL` | App base URL (http://localhost:3000 in dev) | Yes |
| `RESEND_API_KEY` | Resend.com API key for emails | Yes |
| `SENTRY_DSN` | Sentry project DSN | Yes |
| `NEXT_PUBLIC_APP_URL` | Public app URL | Yes |

---

## Project Structure

```
rasi-app/
├── app/
│   ├── (auth)/                           # Unauthenticated pages
│   │   ├── login/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/[token]/page.tsx
│   ├── (app)/                            # Authenticated app pages
│   │   ├── layout.tsx                    # Sidebar + breadcrumb + nav
│   │   ├── dashboard/page.tsx
│   │   ├── process-map/
│   │   │   ├── page.tsx                  # Level 1 — visual process map
│   │   │   └── [processId]/
│   │   │       ├── page.tsx              # Level 2 — process tree
│   │   │       └── [subProcessId]/
│   │   │           ├── page.tsx          # Level 3 — ReactFlow diagram
│   │   │           └── [stepId]/page.tsx # Level 4 — RASI matrix
│   │   ├── job-description/page.tsx
│   │   ├── checklist/
│   │   │   ├── page.tsx
│   │   │   └── [instanceId]/page.tsx
│   │   ├── search/page.tsx
│   │   └── account/page.tsx
│   ├── admin/
│   │   ├── layout.tsx                    # Admin-only layout
│   │   ├── dashboard/page.tsx
│   │   ├── users/page.tsx
│   │   ├── bug-reports/page.tsx
│   │   ├── import/page.tsx
│   │   └── audit-log/page.tsx
│   └── api/                              # API routes (see API Reference section)
├── components/
│   ├── ui/                               # shadcn/ui components
│   ├── process/
│   │   ├── ProcessMapLevel1.tsx          # Visual L1 map
│   │   ├── ProcessMapLevel2.tsx          # Hierarchical tree L2
│   │   ├── FlowDiagram.tsx              # ReactFlow wrapper L3
│   │   ├── FlowNode.tsx                 # Custom nodes (STEP/GATE/DECISION)
│   │   └── RasiMatrix.tsx               # RASI table L4
│   ├── admin/
│   │   ├── UserTable.tsx
│   │   ├── BugReportList.tsx
│   │   ├── ImportWizard.tsx
│   │   └── AuditLogTable.tsx
│   └── shared/
│       ├── BugReportButton.tsx          # Floating 🐛 report button
│       ├── Breadcrumb.tsx
│       ├── SearchBar.tsx
│       └── RoleGuard.tsx               # Component-level role protection
├── lib/
│   ├── prisma.ts                        # Singleton Prisma client
│   ├── auth.ts                          # NextAuth config
│   ├── email.ts                         # Resend wrapper
│   ├── import.ts                        # Excel/CSV parser
│   ├── export.ts                        # PDF export
│   ├── audit.ts                         # Audit log helper
│   └── validators.ts                    # Zod schemas
├── middleware.ts                         # Auth middleware + tenant check
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── .env.example
```

---

## Database Schema

All models include `tenantId`. **Every Prisma query must filter by `tenantId` from the session.** Never omit this filter.

### Models

| Model | Key fields | Notes |
|-------|-----------|-------|
| `Tenant` | `id`, `name`, `slug`, `plan` | Root of multi-tenancy |
| `User` | `id`, `tenantId`, `email`, `passwordHash`, `name`, `role`, `positionId` | Unique `[tenantId, email]` |
| `Position` | `id`, `tenantId`, `name`, `code`, `department` | Unique `[tenantId, code]` |
| `ProcessMap` | `id`, `tenantId`, `name`, `type` (MANAGING/CORE/SUPPORTING), `order` | Level 1 |
| `Process` | `id`, `tenantId`, `processMapId`, `name`, `code` | Level 2; unique `[tenantId, code]` |
| `SubProcess` | `id`, `tenantId`, `processId`, `name`, `code`, `flowData` (JSON) | Level 3; `flowData` = ReactFlow JSON |
| `ProcessStep` | `id`, `tenantId`, `subProcessId`, `name`, `code`, `type` (STEP/GATE/DECISION), `input`, `output` | Level 4 |
| `RasiMatrix` | `id`, `tenantId`, `stepId` (unique) | One per step |
| `RasiRow` | `id`, `rasiMatrixId`, `positionId`, `responsible`, `approve`, `support`, `inform` | One per position per matrix |
| `Attachment` | `id`, `tenantId`, `stepId`, `name`, `url`, `fileType`, `fileSize` | Stored in Supabase Storage |
| `BugReport` | `id`, `tenantId`, `userId`, `type`, `description`, `pageUrl`, `status` | Types: TEXT_ERROR/LOGIC_ERROR/APP_BUG |
| `AuditLog` | `id`, `tenantId`, `userId`, `action`, `entityType`, `entityId`, `oldValue`, `newValue` | JSON diffs |
| `ChecklistInstance` | `id`, `tenantId`, `processId`, `name`, `status` | Status: ACTIVE/COMPLETED/ARCHIVED |
| `ChecklistItem` | `id`, `instanceId`, `stepId`, `rasiRole`, `isDone`, `doneBy`, `doneAt` | |

### UserRole enum
`SUPER_ADMIN > ADMIN > EDITOR > VIEWER`

---

## Seed Data

Running `npx prisma db seed` creates:

- **Tenant:** `Interconnect Division` (slug: `interconnect`)
- **Users:** `admin@company.com` (Admin123!), `editor@company.com` (Editor123!), `viewer@company.com` (Viewer123!)
- **Positions:** CT (Costing Technician), PM (Process Manager), PQL (Project Quality Leader), PMGR (Project Manager), PE (Process Engineer), PLM (Plant Manager)
- **Process hierarchy** under KP2 — Project Engineering:
  - KP2.1 Project planning → KP2.1.1 IPP, KP2.1.2 Sales, KP2.1.3 Costing
  - KP2.2 Equipment duplication → KP2.2.1/KP2.2.2
  - KP2.3 New product implementation → KP2.3.A–E
  - KP2.4 Change management → KP2.4.A–D
- **Demo RASI** for KP2.3.49 (RFQ Team Nomination) with activities and full matrix

> **Warning:** Change all seed passwords before first production deployment. The admin dashboard must display a warning if default passwords have not been changed.

---

## Implementation Phases

Follow this order strictly. Do not skip phases.

### Phase 1 — Foundation
1. Initialize Next.js project (TypeScript strict, Tailwind, shadcn/ui)
2. Prisma schema + migration + seed data
3. NextAuth.js — email/password login
4. Middleware for route protection
5. Base layout (sidebar nav, breadcrumb, header)
6. Pages: login, forgot-password, reset-password, account

### Phase 2 — Process Hierarchy (read-only display)
7. Level 1 — ProcessMap visual map
8. Level 2 — Process hierarchical tree
9. Level 3 — ReactFlow flow diagram
10. Level 4 — RASI matrix display

### Phase 3 — Data Editing
11. Inline RASI matrix editing
12. CRUD for process hierarchy (L1–L4)
13. ReactFlow diagram editor
14. Attachment upload/management (Supabase Storage)
15. Linked processes management

### Phase 4 — Admin Panel
16. User management (CRUD, roles, password reset)
17. Bug report button + admin overview
18. Audit log display
19. Admin dashboard with statistics

### Phase 5 — Generators
20. Job Description generator + PDF export
21. Checklist generator + interactive management
22. Full-text search

### Phase 6 — Import & Polish
23. Import wizard (Excel/CSV for RASI, processes, users)
24. Sentry integration
25. Performance optimization (React Query caching)
26. Responsive design (tablet optimization)
27. PDF export for RASI matrices

---

## API Routes Reference

### Auth
| Method | Path | Min Role |
|--------|------|----------|
| POST | `/api/auth/[...nextauth]` | — |
| POST | `/api/auth/forgot-password` | — |
| POST | `/api/auth/reset-password` | — |

### Process Hierarchy
| Method | Path | Min Role |
|--------|------|----------|
| GET | `/api/process-maps` | VIEWER |
| POST | `/api/process-maps` | EDITOR |
| PUT | `/api/process-maps/[id]` | EDITOR |
| DELETE | `/api/process-maps/[id]` | ADMIN |
| GET | `/api/processes?processMapId=X` | VIEWER |
| POST/PUT | `/api/processes`, `/api/processes/[id]` | EDITOR |
| DELETE | `/api/processes/[id]` | ADMIN |
| GET | `/api/sub-processes?processId=X` | VIEWER |
| POST/PUT | `/api/sub-processes`, `/api/sub-processes/[id]` | EDITOR |
| DELETE | `/api/sub-processes/[id]` | ADMIN |
| GET | `/api/steps?subProcessId=X` | VIEWER |
| POST/PUT | `/api/steps`, `/api/steps/[id]` | EDITOR |
| DELETE | `/api/steps/[id]` | ADMIN |

### RASI
| Method | Path | Min Role |
|--------|------|----------|
| GET | `/api/rasi/[stepId]` | VIEWER |
| PUT | `/api/rasi/[stepId]` | EDITOR |

### Supporting
| Method | Path | Min Role |
|--------|------|----------|
| GET/POST/PUT/DELETE | `/api/positions`, `/api/positions/[id]` | ADMIN (mutations) |
| GET/POST/DELETE | `/api/attachments` | EDITOR (mutations) |
| GET | `/api/job-description?positionId=X&role=R` | VIEWER |
| GET/POST | `/api/checklist` | VIEWER |
| GET | `/api/checklist/[id]` | VIEWER |
| PUT | `/api/checklist/[id]/item` | VIEWER |
| GET | `/api/search?q=text` | VIEWER |
| POST | `/api/bug-reports` | VIEWER |

### Admin
| Method | Path | Min Role |
|--------|------|----------|
| GET/POST/PUT/DELETE | `/api/admin/users`, `/api/admin/users/[id]` | ADMIN |
| GET/PUT | `/api/admin/bug-reports`, `/api/admin/bug-reports/[id]` | ADMIN |
| POST/GET | `/api/admin/import`, `/api/admin/import/preview` | ADMIN |
| GET | `/api/admin/audit-log` | ADMIN |

---

## Page Specifications

### `/login`
- Email + password form with Zod validation
- Max 5 attempts / 15 minutes (in-memory or Upstash rate limiting)
- Generic error message (do not reveal if email exists)
- Link to forgot-password
- Redirect to `/app/dashboard` on success

### `/forgot-password`
- Email form; always respond "If the email exists, we will send a link" (security)
- Token: `crypto.randomBytes(32)`, stored hashed in DB, valid 1 hour

### `/reset-password/[token]`
- Verify token (exists + not expired)
- New password: min 8 chars, 1 uppercase, 1 number
- Delete token after success; redirect to login

### `/app/dashboard`
- User name greeting + quick stats (process count, sub-process count, RASI matrices)
- Last 5 changes from audit log
- Quick links: Process Map, Job Description, Checklist
- Admin: count of open bug reports

### `/app/process-map` (Level 1)
Visual map with three horizontal bands:
- **Top:** MANAGING PROCESSES — dark blue banner + cards FP1–FP4
- **Middle:** CORE PROCESSES — banner + cards KP1, KP2
- **Bottom:** SUPPORTING PROCESSES — banner + cards UP1–UP6
- Left side arrow: "Legal requirements, Customer requirements, Risks"
- Right side arrow: "Customers satisfaction"
- Bottom bar: "Feedback"
- Cards marked `*` (FP3, FP4) have visual distinction
- Each card is clickable → Level 2

### `/app/process-map/[processId]` (Level 2)
- Header table: code | name | Revision | Date | Pages | Name
- Clickable hierarchical tree of sub-processes → Level 3
- Breadcrumb: Process Map > [Process Name]

### `/app/process-map/[processId]/[subProcessId]` (Level 3)
ReactFlow diagram with node types:
- **STEP** — rounded rectangle, light blue
- **GATE** — rectangle with bold text, white with blue border
- **DECISION** — diamond shape
- **INPUT** — yellow background
- **PARALLEL** — purple background
- Edges with OK / NOK labels where needed
- Zoom + pan + minimap (bottom-right corner)
- Each node clickable → Level 4
- EDITOR role: can add/edit nodes and edges

### `/app/process-map/.../[stepId]` (Level 4)
Five sections on one page:

1. **Header** — code | name | Revision | Date | Pages | Name
2. **RASI table** — rows: positions; columns: activities; cells: R/A/S/I colored badge or empty; editable by EDITOR
3. **Step descriptions** — Input list, Output list, Activity descriptions
4. **Attachments** — cards: icon | name | type | date | Open/Download; EDITOR: "+ Add attachment"
5. **Linked processes** — clickable links to related steps/processes

### `/app/job-description`
- Position dropdown selector
- Result table: Map | Process | Sub-process | Step | R | A | S | I | Description
- Filter: show only R / only A / all
- "Export PDF" button
- Empty state: "Select a position to view job description"

### `/app/checklist`
- Form: process selector + optional position filter
- "Generate checklist" button
- List of existing checklists: name, process, date, status, progress
- Each checklist → `/app/checklist/[instanceId]`

### `/app/checklist/[instanceId]`
- Name + metadata (process, created by, date)
- Progress bar (X / Y done = Z%)
- Items grouped by sub-process
- Each item: checkbox | step name | RASI role | position
- Checkbox click saves who and when marked done
- Export to PDF
- Managers see all; others see only their items (by position/role)

### `/app/search`
- Full-text search across: process names, codes, descriptions, RASI positions
- Results grouped by type (Processes / Steps / RASI)
- Each result is clickable

### `/admin/import` — Import Wizard (4 steps)
1. **Upload** — drag & drop or file picker (.xlsx, .csv)
2. **Preview** — first 10 rows, auto-detect data type
3. **Mapping** — map columns to DB fields via dropdowns
4. **Import** — progress bar + report (added X / skipped Y / errors Z)

Supported import types: Positions (CSV), Process hierarchy L1–L4 (Excel), RASI matrices (Excel), Users bulk (CSV)

---

## Design System

### Colors
```css
--color-primary:     #1e3a5f;   /* dark blue — banners, main elements */
--color-secondary:   #2d5a9e;   /* mid blue — process cards */
--color-accent:      #4a7fd4;   /* light blue — hover, active state */
--color-managing:    #1e3a5f;
--color-core:        #2d5a9e;
--color-supporting:  #3b6cb5;
--color-rasi-r:      #dc2626;   /* Responsible — red */
--color-rasi-a:      #d97706;   /* Approve — orange */
--color-rasi-s:      #2563eb;   /* Support — blue */
--color-rasi-i:      #6b7280;   /* Inform — gray */
--color-gate:        #f59e0b;
--color-decision:    #8b5cf6;
--color-success:     #22c55e;
--color-danger:      #ef4444;
--color-bg:          #f8fafc;
--color-surface:     #ffffff;
--color-text:        #1e293b;
--color-text-muted:  #64748b;
--font-sans: 'DM Sans', sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

### Visual Rules
- Process codes (KP2.3.A) always in `font-mono`, bold
- RASI cells: centered bold letter in a colored circle badge
- All destructive actions: red button + confirm dialog before executing
- Loading state: **skeleton components** (never spinners)
- Empty state: illustration + brief action hint
- Breadcrumb: always visible below main navigation
- Toast notifications: top-right corner, auto-dismiss after 4 seconds

---

## Security & Middleware

### `middleware.ts` logic (runs on every request)
1. Verify NextAuth session token
2. No session → redirect to `/login` (except `/login`, `/forgot-password`, `/reset-password/*`)
3. `/admin/*` → verify `role === ADMIN || SUPER_ADMIN`
4. `/app/process-map/*` with non-GET method → verify `role === EDITOR || ADMIN`
5. All API routes verify session + tenantId inside the route handler

### API route protection pattern
```typescript
async function requireAuth(req: Request, minRole: UserRole = 'VIEWER') {
  const session = await getServerSession()
  if (!session) return new Response(null, { status: 401 })
  if (!hasRole(session.user.role, minRole)) return new Response(null, { status: 403 })
  return session
}
```

### Zod validation
Every POST/PUT endpoint validates the request body with a Zod schema defined in `lib/validators.ts`. Never trust unvalidated input.

---

## Critical Implementation Rules

1. **`tenantId` on every query** — Every Prisma `findMany`/`findUnique`/`update`/`delete` call must include `where: { tenantId: session.user.tenantId }`. This is non-negotiable.

2. **Audit log on every mutation** — Use `logAudit(userId, tenantId, action, entityType, oldValue, newValue)` from `lib/audit.ts` after every POST/PUT/DELETE. Never skip.

3. **ReactFlow data** — `SubProcess.flowData` is stored as JSON `{ nodes: Node[], edges: Edge[] }`. Load and pass directly to `<ReactFlow nodes={...} edges={...} />`.

4. **RASI saved as full matrix** — The entire RASI matrix is saved in one PUT call (not cell by cell). Use optimistic updates on the frontend.

5. **File upload** — Files go through a Next.js API route to Supabase Storage. The resulting public URL is stored in `Attachment.url`. Max file size: 10 MB.

6. **Password reset token** — Store only the hash of the token in the DB (`resetToken` field). Validate by hashing the incoming token and comparing. Token expires in 1 hour.

7. **Error response format** — Every API route has try/catch and returns consistent errors: `{ error: string, code: string }`.

8. **Prisma singleton** — Always use the singleton pattern in `lib/prisma.ts` to prevent connection exhaustion in dev hot-reload:
   ```typescript
   const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
   export const prisma = globalForPrisma.prisma ?? new PrismaClient()
   if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
   ```

9. **Seed password warning** — Display a prominent warning in the admin dashboard if default seed credentials have not been changed.

10. **No `tenantId` from request body** — Always derive `tenantId` from the authenticated session, never accept it as user input.

---

## Deployment

```bash
# 1. Create project on Vercel (connect GitHub repo)
# 2. Create project on Supabase (get DATABASE_URL)
# 3. Set all env variables in Vercel dashboard
# 4. Apply migrations
npx prisma migrate deploy
# 5. Seed production data
npx prisma db seed
# 6. Vercel auto-deploys on every push to main
```

---

## Git & AI Workflow

### Branching
- All Claude-driven branches: prefix `claude/`, suffix = session ID (e.g., `claude/feature-name-XXXX`)
- Never push to `main` without explicit permission
- Create the branch locally first if it does not exist

### Push
```bash
git push -u origin claude/<feature>-<session-id>
```
Retry up to 4 times on network failure with exponential backoff (2s, 4s, 8s, 16s).

### Commit Messages (Conventional Commits)
- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation only
- `refactor:` restructuring without behavior change
- `test:` adding/updating tests
- `chore:` build, tooling, dependencies

### Confirm before executing
- Deleting files or branches
- Force-pushing
- Dropping/altering DB schema
- Modifying CI/CD pipelines
- Any action visible to others (creating PRs, posting comments, pushing to shared branches)

### When implementing
1. Read existing files before changing anything
2. Make minimal, focused changes only
3. Do not refactor code adjacent to what was requested
4. Do not add comments unless logic is non-obvious
5. Do not add error handling for impossible scenarios
6. Run type-check and lint after changes; fix all errors before committing
