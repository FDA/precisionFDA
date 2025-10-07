import { wrap } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable, Logger } from '@nestjs/common'
import { PaginatedResult } from '@shared/domain/entity/domain/paginated.result'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { NewsItemDTO } from '../dto/news-item.dto'
import { NewsListDTO, PUBLICATION_TYPE } from '../dto/news-list.dto'
import { NewsItem } from '../news-item.entity'
import { NewsRepository } from '../news-item.repository'

@Injectable()
export class NewsService {
  @ServiceLogger()
  private readonly logger: Logger
  constructor(
    private readonly em: SqlEntityManager,
    private readonly user: UserContext,
    private readonly newsRepo: NewsRepository,
  ) {}

  async listNews(query: NewsListDTO): Promise<PaginatedResult<NewsItem>> {
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

    return await this.newsRepo.paginate(query, {
      ...whereYear,
      ...typeWhere,
      published: true,
    })
  }

  async getAllNews(query: NewsListDTO): Promise<NewsItem[]> {
    let whereType = {}
    if (query.type === PUBLICATION_TYPE.ARTICLE) whereType = { isPublication: false }
    if (query.type === PUBLICATION_TYPE.PUBLICATION) whereType = { isPublication: true }

    return this.newsRepo.find(whereType, { orderBy: { createdAt: -1 } })
  }

  async listYears(): Promise<number[]> {
    return await this.newsRepo.getDistinctYears()
  }

  async getNews(id: number): Promise<NewsItem> {
    return await this.newsRepo.findOne({ id })
  }

  async deleteNews(id: number): Promise<void> {
    const newsItem = this.em.getReference(NewsItem, id)
    this.logger.log(`Deleting news item with id: ${id}`)
    await this.em.remove(newsItem).flush()
  }

  async createNews(body: NewsItemDTO): Promise<Partial<NewsItem>> {
    const user = await this.user.loadEntity()
    const newNewsItem = new NewsItem(user)
    newNewsItem.title = body.title
    newNewsItem.createdAt = body.createdAt
    newNewsItem.video = body.video
    newNewsItem.content = body.content
    newNewsItem.link = body.link
    newNewsItem.isPublication = body.isPublication
    newNewsItem.published = body.published
    await this.em.persistAndFlush(newNewsItem)

    return { id: newNewsItem.id }
  }

  async updateNews(id: number, body: NewsItemDTO): Promise<void> {
    const existing = await this.newsRepo.findOneOrFail({ id })
    const toSave = wrap(existing).assign(body, { mergeObjectProperties: true })
    await this.em.persistAndFlush(toSave)
  }
}
