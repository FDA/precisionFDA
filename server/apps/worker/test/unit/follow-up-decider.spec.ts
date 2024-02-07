import { FollowUpDecider } from '../../src/domain/user-file/follow-up-decider'
import { Logger } from '@nestjs/common'
import { ResourceRepository } from '@shared/domain/resource/resource.repository'
import { DataPortalRepository } from '@shared/domain/data-portal/data-portal.repository'
import { ChallengeResourceRepository } from '@shared/domain/challenge/challenge-resource.repository'
import { ChallengeRepository } from '@shared/domain/challenge/challenge.repository'
import { stub } from 'sinon'
import { expect } from 'chai'

describe('FollowUpDecider', () => {
  const findResourcesStub = stub()
  const findDataPortalsStub = stub()
  const findChallengeResourcesStub = stub()
  const findChallengesStub = stub()
  const verboseLoggerStub = stub()

  const resourceRepo = {
    findResourcesByFileUid: findResourcesStub,
  } as unknown as ResourceRepository
  const dataPortalRepo = {
    findDataPortalsByCardImageUid: findDataPortalsStub,
  } as unknown as DataPortalRepository
  const challengeRepo = {
    findChallengesByCardImageFileUid: findChallengesStub,
  } as unknown as ChallengeRepository
  const challengeResourceRepo = {
    findChallengeResourcesByFileUid: findChallengeResourcesStub,
  } as unknown as ChallengeResourceRepository
  const logger = {
    verbose: verboseLoggerStub,
  } as unknown as Logger

  const decider = new FollowUpDecider(
    logger,
    resourceRepo,
    dataPortalRepo,
    challengeResourceRepo,
    challengeRepo,
  )

  beforeEach(() => {
    findResourcesStub.reset()
    findDataPortalsStub.reset()
    findChallengeResourcesStub.reset()
    findChallengesStub.reset()
  })

  describe('#decideNextAction', async () => {
    it('should return UPDATE_DATA_PORTAL_RESOURCE_URL', async () => {
      findResourcesStub.resolves([{}])
      findDataPortalsStub.resolves([])
      findChallengeResourcesStub.resolves([])
      findChallengesStub.resolves([])

      const result = await decider.decideNextAction('fileUid')
      expect(result).to.eq('UPDATE_DATA_PORTAL_RESOURCE_URL')
    })
    it('should return UPDATE_DATA_PORTAL_IMAGE_URL', async () => {
      findResourcesStub.resolves([])
      findDataPortalsStub.resolves([{}])
      findChallengeResourcesStub.resolves([])
      findChallengesStub.resolves([])

      const result = await decider.decideNextAction('fileUid')
      expect(result).to.eq('UPDATE_DATA_PORTAL_IMAGE_URL')
    })
    it('should return UPDATE_CHALLENGE_RESOURCE_URL', async () => {
      findResourcesStub.resolves([])
      findDataPortalsStub.resolves([])
      findChallengeResourcesStub.resolves([{}])
      findChallengesStub.resolves([])

      const result = await decider.decideNextAction('fileUid')
      expect(result).to.eq('UPDATE_CHALLENGE_RESOURCE_URL')
    })
    it('should return UPDATE_CHALLENGE_IMAGE_URL', async () => {
      findResourcesStub.resolves([])
      findDataPortalsStub.resolves([])
      findChallengeResourcesStub.resolves([])
      findChallengesStub.resolves([{}])

      const result = await decider.decideNextAction('fileUid')
      expect(result).to.eq('UPDATE_CHALLENGE_IMAGE_URL')
    })
  })
})
