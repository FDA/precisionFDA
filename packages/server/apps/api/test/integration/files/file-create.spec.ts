import { SqlEntityManager } from '@mikro-orm/mysql'
import { expect } from 'chai'
import supertest from 'supertest'
import { database } from '@shared/database'
import { Space } from '@shared/domain/space/space.entity'
import { SPACE_TYPE } from '@shared/domain/space/space.enum'
import { SPACE_MEMBERSHIP_ROLE, SPACE_MEMBERSHIP_SIDE } from '@shared/domain/space-membership/space-membership.enum'
import { User } from '@shared/domain/user/user.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { UserFileRepository } from '@shared/domain/user-file/user-file.repository'
import { PARENT_TYPE } from '@shared/domain/user-file/user-file.types'
import { create, db } from '@shared/test'
import { mocksReset } from '@shared/test/mocks'
import { testedApp } from '../..'
import { getDefaultHeaderData } from '../../utils/expect-helper'

describe('POST /files', () => {
  let em: SqlEntityManager
  let user: User
  let fileRepo: UserFileRepository
  let space: Space

  beforeEach(async () => {
    await db.dropData(database.connection())
    // create DB mocks
    em = database.orm().em.fork()
    em.clear()
    fileRepo = em.getRepository(UserFile)
    user = create.userHelper.create(em)
    space = create.spacesHelper.create(em, {
      type: SPACE_TYPE.GROUPS,
      hostProject: 'project-host',
      guestProject: 'project-guest',
    })
    create.spacesHelper.addMember(
      em,
      { space, user },
      { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR, side: SPACE_MEMBERSHIP_SIDE.HOST },
    )
    create.sessionHelper.create(em, { user })
    await em.flush()
    // handle the stubs
    mocksReset()
  })

  it('should throw error if name is empty', async () => {
    await supertest(testedApp.getHttpServer()).post(`/files`).set(getDefaultHeaderData(user)).send({}).expect(400)

    await supertest(testedApp.getHttpServer())
      .post(`/files`)
      .set(getDefaultHeaderData(user))
      .send({
        name: '',
      })
      .expect(400)
  })

  it('should create file with default description and user as parent', async () => {
    const result = await supertest(testedApp.getHttpServer())
      .post(`/files`)
      .set(getDefaultHeaderData(user))
      .send({
        name: 'test_file.txt',
      })
      .expect(201)

    const file = await fileRepo.findOne({ uid: result.body.uid })
    expect(file.name).to.equal('test_file.txt')
    expect(file.description).to.equal('')
    expect(file.parentType).to.equal(PARENT_TYPE.USER)
    expect(file.parentId).to.equal(user.id)
  })

  context('should create file with correct scope or private scope by default', () => {
    it('should create file in correct scope', async () => {
      const result1 = await supertest(testedApp.getHttpServer())
        .post(`/files`)
        .set(getDefaultHeaderData(user))
        .send({
          name: 'test_file.txt',
          scope: 'private',
        })
        .expect(201)

      const file1 = await fileRepo.findOne({ uid: result1.body.uid })
      expect(file1.scope).to.equal('private')
      expect(file1.project).to.equal(user.privateFilesProject)

      const result2 = await supertest(testedApp.getHttpServer())
        .post(`/files`)
        .set(getDefaultHeaderData(user))
        .send({
          name: 'test_file.txt',
          scope: `space-${space.id}`,
        })
        .expect(201)

      const file2 = await fileRepo.findOne({ uid: result2.body.uid })
      expect(file2.scope).to.equal(`space-${space.id}`)
      expect(file2.project).to.equal(space.hostProject)
    })

    it('should create file in private scope by default', async () => {
      const result1 = await supertest(testedApp.getHttpServer())
        .post(`/files`)
        .set(getDefaultHeaderData(user))
        .send({
          name: 'test_file.txt',
          scope: null,
        })
        .expect(201)

      const file1 = await fileRepo.findOne({ uid: result1.body.uid })
      expect(file1.scope).to.equal('private')

      const result2 = await supertest(testedApp.getHttpServer())
        .post(`/files`)
        .set(getDefaultHeaderData(user))
        .send({
          name: 'test_file.txt',
          scope: '',
        })
        .expect(201)

      const file2 = await fileRepo.findOne({ uid: result2.body.uid })
      expect(file2.scope).to.equal('private')

      const result3 = await supertest(testedApp.getHttpServer())
        .post(`/files`)
        .set(getDefaultHeaderData(user))
        .send({
          name: 'test_file.txt',
          scope: undefined,
        })
        .expect(201)

      const file3 = await fileRepo.findOne({ uid: result3.body.uid })
      expect(file3.scope).to.equal('private')
    })

    it('should throw error if scope is invalid', async () => {
      await supertest(testedApp.getHttpServer())
        .post(`/files`)
        .set(getDefaultHeaderData(user))
        .send({
          name: 'test_file.txt',
          scope: 'invalid_scope',
        })
        .expect(400)
    })

    it('should throw error if creating public file by non site admin', async () => {
      await supertest(testedApp.getHttpServer())
        .post(`/files`)
        .set(getDefaultHeaderData(user))
        .send({
          name: 'test_file.txt',
          scope: 'public',
        })
        .expect(403)
    })

    it('should create public file if user is site admin', async () => {
      const siteAdmin = create.userHelper.createSiteAdmin(em)
      create.sessionHelper.create(em, { user: siteAdmin })
      await em.flush()

      const result = await supertest(testedApp.getHttpServer())
        .post(`/files`)
        .set(getDefaultHeaderData(siteAdmin))
        .send({
          name: 'test_file.txt',
          scope: 'public',
        })
        .expect(201)

      const file = await fileRepo.findOne({ uid: result.body.uid })
      expect(file.scope).to.equal('public')
      expect(file.project).to.equal(siteAdmin.publicFilesProject)
    })

    it('should throw error if user does not have write access to the space', async () => {
      const anotherUser = create.userHelper.create(em)
      create.sessionHelper.create(em, { user: anotherUser })
      create.spacesHelper.addMember(
        em,
        { space, user: anotherUser },
        { role: SPACE_MEMBERSHIP_ROLE.VIEWER, side: SPACE_MEMBERSHIP_SIDE.HOST },
      )
      await em.flush()

      await supertest(testedApp.getHttpServer())
        .post(`/files`)
        .set(getDefaultHeaderData(anotherUser))
        .send({
          name: 'test_file.txt',
          scope: `space-${space.id}`,
        })
        .expect(422)
    })
  })

  context('should create file with correct parent folder', () => {
    it('should create file in root if folderId is not provided', async () => {
      const result = await supertest(testedApp.getHttpServer())
        .post(`/files`)
        .set(getDefaultHeaderData(user))
        .send({
          name: 'test_file.txt',
        })
        .expect(201)

      const file = await fileRepo.findOne({ uid: result.body.uid })
      expect(file.parentFolderId).to.be.null()
      expect(file.scopedParentFolderId).to.be.null()
    })

    it('should create file in root if folderId is null or empty', async () => {
      const result1 = await supertest(testedApp.getHttpServer())
        .post(`/files`)
        .set(getDefaultHeaderData(user))
        .send({
          name: 'test_file.txt',
          folderId: null,
        })
        .expect(201)

      const file1 = await fileRepo.findOne({ uid: result1.body.uid })
      expect(file1.parentFolderId).to.be.null()
      expect(file1.scopedParentFolderId).to.be.null()

      const result2 = await supertest(testedApp.getHttpServer())
        .post(`/files`)
        .set(getDefaultHeaderData(user))
        .send({
          name: 'test_file.txt',
          folderId: '',
        })
        .expect(201)

      const file2 = await fileRepo.findOne({ uid: result2.body.uid })
      expect(file2.parentFolderId).to.be.null()
      expect(file2.scopedParentFolderId).to.be.null()
    })

    it('should create file in the folder if folderId is provided', async () => {
      const folder = create.filesHelper.createFolder(em, {
        user,
        parentFolder: null,
      })
      await em.flush()

      const result = await supertest(testedApp.getHttpServer())
        .post(`/files`)
        .set(getDefaultHeaderData(user))
        .send({
          name: 'test_file.txt',
          folderId: folder.id,
        })
        .expect(201)

      const file = await fileRepo.findOne({ uid: result.body.uid })
      expect(file.parentFolderId).to.equal(folder.id)
      expect(file.scopedParentFolderId).to.be.null()
    })

    it('should create file in scope folder if folderId is provided and scope is space', async () => {
      const folder = create.filesHelper.createFolder(
        em,
        {
          user,
          parentFolder: null,
        },
        {
          scope: `space-${space.id}`,
        },
      )
      await em.flush()

      const result = await supertest(testedApp.getHttpServer())
        .post(`/files`)
        .set(getDefaultHeaderData(user))
        .send({
          name: 'test_file.txt',
          folderId: folder.id,
          scope: `space-${space.id}`,
        })
        .expect(201)

      const file = await fileRepo.findOne({ uid: result.body.uid })
      expect(file.parentFolderId).to.be.null()
      expect(file.scopedParentFolderId).to.equal(folder.id)
    })
  })

  it('should create file with correct parent job', async () => {
    const app = create.appHelper.createHTTPS(em, { user })
    const job = create.jobHelper.create(em, { user, app })
    await em.flush()

    const result = await supertest(testedApp.getHttpServer())
      .post(`/files`)
      .set(getDefaultHeaderData(user))
      .send({
        name: 'test_file.txt',
        parentType: PARENT_TYPE.JOB,
        parentId: job.dxid,
      })
      .expect(201)

    const file = await fileRepo.findOne({ uid: result.body.uid })
    expect(file.parentType).to.equal(PARENT_TYPE.JOB)
    expect(file.parentId).to.equal(job.id)
  })

  it('should inherit the scope of the folder if the file is being created inside a folder', async () => {
    const folder = create.filesHelper.createFolder(
      em,
      {
        user,
        parentFolder: null,
      },
      {
        scope: 'private',
      },
    )
    await em.flush()

    const result = await supertest(testedApp.getHttpServer())
      .post(`/files`)
      .set(getDefaultHeaderData(user))
      .send({
        name: 'test_file.txt',
        folderId: folder.id,
        scope: space.scope,
      })
      .expect(201)

    const file = await fileRepo.findOne({ uid: result.body.uid })
    expect(file.scope).to.equal(folder.scope)
  })

  it('should fall back to current user if parent job does not exist', async () => {
    const result = await supertest(testedApp.getHttpServer())
      .post(`/files`)
      .set(getDefaultHeaderData(user))
      .send({
        name: 'test_file.txt',
        parentType: PARENT_TYPE.JOB,
        parentId: 'job-12345',
      })
      .expect(201)

    const file = await fileRepo.findOne({ uid: result.body.uid })
    expect(file.parentType).to.equal(PARENT_TYPE.USER)
    expect(file.parentId).to.equal(user.id)
  })

  it('should throw error if parentType or parentId is invalid', async () => {
    await supertest(testedApp.getHttpServer())
      .post(`/files`)
      .set(getDefaultHeaderData(user))
      .send({
        name: 'test_file.txt',
        parentType: 'invalid_parent_type',
        parentId: 'job-12345',
      })
      .expect(400)

    await supertest(testedApp.getHttpServer())
      .post(`/files`)
      .set(getDefaultHeaderData(user))
      .send({
        name: 'test_file.txt',
        parentType: PARENT_TYPE.JOB,
        parentId: 'invalid_parent_id',
      })
      .expect(400)

    await supertest(testedApp.getHttpServer())
      .post(`/files`)
      .set(getDefaultHeaderData(user))
      .send({
        name: 'test_file.txt',
        parentType: PARENT_TYPE.JOB,
      })
      .expect(400)

    await supertest(testedApp.getHttpServer())
      .post(`/files`)
      .set(getDefaultHeaderData(user))
      .send({
        name: 'test_file.txt',
        parentId: 'job-12345',
      })
      .expect(400)
  })

  it('should create file with content in description', async () => {
    const description = 'This is a test file'
    const result = await supertest(testedApp.getHttpServer())
      .post(`/files`)
      .set(getDefaultHeaderData(user))
      .send({
        name: 'test_file.txt',
        description,
      })
      .expect(201)

    const file = await fileRepo.findOne({ uid: result.body.uid })
    expect(file.description).to.equal(description)
  })

  it('should return 200 for JupyterLab client', async () => {
    const result = await supertest(testedApp.getHttpServer())
      .post(`/files`)
      .set(getDefaultHeaderData(user))
      .set('user-agent', 'python-requests/2.25.1')
      .send({
        name: 'test_file.txt',
      })
      .expect(200)

    const file = await fileRepo.findOne({ uid: result.body.uid })
    expect(file.name).to.equal('test_file.txt')
  })

  it('should parse snake case parameters', async () => {
    const app = create.appHelper.createHTTPS(em, { user })
    const job = create.jobHelper.create(em, { user, app })
    await em.flush()

    const result = await supertest(testedApp.getHttpServer())
      .post(`/files`)
      .set(getDefaultHeaderData(user))
      .send({
        name: 'test_file.txt',
        parent_type: PARENT_TYPE.JOB,
        parent_id: job.dxid,
      })
      .expect(201)

    const file = await fileRepo.findOne({ uid: result.body.uid })
    expect(file.parentType).to.equal(PARENT_TYPE.JOB)
    expect(file.parentId).to.equal(job.id)
  })
})
