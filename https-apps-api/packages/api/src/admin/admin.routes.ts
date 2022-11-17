/* eslint-disable multiline-ternary */
import { errors, queue, user, utils, client } from '@pfda/https-apps-shared'
import { DefaultState } from 'koa'
import Router from 'koa-router'
import { defaultMiddlewares } from '../server/middleware'
import { makePaginationParseMdw } from '../server/middleware/pagination'
import { validateSiteAdminMdw } from '../server/middleware/user-context'
import { makeValidationMiddleware } from '../server/middleware/validation'
import { enumValidator, makeCloudGovBulkUserUpdateMiddlewareSchema, numericBodyValidator } from './possibly-reusable-things'


// Routes with /admin prefix
const router = new Router<DefaultState, PaginationCtxT>()

router.use(defaultMiddlewares)
// TODO(samuel) - implement redirect on client side - logic from Ruby
router.use(validateSiteAdminMdw)

router.get(
  '/checkStaleJobs',
  async ctx => {
    const res = await queue.createCheckStaleJobsTask(ctx.user)
    ctx.body = res
    ctx.status = 200
  },
)

const listUserSortableColumns = [
  // 'id' as const,
  'dxuser' as const,
  'email' as const,
  'lastLogin' as const,
  'userState' as const,
  'totalLimit' as const,
  'jobLimit' as const,
]

const filterSchema = {
  dxuser: utils.filters.MATCH_FILTER,
  email: utils.filters.MATCH_FILTER,
  // :D
  userState: utils.filters.createEnumFilter(['0', '1', '2']),
  lastLogin: utils.filters.MATCH_FILTER,
  totalLimit: utils.filters.NUMERIC_RANGE_FILTER,
  jobLimit: utils.filters.NUMERIC_RANGE_FILTER,
}

type PaginationCtxT = Api.Ctx<{pagination: {
  enabled: true
  paginatedEntity: user.User
  sortColumn: typeof listUserSortableColumns[number]
  filterSchema: typeof filterSchema
}}>

router.get('/users', makePaginationParseMdw<user.User, typeof listUserSortableColumns[number]>({
  sort: {
    isOrderByMandatory: false,
    sortableColumns: listUserSortableColumns,
  },
  pagination: {
    defaultPerPage: 50,
  },
  filter: {
    schema: filterSchema,
  },
}), async (ctx: PaginationCtxT) => {
  const { pagination } = ctx
  const { orderBy, filters } = pagination
  const res = orderBy === 'totalLimit' || orderBy === 'jobLimit' || Boolean(filters.totalLimit) || Boolean(filters.jobLimit)
    ? await ctx.em.getRepository(user.User).findPaginatedWithJsonFields({
      ...pagination,
      ...(function() {
        if (!orderBy) {
          return {} as const
        } else if (orderBy === 'totalLimit' || orderBy === 'jobLimit') {
          return {
            orderBy: {
              type: 'json' as const,
              // TODO(samuel) solve this camelCase vs snake_case issue
              sqlColumn: 'cloud_resource_settings',
              path: [{
                totalLimit: 'total_limit',
                jobLimit: 'job_limit',
              }[orderBy]],
            },
          }
        }
        return {
          orderBy: {
            type: 'standard' as const,
            value: orderBy,
          },
        } as any
        // Note(samuel) added 'as any' because of poor type resolution of conditionals
      })(),
      filters: utils.filters.buildFiltersWithColumnNodes<user.User, typeof filterSchema>(filters, {
        totalLimit: {
          sqlColumn: 'cloud_resource_settings' as any,
          path: ['total_limit'],
        },
        jobLimit: {
          sqlColumn: 'cloud_resource_settings' as any,
          path: ['job_limit'],
        },
      }),
    })
    : await ctx.em.getRepository(user.User).findPaginated({
      ...pagination,
      orderBy,
      filters: {
        dxuser: filters.dxuser,
        email: filters.email,
        userState: parseInt(filters.userState, 10),
        // NOTE(samuel) unsafe in terms of type, but somehow it works
        // *vomits
        lastLogin: filters.lastLogin as any,
      },
    })
  ctx.body = res
})

router.put(
  '/users/setTotalLimit',
  makeValidationMiddleware(makeCloudGovBulkUserUpdateMiddlewareSchema({
    totalLimit: numericBodyValidator,
  })),
  async (ctx: Api.Ctx<{}, {
    ids: number[]
    totalLimit: number
  }>) => {
    const { ids, totalLimit } = ctx.request.body
    await ctx.em.getRepository(user.User).bulkUpdateSetTotalLimit(ids, totalLimit)
    ctx.body = 'updated'
  },
)

router.put(
  '/users/setJobLimit',
  makeValidationMiddleware(makeCloudGovBulkUserUpdateMiddlewareSchema({
    jobLimit: numericBodyValidator,
  })),
  async (ctx: Api.Ctx<{}, {
    ids: number[]
    jobLimit: number
  }>) => {
    const { ids, jobLimit } = ctx.request.body
    await ctx.em.getRepository(user.User).bulkUpdateSetJobLimit(ids, jobLimit)
    ctx.body = 'updated'
  },
)

router.post(
  '/users/reset2fa',
  makeValidationMiddleware(makeCloudGovBulkUserUpdateMiddlewareSchema()),
  async (ctx: Api.Ctx<{}, {
    ids: number[]
  }>) => {
    const { ids } = ctx.request.body
    const results = await ctx.em.getRepository(user.User).bulkUpdateReset2fa(ids, new client.PlatformClient(ctx.log), ctx.user)
    ctx.body = results
  },
)

router.post(
  '/users/unlock',
  makeValidationMiddleware(makeCloudGovBulkUserUpdateMiddlewareSchema()),
  async (ctx: Api.Ctx<{}, {
    ids: number[]
  }>) => {
    const { ids } = ctx.request.body
    const results = await ctx.em.getRepository(user.User).bulkUpdateUnlock(ids, new client.PlatformClient(ctx.log), ctx.user)
    ctx.status = results.some(({ result }) => result.status === 'unhandledError')
      ? 400
      : 200
    ctx.body = results
  },
)

router.put(
  '/users/activate',
  makeValidationMiddleware(makeCloudGovBulkUserUpdateMiddlewareSchema({
    ids: (value: number[], _: string, ctx: Api.Ctx<{}, {
      ids: number[]
    }>) => {
      const currentUserId = ctx.user.id
      if (value.includes(currentUserId)) {
        throw new errors.ValidationError('Cannot activate self')
      }
    },
  })),
  async (ctx: Api.Ctx<{}, {
    ids: number[]
  }>) => {
    const { ids } = ctx.request.body
    await ctx.em.getRepository(user.User).bulkActivate(ids)
    ctx.body = 'updated'
  },
)

router.put(
  '/users/deactivate',
  makeValidationMiddleware(makeCloudGovBulkUserUpdateMiddlewareSchema({
    ids: (value: number[], _: string, ctx: Api.Ctx<{}, {
      ids: number[]
    }>) => {
      const currentUserId = ctx.user.id
      if (value.includes(currentUserId)) {
        throw new errors.ValidationError('Cannot deactivate self')
      }
    },
  })),
  async (ctx: Api.Ctx<{}, {
    ids: number[]
  }>) => {
    const { ids } = ctx.request.body
    await ctx.em.getRepository(user.User).bulkDeactivate(ids)
    ctx.body = 'updated'
  },
)

type Resource = (typeof user.RESOURCE_TYPES)[number]

router.put(
  '/users/enableResourceType',
  makeValidationMiddleware(makeCloudGovBulkUserUpdateMiddlewareSchema({
    resource: enumValidator<Resource>(user.RESOURCE_TYPES as any as Resource[]),
  })),
  async (ctx: Api.Ctx<{}, {
    ids: number[]
    resource: Resource
  }>) => {
    const { ids, resource } = ctx.request.body
    await ctx.em.getRepository(user.User).bulkEnableResourceType(ids, resource)
    ctx.body = 'updated'
  },
)

router.put(
  '/users/enableAllResourceTypes',
  makeValidationMiddleware(makeCloudGovBulkUserUpdateMiddlewareSchema({})),
  async (ctx: Api.Ctx<{}, {
    ids: number[]
  }>) => {
    const { ids } = ctx.request.body
    await ctx.em.getRepository(user.User).bulkEnableAll(ids)
    ctx.body = 'updated'
  },
)

router.put(
  '/users/disableResourceType',
  makeValidationMiddleware(makeCloudGovBulkUserUpdateMiddlewareSchema({
    resource: enumValidator<Resource>(user.RESOURCE_TYPES as any as Resource[]),
  })),
  async (ctx: Api.Ctx<{}, {
    ids: number[]
    resource: Resource
  }>) => {
    const { ids, resource } = ctx.request.body
    await ctx.em.getRepository(user.User).bulkDisableResourceType(ids, resource)
    ctx.body = 'updated'
  },
)

router.put(
  '/users/disableAllResourceTypes',
  makeValidationMiddleware(makeCloudGovBulkUserUpdateMiddlewareSchema({})),
  async (ctx: Api.Ctx<{}, {
    ids: number[]
  }>) => {
    const { ids } = ctx.request.body
    await ctx.em.getRepository(user.User).bulkDisableAll(ids)
    ctx.body = 'updated'
  },
)

export { router }

// TODO(samuel)
// S.Westreich - deactivate button - bulk behaviour
// * Refactor deactivate users modal into react