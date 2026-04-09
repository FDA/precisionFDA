import { expect } from 'chai'
import { SinonStub, stub } from 'sinon'
import { AppSeriesService } from '@shared/domain/app-series/service/app-series.service'
import { DbClusterService } from '@shared/domain/db-cluster/service/db-cluster.service'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import { JobService } from '@shared/domain/job/job.service'
import { SpaceService } from '@shared/domain/space/service/space.service'
import { SpaceMembershipService } from '@shared/domain/space-membership/service/space-membership.service'
import { SpaceReportService } from '@shared/domain/space-report/service/space-report.service'
import { User } from '@shared/domain/user/user.entity'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { NodeService } from '@shared/domain/user-file/node.service'
import { WorkflowSeriesService } from '@shared/domain/workflow-series/service/workflow-series.service'
import { HOME_SCOPE } from '@shared/enums'
import { NotFoundError } from '@shared/errors'
import { CountersFacade } from '@shared/facade/counters/counters.facade'

describe('CountersFacade', () => {
  const USER_ID = 1
  const SPACE_ID = 42

  const accessibleSpacesStub = stub()

  const USER = {
    id: USER_ID,
    accessibleSpaces: accessibleSpacesStub,
  } as unknown as User

  const loadEntityStub = stub()
  const USER_CTX: UserContext = {
    id: USER_ID,
    accessToken: 'accessToken',
    dxuser: 'dxuser',
    loadEntity: loadEntityStub,
  } as unknown as UserContext

  let countFilesStub: SinonStub
  let countAssetsStub: SinonStub
  let appSeriesCountStub: SinonStub
  let jobCountStub: SinonStub
  let dbClusterCountStub: SinonStub
  let workflowCountStub: SinonStub
  let spaceReportCountStub: SinonStub
  let spaceMembershipCountBySpaceStub: SinonStub
  let discussionCountStub: SinonStub
  let getAccessibleByIdStub: SinonStub

  beforeEach(() => {
    accessibleSpacesStub.reset()
    accessibleSpacesStub.resolves([{ scope: 'space-1' }, { scope: 'space-2' }])

    loadEntityStub.reset()
    loadEntityStub.resolves(USER)

    countFilesStub = stub().resolves(5)
    countAssetsStub = stub().resolves(3)
    appSeriesCountStub = stub().resolves(2)
    jobCountStub = stub().resolves(10)
    dbClusterCountStub = stub().resolves(1)
    workflowCountStub = stub().resolves(4)
    spaceReportCountStub = stub().resolves(6)
    spaceMembershipCountBySpaceStub = stub().resolves(15)
    discussionCountStub = stub().resolves(7)
    getAccessibleByIdStub = stub().resolves({ id: SPACE_ID, scope: `space-${SPACE_ID}` })
  })

  describe('#getCounters', () => {
    it('should return counters for all entity types', async () => {
      const result = await getInstance().getCounters(HOME_SCOPE.ME)

      expect(result).to.deep.equal({
        files: 5,
        apps: 2,
        assets: 3,
        jobs: 10,
        dbclusters: 1,
        workflows: 4,
        reports: 6,
        discussions: 7,
      })
    })

    it('should call all domain services with correct context', async () => {
      await getInstance().getCounters(HOME_SCOPE.SPACES)

      expect(countFilesStub.calledOnce).to.be.true()
      expect(countAssetsStub.calledOnce).to.be.true()
      expect(appSeriesCountStub.calledOnce).to.be.true()
      expect(jobCountStub.calledOnce).to.be.true()
      expect(dbClusterCountStub.calledOnce).to.be.true()
      expect(workflowCountStub.calledOnce).to.be.true()
      expect(spaceReportCountStub.calledOnce).to.be.true()
      expect(discussionCountStub.calledOnce).to.be.true()

      // Verify the context passed to domain services
      const context = countFilesStub.firstCall.args[0]
      expect(context.user).to.equal(USER)
      expect(context.scope).to.equal(HOME_SCOPE.SPACES)
      expect(context.spaceScopes).to.deep.equal(['space-1', 'space-2'])
    })

    it('should propagate error from loadEntity', async () => {
      const error = new Error('Failed to load user')
      loadEntityStub.rejects(error)

      await expect(getInstance().getCounters(HOME_SCOPE.ME)).to.be.rejectedWith(error)
    })

    it('should propagate error from accessibleSpaces', async () => {
      const error = new Error('Failed to get accessible spaces')
      accessibleSpacesStub.rejects(error)

      await expect(getInstance().getCounters(HOME_SCOPE.SPACES)).to.be.rejectedWith(error)
    })

    it('should propagate error from domain service', async () => {
      const error = new Error('Count service error')
      countFilesStub.rejects(error)

      await expect(getInstance().getCounters(HOME_SCOPE.ME)).to.be.rejectedWith(error)
    })
  })

  describe('#getSpaceCounters', () => {
    it('should return counters for a specific space', async () => {
      spaceMembershipCountBySpaceStub.resolves(15)

      const result = await getInstance().getSpaceCounters(SPACE_ID)

      expect(result).to.deep.equal({
        files: 5,
        assets: 3,
        apps: 2,
        workflows: 4,
        jobs: 10,
        members: 15,
        reports: 6,
        discussions: 7,
        dbclusters: 1,
      })
    })

    it('should call domain services with single-space context', async () => {
      await getInstance().getSpaceCounters(SPACE_ID)

      // Verify the context passed to domain services uses single-space scope
      const context = countFilesStub.firstCall.args[0]
      expect(context.user).to.equal(USER)
      expect(context.scope).to.equal(HOME_SCOPE.SPACES)
      expect(context.spaceScopes).to.deep.equal([`space-${SPACE_ID}`])
      expect(spaceMembershipCountBySpaceStub.calledOnceWith(SPACE_ID)).to.be.true()
    })

    it('should validate space access', async () => {
      await getInstance().getSpaceCounters(SPACE_ID)

      expect(getAccessibleByIdStub.calledOnceWith(SPACE_ID)).to.be.true()
    })

    it('should throw NotFoundError if space is not accessible', async () => {
      getAccessibleByIdStub.resolves(null)

      await expect(getInstance().getSpaceCounters(SPACE_ID)).to.be.rejectedWith(
        NotFoundError,
        'Space does not exist or is not accessible',
      )
    })

    it('should propagate error from getAccessibleSpace', async () => {
      const error = new Error('Space service error')
      getAccessibleByIdStub.rejects(error)

      await expect(getInstance().getSpaceCounters(SPACE_ID)).to.be.rejectedWith(error)
    })

    it('should propagate error from domain service', async () => {
      const error = new Error('Count service error')
      countFilesStub.rejects(error)

      await expect(getInstance().getSpaceCounters(SPACE_ID)).to.be.rejectedWith(error)
    })
  })

  function getInstance(): CountersFacade {
    const nodeService = {
      countFiles: countFilesStub,
      countAssets: countAssetsStub,
    } as unknown as NodeService
    const appSeriesService = { countByScope: appSeriesCountStub } as unknown as AppSeriesService
    const jobService = { countByScope: jobCountStub } as unknown as JobService
    const dbClusterService = { countByScope: dbClusterCountStub } as unknown as DbClusterService
    const workflowSeriesService = {
      countByScope: workflowCountStub,
    } as unknown as WorkflowSeriesService
    const spaceReportService = {
      countByScope: spaceReportCountStub,
    } as unknown as SpaceReportService
    const discussionService = {
      countByScope: discussionCountStub,
    } as unknown as DiscussionService
    const spaceService = {
      getAccessibleById: getAccessibleByIdStub,
    } as unknown as SpaceService
    const spaceMembershipService = {
      countBySpace: spaceMembershipCountBySpaceStub,
    } as unknown as SpaceMembershipService

    return new CountersFacade(
      USER_CTX,
      nodeService,
      appSeriesService,
      jobService,
      dbClusterService,
      workflowSeriesService,
      spaceReportService,
      discussionService,
      spaceService,
      spaceMembershipService,
    )
  }
})
