import { PaginatedRepository } from '@shared/database/repository/paginated.repository'
import { Invitation } from '@shared/domain/invitation/invitation.entity'

export class InvitationRepository extends PaginatedRepository<Invitation> {}
