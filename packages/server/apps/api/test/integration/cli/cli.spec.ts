import { EntityManager } from '@mikro-orm/mysql'
import { User } from '@shared/domain/user/user.entity'
import { create, db } from '@shared/test'
import supertest from 'supertest'
import { database } from '@shared/database'
import { expect } from 'chai'
import { testedApp } from '../../index'
import { getDefaultHeaderData } from '../../utils/expect-helper'

describe('/cli', () => {
  let em: EntityManager
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
    expect(body.version).to.equal('2.9.0')
  })

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

    // Optional
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
