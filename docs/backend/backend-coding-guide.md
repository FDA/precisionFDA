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

### API Modules (`apps/api/src/<resource>/`)

```
space-memberships/
├── space-memberships.api.module.ts
├── space-memberships.controller.ts
```

Controller imports API facade module (or shared facade). **Never work with entities directly.**

### API Facades (`apps/api/src/facade/`)

Optional layer when API needs extra orchestration beyond shared facades.

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

**Transactions:**
```ts
await this.em.transactional(async () => {
  this.em.persist(entity)
  await this.anotherService.method() // auto-joins transaction
})
```

**Persist pattern:**
```ts
this.em.persist(object)
await this.em.flush()  // NOT persistAndFlush (hard to mock)
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

## DTOs & Validation

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

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `space-membership.service.ts` |
| URLs | kebab-case | `/data-portals/:id` |
| Params | camelCase | `membershipIds` |
| Classes | PascalCase + suffix | `SpaceMembershipService` |

## Types

- **interface** - default choice
- **class** - runtime behavior (methods, getters)
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
