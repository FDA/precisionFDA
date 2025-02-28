import { SqlEntityManager } from '@mikro-orm/mysql'
import { GroupsSpaceCreationProcess } from '@shared/domain/space/create/groups-space-creation.process'
import { SpaceCreationProcess } from '@shared/domain/space/create/space-creation.process'
import { SpaceService } from '@shared/domain/space/service/space.service'
import { SPACE_STATE, SPACE_TYPE } from '@shared/domain/space/space.enum'
import { SpaceRepository } from '@shared/domain/space/space.repository'
import { Node } from '@shared/domain/user-file/node.entity'
import { expect } from 'chai'
import { stub } from 'sinon'
import { PermissionError, SpaceNotFoundError, UserNotFoundError } from '@shared/errors'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { SpaceMembershipRepository } from '@shared/domain/space-membership/space-membership.repository'
import { UserRepository } from '@shared/domain/user/user.repository'
import {
  SPACE_EVENT_ACTIVITY_TYPE,
  SPACE_EVENT_OBJECT_TYPE,
} from '@shared/domain/space-event/space-event.enum'
import { Reference } from '@mikro-orm/core'
import { CreateSpaceDTO } from '@shared/domain/space/dto/create-space-dto'

describe('SpaceService', () => {
  const USER_ID = 1
  const SPACE_ID = 2
  const CONF_SPACE_ID = 3

  const em = {
    transactional: async <T>(callback: (em: SqlEntityManager) => Promise<T>): Promise<T> => {
      return callback(em as SqlEntityManager)
    },
  } as unknown as SqlEntityManager
  let referenceStub

  const spaceRepoFindOneStub = stub()
  const buildStub = stub()
  const spaceRepoFindOneOrFailStub = stub()
  const spaceRepoFindStub = stub()
  const spaceRepoFindSpacesByIdAndUserStub = stub()
  const userRepoFindOneStub = stub()
  const emTransactionalStub = stub(em, 'transactional').callsFake(async (callback) => {
    return await callback(em)
  }) as SqlEntityManager['transactional']
  const spaceMembershipRepoFindOneStub = stub()
  const temPersistAndFlushStub = stub()

  const userContext = new UserContext(1, 'accessToken', 'dxuser', 'sessionId')

  const createSpaceService = () => {
    em.transactional = emTransactionalStub
    em.persistAndFlush = temPersistAndFlushStub

    const spaceRepository = {
      findOne: spaceRepoFindOneStub,
      findOneOrFail: spaceRepoFindOneOrFailStub,
      find: spaceRepoFindStub,
      findSpacesByIdAndUser: spaceRepoFindSpacesByIdAndUserStub,
    } as unknown as SpaceRepository
    const spaceMembershipRepository = {
      findOne: spaceMembershipRepoFindOneStub,
    } as unknown as SpaceMembershipRepository
    const userRepository = {
      findOne: userRepoFindOneStub,
    } as unknown as UserRepository
    const buildProcess = {
      build: buildStub,
    } as unknown as GroupsSpaceCreationProcess
    const spaceTypeToCreatorProviderMap = {
      [SPACE_TYPE.GROUPS]: buildProcess,
    } as unknown as { [T in SPACE_TYPE]: SpaceCreationProcess }

    return new SpaceService(
      em,
      userContext,
      spaceTypeToCreatorProviderMap,
      spaceRepository,
      spaceMembershipRepository,
      userRepository,
    )
  }

  beforeEach(async () => {
    spaceRepoFindOneStub.reset()
    spaceRepoFindOneStub.throws()

    buildStub.reset()
    buildStub.throws()

    spaceRepoFindOneOrFailStub.reset()
    spaceRepoFindOneOrFailStub.throws()

    spaceRepoFindStub.reset()
    spaceRepoFindStub.throws()

    spaceRepoFindSpacesByIdAndUserStub.reset()
    spaceRepoFindSpacesByIdAndUserStub.throws()

    userRepoFindOneStub.reset()
    userRepoFindOneStub.throws()

    spaceMembershipRepoFindOneStub.reset()
    spaceMembershipRepoFindOneStub.throws()

    temPersistAndFlushStub.reset()
    temPersistAndFlushStub.throws()

    referenceStub = stub(Reference, 'create')
  })

  afterEach(() => {
    referenceStub.restore()
  })

  describe('#create', () => {
    it('basic', async () => {
      buildStub.resolves()
      const spaceService = createSpaceService()
      const createSpaceDto = {
        name: 'test-space',
        spaceType: SPACE_TYPE.GROUPS,
      } as unknown as CreateSpaceDTO

      await spaceService.create(createSpaceDto)

      expect(buildStub.calledOnce).to.be.true
      expect(buildStub.firstCall.args[0]).to.deep.equal(createSpaceDto)
    })
  })

  describe('#lockSpace', () => {
    it('basic', async () => {
      const user = { id: USER_ID, isReviewSpaceAdmin: () => true }
      const space = {
        id: SPACE_ID,
        state: SPACE_STATE.ACTIVE,
        type: SPACE_TYPE.REVIEW,
        isConfidential: () => false,
      }

      referenceStub.withArgs(user).returns(user)
      referenceStub.withArgs(space).returns(space)

      userRepoFindOneStub
        .withArgs(
          { id: USER_ID },
          { populate: ['adminMemberships', 'adminMemberships.adminGroup'] },
        )
        .resolves(user)
      spaceRepoFindOneStub.withArgs({ id: SPACE_ID }).resolves(space)
      spaceRepoFindStub.withArgs({ spaceId: SPACE_ID }).resolves([{ id: CONF_SPACE_ID }])
      spaceMembershipRepoFindOneStub
        .withArgs({ spaces: SPACE_ID })
        .resolves({ side: 'side', role: 'role' })
      temPersistAndFlushStub.reset()

      const spaceService = createSpaceService()
      await spaceService.lockSpace(SPACE_ID)

      expect(spaceRepoFindOneStub.calledOnce).to.be.true
      expect(spaceRepoFindOneStub.firstCall.args[0]).to.deep.equal({ id: SPACE_ID })
      expect(userRepoFindOneStub.calledOnce).to.be.true
      expect(userRepoFindOneStub.firstCall.args[0]).to.deep.equal({ id: USER_ID })
      expect(spaceMembershipRepoFindOneStub.calledOnce).to.be.true
      expect(spaceMembershipRepoFindOneStub.firstCall.args[0]).to.deep.equal({ spaces: SPACE_ID })
      expect(temPersistAndFlushStub.calledOnce).to.be.true
      expect(temPersistAndFlushStub.firstCall.args[0].space).to.equal(space)
      expect(temPersistAndFlushStub.firstCall.args[0].user).to.equal(user)
      expect(temPersistAndFlushStub.firstCall.args[0].entityId).to.equal(SPACE_ID)
      expect(temPersistAndFlushStub.firstCall.args[0].entityType).to.equal('Space')
      expect(temPersistAndFlushStub.firstCall.args[0].activityType).to.equal(
        SPACE_EVENT_ACTIVITY_TYPE.space_locked,
      )
      expect(temPersistAndFlushStub.firstCall.args[0].objectType).to.equal(
        SPACE_EVENT_OBJECT_TYPE.SPACE,
      )
      expect(temPersistAndFlushStub.firstCall.args[0].side).to.equal('side')
      expect(temPersistAndFlushStub.firstCall.args[0].role).to.equal('role')
      expect(temPersistAndFlushStub.firstCall.args[0].data).to.equal(
        JSON.stringify({ name: undefined }),
      )
    })

    it('space not found', async () => {
      userRepoFindOneStub.resolves({ id: USER_ID })
      spaceRepoFindOneStub.resolves(null)
      spaceRepoFindStub.resolves([])

      const spaceService = createSpaceService()
      await expect(spaceService.lockSpace(SPACE_ID)).to.be.rejectedWith(SpaceNotFoundError)
    })

    it('user not found', async () => {
      userRepoFindOneStub.resolves(null)
      spaceRepoFindOneStub.resolves({ id: SPACE_ID })
      spaceRepoFindStub.resolves([])

      const spaceService = createSpaceService()
      await expect(spaceService.lockSpace(SPACE_ID)).to.be.rejectedWith(UserNotFoundError)
    })

    it('permission error', async () => {
      userRepoFindOneStub.resolves({ id: USER_ID, isReviewSpaceAdmin: () => false })
      spaceRepoFindOneStub.resolves({ id: SPACE_ID })
      spaceRepoFindStub.resolves([])

      const spaceService = createSpaceService()
      await expect(spaceService.lockSpace(SPACE_ID)).to.be.rejectedWith(
        PermissionError,
        'Lock operation is not permitted.',
      )
    })
  })

  describe('#unlockSpace', () => {
    it('basic', async () => {
      const user = { id: USER_ID, isReviewSpaceAdmin: () => true }
      const space = {
        id: SPACE_ID,
        state: SPACE_STATE.LOCKED,
        type: SPACE_TYPE.REVIEW,
        isConfidential: () => false,
      }

      referenceStub.withArgs(user).returns(user)
      referenceStub.withArgs(space).returns(space)

      userRepoFindOneStub
        .withArgs(
          { id: USER_ID },
          { populate: ['adminMemberships', 'adminMemberships.adminGroup'] },
        )
        .resolves(user)
      spaceRepoFindOneStub.withArgs({ id: SPACE_ID }).resolves(space)
      spaceRepoFindStub.withArgs({ spaceId: SPACE_ID }).resolves([{ id: CONF_SPACE_ID }])
      spaceMembershipRepoFindOneStub
        .withArgs({ spaces: SPACE_ID })
        .resolves({ side: 'side', role: 'role' })
      temPersistAndFlushStub.reset()

      const spaceService = createSpaceService()
      await spaceService.unlockSpace(SPACE_ID)

      expect(spaceRepoFindOneStub.calledOnce).to.be.true
      expect(spaceRepoFindOneStub.firstCall.args[0]).to.deep.equal({ id: SPACE_ID })
      expect(userRepoFindOneStub.calledOnce).to.be.true
      expect(userRepoFindOneStub.firstCall.args[0]).to.deep.equal({ id: USER_ID })
      expect(spaceMembershipRepoFindOneStub.calledOnce).to.be.true
      expect(spaceMembershipRepoFindOneStub.firstCall.args[0]).to.deep.equal({ spaces: SPACE_ID })
      expect(temPersistAndFlushStub.calledOnce).to.be.true
      expect(temPersistAndFlushStub.firstCall.args[0].space.state).to.equal(SPACE_STATE.ACTIVE)
      expect(temPersistAndFlushStub.firstCall.args[0].user).to.equal(user)
      expect(temPersistAndFlushStub.firstCall.args[0].entityId).to.equal(SPACE_ID)
      expect(temPersistAndFlushStub.firstCall.args[0].entityType).to.equal('Space')
      expect(temPersistAndFlushStub.firstCall.args[0].activityType).to.equal(
        SPACE_EVENT_ACTIVITY_TYPE.space_unlocked,
      )
      expect(temPersistAndFlushStub.firstCall.args[0].objectType).to.equal(
        SPACE_EVENT_OBJECT_TYPE.SPACE,
      )
      expect(temPersistAndFlushStub.firstCall.args[0].side).to.equal('side')
      expect(temPersistAndFlushStub.firstCall.args[0].role).to.equal('role')
      expect(temPersistAndFlushStub.firstCall.args[0].data).to.equal(
        JSON.stringify({ name: undefined }),
      )
    })

    it('space not found', async () => {
      userRepoFindOneStub.resolves({ id: USER_ID })
      spaceRepoFindOneStub.resolves(null)
      spaceRepoFindStub.resolves([])

      const spaceService = createSpaceService()
      await expect(spaceService.unlockSpace(SPACE_ID)).to.be.rejectedWith(SpaceNotFoundError)
    })

    it('user not found', async () => {
      userRepoFindOneStub.resolves(null)
      spaceRepoFindOneStub.resolves({ id: SPACE_ID })
      spaceRepoFindStub.resolves([])

      const spaceService = createSpaceService()
      await expect(spaceService.unlockSpace(SPACE_ID)).to.be.rejectedWith(UserNotFoundError)
    })

    it('permission error', async () => {
      userRepoFindOneStub.resolves({ id: USER_ID, isReviewSpaceAdmin: () => false })
      spaceRepoFindOneStub.resolves({ id: SPACE_ID })
      spaceRepoFindStub.resolves([])

      const spaceService = createSpaceService()
      await expect(spaceService.unlockSpace(SPACE_ID)).to.be.rejectedWith(
        PermissionError,
        'Unlock operation is not permitted.',
      )
    })
  })

  describe('#getSelectableSpace', () => {
    it('basic', async () => {
      spaceRepoFindOneOrFailStub.withArgs({ id: 1 }).resolves({ id: 1 })
      spaceRepoFindStub.withArgs({ spaceId: 1 }).resolves([{ id: 2 }, { id: 3 }])
      spaceRepoFindSpacesByIdAndUserStub
        .withArgs([2, 3, 1], userContext.id)
        .resolves([{ id: 2 }, { id: 3 }])

      const spaceService = createSpaceService()
      const result = await spaceService.getSelectableSpaces(1)

      expect(result).to.deep.equal([{ id: 2 }, { id: 3 }])
    })
  })

  describe('#validateVefificationSpace', () => {
    it('basic', async () => {
      const node = {
        isInSpace: () => true,
        getSpaceId: () => 1,
      } as unknown as Node
      spaceRepoFindOneStub.resolves({ type: SPACE_TYPE.REVIEW })
      const spaceService = createSpaceService()

      await spaceService.validateVerificationSpace(node)

      expect(spaceRepoFindOneStub.calledOnce).to.be.true
      expect(spaceRepoFindOneStub.firstCall.args[0]).to.equal(1)
    })

    it('node not in space', async () => {
      const node = {
        isInSpace: () => false,
        getSpaceId: () => 1,
      } as unknown as Node
      const spaceService = createSpaceService()

      await spaceService.validateVerificationSpace(node)

      expect(spaceRepoFindOneStub.calledOnce).to.be.false
    })

    it('validation fail', async () => {
      const node = {
        name: 'node',
        isInSpace: () => true,
        getSpaceId: () => 1,
      } as unknown as Node
      spaceRepoFindOneStub.resolves({ type: SPACE_TYPE.VERIFICATION, state: SPACE_STATE.LOCKED })
      const spaceService = createSpaceService()

      await expect(spaceService.validateVerificationSpace(node)).to.be.rejectedWith(
        Error,
        `You have no permissions to remove ${node.name} as` +
          ' it is part of Locked Verification space.',
      )
    })
  })
})
