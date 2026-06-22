# Backend Guide

## Stack

- **TypeScript** - strict, no `any`
- **NestJS** - DI, guards, filters, interceptors
- **MikroORM** - repositories, query builder (avoid raw SQL)

## Architecture

```
apps/api/src/          # API layer (controllers + api facades)
apps/worker/src/       # Queue processors
libs/shared/src/
├── domain/            # Domain modules (entities, repos, services)
├── facade/            # Cross-domain orchestration
├── queue/             # Bull queue producers
├── platform-client/   # DNAnexus API client
└── errors/            # Error types
```

## Layers

### Domain Modules (`libs/shared/src/domain/<entity>/`)

Self-contained. One table = one domain (exceptions: related tables like `space_reports` + `space_report_parts`).

**Structure:**
```
space-membership/
├── space-membership.entity.ts      # MikroORM entity
├── space-membership.enum.ts        # Enums
├── space-membership.repository.ts  # DB queries
├── space-membership.module.ts      # NestJS module
├── service/
│   └── space-membership.service.ts # Main service (only export)
├── dto/
│   └── update-space-membership.dto.ts
└── providers/                      # Strategy pattern implementations
```

**Rules:**
- Only export main service (`SpaceMembershipService`)
- No cross-domain imports (prevents circular deps)
- Repository = internal only, never exported

### Facades (`libs/shared/src/facade/<action>/`)

Cross-domain orchestration. Import multiple domain modules.

```ts
@Module({
  imports: [SpaceModule, UserModule, EmailModule, SpaceMembershipModule],
  providers: [SpaceMembershipUpdateFacade],
  exports: [SpaceMembershipUpdateFacade],
})
export class SpaceMembershipFacadeModule {}
```

One facade per action: `CreateDiscussionFacade`, `UpdateDiscussionFacade` (not `DiscussionFacade`).

**Strict rules:**
- Every facade class must have its own dedicated module file.
- A facade module must provide/export exactly one facade class.
- Do not group multiple facade providers in a single module.
- Module name must match facade action naming (for example, `SpaceMembershipUpdateFacadeModule`).

### API Modules (`apps/api/src/<resource>/`)

```
space-memberships/
├── space-memberships.api.module.ts
├── space-memberships.controller.ts
```

Controller imports API facade module (or shared facade). **Never work with entities directly.**

**Provider registration rule:**
- If a facade is already provided/exported by a shared facade module (`libs/shared/src/facade/...`), do **not** redeclare it in `providers` of an API module.
- API modules should consume exported facades via `imports`, and keep `providers` only for API-local classes.

### API Facades (`apps/api/src/facade/`)

Optional layer when API needs extra orchestration beyond shared facades.

- Do not duplicate shared facades in `apps/api/src/facade`; create API facades only for API-specific orchestration.

**Strict rules:**
- Every API facade class must be declared in its own API facade module.
- API facade modules follow the same one-facade-per-module rule as shared facades.

```ts
@Injectable()
export class SpaceMembershipUpdateApiFacade {
  constructor(
    private readonly spaceMembershipUpdateFacade: SpaceMembershipUpdateFacade,
    private readonly dbClusterSynchronizeFacade: DbClusterSynchronizeFacade,
  ) {}
}
```

## Entities

```ts
@Entity({ tableName: 'space_memberships', repository: () => SpaceMembershipRepository })
export class SpaceMembership extends BaseEntity {
  @Enum({ items: () => SPACE_MEMBERSHIP_ROLE, nullable: false })
  role: SPACE_MEMBERSHIP_ROLE

  @ManyToOne(() => User)
  user!: Ref<User>  // Use Ref<T> for associations
}
```

Computed properties OK (e.g., `isAdmin()`). No business logic.

## Repositories

Extend `PaginatedRepository<T>`. Internal to domain module.

```ts
export class SpaceMembershipRepository extends PaginatedRepository<SpaceMembership> {
  async getMembership(spaceId: number, userId: number): Promise<SpaceMembership> {
    // Prefer find/findOne over QueryBuilder
  }
}
```

## Services

Main domain service = public interface.

```ts
@Injectable()
export class SpaceMembershipService {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly userContext: UserContext,
    private readonly spaceMembershipRepository: SpaceMembershipRepository,
  ) {}
}
```

**Entity retrieval:**
- Prefer the domain's repository (`find`, `findOne`, custom finder methods) over calling `EntityManager` / `em.find*` directly from a service.
- Add a new repository method when an existing one does not fit, instead of building ad-hoc queries inside the service.
- Keep query/filter logic (where clauses, joins, ordering) in the repository; services should only orchestrate calls and apply business rules.

**Transactions:**
```ts
await this.spaceMembershipRepository.transactional(async () => {
  this.spaceMembershipRepository.persist(entity)
  await this.anotherService.method() // auto-joins transaction
})
```

- Do not pass transaction-scoped `EntityManager` instances between service/facade methods.
- Start transaction boundaries in the owning service/facade (`this.em.transactional(...)` or repository `.transactional(...)`) and use `this.em` plus constructor-injected repositories inside called methods.
- Prefer repository reads/writes over direct `em.find*` calls for domain entities.


**Persist pattern:**
```ts
// Stage + flush separately (preferred - easy to mock)
this.spaceMembershipRepository.persist(entity)
await this.spaceMembershipRepository.flush()

// Or persist and flush in one call
await this.spaceMembershipRepository.persistAndFlush(entity)
```

**Delete pattern:**
```ts
// Stage + flush separately (preferred - easy to mock)
this.spaceMembershipRepository.remove(entity)
await this.spaceMembershipRepository.flush()

// Or remove and flush in one call
await this.spaceMembershipRepository.removeAndFlush(entity)
```

## Controllers

```ts
@UseGuards(UserContextGuard)
@Controller('/spaces/:spaceId/memberships')
export class SpaceMembershipsController {
  constructor(private readonly facade: SpaceMembershipUpdateApiFacade) {}

  @HttpCode(204)
  @Patch('/')
  async bulkUpdate(
    @Param('spaceId', ParseIntPipe) spaceId: number,
    @Body() body: UpdateSpaceMembershipDTO,
  ): Promise<void> {
    await this.facade.updatePermissions(spaceId, body)
  }
}
```

**Never return/accept entities.** Use DTOs.

## Error Handling

- Use shared error classes from `@shared/errors` (e.g. `NotFoundError`, `ValidationError`, `PermissionError`).
- Do not throw Nest HTTP exceptions (`NotFoundException`, `BadRequestException`, etc.) from service/facade/domain code.
- Keep error mapping consistent via shared error codes and filters.

## DTOs & Validation

- DTO static mapping methods (e.g. `fromEntity`) must be synchronous
- Do not perform database or platform calls in DTO static methods
- Load required relations in service/facade before calling DTO mappers
- **DTO attributes must use `camelCase` naming** (both request and response DTOs). Do not expose snake_case fields from entities/DB columns directly — map them to camelCase in the DTO. If a legacy Rails endpoint still consumes/emits snake_case for the same shape, add a temporary converter at the boundary and remove it once the Rails endpoint is rewritten.
- NestJS DTOs must be declared as `class` (not `interface`) so runtime metadata is available for validation/Swagger

```ts
export class UpdateSpaceMembershipDTO {
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  membershipIds: number[]

  @IsEnum(SPACE_MEMBERSHIP_ROLE)
  @IsOptional()
  targetRole?: SPACE_MEMBERSHIP_ROLE
}
```

Nested validation:
```ts
@ValidateNested()
@Type(() => FilterDTO)
filter?: FilterDTO
```

## Queues

**Producers** create tasks, **Processors** handle them.

```ts
// Global producer (libs/shared/src/queue/)
await this.mainQueueJobProducer.createTask(...)

// Worker processor (apps/worker/src/)
@Processor('main-queue')
export class MainQueueProcessor {
  @Process('task-name')
  async handle(job: Job<TaskPayload>) {}
}
```

## Platform Jobs (DNAnexus Execution Sync)

Platform jobs (apps, workflows, workstations) run on DNAnexus. Node worker polls for state changes.

**Flow:**
```
User starts job → API creates Job entity → Producer schedules sync task
                                                    ↓
                                          MainQueueProcessor
                                                    ↓
                                      JobSynchronizationService.synchronizeJob()
                                                    ↓
                               platformClient.jobDescribe() → Update Job entity
                                                    ↓
                          On terminal state: sync outputs, send emails, notifications
```

**Key components:**

| Component | Location | Purpose |
|-----------|----------|---------|
| `Job` entity | `libs/shared/src/domain/job/job.entity.ts` | Stores job state, describe metadata |
| `JobService` | `libs/shared/src/domain/job/job.service.ts` | CRUD, delegates to sync service |
| `JobSynchronizationService` | `libs/shared/src/domain/job/services/job-synchronization.service.ts` | Polls platform, updates state |
| `MainQueueJobProducer` | `libs/shared/src/queue/producer/main-queue-job.producer.ts` | Creates repeatable sync tasks |
| `MainQueueProcessor` | `apps/worker/src/queues/processor/main-queue.processor.ts` | Handles `SYNC_JOB_STATUS` tasks |

**Creating a sync task:**
```ts
await this.mainQueueJobProducer.createSyncJobStatusTask(
  { dxid: job.dxid },
  userContext
)
// Creates repeatable Bull job with cron pattern
```

**Job states:**
```ts
enum JOB_STATE {
  IDLE = 'idle',
  RUNNABLE = 'runnable',
  RUNNING = 'running',
  TERMINATING = 'terminating',
  TERMINATED = 'terminated',
  DONE = 'done',
  FAILED = 'failed',
}
```

**Terminal state handling:**
- `DONE` → Sync outputs, send completion email
- `FAILED` → Send failure email, log failure reason
- `TERMINATED` → Release locked files (HTTPS apps)

**Stale job handling:**
- Jobs exceeding max duration get termination warning email
- After grace period, auto-terminate via `platformClient.jobTerminate()`

**HTTPS Apps (JupyterLab, RStudio):**
- Have `httpsAppState` property
- Lock files during execution
- Files released on termination

## Logging

```ts
@Injectable()
export class MyService {
  @ServiceLogger()
  private readonly logger: Logger  // Auto-adds class name as context

  method() {
    this.logger.log('message')  // No context needed in message
    this.logger.warn('warning')
    this.logger.error('error')
  }
}
```

**Never log PII.** IDs and action descriptions only.

## Testing

Mocha + Chai + Sinon.

```ts
describe('SpaceMembershipService', () => {
  const repoStub = stub()

  beforeEach(() => {
    repoStub.reset()
    repoStub.throws()  // Fail-fast for unexpected calls
  })

  context('#updatePermission', () => {
    it('should throw if no memberships found', async () => {
      repoStub.resolves([])
      await expect(service.updatePermission(...)).to.be.rejectedWith(InvalidStateError)
    })
  })

  function getInstance(): SpaceMembershipService {
    return new SpaceMembershipService(/* stubs */)
  }
})
```

## Naming

## Imports

- Imports must be sorted according to Biome (`biome.json`), including organize-imports behavior.

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `space-membership.service.ts` |
| URLs | kebab-case | `/data-portals/:id` |
| Params | camelCase | `membershipIds` |
| DTO attributes | camelCase | `appSeriesId`, `createdAtDateTime` |
| Classes | PascalCase + suffix | `SpaceMembershipService` |

### Model Files Convention

- Place domain model definitions in `model/` under the domain folder
- Use one export per file in model files
- File name must match exported symbol name converted to kebab-case
- Use `.type.ts` suffix only for string union types
- Common model suffixes are `.dto.ts`, `.map.ts`, `.type.ts`; otherwise use plain file name

Examples:
- `run-app.dto.ts` exports `RunAppDTO`
- `entity.type.ts` exports `EntityType`
- `entity-instance.ts` exports `EntityInstance`

### File Naming Convention

General rule for files that act on a domain (facades, DTOs, services, etc.):

> **`<domain-name>-<specifics>.<suffix>.ts`** — domain name first (preferably **plural**), then the specifics (action, role, etc.), then the suffix.

The exported class/symbol must be the PascalCase form of the file name without the suffix (e.g. `cli-assets-list.facade.ts` exports `CliAssetsListFacade`).

| Component | Pattern | Examples |
|-----------|---------|----------|
| **Facade** | `<domain-plural>-<action>[-<qualifier>].facade.ts` | `user-files-list.facade.ts`, `db-clusters-list.facade.ts`, `space-memberships-update-api.facade.ts`, `cli-assets-list.facade.ts` (CLI prefix counts as the qualifier; the domain stays plural and `-list` stays last) |
| **Controller** | `<domain-plural>.controller.ts` (use a qualifier suffix only when one controller per domain is not enough, e.g. CLI vs. web) | `space-memberships.controller.ts`, `cli-jobs.controller.ts` |
| **Service** | `<domain-singular>.service.ts` for the main domain service; `<domain-singular>-<action>.service.ts` for additional internal services | `space-membership.service.ts`, `job-synchronization.service.ts` |
| **Repository** | `<domain-singular>.repository.ts` (one repository per entity) | `user.repository.ts`, `setting.repository.ts` |
| **Entity** | `<domain-singular>.entity.ts` | `space-membership.entity.ts` |
| **Module** | `<domain-singular>.module.ts` for domain modules; `<facade-base>.module.ts` for facade modules (matches the facade file) | `space-membership.module.ts`, `cli-assets-list-facade.module.ts` |
| **DTO** | `<domain-singular>-<action>.dto.ts` (action describes the operation/shape, not pluralized) | `app-get.dto.ts`, `update-space-membership.dto.ts`, `pending-user.dto.ts` |
| **Enum** | `<domain-singular>.enum.ts` | `space-membership.enum.ts` |

**Rationale for plural on facades/controllers:** facades and controllers operate on collections/resources, so the plural domain name reads naturally with the action suffix (`db-clusters-list`, `user-files-bulk-download`). Services, repositories, entities, and DTOs describe a single domain concept, so they remain singular.

**Action verb position:** the action goes **after** the domain (`admin-memberships-list.facade.ts`, not `list-admin-memberships.facade.ts`). This keeps related files sorted together alphabetically by domain.

## Types

- **interface** - default choice
- **class** - runtime behavior (methods, getters), and all NestJS DTOs
- **type** - unions, conditionals, mapped types

## Example: Full Flow

```
Request: PATCH /spaces/:spaceId/memberships
    │
    ▼
SpaceMembershipsController (validation via DTO)
    │
    ▼
SpaceMembershipUpdateApiFacade (API-specific orchestration)
    │
    ▼
SpaceMembershipUpdateFacade (business logic, tx, events, emails)
    │
    ├──▶ SpaceMembershipService (domain operations)
    │       └──▶ SpaceMembershipRepository (DB)
    │
    ├──▶ SpaceService
    ├──▶ EmailService
    └──▶ MaintenanceQueueJobProducer (async tasks)
```

## Domain Inventory

| Domain | Entity | Notes |
|--------|--------|-------|
| `space-membership` | SpaceMembership | Roles, sides, platform access |
| `space` | Space | Types: GROUPS, REVIEW |
| `space-event` | SpaceEvent | Activity audit trail |
| `space-report` | SpaceReport, SpaceReportPart | Multi-entity domain |
| `user` | User | Profile, org, billing |
| `user-file` | UserFile | File operations |
| `job` | Job | Platform job execution |
| `app` | App | App management |
| `workflow` | Workflow | Workflow orchestration |
| `discussion` | Discussion | With replies |
| `challenge` | Challenge, Submission | Competition system |
| `data-portal` | DataPortal | Data access management |
| `db-cluster` | DbCluster | Database cluster ops |
| `notification` | Notification | User notifications |
| `invitation` | Invitation | User provisioning |
| `license` | License, LicensedItem | Content licensing |
| `expert` | Expert, ExpertQuestion | Expert Q&A |
| `alert` | Alert | System alerts |
| `news-item` | NewsItem | News management |
| `note` | Note | Note management |
| `tag/tagging` | Tag, Tagging | Entity tagging |
| `provenance` | Provenance* | Data lineage |
| `email` | - | Email templates + sending |
