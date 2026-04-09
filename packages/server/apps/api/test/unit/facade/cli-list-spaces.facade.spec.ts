import { expect } from 'chai'
import { SinonStub, stub } from 'sinon'
import { SpaceService } from '@shared/domain/space/service/space.service'
import { SPACE_STATE, SPACE_TYPE } from '@shared/domain/space/space.enum'
import { SPACE_MEMBERSHIP_ROLE, SPACE_MEMBERSHIP_SIDE } from '@shared/domain/space-membership/space-membership.enum'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { CliListSpacesFacade } from '../../../src/facade/cli/cli-list-spaces.facade'

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

describe('CliListSpacesFacade', () => {
  let listAccessibleStub: SinonStub

  beforeEach(() => {
    listAccessibleStub = stub().resolves([])
  })

  function getInstance(): CliListSpacesFacade {
    const user = createUserContext()
    const spaceService = {
      listAccessible: listAccessibleStub,
    } as unknown as SpaceService
    return new CliListSpacesFacade(user, spaceService)
  }

  it('calls spaceService.listAccessible with SPACE_STATE.ACTIVE when state is not provided in query', async () => {
    await getInstance().listSpaces({})

    expect(listAccessibleStub.calledOnce).to.be.true()
    const where = listAccessibleStub.firstCall.args[0]
    expect(where.state).to.equal(SPACE_STATE.ACTIVE)
  })

  it('calls spaceService.listAccessible with provided state', async () => {
    await getInstance().listSpaces({ state: SPACE_STATE.LOCKED })

    expect(listAccessibleStub.calledOnce).to.be.true()
    const where = listAccessibleStub.firstCall.args[0]
    expect(where.state).to.equal(SPACE_STATE.LOCKED)
  })

  it('adds protected: true to where clause when query.protected is true', async () => {
    await getInstance().listSpaces({ protected: true })

    const where = listAccessibleStub.firstCall.args[0]
    expect(where.protected).to.equal(true)
  })

  it('does not add protected to where clause when query.protected is undefined', async () => {
    await getInstance().listSpaces({})

    const where = listAccessibleStub.firstCall.args[0]
    expect(where).to.not.have.property('protected')
  })

  it('adds type filter { $in: types } when query.types has items', async () => {
    const types = [SPACE_TYPE.REVIEW, SPACE_TYPE.GROUPS]
    await getInstance().listSpaces({ types })

    const where = listAccessibleStub.firstCall.args[0]
    expect(where.type).to.deep.equal({ $in: types })
  })

  it('does not add type filter when query.types is empty', async () => {
    await getInstance().listSpaces({ types: [] })

    const where = listAccessibleStub.firstCall.args[0]
    expect(where).to.not.have.property('type')
  })

  it('does not add type filter when query.types is undefined', async () => {
    await getInstance().listSpaces({})

    const where = listAccessibleStub.firstCall.args[0]
    expect(where).to.not.have.property('type')
  })

  it('maps results using CliListSpaceDTO.fromEntity', async () => {
    const mockMembership = {
      user: { id: USER_ID },
      active: true,
      role: SPACE_MEMBERSHIP_ROLE.ADMIN,
      side: SPACE_MEMBERSHIP_SIDE.HOST,
    }
    const mockSpace = {
      id: 1,
      name: 'Test Space',
      type: SPACE_TYPE.GROUPS,
      state: SPACE_STATE.ACTIVE,
      protected: false,
      spaceMemberships: {
        getItems: () => [mockMembership],
      },
    }
    listAccessibleStub.resolves([mockSpace])

    const result = await getInstance().listSpaces({})

    expect(result).to.have.lengthOf(1)
    expect(result[0].id).to.equal(1)
    expect(result[0].title).to.equal('Test Space')
  })
})
