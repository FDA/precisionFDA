import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { expect } from 'chai'
import supertest from 'supertest'
import { database } from '@shared/database'
import { SPACE_MEMBERSHIP_ROLE, SPACE_MEMBERSHIP_SIDE } from '@shared/domain/space-membership/space-membership.enum'
import { User } from '@shared/domain/user/user.entity'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { FILE_STATE_PFDA } from '@shared/domain/user-file/user-file.types'
import { create, db, generate } from '@shared/test'
import { testedApp } from '../../index'
import { getDefaultHeaderData } from '../../utils/expect-helper'

describe('/nodes', async () => {
  let em: EntityManager<MySqlDriver>
  let user: User

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork()
    em.clear()

    user = create.userHelper.create(em)
    create.sessionHelper.create(em, { user })

    await em.flush()
  })

  describe('POST /nodes/lock', () => {
    it('locks a single file synchronously', async () => {
      const file = create.filesHelper.createUploaded(em, { user })
      await em.flush()

      await supertest(testedApp.getHttpServer())
        .post('/nodes/lock')
        .send({ ids: [file.id], async: false })
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(204)

      em.clear()
      const lockedFile = await em.findOneOrFail(UserFile, { id: file.id })
      expect(lockedFile.locked).to.be.true()
    })

    it('locks multiple files synchronously', async () => {
      const file1 = create.filesHelper.createUploaded(em, { user })
      const file2 = create.filesHelper.createUploaded(em, { user })
      await em.flush()

      await supertest(testedApp.getHttpServer())
        .post('/nodes/lock')
        .send({ ids: [file1.id, file2.id], async: false })
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(204)

      em.clear()
      const lockedFile1 = await em.findOneOrFail(UserFile, { id: file1.id })
      const lockedFile2 = await em.findOneOrFail(UserFile, { id: file2.id })
      expect(lockedFile1.locked).to.be.true()
      expect(lockedFile2.locked).to.be.true()
    })

    it('does not lock files belonging to another user', async () => {
      const user2 = create.userHelper.create(em)
      await em.flush()
      const file = create.filesHelper.createUploaded(em, { user: user2 })
      await em.flush()

      await supertest(testedApp.getHttpServer())
        .post('/nodes/lock')
        .send({ ids: [file.id], async: false })
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(204)

      em.clear()
      const unchangedFile = await em.findOneOrFail(UserFile, { id: file.id })
      expect(unchangedFile.locked).to.be.false()
    })

    it('skips already locked files', async () => {
      const file = create.filesHelper.createUploaded(em, { user }, { locked: true })
      await em.flush()

      await supertest(testedApp.getHttpServer())
        .post('/nodes/lock')
        .send({ ids: [file.id], async: false })
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(204)

      em.clear()
      const lockedFile = await em.findOneOrFail(UserFile, { id: file.id })
      expect(lockedFile.locked).to.be.true()
    })

    it('returns 400 for empty ids', async () => {
      await supertest(testedApp.getHttpServer())
        .post('/nodes/lock')
        .send({ ids: [], async: false })
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(204)
    })
  })

  describe('POST /nodes/unlock', () => {
    it('unlocks a single locked file synchronously', async () => {
      const file = create.filesHelper.createUploaded(em, { user }, { locked: true })
      await em.flush()

      await supertest(testedApp.getHttpServer())
        .post('/nodes/unlock')
        .send({ ids: [file.id], async: false })
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(204)

      em.clear()
      const unlockedFile = await em.findOneOrFail(UserFile, { id: file.id })
      expect(unlockedFile.locked).to.be.false()
    })

    it('unlocks multiple locked files synchronously', async () => {
      const file1 = create.filesHelper.createUploaded(em, { user }, { locked: true })
      const file2 = create.filesHelper.createUploaded(em, { user }, { locked: true })
      await em.flush()

      await supertest(testedApp.getHttpServer())
        .post('/nodes/unlock')
        .send({ ids: [file1.id, file2.id], async: false })
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(204)

      em.clear()
      const unlockedFile1 = await em.findOneOrFail(UserFile, { id: file1.id })
      const unlockedFile2 = await em.findOneOrFail(UserFile, { id: file2.id })
      expect(unlockedFile1.locked).to.be.false()
      expect(unlockedFile2.locked).to.be.false()
    })

    it('does not unlock files belonging to another user', async () => {
      const user2 = create.userHelper.create(em)
      await em.flush()
      const file = create.filesHelper.createUploaded(em, { user: user2 }, { locked: true })
      await em.flush()

      await supertest(testedApp.getHttpServer())
        .post('/nodes/unlock')
        .send({ ids: [file.id], async: false })
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(204)

      em.clear()
      const unchangedFile = await em.findOneOrFail(UserFile, { id: file.id })
      expect(unchangedFile.locked).to.be.true()
    })

    it('skips already unlocked files', async () => {
      const file = create.filesHelper.createUploaded(em, { user }, { locked: false })
      await em.flush()

      await supertest(testedApp.getHttpServer())
        .post('/nodes/unlock')
        .send({ ids: [file.id], async: false })
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(204)

      em.clear()
      const unlockedFile = await em.findOneOrFail(UserFile, { id: file.id })
      expect(unlockedFile.locked).to.be.false()
    })
  })

  describe('DELETE /nodes/remove', () => {
    it('removes a single file synchronously', async () => {
      const file = create.filesHelper.createUploaded(em, { user })
      await em.flush()

      const { text } = await supertest(testedApp.getHttpServer())
        .delete('/nodes/remove')
        .send({ ids: [file.id], async: false })
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(200)

      expect(text).to.equal('1')

      em.clear()
      const deletedFile = await em.findOne(UserFile, { id: file.id })
      expect(deletedFile).to.be.null()
    })

    it('removes multiple files synchronously', async () => {
      const file1 = create.filesHelper.createUploaded(em, { user })
      const file2 = create.filesHelper.createUploaded(em, { user })
      await em.flush()

      const { text } = await supertest(testedApp.getHttpServer())
        .delete('/nodes/remove')
        .send({ ids: [file1.id, file2.id], async: false })
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(200)

      expect(text).to.equal('2')

      em.clear()
      const deletedFile1 = await em.findOne(UserFile, { id: file1.id })
      const deletedFile2 = await em.findOne(UserFile, { id: file2.id })
      expect(deletedFile1).to.be.null()
      expect(deletedFile2).to.be.null()
    })

    it('removes a single file asynchronously', async () => {
      const file = create.filesHelper.createUploaded(em, { user })
      await em.flush()

      await supertest(testedApp.getHttpServer())
        .delete('/nodes/remove')
        .send({ ids: [file.id], async: true })
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(200)

      em.clear()
      const removingFile = await em.findOneOrFail(UserFile, { id: file.id })
      expect(removingFile.state).to.equal(FILE_STATE_PFDA.REMOVING)
    })

    it('removes multiple files asynchronously', async () => {
      const file1 = create.filesHelper.createUploaded(em, { user })
      const file2 = create.filesHelper.createUploaded(em, { user })
      await em.flush()

      await supertest(testedApp.getHttpServer())
        .delete('/nodes/remove')
        .send({ ids: [file1.id, file2.id], async: true })
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(200)

      em.clear()
      const removingFile1 = await em.findOneOrFail(UserFile, { id: file1.id })
      const removingFile2 = await em.findOneOrFail(UserFile, { id: file2.id })
      expect(removingFile1.state).to.equal(FILE_STATE_PFDA.REMOVING)
      expect(removingFile2.state).to.equal(FILE_STATE_PFDA.REMOVING)
    })

    it('does not remove files belonging to another user', async () => {
      const user2 = create.userHelper.create(em)
      await em.flush()
      const file = create.filesHelper.createUploaded(em, { user: user2 })
      await em.flush()

      await supertest(testedApp.getHttpServer())
        .delete('/nodes/remove')
        .send({ ids: [file.id], async: false })
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(403)

      em.clear()
      const unchangedFile = await em.findOne(UserFile, { id: file.id })
      expect(unchangedFile).to.not.be.null()
    })

    it('removes a space file as admin member', async () => {
      const space = create.spacesHelper.create(em, generate.space.group())
      await em.flush()

      create.spacesHelper.addMember(
        em,
        { user, space },
        { role: SPACE_MEMBERSHIP_ROLE.ADMIN, side: SPACE_MEMBERSHIP_SIDE.HOST },
      )
      const file = create.filesHelper.createUploaded(em, { user }, { scope: space.scope })
      await em.flush()

      const { text } = await supertest(testedApp.getHttpServer())
        .delete('/nodes/remove')
        .send({ ids: [file.id], async: false })
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(200)

      expect(text).to.equal('1')

      em.clear()
      const deletedFile = await em.findOne(UserFile, { id: file.id })
      expect(deletedFile).to.be.null()
    })

    it('does not remove a space file as viewer role user', async () => {
      const space = create.spacesHelper.create(em, generate.space.group())
      const adminUser = create.userHelper.create(em)
      await em.flush()

      create.spacesHelper.addMember(
        em,
        { user: adminUser, space },
        { role: SPACE_MEMBERSHIP_ROLE.ADMIN, side: SPACE_MEMBERSHIP_SIDE.HOST },
      )

      const viewerUser = create.userHelper.create(em)
      create.sessionHelper.create(em, { user: viewerUser })
      create.spacesHelper.addMember(
        em,
        { user: viewerUser, space },
        { role: SPACE_MEMBERSHIP_ROLE.VIEWER, side: SPACE_MEMBERSHIP_SIDE.HOST },
      )

      const file = create.filesHelper.createUploaded(em, { user: adminUser }, { scope: space.scope })
      await em.flush()

      await supertest(testedApp.getHttpServer())
        .delete('/nodes/remove')
        .send({ ids: [file.id], async: false })
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(viewerUser))
        .expect(403)

      em.clear()
      const unchangedFile = await em.findOne(UserFile, { id: file.id })
      expect(unchangedFile).to.not.be.null()
    })

    it('removes a folder with files inside', async () => {
      const folder = create.filesHelper.createFolder(em, { user })
      await em.flush()
      const file1 = create.filesHelper.createUploaded(em, { user, parentFolder: folder })
      const file2 = create.filesHelper.createUploaded(em, { user, parentFolder: folder })
      await em.flush()

      const { text } = await supertest(testedApp.getHttpServer())
        .delete('/nodes/remove')
        .send({ ids: [folder.id], async: false })
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(200)

      expect(text).to.equal('3')

      em.clear()
      const deletedFolder = await em.findOne(Folder, { id: folder.id })
      const deletedFile1 = await em.findOne(UserFile, { id: file1.id })
      const deletedFile2 = await em.findOne(UserFile, { id: file2.id })
      expect(deletedFolder).to.be.null()
      expect(deletedFile1).to.be.null()
      expect(deletedFile2).to.be.null()
    })
  })
})
