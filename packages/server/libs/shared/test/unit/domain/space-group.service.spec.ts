import { Collection } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { expect } from 'chai'
import sinon, { stub } from 'sinon'
import { CreateSpaceGroupDTO } from '@shared/domain/space/dto/create-space-group.dto'
import { SpaceGroupService } from '@shared/domain/space/service/space-group.service'
import { Space } from '@shared/domain/space/space.entity'
import { SPACE_TYPE } from '@shared/domain/space/space.enum'
import { SpaceRepository } from '@shared/domain/space/space.repository'
import { SpaceGroup } from '@shared/domain/space/space-group.entity'
import { SpaceGroupRepository } from '@shared/domain/space/space-group.repository'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { InvalidRequestError, NotFoundError } from '@shared/errors'

describe('SpaceGroupService', () => {
  const transactionalStub = sinon.stub()
  const createStub = stub()
  const persistAndFlushStub = stub()
  const flushStub = stub()
  const findEditableOneStub = stub()
  const findAccessibleOneStub = stub()
  const findAccessibleStub = stub()
  const spacesFindStub = stub()
  const removeAndFlushStub = stub()

  const em = {
    transactional: transactionalStub,
    persistAndFlush: persistAndFlushStub,
    flush: flushStub,
  } as unknown as SqlEntityManager

  const spaceGroupRepo = {
    create: createStub,
    findAccessibleOne: findAccessibleOneStub,
    findAccessible: findAccessibleStub,
    findEditableOne: findEditableOneStub,
    removeAndFlush: removeAndFlushStub,
  } as unknown as SpaceGroupRepository

  const spaceRepo = {
    find: spacesFindStub,
  } as unknown as SpaceRepository

  const getUserContext: (isSiteAdminVal: boolean, isSpaceAdmin: boolean) => UserContext = (
    isSiteAdminVal: boolean,
    isSpaceAdmin: boolean,
  ) => {
    return {
      id: 1,
      dxuser: 'dxuser',
      loadEntity: () => {
        return {
          id: 1,
          dxuser: 'dxuser',
          isSiteAdmin: (): boolean => isSiteAdminVal,
          isReviewSpaceAdmin: (): boolean => isSpaceAdmin,
        }
      },
    } as unknown as UserContext
  }

  const createSpaceGroupDto: CreateSpaceGroupDTO = {
    name: 'Space Group name',
    description: 'Space Group description',
  }

  const editedSpaceGroupDTO: CreateSpaceGroupDTO = {
    name: 'Edited Space Group name',
    description: 'Edited Space Group description',
  }

  beforeEach(() => {
    transactionalStub.callsFake(async callback => {
      return callback(em)
    })

    createStub.reset()
    createStub.throws()

    flushStub.reset()
    flushStub.throws()

    findAccessibleOneStub.reset()
    findAccessibleOneStub.throws()

    findAccessibleStub.reset()
    findAccessibleStub.throws()

    findEditableOneStub.reset()
    findEditableOneStub.throws()

    spacesFindStub.reset()
    spacesFindStub.throws()

    removeAndFlushStub.reset()
    removeAndFlushStub.throws()
  })

  describe('#getById', async () => {
    beforeEach(() => {
      findAccessibleOneStub.reset()
      findAccessibleOneStub.withArgs({ id: 123 }).resolves({
        id: 123,
        name: createSpaceGroupDto.name,
        description: createSpaceGroupDto.description,
        spaces: [],
      })
    })

    it('found', async () => {
      const service = getInstance(false, false)

      const spaceGroup = await service.getById(123)

      expect(spaceGroup.id).to.be.equal(123)
      expect(spaceGroup.name).to.be.equal(createSpaceGroupDto.name)
      expect(spaceGroup.description).to.be.equal(createSpaceGroupDto.description)
    })

    it('not found', async () => {
      const service = getInstance(false, false)

      await expect(service.getById(124)).to.be.rejectedWith(NotFoundError, 'Space group with id 124 was not found')

      expect(createStub.notCalled).to.be.true()
    })
  })

  describe('#list', async () => {
    beforeEach(() => {
      findAccessibleStub.reset()
    })

    it('non empty', async () => {
      findAccessibleStub.resolves([
        {
          id: 123,
          name: createSpaceGroupDto.name,
          description: createSpaceGroupDto.description,
          spaces: [],
        },
        {
          id: 124,
          name: 'Other space group',
          description: 'Other space group description',
          spaces: [
            {
              id: 42,
              name: 'Space 1',
              type: SPACE_TYPE.GROUPS.toString().toLowerCase(),
              spaceMemberships: [
                {
                  active: true,
                  user: {
                    id: 2,
                  },
                },
                {
                  active: true,
                  user: {
                    id: 1,
                  },
                },
              ],
            },
          ],
        },
      ])

      const service = getInstance(false, false)

      const spaceGroups = await service.list()

      expect(spaceGroups.length).to.be.equal(2)
      expect(spaceGroups[0].name).to.be.equal(createSpaceGroupDto.name)
      expect(spaceGroups[0].description).to.be.equal(createSpaceGroupDto.description)
      expect(spaceGroups[0].spaces.length).to.be.equal(0)
      expect(spaceGroups[1].name).to.be.equal('Other space group')
      expect(spaceGroups[1].description).to.be.equal('Other space group description')
      expect(spaceGroups[1].spaces.length).to.be.equal(1)
      expect(spaceGroups[1].spaces[0].name).to.be.equal('Space 1')
      expect(spaceGroups[1].spaces[0].isActiveMember).to.be.equal(true)
    })

    it('empty', async () => {
      findAccessibleStub.resolves([])

      const service = getInstance(false, false)

      const spaceGroups = await service.list()

      expect(spaceGroups.length).to.be.equal(0)
    })
  })

  describe('#create', async () => {
    beforeEach(() => {
      createStub.reset()
      createStub.returns({
        id: 123,
        name: createSpaceGroupDto.name,
        description: createSpaceGroupDto.description,
      })
    })

    it('called by site admin', async () => {
      const service = getInstance(true, false)

      const createdSpaceGroup = await service.create(createSpaceGroupDto)

      expect(createStub.calledWith({ ...createSpaceGroupDto }))
      expect(createdSpaceGroup).equal(123)
    })

    it('called by space admin', async () => {
      const service = getInstance(false, true)

      const createdSpaceGroup = await service.create(createSpaceGroupDto)

      expect(createStub.calledWith({ ...createSpaceGroupDto }))
      expect(createdSpaceGroup).equal(123)
    })
  })

  describe('#update', async () => {
    const spaceGroup = new SpaceGroup()
    beforeEach(() => {
      spaceGroup.id = 123
      spaceGroup.name = 'old name'
      spaceGroup.description = 'old desc'

      findEditableOneStub.reset()
      findEditableOneStub.withArgs({ id: 123 }).resolves(spaceGroup)

      flushStub.reset()
      flushStub.resolves()
    })

    it('called by regular user (not allowed)', async () => {
      findEditableOneStub.reset()
      findEditableOneStub.withArgs({ id: 123 }).resolves(null)
      const service = getInstance(false, false)

      await expect(service.update(123, editedSpaceGroupDTO)).to.be.rejectedWith(
        NotFoundError,
        'Space group 123 not found',
      )

      expect(findEditableOneStub.calledOnce).to.be.true()
    })

    it('called by site admin', async () => {
      const service = getInstance(true, false)

      await service.update(123, editedSpaceGroupDTO)

      expect(findEditableOneStub.calledOnce).to.be.true()
      expect(findEditableOneStub.calledOnceWithExactly({ id: 123 })).to.be.true()

      expect(spaceGroup.name).equal(editedSpaceGroupDTO.name)
      expect(spaceGroup.description).equal(editedSpaceGroupDTO.description)
    })

    it('called by site admin, space group does not exist', async () => {
      const service = getInstance(true, false)

      await expect(service.update(124, editedSpaceGroupDTO)).to.be.rejectedWith(
        NotFoundError,
        'Space group 124 not found',
      )

      expect(findEditableOneStub.calledOnce).to.be.true()
      expect(findEditableOneStub.calledOnceWithExactly({ id: 124 })).to.be.true()
    })

    it('called by space admin', async () => {
      const service = getInstance(false, true)

      await service.update(123, editedSpaceGroupDTO)

      expect(findEditableOneStub.calledOnce).to.be.true()
      expect(findEditableOneStub.calledOnceWithExactly({ id: 123 })).to.be.true()

      expect(spaceGroup.name).equal(editedSpaceGroupDTO.name)
      expect(spaceGroup.description).equal(editedSpaceGroupDTO.description)
    })
  })

  describe('#delete', async () => {
    const spaceGroup = new SpaceGroup()
    beforeEach(() => {
      spaceGroup.id = 123
      spaceGroup.name = 'old name'
      spaceGroup.description = 'old desc'

      findEditableOneStub.reset()
      findEditableOneStub.withArgs({ id: 123 }).resolves(spaceGroup)

      flushStub.reset()
      flushStub.resolves()
      removeAndFlushStub.reset()
      removeAndFlushStub.resolves()
    })

    it('called by site admin', async () => {
      const service = getInstance(true, false)

      await service.delete(123)

      expect(findEditableOneStub.calledOnce).to.be.true()
      expect(findEditableOneStub.calledOnceWithExactly({ id: 123 })).to.be.true()
      expect(removeAndFlushStub.calledOnce).to.be.true()
    })

    it('called by site admin, space group does not exist', async () => {
      const service = getInstance(true, false)

      await expect(service.delete(124)).to.be.rejectedWith(NotFoundError, 'Space group 124 not found')

      expect(findEditableOneStub.calledOnce).to.be.true()
      expect(findEditableOneStub.calledOnceWithExactly({ id: 124 })).to.be.true()
      expect(removeAndFlushStub.notCalled).to.be.true()
    })

    it('called by space admin', async () => {
      const service = getInstance(false, true)

      await service.delete(123)

      expect(findEditableOneStub.calledOnce).to.be.true()
      expect(findEditableOneStub.calledOnceWithExactly({ id: 123 })).to.be.true()
      expect(removeAndFlushStub.calledOnce).to.be.true()
    })
  })

  describe('#addSpaces', async () => {
    const testedSpaceGroup = new SpaceGroup()
    testedSpaceGroup.id = 123
    testedSpaceGroup.name = createSpaceGroupDto.name
    testedSpaceGroup.description = createSpaceGroupDto.description
    testedSpaceGroup.spaces = new Collection<Space>(testedSpaceGroup)

    const spaceGov = new Space()
    spaceGov.id = 42
    spaceGov.type = SPACE_TYPE.GOVERNMENT

    const spaceRev = new Space()
    spaceRev.id = 43
    spaceRev.type = SPACE_TYPE.REVIEW

    const spaceGroup = new Space()
    spaceGroup.id = 44
    spaceGroup.type = SPACE_TYPE.GROUPS

    const spacePrivate = new Space()
    spacePrivate.id = 666
    spacePrivate.type = SPACE_TYPE.PRIVATE_TYPE

    beforeEach(() => {
      flushStub.reset()
      flushStub.resolves()
      findEditableOneStub.reset()
      spacesFindStub.resolves(null)
      findEditableOneStub.withArgs({ id: 123 }).resolves(testedSpaceGroup)
      spacesFindStub.withArgs({ id: { $in: [42, 43] } }).resolves([spaceRev, spaceGov])
      spacesFindStub.withArgs({ id: { $in: [42, 43, 44] } }).resolves([spaceRev, spaceGov, spaceGroup])
      spacesFindStub.withArgs({ id: { $in: [42, 666] } }).resolves([spaceRev, spacePrivate])
    })

    it('called by site admin with no space ids', async () => {
      const service = getInstance(true, false)

      await expect(service.addSpaces(1, [])).to.be.rejectedWith(InvalidRequestError, 'No spaces specified')

      expect(findEditableOneStub.notCalled).to.be.true()
    })

    it('called by site admin with incorrect space group id', async () => {
      const service = getInstance(true, false)

      await expect(service.addSpaces(666, [12])).to.be.rejectedWith(NotFoundError, 'Space group 666 not found')

      expect(findEditableOneStub.calledOnce).to.be.true()
    })

    it('called by site admin with non existing spaces', async () => {
      const service = getInstance(true, false)

      await expect(service.addSpaces(123, [404])).to.be.rejectedWith(
        NotFoundError,
        'Some of the selected spaces were not found',
      )

      expect(findEditableOneStub.calledOnce).to.be.true()
    })

    it('called by site admin with invalid spaces', async () => {
      const service = getInstance(true, false)

      await expect(service.addSpaces(123, [42, 666])).to.be.rejectedWith(
        InvalidRequestError,
        'Only group, review and government spaces can be added to a space group',
      )

      expect(findEditableOneStub.calledOnce).to.be.true()
    })

    it('called by site admin', async () => {
      const service = getInstance(true, false)

      await service.addSpaces(123, [42, 43])

      expect(findEditableOneStub.calledOnce).to.be.true()
      expect(testedSpaceGroup.spaces.length).to.be.equal(2)

      await service.addSpaces(123, [42, 43, 44])
      expect(findEditableOneStub.calledTwice).to.be.true()
      expect(testedSpaceGroup.spaces.length).to.be.equal(3)
    })

    it('called by space admin', async () => {
      const service = getInstance(false, true)

      await service.addSpaces(123, [42, 43])

      expect(findEditableOneStub.calledOnce).to.be.true()
    })
  })

  describe('#removeSpaces', async () => {
    const spaceGov = new Space()
    spaceGov.id = 42
    spaceGov.type = SPACE_TYPE.GOVERNMENT

    const spaceRev = new Space()
    spaceRev.id = 43
    spaceRev.type = SPACE_TYPE.REVIEW

    const groupSpace = new Space()
    groupSpace.id = 44
    groupSpace.type = SPACE_TYPE.GROUPS

    const spacePrivate = new Space()
    spacePrivate.id = 666
    spacePrivate.type = SPACE_TYPE.PRIVATE_TYPE

    const testedSpaceGroup = new SpaceGroup()
    testedSpaceGroup.id = 123
    testedSpaceGroup.name = createSpaceGroupDto.name
    testedSpaceGroup.description = createSpaceGroupDto.description

    beforeEach(() => {
      testedSpaceGroup.spaces = new Collection<Space>(testedSpaceGroup, [spaceGov, spaceRev, groupSpace])
      flushStub.reset()
      flushStub.resolves()
      findEditableOneStub.reset()
      findEditableOneStub.withArgs({ id: 123 }).resolves(testedSpaceGroup)
      spacesFindStub.reset()
      spacesFindStub.resolves(null)
      spacesFindStub.withArgs({ id: { $in: [42, 43] } }).resolves([spaceRev, spaceGov])
      spacesFindStub.withArgs({ id: { $in: [42, 43, 44] } }).resolves([spaceRev, spaceGov, groupSpace])
      spacesFindStub.withArgs({ id: { $in: [42, 666] } }).resolves([spaceRev, spacePrivate])
      spacesFindStub.withArgs({ id: { $in: [42] } }).resolves([spaceRev])
      spacesFindStub.withArgs({ id: { $in: [43] } }).resolves([spaceGov])
      spacesFindStub.withArgs({ id: { $in: [44] } }).resolves([groupSpace])
    })

    it('called by site admin with incorrect space group id', async () => {
      const service = getInstance(true, false)

      await expect(service.removeSpaces(666, [12])).to.be.rejectedWith(NotFoundError, 'Space group 666 not found')

      expect(findEditableOneStub.calledOnce).to.be.true()
    })

    it('called by site admin with non existing spaces', async () => {
      const service = getInstance(true, false)

      await expect(service.removeSpaces(123, [404])).to.be.rejectedWith(NotFoundError, 'None of the spaces was found')

      expect(findEditableOneStub.calledOnce).to.be.true()
    })

    it('called by site admin with space which was never part of the group', async () => {
      const service = getInstance(true, false)

      expect(testedSpaceGroup.spaces.length).to.be.equal(3)
      await service.removeSpaces(123, [42, 666])

      expect(findEditableOneStub.calledOnce).to.be.true()
      expect(testedSpaceGroup.spaces.length).to.be.equal(2)
    })

    it('called by site admin', async () => {
      const service = getInstance(true, false)

      expect(testedSpaceGroup.spaces.length).to.be.equal(3)
      await service.removeSpaces(123, [42, 43, 44])

      expect(findEditableOneStub.calledOnce).to.be.true()
      expect(testedSpaceGroup.spaces.length).to.be.equal(0)
    })

    it('called by space admin', async () => {
      const service = getInstance(false, true)

      expect(testedSpaceGroup.spaces.length).to.be.equal(3)
      await service.removeSpaces(123, [42])
      expect(findEditableOneStub.calledOnce).to.be.true()
      expect(testedSpaceGroup.spaces.length).to.be.equal(2)
      // Try to remove the same one -> nothing really happens
      await service.removeSpaces(123, [42])
      expect(findEditableOneStub.calledTwice).to.be.true()
      expect(testedSpaceGroup.spaces.length).to.be.equal(2)
      await service.removeSpaces(123, [43])
      expect(findEditableOneStub.calledThrice).to.be.true()
      expect(testedSpaceGroup.spaces.length).to.be.equal(1)
      await service.removeSpaces(123, [44])
      expect(testedSpaceGroup.spaces.length).to.be.equal(0)
    })
  })

  function getInstance(isSiteAdmin: boolean, isSpaceAdmin: boolean): SpaceGroupService {
    return new SpaceGroupService(em, getUserContext(isSiteAdmin, isSpaceAdmin), spaceGroupRepo, spaceRepo)
  }
})
