import { EntityRepository } from '@mikro-orm/mysql'
import { Tag } from '..'

export class TagRepository extends EntityRepository<Tag> {
  async findOneOrCreate(name: string): Promise<Tag> {
    const existing = await this.findOne({ name })
    if (existing) {
      return existing
    }
    // create it
    const tag = new Tag()
    tag.name = name
    tag.taggingCount = 0
    await this.persistAndFlush(tag)
    return tag
  }
}
