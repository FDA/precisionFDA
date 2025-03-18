import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { database } from '@shared/database'
import { Discussion } from '@shared/domain/discussion/discussion.entity'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import { EntityFetcherService } from '@shared/domain/entity/entity-fetcher.service'
import { EntityService } from '@shared/domain/entity/entity.service'
import {
  SPACE_MEMBERSHIP_ROLE,
  SPACE_MEMBERSHIP_SIDE,
} from '@shared/domain/space-membership/space-membership.enum'
import { SpaceRepository } from '@shared/domain/space/space.repository'
import { User } from '@shared/domain/user/user.entity'
import { STATIC_SCOPE } from '@shared/enums'
import { expect } from 'chai'
import { stub } from 'sinon'
import { create, db, generate } from '../../../src/test'
import { CreateDiscussionDTO } from '@shared/domain/discussion/dto/create-discussion.dto'
import { UpdateDiscussionDTO } from '@shared/domain/discussion/dto/update-discussion.dto'
import DiscussionRepository from '@shared/domain/discussion/discussion.repository'
import { DiscussionFollow } from '@shared/domain/follow/discussion-follow.entity'
import { FILE_STI_TYPE } from '@shared/domain/user-file/user-file.types'
import { CreateAnswerDTO } from '@shared/domain/discussion/dto/create-answer.dto'
import { Answer } from '@shared/domain/answer/answer.entity'
import { EntityScope } from '@shared/types/common'
import { CreateCommentDTO } from '@shared/domain/discussion/dto/create-comment.dto'
import { DiscussionComment } from '@shared/domain/comment/discussion-comment.entity'
import { AnswerComment } from '@shared/domain/comment/answer-comment.entity'

describe('DiscussionService tests', () => {
  let em: EntityManager<MySqlDriver>
  let user: User
  let userCtx: UserCtx
  let discussionService: DiscussionService
  let entityService: EntityService
  let fetcher: EntityFetcherService
  let spaceRepository: SpaceRepository
  let discussionRepository: DiscussionRepository

  const EMPTY_ATTACHMENTS = {
    files: [],
    folders: [],
    assets: [],
    apps: [],
    jobs: [],
    comparisons: [],
  }
  const getEntityLinkStub = stub()
  const findOneStub = stub()

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork({ useContext: true }) as EntityManager<MySqlDriver>
    user = create.userHelper.create(em)
    await em.flush()
    userCtx = { ...user, accessToken: 'foo' }
    entityService = {
      getEntityLink: getEntityLinkStub,
    } as unknown as EntityService
    fetcher = new EntityFetcherService(em, userCtx)
    spaceRepository = new SpaceRepository(em, 'space')

    discussionRepository = {
      findOne: findOneStub,
    } as unknown as DiscussionRepository

    discussionService = new DiscussionService(
      em,
      userCtx,
      fetcher,
      entityService,
      spaceRepository,
      discussionRepository,
    )
    getEntityLinkStub.reset()
  })

  it('create discussion in space', async () => {
    const space = await createBasicSpace()
    const scope = space.scope
    const attachments = await generateAttachments(scope)

    const createDiscussionInput: CreateDiscussionDTO = {
      title: 'test-discussion',
      content: 'test-content',
      scope: space.scope,
      notify: [],
      attachments,
    }

    const result = await discussionService.createDiscussion(createDiscussionInput)

    const loadedDiscussion = await em.findOneOrFail(
      Discussion,
      { id: result.id },
      { populate: ['note', 'answers', 'comments'] },
    )
    const note = loadedDiscussion.note.getEntity()
    expect(note.title).eq(createDiscussionInput.title)
    expect(note.content).eq(createDiscussionInput.content)
    expect(note.scope).eq(scope)
    expect(note.noteType).eq('Discussion')

    const follow = await em.findOneOrFail(DiscussionFollow, { followableId: loadedDiscussion.id })
    expect(follow.followableType).eq('Discussion')
    expect(follow.followerId).eq(user.id)
    expect(follow.followerType).eq('User')
    expect(follow.blocked).eq(false)

    const savedAttachments = loadedDiscussion.note.getEntity().attachments.getItems()
    expect(savedAttachments.length).eq(6)
    expect(savedAttachments[0].itemId).eq(attachments.files[0])
    expect(savedAttachments[0].itemType).eq('Node')
    expect(savedAttachments[1].itemId).eq(attachments.folders[0])
    expect(savedAttachments[1].itemType).eq('Node')
    expect(savedAttachments[2].itemId).eq(attachments.assets[0])
    expect(savedAttachments[2].itemType).eq('Node')
    expect(savedAttachments[3].itemId).eq(attachments.apps[0])
    expect(savedAttachments[3].itemType).eq('App')
    expect(savedAttachments[4].itemId).eq(attachments.jobs[0])
    expect(savedAttachments[4].itemType).eq('Job')
    expect(savedAttachments[5].itemId).eq(attachments.comparisons[0])
    expect(savedAttachments[5].itemType).eq('Comparison')
  })

  it('create discussion with public scope', async () => {
    const scope = STATIC_SCOPE.PUBLIC
    const file = create.filesHelper.create(em, { user }, { name: 'file', scope })
    const asset = create.filesHelper.createAsset(em, { user }, { name: 'asset-file', scope })
    const app = create.appHelper.createRegular(em, { user }, { title: 'app', scope })
    const job = create.jobHelper.create(em, { user }, { name: 'job', scope })
    const comparison = create.comparisonHelper.create(
      em,
      {
        app,
        user,
      },
      { name: 'comparison-file', scope },
    )
    await em.flush()

    const createDiscussionInput: CreateDiscussionDTO = {
      title: 'test-discussion',
      content: 'test-content',
      scope: scope,
      notify: [],
      attachments: {
        files: [file.id],
        folders: [],
        assets: [asset.id],
        apps: [app.id],
        jobs: [job.id],
        comparisons: [comparison.id],
      },
    }

    const discussion = await discussionService.createDiscussion(createDiscussionInput)
    expect(discussion.scope).eq('public')
  })

  it('update public discussion', async () => {
    const discussion = create.discussionHelper.createPublic(em, { user }, {})
    const scope = STATIC_SCOPE.PUBLIC
    const file = create.filesHelper.create(em, { user }, { name: 'file', scope })
    const asset = create.filesHelper.createAsset(em, { user }, { name: 'asset-file', scope })
    const app = create.appHelper.createRegular(em, { user }, { title: 'app', scope })
    const job = create.jobHelper.create(em, { user }, { name: 'job', scope })
    const comparison = create.comparisonHelper.create(
      em,
      {
        app,
        user,
      },
      { name: 'comparison-file', scope },
    )
    await em.flush()

    const attachmentsNote = discussion.note.getEntity()
    create.attachmentHelper.create(
      em,
      { note: attachmentsNote },
      {
        itemId: file.id,
        itemType: 'Node',
      },
    )
    create.attachmentHelper.create(
      em,
      { note: attachmentsNote },
      {
        itemId: asset.id,
        itemType: 'Node',
      },
    )
    create.attachmentHelper.create(
      em,
      { note: attachmentsNote },
      {
        itemId: app.id,
        itemType: 'App',
      },
    )
    create.attachmentHelper.create(
      em,
      { note: attachmentsNote },
      {
        itemId: job.id,
        itemType: 'Job',
      },
    )
    create.attachmentHelper.create(
      em,
      { note: attachmentsNote },
      {
        itemId: comparison.id,
        itemType: 'Comparison',
      },
    )
    await em.flush()

    let updateDiscussionInput: UpdateDiscussionDTO = {
      title: 'updated-title',
      content: 'updated-content',
      attachments: EMPTY_ATTACHMENTS,
    }

    // then update a discussion
    await discussionService.updateDiscussion(discussion.id, updateDiscussionInput)

    let loadedDiscussion = await em.findOneOrFail(
      Discussion,
      { id: discussion.id },
      { populate: ['note', 'note.attachments'] },
    )
    let note = loadedDiscussion.note.getEntity()
    expect(note.title).eq('updated-title')
    expect(note.content).eq('updated-content')
    expect(note.scope).eq('public')
    expect(note.noteType).eq('Discussion')
    expect(note.attachments.getItems().length).eq(0)

    updateDiscussionInput = {
      title: 'updated-title',
      content: 'updated-content',
      attachments: {
        files: [file.id],
        folders: [],
        assets: [asset.id],
        apps: [app.id],
        jobs: [job.id],
        comparisons: [],
      },
    }
    await discussionService.updateDiscussion(discussion.id, updateDiscussionInput)

    loadedDiscussion = await em.findOneOrFail(
      Discussion,
      { id: discussion.id },
      { populate: ['note', 'note.attachments'] },
    )
    note = loadedDiscussion.note.getEntity()
    expect(note.title).eq('updated-title')
    expect(note.content).eq('updated-content')
    expect(note.scope).eq('public')
    expect(note.noteType).eq('Discussion')
    expect(note.attachments.getItems().length).eq(4)
    expect(note.attachments.getItems()[0].itemId).eq(file.id)
    expect(note.attachments.getItems()[0].itemType).eq('Node')
    expect(note.attachments.getItems()[1].itemId).eq(asset.id)
    expect(note.attachments.getItems()[1].itemType).eq('Node')
    expect(note.attachments.getItems()[2].itemId).eq(app.id)
    expect(note.attachments.getItems()[2].itemType).eq('App')
    expect(note.attachments.getItems()[3].itemId).eq(job.id)
    expect(note.attachments.getItems()[3].itemType).eq('Job')
  })

  it('create discussion with non existing user', async () => {
    userCtx = { id: 10, dxuser: 'non-existing', accessToken: 'foo' }
    const fetcher = new EntityFetcherService(em, userCtx)
    discussionService = new DiscussionService(
      em,
      userCtx,
      fetcher,
      entityService,
      spaceRepository,
      discussionRepository,
    )

    const createDiscussionInput: CreateDiscussionDTO = {
      title: 'test-discussion',
      content: 'test-content',
      scope: 'public',
      notify: [],
      attachments: EMPTY_ATTACHMENTS,
    }

    try {
      await discussionService.createDiscussion(createDiscussionInput)
      expect.fail('Operation is expected to fail.')
    } catch (error) {
      expect(error.name).to.equal('NotFoundError')
      expect(error.message).eq('User not found ({ id: 10 })')
    }
  })

  it('create discussion in space without permission', async () => {
    const space = create.spacesHelper.create(em, generate.space.group())
    await em.flush()
    const scope = space.scope

    const file = create.filesHelper.create(em, { user }, { name: 'file', scope })
    await em.flush()

    const createDiscussionInput: CreateDiscussionDTO = {
      title: 'test-discussion',
      content: 'test-content',
      scope: scope as EntityScope,
      notify: [],
      attachments: {
        files: [file.id],
        folders: [],
        assets: [],
        apps: [],
        jobs: [],
        comparisons: [],
      },
    }

    try {
      await discussionService.createDiscussion(createDiscussionInput)
      expect.fail('Operation is expected to fail.')
    } catch (error) {
      expect(error.name).to.equal('PermissionError')
      expect(error.message).eq(
        'Unable to create discussion: insufficient permissions to access the space.',
      )
    }
  })

  it('create discussion in space with discussions disabled', async () => {
    const space = create.spacesHelper.create(em, generate.space.simple())
    create.spacesHelper.addMember(em, { user, space })
    space.meta.restricted_discussions = true

    await em.flush()
    const scope = space.scope

    const file = create.filesHelper.create(em, { user }, { name: 'file', scope })
    await em.flush()

    const createDiscussionInput: CreateDiscussionDTO = {
      title: 'test-discussion',
      content: 'test-content',
      scope: scope,
      notify: [],
      attachments: {
        files: [file.id],
        folders: [],
        assets: [],
        apps: [],
        jobs: [],
        comparisons: [],
      },
    }

    try {
      await discussionService.createDiscussion(createDiscussionInput)
      expect.fail('Operation is expected to fail.')
    } catch (error) {
      expect(error.name).to.equal('InvalidStateError')
      expect(error.message).eq('Unable to create discussion: the space has restricted discussions.')
    }
  })

  it('create discussion in space with attachment in wrong scope', async () => {
    const space = await createBasicSpace()

    const scope = space.scope

    const file = create.filesHelper.create(em, { user }, { name: 'file', scope })
    const folder = create.filesHelper.createFolder(em, { user }, { name: 'folder', scope })
    const asset = create.filesHelper.createAsset(em, { user }, { name: 'asset-file', scope })
    const app = create.appHelper.createRegular(em, { user }, { title: 'app', scope })
    const job = create.jobHelper.create(em, { user }, { name: 'job', scope: STATIC_SCOPE.PRIVATE })
    const comparison = create.comparisonHelper.create(
      em,
      {
        app,
        user,
      },
      { name: 'comparison-file', scope },
    )
    await em.flush()

    const createDiscussionInput: CreateDiscussionDTO = {
      title: 'test-discussion',
      content: 'test-content',
      scope: scope,
      notify: [],
      attachments: {
        files: [file.id],
        folders: [folder.id],
        assets: [asset.id],
        apps: [app.id],
        jobs: [job.id],
        comparisons: [comparison.id],
      },
    }

    try {
      await discussionService.createDiscussion(createDiscussionInput)
      expect.fail('Operation is expected to fail.')
    } catch (error) {
      expect(error.name).to.equal('NotFoundError')
      expect(error.message).eq(`Unable to attach ${job.uid}: job not found or is in a wrong scope.`)
    }
  })

  it('create discussion in space with attachment that is not accessible by user', async () => {
    const space = await createBasicSpace()

    const scope = space.scope

    const file = create.filesHelper.create(em, { user }, { name: 'file', scope })
    const folder = create.filesHelper.createFolder(em, { user }, { name: 'folder-1', scope })
    const asset = create.filesHelper.createAsset(em, { user }, { name: 'asset-file', scope })
    const app = create.appHelper.createRegular(em, { user }, { title: 'app', scope })
    const job = create.jobHelper.create(em, { user }, { name: 'job', scope: STATIC_SCOPE.PRIVATE })
    const comparison = create.comparisonHelper.create(
      em,
      {
        app,
        user,
      },
      { name: 'comparison-file', scope },
    )
    await em.flush()

    const createDiscussionInput: CreateDiscussionDTO = {
      title: 'test-discussion',
      content: 'test-content',
      scope: scope,
      notify: [],
      attachments: {
        files: [file.id],
        folders: [folder.id],
        assets: [asset.id],
        apps: [app.id],
        jobs: [job.id],
        comparisons: [comparison.id],
      },
    }

    try {
      await discussionService.createDiscussion(createDiscussionInput)
      expect.fail('Operation is expected to fail.')
    } catch (error) {
      expect(error.name).to.equal('NotFoundError')
      expect(error.message).eq(`Unable to attach ${job.uid}: job not found or is in a wrong scope.`)
    }
  })

  it('create an answer in a space discussion', async () => {
    const space = await createBasicSpace()
    const discussion = create.discussionHelper.createInSpace(em, { user, space })

    const scope = space.scope
    const attachments = await generateAttachments(scope)

    await em.flush()

    const createAnswerDTO: CreateAnswerDTO = {
      discussionId: discussion.id,
      title: 'answer',
      content: 'test-content',
      notify: [],
      attachments,
    }

    const result = await discussionService.createAnswer(createAnswerDTO)

    const loadedAnswer = await em.findOneOrFail(Answer, { id: result.id }, { populate: ['note'] })
    const note = loadedAnswer.note.getEntity()
    expect(note.content).eq(createAnswerDTO.content)
    expect(note.noteType).eq('Answer')
    expect(note.scope).eq(space.scope)
  })

  it('create a discussion comment in a space discussion', async () => {
    const space = await createBasicSpace()
    const discussion = create.discussionHelper.createInSpace(em, { user, space })

    await em.flush()

    const createCommentDTO: CreateCommentDTO = {
      discussionId: discussion.id,
      content: 'test-content',
      notify: [],
    }

    const result = await discussionService.createComment(createCommentDTO)
    const loadedComment = await em.findOneOrFail(DiscussionComment, { id: result.id })
    expect(loadedComment.body).eq(createCommentDTO.content)
    expect(loadedComment.commentableType).eq('Discussion')
    expect(loadedComment.commentable.id).eq(discussion.id)
  })

  it('create an answer comment in a space discussion', async () => {
    const space = await createBasicSpace()
    const discussion = create.discussionHelper.createInSpace(em, { user, space })
    const answer = create.discussionHelper.createAnswer(em, { user, discussion })

    await em.flush()

    const createCommentDTO: CreateCommentDTO = {
      answerId: answer.id,
      content: 'test-content',
      notify: [],
    }

    const result = await discussionService.createComment(createCommentDTO)

    const loadedComment = await em.findOneOrFail(AnswerComment, { id: result.id })
    expect(loadedComment.body).eq(createCommentDTO.content)
    expect(loadedComment.commentableType).eq('Answer')
    expect(loadedComment.commentable.id).eq(answer.id)
  })

  it('create a new follow for a discussion', async () => {
    const space = await createBasicSpace()
    const discussion = create.discussionHelper.createInSpace(em, { user, space })
    await em.flush()

    findOneStub.resolves(discussion)

    await discussionService.followDiscussion(discussion.id)
    expect(await em.count(DiscussionFollow, { followableId: discussion.id })).eq(1)
  })

  it('remove a public discussion as author', async () => {
    const discussion = create.discussionHelper.createPublic(em, { user })
    await em.flush()

    findOneStub.resolves(discussion)

    await discussionService.deleteDiscussion(discussion.id)
    expect(await em.count(Discussion, { id: discussion.id })).eq(0)
  })

  it('remove a public discussion as site admin', async () => {
    const discussion = create.discussionHelper.createPublic(em, { user })
    const adminUser = create.userHelper.createSiteAdmin(em)
    await em.flush()

    findOneStub.resolves(discussion)

    const adminUserCtx = {
      user: adminUser,
      id: adminUser.id,
      dxuser: adminUser.dxuser,
      accessToken: 'foo',
    }

    discussionService = new DiscussionService(
      em,
      adminUserCtx,
      fetcher,
      entityService,
      spaceRepository,
      discussionRepository,
    )

    await discussionService.deleteDiscussion(discussion.id)
    expect(await em.count(Discussion, { id: discussion.id })).eq(0)
  })
  it('fail removing a public discussion as non-author', async () => {
    const differentUser = create.userHelper.create(em)
    const discussion = create.discussionHelper.createPublic(em, { user: differentUser })
    await em.flush()

    findOneStub.resolves(discussion)

    try {
      await discussionService.deleteDiscussion(discussion.id)
      expect.fail('Operation is expected to fail.')
    } catch (error) {
      expect(error.name).to.equal('NotFoundError')
      expect(error.message).eq(
        `Unable to delete discussion: not found or insufficient permissions.`,
      )
    }
  })
  it('remove a space discussion as author', async () => {
    const space = await createBasicSpace()
    const discussion = create.discussionHelper.createInSpace(em, { user, space })
    await em.flush()
    findOneStub.resolves(discussion)

    await discussionService.deleteDiscussion(discussion.id)
    expect(await em.count(Discussion, { id: discussion.id })).eq(0)
  })

  async function createBasicSpace() {
    const space = create.spacesHelper.create(em, generate.space.group())
    const guestLead = create.userHelper.create(em, { email: generate.random.chance.email() })
    const hostLead = create.userHelper.create(em, { email: generate.random.chance.email() })

    create.spacesHelper.addMember(em, { user, space })
    create.spacesHelper.addMember(
      em,
      { user: guestLead, space },
      { role: SPACE_MEMBERSHIP_ROLE.LEAD },
    )
    create.spacesHelper.addMember(
      em,
      { user: hostLead, space },
      {
        role: SPACE_MEMBERSHIP_ROLE.LEAD,
        side: SPACE_MEMBERSHIP_SIDE.HOST,
      },
    )
    await em.flush()
    return space
  }

  async function generateAttachments(scope: EntityScope) {
    const file = create.filesHelper.create(em, { user }, { name: 'file-1', scope })
    const folder = create.filesHelper.createFolder(em, { user }, { name: 'folder-1', scope })
    const asset = create.assetHelper.create(
      em,
      { user },
      { name: 'asset-file', scope, stiType: FILE_STI_TYPE.ASSET },
    )
    const app = create.appHelper.createRegular(em, { user }, { title: 'app-1', scope })
    const job = create.jobHelper.create(em, { user }, { name: 'job-1', scope })
    const comparison = create.comparisonHelper.create(
      em,
      {
        app,
        user,
      },
      { name: 'comparison-1', scope },
    )

    await em.flush()

    return {
      files: [file.id],
      folders: [folder.id],
      assets: [asset.id],
      apps: [app.id],
      jobs: [job.id],
      comparisons: [comparison.id],
    }
  }
})
