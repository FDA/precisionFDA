import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { User } from '@shared/domain/user/user.entity'
import { create, db, generate } from '@shared/test'
import supertest from 'supertest'
import { database } from '@shared/database'
import { expect } from 'chai'
import { testedApp } from '../../index'
import { getDefaultHeaderData } from '../../utils/expect-helper'
import {
  SPACE_MEMBERSHIP_ROLE,
  SPACE_MEMBERSHIP_SIDE,
} from '@shared/domain/space-membership/space-membership.enum'
import { ErrorCodes } from '@shared/errors'
import { Discussion } from '@shared/domain/discussion/discussion.entity'

describe('/cli', async () => {
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

  it('GET /version has valid response', async () => {
    const { body } = await supertest(testedApp.getHttpServer())
      .get('/cli/version/latest')
      .set('Accept', 'application/json')
      .expect(200)
    expect(body).to.be.an('object')
    expect(body).to.have.property('version')
    expect(body.version).to.be.a('string')
    expect(body.version).to.equal('2.10.1')
  })

  describe('cli describe', () => {
    it('GET /:uid/describe has valid app response', async () => {
      const app = create.appHelper.createRegular(em, { user })
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .get(`/cli/${app.uid}/describe`)
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(200)
      expect(body).to.be.an('object')
      expect(body).to.have.property('internetAccess')
      expect(body).to.have.property('title')
      expect(body).to.have.property('id')
      expect(body).to.have.property('name')
      expect(body).to.have.property('revision')
      expect(body).to.have.property('location')
      expect(body).to.have.property('createdAt')
      expect(body).to.have.property('updatedAt')
      expect(body).to.have.property('addedBy')
      expect(body).to.have.property('instanceType')
      expect(body).to.have.property('inputSpec')
      expect(body).to.have.property('outputSpec')
      expect(body).to.have.property('runSpec')
      expect(body).to.have.property('openSource')
      expect(body).to.have.property('details')
      expect(body).to.have.property('version')
      expect(body.id).to.equal(app.uid)
    })

    it('GET /:uid/describe has valid job response', async () => {
      const job = create.jobHelper.create(em, { user }) // Replace with your real job creation helper
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .get(`/cli/${job.uid}/describe`)
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(200)

      expect(body).to.be.an('object')
      expect(body).to.have.property('id').that.is.a('string').that.equals(job.uid)
      expect(body).to.have.property('region')
      expect(body).to.have.property('name')
      expect(body).to.have.property('class').that.equals('job')
      expect(body).to.have.property('state')
      expect(body).to.have.property('launchedBy')
      expect(body).to.have.property('instanceType')
      expect(body).to.have.property('executionPolicy')
      expect(body).to.have.property('createdAt')
      expect(body).to.have.property('updatedAt')
      expect(body).to.have.property('addedBy')
      expect(body).to.have.property('totalPrice').that.is.a('number')
      expect(body).to.have.property('dxid')
      expect(body).to.have.property('title')
      expect(body).to.have.property('location')
    })

    it('GET /:uid/describe has valid workflow response', async () => {
      const workflow = create.workflowHelper.create(em, { user })
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .get(`/cli/${workflow.uid}/describe`)
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(200)

      expect(body).to.be.an('object')
      expect(body).to.have.property('id').that.is.a('string')
      expect(body).to.have.property('project')
      expect(body).to.have.property('class').that.equals('workflow')
      expect(body).to.have.property('name')
      expect(body).to.have.property('state')
      expect(body).to.have.property('createdAt')
      expect(body).to.have.property('updatedAt')
      expect(body).to.have.property('location')
      expect(body).to.have.property('revision')
      expect(body).to.have.property('addedBy')
      expect(body).to.have.property('stages').that.is.an('array')
      expect(body).to.have.property('inputSpec').that.is.an('object')
      expect(body).to.have.property('outputSpec').that.is.an('object')
      expect(body).to.have.property('dxid').that.is.a('string')

      // Optional check for stages
      for (const stage of body.stages) {
        expect(stage).to.have.property('id')
        expect(stage).to.have.property('executable')
        expect(stage).to.have.property('systemRequirements')
      }
    })

    it('GET /:uid/describe has valid discussion response ', async () => {
      const discussion = create.discussionHelper.createPublic(em, { user })
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .get(`/cli/discussion-${discussion.id}/describe`)
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(200)

      expect(body).to.be.an('object')
      expect(body).to.have.property('id', discussion.id)
      expect(body).to.have.property('title').that.is.a('string')
      expect(body).to.have.property('content').that.is.a('string')
      expect(body).to.have.property('createdAt').that.is.a('string')
      expect(body).to.have.property('updatedAt').that.is.a('string')
      expect(body).to.have.property('commentsCount').that.equals(body.comments.length)
      expect(body).to.have.property('answersCount').that.equals(body.answers.length)
      expect(body).to.have.property('attachments').that.is.an('array')

      expect(body).to.have.property('user').that.is.an('object')
      expect(body.user).to.have.property('id')
      expect(body.user).to.have.property('dxuser')
      expect(body.user).to.have.property('fullName')

      expect(body).to.have.property('comments').that.is.an('array')
      for (const comment of body.comments) {
        expect(comment).to.have.property('id')
        expect(comment).to.have.property('content')
        expect(comment).to.have.property('createdAt')
        expect(comment).to.have.property('updatedAt')
        expect(comment).to.have.property('user').that.is.an('object')
      }

      expect(body).to.have.property('answers').that.is.an('array')
      for (const answer of body.answers) {
        expect(answer).to.have.property('id')
        expect(answer).to.have.property('content')
        expect(answer).to.have.property('createdAt')
        expect(answer).to.have.property('updatedAt')
        expect(answer).to.have.property('user').that.is.an('object')
        expect(answer).to.have.property('comments').that.is.an('array')
        expect(answer).to.have.property('attachments').that.is.an('array')

        for (const attachment of answer.attachments) {
          expect(attachment).to.have.property('uid').that.is.a('string')
          expect(attachment).to.have.property('type').that.equals('UserFile')
          expect(attachment).to.have.property('name').that.is.a('string')
        }
      }
    })

    it('GET /:uid/describe returns valid asset response ', async () => {
      const file = create.assetHelper.create(em, { user }) // Replace with real helper
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .get(`/cli/${file.uid}/describe`)
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(200)

      expect(body).to.be.an('object')
      expect(body).to.have.property('id', file.uid)
      expect(body).to.have.property('project').that.is.a('string')
      expect(body).to.have.property('class', 'file')
      expect(body).to.have.property('name').that.is.a('string')
      expect(body).to.have.property('title').that.is.a('string')
      expect(body).to.have.property('size').that.is.a('number')
      expect(body).to.have.property('state').that.is.a('string')
      expect(body).to.have.property('hidden').that.is.a('boolean')
      expect(body).to.have.property('tags').that.is.an('array')
      expect(body).to.have.property('createdAt').that.is.a('string')
      expect(body).to.have.property('updatedAt').that.is.a('string')
      expect(body).to.have.property('location').that.is.a('string')
      expect(body).to.have.property('addedBy').that.is.a('string')
      expect(body).to.have.property('properties').that.is.an('object')
    })

    it('GET /:uid/describe returns valid file response', async () => {
      const file = create.filesHelper.createUploaded(em, { user })
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .get(`/cli/${file.uid}/describe`)
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(200)

      expect(body).to.be.an('object')
      expect(body).to.have.property('id', file.uid)
      expect(body).to.have.property('project').that.is.a('string')
      expect(body).to.have.property('class', 'file')
      expect(body).to.have.property('name').that.is.a('string')
      expect(body).to.have.property('title').that.is.a('string')
      expect(body).to.have.property('size').that.is.a('number')
      expect(body).to.have.property('state').that.is.a('string')
      expect(body).to.have.property('hidden').that.is.a('boolean')
      expect(body).to.have.property('tags').that.is.an('array')
      expect(body).to.have.property('createdAt').that.is.a('string')
      expect(body).to.have.property('updatedAt').that.is.a('string')
      expect(body).to.have.property('location').that.is.a('string')
      expect(body).to.have.property('addedBy').that.is.a('string')
    })
  })

  describe('cli job scope', () => {
    it('GET job/:uid/scope returns correct private job scope', async () => {
      const job = create.jobHelper.create(em, { user }, { scope: 'private' })
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .get(`/cli/job/${job.dxid}/scope`)
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(200)

      expect(body).to.be.an('object')
      expect(body).to.have.property('scope').that.is.a('string').that.equals('private')
    })

    it('GET job/:uid/scope returns 404 error for different user private job', async () => {
      const user2 = create.userHelper.create(em)
      const job = create.jobHelper.create(em, { user: user2 }, { scope: 'private' })
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .get(`/cli/job/${job.dxid}/scope`)
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(404)

      expect(body).to.be.an('object')
      expect(body).to.have.property('error').that.is.an('object')
      expect(body.error).to.have.property('code').that.equals(ErrorCodes.NOT_FOUND)
      expect(body.error)
        .to.have.property('message')
        .that.equals(`Job ${job.dxid} was not found or is not accessible`)
      expect(body.error).to.have.property('statusCode').that.equals(404)
      expect(body).to.have.property('stack').that.is.a('string')
    })

    it('GET job/:uid/scope returns correct space job scope', async () => {
      const user2 = create.userHelper.create(em)
      const groupSpace = create.spacesHelper.create(em, generate.space.group())
      await em.flush()
      create.spacesHelper.addMember(
        em,
        { user: user, space: groupSpace },
        { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR },
      )
      create.spacesHelper.addMember(
        em,
        { user: user2, space: groupSpace },
        { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR },
      )

      const job = create.jobHelper.create(em, { user: user2 }, { scope: groupSpace.scope })
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .get(`/cli/job/${job.dxid}/scope`)
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(200)

      expect(body).to.be.an('object')
      expect(body).to.have.property('scope').that.is.a('string').that.equals('space-1')
    })
  })

  // list members endpoint returns all members correctly. set the space up before the call
  it('GET /spaces/:id/members returns all members correctly', async () => {
    const groupSpace = create.spacesHelper.create(em, generate.space.group())
    await em.flush()
    const user2 = create.userHelper.create(em)
    const user3 = create.userHelper.create(em)
    const user4 = create.userHelper.create(em)
    const user5 = create.userHelper.create(em)
    const nonMemberUser = create.userHelper.create(em)
    create.spacesHelper.addMember(
      em,
      {
        user: user,
        space: groupSpace,
      },
      { role: SPACE_MEMBERSHIP_ROLE.LEAD },
    )
    create.spacesHelper.addMember(
      em,
      { user: user2, space: groupSpace },
      { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR, active: false },
    )
    create.spacesHelper.addMember(
      em,
      {
        user: user3,
        space: groupSpace,
      },
      { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR, side: SPACE_MEMBERSHIP_SIDE.HOST },
    )
    create.spacesHelper.addMember(
      em,
      {
        user: user4,
        space: groupSpace,
      },
      { role: SPACE_MEMBERSHIP_ROLE.VIEWER },
    )
    create.spacesHelper.addMember(
      em,
      {
        user: user5,
        space: groupSpace,
      },
      { role: SPACE_MEMBERSHIP_ROLE.ADMIN, side: SPACE_MEMBERSHIP_SIDE.HOST },
    )
    await em.flush()

    const { body } = await supertest(testedApp.getHttpServer())
      .get(`/cli/spaces/${groupSpace.id}/members`)
      .set('Accept', 'application/json')
      .set(getDefaultHeaderData(user))
      .expect(200)

    expect(body).to.be.an('array').of.length(5)
    expect(body[0]).to.have.property('id')
    expect(body[0]).to.have.property('active')
    expect(body[0]).to.have.property('role')
    expect(body[0]).to.have.property('side')
    expect(body[0]).to.have.property('name')
    expect(body[0]).to.have.property('username')
  })

  describe('cli discussions', () => {
    // create a discussion
    it('POST /spaces/:id/discussions creates a discussion with attachments and returns a link to it', async () => {
      const groupSpace = create.spacesHelper.create(em, generate.space.group())
      create.spacesHelper.addMember(
        em,
        { user, space: groupSpace },
        { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR },
      )
      await em.flush()
      const file = create.filesHelper.createUploaded(em, { user }, { scope: groupSpace.scope })
      const job = create.jobHelper.create(em, { user }, { scope: groupSpace.scope })
      await em.flush()

      const discussionData = {
        title: 'Test Discussion',
        content: 'This is a test discussion content.',
        attachments: {
          files: [file.uid],
          jobs: [job.uid],
        },
      }

      const { body } = await supertest(testedApp.getHttpServer())
        .post(`/cli/spaces/${groupSpace.id}/discussions`)
        .send(discussionData)
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(201)

      expect(body).to.be.an('object')
      expect(body)
        .to.have.property('url')
        .that.is.a('string')
        .that.contains(`/spaces/${groupSpace.id}/discussions/1`)
      const res = await em.findAll(Discussion)
      expect(res).to.be.an('array').of.length(1)
      const savedDiscussion = res[0]
      const note = await savedDiscussion.note.load()

      expect(note).to.have.property('title', discussionData.title)
      expect(note).to.have.property('content', discussionData.content)
      // check attachments from note
      expect(note).to.have.property('attachments')
      const attachments = await note.attachments.load()
      expect(attachments).to.have.length(2)
    })

    it('PUT /spaces/:id/discussions appends new content and attachment to the discussion', async () => {
      const groupSpace = create.spacesHelper.create(em, generate.space.group())
      create.spacesHelper.addMember(
        em,
        { user, space: groupSpace },
        { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR },
      )
      await em.flush()
      const discussion = create.discussionHelper.createInSpace(em, { user, space: groupSpace })
      const file = create.filesHelper.createUploaded(em, { user }, { scope: groupSpace.scope })
      await em.flush()

      const discussionData = {
        content: 'Appendix one',
        attachments: {
          files: [file.uid],
        },
      }

      const { body } = await supertest(testedApp.getHttpServer())
        .put(`/cli/discussions/${discussion.id}`)
        .send(discussionData)
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(200)

      expect(body).to.be.an('object')
      expect(body)
        .to.have.property('url')
        .that.is.a('string')
        .that.contains(`/spaces/${groupSpace.id}/discussions/1`)

      em.clear()
      const res = await em.findAll(Discussion)
      expect(res).to.be.an('array').of.length(1)

      const editedDiscussion = res[0]
      const note = await editedDiscussion.note.load()
      expect(note.content).to.contain('\n\nAppendix one')
      expect(note.content).to.contain(discussion.note.getProperty('content'))
    })

    it('GET /spaces/:id/discussions returns all discussions in the space', async () => {
      const groupSpace = create.spacesHelper.create(em, generate.space.group())
      create.spacesHelper.addMember(
        em,
        { user, space: groupSpace },
        { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR },
      )
      const otherSpace = create.spacesHelper.create(em, generate.space.group())
      create.spacesHelper.addMember(
        em,
        { user, space: otherSpace },
        { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR },
      )
      await em.flush()
      const discussion1 = create.discussionHelper.createInSpace(em, { user, space: groupSpace })
      const discussion2 = create.discussionHelper.createInSpace(em, { user, space: groupSpace })
      // these should not be returned
      create.discussionHelper.createInSpace(em, { user, space: otherSpace })
      create.discussionHelper.createPublic(em, { user })
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .get(`/cli/spaces/${groupSpace.id}/discussions`)
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(200)

      expect(body).to.be.an('array').of.length(2)
      expect(body[0]).to.have.property('id', discussion1.id)
      expect(body[1]).to.have.property('id', discussion2.id)
    })
  })

  describe('cli nodes', () => {
    it('POST /nodes returns nodes for a "*" wildcard search', async () => {
      create.filesHelper.createUploaded(em, { user }, { name: 'test-file-1.txt' })
      create.filesHelper.createUploaded(em, { user }, { name: 'test-file-2.txt' })
      create.filesHelper.createUploaded(em, { user }, { name: 'non-test-file-3.txt' })

      const user2 = create.userHelper.create(em)
      await em.flush()

      create.filesHelper.createUploaded(em, { user: user2 }, { name: 'test-file-4.txt' })
      create.filesHelper.createUploaded(em, { user: user2 }, { name: 'test-file-5.txt' })

      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .post('/cli/nodes')
        .send({
          arg: 'test-file%',
          type: 'UserFile',
        })
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(200)

      expect(body).to.be.an('array')
      expect(body).to.have.length(2)
      expect(body[0]).to.have.property('name', 'test-file-1.txt')
      expect(body[1]).to.have.property('name', 'test-file-2.txt')
    })

    it('POST /nodes returns nodes for a "_" wildcard search', async () => {
      create.filesHelper.createUploaded(em, { user }, { name: 'test-file-1.txt' })
      create.filesHelper.createUploaded(em, { user }, { name: 'test-file-2.txt' })
      create.filesHelper.createUploaded(em, { user }, { name: 'non-test-file-10.txt' })

      await em.flush()
      const { body } = await supertest(testedApp.getHttpServer())
        .post('/cli/nodes')
        .send({
          arg: 'test-file-_.txt',
          type: 'UserFile',
        })
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(200)

      expect(body).to.be.an('array')
      expect(body).to.have.length(2)
    })

    it('POST /nodes returns nodes for an exact match search', async () => {
      create.filesHelper.createUploaded(em, { user }, { name: 'test-file-1.txt' })
      create.filesHelper.createUploaded(em, { user }, { name: 'test-file-2.txt' })
      create.filesHelper.createUploaded(em, { user }, { name: 'non-test-file-10.txt' })

      await em.flush()
      const { body } = await supertest(testedApp.getHttpServer())
        .post('/cli/nodes')
        .send({
          arg: 'test-file-2.txt',
          type: 'UserFile',
        })
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(200)

      expect(body).to.be.an('array')
      expect(body).to.have.length(1)
      expect(body[0]).to.have.property('name', 'test-file-2.txt')
    })

    it('POST /nodes for folder id ', async () => {
      const folder = create.filesHelper.createFolder(em, { user }, { name: 'test-folder' })
      create.filesHelper.createFolder(em, { user }, { name: 'test-folder-2' })
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .post('/cli/nodes')
        .send({
          arg: folder.id.toString(),
          type: 'Folder',
        })
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(200)

      expect(body).to.be.an('array')
      expect(body).to.have.length(1)
      expect(body[0]).to.have.property('id', folder.id)
      expect(body[0]).to.have.property('name', 'test-folder')
    })

    it('POST /nodes for folder id returns empty array for non-existing folder', async () => {
      create.filesHelper.createFolder(em, { user }, { name: 'test-folder' })

      const { body } = await supertest(testedApp.getHttpServer())
        .post('/cli/nodes')
        .send({
          arg: '999999',
          type: 'Folder',
        })
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(200)

      expect(body).to.be.an('array')
      expect(body).to.have.length(0)
    })

    it('POST /nodes returns empty array for non-existing file', async () => {
      const { body } = await supertest(testedApp.getHttpServer())
        .post('/cli/nodes')
        .send({
          arg: 'non-existing-file.txt',
          type: 'UserFile',
        })
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(200)

      expect(body).to.be.an('array')
      expect(body).to.have.length(0)
    })

    it('POST /nodes return empty array for non-editable file', async () => {
      const user2 = create.userHelper.create(em)
      await em.flush()
      create.filesHelper.createUploaded(em, { user: user2 }, { name: 'test-file.txt' })
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .post('/cli/nodes')
        .send({
          arg: 'test-file.txt',
          type: 'UserFile',
        })
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(200)

      expect(body).to.be.an('array')
      expect(body).to.have.length(0)
    })

    it('POST /nodes returns empty array for file in different folder', async () => {
      const folder = create.filesHelper.createFolder(em, { user }, { name: 'test-folder' })
      await em.flush()
      create.filesHelper.createUploaded(
        em,
        { user, parentFolder: folder },
        { name: 'test-file.txt' },
      )
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .post('/cli/nodes')
        .send({
          arg: 'test-file.txt',
          type: 'UserFile',
        })
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(200)

      expect(body).to.be.an('array')
      expect(body).to.have.length(0)
    })

    it('POST /nodes returns empty array for file in a different space folder', async () => {
      const groupSpace = create.spacesHelper.create(em, generate.space.group())
      create.spacesHelper.addMember(
        em,
        { user, space: groupSpace },
        { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR },
      )
      const folder = create.filesHelper.createFolder(
        em,
        { user },
        { name: 'test-folder', scope: groupSpace.scope },
      )
      await em.flush()
      create.filesHelper.createUploaded(
        em,
        { user },
        { name: 'test-file.txt', scope: groupSpace.scope, scopedParentFolderId: folder.id },
      )
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .post('/cli/nodes')
        .send({
          arg: 'test-file.txt',
          type: 'UserFile',
          spaceId: groupSpace.id,
        })
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(200)

      expect(body).to.be.an('array')
      expect(body).to.have.length(0)
    })
  })
})
