import { expect } from 'chai'
import { SinonStub, stub } from 'sinon'
import { SpaceService } from '@shared/domain/space/service/space.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { NodeService } from '@shared/domain/user-file/node.service'
import { STATIC_SCOPE } from '@shared/enums'
import { NotFoundError } from '@shared/errors'
import { CliListAssetsFacade } from '../../../src/facade/cli/cli-list-assets.facade'

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

describe('CliListAssetsFacade', () => {
  let listAccessibleAssetsStub: SinonStub
  let loadEntityStub: SinonStub
  let spaceGetAccessibleByIdStub: SinonStub

  beforeEach(() => {
    listAccessibleAssetsStub = stub().resolves([])
    loadEntityStub = stub().resolves({ id: USER_ID })
    spaceGetAccessibleByIdStub = stub().resolves(null)
  })

  function getInstance(): CliListAssetsFacade {
    const nodeService = {
      listAccessibleAssets: listAccessibleAssetsStub,
    } as unknown as NodeService
    const user = createUserContext({ loadEntity: loadEntityStub })
    const spaceService = {
      getAccessibleById: spaceGetAccessibleByIdStub,
    } as unknown as SpaceService
    return new CliListAssetsFacade(nodeService, user, spaceService)
  }

  it('queries with scope: PUBLIC when scope is STATIC_SCOPE.PUBLIC', async () => {
    await getInstance().listAssets(STATIC_SCOPE.PUBLIC)

    expect(listAccessibleAssetsStub.calledOnce).to.be.true()
    const where = listAccessibleAssetsStub.firstCall.args[0]
    expect(where.scope).to.equal(STATIC_SCOPE.PUBLIC)
    expect(where).to.not.have.property('user')
    expect(loadEntityStub.called).to.be.false()
  })

  it('queries with user.id and scope: PRIVATE when scope is STATIC_SCOPE.PRIVATE', async () => {
    await getInstance().listAssets(STATIC_SCOPE.PRIVATE)

    expect(listAccessibleAssetsStub.calledOnce).to.be.true()
    const where = listAccessibleAssetsStub.firstCall.args[0]
    expect(where.user).to.equal(USER_ID)
    expect(where.scope).to.equal(STATIC_SCOPE.PRIVATE)
  })

  it('calls user.loadEntity for current user in private scope path', async () => {
    await getInstance().listAssets(STATIC_SCOPE.PRIVATE)

    expect(loadEntityStub.calledOnce).to.be.true()
  })

  it('queries with scope: space-123 when scope is a space scope and space exists', async () => {
    const spaceId = 123
    spaceGetAccessibleByIdStub.resolves({ id: spaceId })

    await getInstance().listAssets(`space-${spaceId}`)

    expect(listAccessibleAssetsStub.calledOnce).to.be.true()
    const where = listAccessibleAssetsStub.firstCall.args[0]
    expect(where.scope).to.equal(`space-${spaceId}`)
  })

  it('throws NotFoundError when scope is a space scope but space not found', async () => {
    spaceGetAccessibleByIdStub.resolves(null)

    try {
      await getInstance().listAssets('space-999')
      expect.fail('should have thrown NotFoundError')
    } catch (err) {
      expect(err).to.be.instanceOf(NotFoundError)
    }
  })
})
