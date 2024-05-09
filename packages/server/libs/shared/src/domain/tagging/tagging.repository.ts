import { wrap } from '@mikro-orm/core'
import { EntityRepository } from '@mikro-orm/mysql'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { FILE_STI_TYPE } from '../user-file/user-file.types'
import { Tagging } from './tagging.entity'

type FindInput = {
  fileId: number
  tagId: number
  userId: number
}

type UpsertInput = FindInput & {
  nodeType: FILE_STI_TYPE
}

type FindMultipleInput = {
  fileIds: number[]
  tagId: number
  userId: number
}

export class TaggingRepository extends EntityRepository<Tagging> {
  async findForTaggableId(taggableId: number): Promise<Tagging[]> {
    return await this.find({ taggableId }, { populate: ['tag'] })
  }

  async findForFiles(input: FindMultipleInput): Promise<Tagging[]> {
    return await this.find(
      {
        userFile: { $in: input.fileIds.map(fileId => this.em.getReference(UserFile, fileId)) },
        tagId: input.tagId,
        taggerId: input.userId,
      },
      { populate: ['tag'] },
    )
  }

  upsertForFile(input: UpsertInput): Tagging {
    const fileTagging = new Tagging()
    const taggableRef =
      input.nodeType === FILE_STI_TYPE.FOLDER
        ? { folder: this.em.getReference(Folder, input.fileId) }
        : { userFile: this.em.getReference(UserFile, input.fileId) }
    wrap(fileTagging).assign(
      {
        // refs
        tag: input.tagId,
        tagger: input.userId,
        ...taggableRef,
        // hardcoded
        taggableType: 'Node',
        taggerType: 'User',
        context: 'tags',
      },
      { em: this.em },
    )
    this.em.persist(fileTagging)
    // increase tag count in tags
    // todo: this does not work, it is separately elsewhere for now
    // fileTagging.tag.taggingCount++
    return fileTagging
  }
}
