import { Injectable, Logger } from '@nestjs/common'
import { AttachmentsDTO } from '@shared/domain/discussion/dto/attachments.dto'
import { NodeRepository } from '@shared/domain/user-file/node.repository'
import { AppRepository } from '@shared/domain/app/app.repository'
import { JobRepository } from '@shared/domain/job/job.repository'
import { ComparisonRepository } from '@shared/domain/comparison/comparison.repository'
import * as errors from '@shared/errors'
import { Attachment } from '@shared/domain/attachment/attachment.entity'
import { AttachmentRepository } from '@shared/domain/attachment/attachment.repository'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { NoteRepository } from '@shared/domain/note/note.repository'
import type { DiscussionAttachment } from '@shared/domain/discussion/discussion.types'
import { Node } from '@shared/domain/user-file/node.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { Job } from '@shared/domain/job/job.entity'
import { Comparison } from '@shared/domain/comparison/comparison.entity'
import { App } from '@shared/domain/app/app.entity'
import { EntityService } from '@shared/domain/entity/entity.service'
import { CliAttachmentsDTO } from '@shared/domain/cli/dto/cli-attachments.dto'
import { FILE_STI_TYPE } from '@shared/domain/user-file/user-file.types'
import { NotFoundError } from '@shared/errors'
import { STATIC_SCOPE } from '@shared/enums'

@Injectable()
export class AttachmentManagementFacade {
  @ServiceLogger()
  private readonly logger: Logger

  constructor(
    private readonly noteRepository: NoteRepository,
    private readonly nodeRepository: NodeRepository,
    private readonly appRepository: AppRepository,
    private readonly jobRepository: JobRepository,
    private readonly comparisonRepository: ComparisonRepository,
    private readonly attachmentRepository: AttachmentRepository,
    private readonly entityService: EntityService,
  ) {}

  async createAttachments(noteId: number, attachmentsToSave: AttachmentsDTO) {
    const note = await this.noteRepository.findEditableOne({ id: noteId })

    for (const id of attachmentsToSave.files) {
      const res = await this.nodeRepository.findAccessibleOne({ id })

      if (!res || (!res.isPublic() && res.scope !== note.scope)) {
        throw new errors.NotFoundError(
          `Unable to attach ${res?.uid ?? 'file ' + id}: file not found or is in a wrong scope.`,
        )
      }
      const exists = await this.attachmentRepository.findOne({
        itemId: id,
        itemType: 'Node',
        note: note.id,
      })
      if (exists) {
        throw new errors.InvalidStateError(
          `Unable to attach file ${res.uid}: file attachment already exists.`,
        )
      }
      this.attachmentRepository.persist(new Attachment(id, 'Node', note))
    }
    for (const id of attachmentsToSave.folders) {
      const res = await this.nodeRepository.findAccessibleOne({
        id,
        scope: [STATIC_SCOPE.PUBLIC, note.scope],
      })
      if (!res || (!res.isPublic() && res.scope !== note.scope)) {
        throw new errors.NotFoundError(
          `Unable to attach folder ${id}: folder not found or is in a wrong scope.`,
        )
      }
      const exists = await this.attachmentRepository.findOne({
        itemId: id,
        itemType: 'Node',
        note: note.id,
      })
      if (exists) {
        throw new errors.InvalidStateError(
          `Unable to attach folder ${id}: folder attachment already exists.`,
        )
      }
      this.attachmentRepository.persist(new Attachment(id, 'Node', note))
    }
    for (const id of attachmentsToSave.assets) {
      const res = await this.nodeRepository.findAccessibleOne({ id })
      if (!res || (!res.isPublic() && res.scope !== note.scope)) {
        throw new errors.NotFoundError(
          `Unable to attach ${res?.uid ?? 'asset ' + id}: asset not found or is in a wrong scope.`,
        )
      }
      const exists = await this.attachmentRepository.findOne({
        itemId: id,
        itemType: 'Asset',
        note: note.id,
      })
      if (exists) {
        throw new errors.InvalidStateError(
          `Unable to attach ${res.uid}: asset attachment already exists.`,
        )
      }
      this.attachmentRepository.persist(new Attachment(id, 'Node', note))
    }
    for (const id of attachmentsToSave.apps) {
      const res = await this.appRepository.findAccessibleOne({ id })
      if (!res || (!res.isPublic() && res.scope !== note.scope)) {
        throw new errors.NotFoundError(
          `Unable to attach app ${res.uid ?? 'app ' + id}: app not found or is in a wrong scope.`,
        )
      }
      const exists = await this.attachmentRepository.findOne({
        itemId: id,
        itemType: 'App',
        note: note.id,
      })
      if (exists) {
        throw new errors.InvalidStateError(
          `Unable to attach ${res.uid}: app attachment already exists.`,
        )
      }
      this.attachmentRepository.persist(new Attachment(id, 'App', note))
    }
    for (const id of attachmentsToSave.jobs) {
      const res = await this.jobRepository.findAccessibleOne({ id })
      if (!res || (!res.isPublic() && res.scope !== note.scope)) {
        throw new errors.NotFoundError(
          `Unable to attach ${res?.uid ?? 'job ' + id}: job not found or is in a wrong scope.`,
        )
      }
      const exists = await this.attachmentRepository.findOne({
        itemId: id,
        itemType: 'Job',
        note: note.id,
      })
      if (exists) {
        throw new errors.InvalidStateError(
          `Unable to attach ${res.uid}: job attachment already exists.`,
        )
      }
      this.attachmentRepository.persist(new Attachment(id, 'Job', note))
    }
    for (const id of attachmentsToSave.comparisons) {
      const res = await this.comparisonRepository.findAccessibleOne({ id })
      if (!res || (!res.isPublic() && res.scope !== note.scope)) {
        throw new errors.NotFoundError(
          `Unable to attach comparison ${id}: comparison not found or is in a wrong scope.`,
        )
      }
      const exists = await this.attachmentRepository.findOne({
        itemId: id,
        itemType: 'Comparison',
        note: note.id,
      })
      if (exists) {
        throw new errors.InvalidStateError(
          `Unable to attach comparison ${id}: comparison attachment already exists.`,
        )
      }
      this.attachmentRepository.persist(new Attachment(id, 'Comparison', note))
    }
    await this.attachmentRepository.flush()
  }

  async updateAttachments(noteId: number, attachments: AttachmentsDTO) {
    const oldAttachments = await this.attachmentRepository.find({ note: noteId })
    this.logger.log(`Deleting old attachments: ${oldAttachments.map((a) => a.id)}`)
    await this.attachmentRepository.removeAndFlush(oldAttachments)
    this.logger.log(`Creating new attachments: ${JSON.stringify(attachments)}`)
    await this.createAttachments(noteId, attachments)
  }

  async transformCliAttachments(body: CliAttachmentsDTO): Promise<AttachmentsDTO> {
    // transform attachments to the format expected by the discussion service
    const attachments = {
      files: [],
      folders: [],
      assets: [],
      apps: [],
      jobs: [],
      comparisons: [],
    }
    // iterate over uids and get ids instead - access rights are checked in discussion service.
    for (const uid of body.files) {
      const file = await this.nodeRepository.findOne({ uid, stiType: FILE_STI_TYPE.USERFILE })
      if (!file) {
        throw new NotFoundError(`File ${uid} not found or not accessible`)
      }
      attachments.files.push(file.id)
    }
    for (const id of body.folders) {
      attachments.folders.push(id)
    }
    for (const uid of body.assets) {
      const asset = await this.nodeRepository.findOne({ uid, stiType: FILE_STI_TYPE.ASSET })
      if (!asset) {
        throw new NotFoundError(`Asset ${uid} not found or not accessible`)
      }
      attachments.assets.push(asset.id)
    }
    for (const uid of body.apps) {
      const app = await this.appRepository.findOne({ uid })
      if (!app) {
        throw new NotFoundError(`App ${uid} not found or not accessible`)
      }
      attachments.apps.push(app.id)
    }
    for (const uid of body.jobs) {
      const job = await this.jobRepository.findOne({ uid })
      if (!job) {
        throw new NotFoundError(`Job ${uid} not found or not accessible`)
      }
      attachments.jobs.push(job.id)
    }
    for (const id of body.comparisons) {
      attachments.comparisons.push(id)
    }
    return attachments
  }

  async getAttachments(noteId: number): Promise<DiscussionAttachment[]> {
    this.logger.log(`Getting attachments for note id: ${noteId}`)
    const note = await this.noteRepository.findAccessibleOne(
      { id: noteId },
      { populate: ['attachments'] },
    )
    if (!note) {
      throw new errors.NotFoundError(
        'Unable to get attachments: note not found or insufficient permissions.',
      )
    }

    const response: DiscussionAttachment[] = []
    for (const attachment of note.attachments) {
      if (attachment.itemType === 'Node') {
        const attachmentEntity: Node | null = await this.nodeRepository.findOne({
          id: attachment.itemId,
        })
        if (!attachmentEntity) {
          throw new errors.NotFoundError('Unable to get attachments: attachment not found.')
        }
        response.push({
          id: attachment.itemId,
          uid: attachmentEntity.uid,
          type: attachmentEntity.stiType,
          name: attachmentEntity.name,
          link: await this.entityService.getEntityUiLink(attachmentEntity as UserFile | Asset),
        })
      } else if (attachment.itemType === 'Job') {
        const attachmentEntity: Job | null = await this.jobRepository.findOne({
          id: attachment.itemId,
        })
        if (!attachmentEntity) {
          throw new errors.NotFoundError('Unable to get attachments: attachment not found.')
        }
        response.push({
          id: attachment.itemId,
          uid: attachmentEntity.uid,
          type: attachment.itemType,
          name: attachmentEntity.name,
          link: await this.entityService.getEntityUiLink(attachmentEntity),
        })
      } else if (attachment.itemType === 'Comparison') {
        const attachmentEntity: Comparison | null = await this.comparisonRepository.findOne({
          id: attachment.itemId,
        })
        if (!attachmentEntity) {
          throw new errors.NotFoundError('Unable to get attachments: attachment not found.')
        }
        response.push({
          id: attachment.itemId,
          uid: attachmentEntity.id.toString(),
          type: attachment.itemType,
          name: attachmentEntity.name,
          link: await this.entityService.getEntityUiLink(attachmentEntity),
        })
      } else if (attachment.itemType === 'App') {
        const appAttachment: App | null = await this.appRepository.findOne({
          id: attachment.itemId,
        })
        if (!appAttachment) {
          throw new errors.NotFoundError('Unable to get attachments: attachment not found.')
        }
        response.push({
          id: attachment.itemId,
          uid: appAttachment.uid,
          type: attachment.itemType,
          name: appAttachment.title,
          link: await this.entityService.getEntityUiLink(appAttachment),
        })
      }
    }
    return response
  }
}
