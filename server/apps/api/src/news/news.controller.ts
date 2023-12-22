import { wrap } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common'
import { DEPRECATED_SQL_ENTITY_MANAGER_TOKEN, entities, errors, UserContext } from '@shared'
import { SiteAdminGuard } from '../admin/guards/site-admin.guard'
import { ZodPipe } from '../validation/pipes/zod.pipe'
import {
  newsListParamsSchema,
  NewsListReqBody,
  NewsPostReqBody,
  newsPostRequestSchema,
} from './news.schemas'

interface NewsPositionReqBody {
  news_items: Record<number, number>
}

// NOTE infered from "paginated_per" setting in app/models/experts.rb
const DEFAULT_PAGE_SIZE = 10

@Controller('/news')
export class NewsController {
  constructor(
    private readonly user: UserContext,
    @Inject(DEPRECATED_SQL_ENTITY_MANAGER_TOKEN) private readonly em: SqlEntityManager,
  ) {}

  @Get()
  async listNews(@Query(new ZodPipe(newsListParamsSchema)) query: NewsListReqBody) {
    const page = query?.page ? parseInt(query?.page, 10) : 1
    const limit = query.limit ? parseInt(query.limit, 10) : DEFAULT_PAGE_SIZE
    const year = query?.year ? parseInt(query?.year, 10) : undefined
    const type = query?.type
    const orderBy = query?.orderBy ? { [query.orderBy]: 'DESC' } : {}

    return await this.em.getRepository(entities.NewsItem).findPaginated(
      {
        page,
        limit,
        year,
        type,
      },
      {
        ...orderBy,
        createdAt: -1,
      },
    )
  }

  @UseGuards(SiteAdminGuard)
  @Get('/all')
  async getAllNews(@Query(new ZodPipe(newsListParamsSchema)) query: NewsListReqBody) {
    const { type } = query

    let whereType = {}
    if (type === 'article') whereType = { isPublication: false }
    if (type === 'publication') whereType = { isPublication: true }

    return this.em.getRepository(entities.NewsItem).createQueryBuilder().where(whereType).orderBy({
      createdAt: -1,
    })
  }

  @Get('/years')
  async listYears() {
    const allYears: { year: number }[] = await this.em
      .getRepository(entities.NewsItem)
      .createQueryBuilder()
      .select('YEAR(created_at) as year', true)
      .orderBy({ year: 'desc' })
      .execute()

    return allYears.map((y) => y.year)
  }

  @Get('/:id')
  async getNews(@Param('id', ParseIntPipe) id: number) {
    return await this.em.getRepository(entities.NewsItem).findOne({ id })
  }

  @UseGuards(SiteAdminGuard)
  @HttpCode(204)
  @Delete('/:id')
  async deleteNews(@Param('id', ParseIntPipe) id: number) {
    const newsItem = this.em.getReference(entities.NewsItem, id)
    await this.em.remove(newsItem).flush()
  }

  @UseGuards(SiteAdminGuard)
  @HttpCode(201)
  @Post()
  async createNews(@Body(new ZodPipe(newsPostRequestSchema)) body: NewsPostReqBody) {
    const userRepo = this.em.getRepository(entities.User)
    const user = await userRepo.findOne({ id: this.user?.id })
    const newNewsItem = wrap(new entities.NewsItem(user!)).assign(body)
    await this.em.persistAndFlush(newNewsItem)

    return newNewsItem
  }

  @UseGuards(SiteAdminGuard)
  @HttpCode(204)
  @Put('/:id')
  async updateNews(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodPipe(newsPostRequestSchema)) body: NewsPostReqBody,
  ) {
    const existing = await this.em.findOneOrFail(entities.NewsItem, id)
    const to_save = wrap(existing).assign(body, { mergeObjects: true })
    await this.em.persistAndFlush(to_save)
  }

  @UseGuards(SiteAdminGuard)
  @HttpCode(201)
  @Post('/positions')
  async createPositions(@Body() body: NewsPositionReqBody) {
    const { news_items } = body
    const em = this.em.fork()

    const idsToUpdate: number[] = Object.keys(news_items).map((i) => parseInt(i, 10))
    const recordsToUpdate = await em.find(entities.NewsItem, { id: { $in: idsToUpdate } })

    await em.begin()
    try {
      for (const record of recordsToUpdate) {
        record.position = news_items[record.id]
        em.persist(record)
      }

      await em.flush()
      await em.commit()
    } catch (e) {
      await em.rollback()
      throw new errors.InvalidStateError()
    }
  }
}
