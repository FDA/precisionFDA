import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { OrgActionRequest } from './org-action-request.entity'
import { OrgActionRequestState } from './org-action-request-state.enum'
import { OrgActionRequestType } from './org-action-request-type.enum'
import { OrgActionRequestRepository } from './org-action-request.repository'

@Injectable()
export class OrgActionRequestService {
  constructor(
    private readonly em: SqlEntityManager,
    private readonly orgActionRequestRepo: OrgActionRequestRepository,
  ) {}

  async findPendingRemoveMemberRequest(orgId: number, memberId: number): Promise<OrgActionRequest | null> {
    return await this.orgActionRequestRepo.findOne({
      org: orgId,
      member: memberId,
      actionType: OrgActionRequestType.REMOVE_MEMBER,
      state: OrgActionRequestState.NEW,
    })
  }

  async createRemoveMemberRequest(orgId: number, initiatorId: number, memberId: number): Promise<OrgActionRequest> {
    const request = this.orgActionRequestRepo.create({
      org: orgId,
      initiator: initiatorId,
      member: memberId,
      actionType: OrgActionRequestType.REMOVE_MEMBER,
      state: OrgActionRequestState.NEW,
    })

    this.em.persist(request)
    await this.em.flush()
    return request
  }
}
