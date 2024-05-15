import { expect } from 'chai'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { database } from '@shared/database'
import { db, create } from '@shared/test'
import { User } from '@shared/domain/user/user.entity'
import { Space } from '@shared/domain/space/space.entity'
import { mocksReset } from '@shared/test/mocks'
import { mocksReset as localMocksReset } from '@worker-test/utils/mocks'
import { STATIC_SCOPE } from '@shared/enums'
import { SPACE_TYPE } from '@shared/domain/space/space.enum'
import { spaceMembership } from '@shared/test/generate'
import { SPACE_MEMBERSHIP_ROLE } from '@shared/domain/space-membership/space-membership.enum'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { UserFileResolverFacade } from 'apps/api/src/facade/user-file/user-file-resolver.facade'

describe('UserFileResolverFacade', () => {
  let em: SqlEntityManager
  let user1: User
  let user2: User
  let publicUser: User
  let spaceUser1: Space
  let spaceUser2: Space
  let sharedSpace: Space

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork({ useContext: true }) as SqlEntityManager
    user1 = create.userHelper.create(em)
    user2 = create.userHelper.create(em)
    publicUser = create.userHelper.create(em)
    await em.flush()

    spaceUser1 = create.spacesHelper.create(em, { type: SPACE_TYPE.PRIVATE_TYPE })
    create.spacesHelper.addMember(em, { user: user1, space: spaceUser1 })
    spaceUser2 = create.spacesHelper.create(em, { type: SPACE_TYPE.PRIVATE_TYPE })
    create.spacesHelper.addMember(em, { user: user2, space: spaceUser2 })
    sharedSpace = create.spacesHelper.create(em, { type: SPACE_TYPE.REVIEW })
    create.spacesHelper.addMember(em, { user: user1, space: sharedSpace })
    create.spacesHelper.addMember(em, { user: user2, space: sharedSpace })
    await em.flush()
  })

  beforeEach(async () => {
    mocksReset()
    localMocksReset()
  })

  it('test root path', async () => {
    const rootInput = await getInstance(user1).resolvePath({
      path: '/',
      scope: STATIC_SCOPE.PRIVATE,
      type: undefined,
    })
    expect(rootInput).deep.equal({ path: '/', scope: STATIC_SCOPE.PRIVATE, nodes: [] })

    const rootInput2 = await getInstance(user1).resolvePath({
      path: '/',
      scope: STATIC_SCOPE.PRIVATE,
      type: undefined,
    })
    expect(rootInput2).deep.equal({ path: '/', scope: STATIC_SCOPE.PRIVATE, nodes: [] })
  })

  it('test invalid path', async () => {
    const folder = await create.filesHelper.createFolder(
      em,
      { user: user1 },
      { name: 'invalid_folder' },
    )
    const file = await create.filesHelper.create(
      em,
      { user: user1, parentFolder: folder },
      { name: 'invalid_file' },
    )
    await em.flush()

    const res = await getInstance(user1).resolvePath({
      path: '/invaliddddd_folder/invalid_file',
      scope: STATIC_SCOPE.PRIVATE,
      type: undefined,
    })
    expect(res.nodes.length).to.equal(0)

    const valid = await getInstance(user1).resolvePath({
      path: '/invalid_folder/invalid_file',
      scope: STATIC_SCOPE.PRIVATE,
      type: undefined,
    })
    expect(valid.nodes.length).to.equal(1)
    expect(valid.nodes[0]).to.have.property('id', file.id)
  })

  context('in private scope', () => {
    it('test querying file(s) and folder(s)', async () => {
      const folder1 = await create.filesHelper.createFolder(
        em,
        { user: user1 },
        { name: 'folder1' },
      )
      const folder2 = await create.filesHelper.createFolder(
        em,
        { user: user1, parentFolder: folder1 },
        { name: 'folder2' },
      )
      const rootFile = await create.filesHelper.create(em, { user: user1 }, { name: 'rootFile' })
      const file1 = await create.filesHelper.create(
        em,
        { user: user1, parentFolder: folder1 },
        { name: 'file1' },
      )
      const file2 = await create.filesHelper.create(
        em,
        { user: user1, parentFolder: folder2 },
        { name: 'file2' },
      )
      const folder1User2 = await create.filesHelper.createFolder(
        em,
        { user: user2 },
        { name: 'folder1' },
      )
      const folder2User2 = await create.filesHelper.createFolder(
        em,
        { user: user2, parentFolder: folder1User2 },
        { name: 'folder2' },
      )
      const file1User2 = await create.filesHelper.create(
        em,
        { user: user2, parentFolder: folder1User2 },
        { name: 'file1' },
      )
      const fileUser2 = await create.filesHelper.create(em, { user: user2 }, { name: 'fileeeeee' })
      await em.flush()

      const folder1Res = await getInstance(user1).resolvePath({
        path: '/folder1',
        scope: STATIC_SCOPE.PRIVATE,
        type: null,
      })
      expect(folder1Res.nodes[0]).to.have.property('id', folder1.id)
      const folder2Res = await getInstance(user1).resolvePath({
        path: '/folder1/folder2',
        scope: STATIC_SCOPE.PRIVATE,
        type: null,
      })
      expect(folder2Res.nodes[0]).to.have.property('id', folder2.id)
      const file1Res = await getInstance(user1).resolvePath({
        path: '/folder1/file1',
        scope: STATIC_SCOPE.PRIVATE,
        type: null,
      })
      expect(file1Res.nodes[0]).to.have.property('id', file1.id)
      const file2Res = await getInstance(user1).resolvePath({
        path: '/folder1/folder2/file2',
        scope: STATIC_SCOPE.PRIVATE,
        type: null,
      })
      expect(file2Res.nodes[0]).to.have.property('id', file2.id)
      const rootFileRes = await getInstance(user1).resolvePath({
        path: '/rootFile',
        scope: STATIC_SCOPE.PRIVATE,
        type: null,
      })
      expect(rootFileRes.nodes[0]).to.have.property('id', rootFile.id)

      const folder1User2Res = await getInstance(user2).resolvePath({
        path: '/folder1',
        scope: STATIC_SCOPE.PRIVATE,
        type: null,
      })
      expect(folder1User2Res.nodes[0]).to.have.property('id', folder1User2.id)
      const folder2User2Res = await getInstance(user2).resolvePath({
        path: '/folder1/folder2',
        scope: STATIC_SCOPE.PRIVATE,
        type: null,
      })
      expect(folder2User2Res.nodes[0]).to.have.property('id', folder2User2.id)
      const file1User2Res = await getInstance(user2).resolvePath({
        path: '/folder1/file1',
        scope: STATIC_SCOPE.PRIVATE,
        type: null,
      })
      expect(file1User2Res.nodes[0]).to.have.property('id', file1User2.id)
      const fileUser2Res = await getInstance(user2).resolvePath({
        path: '/fileeeeee',
        scope: STATIC_SCOPE.PRIVATE,
        type: null,
      })
      expect(fileUser2Res.nodes[0]).to.have.property('id', fileUser2.id)

      const nonExistingFileRes = await getInstance(user1).resolvePath({
        path: '/fileeeeee',
        scope: STATIC_SCOPE.PRIVATE,
        type: null,
      })
      expect(nonExistingFileRes.nodes.length).to.equal(0)
    })

    it('test querying file(s) and folder(s) in the same path', async () => {
      const folder = await create.filesHelper.createFolder(
        em,
        { user: user1 },
        { name: 'test_conflicting_path' },
      )
      const file = await create.filesHelper.create(
        em,
        { user: user1 },
        { name: 'test_conflicting_path' },
      )
      await em.flush()

      const res = await getInstance(user1).resolvePath({
        path: '/test_conflicting_path',
        scope: STATIC_SCOPE.PRIVATE,
        type: null,
      })
      expect(res.nodes.length).to.equal(2)
      const folderRes = await getInstance(user1).resolvePath({
        path: '/test_conflicting_path',
        scope: STATIC_SCOPE.PRIVATE,
        type: 'folder',
      })
      expect(folderRes.nodes[0]).to.have.property('id', folder.id)
      const fileRes = await getInstance(user1).resolvePath({
        path: '/test_conflicting_path',
        scope: STATIC_SCOPE.PRIVATE,
        type: 'file',
      })
      expect(fileRes.nodes[0]).to.have.property('id', file.id)
    })

    it('test path contains space', async () => {
      const folder = await create.filesHelper.createFolder(
        em,
        { user: user1 },
        { name: 'test space' },
      )
      await em.flush()

      const res = await getInstance(user1).resolvePath({
        path: '/test space',
        scope: STATIC_SCOPE.PRIVATE,
        type: null,
      })
      expect(res.nodes.length).to.equal(1)
    })

    it('test slashes in path', async () => {
      const folder = create.filesHelper.createFolder(em, { user: user1 }, { name: 'slash' })
      await em.flush()

      const res = await getInstance(user1).resolvePath({
        path: '/slash/',
        scope: STATIC_SCOPE.PRIVATE,
        type: null,
      })
      expect(res.nodes[0]).to.have.property('id', folder.id)
      const res2 = await getInstance(user1).resolvePath({
        path: '//slash//',
        scope: STATIC_SCOPE.PRIVATE,
        type: null,
      })
      expect(res2.nodes[0]).to.have.property('id', folder.id)
      const res3 = await getInstance(user1).resolvePath({
        path: 'slash',
        scope: STATIC_SCOPE.PRIVATE,
        type: null,
      })
      expect(res3.nodes[0]).to.have.property('id', folder.id)
    })
  })

  context('in private space', () => {
    it('test space permission', async () => {
      await create.filesHelper.createFolder(
        em,
        { user: user1 },
        { name: 'user1_space_folder', scope: `space-${spaceUser1.id}` },
      )

      const res = getInstance(user2).resolvePath({
        path: '/user1_space_folder',
        scope: `space-${spaceUser1.id}`,
        type: null,
      })
      expect(res).to.be.rejectedWith('User is not a member of the scope')
    })

    it('test querying file(s) and folder(s)', async () => {
      const spaceFolderUser1 = await create.filesHelper.createFolder(
        em,
        { user: user1 },
        { name: 'space_folder1', scope: `space-${spaceUser1.id}` },
      )
      const spaceFileUser1 = await create.filesHelper.create(
        em,
        { user: user1, parentFolder: spaceFolderUser1 },
        { name: 'space_file1', scope: `space-${spaceUser1.id}` },
      )
      const spaceFolderUser2 = await create.filesHelper.createFolder(
        em,
        { user: user2 },
        { name: 'space_folder1', scope: `space-${spaceUser2.id}` },
      )
      const spaceFileUser2 = await create.filesHelper.create(
        em,
        { user: user2, parentFolder: spaceFolderUser2 },
        { name: 'space_file1', scope: `space-${spaceUser2.id}` },
      )
      await em.flush()

      const user1Res = await getInstance(user1).resolvePath({
        path: '/space_folder1',
        scope: `space-${spaceUser1.id}`,
        type: null,
      })
      expect(user1Res.nodes[0]).to.have.property('id', spaceFolderUser1.id)
      const user1FileRes = await getInstance(user1).resolvePath({
        path: '/space_folder1/space_file1',
        scope: `space-${spaceUser1.id}`,
        type: null,
      })
      expect(user1FileRes.nodes[0]).to.have.property('id', spaceFileUser1.id)
      const user2Res = await getInstance(user2).resolvePath({
        path: '/space_folder1',
        scope: `space-${spaceUser2.id}`,
        type: null,
      })
      expect(user2Res.nodes[0]).to.have.property('id', spaceFolderUser2.id)
      const user2FileRes = await getInstance(user2).resolvePath({
        path: '/space_folder1/space_file1',
        scope: `space-${spaceUser2.id}`,
        type: null,
      })
      expect(user2FileRes.nodes[0]).to.have.property('id', spaceFileUser2.id)
    })
  })

  context('in shared space', () => {
    it('test querying file(s) and folder(s)', async () => {
      const sharedFile1 = await create.filesHelper.create(
        em,
        { user: user1 },
        { name: 'shared_file1', scope: `space-${sharedSpace.id}` },
      )
      const sharedFile2 = await create.filesHelper.create(
        em,
        { user: user2 },
        { name: 'shared_file2', scope: `space-${sharedSpace.id}` },
      )

      const res1 = await getInstance(user1).resolvePath({
        path: '/shared_file2',
        scope: `space-${sharedSpace.id}`,
        type: null,
      })
      expect(res1.nodes[0]).to.have.property('id', sharedFile2.id)
      const res2 = await getInstance(user2).resolvePath({
        path: '/shared_file1',
        scope: `space-${sharedSpace.id}`,
        type: null,
      })
      expect(res2.nodes[0]).to.have.property('id', sharedFile1.id)
      const resUser1 = await getInstance(user1).resolvePath({
        path: '/shared_file1',
        scope: `space-${sharedSpace.id}`,
        type: null,
      })
      expect(resUser1.nodes[0]).to.have.property('id', sharedFile1.id)
    })

    it('test viewer', async () => {
      const user3 = create.userHelper.create(em)
      await em.flush()
      create.spacesHelper.addMember(
        em,
        { user: user3, space: sharedSpace },
        {
          ...spaceMembership.simple(),
          role: SPACE_MEMBERSHIP_ROLE.VIEWER,
          active: true,
        },
      )
      const sharedFile = await create.filesHelper.create(
        em,
        { user: user1 },
        { name: 'shared_file', scope: `space-${sharedSpace.id}` },
      )
      await em.flush()
      const res = await getInstance(user3).resolvePath({
        path: '/shared_file',
        scope: `space-${sharedSpace.id}`,
        type: null,
      })
      expect(res.nodes[0]).to.have.property('id', sharedFile.id)
    })
  })

  context('in public scope', () => {
    it('test querying file(s) and folder(s)', async () => {
      const publicFolder = await create.filesHelper.createFolder(
        em,
        { user: publicUser },
        { name: 'public_folder', scope: STATIC_SCOPE.PUBLIC },
      )
      const publicChildFolder = await create.filesHelper.createFolder(
        em,
        { user: publicUser, parentFolder: publicFolder },
        { name: 'public_child_folder', scope: STATIC_SCOPE.PUBLIC },
      )
      const publicFile = await create.filesHelper.create(
        em,
        { user: publicUser },
        { name: 'public_file', scope: STATIC_SCOPE.PUBLIC },
      )
      const publicChildFile = await create.filesHelper.create(
        em,
        { user: publicUser, parentFolder: publicFolder },
        { name: 'public_child_file', scope: STATIC_SCOPE.PUBLIC },
      )
      await em.flush()

      const resFolder = await getInstance(user1).resolvePath({
        path: '/public_folder',
        scope: STATIC_SCOPE.PUBLIC,
        type: null,
      })
      expect(resFolder.nodes[0]).to.have.property('id', publicFolder.id)
      const resFile = await getInstance(user1).resolvePath({
        path: '/public_file',
        scope: STATIC_SCOPE.PUBLIC,
        type: null,
      })
      expect(resFile.nodes[0]).to.have.property('id', publicFile.id)
      const resChildFolder = await getInstance(user1).resolvePath({
        path: '/public_folder/public_child_folder',
        scope: STATIC_SCOPE.PUBLIC,
        type: null,
      })
      expect(resChildFolder.nodes[0]).to.have.property('id', publicChildFolder.id)
      const resChildFile = await getInstance(user1).resolvePath({
        path: '/public_folder/public_child_file',
        scope: STATIC_SCOPE.PUBLIC,
        type: null,
      })
      expect(resChildFile.nodes[0]).to.have.property('id', publicChildFile.id)
      const resChildFile2 = await getInstance(user2).resolvePath({
        path: '/public_folder/public_child_file',
        scope: STATIC_SCOPE.PUBLIC,
        type: null,
      })
      expect(resChildFile2.nodes[0]).to.have.property('id', publicChildFile.id)
    })
  })

  function getInstance(user: User) {
    const userCtx = { id: user.id, dxuser: user.dxuser } as unknown as UserContext
    return new UserFileResolverFacade(em, userCtx)
  }
})
