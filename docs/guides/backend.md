# Backend Best Practices & Coding Standards

This document outlines the coding patterns, conventions, and best practices used in `packages/server`. The **Discussions**, **Space Memberships**, and **Nodes** domains are considered reference implementations for these patterns.

---

## Table of Contents

1. [Technology Stack](#technology-stack)
2. [Project Structure](#project-structure)
3. [Architecture Layers](#architecture-layers)
4. [Code Reuse & Shared Abstractions](#code-reuse--shared-abstractions)
5. [Entities (MikroORM)](#entities-mikro-orm)
6. [Repositories](#repositories)
7. [Services](#services)
8. [Facades](#facades)
9. [Controllers](#controllers)
10. [DTOs (Data Transfer Objects)](#dtos-data-transfer-objects)
11. [Modules](#modules)
12. [Providers Pattern](#providers-pattern)
13. [Error Handling](#error-handling)
14. [Logging](#logging)
15. [Guards](#guards)
16. [User Context](#user-context)
17. [Platform Client](#platform-client)
18. [Queue/Job Producers](#queuejob-producers)
19. [Transactions](#transactions)
20. [Testing](#testing)
21. [Configuration](#configuration)
22. [Naming Conventions](#naming-conventions)
23. [File Organization Summary](#file-organization-summary)
24. [Quick Reference](#quick-reference)
25. [Suggestions for Improvement](#suggestions-for-improvement)

---

## Technology Stack

Our technology stack is built on:

| Technology | Purpose |
|------------|---------|
| **TypeScript** | Static typing - use proper types, avoid `any` |
| **NestJS** | Framework for building scalable server-side applications |
| **MikroORM** | ORM for database access - prefer built-in features over raw SQL |
| **Bull** | Queue management for background jobs |
| **Mocha + Chai + Sinon** | Testing framework and utilities |

### Core Principles

- **TypeScript**: Use proper types everywhere, avoid `any` at all costs
- **NestJS**: Leverage built-in features like guards, interceptors, pipes, and error filters
- **MikroORM**: Prefer query builder and repositories over raw SQL queries

---

## Project Structure

The server package follows a modular architecture with clear separation of concerns:

```
packages/server/
├── apps/
│   ├── api/                    # Main API application
│   │   ├── src/
│   │   │   ├── <domain>/       # Feature modules (controllers, api modules)
│   │   │   ├── facade/         # API-specific facades
│   │   │   ├── user-context/   # Middleware and guards
│   │   │   └── api.module.ts   # Root API module
│   │   └── test/               # Integration tests
│   └── worker/                 # Background worker application
├── libs/
│   └── shared/
│       ├── src/
│       │   ├── domain/         # Business logic (entities, services, repos)
│       │   ├── database/       # Base entities, repositories
│       │   ├── facade/         # Shared facades
│       │   ├── platform-client/# DNAnexus platform client
│       │   ├── queue/          # Bull queue producers
│       │   ├── errors/         # Custom error classes
│       │   ├── logger/         # Logging utilities
│       │   └── config/         # Configuration
│       └── test/               # Unit tests
```

### Key Principles

- **Domain-driven structure**: Group related code by domain (e.g., `space-membership/`)
- **Shared logic in libs**: Business logic lives in `libs/shared/src/domain`
- **API-specific in apps**: Controllers and API facades live in `apps/api/src`
- **Maximize code reuse**: Always extend shared base classes (`BaseEntity`, `PaginatedRepository`, `PaginationDTO`) rather than implementing from scratch
- **Check before creating**: Before implementing new functionality, search `libs/shared/` for existing abstractions

---

## Architecture Layers

The application follows a layered architecture with clear responsibilities:

```
┌─────────────────────────────────────────────────────────┐
│                     Controllers                          │
│   (HTTP handling, validation, routing, guards)          │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    API Facades                           │
│   (API-specific orchestration, response formatting)     │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   Shared Facades                         │
│   (Cross-service orchestration, transactions, events)   │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                      Services                            │
│   (Business logic, domain rules, validation)            │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    Repositories                          │
│   (Data access, queries, persistence)                   │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                      Entities                            │
│   (Database table mapping, domain methods)              │
└─────────────────────────────────────────────────────────┘
```

### Layer Rules

1. **Controllers** should NEVER work with entities directly
2. **API Facades** wrap shared facades with API-specific logic
3. **Shared Facades** orchestrate multiple services and handle transactions
4. **Services** contain domain-specific business logic
5. **Repositories** abstract database operations
6. **Entities** represent database tables and contain domain helper methods

---

## Code Reuse & Shared Abstractions

**A core principle of this codebase is maximizing code reuse through shared abstractions.** Before implementing new functionality, always check if a reusable solution already exists.

### Shared Base Classes

| Base Class | Location | Purpose |
|------------|----------|---------|
| `BaseEntity` | `@shared/database/base.entity` | Common entity fields (`id`, `createdAt`, `updatedAt`) |
| `ScopedEntity` | `@shared/database/scoped.entity` | Entities with scope-based visibility |
| `PaginatedRepository<T>` | `@shared/database/repository/paginated.repository` | Pagination, persist, flush operations |
| `AccessControlRepository<T>` | `@shared/database/repository/access-control.repository` | Permission-aware queries (`findAccessibleOne`, `findEditableOne`) |
| `PaginationDTO<T>` | `@shared/domain/entity/domain/pagination.dto` | Standard pagination request structure |
| `QueueJobProducer` | `@shared/queue/queue-job.producer` | Base class for Bull queue producers |

### Shared Utilities & Constraints

| Utility | Location | Purpose |
|---------|----------|---------|
| `@IsValidScope()` | `@shared/domain/entity/constraint/is-valid-scope.constraint` | Scope validation decorator |
| `@IsValidUid()` | `@shared/domain/entity/constraint/is-uid-valid.constraint` | UID format validation |
| `@ServiceLogger()` | `@shared/logger/decorator/service-logger` | Lazy-initialized logger decorator |
| `EntityLinkService` | `@shared/domain/entity/entity-link/entity-link.service` | Generate UI links for entities |
| Custom Errors | `@shared/errors` | Standardized error classes with HTTP codes |

### Implementing Pagination (Example)

**DON'T** create custom pagination logic:

```typescript
// ❌ BAD - Custom pagination implementation
async listItems(page: number, pageSize: number) {
  const items = await this.em.find(Item, {}, { limit: pageSize, offset: (page - 1) * pageSize })
  const total = await this.em.count(Item)
  return { items, page, pageSize, total }
}
```

**DO** extend `PaginatedRepository` and `PaginationDTO`:

```typescript
// ✅ GOOD - Use shared abstractions

// 1. Repository extends PaginatedRepository
export class ItemRepository extends PaginatedRepository<Item> {
  // Inherits: paginate(), persist(), persistAndFlush(), etc.
}

// 2. DTO extends PaginationDTO
export class ItemPaginationDTO extends PaginationDTO<Item> {
  @IsOptional()
  @ValidateNested()
  @Type(() => ItemFilter)
  filter?: ItemFilter

  @IsOptional()
  sort?: SortDefinition<Item> = { createdAt: QueryOrder.DESC }
}

// 3. Service uses repository.paginate()
async listItems(query: ItemPaginationDTO): Promise<PaginatedResult<ItemDTO>> {
  const result = await this.itemRepository.paginate(query, {}, { populate: ['user'] })
  return {
    data: result.data.map(ItemDTO.fromEntity),
    meta: result.meta,  // Includes page, pageSize, totalPages, totalItems
  }
}
```

### Best Practices for Code Reuse

| Practice | Description |
|----------|-------------|
| **Check for existing abstractions first** | Before implementing, search `libs/shared/` for existing solutions |
| **Extend base classes** | Always extend `BaseEntity`, `PaginatedRepository`, `PaginationDTO` |
| **Use shared constraints** | Prefer existing validators like `@IsValidScope()` over custom validation |
| **Centralize cross-cutting concerns** | Logging, errors, config should come from `@shared/` |
| **Create new shared abstractions** | If you need functionality in 2+ domains, add it to `libs/shared/` |
| **Follow DRY principle** | Don't duplicate logic across domains; extract to shared modules |

### When to Create New Shared Abstractions

Create a new shared abstraction when:

1. **Multiple domains need the same logic** - If 2+ domains would benefit, abstract it
2. **Pattern is generalizable** - The logic isn't specific to one entity type
3. **Reduces boilerplate** - Significantly reduces repeated code
4. **Improves consistency** - Ensures uniform behavior across the application

Place new abstractions in:
- `libs/shared/src/database/` - Database-related base classes and utilities
- `libs/shared/src/domain/entity/` - Entity-level utilities, constraints, DTOs
- `libs/shared/src/errors/` - New error types
- `libs/shared/src/logger/` - Logging utilities

---

## Entities (MikroORM)

Entities represent database tables using MikroORM decorators.

### Base Entity

All entities extend `BaseEntity` for common fields:

```typescript
import { PrimaryKey, Property } from '@mikro-orm/core'

export abstract class BaseEntity {
  @PrimaryKey()
  id!: number

  @Property()
  createdAt = new Date()

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date()
}
```

### Entity Definition Pattern

Reference: `space-membership.entity.ts`

```typescript
import {
  Collection,
  Entity,
  Enum,
  ManyToOne,
  ManyToMany,
  Property,
  Ref,
  Reference,
} from '@mikro-orm/core'
import { BaseEntity } from '../../database/base.entity'
import { SPACE_MEMBERSHIP_ROLE, SPACE_MEMBERSHIP_SIDE } from './space-membership.enum'
import { SpaceMembershipRepository } from './space-membership.repository'

@Entity({ tableName: 'space_memberships', repository: () => SpaceMembershipRepository })
export class SpaceMembership extends BaseEntity {
  @Property()
  active: boolean

  @Enum({ items: () => SPACE_MEMBERSHIP_SIDE, nullable: false })
  side: SPACE_MEMBERSHIP_SIDE

  @Enum({ items: () => SPACE_MEMBERSHIP_ROLE, nullable: false })
  role: SPACE_MEMBERSHIP_ROLE

  @ManyToOne(() => User)
  user!: Ref<User>

  @ManyToMany(() => Space, (space) => space.spaceMemberships)
  spaces = new Collection<Space>(this)

  // Constructor with required relationships
  constructor(user: User, space: Space, side: SPACE_MEMBERSHIP_SIDE, role: SPACE_MEMBERSHIP_ROLE) {
    super()
    this.user = Reference.create(user)
    this.spaces.add(space)
    this.active = true
    this.side = side
    this.role = role
  }

  // Domain logic methods on the entity
  isHost(): boolean {
    return this.side === SPACE_MEMBERSHIP_SIDE.HOST
  }

  isAdminOrLead(): boolean {
    return [SPACE_MEMBERSHIP_ROLE.ADMIN, SPACE_MEMBERSHIP_ROLE.LEAD].includes(this.role)
  }
}
```

### Creating Entity References from IDs

When you have an ID but need to create a relationship without loading the entity:

```typescript
import { Reference } from '@mikro-orm/core'

// Creating a reference from a primary key (without loading the entity)
const notification = new Notification(
  notificationInput.userId ? Reference.createFromPK(User, notificationInput.userId) : null,
)

// Constructor pattern that accepts Ref
constructor(user: Ref<User> | null) {
  super()
  if (user !== null) {
    this.user = user
  }
}
```

### Entity Best Practices

| Practice | Description |
|----------|-------------|
| **Link to repository** | Use `repository: () => MyRepository` in `@Entity()` decorator |
| **Use `Ref<T>`** | For many-to-one relations, use `Ref<T>` for lazy loading |
| **Use `Reference.createFromPK()`** | Create refs from IDs without loading the entity |
| **Collections** | Initialize ManyToMany/OneToMany as `new Collection<T>(this)` |
| **Constructor** | Accept required entities or `Ref<T>` and set up relationships |
| **Domain methods** | Add boolean helpers and business logic methods to the entity |
| **Enums** | Define enums in a separate `*.enum.ts` file |
| **Types** | Define complex types in a separate `*.type.ts` file |

### Enum Files

```typescript
// space-membership.enum.ts
enum SPACE_MEMBERSHIP_SIDE {
  HOST = 0,
  GUEST = 1,
}

enum SPACE_MEMBERSHIP_ROLE {
  ADMIN = 0,
  CONTRIBUTOR = 1,
  VIEWER = 2,
  LEAD = 3,
}

export { SPACE_MEMBERSHIP_ROLE, SPACE_MEMBERSHIP_SIDE }
```

---

## Repositories

Custom repositories extend `PaginatedRepository` or `AccessControlRepository` for specialized functionality.

### Standard Repository Pattern

```typescript
import { PaginatedRepository } from '@shared/database/repository/paginated.repository'
import { SpaceMembership } from './space-membership.entity'
import { NotFoundError } from '@shared/errors'

export class SpaceMembershipRepository extends PaginatedRepository<SpaceMembership> {
  async getMembership(spaceId: number, userId: number): Promise<SpaceMembership> {
    const memberships = await this.find({ spaces: spaceId, user: userId, active: true })
    if (memberships.length > 0) {
      return memberships[0]
    }
    throw new NotFoundError(`Couldn't find membership for user ${userId}`)
  }

  async findActiveMembershipAndSpace(
    userId: number,
    role: SPACE_MEMBERSHIP_ROLE,
  ): Promise<SpaceMembership[]> {
    return await this.em.find(
      SpaceMembership,
      {
        user: userId,
        role,
        active: true,
        spaces: { state: SPACE_STATE.ACTIVE },
      },
      {
        populate: ['spaces'],
        populateWhere: PopulateHint.INFER,
      },
    )
  }
}
```

### Access Control Repository

For entities that require permission-based access:

```typescript
import { FilterQuery } from '@mikro-orm/core'
import { AccessControlRepository } from '@shared/database/repository/access-control.repository'
import { Discussion } from './discussion.entity'

export default class DiscussionRepository extends AccessControlRepository<Discussion> {
  protected async getAccessibleWhere(): Promise<FilterQuery<Discussion>> {
    const user = await this.em.findOneOrFail(User, { id: this.user.id })
    const isSiteAdmin = await user.isSiteAdmin()
    if (isSiteAdmin) {
      return {}
    }

    const accessibleSpaces = await user.accessibleSpaces()
    const scopes = accessibleSpaces.map((space) => space.scope)

    return {
      note: {
        $or: [{ scope: STATIC_SCOPE.PUBLIC }, { scope: { $in: scopes } }],
      },
    }
  }

  protected async getEditableWhere(): Promise<FilterQuery<Discussion>> {
    // Similar pattern for editable entities
  }
}
```

### Repository Best Practices

| Practice | Description |
|----------|-------------|
| **Extend base repositories** | Use `PaginatedRepository` or `AccessControlRepository` |
| **Query methods** | Define specific query methods rather than generic ones |
| **Use `this.em`** | Access EntityManager via `this.em` for complex queries |
| **Throw custom errors** | Use errors from `@shared/errors` (e.g., `NotFoundError`) |
| **Keep private** | Repositories should NOT be exported from domain modules |

---

## Services

Services contain business logic and are injected via constructors.

### Service Pattern

Reference: `discussion.service.ts`, `space-membership.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common'
import { Transactional } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import * as errors from '@shared/errors'

@Injectable()
export class DiscussionService {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly userCtx: UserContext,
    private readonly discussionRepository: DiscussionRepository,
    private readonly discussionReplyRepository: DiscussionReplyRepository,
    private readonly entityLinkService: EntityLinkService,
  ) {}

  async getDiscussion(discussionId: number): Promise<DiscussionDTO> {
    const discussion = await this.discussionRepository.findAccessibleOne({ id: discussionId })

    if (!discussion) {
      throw new errors.NotFoundError(
        'Unable to get discussion: not found or insufficient permissions.',
      )
    }

    await this.em.populate(discussion, ['note', 'user', 'follows', 'replies'])

    return DiscussionDTO.fromEntity(discussion, isFollowing)
  }

  @Transactional()
  async createDiscussion(dto: CreateDiscussionDTO): Promise<DiscussionDTO> {
    const user = await this.userCtx.loadEntity()

    const newNote = new Note(user)
    newNote.title = dto.title
    newNote.content = dto.content
    newNote.scope = dto.scope
    this.em.persist(newNote)

    const newDiscussion = new Discussion(newNote, user)
    await this.em.persistAndFlush(newDiscussion)

    return DiscussionDTO.fromEntity(newDiscussion, true)
  }
}
```

### Service Best Practices

| Practice | Description |
|----------|-------------|
| **`@Injectable()` decorator** | Required for dependency injection |
| **`@ServiceLogger()` decorator** | Use for lazy-initialized logger |
| **Constructor injection** | All dependencies via constructor |
| **UserContext injection** | Get current user via `UserContext` |
| **Repository injection** | Use custom repositories, not raw EntityManager |
| **Named providers** | Use `@Inject(TOKEN_NAME)` for named providers |
| **`@Transactional()`** | Use decorator for automatic transaction handling |

---

## Facades

Facades orchestrate multiple services and handle cross-cutting concerns like transactions, events, and emails.

### Shared Facades (`libs/shared/src/facade/`)

Used by both API and Worker:

```typescript
import { EntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { ClientRequestError, InternalError, InvalidStateError } from '@shared/errors'

@Injectable()
export class SpaceMembershipUpdateFacade {
  constructor(
    private readonly em: EntityManager,
    private readonly userContext: UserContext,
    private readonly spaceService: SpaceService,
    private readonly spaceMembershipService: SpaceMembershipService,
    private readonly maintenanceQueueJobProducer: MaintenanceQueueJobProducer,
    private readonly emailService: EmailService,
  ) {}

  async updatePermissions(
    spaceId: number,
    dto: UpdateSpaceMembershipDTO,
  ): Promise<SpaceMembership[]> {
    const sharedSpace = await this.spaceService.getSharedSpace(spaceId)
    
    if (typeof dto.enabled === 'boolean') {
      return await this.updateState(sharedSpace, dto.membershipIds, dto.enabled)
    } else if (dto.targetRole in SPACE_MEMBERSHIP_ROLE) {
      return await this.updateRole(sharedSpace, dto.membershipIds, dto.targetRole)
    }
    
    throw new InvalidStateError('No valid update action provided')
  }

  private async updateState(
    space: Space,
    memberIds: number[],
    enabled: boolean,
  ): Promise<SpaceMembership[]> {
    try {
      const updatedMemberships = await this.em.transactional(async () => {
        // ... transactional updates
        await this.createSpaceEvents(updated, action, activityType)
        return updated
      })

      // Send emails AFTER successful transaction
      await this.sendUpdateEmail(updatedMemberships, space.id, activityType, action)
      return updatedMemberships
    } catch (error: unknown) {
      // Queue recovery task on failure
      await this.maintenanceQueueJobProducer.createSyncSpaceMemberAccessTask(space.id, memberIds)
      if (error instanceof ClientRequestError) {
        throw new InternalError('Failed to update space membership')
      }
      throw error
    }
  }
}
```

### API Facades (`apps/api/src/facade/`)

Wrap shared facades with API-specific logic:

```typescript
@Injectable()
export class SpaceMembershipUpdateApiFacade {
  constructor(
    private readonly spaceMembershipUpdateFacade: SpaceMembershipUpdateFacade,
    private readonly dbClusterSynchronizeFacade: DbClusterSynchronizeFacade,
  ) {}

  async updatePermissions(spaceId: number, body: UpdateSpaceMembershipDTO): Promise<void> {
    await this.spaceMembershipUpdateFacade.updatePermissions(spaceId, body)
    await this.dbClusterSynchronizeFacade.synchronizeInSpace(spaceId)
  }
}
```

### Facade Best Practices

| Practice | Description |
|----------|-------------|
| **Transaction orchestration** | Use `em.transactional()` for multi-entity operations |
| **Error recovery** | Queue compensating tasks on failure |
| **Email sending** | Send emails AFTER successful transactions |
| **Separation** | Keep shared logic in `libs/shared/src/facade/`, API-specific in `apps/api/src/facade/` |
| **Small and focused** | Each facade should handle ONE specific action |

### Facade Module Pattern

```typescript
@Module({
  imports: [
    PlatformClientModule,
    SpaceModule,
    UserModule,
    EmailModule,
    SpaceEventModule,
    SpaceMembershipModule,
  ],
  providers: [SpaceMembershipCreateFacade, SpaceMembershipUpdateFacade],
  exports: [SpaceMembershipCreateFacade, SpaceMembershipUpdateFacade],
})
export class SpaceMembershipFacadeModule {}
```

---

## Controllers

Controllers handle HTTP requests and delegate to facades. They should be thin.

### Controller Pattern

Reference: `nodes.controller.ts`

```typescript
import { Body, Controller, Delete, HttpCode, Post, UseGuards } from '@nestjs/common'
import { ApiOperation } from '@nestjs/swagger'
import { UserContextGuard } from '../user-context/guard/user-context.guard'

@UseGuards(UserContextGuard)
@Controller('/nodes')
export class NodesController {
  constructor(
    private readonly user: UserContext,
    private readonly removeNodesFacade: RemoveNodesFacade,
    private readonly lockNodeFacade: LockNodeFacade,
    private readonly unlockNodeFacade: UnlockNodeFacade,
    private readonly fileSyncQueueJobProducer: FileSyncQueueJobProducer,
  ) {}

  @HttpCode(204)
  @Post('/copy')
  async copyNodes(@Body() input: NodesCopyDTO): Promise<void> {
    await this.fileSyncQueueJobProducer.createCopyNodesTask(input, this.user)
  }

  @HttpCode(204)
  @Post('/lock')
  async lockNodes(@Body() input: NodesInputDTO): Promise<void> {
    const { ids, async } = input

    if (async) {
      await this.lockNodeFacade.startLockJob(ids)
    } else {
      await this.lockNodeFacade.lockNodes(ids, async)
    }
  }

  @Delete('/remove')
  async removeNodes(@Body() input: NodesInputDTO): Promise<number> {
    const { ids, async } = input

    if (async) {
      await this.removeNodesFacade.removeNodesAsync(ids)
    } else {
      const res = await this.removeNodesFacade.removeNodes(ids)
      return res.removedFoldersCount + res.removedFilesCount
    }
  }
}
```

### Controller Best Practices

| Practice | Description |
|----------|-------------|
| **`@UseGuards(UserContextGuard)`** | Apply to all authenticated endpoints |
| **`@HttpCode()`** | Explicitly set response codes (204 for no content) |
| **`@ApiOperation()`** | Document endpoints for Swagger |
| **`ParseIntPipe`** | Validate and transform route parameters |
| **DTO validation** | Use DTOs with class-validator decorators |
| **Delegate to facades** | Controllers should be thin, delegating to facades |
| **No entities** | Controllers should NEVER work with entities directly |

### Param DTO Pattern

For complex route parameters:

```typescript
import { IsValidUid } from '@shared/domain/entity/constraint/is-uid-valid.constraint'
import { Uid } from '@shared/domain/entity/domain/uid'

export class DbClusterUidParamDto {
  @IsValidUid({ entityType: 'dbcluster' })
  dbclusterUid: Uid<'dbcluster'>
}

// Usage in controller
@Put(':dbclusterUid')
async updateDbCluster(
  @Param() params: DbClusterUidParamDto,
  @Body() body: UpdateDbClusterDTO,
): Promise<void> {
  return await this.dbClusterUpdateFacade.updateDbCluster(params.dbclusterUid, body)
}
```

---

## DTOs (Data Transfer Objects)

DTOs use class-validator and class-transformer for validation and transformation.

### Request DTOs

```typescript
import { ArrayNotEmpty, IsArray, IsBoolean, IsEnum, IsInt, IsOptional } from 'class-validator'
import { SPACE_MEMBERSHIP_ROLE } from '../space-membership.enum'

export class UpdateSpaceMembershipDTO {
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  membershipIds: number[]

  @IsEnum(SPACE_MEMBERSHIP_ROLE)
  @IsOptional()
  targetRole?: SPACE_MEMBERSHIP_ROLE

  @IsBoolean()
  @IsOptional()
  enabled?: boolean
}
```

### Pagination DTOs

```typescript
import { Type } from 'class-transformer'
import { IsOptional, IsString, ValidateNested } from 'class-validator'
import { QueryOrder } from '@mikro-orm/core'
import { PaginationDTO, SortDefinition } from '@shared/domain/entity/domain/pagination.dto'
import { IsValidScope } from '@shared/domain/entity/constraint/is-valid-scope.constraint'

class DiscussionFilter {
  @IsOptional()
  @IsString()
  title: string
}

export class DiscussionPaginationDTO extends PaginationDTO<Discussion> {
  @IsOptional()
  @ValidateNested()
  @Type(() => DiscussionFilter)
  filter?: DiscussionFilter

  @IsValidScope({ allowHomeScope: { me: false, featured: false, everybody: true, spaces: true } })
  scope: EntityScope | HOME_SCOPE.EVERYBODY | HOME_SCOPE.SPACES

  @IsOptional()
  sort?: SortDefinition<Discussion & { title: string }> = { createdAt: QueryOrder.DESC }
}
```

### Response DTOs

```typescript
export class DiscussionDTO {
  id: number
  title: string
  content: string
  scope: string
  createdAt: Date

  static fromEntity(discussion: Discussion, isFollowing: boolean): DiscussionDTO {
    return {
      id: discussion.id,
      title: discussion.note.getEntity().title,
      content: discussion.note.getEntity().content,
      scope: discussion.note.getEntity().scope,
      createdAt: discussion.createdAt,
      isFollowing,
    }
  }
}
```

### DTO Best Practices

| Practice | Description |
|----------|-------------|
| **Validation decorators** | Use class-validator decorators |
| **Transformation** | Use `@Type()` for nested objects and number conversion |
| **Optional with defaults** | Use `@IsOptional()` with default values |
| **Static factory methods** | Use `static fromEntity()` for response DTOs |
| **Custom constraints** | Create reusable validators in `constraint/` directory |

### Logic Validation

Beyond DTO validation, there are two types of logical validation:

#### Before Action Validation

After formal DTO validation passes, perform logical/business rule validation before any action:

```typescript
async createGovernmentSpace(dto: CreateSpaceDTO): Promise<Space> {
  const user = await this.userCtx.loadEntity()
  
  // Logical validation before any action
  if (dto.type === SPACE_TYPE.GOVERNMENT && !user.isGovernmentUser()) {
    throw new PermissionError('Government spaces can only be created by government users')
  }
  
  // Now proceed with creation...
}
```

#### Consistency Assurance

Even with database constraints, developers must verify relationships and state:

```typescript
async addMemberToSpace(spaceId: number, userId: number): Promise<void> {
  const space = await this.spaceService.getSpace(spaceId)
  const user = await this.userService.getUser(userId)
  
  // Don't rely solely on database constraints - validate explicitly
  const existingMembership = await this.membershipRepo.findOne({ space, user })
  if (existingMembership) {
    throw new InvalidStateError('User is already a member of this space')
  }
  
  // Proceed with adding member...
}
```

---

## Modules

Modules wire together dependencies using NestJS module pattern.

### Domain Modules

Domain modules are the **main building blocks** of the application. They encapsulate all logic for a specific domain.

**Critical Rules:**

1. **Only export the main domain service** - Each domain module should ONLY export one main service (e.g., `SpaceModule` only exports `SpaceService`)
2. **Repositories are NEVER exported** - Repositories should only be used within the domain module
3. **Avoid circular dependencies** - Domain modules can only depend on their own values or global modules (e.g., `UserModule` cannot depend on `SpaceModule`)
4. **Sub-services stay internal** - You can split logic into sub-services (e.g., `SpaceCreationService`), but these should never be exported

```typescript
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { PlatformClientModule } from '@shared/platform-client/platform-client.module'
import { SpaceMembershipProviderModule } from './providers/space-membership-provider.module'
import { SpaceMembershipService } from './service/space-membership.service'
import { SpaceMembership } from './space-membership.entity'
import { SpaceMembershipUpdatePermissionModule } from './service/update-permission/space-membership-update-permission.module'

@Module({
  imports: [
    MikroOrmModule.forFeature([SpaceMembership]),
    SpaceMembershipProviderModule,
    SpaceMembershipUpdatePermissionModule,
    PlatformClientModule,
  ],
  providers: [SpaceMembershipService],
  // ✅ Only export the main service (and MikroOrmModule for entity access)
  exports: [MikroOrmModule, SpaceMembershipService],
})
export class SpaceMembershipModule {}
```

**Domain modules can also:**
- Encapsulate multiple related database tables (e.g., `SpaceReportModule` handles both `space_reports` and `space_report_parts`)
- Not work with a database at all (e.g., `PlatformClientModule` for external API communication)

### API Modules

API modules define the HTTP API. **Create one API module per first segment of the URL path** (e.g., `SpaceApiModule` handles all requests starting with `/space`).

```typescript
@Module({
  imports: [SpaceMembershipApiFacadeModule],
  controllers: [SpaceMembershipsController],
})
export class SpaceMembershipsApiModule {}
```

### Worker Modules

Worker modules handle asynchronous tasks from message queues. They are analogous to API modules but for background jobs.

```typescript
@Module({
  imports: [SpaceMembershipFacadeModule, MaintenanceFacadeModule],
  providers: [MaintenanceProcessor],
})
export class MaintenanceWorkerModule {}
```

**Create one worker module per message queue.**

### Processors

Processors define how each queued task should be handled:

```typescript
@Processor(config.workerJobs.queues.maintenance.name)
export class MaintenanceProcessor {
  constructor(
    private readonly spaceMembershipService: SpaceMembershipService,
  ) {}

  @Process(TASK_TYPE.SYNC_SPACE_MEMBER_ACCESS)
  async syncSpaceMemberAccess(job: Job<SyncSpaceMemberAccessPayload>): Promise<void> {
    const { spaceId, memberIds } = job.data.payload
    await this.spaceMembershipService.syncPlatformAccess(spaceId, memberIds)
  }
}
```

**Note:** Unlike controllers, processors don't validate inputs or handle access control since jobs are created internally and should already be validated.

### Module Best Practices

| Practice | Description |
|----------|-------------|
| **`MikroOrmModule.forFeature()`** | Register entities for repository injection |
| **Only export main service** | Domain modules export only the main service, never sub-services or repositories |
| **Repositories stay internal** | Never export repositories; all DB access goes through the domain service |
| **Import shared modules** | Import from `@shared/` for cross-cutting concerns |
| **Separate concerns** | Domain modules in `libs/shared/`, API modules in `apps/api/` |
| **Avoid circular dependencies** | Domain modules can only depend on global modules (like `LoggerModule`) |
| **One API module per URL segment** | Group endpoints by the first URL path segment |
| **One worker module per queue** | Each message queue gets its own worker module |

---

## Providers Pattern

Use the provider pattern for strategy/factory injection.

### Abstract Provider Class

```typescript
export abstract class SpaceMembershipUpdatePermissionProvider {
  protected constructor(
    protected readonly em: SqlEntityManager,
    protected readonly platformClient: PlatformClient,
    protected readonly spaceMembershipRepository: SpaceMembershipRepository,
    protected readonly platformAccessProvider: SpaceMembershipPlatformAccessProvider,
  ) {}

  protected abstract permittedUpdaterRoles: SPACE_MEMBERSHIP_ROLE[]
  protected abstract updateMembership(membership: SpaceMembership): void

  async validateUpdaterRole(currentMembership: SpaceMembership): Promise<void> {
    if (!this.permittedUpdaterRoles.includes(currentMembership.role)) {
      throw new PermissionError('User does not have permission')
    }
  }

  async update(
    space: Space,
    currentMembership: SpaceMembership,
    changeableMemberships: SpaceMembership[],
  ): Promise<number[]> {
    await this.updateMemberships(changeableMemberships)
    await this.updateOrgsAccess(space, currentMembership, changeableMemberships)
    return changeableMemberships.map((m) => m.id)
  }
}
```

### Concrete Provider

```typescript
@Injectable()
export class SpaceMembershipUpdatePermissionToAdminProvider extends SpaceMembershipUpdatePermissionProvider {
  constructor(
    protected readonly em: SqlEntityManager,
    protected readonly platformClient: PlatformClient,
    protected readonly spaceMembershipRepository: SpaceMembershipRepository,
    protected readonly platformAccessToAdminProvider: SpaceMembershipPlatformAccessToAdminProvider,
  ) {
    super(em, platformClient, spaceMembershipRepository, platformAccessToAdminProvider)
  }

  protected permittedUpdaterRoles = [SPACE_MEMBERSHIP_ROLE.LEAD, SPACE_MEMBERSHIP_ROLE.ADMIN]

  protected updateMembership(membership: SpaceMembership): void {
    membership.role = SPACE_MEMBERSHIP_ROLE.ADMIN
  }
}
```

### Provider Map Factory

```typescript
export const SPACE_MEMBERSHIP_PERMISSION_TO_UPDATE_PROVIDER_MAP = 'PERMISSION_TO_UPDATE_PROVIDER_MAP'

export const SpaceMembershipToPermissionUpdateProviderProvider: Provider = {
  provide: SPACE_MEMBERSHIP_PERMISSION_TO_UPDATE_PROVIDER_MAP,
  inject: [
    SpaceMembershipUpdatePermissionToLeadProvider,
    SpaceMembershipUpdatePermissionToAdminProvider,
    // ... other providers
  ],
  useFactory: (toLead, toAdmin, ...others): SpaceMembershipPermissionUpdateProviderMap => {
    return {
      [SPACE_MEMBERSHIP_ROLE.LEAD]: toLead,
      [SPACE_MEMBERSHIP_ROLE.ADMIN]: toAdmin,
      // ... map all roles to providers
    }
  },
}
```

---

## Error Handling

Use custom error classes from `@shared/errors`.

### Error Classes

| Error Class | HTTP Status | Code | When to Use |
|-------------|-------------|------|-------------|
| `NotFoundError` | 404 | `E_NOT_FOUND` | Entity not found |
| `PermissionError` | 403 | `E_NOT_PERMITTED` | User lacks permission |
| `InvalidStateError` | 422 | `E_INVALID_STATE` | Entity in wrong state |
| `ValidationError` | 400 | `E_VALIDATION` | Input validation failed |
| `InvalidRequestError` | 400 | `E_INVALID_REQUEST` | Malformed request |
| `UnauthorizedRequestError` | 401 | `E_UNAUTHORIZED_REQUEST` | Missing/invalid auth |
| `InternalError` | 500 | `E_INTERNAL` | Unexpected server error |
| `ClientRequestError` | 400 | `E_DNANEXUS_PLATFORM_REQUEST_FAILED` | Platform API failed |

### Usage Examples

```typescript
import {
  InvalidStateError,
  NotFoundError,
  PermissionError,
  ValidationError,
} from '@shared/errors'

// Throw errors with descriptive messages
throw new NotFoundError('Unable to get discussion: not found or insufficient permissions.')
throw new PermissionError('Unable to create reply: unpublished discussion.')
throw new InvalidStateError('No valid update action provided')
throw new ValidationError('Unable to create reply: user already has an answer for this discussion.')
```

---

## Logging

Use the `@ServiceLogger()` decorator for lazy-initialized loggers.

### Logger Setup

```typescript
import { Injectable, Logger } from '@nestjs/common'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'

@Injectable()
export class MyService {
  @ServiceLogger()
  private readonly logger: Logger

  async doSomething(): Promise<void> {
    this.logger.log('Starting operation')
    this.logger.warn('Warning message')
    this.logger.error('Error occurred', errorStack)
    this.logger.log({ metadata: 'value' }, 'Message with metadata')
  }
}
```

### Logging Best Practices

| Practice | Description |
|----------|-------------|
| **Use `@ServiceLogger()`** | Automatically names logger after class |
| **Don't use `console.log`** | Always use injected Logger |
| **Structured logging** | Pass objects as first argument for metadata |
| **Log at appropriate levels** | `log`, `warn`, `error`, `debug`, `verbose` |
| **No PII** | Never log user info, folder names, app names |
| **Log IDs** | You can log entity IDs and business logic actions |

### Log Message Examples

```typescript
this.logger.log(`Adding new follower (user: ${this.userCtx.id}) to discussion: ${discussionId}`)
this.logger.log(`Syncing platform access for space ${spaceId} and members ${memberIds}`)
this.logger.warn(`No memberships found for space ${spaceId}`)
```

---

## Guards

Guards implement `CanActivate` for route protection.

```typescript
import { CanActivate, Injectable, Logger } from '@nestjs/common'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { UnauthorizedRequestError } from '@shared/errors'

@Injectable()
export class UserContextGuard implements CanActivate {
  constructor(
    private readonly logger: Logger,
    private readonly user: UserContext,
    private readonly em: SqlEntityManager,
  ) {}

  public async canActivate(): Promise<boolean> {
    if (!this.user.id || !this.user.dxuser || !this.user.accessToken) {
      throw new UnauthorizedRequestError()
    }

    const userFromDb = await this.em.findOne(User, { id: this.user.id, dxuser: this.user.dxuser })
    if (userFromDb) {
      return true
    }

    this.logger.error(`User not found: ${this.user.id}, ${this.user.dxuser}`)
    throw new UnauthorizedRequestError()
  }
}
```

---

## User Context

Access current user information via `UserContext`.

```typescript
import { UserContext } from '@shared/domain/user-context/model/user-context'

@Injectable()
export class MyService {
  constructor(private readonly user: UserContext) {}

  async doSomething(): Promise<void> {
    const userId = this.user.id
    const dxuser = this.user.dxuser
    const accessToken = this.user.accessToken
    
    // Load full user entity when needed
    const userEntity = await this.user.loadEntity()
  }
}
```

---

## Platform Client

Access DNAnexus platform APIs through the platform client.

```typescript
// Regular user client (uses current user's access token)
constructor(
  private readonly platformClient: PlatformClient,
) {}

// Admin client (uses admin credentials)
constructor(
  @Inject(ADMIN_PLATFORM_CLIENT)
  private readonly adminClient: PlatformClient,
) {}

// Usage
await this.platformClient.projectDescribe(projectId)
await this.adminClient.projectUpdate(project, { billTo: newBillTo })
```

---

## Queue/Job Producers

Use Bull queue producers for background jobs. **Always inject producers via dependency injection** rather than using the deprecated standalone functions.

### Available Queue Producers

| Producer | Queue | Purpose |
|----------|-------|---------|
| `MainQueueJobProducer` | Main queue | Job sync, file sync, DbCluster tasks |
| `MaintenanceQueueJobProducer` | Maintenance queue | Space member access sync, cleanup tasks |
| `FileSyncQueueJobProducer` | File sync queue | File copying, locking, node removal |
| `EmailQueueJobProducer` | Email queue | Email sending |

### Using Queue Producers (Correct Pattern)

**DO** inject the producer via constructor:

```typescript
import { Injectable } from '@nestjs/common'
import { MainQueueJobProducer } from '@shared/queue/producer/main-queue-job.producer'
import { UserContext } from '@shared/domain/user-context/model/user-context'

@Injectable()
export class MyFacade {
  constructor(
    private readonly mainQueueJobProducer: MainQueueJobProducer,
    private readonly userContext: UserContext,
  ) {}

  async startJobSync(jobDxid: DxId<'job'>): Promise<void> {
    await this.mainQueueJobProducer.createSyncJobStatusTask(
      { dxid: jobDxid },
      this.userContext,
    )
  }
}
```

**DON'T** use the deprecated standalone functions from `@shared/queue`:

```typescript
// ❌ BAD - Deprecated functions
import { createSyncJobStatusTask } from '@shared/queue'
await createSyncJobStatusTask({ dxid: jobDxid }, userContext)

// ✅ GOOD - Use injected producer
await this.mainQueueJobProducer.createSyncJobStatusTask({ dxid: jobDxid }, this.userContext)
```

### Module Setup

To use queue producers, import `QueueModule` in your facade module:

```typescript
import { QueueModule } from '@shared/queue/queue.module'

@Module({
  imports: [QueueModule, /* other modules */],
  providers: [MyFacade],
  exports: [MyFacade],
})
export class MyFacadeModule {}
```

### Creating Custom Queue Producers

If you need a custom producer, extend `QueueJobProducer`:

```typescript
import { InjectQueue } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'
import { config } from '@shared/config'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { QueueJobProducer } from '@shared/queue/queue-job.producer'
import { Job, JobOptions, Queue } from 'bull'

@Injectable()
export class MaintenanceQueueJobProducer extends QueueJobProducer {
  constructor(
    @InjectQueue(config.workerJobs.queues.maintenance.name)
    protected readonly queue: Queue,
    private readonly user: UserContext,
  ) {
    super()
  }

  async createSyncSpaceMemberAccessTask(spaceId: number, memberIds: number[]): Promise<Job> {
    const wrapped = {
      type: TASK_TYPE.SYNC_SPACE_MEMBER_ACCESS as const,
      payload: { spaceId, memberIds },
      user: this.user,
    }

    const options: JobOptions = {
      jobId: `${wrapped.type}.${spaceId}`,
    }
    return await this.addToQueue(wrapped, options)
  }
}
```

---

## Transactions

Methods should use transactions for data modifications.

### Persist and Flush Pattern

**DO** use separate `persist()` and `flush()` calls:

```typescript
// ✅ GOOD - Separate persist and flush
this.em.persist(entity)
await this.em.flush()

// ✅ GOOD - Batch multiple persists before flushing
this.em.persist(entity1)
this.em.persist(entity2)
await this.em.flush()
```

**DON'T** use `persistAndFlush()`:

```typescript
// ❌ BAD - Deprecated pattern
await this.em.persistAndFlush(entity)
```

The separate pattern provides:
- Better control over when database writes occur
- Ability to batch multiple entity changes into a single flush
- Clearer separation of in-memory changes from database persistence

### Using `em.transactional()`

```typescript
async updateState(space: Space, memberIds: number[], enabled: boolean): Promise<SpaceMembership[]> {
  const updatedMemberships = await this.em.transactional(async () => {
    const updated = await this.spaceMembershipService.updatePermission(
      space,
      membership,
      memberIds,
      action,
    )

    await this.createSpaceEvents(updated, action, activityType)
    return updated
  })

  // Do non-transactional work after (like sending emails)
  await this.sendUpdateEmail(updatedMemberships, space.id, activityType, action)
  return updatedMemberships
}
```

### Using `@Transactional()` Decorator

```typescript
@Transactional()
async createDiscussion(dto: CreateDiscussionDTO): Promise<DiscussionDTO> {
  const user = await this.userCtx.loadEntity()

  const newNote = new Note(user)
  newNote.title = dto.title
  this.em.persist(newNote)

  const newDiscussion = new Discussion(newNote, user)
  this.em.persist(newDiscussion)
  await this.em.flush()

  return DiscussionDTO.fromEntity(newDiscussion, true)
}
```

### Nested Transactions

If a function doing transactional work calls another function doing transactional work, wrap that call in `em.transactional()`:

```typescript
async fxWithTransaction() {
  await this.em.transactional(async () => {
    this.em.persist(something)
    await this.anotherService.fxWithTransaction()
  })
}
```

---

## Testing

Use Mocha with Sinon stubs for unit tests.

### Test Structure

```typescript
import { expect } from 'chai'
import { stub, SinonStub } from 'sinon'

describe('SpaceMembershipUpdateFacade', () => {
  const getCurrentUserMembershipInSharedSpaceStub = stub()
  const transactionalStub = stub()
  const updatePermissionStub = stub()

  const userContext = {
    loadEntity: () => Promise.resolve(currentUser),
  } as UserContext

  beforeEach(() => {
    // Reset stubs before each test
    getCurrentUserMembershipInSharedSpaceStub.reset()
    getCurrentUserMembershipInSharedSpaceStub.throws()  // Default to throwing
    getCurrentUserMembershipInSharedSpaceStub.withArgs(GROUP_SPACE_ID).resolves(membership)

    transactionalStub.reset()
    transactionalStub.callsFake(async (callback) => {
      return await callback(em)
    })

    updatePermissionStub.reset()
    updatePermissionStub.throws()
  })

  context('updatePermissions', () => {
    it('should throw if no valid action provided', async () => {
      const facade = getInstance()
      await expect(
        facade.updatePermissions(GROUP_SPACE_ID, {
          membershipIds: MEMBER_IDS,
        }),
      ).to.be.rejectedWith(InvalidStateError, 'No valid update action provided')
    })

    it('should call updateState if enabled provided', async () => {
      const updateStateStub = stub(SpaceMembershipUpdateFacade.prototype, 'updateState')
      updateStateStub.resolves([])
      
      const facade = getInstance()
      const result = await facade.updatePermissions(GROUP_SPACE_ID, {
        membershipIds: MEMBER_IDS,
        enabled: true,
      })
      
      expect(result).to.deep.equal([])
      expect(updateStateStub.calledOnce).to.be.true()
      updateStateStub.restore()
    })
  })

  function getInstance(): SpaceMembershipUpdateFacade {
    return new SpaceMembershipUpdateFacade(
      em,
      userContext,
      spaceService,
      spaceMembershipService,
      maintenanceQueueJobProducer,
      emailService,
    )
  }
})
```

### Testing Best Practices

| Practice | Description |
|----------|-------------|
| **Reset stubs in `beforeEach`** | Always reset stubs between tests |
| **Default to throwing** | Make stubs throw by default to catch unexpected calls |
| **Use factory functions** | Create service instances via `getInstance()` helper |
| **Mock at boundaries** | Mock repositories, platform clients, and external services |
| **Test file naming** | Use `*.spec.ts` suffix |
| **Location** | Place tests in `libs/shared/test/unit/domain/` |

---

## Configuration

Configuration is centralized in `libs/shared/src/config/index.ts`.

```typescript
import { config } from '@shared/config'

// Access configuration values
const port = config.api.port
const dbUrl = config.database.clientUrl
const platformUrl = config.platform.apiUrl
```

### Adding New Config

1. Add to the `defaultConfig` object in `config/index.ts`
2. Add environment-specific overrides in `config/envs/`
3. Document new env vars in `.env.example`

---

## Naming Conventions

### Variable & Property Casing

**Use camelCase everywhere in the backend TypeScript/NestJS codebase.** This applies to:

- Variable names: `membershipIds`, `targetRole`, `spaceId`
- Object property names: `{ userId: 123, createdAt: new Date() }`
- Function/method names: `updatePermissions()`, `getDiscussion()`
- DTO properties: `membershipIds`, `targetRole`, `enabled`
- API request/response bodies: `{ membershipIds: [1, 2, 3] }`

**Where you may encounter snake_case:**

| Source | Casing | How to Handle |
|--------|--------|---------------|
| **Legacy Rails code** | `snake_case` | The legacy Rails application uses Ruby conventions (`user_id`, `created_at`). When interfacing with Rails or migrating code, convert to camelCase in the NestJS layer. |
| **DNAnexus Platform API** | `snake_case` | Platform API responses use snake_case (`project_id`, `bill_to`). The `PlatformClient` handles these responses - convert to camelCase when mapping to our domain objects. |
| **Database columns** | `snake_case` | MikroORM automatically maps camelCase properties to snake_case columns. Use `@Property({ fieldName: 'legacy_column' })` for explicit mapping when needed. |

**Example - Platform API Response Mapping:**

```typescript
// Platform API returns snake_case
const platformResponse = {
  project_id: 'project-123',
  bill_to: 'org-456',
  created_at: '2024-01-01',
}

// Map to camelCase in our domain
const project = {
  projectId: platformResponse.project_id,
  billTo: platformResponse.bill_to,
  createdAt: new Date(platformResponse.created_at),
}
```

### Files

| Type | Convention | Example |
|------|------------|---------|
| Entity | `kebab-case.entity.ts` | `space-membership.entity.ts` |
| Repository | `kebab-case.repository.ts` | `space-membership.repository.ts` |
| Service | `kebab-case.service.ts` | `space-membership.service.ts` |
| Facade | `kebab-case.facade.ts` | `space-membership-update.facade.ts` |
| Controller | `kebab-case.controller.ts` | `space-memberships.controller.ts` |
| DTO | `kebab-case.dto.ts` | `update-space-membership.dto.ts` |
| Module | `kebab-case.module.ts` | `space-membership.module.ts` |
| Enum | `kebab-case.enum.ts` | `space-membership.enum.ts` |
| Type | `kebab-case.type.ts` | `space-membership.type.ts` |
| Test | `kebab-case.spec.ts` | `space-membership-update.facade.spec.ts` |

### Classes

| Type | Convention | Example |
|------|------------|---------|
| Entity | Singular PascalCase | `SpaceMembership` |
| Service | Singular + Service | `SpaceMembershipService` |
| Facade | Action + Facade | `SpaceMembershipUpdateFacade` |
| Controller | Plural + Controller | `SpaceMembershipsController` |
| DTO | Action + DTO | `UpdateSpaceMembershipDTO` |

### URLs

- Use kebab-case: `data-portals/:id`, `/space-memberships`

### Parameters

- Use camelCase: `membershipIds`, `targetRole`

---

## File Organization Summary

For a new domain feature (e.g., `space-membership`):

```
libs/shared/src/domain/space-membership/
├── space-membership.entity.ts       # Entity definition
├── space-membership.repository.ts   # Custom repository
├── space-membership.module.ts       # Domain module
├── space-membership.enum.ts         # Enums
├── space-membership.type.ts         # Types
├── space-membership.helper.ts       # Pure utility functions
├── dto/
│   └── update-space-membership.dto.ts
├── service/
│   └── space-membership.service.ts
└── providers/
    └── space-membership-provider.module.ts

libs/shared/src/facade/space-membership/
├── space-membership-facade.module.ts
├── space-membership-create.facade.ts
└── space-membership-update.facade.ts

apps/api/src/space-memberships/
├── space-memberships.api.module.ts
└── space-memberships.controller.ts

apps/api/src/facade/space-membership/
├── space-membership-api-facade.module.ts
└── space-membership-update-api.facade.ts

libs/shared/test/unit/domain/
└── space-membership-update.facade.spec.ts
```

---

## Quick Reference

| Pattern | Location | Purpose |
|---------|----------|---------|
| Entity | `libs/shared/src/domain/<domain>/*.entity.ts` | Database table mapping |
| Repository | `libs/shared/src/domain/<domain>/*.repository.ts` | Data access |
| Service | `libs/shared/src/domain/<domain>/service/*.service.ts` | Business logic |
| Shared Facade | `libs/shared/src/facade/<domain>/*.facade.ts` | Cross-service orchestration |
| API Facade | `apps/api/src/facade/<domain>/*.facade.ts` | API-specific orchestration |
| Controller | `apps/api/src/<domain>/*.controller.ts` | HTTP handlers |
| DTO | `libs/shared/src/domain/<domain>/dto/*.dto.ts` | Request/response objects |
| Module | `*.module.ts` | Dependency wiring |
| Test | `libs/shared/test/unit/domain/*.spec.ts` | Unit tests |

---

## TODOs

Whenever leaving TODOs around the codebase, always include a Jira ticket ID:

```typescript
// BAD
// TODO - refactor this

// GOOD
// TODO (PFDA-1234) - refactor this
```

---

## Type Definitions

- **Default to interfaces** when you don't specifically need anything else
- **Use class** when you need dynamic runtime behavior (getters/setters/methods/static properties)
- **Use types** when you need dynamic compile-time behavior (unions/conditionals/mappings)
