import { BaseEntityRepository } from '@shared/database/repository/base-entity.repository'
import { TAGGABLE_TYPE } from '@shared/domain/tagging/tagging.types'
import { Tagging } from './tagging.entity'

export class TaggingRepository extends BaseEntityRepository<Tagging> {
  async findForTaggable(taggableId: number, taggableType: TAGGABLE_TYPE): Promise<Tagging[]> {
    // filters: false prevents a needless join to `spaces` (SpaceTagging is an STI sibling and Space
    // carries a default `excludeDeleted` filter, which forces the join even when querying other types)
    return await this.find({ taggableId, taggableType }, { populate: ['tag'], filters: false })
  }
}
