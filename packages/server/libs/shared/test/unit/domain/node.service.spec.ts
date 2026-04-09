import { Reference } from '@mikro-orm/core'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { expect } from 'chai'
import { SinonStub, stub } from 'sinon'
import { Space } from '@shared/domain/space/space.entity'
import { SPACE_STATE } from '@shared/domain/space/space.enum'
import { SpaceRepository } from '@shared/domain/space/space.repository'
import { CAN_EDIT_ROLES } from '@shared/domain/space-membership/space-membership.helper'
import { User } from '@shared/domain/user/user.entity'
import { UserRepository } from '@shared/domain/user/user.repository'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { AssetRepository } from '@shared/domain/user-file/asset.repository'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { FolderService } from '@shared/domain/user-file/folder.service'
import { Node } from '@shared/domain/user-file/node.entity'
import { NodeHelper } from '@shared/domain/user-file/node.helper'
import { NodeRepository } from '@shared/domain/user-file/node.repository'
import { NodeService } from '@shared/domain/user-file/node.service'
import { AssetCountService } from '@shared/domain/user-file/service/asset-count.service'
import { FileCountService } from '@shared/domain/user-file/service/file-count.service'
import { UserFileService } from '@shared/domain/user-file/service/user-file.service'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { nodeQueryFilter } from '@shared/domain/user-file/user-file.input'
import { FILE_STATE_DX, FILE_STATE_PFDA, FILE_STI_TYPE } from '@shared/domain/user-file/user-file.types'
import { STATIC_SCOPE } from '@shared/enums'
import { PermissionError } from '@shared/errors'
import { SCOPE } from '@shared/types/common'

describe('NodeService', () => {
  const emFlushStub = stub()
  const emPersistAndFlushStub = stub()
  const emPopulateStub = stub()
  const nodeRepositoryFindStub = stub()
  const nodeRepositoryFindAccessibleStub = stub()
  const spaceRepositoryFindOneStub = stub()
  const nodeHelperCollectChildrenStub = stub()
  let referenceStub: SinonStub
  const defaultUser = { id: 1, isSiteAdmin: () => false } as unknown as User

  const createNodeService = (user: User): NodeService => {
    const em = {
      flush: emFlushStub,
      persistAndFlush: emPersistAndFlushStub,
      populate: emPopulateStub,
    } as unknown as SqlEntityManager
    const spaceRepository = {
      findOne: spaceRepositoryFindOneStub,
    } as unknown as SpaceRepository
    const nodeRepository = {
      find: nodeRepositoryFindStub,
      findAccessible: nodeRepositoryFindAccessibleStub,
    } as unknown as NodeRepository
    const userFileService = {} as unknown as UserFileService
    const folderService = {} as unknown as FolderService
    const nodeHelper = {
      collectChildren: nodeHelperCollectChildrenStub,
    } as unknown as NodeHelper
    const userRepository = {
      findOne: stub().resolves(user),
    } as unknown as UserRepository
    const userCtx = { id: user.id } as unknown as UserContext
    const fileCountService = {
      count: stub().resolves(0),
    } as unknown as FileCountService
    const assetCountService = {
      count: stub().resolves(0),
    } as unknown as AssetCountService
    const assetRepository = {} as unknown as AssetRepository

    return new NodeService(
      em,
      userCtx,
      userFileService,
      folderService,
      spaceRepository,
      nodeRepository,
      userRepository,
      nodeHelper,
      fileCountService,
      assetCountService,
      assetRepository,
    )
  }

  beforeEach(() => {
    emFlushStub.reset()
    emFlushStub.throws()

    spaceRepositoryFindOneStub.reset()
    spaceRepositoryFindOneStub.throws()

    emPersistAndFlushStub.reset()
    emPersistAndFlushStub.throws()

    nodeRepositoryFindStub.reset()
    nodeRepositoryFindStub.throws()

    emPopulateStub.reset()
    emPopulateStub.throws()

    nodeRepositoryFindAccessibleStub.reset()
    nodeRepositoryFindAccessibleStub.throws()

    nodeHelperCollectChildrenStub.reset()
    nodeHelperCollectChildrenStub.throws()

    referenceStub = stub(Reference, 'create')
    referenceStub.withArgs(defaultUser).returns(defaultUser)
  })

  afterEach(() => {
    referenceStub.restore()
  })

  describe('#markNodesAsRemoving', () => {
    it('basic', async () => {
      const nodes = [
        { id: 1, state: FILE_STATE_DX.CLOSED },
        {
          id: 2,
          state: FILE_STATE_DX.CLOSED,
        },
      ]
      nodeRepositoryFindStub.returns(nodes)
      emFlushStub.reset()
      const nodeService = createNodeService(defaultUser)

      await nodeService.markNodesAsRemoving([1, 2])

      expect(nodeRepositoryFindStub.calledOnce).to.be.true()
      expect(nodeRepositoryFindStub.firstCall.args[0]).to.deep.equal({ id: { $in: [1, 2] } })
      expect(emFlushStub.calledOnce).to.be.true()

      expect(nodes[0].state).to.equal(FILE_STATE_PFDA.REMOVING)
      expect(nodes[1].state).to.equal(FILE_STATE_PFDA.REMOVING)
    })
  })

  describe('#validateEditableBy', () => {
    it('node public', async () => {
      const node = {
        locked: false,
        isPublic: () => true,
        user: { id: 1 },
        isInSpace: () => false,
      } as unknown as Node
      const currentUser = { id: 2, isSiteAdmin: () => false } as unknown as User
      const nodeService = createNodeService(currentUser)

      await nodeService.validateEditableBy(node)
    })

    it('current user node owner', async () => {
      const node = {
        locked: false,
        isPublic: () => false,
        isPrivate: () => true,
        user: { id: 1 },
        isInSpace: () => false,
      } as unknown as Node
      const currentUser = { id: 1, isSiteAdmin: () => false } as unknown as User
      const nodeService = createNodeService(currentUser)

      await nodeService.validateEditableBy(node)
    })

    it('current user is site admin', async () => {
      const node = {
        locked: false,
        isPublic: () => false,
        user: { id: 1 },
        isInSpace: () => false,
      } as unknown as Node
      const currentUser = { id: 2, isSiteAdmin: () => true } as unknown as User
      const nodeService = createNodeService(currentUser)

      await nodeService.validateEditableBy(node)
    })

    it('locked', async () => {
      const node = {
        locked: true,
        isPublic: () => false,
        user: { id: 1 },
        isInSpace: () => false,
      } as unknown as Node
      const currentUser = { id: 2, isSiteAdmin: () => true } as unknown as User
      const nodeService = createNodeService(currentUser)

      await expect(nodeService.validateEditableBy(node)).to.be.rejectedWith(Error, 'Locked items cannot be removed.')
    })

    it('space', async () => {
      const node = {
        locked: false,
        isPublic: () => false,
        user: { id: 1 },
        isInSpace: () => true,
        getSpaceId: () => 1,
      } as unknown as Node
      const currentUser = { id: 2, isSiteAdmin: () => false } as unknown as User
      const space = { id: 1 } as unknown as Space
      spaceRepositoryFindOneStub.resolves(space)
      const nodeService = createNodeService(currentUser)

      await nodeService.validateEditableBy(node)

      expect(spaceRepositoryFindOneStub.calledOnce).to.be.true()
      expect(spaceRepositoryFindOneStub.firstCall.firstArg).to.deep.equal({
        id: space.id,
        state: SPACE_STATE.ACTIVE,
        spaceMemberships: {
          user: { id: currentUser.id },
          role: CAN_EDIT_ROLES,
        },
      })
    })

    it('space error', async () => {
      const node = {
        name: 'node-name',
        locked: false,
        isPublic: () => false,
        user: { id: 1 },
        isInSpace: () => true,
        getSpaceId: () => 1,
      } as unknown as Node
      const currentUser = { id: 2, isSiteAdmin: () => false } as unknown as User
      const space = { id: 1 } as unknown as Space
      spaceRepositoryFindOneStub.resolves(undefined)
      const nodeService = createNodeService(currentUser)

      await expect(nodeService.validateEditableBy(node)).to.be.rejectedWith(
        PermissionError,
        `You have no permissions to remove '${node.name}'.`,
      )

      expect(spaceRepositoryFindOneStub.calledOnce).to.be.true()
      expect(spaceRepositoryFindOneStub.firstCall.firstArg).to.deep.equal({
        id: space.id,
        state: SPACE_STATE.ACTIVE,
        spaceMemberships: {
          user: { id: currentUser.id },
          role: CAN_EDIT_ROLES,
        },
      })
    })
  })

  describe('#getFolderChildren', async () => {
    it('in space', async () => {
      nodeRepositoryFindAccessibleStub.reset()
      const nodeService = createNodeService(defaultUser)
      const scopes: SCOPE[] = ['space-1']
      const parentFolderId = 1

      await nodeService.getFolderChildren({
        scopes,
        folderId: parentFolderId,
        types: [FILE_STI_TYPE.USERFILE],
      })
      expect(nodeRepositoryFindAccessibleStub.calledOnce).to.eq(true)

      const whereClause = nodeRepositoryFindAccessibleStub.firstCall.firstArg
      expect(whereClause.$or).to.have.lengthOf(1)
      expect(whereClause.$or[0].scope).to.eq(scopes[0])
      expect(whereClause.$or[0].scopedParentFolder).to.eq(parentFolderId)
      expect(whereClause.stiType).to.deep.eq({
        $in: [FILE_STI_TYPE.USERFILE],
      })
    })

    it('private', async () => {
      nodeRepositoryFindAccessibleStub.reset()
      const nodeService = createNodeService(defaultUser)

      const scopes: SCOPE[] = ['private']
      const parentFolderId = 2

      await nodeService.getFolderChildren({ scopes, folderId: parentFolderId })

      expect(nodeRepositoryFindAccessibleStub.calledOnce).to.eq(true)

      const whereClause = nodeRepositoryFindAccessibleStub.firstCall.firstArg
      expect(whereClause.$or).to.have.lengthOf(1)
      expect(whereClause.$or[0].scope).to.eq(scopes[0])
      expect(whereClause.$or[0].parentFolder).to.eq(parentFolderId)
      expect(whereClause.$or[0].user).to.eq(defaultUser.id)
    })

    it('multiple scopes', async () => {
      nodeRepositoryFindAccessibleStub.reset()
      const nodeService = createNodeService(defaultUser)

      const scopes: SCOPE[] = ['private', 'space-1', 'space-2']
      const parentFolderId = 3

      await nodeService.getFolderChildren({
        scopes,
        folderId: parentFolderId,
        types: [FILE_STI_TYPE.FOLDER],
      })

      expect(nodeRepositoryFindAccessibleStub.calledOnce).to.eq(true)

      const whereClause = nodeRepositoryFindAccessibleStub.firstCall.firstArg
      expect(whereClause.$or).to.have.lengthOf(3)

      const privateCondition = whereClause.$or[0]
      expect(privateCondition.scope).to.eq('private')
      expect(privateCondition.parentFolder).to.eq(parentFolderId)
      expect(privateCondition.user).to.eq(defaultUser.id)

      const space1Condition = whereClause.$or[1]
      expect(space1Condition.scope).to.eq('space-1')
      expect(space1Condition.scopedParentFolder).to.eq(parentFolderId)
      expect(space1Condition.user).to.be.undefined

      const space2Condition = whereClause.$or[2]
      expect(space2Condition.scope).to.eq('space-2')
      expect(space2Condition.scopedParentFolder).to.eq(parentFolderId)
      expect(space2Condition.user).to.be.undefined

      expect(whereClause.stiType).to.deep.eq({
        $in: [FILE_STI_TYPE.FOLDER],
      })
    })
  })

  describe('#rollbackRemovingState', () => {
    it('basic', async () => {
      const nodes = [
        {
          id: 1,
          stiType: FILE_STI_TYPE.FOLDER,
          state: FILE_STATE_PFDA.REMOVING,
        } as unknown as Node,
        {
          id: 2,
          stiType: FILE_STI_TYPE.USERFILE,
          state: FILE_STATE_PFDA.REMOVING,
        } as unknown as Node,
      ]
      emPersistAndFlushStub.reset()
      const nodeService = createNodeService(defaultUser)

      await nodeService.rollbackRemovingState(nodes)

      expect(emPersistAndFlushStub.calledOnce).to.be.true()
      expect(emPersistAndFlushStub.firstCall.firstArg[0].id).to.eq(nodes[0].id)
      expect(emPersistAndFlushStub.firstCall.firstArg[0].state).to.be.null()
      expect(emPersistAndFlushStub.firstCall.firstArg[1].id).to.eq(nodes[1].id)
      expect(emPersistAndFlushStub.firstCall.firstArg[1].state).to.eq(FILE_STATE_DX.CLOSED)
    })
  })

  describe('#loadNodes', () => {
    it('loadNodes', async () => {
      const nodeService = createNodeService(defaultUser)
      const input = [1, 2]
      const filters = { name: 'file' } as nodeQueryFilter

      // node1
      // folder1
      // - node2
      // - folder2
      //   - node3

      const node1 = new UserFile(defaultUser)
      node1.id = 1
      node1.name = 'node1'
      node1.stiType = FILE_STI_TYPE.USERFILE

      const folder1 = new Folder(defaultUser)
      folder1.id = 2
      folder1.name = 'folder1'
      folder1.scope = STATIC_SCOPE.PUBLIC
      folder1.stiType = FILE_STI_TYPE.FOLDER
      folder1.parentFolder = null

      const node2 = new UserFile(defaultUser)
      node2.id = 3
      node2.name = 'node2'
      node2.stiType = FILE_STI_TYPE.USERFILE
      node2.parentFolderId = folder1.id

      const folder2 = new Folder(defaultUser)
      folder2.id = 4
      folder2.name = 'folder2'
      folder2.scope = 'space-1'
      folder2.stiType = FILE_STI_TYPE.FOLDER
      folder2.scopedParentFolderId = folder1.id

      const node3 = new UserFile(defaultUser)
      node3.id = 5
      node3.name = 'node2'
      node3.stiType = FILE_STI_TYPE.USERFILE
      node3.parentFolderId = folder2.id

      folder1.nonScopedChildren.add(node2)
      folder1.nonScopedChildren.add(folder2)
      folder2.scopedChildren.add(node3)

      const nodes = [node3, node1, folder1, node2, folder2]
      nodeRepositoryFindStub.resolves(nodes)
      emPopulateStub.reset()
      nodeHelperCollectChildrenStub.callsFake(async (parentFolder: Folder, wholeTree: Node[]) => {
        // mimic what collectChildren would normally do, but controlled
        if (parentFolder.id === folder1.id) {
          parentFolder.folderPath = '/'
          for (const child of parentFolder.nonScopedChildren) {
            child.folderPath = `/${parentFolder.name}/`
            wholeTree.push(child)
          }
        }

        if (parentFolder.id === folder2.id) {
          parentFolder.folderPath = `/${folder1.name}/`
          for (const child of parentFolder.scopedChildren) {
            child.folderPath = `/${folder1.name}/${parentFolder.name}/`
            wholeTree.push(child)
          }
        }

        wholeTree.push(parentFolder) // mimic the final push
      })

      const result = await nodeService.loadNodes(input, filters)

      expect(nodeRepositoryFindStub.calledOnce).to.be.true()
      expect(nodeRepositoryFindStub.firstCall.firstArg).to.deep.equal({
        $or: [
          {
            id: { $in: input },
            ...filters,
          },
          {
            scopedParentFolder: { $in: input },
            ...filters,
          },
        ],
      })
      expect(emPopulateStub.calledOnce).to.be.true()
      expect(emPopulateStub.firstCall.firstArg).to.deep.equal(nodes)

      const processedFolder1 = result.find(n => n.id === folder1.id)
      expect(processedFolder1.folderPath).to.eq('/')
      const processedFolder2 = result.find(n => n.id === folder2.id)
      expect(processedFolder2.folderPath).to.eq(`/${folder1.name}/`)

      expect(result[0].id).to.eq(node3.id)
      expect(result[1].id).to.eq(node2.id)
      expect(result[2].id).to.eq(node1.id)
      expect(result[3].id).to.eq(folder2.id)
      expect(result[4].id).to.eq(folder1.id)
    })
  })
})
