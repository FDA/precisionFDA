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
import { NewsPostReqBody, newsPostRequestSchema } from './news.schemas'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { NewsRepository } from '@shared/domain/news-item/news-item.repository'
import { NewsListDTO, PUBLICATION_TYPE } from '@shared/domain/news-item/dto/news-list.dto'
import { PaginatedResult } from '@shared/domain/entity/domain/paginated.result'

interface NewsPositionReqBody {
  news_items: Record<number, number>
}

//TODO PFDA-6434 - move to service approach.

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
  async listNews(@Query() query: NewsListDTO): Promise<PaginatedResult<NewsItem>> {
    let whereYear = {}
    let typeWhere = {}

    if (query.year) {
      const startOfYear = new Date(query.year, 0, 1)
      const endOfYear = new Date(query.year + 1, 0, 1)
      whereYear = {
        $and: [{ createdAt: { $gte: startOfYear } }, { createdAt: { $lt: endOfYear } }],
      }
    }
    if (query.type != undefined) {
      typeWhere = { isPublication: query.type !== PUBLICATION_TYPE.ARTICLE }
    }

    console.log('wheres', whereYear, typeWhere)

    return await this.newsRepo.paginate(query, {
      ...whereYear,
      ...typeWhere,
      published: true,
    })
  }

  @UseGuards(SiteAdminGuard)
  @Get('/all')
  async getAllNews(@Query() query: NewsListDTO): Promise<NewsItem[]> {
    let whereType = {}
    if (query.type === PUBLICATION_TYPE.ARTICLE) whereType = { isPublication: false }
    if (query.type === PUBLICATION_TYPE.PUBLICATION) whereType = { isPublication: true }

    return this.newsRepo.find(whereType, { orderBy: { createdAt: -1 } })
  }

  @Get('/years')
  async listYears(): Promise<number[]> {
    //TODO PFDA-6434 - move to service approach
    return await this.newsRepo.getDistinctYears()
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
