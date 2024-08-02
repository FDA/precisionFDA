import { Injectable, Logger } from '@nestjs/common'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { TaggingRepository } from '@shared/domain/tagging/tagging.repository'

@Injectable()
export class TaggingService {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly taggingRepo: TaggingRepository,
  ) {}

  /**
   * Operation removes tags corresponding to entity represented by id.
   * If the tag is used by some other entity as well (taggingCount > 1) it only
   * decreases the count and removes Tagging. If taggingCount is 1 it removes
   * Tag as well.
   */
  async removeTaggings(id: number): Promise<void> {
    this.logger.log(`Removing taggings for entity with id: ${id}`)
    return this.em.transactional(async () => {
      const taggings = await this.taggingRepo.findForTaggableId(id)
      taggings.forEach((tagging) => {
        if (tagging.tag.taggingCount > 1) {
          tagging.tag.taggingCount -= 1
        } else {
          this.em.remove(tagging.tag)
        }
        this.em.remove(tagging)
      })
    })
  }
}
