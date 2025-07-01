import { FilterQuery, QueryOrder } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { Injectable } from '@nestjs/common'
import { PaginatedResult } from '@shared/domain/entity/domain/paginated.result'
import { InvalidStateError } from '@shared/errors'
import { MainQueueJobProducer } from '@shared/queue/producer/main-queue-job.producer'
import { StringUtils } from '@shared/utils/string.utils'
import { InvitationPaginationDTO } from '../dto/invitation-pagination.dto'
import { Invitation } from '../invitation.entity'
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
    const where: FilterQuery<Invitation> = {}

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

  async provisionUsers(ids: number[]): Promise<{ provisioningIds: number[] }> {
    const pendingInvitations = await this.invitationRepository.find({
      id: { $in: ids },
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
    await this.mainQueueJobProducer.createProvisionNewUsersTask(provisioningIds)
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
}
