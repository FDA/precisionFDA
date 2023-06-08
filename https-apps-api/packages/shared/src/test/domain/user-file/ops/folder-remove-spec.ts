import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { expect } from 'chai'
import pino from 'pino'
import { fakes, mocksReset } from '../../../mocks'
import { Tag, User, Event, userFile, Folder } from '../../../../domain'
import { mocksReset as localMocksReset } from '../../../../../../worker/test/utils/mocks'
import { create, db } from 'shared/src/test'
import { database, getLogger, types } from '@pfda/https-apps-shared'
import { SPACE_STATE, SPACE_TYPE } from 'shared/src/domain/space/space.enum'
import { SPACE_MEMBERSHIP_ROLE } from 'shared/src/domain/space-membership/space-membership.enum'
import { FILE_ORIGIN_TYPE } from 'shared/src/domain/user-file/user-file.enum'

describe('remove folder tests', () => {
  let em: EntityManager<MySqlDriver>
  let user: User
  let log: pino.Logger
  let userCtx: types.UserCtx

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em
    user = create.userHelper.create(em)
    log = getLogger()
    await em.flush()
    userCtx = { ...user, accessToken: 'foo' }

    mocksReset()
    localMocksReset()
  })

  it('test remove folder', async () => {
    const folder1 = create.filesHelper.createFolder(em, { user }, { name: 'folder1' })
    const folder2 = create.filesHelper.createFolder(em, { user }, { name: 'folder2' })

    const tagAaa = create.tagsHelper.create(em, { name: 'aaa' })
    const tagBbb = create.tagsHelper.create(em, { name: 'bbb' })
    await em.flush()
    create.tagsHelper.createTagging(em, { tag: tagAaa }, { taggableId: folder1.id })
    create.tagsHelper.createTagging(em, { tag: tagAaa }, { taggableId: folder2.id })
    create.tagsHelper.createTagging(em, { tag: tagBbb }, { taggableId: folder1.id })
    await em.flush()

    const op = new userFile.FolderRemoveOperation({
      em: database.orm().em.fork(),
      log,
      user: userCtx,
    })

    await op.execute({ id: folder1.id })
    em.clear()

    const loadedFolder1 = await em.findOne(Folder, { id: folder1.id })
    expect(loadedFolder1).to.equal(null)

    const loadedTagAaa = await em.findOneOrFail(Tag, { id: tagAaa.id })
    expect(loadedTagAaa.taggingCount).to.equal(1)

    const loadedTagBbb = await em.findOne(Tag, { id: tagBbb.id })
    expect(loadedTagBbb).to.equal(null)

    const loadedFolderEvent = await em.findOneOrFail(Event, { id: 1 })
    expect(loadedFolderEvent.type).to.equal('Event::FolderDeleted')
    expect(loadedFolderEvent.param2).to.equal(null)
    expect(loadedFolderEvent.data).to.equal(`{"id":${folder1.id.toString()},"scope":`
      + `"${folder1.scope}","name":"${folder1.name}","path":"/${folder1.name}"}`)
  })

  it('test remove https folder', async () => {
    const folder1 = create.filesHelper.createFolder(
      em,
      { user },
      { name: 'folder1', project: 'test', entityType: FILE_ORIGIN_TYPE.HTTPS },
    )
    await em.flush()

    const op = new userFile.FolderRemoveOperation({
      em: database.orm().em.fork(),
      log,
      user: userCtx,
    })

    await op.execute({ id: folder1.id })
    em.clear()

    expect(fakes.client.folderRemoveFake.calledOnce).to.be.true()

    const loadedFolder1 = await em.findOne(Folder, { id: folder1.id })
    expect(loadedFolder1).to.equal(null)
  })

  it('test fail remove folder with children', async () => {
    const folder1 = create.filesHelper.createFolder(
      em,
      { user },
      { name: 'folder1', project: 'test', entityType: FILE_ORIGIN_TYPE.HTTPS },
    )
    await em.flush()
    create.filesHelper.create(
      em,
      { user },
      { name: 'file1', parentFolder: folder1 },
    )
    await em.flush()

    const op = new userFile.FolderRemoveOperation({
      em: database.orm().em.fork(),
      log,
      user: userCtx,
    })

    try {
      await op.execute({ id: folder1.id })
      expect.fail('Operation is expected to fail.')
    } catch (error) {
      expect(error.message).to
        .equal(`Cannot remove folder ${folder1.name}`
        + 'with children. Remove children first.')
    }
  })

  it('test fail remove folder in locked verification space', async () => {
    const space = create.spacesHelper.create(
      em,
      { name: 'locked_verification', type: SPACE_TYPE.VERIFICATION, state: SPACE_STATE.LOCKED },
    )
    await em.flush()

    create.spacesHelper.addMember(em, { user, space }, { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR })

    const folderToDelete = create.filesHelper.createFolder(
      em,
      { user },
      { name: 'folderInSpace', scope: `space-${space.id.toString()}` },
    )
    await em.flush()

    const op = new userFile.FolderRemoveOperation({
      em: database.orm().em.fork(),
      log,
      user: userCtx,
    })

    try {
      await op.execute({ id: folderToDelete.id })
      expect.fail('Operation is expected to fail.')
    } catch (error) {
      expect(error.message).to
        .equal(`You have no permissions to remove ${folderToDelete.name} as`
          + ' it is part of Locked Verification space.')
    }
  })

  it('test fail to remove file in space with membership Viewer', async () => {
    const userCreator = create.userHelper.create(em, { fullName: 'Harry Potter' })
    const space = create.spacesHelper.create(
      em,
      { name: 'space', type: SPACE_TYPE.REVIEW, state: SPACE_STATE.ACTIVE },
    )
    await em.flush()

    create.spacesHelper.addMember(em, { user, space }, { role: SPACE_MEMBERSHIP_ROLE.VIEWER })

    const folderToDelete = create.filesHelper.createFolder(
      em,
      { user: userCreator },
      { name: 'fileInspace', scope: `space-${space.id.toString()}` },
    )
    await em.flush()

    const op = new userFile.FolderRemoveOperation({
      em: database.orm().em.fork(),
      log,
      user: userCtx,
    })

    try {
      await op.execute({ id: folderToDelete.id })
      expect.fail('Operation is expected to fail.')
    } catch (error) {
      expect(error.message).to
        .equal(`You have no permissions to remove '${folderToDelete.name}'.`)
    }
  })
})
