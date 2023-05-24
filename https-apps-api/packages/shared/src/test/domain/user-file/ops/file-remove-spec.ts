import { EntityManager, MySqlDriver, SqlEntityManager } from '@mikro-orm/mysql'
import { expect } from 'chai'
import pino from 'pino'
import { fakes, mocksReset } from '../../../mocks'
import { Tag, User, UserFile, Event, userFile } from '../../../../domain'
import { mocksReset as localMocksReset } from '../../../../../../worker/test/utils/mocks'
import { create, db } from 'shared/src/test'
import { database, getLogger, types } from '@pfda/https-apps-shared'
import { SPACE_STATE, SPACE_TYPE } from 'shared/src/domain/space/space.enum'
import { SPACE_MEMBERSHIP_ROLE } from 'shared/src/domain/space-membership/space-membership.enum'

describe('remove file tests', () => {
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

  it('test fail remove file with comparisons', async () => {
    const fileToDelete = create.filesHelper.create(em, { user }, { name: 'fileInComparison' })
    const app = create.appHelper.createRegular(em, { user }, { title: 'test-app' })
    const comparison = create.comparisonHelper.create(em, { app, user }, { name: 'comparison' })
    await em.flush()
    create.comparisonHelper.createInput(em, { comparison, userFile: fileToDelete }, { })
    await em.flush()

    const op = new userFile.FileRemoveOperation({
      em: database.orm().em.fork() as SqlEntityManager,
      log,
      user: userCtx,
    })

    try {
      await op.execute({ id: fileToDelete.id })
      expect.fail('Operation is expected to fail.')
    } catch (error) {
      expect(error.message).to
        .equal('File fileInComparison cannot be deleted because it participates in'
          + ' one or more comparisons. Please delete all the comparisons first.')
    }
  })

  it('test fail remove file in locked verification space', async () => {
    const space = create.spacesHelper.create(
      em,
      { name: 'locked_verification', type: SPACE_TYPE.VERIFICATION, state: SPACE_STATE.LOCKED },
    )
    await em.flush()

    create.spacesHelper.addMember(em, { user, space }, { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR })

    const fileToDelete = create.filesHelper.create(
      em,
      { user },
      { name: 'fileInspace', scope: `space-${space.id.toString()}` },
    )
    await em.flush()

    const op = new userFile.FileRemoveOperation({
      em: database.orm().em.fork() as SqlEntityManager,
      log,
      user: userCtx,
    })

    try {
      await op.execute({ id: fileToDelete.id })
      expect.fail('Operation is expected to fail.')
    } catch (error) {
      expect(error.message).to
        .equal(`You have no permissions to remove ${fileToDelete.name} as`
          + ' it is part of Locked Verification space.')
    }
  })

  it('test delete file second version - do not call platform yet', async () => {
    const dxid = 'file--ABCD'
    const firstFile = create.filesHelper.create(
      em,
      { user },
      { name: 'file1', dxid, uid: `${dxid}-1` },
    )
    const secondFile = create.filesHelper.create(
      em,
      { user },
      { name: 'file2', dxid, uid: `${dxid}-2` },
    )
    await em.flush()

    const op = new userFile.FileRemoveOperation({
      em: database.orm().em.fork() as SqlEntityManager,
      log,
      user: userCtx,
    })

    await op.execute({ id: secondFile.id })

    expect(fakes.client.fileRemoveFake.notCalled).to.be.true()

    const loadedFirstFile = await em.findOneOrFail(UserFile, { id: firstFile.id })
    expect(loadedFirstFile).to.not.equal(null)

    const loadedSecondFile = await em.findOne(UserFile, { id: secondFile.id })
    expect(loadedSecondFile).to.equal(null)
  })

  it('test fail to remove file in space with membership Viewer', async () => {
    const userCreator = create.userHelper.create(em, { fullName: 'Harry Potter' })
    const space = create.spacesHelper.create(
      em,
      { name: 'space', type: SPACE_TYPE.REVIEW, state: SPACE_STATE.ACTIVE },
    )
    await em.flush()

    create.spacesHelper.addMember(em, { user, space }, { role: SPACE_MEMBERSHIP_ROLE.VIEWER })

    const fileToDelete = create.filesHelper.create(
      em,
      { user: userCreator },
      { name: 'fileInspace', scope: `space-${space.id.toString()}` },
    )
    await em.flush()

    const op = new userFile.FileRemoveOperation({
      em: database.orm().em.fork() as SqlEntityManager,
      log,
      user: userCtx,
    })

    try {
      await op.execute({ id: fileToDelete.id })
      expect.fail('Operation is expected to fail.')
    } catch (error) {
      expect(error.message).to
        .equal(`You have no permissions to remove '${fileToDelete.name}'.`)
    }
  })

  it('test delete file with taggings and call platform', async () => {
    const firstFile = create.filesHelper.create(
      em,
      { user },
      { name: 'file1' },
    )
    const secondFile = create.filesHelper.create(
      em,
      { user },
      { name: 'file2' },
    )
    await em.flush()

    const tagAaa = create.tagsHelper.create(em, { name: 'aaa' })
    const tagBbb = create.tagsHelper.create(em, { name: 'bbb' })
    await em.flush()
    create.tagsHelper.createTagging(em, { tag: tagAaa }, { taggableId: firstFile.id })
    create.tagsHelper.createTagging(em, { tag: tagAaa }, { taggableId: secondFile.id })
    create.tagsHelper.createTagging(em, { tag: tagBbb }, { taggableId: firstFile.id })
    await em.flush()

    const op = new userFile.FileRemoveOperation({
      em: database.orm().em.fork() as SqlEntityManager,
      log,
      user: userCtx,
    })

    await op.execute({ id: firstFile.id })
    em.clear()

    expect(fakes.client.fileRemoveFake.calledOnce).to.be.true()

    const loadedFirstFile = await em.findOne(UserFile, { id: firstFile.id })
    expect(loadedFirstFile).to.equal(null)

    const loadedTagAaa = await em.findOneOrFail(Tag, { id: tagAaa.id })
    expect(loadedTagAaa.taggingCount).to.equal(1)

    const loadedTagBbb = await em.findOne(Tag, { id: tagBbb.id })
    expect(loadedTagBbb).to.equal(null)

    const loadedFileEvent = await em.findOneOrFail(Event, { param2: firstFile.dxid })
    expect(loadedFileEvent.type).to.equal('Event::FileDeleted')
    expect(loadedFileEvent.param1).to.equal(`/${firstFile.name}`)
    expect(loadedFileEvent.param2).to.equal(`${firstFile.dxid}`)
    expect(loadedFileEvent.data).to.equal(`{"id":${firstFile.id.toString()},"scope":`
      + `"${firstFile.scope}","name":"${firstFile.name}","path":"/${firstFile.name}"}`)
  })

  it('test delete file from protected space - fail', async () => {
    const differentUser = create.userHelper.create(em, { firstName: 'First', lastName: 'Last' })
    const space = create.spacesHelper.create(em, { name: 'protected-space', protected: true })
    await em.flush()
    const file = create.filesHelper.create(em, { user }, { scope: `space-${space.id}` })
    // different user is able to remove from the Protected Space
    create.spacesHelper.addMember(em, {user: differentUser, space}, { role: SPACE_MEMBERSHIP_ROLE.LEAD })
    create.spacesHelper.addMember(em, {user, space}, { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR })
    await em.flush()

    const op = new userFile.FileRemoveOperation({
      em: database.orm().em.fork() as SqlEntityManager,
      log,
      user: userCtx,
    })

    try {
      await op.execute({ id: file.id })
      expect.fail('Operation is expected to fail.')
    } catch (error) {
      expect(error.message).to
        .equal('You have no permissions to remove from a Protected Space')
    }
  })

  it('test delete file from protected space - success', async () => {
    const differentUser = create.userHelper.create(em, { firstName: 'First', lastName: 'Last' })
    const space = create.spacesHelper.create(em, { name: 'protected-space', protected: true })
    await em.flush()
    const file = create.filesHelper.create(em, { user }, { scope: `space-${space.id}` })
    // user has corresponding role to be able to delete from the Protected Space
    create.spacesHelper.addMember(em, {user: user, space}, { role: SPACE_MEMBERSHIP_ROLE.LEAD })
    await em.flush()

    const op = new userFile.FileRemoveOperation({
      em: database.orm().em.fork() as SqlEntityManager,
      log,
      user: userCtx,
    })
    
    await op.execute({ id: file.id })
    
    // verify file was deleted
    const loadedFile = em.findOne(UserFile, file.id)
    expect(loadedFile).to.be.null
  })

  it('test delete locked file', async () => {
    const file = create.filesHelper.create(em, { user }, { locked: true })
    await em.flush()

    const op = new userFile.FileRemoveOperation({
      em: database.orm().em.fork() as SqlEntityManager,
      log,
      user: userCtx,
    })

    try {
      await op.execute({ id: file.id })
      expect.fail('Operation is expected to fail.')
    } catch (error) {
      expect(error.message).to.equal('Locked items cannot be removed.')
    }
  })
})
