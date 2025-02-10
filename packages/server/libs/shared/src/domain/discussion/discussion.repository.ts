import { PaginatedRepository } from '@shared/domain/entity/repository/paginated.repository'
import { Discussion } from '@shared/domain/discussion/discussion.entity'

export default class DiscussionRepository extends PaginatedRepository<Discussion> {}
