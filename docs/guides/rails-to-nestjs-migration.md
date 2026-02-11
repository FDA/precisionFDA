# Rails → NestJS Migration Guide

> Migrate features from Rails (`packages/rails`) to NestJS (`packages/server`) while maintaining backwards compatibility.

---

## Architecture Comparison

```
Rails                          NestJS
─────────────────────────────────────────────────────
app/models/*.rb          →    libs/shared/src/domain/<entity>/*.entity.ts
app/controllers/api/*.rb →    apps/api/src/<resource>/*.controller.ts
app/services/*.rb        →    libs/shared/src/facade/<action>/*Facade.ts
app/models/concerns/*.rb →    Entity methods + decorators
app/extras/context.rb    →    @shared/domain/user-context
app/extras/dn_anexus_api →    libs/shared/src/platform-client
app/serializers/*.rb     →    DTOs (input/output)
```

---

## Entity Migration Status

| Domain | Rails Model | NestJS Entity | Status |
|--------|-------------|---------------|--------|
| **User** | User | User | ✅ Migrated |
| **Space** | Space | Space | ✅ Migrated |
| **SpaceMembership** | SpaceMembership | SpaceMembership | ✅ Migrated |
| **Organization** | Org | Organization | ✅ Migrated |
| **Job** | Job | Job | ✅ Migrated |
| **App** | App | App | ✅ Migrated |
| **AppSeries** | AppSeries | AppSeries | ✅ Migrated |
| **Workflow** | Workflow | Workflow | ✅ Migrated |
| **WorkflowSeries** | WorkflowSeries | WorkflowSeries | ✅ Migrated |
| **File** | UserFile (Node STI) | UserFile | ✅ Migrated |
| **Asset** | Asset (Node STI) | Asset | ✅ Migrated |
| **Folder** | Folder (Node STI) | Folder | ✅ Migrated |
| **Discussion** | Discussion | Discussion | ✅ Migrated |
| **Challenge** | Challenge | Challenge | ✅ Migrated |
| **DbCluster** | DbCluster | DbCluster | ✅ Migrated |
| **License** | License | License | ✅ Migrated |
| **Expert** | Expert | Expert | ✅ Migrated |
| **DataPortal** | DataPortal | DataPortal | ✅ Migrated |
| **SpaceReport** | SpaceReport | SpaceReport | ✅ Migrated |
| **Notification** | Notification | Notification | ✅ Migrated |
| **Comment** | Comment | Comment | ✅ Migrated |
| **Tag/Tagging** | Tag/Tagging | Tag/Tagging | ✅ Migrated |
| **Property** | Property | Property | ✅ Migrated |
| **Note** | Note | Note | ✅ Migrated |
| **NewsItem** | NewsItem | NewsItem | ✅ Migrated |
| **Comparison** | Comparison | Comparison | ✅ Migrated |
| **Alert** | Alert (Setting) | Alert | ✅ Migrated |
| **Analysis** | Analysis | - | ❌ Pending |
| **Answer** | Answer | - | ❌ Pending |
| **Submission** | Submission | - | ❌ Pending |
| **Appathon** | Appathon | - | ❌ Pending |

---

## API Migration Map

### Migrated to /api/v2

| Feature | Rails Route | NestJS Route | Notes |
|---------|-------------|--------------|-------|
| **Spaces** | `/api/spaces` | `/api/v2/spaces` | Full CRUD |
| **SpaceMemberships** | `/api/spaces/:id/members` | `/api/v2/spaces/:spaceId/memberships` | Role updates |
| **SpaceEvents** | - | `/api/v2/space-events` | New |
| **SpaceGroups** | - | `/api/v2/space-groups` | New |
| **Files** | `/api/files` | `/api/v2/files` | List, copy, download |
| **Folders** | `/api/folders` | `/api/v2/folders` | CRUD |
| **Jobs** | `/api/jobs` | `/api/v2/jobs` | List, terminate, sync |
| **Apps** | `/api/apps` | `/api/v2/apps` | List, run |
| **Workflows** | `/api/workflows` | `/api/v2/workflows` | Licenses |
| **DbClusters** | `/api/dbclusters` | `/api/v2/dbclusters` | Full lifecycle |
| **Discussions** | `/api/discussions` | `/api/v2/discussions` | Full CRUD + replies |
| **Challenges** | `/api/challenges` | `/api/v2/challenges` | Propose, resources |
| **Licenses** | `/api/licenses` | `/api/v2/licenses` | Accept, list |
| **Experts** | `/api/experts` | `/api/v2/experts` | List, show |
| **DataPortals** | - | `/api/v2/data-portals` | Full CRUD |
| **Notifications** | `/api/notifications` | `/api/v2/notifications` | Mark read |
| **Alerts** | `/api/alerts` | `/api/v2/alerts` | Admin CRUD |
| **News** | - | `/api/v2/news` | Admin CRUD |
| **Admin** | `/admin/*` | `/api/v2/admin/*` | User mgmt |
| **Users** | `/api/users` | `/api/v2/users` | Profile, resources |
| **CLI** | various | `/api/v2/cli/*` | CLI-specific ops |

### Still in Rails (migrate next)

| Feature | Rails Route | Priority |
|---------|-------------|----------|
| **Auth** | `/login`, `/logout`, `/return_from_login` | Keep (OAuth flow) |
| **Comparisons** | `/api/comparisons` | Medium |
| **Submissions** | `/api/submissions` | Medium |
| **Activity Reports** | `/admin/activity_reports/*` | Low |
| **Notes** | `/api/notes` | Low |
| **Answers** | `/api/answers` | Low |

---

## Feature Migration Checklist

### Per-Feature Steps

```markdown
## Feature: [Feature Name]

### 1. Entity (if new)
- [ ] Create `libs/shared/src/domain/<entity>/<entity>.entity.ts`
- [ ] Create `<entity>.repository.ts`
- [ ] Create `<entity>.service.ts`
- [ ] Create `<entity>.module.ts`
- [ ] Export from domain index

### 2. Facade (if cross-domain)
- [ ] Create `libs/shared/src/facade/<action>/<Action>Facade.ts`
- [ ] Create `<Action>FacadeModule.ts`
- [ ] Wire domain modules

### 3. API Layer
- [ ] Create `apps/api/src/<resource>/<resource>.controller.ts`
- [ ] Create `<resource>.api.module.ts`
- [ ] Create request/response DTOs
- [ ] Add to `apps/api/src/api.module.ts`

### 4. Client
- [ ] Add API functions in `packages/client/src/features/<feature>/api.ts`
- [ ] Update react-query hooks
- [ ] Point directly to `/api/v2/...`

### 5. Verification
- [ ] NestJS endpoint works
- [ ] Client uses v2
- [ ] Tests pass: `make test-api`
- [ ] Rails endpoint still works (backwards compat)
```

---

## Migration Strategy

### Per-Feature Flow
```
1. Implement NestJS endpoint (/api/v2/...)
2. Client switches directly to v2
3. Rails endpoint remains (backwards compat)
4. No removal of Rails code
```

### Routing
```
nginx routes:
  /api/v2/*  → NestJS (port 3001)
  /api/*     → Rails (port 3000)  ← legacy, untouched
```

### Backwards Compatibility
- Rails endpoints stay functional for CLI/external consumers
- No deprecation headers needed
- No client-side feature flags

---

## Code Patterns

### Rails Model → NestJS Entity

```ruby
# Rails: app/models/space.rb
class Space < ApplicationRecord
  include Auditor
  include Permissions
  include Scopes
  
  belongs_to :host_lead, class_name: "User"
  has_many :space_memberships
  
  enum state: { active: 0, locked: 1 }
  
  def is_review?
    space_type == "review"
  end
end
```

```typescript
// NestJS: libs/shared/src/domain/space/space.entity.ts
@Entity({ tableName: 'spaces', repository: () => SpaceRepository })
export class Space extends BaseEntity {
  @Enum({ items: () => SPACE_STATE })
  state!: SPACE_STATE

  @Enum({ items: () => SPACE_TYPE })
  spaceType!: SPACE_TYPE

  @ManyToOne(() => User)
  hostLead!: Ref<User>

  @OneToMany(() => SpaceMembership, (m) => m.space)
  memberships = new Collection<SpaceMembership>(this)

  isReview(): boolean {
    return this.spaceType === SPACE_TYPE.REVIEW
  }
}
```

### Rails Service → NestJS Facade

```ruby
# Rails: app/services/space_membership_service/creator.rb
module SpaceMembershipService
  class Creator
    def call(space, user, role)
      membership = SpaceMembership.create!(space: space, user: user, role: role)
      SpaceEventService.create(space, :membership_added, user)
      NotificationService.notify(user, :added_to_space)
      membership
    end
  end
end
```

```typescript
// NestJS: libs/shared/src/facade/space-membership-create/space-membership-create.facade.ts
@Injectable()
export class SpaceMembershipCreateFacade {
  constructor(
    private readonly spaceMembershipService: SpaceMembershipService,
    private readonly spaceEventService: SpaceEventService,
    private readonly emailService: EmailService,
  ) {}

  async create(spaceId: number, userId: number, role: SPACE_MEMBERSHIP_ROLE): Promise<SpaceMembership> {
    return this.em.transactional(async () => {
      const membership = await this.spaceMembershipService.create(spaceId, userId, role)
      await this.spaceEventService.create(spaceId, SPACE_EVENT_TYPE.MEMBERSHIP_ADDED, userId)
      await this.emailService.sendAddedToSpace(userId, spaceId)
      return membership
    })
  }
}
```

### Rails Controller → NestJS Controller

```ruby
# Rails: app/controllers/api/spaces_controller.rb
class Api::SpacesController < Api::BaseController
  def index
    spaces = Space.accessible_by(@context).includes(:host_lead)
    render json: spaces, each_serializer: SpaceSerializer
  end
end
```

```typescript
// NestJS: apps/api/src/spaces/spaces.controller.ts
@UseGuards(UserContextGuard)
@Controller('/spaces')
export class SpacesController {
  constructor(private readonly spaceService: SpaceService) {}

  @Get('/')
  async list(): Promise<SpaceListResponseDTO[]> {
    return this.spaceService.findAccessible()
  }
}
```

---

## Shared Logic

### Concerns → Entity Methods

| Rails Concern | NestJS Location |
|---------------|-----------------|
| `Permissions` | Entity method `isAccessibleBy(ctx)` |
| `Scopes` | Enum `SCOPE` + helper |
| `Auditor` | `BaseEntity.createdAt/updatedAt` |
| `Featured` | Entity property |
| `TagsContainer` | `Tagging` relation |
| `InternalUid` | Entity computed property |
| `ObjectLocation` | Entity enum property |

### Shared Services

| Rails | NestJS | Notes |
|-------|--------|-------|
| `DNAnexusAPI` | `PlatformClient` | Wrapped in `platform-client/` |
| `CopyService` | `CopyNodesFacade` | Handles files, apps, workflows |
| `Context` | `UserContext` | Request-scoped |
| `Auditor` | Event sourcing | `SpaceEvent`, `Event` entities |

---

## Database Considerations

- **Same DB**: Both Rails and NestJS share MySQL
- **MikroORM vs ActiveRecord**: Same tables, different mapping
- **Migrations**: Rails `db/migrate/` is source of truth
- **Enums**: Match string values exactly

### Column Mapping

```typescript
// Rails: snake_case columns
// NestJS: Use @Property({ fieldName }) for camelCase

@Property({ fieldName: 'host_lead_id' })
hostLeadId!: number
```

---

## Testing Migration

```bash
# NestJS endpoint (primary)
curl -H "Cookie: ..." https://localhost:3000/api/v2/spaces

# Rails endpoint (verify backwards compat)
curl -H "Cookie: ..." https://localhost:3000/api/spaces
```

---

## Client Migration

### Before (Rails)
```typescript
// packages/client/src/features/spaces/api.ts
export const fetchSpaces = () => 
  axios.get('/api/spaces')
```

### After (NestJS)
```typescript
// packages/client/src/features/spaces/api.ts
export const fetchSpaces = () => 
  axios.get('/api/v2/spaces')
```

Direct switch. No feature flags.

---

## Priority Matrix

| Feature | Complexity | Value | Priority |
|---------|------------|-------|----------|
| Remaining file ops | Medium | High | P1 |
| Comparisons | High | Medium | P2 |
| Submissions | Medium | Medium | P2 |
| Activity Reports | High | Low | P3 |
| Notes/Answers | Low | Low | P4 |

---

## Anti-Patterns to Avoid

1. ❌ Removing Rails endpoints before React migration complete
2. ❌ Duplicating business logic (use facades)
3. ❌ Direct entity returns from controllers (use DTOs)
4. ❌ Cross-domain service imports (use facades)
5. ❌ Raw SQL (use repository methods)
6. ❌ Console.log (use `@ServiceLogger()`)
  
---

## Quick Reference

### New Feature in NestJS

```bash
# 1. Domain entity
touch libs/shared/src/domain/new-entity/{entity,repository,service,module}.ts

# 2. Facade (if needed)
touch libs/shared/src/facade/create-entity/create-entity.{facade,module}.ts

# 3. API layer
touch apps/api/src/new-entity/{controller,api.module,dto}.ts

# 4. Wire up
# - Add to domain/index.ts exports
# - Add to api.module.ts imports
# - Add routes to nginx if new path

# 5. Test
make test-api
```

### Verify Migration

```bash
# Types
pnpm --filter @pfda/server typecheck

# Lint  
pnpm --filter @pfda/server lint

# Test
make test-api

# E2E
make run && curl https://localhost:3000/api/v2/...
```
