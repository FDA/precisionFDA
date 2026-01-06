import { EntityRepository } from '@mikro-orm/mysql'
import { Organization } from './organization.entity'

export class OrganizationRepository extends EntityRepository<Organization> {}
