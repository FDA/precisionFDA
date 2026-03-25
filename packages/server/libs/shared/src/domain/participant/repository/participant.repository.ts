import { PaginatedRepository } from '@shared/database/repository/paginated.repository'
import { Participant } from '@shared/domain/participant/entity/participant.entity'

export class ParticipantRepository extends PaginatedRepository<Participant> {}
