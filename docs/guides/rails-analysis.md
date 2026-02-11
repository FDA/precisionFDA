# Rails Architecture Analysis

> **Context**: Legacy Rails app (`packages/rails`) being phased out in favor of NestJS + React. Strategic goal: migrate features progressively.

---

## Domain Entities + Boundaries

### Core Entities (High Coupling)

| Entity | Table | Key Relations | Notes |
|--------|-------|---------------|-------|
| `User` | users | org, spaces, files, apps, jobs, discussions | Central auth + ownership pivot |
| `Space` | spaces | memberships, events, files, apps, jobs | Multi-tenant container (review/groups/govt/admin/private) |
| `Node` | nodes | STI: UserFile, Asset, Folder | Base file/folder abstraction |
| `Job` | jobs | app, user, input_files, output_files, analysis | Compute execution record |
| `App` | apps | app_series, jobs, assets, challenges | Runnable application |
| `Workflow` | workflows | workflow_series, analyses, apps (stages) | Multi-app pipeline |

### Secondary Entities

| Entity | Purpose |
|--------|---------|
| `Challenge` | Competition container (app, submissions, resources) |
| `Discussion` | Forum thread (note-backed, answers, comments) |
| `DbCluster` | Managed database (Aurora MySQL/Postgres) |
| `License` | Content licensing (accepted_licenses, licensed_items) |
| `Expert` | Q&A expert profile (questions, answers) |
| `DataPortal` | Space-scoped data publication |
| `SpaceReport` | Reporting within spaces |
| `Comparison` | VCF file comparison output |

### Aggregate Boundaries

```
┌─────────────────────────────────────────────────┐
│ User Context                                     │
│  ├── Org                                         │
│  ├── Profile                                     │
│  ├── NotificationPreference                     │
│  ├── AdminMembership → AdminGroup               │
│  └── SpaceMembership → Space                    │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Space (Multi-tenant Boundary)                    │
│  ├── SpaceMembership (roles: lead/admin/contrib/viewer) │
│  ├── SpaceEvent                                  │
│  ├── SpaceInvitation                            │
│  ├── Nodes (files, folders, assets)             │
│  ├── Apps, Workflows, Jobs                      │
│  ├── Discussions                                │
│  └── DataPortal, SpaceReport                    │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ App Series (Version Aggregate)                   │
│  ├── App (revisions)                            │
│  │   ├── Jobs                                   │
│  │   └── Assets                                 │
│  └── Properties, Tags                           │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Workflow Series                                  │
│  ├── Workflow (stages → Apps)                   │
│  ├── Analysis → Jobs                            │
│  └── Properties, Tags                           │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Challenge (Competition)                          │
│  ├── Submissions → Job                          │
│  ├── ChallengeResources                         │
│  └── App (scoring app)                          │
└─────────────────────────────────────────────────┘
```

---

## Server vs Client Concerns

### Current Split

| Layer | Rails | NestJS | React |
|-------|-------|--------|-------|
| **Auth** | Session cookies, DNAnexus OAuth | Inherits Rails session via middleware | CSRF token from Rails |
| **Routing** | Full HTML + API endpoints | `/api/v2/*`, `/ws` | SPA routes via vite |
| **Data Loading** | Controller actions + ERB views | REST controllers | react-query + axios |
| **Mutations** | Form submissions + API POSTs | REST + WebSocket | react-query mutations |
| **Validation** | ActiveRecord + custom validators | zod + class-validator | zod on forms |

### Route Ownership

```
nginx routing:
  /api/v2/*  → NestJS (port 3001)
  /ws        → NestJS WebSocket
  /docs      → Fumadocs (port 4040)
  /*         → Rails (port 3000)
```

---

## Data Flow

### Query Patterns

| Pattern | Location | Example |
|---------|----------|---------|
| **Scoped Access** | `Permissions` concern | `Model.accessible_by(context)` |
| **Space Scoping** | `space_uids` on User | `where(scope: user.space_uids)` |
| **STI** | Node → UserFile/Asset/Folder | `sti_type` column |
| **Series/Revisions** | AppSeries → App | Latest revision tracking |

### Permission Model

```ruby
# Scopes: 'private', 'public', 'space-{id}'
module Permissions
  def accessible_by?(context)
    public? ||
    (!in_space? && user_id == context.user_id) ||
    context.user.space_uids.include?(scope)
  end
end
```

### Mutation Patterns

| Pattern | Implementation |
|---------|----------------|
| **Copy** | `CopyService` → entity-specific copiers |
| **Publish** | Move scope from `private` → `public` or `space-*` |
| **Platform Sync** | `DNAnexusAPI` client → DXClient modules |
| **Space Ops** | `SpaceMembershipService` module (create/update/role change) |

### Caching

- **None explicit** in Rails layer
- React uses `react-query` with default stale time
- Platform API calls not cached (realtime state)

---

## UI Composition Patterns

### Legacy (Rails + ERB)

```
app/views/
├── layouts/application.html.erb
├── {controller}/
│   ├── index.html.erb
│   ├── show.html.erb
│   └── _partials.html.erb
```

- CoffeeScript in `app/assets/javascripts`
- Sass in `app/assets/stylesheets`
- Sprockets asset pipeline

---

## Infrastructure Layer

### Auth Flow

```
1. Login → DNAnexus OAuth
2. return_from_login → Session created
3. Session stored: user_id, username, token, expiration, org_id
4. Context built per request
5. CLI: Authorization header → Key decrypted → Context
```

### Database

| Aspect | Details |
|--------|---------|
| RDBMS | MySQL |
| ORM | ActiveRecord 7.1 |
| Migrations | Sequential in `db/migrate/` |
| NestJS | MikroORM (separate config) |

### External APIs

| Client | Purpose |
|--------|---------|
| `DNAnexusAPI` | Platform API (files, jobs, projects, orgs) |
| `HttpsAppsClient` | HTTPS app proxy (NestJS) |
| `ZipCodeAPI` | Postal validation |
| AWS SNS | Notifications |

### Environment

- Docker compose orchestration
- Puma web server (production)
- OpenTelemetry instrumentation
- Redis for queues (NestJS Bull)


---

## Route Organization Map

### Current Rails Routes (grouped)

```
/ Authentication
  GET  /login
  DELETE /logout
  GET  /return_from_login

/ Main
  GET  /home, /home/*
  GET  /docs, /docs/*
  GET  /about, /terms, /security, /guidelines

/ API (Rails)
  /api/apps, /api/files, /api/jobs, /api/workflows
  /api/spaces, /api/challenges, /api/licenses
  /api/discussions, /api/experts, /api/assets
  /api/dbclusters, /api/notifications

/ Admin
  /admin/*, /admin/users, /admin/spaces
  /admin/activity_reports/*

/ Resources (HTML)
  /apps, /workflows, /jobs, /comparisons
  /notes, /licenses, /experts, /challenges
  /spaces, /discussions

/ GSRS (conditional)
  /ginas/*

/ FHIR
  /fhir/Sequence, /fhir/metadata
```

### Target Route Split

| Route Pattern | Owner | Auth |
|---------------|-------|------|
| `/api/v2/*` | NestJS | UserContext middleware |
| `/ws` | NestJS | WebSocket gateway |
| `/home/*` | React SPA | react-query |
| `/admin/*` | React SPA | AdminGuard |
| `/login, /logout` | Rails (keep) | OAuth flow |
| Legacy HTML | Rails (deprecate) | Session |

---

## Shared vs Isolated Modules

### Shared (Cross-Domain)

| Module | Location | Usage |
|--------|----------|-------|
| `Permissions` | `app/models/concerns/` | All entities |
| `Scopes` | `app/models/concerns/` | Scope constants |
| `Context` | `app/extras/` | Request context |
| `DNAnexusAPI` | `app/extras/` | Platform client |
| `Auditor` | `app/extras/` | Audit logging |
| `CopyService` | `app/services/` | Entity copying |

### Isolated (Domain-Specific)

| Domain | Services |
|--------|----------|
| Space | `SpaceMembershipService/*`, `SpaceEventService/*` |
| Org | `OrgService/*` (create, provision, leave, dissolve) |
| Workflow | `CwlExporter`, `WdlExporter`, `Workflows::Builder` |
| Comparison | `SyncService::Comparisons/*` |
| File | `FilePublisher`, `FolderService`, `FileUploader` |

---

## Tech Stack + Gaps

### Current Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Backend | Rails | 7.1.5 |
| Ruby | - | 3.2.2 |
| Database | MySQL | (managed) |
| ORM | ActiveRecord | 7.1 |
| API Format | JSON (AMS) | 0.10.12 |
| Auth | DNAnexus OAuth | Custom |
| Assets | Sprockets | 4.0 |
| Legacy JS | CoffeeScript | 5.0 |
| Modern FE | React + Vite | 19.2 |
| API (New) | NestJS | - |
| Queue | Bull + Redis | - |
| Observability | OpenTelemetry | OTLP |

### Gaps

| Gap | Impact | Recommendation |
|-----|--------|----------------|
| **No caching layer** | Repeated API calls | Redis cache in NestJS |
| **Mixed auth** | Session + header complexity | Consolidate to JWT |
| **No rate limiting** | API abuse risk | NestJS throttler |
| **No API versioning** | Breaking changes | v2 namespace (done) |
| **Mixed FE tech** | Maintenance burden | Complete React migration |
| **No GraphQL** | Over/under-fetching | Consider for complex queries |
| **Audit log in-process** | Performance hit | Async queue-based |
| **No feature flags** | Risky deploys | LaunchDarkly / Unleash |
| **Test coverage** | Legacy code risk | Increase spec coverage |

---

## Key Files Reference

| Purpose | Path |
|---------|------|
| Routes | `config/routes.rb` |
| Models | `app/models/` |
| API Controllers | `app/controllers/api/` |
| Services | `app/services/` |
| Platform Client | `app/extras/dn_anexus_api.rb` |
| Concerns | `app/models/concerns/` |
| Context | `app/extras/context.rb` |
| Serializers | `app/serializers/` |
| Validators | `app/validators/` |
| NestJS Domain | `packages/server/libs/shared/src/domain/` |
| React Features | `packages/client/src/features/` |
