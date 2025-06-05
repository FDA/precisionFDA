import { Attachment } from '@shared/domain/attachment/attachment.entity'
import { PaginatedRepository } from '@shared/domain/entity/repository/paginated.repository'

export class AttachmentRepository extends PaginatedRepository<Attachment> {}
