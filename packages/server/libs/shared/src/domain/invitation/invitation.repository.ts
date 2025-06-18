import { PaginatedRepository } from '../entity/repository/paginated.repository'
import { Invitation } from './invitation.entity'

export class InvitationRepository extends PaginatedRepository<Invitation> {}
