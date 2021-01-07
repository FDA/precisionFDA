import { wrap } from '@mikro-orm/core'
import { EntityRepository } from '@mikro-orm/mysql'
import { Tagging } from './tagging.entity'

export class TaggingRepository extends EntityRepository<Tagging> {
  createForFile(input: { fileId: number; tagId: number; userId: number }): Tagging {
    const fileTagging = new Tagging()
    wrap(fileTagging).assign(
      {
        // refs
        tag: input.tagId,
        tagger: input.userId,
        userFile: input.fileId,
        // hardcoded
        taggableType: 'Node',
        taggerType: 'User',
        context: 'tags',
      },
      { em: this.em },
    )
    // increase tag count in tags
    fileTagging.tag.taggingCount++
    return fileTagging
  }
}
