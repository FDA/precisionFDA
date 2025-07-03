import { wrap } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common'
import { DEPRECATED_SQL_ENTITY_MANAGER } from '@shared/database/provider/deprecated-sql-entity-manager.provider'
import { NewsItem } from '@shared/domain/news-item/news-item.entity'
import { User } from '@shared/domain/user/user.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { InvalidStateError } from '@shared/errors'
import { SiteAdminGuard } from '../admin/guards/site-admin.guard'
import { ZodPipe } from '../validation/pipes/zod.pipe'
import {
  newsListParamsSchema,
  NewsListReqBody,
  NewsPostReqBody,
  newsPostRequestSchema,
} from './news.schemas'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { NewsRepository } from '@shared/domain/news-item/news-item.repository'

interface NewsPositionReqBody {
  news_items: Record<number, number>
}

// NOTE inferred from "paginated_per" setting in app/models/experts.rb
const DEFAULT_PAGE_SIZE = 10

@Controller('/news')
export class NewsController {
  @ServiceLogger()
  private readonly logger: Logger
  constructor(
    private readonly user: UserContext,
    @Inject(DEPRECATED_SQL_ENTITY_MANAGER) private readonly em: SqlEntityManager,
    private readonly newsRepo: NewsRepository,
  ) {}

  @Get()
  async listNews(@Query(new ZodPipe(newsListParamsSchema)) query: NewsListReqBody): Promise<{
    news_items: NewsItem[]
    meta: {}
  }> {
    const page = query?.page ? parseInt(query?.page, 10) : 1
    const limit = query.limit ? parseInt(query.limit, 10) : DEFAULT_PAGE_SIZE
    const year = query?.year ? parseInt(query?.year, 10) : undefined
    const type = query?.type
    const orderBy = query?.orderBy ? { [query.orderBy]: 'DESC' } : {}

    return await this.newsRepo.findPaginated(
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
  async getAllNews(
    @Query(new ZodPipe(newsListParamsSchema)) query: NewsListReqBody,
  ): Promise<NewsItem[]> {
    const { type } = query

    let whereType = {}
    if (type === 'article') whereType = { isPublication: false }
    if (type === 'publication') whereType = { isPublication: true }

    return this.em.getRepository(NewsItem).createQueryBuilder().where(whereType).orderBy({
      createdAt: -1,
    })
  }

  @Get('/years')
  async listYears(): Promise<number[]> {
    //TODO: refactor logic into service
    const allYears: { year: number }[] = await this.em.execute(
      'SELECT DISTINCT YEAR(created_at) as year FROM news_items ORDER BY year DESC',
    )
    return allYears.map((y) => y.year)
  }

  @Get('/:id')
  async getNews(@Param('id', ParseIntPipe) id: number): Promise<NewsItem> {
    return await this.em.getRepository(NewsItem).findOne({ id })
  }

  @UseGuards(SiteAdminGuard)
  @HttpCode(204)
  @Delete('/:id')
  async deleteNews(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const newsItem = this.em.getReference(NewsItem, id)
    this.logger.log(`Deleting news item with id: ${id}, title: ${newsItem.title}`)
    await this.em.remove(newsItem).flush()
  }

  @UseGuards(SiteAdminGuard)
  @HttpCode(201)
  @Post()
  async createNews(
    @Body(new ZodPipe(newsPostRequestSchema)) body: NewsPostReqBody,
  ): Promise<NewsItem> {
    const userRepo = this.em.getRepository(User)
    const user = await userRepo.findOne({ id: this.user?.id })
    const newNewsItem = wrap(new NewsItem(user!)).assign(body)
    await this.em.persistAndFlush(newNewsItem)

    return newNewsItem
  }

  @UseGuards(SiteAdminGuard)
  @HttpCode(204)
  @Put('/:id')
  async updateNews(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodPipe(newsPostRequestSchema)) body: NewsPostReqBody,
  ): Promise<void> {
    const existing = await this.em.findOneOrFail(NewsItem, id)
    const to_save = wrap(existing).assign(body, { mergeObjectProperties: true })
    await this.em.persistAndFlush(to_save)
  }

  @UseGuards(SiteAdminGuard)
  @HttpCode(201)
  @Post('/positions')
  async createPositions(@Body() body: NewsPositionReqBody): Promise<void> {
    const { news_items } = body
    const em = this.em.fork()

    const idsToUpdate: number[] = Object.keys(news_items).map((i) => parseInt(i, 10))
    const recordsToUpdate = await em.find(NewsItem, { id: { $in: idsToUpdate } })

    await em.begin()
    try {
      for (const record of recordsToUpdate) {
        record.position = news_items[record.id]
        em.persist(record)
      }

      await em.flush()
      await em.commit()
    } catch {
      await em.rollback()
      throw new InvalidStateError()
    }
  }
}
