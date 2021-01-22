import { wrap } from '@mikro-orm/core'
import { EntityRepository } from '@mikro-orm/mysql'
import { UserFile } from '..'
import { Tagging } from './tagging.entity'

type FindInput = {
  fileId: number
  tagId: number
  userId: number
}

type FindMultipleInput = {
  fileIds: number[]
  tagId: number
  userId: number
}

export class TaggingRepository extends EntityRepository<Tagging> {
  async findForFile(input: FindInput): Promise<Tagging | null> {
    return await this.findOne({
      userFile: this.em.getReference(UserFile, input.fileId),
      tagId: input.tagId,
      taggerId: input.userId,
    })
  }

  async findForFiles(input: FindMultipleInput): Promise<Tagging[]> {
    return await this.find({
      userFile: { $in: input.fileIds.map(fileId => this.em.getReference(UserFile, fileId)) },
      tagId: input.tagId,
      taggerId: input.userId,
    })
  }

  upsertForFile(input: FindInput): Tagging {
    const fileTagging = new Tagging()
    wrap(fileTagging).assign(
      {
        // refs
        tag: input.tagId,
        tagger: input.userId,
        userFile: this.em.getReference(UserFile, input.fileId),
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
