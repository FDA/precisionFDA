import { Attachment } from '@shared/domain/attachment/attachment.entity'
import { PaginatedRepository } from '@shared/database/repository/paginated.repository'

export class AttachmentRepository extends PaginatedRepository<Attachment> {}
