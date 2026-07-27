import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable, Logger } from '@nestjs/common'
import { TagRepository } from '@shared/domain/tag/tag.repository'
import { Tagging } from '@shared/domain/tagging/tagging.entity'
import { TaggingRepository } from '@shared/domain/tagging/tagging.repository'
import { TAGGABLE_TYPE } from '@shared/domain/tagging/tagging.types'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'

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
    let activeTag = await this.tagRepo.findOne({ name })
    if (!activeTag) {
      activeTag = this.tagRepo.create({ name })
      await this.em.persist(activeTag).flush()
    }

    const existingTagging = await this.taggingRepo.findOne(
      { tag: activeTag, taggableType, taggableId },
      { filters: false },
    )
    if (existingTagging) return

    const tagging = new Tagging()
    tagging.tagId = activeTag.id
    tagging.taggableType = taggableType
    tagging.taggableId = taggableId
    tagging.taggerType = taggerType
    tagging.taggerId = taggerId
    tagging.context = 'tags'

    await this.em.persist(tagging).flush()
  }

  /**
   * Operation removes taggings corresponding to entity represented by id.
   * If a tag is not used by any other entity, the Tag itself is removed as well.
   */
  async removeTaggings(id: number, type: TAGGABLE_TYPE): Promise<void> {
    this.logger.log(`Removing taggings for entity with id: ${id} and type ${type}`)
    return this.em.transactional(async () => {
      const taggings = await this.taggingRepo.findForTaggable(id, type)
      for (const tagging of taggings) {
        await this.em.remove(tagging).flush()

        // filters: false avoids a needless join to `spaces` (Space's default filter on the SpaceTagging STI sibling)
        const count = await this.taggingRepo.count({ tagId: tagging.tagId }, { filters: false })
        if (count === 0) {
          this.em.remove(tagging.tag)
        }
      }
    })
  }

  async getTaggingsForEntity(id: number, type: TAGGABLE_TYPE): Promise<Tagging[]> {
    return this.taggingRepo.findForTaggable(id, type)
  }
}
