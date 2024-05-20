import { EntityRepository } from '@mikro-orm/mysql'
import { Tag } from '@shared/domain/tag/tag.entity'

export class TagRepository extends EntityRepository<Tag> {
}
