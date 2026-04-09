import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { expect } from 'chai'
import supertest from 'supertest'
import { database } from '@shared/database'
import { AppSeries } from '@shared/domain/app-series/app-series.entity'
import { DbCluster } from '@shared/domain/db-cluster/db-cluster.entity'
import { Discussion } from '@shared/domain/discussion/discussion.entity'
import { JOB_STATE } from '@shared/domain/job/job.enum'
import { SetPropertiesDTO } from '@shared/domain/property/dto/set-properties.dto'
import { SPACE_STATE } from '@shared/domain/space/space.enum'
import { SPACE_MEMBERSHIP_ROLE, SPACE_MEMBERSHIP_SIDE } from '@shared/domain/space-membership/space-membership.enum'
import { User } from '@shared/domain/user/user.entity'
import { Asset } from '@shared/domain/user-file/asset.entity'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { FILE_STATE_DX } from '@shared/domain/user-file/user-file.types'
import { WorkflowSeries } from '@shared/domain/workflow-series/workflow-series.entity'
import { ErrorCodes } from '@shared/errors'
import { create, db, generate } from '@shared/test'
import { fakes, mocksReset } from '@shared/test/mocks'
import { testedApp } from '../../index'
import { getDefaultHeaderData } from '../../utils/expect-helper'

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
    expect(body.version).to.equal('2.12.0')
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
    it('GET jobs/:dxid/scope returns correct private job scope', async () => {
      const job = create.jobHelper.create(em, { user }, { scope: 'private' })
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .get(`/cli/jobs/${job.dxid}/scope`)
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(200)

      expect(body).to.be.an('object')
      expect(body).to.have.property('scope').that.is.a('string').that.equals('private')
    })

    it('GET jobs/:dxid/scope returns 404 error for different user private job', async () => {
      const user2 = create.userHelper.create(em)
      const job = create.jobHelper.create(em, { user: user2 }, { scope: 'private' })
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .get(`/cli/jobs/${job.dxid}/scope`)
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(404)

      expect(body).to.be.an('object')
      expect(body).to.have.property('error').that.is.an('object')
      expect(body.error).to.have.property('code').that.equals(ErrorCodes.NOT_FOUND)
      expect(body.error).to.have.property('message').that.equals(`Job ${job.dxid} was not found or is not accessible`)
      expect(body.error).to.have.property('statusCode').that.equals(404)
      expect(body).to.have.property('stack').that.is.a('string')
    })

    it('GET jobs/:dxid/scope returns correct space job scope', async () => {
      const user2 = create.userHelper.create(em)
      const groupSpace = create.spacesHelper.create(em, generate.space.group())
      await em.flush()
      create.spacesHelper.addMember(em, { user: user, space: groupSpace }, { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR })
      create.spacesHelper.addMember(em, { user: user2, space: groupSpace }, { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR })

      const job = create.jobHelper.create(em, { user: user2 }, { scope: groupSpace.scope })
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .get(`/cli/jobs/${job.dxid}/scope`)
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
    create.userHelper.create(em) // non-member
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
      create.spacesHelper.addMember(em, { user, space: groupSpace }, { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR })
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
      expect(body).to.have.property('url').that.is.a('string').that.contains(`/spaces/${groupSpace.id}/discussions/1`)
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
      create.spacesHelper.addMember(em, { user, space: groupSpace }, { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR })
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
      expect(body).to.have.property('url').that.is.a('string').that.contains(`/spaces/${groupSpace.id}/discussions/1`)

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
      create.spacesHelper.addMember(em, { user, space: groupSpace }, { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR })
      const otherSpace = create.spacesHelper.create(em, generate.space.group())
      create.spacesHelper.addMember(em, { user, space: otherSpace }, { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR })
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
      create.filesHelper.createUploaded(em, { user, parentFolder: folder }, { name: 'test-file.txt' })
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
      create.spacesHelper.addMember(em, { user, space: groupSpace }, { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR })
      const folder = create.filesHelper.createFolder(em, { user }, { name: 'test-folder', scope: groupSpace.scope })
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

  describe('cli properties', () => {
    // test setting properties
    it('POST /properties sets properties on all node types', async () => {
      const file = create.filesHelper.createUploaded(em, { user })
      const asset = create.filesHelper.createAsset(em, { user })
      await em.flush()
      const folder = create.filesHelper.createFolder(em, { user })
      await em.flush()

      const fileDTO: SetPropertiesDTO = {
        targetId: file.uid,
        properties: {
          prop1: 'value1',
          prop2: 'value2',
        },
      }

      const assetDTO: SetPropertiesDTO = {
        targetId: asset.uid,
        properties: {
          prop3: 'value3',
          prop4: 'value4',
          prop5: 'value5',
        },
      }

      const folderDTO: SetPropertiesDTO = {
        targetId: `folder-${folder.id}`,
        properties: {
          prop6: 'value6',
        },
      }

      const requests = [
        supertest(testedApp.getHttpServer())
          .post(`/cli/properties`)
          .send(fileDTO)
          .set('Accept', 'application/json')
          .set(getDefaultHeaderData(user))
          .expect(201),

        supertest(testedApp.getHttpServer())
          .post(`/cli/properties`)
          .send(assetDTO)
          .set('Accept', 'application/json')
          .set(getDefaultHeaderData(user))
          .expect(201),

        supertest(testedApp.getHttpServer())
          .post(`/cli/properties`)
          .send(folderDTO)
          .set('Accept', 'application/json')
          .set(getDefaultHeaderData(user))
          .expect(201),
      ]

      const responses = await Promise.all(requests)
      for (const body of responses.map(r => r.body)) {
        expect(body).to.be.empty()
      }
      em.clear()
      const savedFile = await em.findOneOrFail(UserFile, { id: file.id })
      const savedAsset = await em.findOneOrFail(Asset, { id: asset.id })
      const savedFolder = await em.findOneOrFail(Folder, { id: folder.id })
      // check if properties were set
      const fileProp = await savedFile.properties.load()
      const assetProp = await savedAsset.properties.load()
      const folderProp = await savedFolder.properties.load()
      // check that only two are there
      expect(fileProp).to.have.length(2)
      expect(assetProp).to.have.length(3)
      expect(folderProp).to.have.length(1)
      expect(fileProp[0].propertyName).to.equal('prop1')
      expect(fileProp[0].propertyValue).to.equal('value1')
      expect(fileProp[1].propertyName).to.equal('prop2')
      expect(fileProp[1].propertyValue).to.equal('value2')
      expect(assetProp[0].propertyName).to.equal('prop3')
      expect(assetProp[0].propertyValue).to.equal('value3')
      expect(assetProp[1].propertyName).to.equal('prop4')
      expect(assetProp[1].propertyValue).to.equal('value4')
      expect(assetProp[2].propertyName).to.equal('prop5')
      expect(assetProp[2].propertyValue).to.equal('value5')
      expect(folderProp[0].propertyName).to.equal('prop6')
      expect(folderProp[0].propertyValue).to.equal('value6')
    })

    it('POST /properties returns 403 for non-existing file', async () => {
      const fileProperties: SetPropertiesDTO = {
        targetId: 'file-nonexisting-1',
        properties: {
          prop1: 'value1',
          prop2: 'value2',
        },
      }

      const { body } = await supertest(testedApp.getHttpServer())
        .post(`/cli/properties`)
        .send(fileProperties)
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(403)

      expect(body.error).to.be.an('object')
      expect(body.error).to.have.property('code').that.equals(ErrorCodes.NOT_PERMITTED)
    })

    it('POST /properties returns 403 for not-editable file', async () => {
      const user2 = create.userHelper.create(em)
      await em.flush()
      const file = create.filesHelper.createUploaded(em, { user: user2 }, { name: 'test-file.txt' })
      await em.flush()

      const fileProperties: SetPropertiesDTO = {
        targetId: file.uid,
        properties: {
          prop1: 'value1',
          prop2: 'value2',
        },
      }

      const { body } = await supertest(testedApp.getHttpServer())
        .post(`/cli/properties`)
        .send(fileProperties)
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(403)

      expect(body.error).to.be.an('object')
      expect(body.error).to.have.property('code').that.equals(ErrorCodes.NOT_PERMITTED)
    })

    it('POST /properties sets properties on dbcluster, app, workflow ', async () => {
      const dbCluster = create.dbClusterHelper.create(em, { user })
      const appSeries = create.appSeriesHelper.create(em, { user }, { name: 'Properties App' })
      const workflowSeries = create.workflowSeriesHelper.create(em, { user })
      await em.flush()
      const app = create.appHelper.createRegular(em, { user }, { appSeriesId: appSeries.id })
      const workflow = create.workflowHelper.create(em, { user }, { workflowSeriesId: workflowSeries.id })
      await em.flush()
      const dbClusterDTO: SetPropertiesDTO = {
        targetId: dbCluster.uid,
        properties: {
          dbprop1: 'dbvalue1',
        },
      }
      const appDTO: SetPropertiesDTO = {
        targetId: app.uid,
        properties: {
          approp1: 'appvalue1',
        },
      }
      const workflowDTO: SetPropertiesDTO = {
        targetId: workflow.uid,
        properties: {
          wfprop1: 'wfvalue1',
        },
      }

      const requests = [
        supertest(testedApp.getHttpServer())
          .post(`/cli/properties`)
          .send(dbClusterDTO)
          .set('Accept', 'application/json')
          .set(getDefaultHeaderData(user))
          .expect(201),

        supertest(testedApp.getHttpServer())
          .post(`/cli/properties`)
          .send(appDTO)
          .set('Accept', 'application/json')
          .set(getDefaultHeaderData(user))
          .expect(201),

        supertest(testedApp.getHttpServer())
          .post(`/cli/properties`)
          .send(workflowDTO)
          .set('Accept', 'application/json')
          .set(getDefaultHeaderData(user))
          .expect(201),
      ]

      const responses = await Promise.all(requests)
      for (const body of responses.map(r => r.body)) {
        expect(body).to.be.empty()
      }
      em.clear()
      const savedDbCluster = await em.findOneOrFail(DbCluster, { id: dbCluster.id })
      const savedApp = await em.findOneOrFail(AppSeries, { id: appSeries.id })
      const savedWorkflow = await em.findOneOrFail(WorkflowSeries, { id: workflowSeries.id })

      // check if properties were set
      const dbClusterProp = await savedDbCluster.properties.load()
      const appProp = await savedApp.properties.load()
      const workflowProp = await savedWorkflow.properties.load()
      expect(dbClusterProp).to.have.length(1)
      expect(dbClusterProp[0].propertyName).to.equal('dbprop1')
      expect(dbClusterProp[0].propertyValue).to.equal('dbvalue1')
      expect(appProp).to.have.length(1)
      expect(appProp[0].propertyName).to.equal('approp1')
      expect(appProp[0].propertyValue).to.equal('appvalue1')
      expect(workflowProp).to.have.length(1)
      expect(workflowProp[0].propertyName).to.equal('wfprop1')
      expect(workflowProp[0].propertyValue).to.equal('wfvalue1')
    })

    it('POST /properties overrides existing properties', async () => {
      const file = create.filesHelper.createUploaded(em, { user })
      await em.flush()

      const fileDTO1: SetPropertiesDTO = {
        targetId: file.uid,
        properties: {
          prop1: 'value1',
          prop2: 'value2',
          prop3: 'value2',
          prop4: 'value2',
        },
      }
      const fileDTO2: SetPropertiesDTO = {
        targetId: file.uid,
        properties: {
          prop2: 'value2-new',
          prop5: 'value5',
        },
      }

      await supertest(testedApp.getHttpServer())
        .post(`/cli/properties`)
        .send(fileDTO1)
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(201)

      await supertest(testedApp.getHttpServer())
        .post(`/cli/properties`)
        .send(fileDTO2)
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(201)

      em.clear()
      const savedFile = await em.findOneOrFail(UserFile, { id: file.id })
      // check if properties were set
      const fileProp = await savedFile.properties.load()
      expect(fileProp).to.have.length(2)
      expect(fileProp[0].propertyName).to.equal('prop2')
      expect(fileProp[0].propertyValue).to.equal('value2-new')
      expect(fileProp[1].propertyName).to.equal('prop5')
      expect(fileProp[1].propertyValue).to.equal('value5')
    })
  })

  describe('cli remove nodes', () => {
    it('DELETE /nodes removes files by uids', async () => {
      const file1 = create.filesHelper.createUploaded(em, { user })
      const file2 = create.filesHelper.createUploaded(em, { user })
      await em.flush()

      const { text } = await supertest(testedApp.getHttpServer())
        .delete('/cli/nodes')
        .send({
          uids: [file1.uid, file2.uid],
        })
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(200)

      expect(parseInt(text, 10)).to.equal(2)
    })

    it('DELETE /nodes removes folders by ids', async () => {
      const folder1 = create.filesHelper.createFolder(em, { user })
      const folder2 = create.filesHelper.createFolder(em, { user })
      await em.flush()

      const { text } = await supertest(testedApp.getHttpServer())
        .delete('/cli/nodes')
        .send({
          ids: [folder1.id, folder2.id],
        })
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(200)

      expect(parseInt(text, 10)).to.equal(2)
    })

    it('DELETE /nodes returns 0 for non-existing files', async () => {
      const { text } = await supertest(testedApp.getHttpServer())
        .delete('/cli/nodes')
        .send({
          uids: ['file-nonexisting-1'],
        })
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(200)

      expect(parseInt(text, 10)).to.equal(0)
    })
  })

  describe('cli terminate job', () => {
    beforeEach(() => {
      mocksReset()
    })

    it('PATCH /jobs/:uid/terminate terminates a job', async () => {
      const app = create.appHelper.createHTTPS(em, { user }, { spec: generate.app.jupyterAppSpecData() })
      const job = create.jobHelper.create(em, { user, app }, { scope: 'private', state: JOB_STATE.IDLE })
      await em.flush()

      await supertest(testedApp.getHttpServer())
        .patch(`/cli/jobs/${job.uid}/terminate`)
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(200)

      expect(fakes.client.jobTerminateFake.calledOnce).to.be.true()
    })

    it('PATCH /jobs/:uid/terminate returns 404 for non-existing job', async () => {
      const { body } = await supertest(testedApp.getHttpServer())
        .patch('/cli/jobs/job-nonexisting-1/terminate')
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(404)

      expect(body).to.be.an('object')
      expect(body).to.have.property('error')
    })

    it('PATCH /jobs/:uid/terminate returns 404 for job owned by another user', async () => {
      const user2 = create.userHelper.create(em)
      const app = create.appHelper.createHTTPS(em, { user: user2 }, { spec: generate.app.jupyterAppSpecData() })
      const job = create.jobHelper.create(em, { user: user2, app }, { scope: 'private', state: JOB_STATE.IDLE })
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .patch(`/cli/jobs/${job.uid}/terminate`)
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(404)

      expect(body).to.be.an('object')
      expect(body).to.have.property('error')
    })

    it('PATCH /jobs/:uid/terminate returns 422 for an already terminated job', async () => {
      const app = create.appHelper.createHTTPS(em, { user }, { spec: generate.app.jupyterAppSpecData() })
      const job = create.jobHelper.create(em, { user, app }, { scope: 'private', state: JOB_STATE.TERMINATED })
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .patch(`/cli/jobs/${job.uid}/terminate`)
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(422)

      expect(body).to.have.property('error')
      expect(body.error).to.have.property('code', ErrorCodes.INVALID_STATE)
    })

    it('PATCH /jobs/:uid/terminate returns 422 for a terminating job', async () => {
      const app = create.appHelper.createHTTPS(em, { user }, { spec: generate.app.jupyterAppSpecData() })
      const job = create.jobHelper.create(em, { user, app }, { scope: 'private', state: JOB_STATE.TERMINATING })
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .patch(`/cli/jobs/${job.uid}/terminate`)
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(422)

      expect(body).to.have.property('error')
      expect(body.error).to.have.property('code', ErrorCodes.INVALID_STATE)
    })
  })

  describe('cli run app', () => {
    beforeEach(() => {
      mocksReset()
    })

    it('POST /apps/:uid/run runs an HTTPS app', async () => {
      const app = create.appHelper.createHTTPS(em, { user }, { spec: generate.app.jupyterAppSpecData() })
      await em.flush()

      const runData = {
        scope: 'private',
        jobLimit: 10,
        input: {},
      }

      const { body } = await supertest(testedApp.getHttpServer())
        .post(`/cli/apps/${app.uid}/run`)
        .send(runData)
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(201)

      expect(body).to.be.an('object')
      expect(body).to.have.property('jobUid').that.is.a('string')
      expect(fakes.client.jobCreateFake.calledOnce).to.be.true()
    })

    it('POST /apps/:uid/run returns 404 for non-existing app', async () => {
      const runData = {
        scope: 'private',
        jobLimit: 10,
        input: {},
      }

      const { body } = await supertest(testedApp.getHttpServer())
        .post('/cli/apps/app-nonexisting-1/run')
        .send(runData)
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(404)

      expect(body).to.have.property('error')
      expect(body.error).to.have.property('code').that.equals(ErrorCodes.APP_NOT_FOUND)
    })

    it('POST /apps/:uid/run with custom name and instance type', async () => {
      const app = create.appHelper.createHTTPS(em, { user }, { spec: generate.app.jupyterAppSpecData() })
      await em.flush()

      const runData = {
        scope: 'private',
        name: 'my-custom-job',
        instanceType: 'baseline-2',
        jobLimit: 5,
        inputs: {},
      }

      const { body } = await supertest(testedApp.getHttpServer())
        .post(`/cli/apps/${app.uid}/run`)
        .send(runData)
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(201)

      expect(body).to.be.an('object')
      expect(body).to.have.property('jobUid').that.is.a('string')
    })

    it('POST /apps/:uid/run applies CLI defaults when body fields are omitted', async () => {
      const app = create.appHelper.createHTTPS(em, { user }, { spec: generate.app.jupyterAppSpecData() })
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .post(`/cli/apps/${app.uid}/run`)
        .send({ inputs: {} })
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(201)

      expect(body).to.have.property('jobUid')
      const platformCall = fakes.client.jobCreateFake.getCall(0).args[0]
      expect(platformCall).to.have.property('name', `${app.title}-cli`)
    })

    it('POST /apps/:uid/run returns 404 for private app owned by another user', async () => {
      const user2 = create.userHelper.create(em)
      await em.flush()
      const app = create.appHelper.createHTTPS(
        em,
        { user: user2 },
        { scope: 'private', spec: generate.app.jupyterAppSpecData() },
      )
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .post(`/cli/apps/${app.uid}/run`)
        .send(generate.app.runAppInput())
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(404)

      expect(body).to.have.property('error')
      expect(body.error).to.have.property('code').that.equals(ErrorCodes.APP_NOT_FOUND)
    })

    it('POST /apps/:uid/run returns 422 for a regular app', async () => {
      const regularApp = create.appHelper.createRegular(em, { user })
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .post(`/cli/apps/${regularApp.uid}/run`)
        .send(generate.app.runAppInput())
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(422)

      expect(body.error).to.have.property('code', ErrorCodes.INVALID_STATE)
    })

    it('POST /apps/:uid/run runs an HTTPS app in a space scope', async () => {
      const groupSpace = create.spacesHelper.create(em, generate.space.group())
      await em.flush()
      create.spacesHelper.addMember(em, { user, space: groupSpace }, { role: SPACE_MEMBERSHIP_ROLE.LEAD })
      const app = create.appHelper.createHTTPS(em, { user }, { spec: generate.app.jupyterAppSpecData() })
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .post(`/cli/apps/${app.uid}/run`)
        .send({ scope: groupSpace.scope, inputs: {} })
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(201)

      expect(body).to.have.property('jobUid').that.is.a('string')
      expect(fakes.client.jobCreateFake.calledOnce).to.be.true()
    })
  })

  describe('cli list spaces', () => {
    it('GET /spaces returns active spaces for user by default', async () => {
      const space1 = create.spacesHelper.create(em, generate.space.group())
      const space2 = create.spacesHelper.create(em, generate.space.group())
      await em.flush()
      create.spacesHelper.addMember(em, { user, space: space1 }, { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR })
      create.spacesHelper.addMember(em, { user, space: space2 }, { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR })
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .get('/cli/spaces')
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(200)

      expect(body).to.be.an('array').of.length(2)
      const ids = body.map((s: { id: number }) => s.id)
      expect(ids).to.include(space1.id)
      expect(ids).to.include(space2.id)
    })

    it('GET /spaces?state=locked returns only locked spaces', async () => {
      const activeSpace = create.spacesHelper.create(em, { ...generate.space.group(), state: SPACE_STATE.ACTIVE })
      const lockedSpace = create.spacesHelper.create(em, { ...generate.space.group(), state: SPACE_STATE.LOCKED })
      await em.flush()
      create.spacesHelper.addMember(em, { user, space: activeSpace }, { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR })
      create.spacesHelper.addMember(em, { user, space: lockedSpace }, { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR })
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .get('/cli/spaces?state=locked')
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(200)

      expect(body).to.be.an('array').of.length(1)
      expect(body[0]).to.have.property('id', lockedSpace.id)
      expect(body[0]).to.have.property('state', 'locked')
    })

    it('GET /spaces?state=unactivated returns only unactivated spaces', async () => {
      const activeSpace = create.spacesHelper.create(em, { ...generate.space.group(), state: SPACE_STATE.ACTIVE })
      const unactivatedSpace = create.spacesHelper.create(em, {
        ...generate.space.group(),
        state: SPACE_STATE.UNACTIVATED,
      })
      await em.flush()
      create.spacesHelper.addMember(em, { user, space: activeSpace }, { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR })
      create.spacesHelper.addMember(em, { user, space: unactivatedSpace }, { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR })
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .get('/cli/spaces?state=unactivated')
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(200)

      expect(body).to.be.an('array').of.length(1)
      expect(body[0]).to.have.property('id', unactivatedSpace.id)
      expect(body[0]).to.have.property('state', 'unactivated')
    })

    it('GET /spaces?types[]=0 returns only group type spaces', async () => {
      const groupSpace = create.spacesHelper.create(em, generate.space.group())
      const reviewSpace = create.spacesHelper.create(em, generate.space.simple())
      await em.flush()
      create.spacesHelper.addMember(em, { user, space: groupSpace }, { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR })
      create.spacesHelper.addMember(em, { user, space: reviewSpace }, { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR })
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .get('/cli/spaces?types[]=0')
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(200)

      expect(body).to.be.an('array').of.length(1)
      expect(body[0]).to.have.property('id', groupSpace.id)
      expect(body[0]).to.have.property('type', 'groups')
    })

    it('GET /spaces?types[]=0&types[]=1 returns multiple types', async () => {
      const groupSpace = create.spacesHelper.create(em, generate.space.group())
      const reviewSpace = create.spacesHelper.create(em, generate.space.simple())
      await em.flush()
      create.spacesHelper.addMember(em, { user, space: groupSpace }, { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR })
      create.spacesHelper.addMember(em, { user, space: reviewSpace }, { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR })
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .get('/cli/spaces?types[]=0&types[]=1')
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(200)

      expect(body).to.be.an('array').of.length(2)
      const types = body.map((s: { type: string }) => s.type)
      expect(types).to.include('groups')
      expect(types).to.include('review')
    })

    it('GET /spaces?protected=true returns only protected spaces', async () => {
      const protectedSpace = create.spacesHelper.create(em, { ...generate.space.group(), protected: true })
      const unprotectedSpace = create.spacesHelper.create(em, { ...generate.space.group(), protected: false })
      await em.flush()
      create.spacesHelper.addMember(em, { user, space: protectedSpace }, { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR })
      create.spacesHelper.addMember(em, { user, space: unprotectedSpace }, { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR })
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .get('/cli/spaces?protected=true')
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(200)

      expect(body).to.be.an('array').of.length(1)
      expect(body[0]).to.have.property('id', protectedSpace.id)
      expect(body[0]).to.have.property('protected', true)
    })

    it('GET /spaces does not return spaces where user is not a member', async () => {
      const memberSpace = create.spacesHelper.create(em, generate.space.group())
      create.spacesHelper.create(em, generate.space.group()) // no membership
      await em.flush()
      create.spacesHelper.addMember(em, { user, space: memberSpace }, { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR })
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .get('/cli/spaces')
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(200)

      expect(body).to.be.an('array').of.length(1)
      expect(body[0]).to.have.property('id', memberSpace.id)
    })

    it('GET /spaces returns correct response shape', async () => {
      const space = create.spacesHelper.create(em, generate.space.group())
      await em.flush()
      create.spacesHelper.addMember(em, { user, space }, { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR })
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .get('/cli/spaces')
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(200)

      expect(body).to.be.an('array').of.length(1)
      expect(body[0]).to.have.property('id')
      expect(body[0]).to.have.property('title')
      expect(body[0]).to.have.property('type')
      expect(body[0]).to.have.property('state')
      expect(body[0]).to.have.property('protected')
      expect(body[0]).to.have.property('role')
      expect(body[0]).to.have.property('side')
    })
  })

  describe('cli list assets', () => {
    it('GET /assets returns private assets by default (no scope param)', async () => {
      const asset = create.assetHelper.create(em, { user }, { scope: 'private' })
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .get('/cli/assets')
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(200)

      expect(body).to.be.an('array').of.length(1)
      expect(body[0]).to.have.property('uid', asset.uid)
    })

    it("GET /assets?scope=private returns user's private assets", async () => {
      const asset = create.assetHelper.create(em, { user }, { scope: 'private' })
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .get('/cli/assets?scope=private')
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(200)

      expect(body).to.be.an('array').of.length(1)
      expect(body[0]).to.have.property('uid', asset.uid)
    })

    it('GET /assets?scope=public returns public assets', async () => {
      const asset = create.assetHelper.create(em, { user }, { scope: 'public' })
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .get('/cli/assets?scope=public')
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(200)

      expect(body).to.be.an('array').of.length(1)
      expect(body[0]).to.have.property('uid', asset.uid)
    })

    it('GET /assets?scope=public does not return private assets', async () => {
      create.assetHelper.create(em, { user }, { scope: 'private' })
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .get('/cli/assets?scope=public')
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(200)

      expect(body).to.be.an('array').of.length(0)
    })

    it("GET /assets (private) does not return other user's private assets", async () => {
      const user2 = create.userHelper.create(em)
      create.assetHelper.create(em, { user: user2 }, { scope: 'private' })
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .get('/cli/assets')
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(200)

      expect(body).to.be.an('array').of.length(0)
    })

    it('GET /assets returns correct response shape', async () => {
      create.assetHelper.create(em, { user }, { scope: 'private' })
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .get('/cli/assets')
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(200)

      expect(body).to.be.an('array').of.length(1)
      expect(body[0]).to.have.property('id')
      expect(body[0]).to.have.property('uid')
      expect(body[0]).to.have.property('name')
      expect(body[0]).to.have.property('type')
      expect(body[0]).to.have.property('state')
      expect(body[0]).to.have.property('scope')
      expect(body[0]).to.have.property('createdAt')
    })

    it('GET /assets?scope=space-{id} returns assets in a space', async () => {
      const groupSpace = create.spacesHelper.create(em, generate.space.group())
      await em.flush()
      create.spacesHelper.addMember(em, { user, space: groupSpace }, { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR })
      const asset = create.assetHelper.create(em, { user }, { scope: groupSpace.scope })
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .get(`/cli/assets?scope=space-${groupSpace.id}`)
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(200)

      expect(body).to.be.an('array').of.length(1)
      expect(body[0]).to.have.property('uid', asset.uid)
      expect(body[0]).to.have.property('scope', groupSpace.scope)
    })

    it('GET /assets?scope=space-{id} returns 404 for inaccessible space', async () => {
      const groupSpace = create.spacesHelper.create(em, generate.space.group())
      await em.flush()
      // Do NOT add user as member

      const { body } = await supertest(testedApp.getHttpServer())
        .get(`/cli/assets?scope=space-${groupSpace.id}`)
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(404)

      expect(body).to.have.property('error')
      expect(body.error).to.have.property('code', ErrorCodes.NOT_FOUND)
    })
  })

  describe('cli list jobs', () => {
    it('GET /jobs returns private jobs by default (no scope param)', async () => {
      const job = create.jobHelper.create(em, { user }, { scope: 'private' })
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .get('/cli/jobs')
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(200)

      expect(body).to.be.an('array').of.length(1)
      expect(body[0]).to.have.property('uid', job.uid)
    })

    it('GET /jobs?scope=public returns public jobs', async () => {
      const job = create.jobHelper.create(em, { user }, { scope: 'public' })
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .get('/cli/jobs?scope=public')
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(200)

      expect(body).to.be.an('array').of.length(1)
      expect(body[0]).to.have.property('uid', job.uid)
    })

    it('GET /jobs?scope=space-{id} returns jobs in a space', async () => {
      const groupSpace = create.spacesHelper.create(em, generate.space.group())
      await em.flush()
      create.spacesHelper.addMember(em, { user, space: groupSpace }, { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR })
      const job = create.jobHelper.create(em, { user }, { scope: groupSpace.scope })
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .get(`/cli/jobs?scope=space-${groupSpace.id}`)
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(200)

      expect(body).to.be.an('array').of.length(1)
      expect(body[0]).to.have.property('uid', job.uid)
      expect(body[0]).to.have.property('scope', groupSpace.scope)
    })

    it('GET /jobs?scope=space-{id} returns 404 for inaccessible space', async () => {
      const groupSpace = create.spacesHelper.create(em, generate.space.group())
      await em.flush()
      // Do NOT add user as member
      create.jobHelper.create(em, { user }, { scope: groupSpace.scope })
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .get(`/cli/jobs?scope=space-${groupSpace.id}`)
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(404)

      expect(body).to.be.an('object')
      expect(body).to.have.property('error').that.is.an('object')
      expect(body.error).to.have.property('code').that.equals(ErrorCodes.NOT_FOUND)
    })

    it("GET /jobs (private) does not return other user's private jobs", async () => {
      const user2 = create.userHelper.create(em)
      create.jobHelper.create(em, { user: user2 }, { scope: 'private' })
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .get('/cli/jobs')
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(200)

      expect(body).to.be.an('array').of.length(0)
    })

    it('GET /jobs returns correct response shape', async () => {
      create.jobHelper.create(em, { user }, { scope: 'private' })
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .get('/cli/jobs')
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(200)

      expect(body).to.be.an('array').of.length(1)
      expect(body[0]).to.have.property('id')
      expect(body[0]).to.have.property('uid')
      expect(body[0]).to.have.property('dxid')
      expect(body[0]).to.have.property('state')
      expect(body[0]).to.have.property('name')
      expect(body[0]).to.have.property('scope')
      expect(body[0]).to.have.property('createdAt')
    })

    it('GET /jobs?scope=invalid returns 400 validation error', async () => {
      await supertest(testedApp.getHttpServer())
        .get('/cli/jobs?scope=invalid')
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(400)
    })
  })

  describe('cli file download', () => {
    beforeEach(() => {
      mocksReset()
    })

    it('GET /files/:uid/download returns download link for a closed file', async () => {
      const file = create.filesHelper.createUploaded(em, { user })
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .get(`/cli/files/${file.uid}/download`)
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(200)

      expect(body).to.be.an('object')
      expect(body).to.have.property('fileUrl').that.is.a('string').and.includes(file.uid)
      expect(body).to.have.property('fileSize').that.is.a('number')
      expect(fakes.client.fileDownloadLinkFake.calledOnce).to.be.false()
    })

    it('GET /files/:uid/download returns 404 for non-existing file', async () => {
      const { body } = await supertest(testedApp.getHttpServer())
        .get('/cli/files/file-nonexisting-1/download')
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(404)

      expect(body).to.be.an('object')
      expect(body).to.have.property('error')
    })

    it('GET /files/:uid/download returns 404 for file owned by another user', async () => {
      const user2 = create.userHelper.create(em)
      await em.flush()
      const file = create.filesHelper.createUploaded(em, { user: user2 })
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .get(`/cli/files/${file.uid}/download`)
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(404)

      expect(body).to.be.an('object')
      expect(body).to.have.property('error')
    })

    it('GET /files/:uid/download returns 400 for non-closed file', async () => {
      const file = create.filesHelper.createUploaded(em, { user }, { state: FILE_STATE_DX.OPEN })
      await em.flush()

      const { body } = await supertest(testedApp.getHttpServer())
        .get(`/cli/files/${file.uid}/download`)
        .set('Accept', 'application/json')
        .set(getDefaultHeaderData(user))
        .expect(400)

      expect(body).to.be.an('object')
      expect(body).to.have.property('error')
    })
  })
})
