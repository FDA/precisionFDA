import { App } from '@shared/domain/app/app.entity'
import { Comparison } from '@shared/domain/comparison/comparison.entity'
import { Uid } from '@shared/domain/entity/domain/uid'
import { Job } from '@shared/domain/job/job.entity'
import { Node } from '@shared/domain/user-file/node.entity'
import { DiscussionAttachmentType } from '../attachment.types'

export class DiscussionAttachmentDTO {
  id: number
  uid?: Uid<'app' | 'file' | 'job'> | null
  type: 'App' | 'UserFile' | 'Folder' | 'Asset' | 'Job' | 'Comparison'
  name: string
  link: string

  static fromEntity(attachmentEntity: DiscussionAttachmentType, link: string): DiscussionAttachmentDTO {
    if (attachmentEntity instanceof Node) {
      return this.fromNode(attachmentEntity, link)
    } else if (attachmentEntity instanceof Job) {
      return this.fromJob(attachmentEntity, link)
    } else if (attachmentEntity instanceof Comparison) {
      return this.fromComparison(attachmentEntity, link)
    } else if (attachmentEntity instanceof App) {
      return this.fromApp(attachmentEntity, link)
    } else {
      throw new Error('Unsupported attachment entity type')
    }
  }

  private static fromNode(attachmentEntity: Node, link: string): DiscussionAttachmentDTO {
    const dto = new DiscussionAttachmentDTO()
    dto.id = attachmentEntity.id
    dto.uid = attachmentEntity.uid
    dto.type = attachmentEntity.stiType
    dto.name = attachmentEntity.name
    dto.link = link
    return dto
  }

  private static fromJob(attachmentEntity: Job, link: string): DiscussionAttachmentDTO {
    const dto = new DiscussionAttachmentDTO()
    dto.id = attachmentEntity.id
    dto.uid = attachmentEntity.uid
    dto.type = 'Job'
    dto.name = attachmentEntity.name
    dto.link = link
    return dto
  }

  private static fromComparison(attachmentEntity: Comparison, link: string): DiscussionAttachmentDTO {
    const dto = new DiscussionAttachmentDTO()
    dto.id = attachmentEntity.id
    dto.type = 'Comparison'
    dto.name = attachmentEntity.name
    dto.link = link
    return dto
  }

  private static fromApp(attachmentEntity: App, link: string): DiscussionAttachmentDTO {
    const dto = new DiscussionAttachmentDTO()
    dto.id = attachmentEntity.id
    dto.uid = attachmentEntity.uid
    dto.type = 'App'
    dto.name = attachmentEntity.title
    dto.link = link
    return dto
  }
}
