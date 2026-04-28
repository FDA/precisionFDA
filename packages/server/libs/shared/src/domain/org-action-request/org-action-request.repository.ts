import { EntityRepository } from '@mikro-orm/mysql'
import { OrgActionRequest } from './org-action-request.entity'

export class OrgActionRequestRepository extends EntityRepository<OrgActionRequest> {}
