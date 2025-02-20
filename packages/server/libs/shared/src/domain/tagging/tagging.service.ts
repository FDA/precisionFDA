import { Injectable, Logger } from '@nestjs/common'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { TaggingRepository } from '@shared/domain/tagging/tagging.repository'
import { TAGGABLE_TYPE } from '@shared/domain/tagging/tagging.types'
import { TagRepository } from '@shared/domain/tag/tag.repository'
import { Tag } from '@shared/domain/tag/tag.entity'
import { Tagging } from '@shared/domain/tagging/tagging.entity'

@Injectable()
export class TaggingService {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly em: SqlEntityManager,
    private readonly taggingRepo: TaggingRepository,
    private readonly tagRepo: TagRepository,
  ) {}

  async addTaggingForEntity(
    name: string,
    taggerType: string,
    taggerId: number,
    taggableId: number,
    taggableType: TAGGABLE_TYPE,
  ): Promise<void> {
    this.logger.log(
      `Adding tag ${name} for entity with id: ${taggableId}, type ${taggableType}, taggerId: ${taggerId}, taggerType: ${taggerType}`,
    )
    let tag = await this.tagRepo.findOne({ name })

    return this.em.transactional(async (em) => {
      if (!tag) {
        tag = new Tag()
        tag.name = name
        await em.persistAndFlush(tag)
      }

      const existingTagging = await this.taggingRepo.findOne({ tag, taggableType, taggableId })
      if (existingTagging) return

      const tagging = new Tagging()
      tagging.tagId = tag.id
      tagging.taggableType = taggableType
      tagging.taggableId = taggableId
      tagging.taggerType = taggerType
      tagging.taggerId = taggerId
      tagging.context = 'tags'

      em.persist(tagging)
    })
  }

  /**
   * Operation removes tags corresponding to entity represented by id.
   * If the tag is used by some other entity as well (taggingCount > 1) it only
   * decreases the count and removes Tagging. If taggingCount is 1 it removes
   * Tag as well.
   */
  async removeTaggings(id: number, type: TAGGABLE_TYPE): Promise<void> {
    this.logger.log(`Removing taggings for entity with id: ${id} and type ${type}`)
    return this.em.transactional(async () => {
      const taggings = await this.taggingRepo.findForTaggable(id, type)
      for (const tagging of taggings) {
        const count = await this.taggingRepo.count({ tagId: tagging.tagId })
        if (count === 1) {
          // last tagging
          this.em.remove(tagging.tag)
        }

        this.em.remove(tagging)
      }
    })
  }
}
