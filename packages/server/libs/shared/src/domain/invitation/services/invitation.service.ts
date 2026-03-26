import { QueryOrder } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { ObjectFilterQuery } from '@shared/database/domain/object-filter-query'
import { PaginatedResult } from '@shared/domain/entity/domain/paginated.result'
import { ProvisionUsersDTO } from '@shared/domain/invitation/dto/provision-users.dto'
import { InvalidStateError } from '@shared/errors'
import { MainQueueJobProducer } from '@shared/queue/producer/main-queue-job.producer'
import { StringUtils } from '@shared/utils/string.utils'
import { randomUUID } from 'node:crypto'
import { InvitationPaginationDTO } from '../dto/invitation-pagination.dto'
import { RequestAccessDTO } from '../dto/request-access.dto'
import { Extras, Invitation } from '../invitation.entity'
import { PROVISIONING_STATE } from '../invitation.enum'
import { InvitationRepository } from '../invitation.repository'

@Injectable()
export class InvitationService {
  constructor(
    private readonly em: SqlEntityManager,
    private readonly invitationRepository: InvitationRepository,
    private readonly mainQueueJobProducer: MainQueueJobProducer,
  ) {}

  async listInvitations(query: InvitationPaginationDTO): Promise<PaginatedResult<Invitation>> {
    const where: ObjectFilterQuery<Invitation> = {}

    if (query.filter?.ids) {
      where.id = { $in: query.filter.ids }
    }
    if (query.filter?.firstName) {
      where.firstName = { $like: `%${query.filter.firstName}%` }
    }
    if (query.filter?.lastName) {
      where.lastName = { $like: `%${query.filter.lastName}%` }
    }
    if (query.filter?.email) {
      where.email = { $like: `%${query.filter.email}%` }
    }
    if (query.filter?.provisioningState) {
      where.provisioningState = query.filter?.provisioningState
    }
    if (query.filter?.createdAt) {
      const { lower, upper } = StringUtils.parseDateRange(query.filter.createdAt)
      where.createdAt = {
        ...(lower && { $gte: lower }),
        ...(upper && { $lte: upper }),
      }
    }
    if (query.sortBy && query.sortDir) {
      query.sort = {
        [query.sortBy]: query.sortDir === QueryOrder.DESC ? QueryOrder.DESC : QueryOrder.ASC,
      }
    }

    return await this.invitationRepository.paginate(query, where, {})
  }

  async provisionUsers(body: ProvisionUsersDTO): Promise<{ provisioningIds: number[] }> {
    const pendingInvitations = await this.invitationRepository.find({
      id: { $in: body.ids },
      provisioningState: PROVISIONING_STATE.PENDING,
    })

    const provisioningIds: number[] = []
    await this.em.transactional(async () => {
      pendingInvitations.forEach((invitation) => {
        invitation.provisioningState = PROVISIONING_STATE.IN_PROGRESS
        this.em.persist(invitation)
        provisioningIds.push(invitation.id)
      })
    })
    await this.mainQueueJobProducer.createProvisionNewUsersTask(provisioningIds, body.spaceIds)
    return { provisioningIds }
  }

  async editBasicInfo(id: number, data: Partial<Invitation>): Promise<{ id: number }> {
    const invitation = await this.invitationRepository.findOneOrFail(id)
    if (invitation.provisioningState !== PROVISIONING_STATE.PENDING) {
      throw new InvalidStateError('Cannot edit invitation that is not in pending state')
    }
    const allowedFields = ['firstName', 'lastName', 'email']
    for (const field of allowedFields) {
      if (data[field]) {
        invitation[field] = data[field]
      }
    }
    await this.em.persistAndFlush(invitation)
    return { id: invitation.id }
  }

  async createInvitation(dto: RequestAccessDTO): Promise<{ id: number }> {
    const invitation = new Invitation()
    invitation.firstName = dto.firstName
    invitation.lastName = dto.lastName
    invitation.email = dto.email
    invitation.duns = dto.duns
    invitation.ip = dto.ip
    invitation.state = 'guest'
    invitation.code = randomUUID()
    invitation.extras = {
      req_reason: dto.reason,
      req_data: dto.reqData,
      req_software: dto.reqSoftware,
      research_intent: dto.researchIntent,
      clinical_intent: dto.clinicalIntent,
      participate_intent: dto.participateIntent,
      organize_intent: dto.organizeIntent,
    } as Extras
    invitation.provisioningState = PROVISIONING_STATE.PENDING
    await this.em.persistAndFlush(invitation)
    return { id: invitation.id }
  }
}
