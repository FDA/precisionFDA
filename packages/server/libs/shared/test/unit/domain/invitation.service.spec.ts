import { EntityManager, SqlEntityManager } from '@mikro-orm/mysql'
import { database } from '@shared/database'
import { InvitationPaginationDTO } from '@shared/domain/invitation/dto/invitation-pagination.dto'
import { Invitation } from '@shared/domain/invitation/invitation.entity'
import { PROVISIONING_STATE } from '@shared/domain/invitation/invitation.enum'
import { InvitationRepository } from '@shared/domain/invitation/invitation.repository'
import { InvitationService } from '@shared/domain/invitation/services/invitation.service'
import { MainQueueJobProducer } from '@shared/queue/producer/main-queue-job.producer'
import { create, db } from '@shared/test'
import { expect } from 'chai'
import { stub } from 'sinon'

describe('InvitationService', () => {
  let em: SqlEntityManager
  let invitationRepository: InvitationRepository
  let paginateStub: sinon.SinonStub
  const createProvisionNewUsersTaskStub = stub()

  beforeEach(async () => {
    await db.dropData(database.connection())
    invitationRepository = new InvitationRepository(em, Invitation)
    paginateStub = stub(invitationRepository, 'paginate')
    em = database.orm().em.fork() as EntityManager
    em.clear()

    paginateStub.reset()
    createProvisionNewUsersTaskStub.reset()
  })

  context('listInvitations', () => {
    it('should call the repository with the correct parameters', async () => {
      const query = {
        filter: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'test@test.com',
          provisioningState: PROVISIONING_STATE.PENDING,
          createdAt: '2023-01-01,2023-12-31',
        },
      } as InvitationPaginationDTO
      await getInstance().listInvitations(query)
      expect(paginateStub.calledOnce).to.be.true()
      expect(paginateStub.firstCall.args[1]).to.deep.equal({
        firstName: { $like: '%John%' },
        lastName: { $like: '%Doe%' },
        email: { $like: '%test@test.com%' },
        provisioningState: PROVISIONING_STATE.PENDING,
        createdAt: {
          $gte: new Date('2023-01-01'),
          $lte: new Date('2023-12-31'),
        },
      })
    })

    it('should call the repository with empty filter', async () => {
      const query = {
        filter: {},
      } as InvitationPaginationDTO
      await getInstance().listInvitations(query)
      expect(paginateStub.calledOnce).to.be.true()
      expect(paginateStub.firstCall.args[1]).to.deep.equal({})
    })

    it('should call the repository with partial filter', async () => {
      const query = {
        filter: {
          firstName: 'John',
          lastName: 'Doe',
        },
      } as InvitationPaginationDTO
      await getInstance().listInvitations(query)
      expect(paginateStub.calledOnce).to.be.true()
      expect(paginateStub.firstCall.args[1]).to.deep.equal({
        firstName: { $like: '%John%' },
        lastName: { $like: '%Doe%' },
      })
    })
  })

  context('provisionUsers', () => {
    it('should only provision pending invitations', async () => {
      const invitation1 = create.inivitationHelper.create(em, {})
      const invitation2 = create.inivitationHelper.create(em, {
        provisioningState: PROVISIONING_STATE.IN_PROGRESS,
      })
      const invitation3 = create.inivitationHelper.create(em, {})
      await em.flush()

      await getInstance().provisionUsers([invitation1.id, invitation2.id, invitation3.id])
      expect(createProvisionNewUsersTaskStub.callCount).to.equal(1)
      expect(createProvisionNewUsersTaskStub.firstCall.args[0]).to.deep.equal([
        invitation1.id,
        invitation3.id,
      ])
    })
  })

  function getInstance() {
    const mainQueueJobProducer = {
      createProvisionNewUsersTask: createProvisionNewUsersTaskStub,
    } as unknown as MainQueueJobProducer

    return new InvitationService(em, invitationRepository, mainQueueJobProducer)
  }
})
