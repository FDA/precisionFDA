import { EntityRepository } from '@mikro-orm/mysql'
import { AdminGroup } from './admin-group.entity'

export class AdminGroupRepository extends EntityRepository<AdminGroup> {}
