import { EntityManager } from '@mikro-orm/mysql'
import { expect } from 'chai'
import supertest from 'supertest'
import { database } from '@shared/database'
import { Answer } from '@shared/domain/answer/answer.entity'
import { Attachment } from '@shared/domain/attachment/attachment.entity'
import { Discussion } from '@shared/domain/discussion/discussion.entity'
import { DISCUSSION_REPLY_TYPE } from '@shared/domain/discussion-reply/discussion-reply.types'
import { DiscussionFollow } from '@shared/domain/follow/discussion-follow.entity'
import { SPACE_MEMBERSHIP_ROLE, SPACE_MEMBERSHIP_SIDE } from '@shared/domain/space-membership/space-membership.enum'
import { User } from '@shared/domain/user/user.entity'
import { STATIC_SCOPE } from '@shared/enums'
import { create, db, generate } from '@shared/test'
import { testedApp } from '../../index'
import { getDefaultHeaderData } from '../../utils/expect-helper'

describe('/discussions', async () => {
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

  it('should create a public discussion', async () => {
    const file = create.filesHelper.create(em, { user }, { scope: 'public' })
    await em.flush()

    const { body } = await supertest(testedApp.getHttpServer())
      .post('/discussions')
      .set(getDefaultHeaderData(user))
      .send({
        title: 'Discussion title',
        content: 'Discussion super interesting content - lorem ipsum',
        scope: 'public',
        attachments: { files: [file.id] },
      })
      .expect(201)

    expect(body.id).to.equal(1)
    const discussion = await em.findOneOrFail(Discussion, { id: body.id })
    const attachments = await em.findAll(Attachment)
    expect(discussion).to.exist()

    const note = await discussion.note.load()

    expect(note.title).to.equal('Discussion title')
    expect(note.title).to.equal('Discussion title')
    expect(attachments).to.have.length(1)
    expect(attachments[0].itemId).to.equal(file.id)
    expect(attachments[0].itemType).to.equal('Node')
  })

  it('should create a space discussion', async () => {
    const groupSpace = create.spacesHelper.create(em, generate.space.group())
    await em.flush()
    create.spacesHelper.addMember(
      em,
      { user: user, space: groupSpace },
      { role: SPACE_MEMBERSHIP_ROLE.LEAD, side: SPACE_MEMBERSHIP_SIDE.HOST },
    )
    const file = create.filesHelper.create(em, { user }, { scope: groupSpace.scope })
    await em.flush()

    const { body } = await supertest(testedApp.getHttpServer())
      .post('/discussions')
      .set(getDefaultHeaderData(user))
      .send({
        title: 'Space discussion title',
        content: 'Discussion super interesting content - lorem ipsum',
        scope: groupSpace.scope,
        attachments: { files: [file.id] },
      })
      .expect(201)

    expect(body.id).to.equal(1)
    const discussion = await em.findOneOrFail(Discussion, { id: body.id })
    const attachments = await em.findAll(Attachment)
    expect(discussion).to.exist()

    const note = await discussion.note.load()

    expect(note.title).to.equal('Space discussion title')
    expect(attachments).to.have.length(1)
    expect(attachments[0].itemId).to.equal(file.id)
    expect(attachments[0].itemType).to.equal('Node')
  })

  it('should create an answer in public discussion', async () => {
    const author = create.userHelper.create(em)
    const discussion = create.discussionHelper.createPublic(em, { user: author })
    await em.flush()

    const file = create.filesHelper.create(em, { user }, { scope: 'public' })
    await em.flush()

    const { body } = await supertest(testedApp.getHttpServer())
      .post(`/discussions/${discussion.id}/replies`)
      .set(getDefaultHeaderData(user))
      .send({
        discussionId: discussion.id,
        title: 'Discussion answer title',
        content: 'Discussion super interesting content - lorem ipsum',
        attachments: { files: [file.id] },
        notify: [],
        type: DISCUSSION_REPLY_TYPE.ANSWER,
      })
      .expect(201)

    expect(body.id).to.equal(1)
    const answer = await em.findOneOrFail(Answer, { id: body.id })
    expect(answer).to.exist()
    const note = await answer.note.load()
    expect(note.title).to.equal('Discussion answer title')
    expect(note.content).to.equal('Discussion super interesting content - lorem ipsum')
    const attachments = await note.attachments.load()
    expect(attachments).to.have.length(1)
    expect(attachments[0].itemId).to.equal(file.id)
    expect(attachments[0].itemType).to.equal('Node')
  })

  it('should create an answer in space discussion', async () => {
    const author = create.userHelper.create(em)
    const groupSpace = create.spacesHelper.create(em, generate.space.group())
    await em.flush()
    create.spacesHelper.addMember(
      em,
      { user: author, space: groupSpace },
      { role: SPACE_MEMBERSHIP_ROLE.LEAD, side: SPACE_MEMBERSHIP_SIDE.HOST },
    )
    create.spacesHelper.addMember(
      em,
      { user, space: groupSpace },
      { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR, side: SPACE_MEMBERSHIP_SIDE.HOST },
    )
    const discussion = create.discussionHelper.createInSpace(em, {
      user: author,
      space: groupSpace,
    })
    await em.flush()

    const file = create.filesHelper.create(em, { user }, { scope: groupSpace.scope })
    await em.flush()

    const { body } = await supertest(testedApp.getHttpServer())
      .post(`/discussions/${discussion.id}/replies`)
      .set(getDefaultHeaderData(user))
      .send({
        discussionId: discussion.id,
        title: 'Space discussion answer title',
        content: 'Discussion super interesting content - lorem ipsum',
        attachments: { files: [file.id] },
        notify: [],
        type: DISCUSSION_REPLY_TYPE.ANSWER,
      })
      .expect(201)

    expect(body.id).to.equal(1)
    const answer = await em.findOneOrFail(Answer, { id: body.id })
    expect(answer).to.exist()
    const note = await answer.note.load()
    expect(note.title).to.equal('Space discussion answer title')
    expect(note.content).to.equal('Discussion super interesting content - lorem ipsum')
    const attachments = await note.attachments.load()
    expect(attachments).to.have.length(1)
    expect(attachments[0].itemId).to.equal(file.id)
    expect(attachments[0].itemType).to.equal('Node')
  })

  it('should create a comment in public discussion', async () => {
    const author = create.userHelper.create(em)
    const discussion = create.discussionHelper.createPublic(em, { user: author })
    await em.flush()

    const { body } = await supertest(testedApp.getHttpServer())
      .post(`/discussions/${discussion.id}/replies`)
      .set(getDefaultHeaderData(user))
      .send({
        discussionId: discussion.id,
        title: 'comment',
        content: 'Discussion super interesting content - lorem ipsum',
        attachments: {},
        notify: [],
        type: DISCUSSION_REPLY_TYPE.COMMENT,
      })
      .expect(201)

    expect(body.id).to.equal(1)
  })

  it("should create a comment in a public discussion's answer", async () => {
    const author = create.userHelper.create(em)
    const discussion = create.discussionHelper.createPublic(em, { user: author })
    await em.flush()

    const answer = create.discussionHelper.createAnswer(em, {
      user: author,
      discussion,
      scope: STATIC_SCOPE.PUBLIC,
    })
    await em.flush()

    const { body } = await supertest(testedApp.getHttpServer())
      .post(`/discussions/${discussion.id}/replies`)
      .set(getDefaultHeaderData(user))
      .send({
        discussionId: discussion.id,
        title: 'comment',
        content: 'Discussion super interesting content - lorem ipsum',
        attachments: {},
        notify: [],
        parentId: answer.id,
        type: DISCUSSION_REPLY_TYPE.COMMENT,
      })
      .expect(201)

    expect(body.id).to.equal(2)
  })

  it('should create a comment in space discussion', async () => {
    const author = create.userHelper.create(em)
    const groupSpace = create.spacesHelper.create(em, generate.space.group())
    await em.flush()
    create.spacesHelper.addMember(
      em,
      { user: author, space: groupSpace },
      { role: SPACE_MEMBERSHIP_ROLE.LEAD, side: SPACE_MEMBERSHIP_SIDE.HOST },
    )
    create.spacesHelper.addMember(
      em,
      { user, space: groupSpace },
      { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR, side: SPACE_MEMBERSHIP_SIDE.HOST },
    )
    const discussion = create.discussionHelper.createInSpace(em, {
      user: author,
      space: groupSpace,
    })
    await em.flush()

    const { body } = await supertest(testedApp.getHttpServer())
      .post(`/discussions/${discussion.id}/replies`)
      .set(getDefaultHeaderData(user))
      .send({
        discussionId: discussion.id,
        title: 'comment',
        content: 'Discussion super interesting content - lorem ipsum',
        attachments: {},
        notify: [],
        type: DISCUSSION_REPLY_TYPE.COMMENT,
      })
      .expect(201)

    expect(body.id).to.equal(1)
  })

  it("should create a comment in a space discussion's answer", async () => {
    const author = create.userHelper.create(em)
    const groupSpace = create.spacesHelper.create(em, generate.space.group())
    await em.flush()
    create.spacesHelper.addMember(
      em,
      { user: author, space: groupSpace },
      { role: SPACE_MEMBERSHIP_ROLE.LEAD, side: SPACE_MEMBERSHIP_SIDE.HOST },
    )
    create.spacesHelper.addMember(
      em,
      { user, space: groupSpace },
      { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR, side: SPACE_MEMBERSHIP_SIDE.HOST },
    )
    const discussion = create.discussionHelper.createInSpace(em, {
      user: author,
      space: groupSpace,
    })
    await em.flush()

    const answer = create.discussionHelper.createAnswer(em, {
      user: author,
      discussion,
      scope: `space-${groupSpace.id}`,
    })
    await em.flush()

    const { body } = await supertest(testedApp.getHttpServer())
      .post(`/discussions/${discussion.id}/replies`)
      .set(getDefaultHeaderData(user))
      .send({
        discussionId: discussion.id,
        title: 'comment',
        content: 'Discussion super interesting content - lorem ipsum',
        attachments: {},
        notify: [],
        parentId: answer.id,
        type: DISCUSSION_REPLY_TYPE.COMMENT,
      })
      .expect(201)

    expect(body.id).to.equal(2)
  })

  it('follows a discussion', async () => {
    const author = create.userHelper.create(em)
    const discussion = create.discussionHelper.createPublic(em, { user: author })
    await em.flush()

    const { body } = await supertest(testedApp.getHttpServer())
      .post(`/discussions/${discussion.id}/follow`)
      .set(getDefaultHeaderData(user))
      .expect(204)

    expect(body).to.be.empty()

    const discussionFollow = await em.findAll(DiscussionFollow)
    expect(discussionFollow).to.exist()
    expect(discussionFollow).to.have.length(1)
    expect(discussionFollow[0].followerId).to.equal(user.id)
    expect(discussionFollow[0].followerType).to.equal('User')
    expect(discussionFollow[0].followableId.getProperty('id')).to.equal(discussion.id)
    expect(discussionFollow[0].followableType).to.equal('Discussion')
  })

  it('unfollows a discussion', async () => {
    const author = create.userHelper.create(em)
    const discussion = create.discussionHelper.createPublic(em, { user: author })
    await em.flush()

    await supertest(testedApp.getHttpServer())
      .post(`/discussions/${discussion.id}/follow`)
      .set(getDefaultHeaderData(user))
      .expect(204)

    const { body } = await supertest(testedApp.getHttpServer())
      .post(`/discussions/${discussion.id}/unfollow`)
      .set(getDefaultHeaderData(user))
      .expect(204)

    expect(body).to.be.empty()

    const discussionFollows = await em.findAll(DiscussionFollow)
    expect(discussionFollows).to.exist()
    expect(discussionFollows).to.have.length(0)
  })

  it('should get the list of discussions in the space', async () => {
    const groupSpace = create.spacesHelper.create(em, generate.space.group())
    create.spacesHelper.addMember(em, { user, space: groupSpace }, { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR })
    await em.flush()
    const discussion1 = create.discussionHelper.createInSpace(em, { user, space: groupSpace })
    await em.flush()
    const discussion2 = create.discussionHelper.createInSpace(em, { user, space: groupSpace })
    await em.flush()

    const { body } = await supertest(testedApp.getHttpServer())
      .get(`/discussions?scope=${groupSpace.scope}`)
      .set('Accept', 'application/json')
      .set(getDefaultHeaderData(user))
      .expect(200)

    expect(body.data).to.be.an('array').of.length(2)
    expect(body.data.map(d => d.id)).to.have.members([discussion1.id, discussion2.id])
  })

  it('should get the list of public discussions', async () => {
    const user2 = create.userHelper.create(em)
    const user3 = create.userHelper.create(em)
    await em.flush()
    const discussion1 = create.discussionHelper.createPublic(em, { user: user2 })
    await em.flush()
    const discussion2 = create.discussionHelper.createPublic(em, { user: user3 })
    await em.flush()

    const { body } = await supertest(testedApp.getHttpServer())
      .get('/discussions?scope=everybody')
      .set('Accept', 'application/json')
      .set(getDefaultHeaderData(user))
      .expect(200)

    expect(body.data).to.be.an('array').of.length(2)
    expect(body.data.map(d => d.id)).to.have.members([discussion1.id, discussion2.id])
  })
})
