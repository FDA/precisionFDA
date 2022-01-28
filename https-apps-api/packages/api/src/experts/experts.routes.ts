import { DefaultState } from 'koa'
import Router from 'koa-router'
import { entities, adminGroup } from '@pfda/https-apps-shared'
import { makeValidationMdw } from '../server/middleware'
import { expertListQuerySchema } from './experts.schemas'

const router = new Router<DefaultState, Api.Ctx>()

// NOTE infered from "paginated_per" setting in app/models/experts.rb
const DEFAULT_PAGE_SIZE = 10

router.get(
  '/',
  makeValidationMdw({
    query: expertListQuerySchema
  }),
  async ctx => {
    const page = ctx.validatedQuery.page ?? 1;
    const limit = ctx.validatedQuery.limit ?? DEFAULT_PAGE_SIZE;
    const year = ctx.validatedQuery.year ?? null;

    const canUserAdministerSite = Boolean(ctx.user) && await ctx.em.findOne(entities.AdminGroup, {
      role: adminGroup.ADMIN_GROUP_ROLES.ROLE_SITE_ADMIN,
      adminMemberships: {
        user: {
          id: ctx.user.id
        }
      }
    })
    
    const experts = await ctx.em.getRepository(entities.Expert).findPaginated({
      page,
      limit,
      year
    }, ctx.user, !!canUserAdministerSite);
    ctx.body = experts;
  },
)

router.get(
  '/years',
  async ctx => {
    const res = await ctx.em.getRepository(entities.Expert).findYears()
    ctx.body = res;
  },
)

export { router }

