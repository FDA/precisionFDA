import { Logger } from '@nestjs/common'
import { ChallengeResourceRepository } from '@shared/domain/challenge/challenge-resource.repository'
import { ChallengeRepository } from '@shared/domain/challenge/challenge.repository'
import { DataPortalRepository } from '@shared/domain/data-portal/data-portal.repository'
import { SpaceReportRepository } from '@shared/domain/space-report/repository/space-report.repository'
import { expect } from 'chai'
import { stub } from 'sinon'
import { FollowUpDecider } from '../../src/domain/user-file/follow-up-decider'

describe('FollowUpDecider', () => {
  const findResourcesStub = stub()
  const findDataPortalsStub = stub()
  const findChallengeResourcesStub = stub()
  const findChallengesStub = stub()
  const findReportByResultFileUidStub = stub()
  const verboseLoggerStub = stub()

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
    log: verboseLoggerStub,
  } as unknown as Logger
  const spaceReportRepo = {
    findByResultFileUid: findReportByResultFileUidStub,
  } as unknown as SpaceReportRepository
  const decider = new FollowUpDecider(
    logger,
    dataPortalRepo,
    challengeResourceRepo,
    challengeRepo,
    spaceReportRepo,
  )

  beforeEach(() => {
    findResourcesStub.reset()
    findDataPortalsStub.reset()
    findChallengeResourcesStub.reset()
    findChallengesStub.reset()
    findReportByResultFileUidStub.reset()
  })

  describe('#decideNextAction', async () => {
    it('should return UPDATE_DATA_PORTAL_IMAGE_URL', async () => {
      findResourcesStub.resolves([])
      findDataPortalsStub.resolves([{}])
      findChallengeResourcesStub.resolves([])
      findChallengesStub.resolves([])
      findReportByResultFileUidStub.resolves(null)

      const result = await decider.decideNextAction('file-Uid-1')
      expect(result).to.eq('UPDATE_DATA_PORTAL_IMAGE_URL')
    })
    it('should return UPDATE_CHALLENGE_RESOURCE_URL', async () => {
      findResourcesStub.resolves([])
      findDataPortalsStub.resolves([])
      findChallengeResourcesStub.resolves([{}])
      findChallengesStub.resolves([])
      findReportByResultFileUidStub.resolves(null)

      const result = await decider.decideNextAction('file-Uid-1')
      expect(result).to.eq('UPDATE_CHALLENGE_RESOURCE_URL')
    })
    it('should return UPDATE_CHALLENGE_IMAGE_URL', async () => {
      findResourcesStub.resolves([])
      findDataPortalsStub.resolves([])
      findChallengeResourcesStub.resolves([])
      findChallengesStub.resolves([{}])
      findReportByResultFileUidStub.resolves(null)

      const result = await decider.decideNextAction('file-Uid-1')
      expect(result).to.eq('UPDATE_CHALLENGE_IMAGE_URL')
    })
    it('should return COMPLETE_SPACE_REPORT', async () => {
      findResourcesStub.resolves([])
      findDataPortalsStub.resolves([])
      findChallengeResourcesStub.resolves([])
      findChallengesStub.resolves([])
      findReportByResultFileUidStub.resolves({})

      const result = await decider.decideNextAction('file-Uid-1')
      expect(result).to.eq('COMPLETE_SPACE_REPORT')
    })
  })
})
