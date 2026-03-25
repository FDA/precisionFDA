import { expect } from 'chai'
import { stub } from 'sinon'
import { Participant, ParticipantKind } from '@shared/domain/participant/entity/participant.entity'
import { ParticipantRepository } from '@shared/domain/participant/repository/participant.repository'
import { ParticipantService } from '@shared/domain/participant/service/participant.service'

describe('ParticipantService', () => {
  const findStub = stub()

  beforeEach(() => {
    findStub.reset()
    findStub.throws()
  })

  describe('#getOrgParticipants', () => {
    it('should return empty array when no org participants exist', async () => {
      findStub.resolves([])
      const service = getInstance()

      const result = await service.getOrgParticipants()

      expect(result).to.deep.equal([])
    })

    it('should filter by org kind and order by position', async () => {
      findStub.resolves([])
      const service = getInstance()

      await service.getOrgParticipants()

      expect(findStub.calledOnce).to.be.true()
      const [filter, options] = findStub.firstCall.args
      expect(filter).to.deep.equal({ kind: ParticipantKind.ORG })
      expect(options).to.deep.equal({ orderBy: { position: 'ASC', id: 'ASC' } })
    })

    it('should transform entities to DTOs with resolved image URLs', async () => {
      findStub.resolves([
        createParticipant({ id: 1, title: 'FDA', imageUrl: 'participants/fda.png', position: 0 }),
        createParticipant({ id: 2, title: 'CDC', imageUrl: 'participants/cdc.png', position: 1 }),
      ])
      const service = getInstance()

      const result = await service.getOrgParticipants()

      expect(result).to.have.length(2)
      expect(result[0].title).to.equal('FDA')
      expect(result[0].imageUrl).to.equal('/assets/participants/fda.png')
      expect(result[1].title).to.equal('CDC')
      expect(result[1].imageUrl).to.equal('/assets/participants/cdc.png')
    })

    it('should not prepend path to absolute URLs', async () => {
      findStub.resolves([createParticipant({ id: 1, title: 'Test', imageUrl: '/already/absolute.png', position: 0 })])
      const service = getInstance()

      const result = await service.getOrgParticipants()

      expect(result[0].imageUrl).to.equal('/already/absolute.png')
    })

    it('should not prepend path to http URLs', async () => {
      findStub.resolves([
        createParticipant({ id: 1, title: 'Test', imageUrl: 'https://example.com/image.png', position: 0 }),
      ])
      const service = getInstance()

      const result = await service.getOrgParticipants()

      expect(result[0].imageUrl).to.equal('https://example.com/image.png')
    })
  })

  function getInstance(): ParticipantService {
    const repo = {
      find: findStub,
    } as unknown as ParticipantRepository
    return new ParticipantService(repo)
  }

  function createParticipant(data: Partial<Participant>): Participant {
    return {
      id: 1,
      title: 'Test',
      imageUrl: 'participants/test.png',
      public: true,
      kind: ParticipantKind.ORG,
      position: 0,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      ...data,
    } as Participant
  }
})
