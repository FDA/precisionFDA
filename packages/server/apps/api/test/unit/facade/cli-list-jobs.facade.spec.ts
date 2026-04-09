import { expect } from 'chai'
import { SinonStub, stub } from 'sinon'
import { JobService } from '@shared/domain/job/job.service'
import { SpaceService } from '@shared/domain/space/service/space.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { STATIC_SCOPE } from '@shared/enums'
import { NotFoundError } from '@shared/errors'
import { CliListJobsFacade } from '../../../src/facade/cli/cli-list-jobs.facade'

const USER_ID = 42
const DXUSER = 'user-test'

function createUserContext(overrides?: Partial<UserContext>): UserContext {
  return {
    id: USER_ID,
    dxuser: DXUSER,
    loadEntity: stub().resolves({ id: USER_ID }),
    ...overrides,
  } as unknown as UserContext
}

describe('CliListJobsFacade', () => {
  let jobListAccessibleStub: SinonStub
  let spaceGetAccessibleByIdStub: SinonStub
  let loadEntityStub: SinonStub

  beforeEach(() => {
    jobListAccessibleStub = stub().resolves([])
    spaceGetAccessibleByIdStub = stub().resolves(null)
    loadEntityStub = stub().resolves({ id: USER_ID })
  })

  function getInstance(): CliListJobsFacade {
    const user = createUserContext({ loadEntity: loadEntityStub })
    const jobService = {
      listAccessible: jobListAccessibleStub,
    } as unknown as JobService
    const spaceService = {
      getAccessibleById: spaceGetAccessibleByIdStub,
    } as unknown as SpaceService
    return new CliListJobsFacade(user, jobService, spaceService)
  }

  it('queries with scope: space-123 when scope is a space scope and space exists', async () => {
    const spaceId = 123
    spaceGetAccessibleByIdStub.resolves({ id: spaceId })

    await getInstance().listJobs(`space-${spaceId}`)

    expect(jobListAccessibleStub.calledOnce).to.be.true()
    const where = jobListAccessibleStub.firstCall.args[0]
    expect(where.scope).to.equal(`space-${spaceId}`)
  })

  it('throws NotFoundError when scope is a space scope but space not found', async () => {
    spaceGetAccessibleByIdStub.resolves(null)

    try {
      await getInstance().listJobs('space-999')
      expect.fail('should have thrown NotFoundError')
    } catch (err) {
      expect(err).to.be.instanceOf(NotFoundError)
    }
  })

  it('queries with scope: PUBLIC when scope is STATIC_SCOPE.PUBLIC', async () => {
    await getInstance().listJobs(STATIC_SCOPE.PUBLIC)

    expect(jobListAccessibleStub.calledOnce).to.be.true()
    const where = jobListAccessibleStub.firstCall.args[0]
    expect(where.scope).to.equal(STATIC_SCOPE.PUBLIC)
  })

  it('queries with user.id and scope: PRIVATE for private scope', async () => {
    await getInstance().listJobs(STATIC_SCOPE.PRIVATE)

    expect(jobListAccessibleStub.calledOnce).to.be.true()
    const where = jobListAccessibleStub.firstCall.args[0]
    expect(where.user).to.equal(USER_ID)
    expect(where.scope).to.equal(STATIC_SCOPE.PRIVATE)
  })

  it('calls user.loadEntity for current user in private scope path', async () => {
    await getInstance().listJobs(STATIC_SCOPE.PRIVATE)

    expect(loadEntityStub.calledOnce).to.be.true()
  })
})
