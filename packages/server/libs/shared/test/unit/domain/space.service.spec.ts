import { SqlEntityManager } from '@mikro-orm/mysql'
import { GroupsSpaceCreationProcess } from '@shared/domain/space/create/groups-space-creation.process'
import { SpaceCreationProcess } from '@shared/domain/space/create/space-creation.process'
import { CreateSpaceDto } from '@shared/domain/space/dto/create-space.dto'
import { SpaceService } from '@shared/domain/space/service/space.service'
import { SPACE_STATE, SPACE_TYPE } from '@shared/domain/space/space.enum'
import { SpaceRepository } from '@shared/domain/space/space.repository'
import { Node } from '@shared/domain/user-file/node.entity'
import { ServiceError } from '@shared/errors'
import { expect } from 'chai'
import { stub } from 'sinon'

describe('SpaceService', () => {
  const findOneStub = stub()
  const buildStub = stub()

  const createSpaceService = () => {
    const em = {} as unknown as SqlEntityManager
    const spaceRepository = {
      findOne: findOneStub,
    } as unknown as SpaceRepository
    const buildProcess = {
      build: buildStub,
    } as unknown as GroupsSpaceCreationProcess
    const spaceTypeToCreatorProviderMap = {
      [SPACE_TYPE.GROUPS]: buildProcess,
    } as unknown as { [T in SPACE_TYPE]: SpaceCreationProcess }
    return new SpaceService(em, spaceTypeToCreatorProviderMap, spaceRepository)
  }

  beforeEach(async () => {
    findOneStub.reset()
    findOneStub.throws()

    buildStub.reset()
    buildStub.throws()
  })

  describe('#create', () => {
    it('basic', async () => {
      buildStub.resolves()
      const spaceService = createSpaceService()
      const createSpaceDto = {
        name: 'test-space',
        spaceType: SPACE_TYPE.GROUPS,
      } as unknown as CreateSpaceDto

      await spaceService.create(createSpaceDto)

      expect(buildStub.calledOnce).to.be.true
      expect(buildStub.firstCall.args[0]).to.deep.equal(createSpaceDto)
    })

    it('validation fail', async () => {
      buildStub.resolves()
      const spaceService = createSpaceService()
      const createSpaceDto = {
        name: 'test-space',
        spaceType: SPACE_TYPE.REVIEW,
      } as unknown as CreateSpaceDto

      await expect(spaceService.create(createSpaceDto)).to.be.rejectedWith(
        ServiceError,
        `Creation of ${SPACE_TYPE[SPACE_TYPE.REVIEW]} space is not available yet.`,
      )
    })
  })

  describe('#validateVefificationSpace', () => {
    it('basic', async () => {
      const node = {
        isInSpace: () => true,
        getSpaceId: () => 1,
      } as unknown as Node
      findOneStub.resolves({ type: SPACE_TYPE.REVIEW })
      const spaceService = createSpaceService()

      await spaceService.validateVerificationSpace(node)

      expect(findOneStub.calledOnce).to.be.true
      expect(findOneStub.firstCall.args[0]).to.equal(1)
    })

    it('node not in space', async () => {
      const node = {
        isInSpace: () => false,
        getSpaceId: () => 1,
      } as unknown as Node
      const spaceService = createSpaceService()

      await spaceService.validateVerificationSpace(node)

      expect(findOneStub.calledOnce).to.be.false
    })

    it('validation fail', async () => {
      const node = {
        name: 'node',
        isInSpace: () => true,
        getSpaceId: () => 1,
      } as unknown as Node
      findOneStub.resolves({ type: SPACE_TYPE.VERIFICATION, state: SPACE_STATE.LOCKED })
      const spaceService = createSpaceService()

      await expect(spaceService.validateVerificationSpace(node)).to.be.rejectedWith(
        Error,
        `You have no permissions to remove ${node.name} as` +
          ' it is part of Locked Verification space.',
      )
    })
  })
})
