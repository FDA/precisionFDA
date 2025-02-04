import { EntityRepository } from '@mikro-orm/mysql'
import { Tagging } from './tagging.entity'
import { TAGGABLE_TYPE } from '@shared/domain/tagging/tagging.types'

export class TaggingRepository extends EntityRepository<Tagging> {
  async findForTaggable(taggableId: number, taggableType: TAGGABLE_TYPE): Promise<Tagging[]> {
    return await this.find({ taggableId, taggableType }, { populate: ['tag'] })
  }
}
