import { PaginatedRepository } from '@shared/domain/entity/repository/paginated.repository'
import { Invitation } from '@shared/domain/invitation/invitation.entity'

export class InvitationRepository extends PaginatedRepository<Invitation> {}
