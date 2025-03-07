import { Expert } from './expert.entity'
import { PaginatedRepository } from '@shared/domain/entity/repository/paginated.repository'

export class ExpertRepository extends PaginatedRepository<Expert> {}
