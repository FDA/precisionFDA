import { EntityManager } from '@mikro-orm/mysql'
import { expect } from 'chai'
import { stub } from 'sinon'
import { OrgActionRequestState } from '@shared/domain/org-action-request/org-action-request-state.enum'
import { OrgActionRequestType } from '@shared/domain/org-action-request/org-action-request-type.enum'
import { OrgActionRequestRepository } from '@shared/domain/org-action-request/org-action-request.repository'
import { OrgActionRequestService } from '@shared/domain/org-action-request/org-action-request.service'

describe('OrgActionRequestService', () => {
  const findOneStub = stub()
  const repoCreateStub = stub()
  const persistStub = stub()
  const flushStub = stub()

  const em = {
    persist: persistStub,
    flush: flushStub,
  } as unknown as EntityManager

  const repo = {
    findOne: findOneStub,
    create: repoCreateStub,
  } as unknown as OrgActionRequestRepository

  beforeEach(() => {
    findOneStub.reset()
    repoCreateStub.reset()
    persistStub.reset()
    flushStub.reset()
    flushStub.resolves()
  })

  function getInstance(): OrgActionRequestService {
    return new OrgActionRequestService(em, repo)
  }

  describe('#findPendingRemoveMemberRequest', () => {
    it('queries repository with expected pending remove-member filter', async () => {
      const expectedRequest = { id: 11 }
      findOneStub.resolves(expectedRequest)

      const service = getInstance()
      const result = await service.findPendingRemoveMemberRequest(10, 5)

      expect(
        findOneStub.calledOnceWithExactly({
          org: 10,
          member: 5,
          actionType: OrgActionRequestType.REMOVE_MEMBER,
          state: OrgActionRequestState.NEW,
        }),
      ).to.equal(true)
      expect(result).to.equal(expectedRequest)
    })
  })

  describe('#createRemoveMemberRequest', () => {
    it('creates and persists org action request with expected payload', async () => {
      const createdEntity = { id: 101 }
      repoCreateStub.returns(createdEntity)

      const service = getInstance()
      const result = await service.createRemoveMemberRequest(10, 1, 5)

      expect(
        repoCreateStub.calledOnceWithExactly({
          org: 10,
          initiator: 1,
          member: 5,
          actionType: OrgActionRequestType.REMOVE_MEMBER,
          state: OrgActionRequestState.NEW,
        }),
      ).to.equal(true)
      expect(persistStub.calledOnceWithExactly(createdEntity)).to.equal(true)
      expect(flushStub.calledOnce).to.equal(true)
      expect(result).to.equal(createdEntity)
    })
  })
})
