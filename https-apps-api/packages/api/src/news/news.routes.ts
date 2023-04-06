import { wrap } from '@mikro-orm/core';
import { entities, getLogger } from '@pfda/https-apps-shared';
import { DefaultState } from 'koa';
import Router from 'koa-router';
import { validateSiteAdminMdw } from '../server/middleware/user-context';
import { validateBodyMiddleware, validateParamsMiddleware } from '../server/middleware/validateBody';
import { newsListParamsSchema, NewsListReqBody, NewsPostReqBody, newsPostRequestSchema } from './news.schemas';

const logger = getLogger('news.routes')
const router = new Router<DefaultState, Api.Ctx>()

// NOTE infered from "paginated_per" setting in app/models/experts.rb
const DEFAULT_PAGE_SIZE = 10

router.get(
  '/',
  validateParamsMiddleware(newsListParamsSchema),
  async ctx => {
    const params = ctx.validatedParams as NewsListReqBody
    const page = params?.page ? parseInt(params?.page, 10) : 1
    const limit = params.limit ? parseInt(params.limit, 10) : DEFAULT_PAGE_SIZE
    const year = params?.year ? parseInt(params?.year, 10) : undefined
    const type = params?.type
    const orderBy = params?.orderBy ? { [params.orderBy]: 'DESC' } : {}

    const news = await ctx.em.getRepository(entities.NewsItem).findPaginated({
      page,
      limit,
      year,
      type,
    }, {
      ...orderBy,
      createdAt: -1,
    })
    ctx.body = news
  },
)

router.get(
  '/all',
  validateSiteAdminMdw,
  validateParamsMiddleware(newsListParamsSchema),
  async ctx => {
    const { type } = ctx.validatedParams as NewsListReqBody

    let whereType = {}
    if (type === 'article') whereType = { isPublication: false }
    if (type === 'publication') whereType = { isPublication: true }

    const news = await ctx.em.getRepository(entities.NewsItem).createQueryBuilder().where(whereType).orderBy({
      createdAt: -1,
    })
    ctx.body = news
  },
)

router.get(
  '/years',
  async ctx => {
    const allYears: { year: number }[] = await ctx.em.getRepository(entities.NewsItem)
      .createQueryBuilder()
      .select('YEAR(created_at) as year', true)
      .orderBy({ year: 'desc' })
      .execute()

    ctx.body = allYears.map(y => y.year)
  },
)

router.get(
  '/:id',
  async ctx => {
    const { id } = ctx.params
    const newsItem = await ctx.em.getRepository(entities.NewsItem).findOne({ id: parseInt(id) })
    ctx.body = newsItem
  },
)

router.delete(
  '/:id',
  validateSiteAdminMdw,
  async ctx => {
    const { id } = ctx.params
    const newsItem = ctx.em.getReference(entities.NewsItem, parseInt(id))
    await ctx.em.remove(newsItem).flush();
    ctx.status = 204
  },
)

router.post(
  '/',
  validateSiteAdminMdw,
  validateBodyMiddleware(newsPostRequestSchema),
  async ctx => {
    const body = ctx.request.body as NewsPostReqBody
    const userRepo = ctx.em.getRepository(entities.User)
    const user = await userRepo.findOne({ id: ctx.user?.id })
    const newNewsItem = wrap(new entities.NewsItem(user!)).assign(body)
    await ctx.em.persistAndFlush(newNewsItem)
    ctx.status = 201
    ctx.body = newNewsItem
  },
)

router.put(
  '/:id',
  validateSiteAdminMdw,
  validateBodyMiddleware(newsPostRequestSchema),
  async ctx => {
    const { id } = ctx.params
    const body = ctx.request.body as NewsPostReqBody
    const existing = await ctx.em.findOneOrFail(entities.NewsItem, parseInt(id))
    const to_save = wrap(existing).assign(body, { mergeObjects: true })
    await ctx.em.persistAndFlush(to_save)
    ctx.status = 204
  },
)

interface NewsPositionReqBody {
  news_items: Record<number, number>
}

router.post(
  '/positions',
  validateSiteAdminMdw,
  async ctx => {
    const { news_items } = ctx.request.body as NewsPositionReqBody
    const em = ctx.em.fork();

    const idsToUpdate: number[] = Object.keys(news_items).map(i => parseInt(i, 10))
    const recordsToUpdate = await em.find(entities.NewsItem, { id: { $in: idsToUpdate } });

    await em.begin();
    try {
      for (const record of recordsToUpdate) {
        record.position = news_items[record.id]
        em.persist(record);
      }

      await em.flush()
      await em.commit()
      ctx.status = 201
    } catch (e) {
      await em.rollback();
      ctx.status = 422
    }
  },
)

export { router };

