import { EntityRepository } from '@mikro-orm/mysql'
import { Organization } from './org.entity'

export class OrgRepository extends EntityRepository<Organization> {}
