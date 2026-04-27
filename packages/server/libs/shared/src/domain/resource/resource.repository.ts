import { EntityRepository } from '@mikro-orm/mysql'
import { Resource } from './resource.entity'

export class ResourceRepository extends EntityRepository<Resource> {}
