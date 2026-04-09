import { PaginatedRepository } from '@shared/database/repository/paginated.repository'
import { Attachment } from '@shared/domain/attachment/attachment.entity'

export class AttachmentRepository extends PaginatedRepository<Attachment> {}
