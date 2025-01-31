import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { database } from '@shared/database'
import { App } from '@shared/domain/app/app.entity'
import { Comparison } from '@shared/domain/comparison/comparison.entity'
import { Discussion } from '@shared/domain/discussion/discussion.entity'
import { DiscussionQueueJobProducer } from '@shared/domain/discussion/producer/discussion-queue-job.producer'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import { PublisherService } from '@shared/domain/discussion/services/publisher.service'
import { EntityFetcherService } from '@shared/domain/entity/entity-fetcher.service'
import { EntityService } from '@shared/domain/entity/entity.service'
import { Follow } from '@shared/domain/follow/follow.entity'
import { Job } from '@shared/domain/job/job.entity'
import {
  SPACE_MEMBERSHIP_ROLE,
  SPACE_MEMBERSHIP_SIDE,
} from '@shared/domain/space-membership/space-membership.enum'
import { SpaceRepository } from '@shared/domain/space/space.repository'
import { User } from '@shared/domain/user/user.entity'
import { STATIC_SCOPE, Scope } from '@shared/enums'
import { PlatformClient } from '@shared/platform-client'
import { expect } from 'chai'
import { stub } from 'sinon'
import { create, db, generate } from '../../../src/test'
import { CreateDiscussionDTO } from '@shared/domain/discussion/dto/create-discussion.dto'
import { CreateAnswerDTO } from '@shared/domain/discussion/dto/create-answer.dto'
import { UpdateDiscussionDTO } from '@shared/domain/discussion/dto/update-discussion.dto'
import { CreateCommentDTO } from '@shared/domain/discussion/dto/create-comment.dto'

describe('DiscussionService tests', () => {
  let em: EntityManager<MySqlDriver>
  let user: User
  let userCtx: UserCtx
  let discussionService: DiscussionService
  let entityService: EntityService
  let fetcher: EntityFetcherService
  let discussionQueueJobProducer: DiscussionQueueJobProducer
  let spaceRepository: SpaceRepository

  const EMPTY_ATTACHMENTS = {
    files: [],
    folders: [],
    assets: [],
    apps: [],
    jobs: [],
    comparisons: [],
  }
  const getEntityLinkStub = stub()
  const createSpaceNotificationTaskStub = stub()

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork({ useContext: true }) as EntityManager<MySqlDriver>
    user = create.userHelper.create(em)
    await em.flush()
    userCtx = { ...user, accessToken: 'foo' }
    const mockedPublisherService = {
      /* eslint-disable @typescript-eslint/no-unused-vars */
      async publishNodes(nodes: Node[], user: User, scope: string): Promise<number> {
        return nodes.length
      },
      /* eslint-disable @typescript-eslint/no-unused-vars */
      async publishApps(apps: App[], user: User, scope: string): Promise<number> {
        return apps.length
      },
      async publishComparisons(
        comparisons: Comparison[],
        user: User,
        scope: string,
      ): Promise<number> {
        return comparisons.length
      },
      async publishJobs(jobs: Job[], user: User, scope: string): Promise<number> {
        return jobs.length
      },
    } as unknown as PublisherService
    entityService = {
      getEntityLink: getEntityLinkStub,
    } as unknown as EntityService
    fetcher = new EntityFetcherService(em, userCtx)
    discussionQueueJobProducer = {
      createSpaceNotificationTask: createSpaceNotificationTaskStub,
    } as unknown as DiscussionQueueJobProducer
    spaceRepository = new SpaceRepository(em, 'space')
    discussionService = new DiscussionService(
      em,
      userCtx,
      mockedPublisherService,
      fetcher,
      entityService,
      discussionQueueJobProducer,
      spaceRepository,
    )
    getEntityLinkStub.reset()
    createSpaceNotificationTaskStub.reset()
  })

  it('create discussion', async () => {
    const file = create.filesHelper.create(em, { user }, { name: 'file' })
    const folder = create.filesHelper.createFolder(em, { user }, { name: 'folder-1' })
    const asset = create.filesHelper.create(em, { user }, { name: 'asset-file' })
    const app = create.appHelper.createRegular(em, { user }, { title: 'app-file' })
    const job = create.jobHelper.create(em, { user }, { name: 'job' })
    const comparison = create.comparisonHelper.create(
      em,
      {
        app,
        user,
      },
      { name: 'comparison-file' },
    )
    await em.flush()

    const createDiscussionInput: CreateDiscussionDTO = {
      title: 'test-discussion',
      content: 'test-content',
      scope: 'public',
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

    const result = await discussionService.createDiscussion(createDiscussionInput)

    const loadedDiscussion = await em.findOneOrFail(
      Discussion,
      { id: result.id },
      { populate: ['note', 'answers', 'comments'] },
    )
    const note = loadedDiscussion.note.getEntity()
    expect(note.title).eq(createDiscussionInput.title)
    expect(note.content).eq(createDiscussionInput.content)
    expect(note.scope).eq('public')
    expect(note.noteType).eq('Discussion')

    const follow = await em.findOneOrFail(Follow, { followableId: loadedDiscussion.id })
    expect(follow.followableType).eq('Discussion')
    expect(follow.followerId).eq(user.id)
    expect(follow.followerType).eq('User')
    expect(follow.blocked).eq(false)

    const attachments = loadedDiscussion.note.getEntity().attachments.getItems()
    expect(attachments.length).eq(6)
    expect(attachments[0].itemId).eq(file.id)
    expect(attachments[0].itemType).eq('Node')
    expect(attachments[1].itemId).eq(folder.id)
    expect(attachments[1].itemType).eq('Node')
    expect(attachments[2].itemId).eq(asset.id)
    expect(attachments[2].itemType).eq('Node')
    expect(attachments[3].itemId).eq(app.id)
    expect(attachments[3].itemType).eq('App')
    expect(attachments[4].itemId).eq(job.id)
    expect(attachments[4].itemType).eq('Job')
    expect(attachments[5].itemId).eq(comparison.id)
    expect(attachments[5].itemType).eq('Comparison')
  })

  it('update discussion', async () => {
    // first create a discussion
    const discussion = create.discussionHelper.createPublic(em, { user }, {})
    await em.flush()
    const file = create.filesHelper.create(em, { user }, { name: 'file' })
    const folder = create.filesHelper.createFolder(em, { user }, { name: 'folder' })
    const asset = create.filesHelper.create(em, { user }, { name: 'asset-file' })
    const app = create.appHelper.createRegular(em, { user }, { title: 'app' })
    const job = create.jobHelper.create(em, { user }, { name: 'job' })
    const comparison = create.comparisonHelper.create(
      em,
      {
        app,
        user,
      },
      { name: 'comparison-file' },
    )
    await em.flush()

    create.attachmentHelper.create(
      em,
      { note: discussion.note.getEntity() },
      {
        itemId: file.id,
        itemType: 'Node',
      },
    )
    create.attachmentHelper.create(
      em,
      { note: discussion.note.getEntity() },
      {
        itemId: folder.id,
        itemType: 'Node',
      },
    )
    create.attachmentHelper.create(
      em,
      { note: discussion.note.getEntity() },
      {
        itemId: asset.id,
        itemType: 'Node',
      },
    )
    create.attachmentHelper.create(
      em,
      { note: discussion.note.getEntity() },
      {
        itemId: app.id,
        itemType: 'App',
      },
    )
    create.attachmentHelper.create(
      em,
      { note: discussion.note.getEntity() },
      {
        itemId: job.id,
        itemType: 'Job',
      },
    )
    create.attachmentHelper.create(
      em,
      { note: discussion.note.getEntity() },
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

    // then add old attachments back to discussion, except one
    updateDiscussionInput = {
      title: 'updated-title',
      content: 'updated-content',
      attachments: {
        files: [file.id],
        folders: [folder.id],
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
    expect(note.attachments.getItems().length).eq(5)
    expect(note.attachments.getItems()[0].itemId).eq(file.id)
    expect(note.attachments.getItems()[0].itemType).eq('Node')
    expect(note.attachments.getItems()[1].itemId).eq(folder.id)
    expect(note.attachments.getItems()[1].itemType).eq('Node')
    expect(note.attachments.getItems()[2].itemId).eq(asset.id)
    expect(note.attachments.getItems()[2].itemType).eq('Node')
    expect(note.attachments.getItems()[3].itemId).eq(app.id)
    expect(note.attachments.getItems()[3].itemType).eq('App')
    expect(note.attachments.getItems()[4].itemId).eq(job.id)
    expect(note.attachments.getItems()[4].itemType).eq('Job')
  })

  it('create discussion with non existing user', async () => {
    userCtx = { id: 10, dxuser: 'non-existing', accessToken: 'foo' }
    const publisherService = new PublisherService(em, new PlatformClient({ accessToken: 'foo' }))
    const fetcher = new EntityFetcherService(em, userCtx)
    discussionService = new DiscussionService(
      em,
      userCtx,
      publisherService,
      fetcher,
      entityService,
      discussionQueueJobProducer,
      spaceRepository,
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
      expect(error.name).to.equal('NotFoundError')
      expect(error.message).eq('Unable to attach file 1: file not found or inaccessible.')
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
      expect(error.message).eq('Unable to publish discussion: space has restricted discussions.')
    }
  })

  it('create discussion with public scope', async () => {
    await em.flush()
    const file = create.filesHelper.create(em, { user }, { name: 'file' })
    const asset = create.filesHelper.createUploadedAsset(em, { user }, { name: 'asset-file' })
    const app = create.appHelper.createRegular(em, { user }, { title: 'app' })
    const job = create.jobHelper.create(em, { user }, { name: 'job' })
    const comparison = create.comparisonHelper.create(
      em,
      {
        app,
        user,
      },
      { name: 'comparison-file' },
    )
    await em.flush()

    const createDiscussionInput: CreateDiscussionDTO = {
      title: 'test-discussion',
      content: 'test-content',
      scope: 'public',
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
    expect(discussion.note.scope).eq('public')
  })

  it('create discussion in space with attachment in wrong scope', async () => {
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

    const scope = space.scope

    const file = create.filesHelper.create(em, { user }, { name: 'file', scope })
    const folder = create.filesHelper.createFolder(em, { user }, { name: 'folder', scope })
    const asset = create.filesHelper.createUploadedAsset(
      em,
      { user },
      {
        name: 'asset-file',
        scope,
      },
    )
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
      expect(error.name).to.equal('InvalidStateError')
      expect(error.message).eq('Unable to publish job - job is not in the space or is not public.')
    }
  })

  it('create discussion in space with attachment that is not accessible by user', async () => {
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

    const scope = space.scope

    const file = create.filesHelper.create(em, { user }, { name: 'file', scope })
    const folder = create.filesHelper.createFolder(em, { user }, { name: 'folder-1', scope })
    const asset = create.filesHelper.createUploadedAsset(
      em,
      { user },
      {
        name: 'asset-file',
        scope,
      },
    )
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
      expect(error.name).to.equal('InvalidStateError')
      expect(error.message).eq('Unable to publish job - job is not in the space or is not public.')
    }
  })

  context('create discussion in space and create task to notify members', () => {
    it('should send discussionId and notify all members', async () => {
      const space = create.spacesHelper.create(em, generate.space.group())
      const guestLead = create.userHelper.create(em, { email: generate.random.chance.email() })
      const hostLead = create.userHelper.create(em, { email: generate.random.chance.email() })
      await em.flush()
      const scope = `space-${space.id}` as Scope
      create.spacesHelper.addMember(
        em,
        { user: hostLead, space },
        { role: SPACE_MEMBERSHIP_ROLE.LEAD, side: SPACE_MEMBERSHIP_SIDE.HOST },
      )
      create.spacesHelper.addMember(
        em,
        { user: guestLead, space },
        { role: SPACE_MEMBERSHIP_ROLE.LEAD, side: SPACE_MEMBERSHIP_SIDE.GUEST },
      )
      create.spacesHelper.addMember(
        em,
        { user, space },
        { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR, side: SPACE_MEMBERSHIP_SIDE.HOST },
      )
      await em.flush()

      const createDiscussionInput: CreateDiscussionDTO = {
        title: 'test-discussion',
        content: 'test-content',
        scope: scope,
        notify: 'all',
        attachments: EMPTY_ATTACHMENTS,
      }
      const discussion = await discussionService.createDiscussion(createDiscussionInput)
      expect(createSpaceNotificationTaskStub.callCount).eq(1)
      expect(createSpaceNotificationTaskStub.args[0][0]).to.be.equal(discussion.id)
      expect(createSpaceNotificationTaskStub.args[0][1]).to.be.equal(createDiscussionInput.notify)
    })

    it('value should be false if notify is empty', async () => {
      const space = create.spacesHelper.create(em, generate.space.group())
      const guestLead = create.userHelper.create(em, { email: generate.random.chance.email() })
      const hostLead = create.userHelper.create(em, { email: generate.random.chance.email() })
      await em.flush()
      create.spacesHelper.addMember(
        em,
        { user: hostLead, space },
        { role: SPACE_MEMBERSHIP_ROLE.LEAD, side: SPACE_MEMBERSHIP_SIDE.HOST },
      )
      create.spacesHelper.addMember(
        em,
        { user: guestLead, space },
        { role: SPACE_MEMBERSHIP_ROLE.LEAD, side: SPACE_MEMBERSHIP_SIDE.GUEST },
      )
      create.spacesHelper.addMember(
        em,
        { user, space },
        { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR, side: SPACE_MEMBERSHIP_SIDE.HOST },
      )
      await em.flush()
      const scope = `space-${space.id}` as Scope

      const createDiscussionInput: CreateDiscussionDTO = {
        title: 'test-discussion',
        content: 'test-content',
        scope: scope,
        notify: [],
        attachments: EMPTY_ATTACHMENTS,
      }

      await discussionService.createDiscussion(createDiscussionInput)
      expect(createSpaceNotificationTaskStub.callCount).eq(0)
    })

    it('should not create task if discussion is not in space', async () => {
      await em.flush()
      await em.flush()

      const createDiscussionInput: CreateDiscussionDTO = {
        title: 'test-discussion',
        content: 'test-content',
        scope: STATIC_SCOPE.PUBLIC,
        notify: 'all',
        attachments: EMPTY_ATTACHMENTS,
      }

      const discussion = await discussionService.createDiscussion(createDiscussionInput)
      await em.flush()
      expect(createSpaceNotificationTaskStub.callCount).eq(0)
    })
  })

  context('create answer in space and create notification tasks', () => {
    it('should send discussionId and notify all value', async () => {
      const space = create.spacesHelper.create(em, generate.space.group())
      const guestLead = create.userHelper.create(em, { email: generate.random.chance.email() })
      const hostLead = create.userHelper.create(em, { email: generate.random.chance.email() })
      await em.flush()
      const discussion = create.discussionHelper.createInSpace(em, { user: guestLead, space }, {})
      create.spacesHelper.addMember(
        em,
        { user: hostLead, space },
        { role: SPACE_MEMBERSHIP_ROLE.LEAD, side: SPACE_MEMBERSHIP_SIDE.HOST },
      )
      create.spacesHelper.addMember(
        em,
        { user: guestLead, space },
        { role: SPACE_MEMBERSHIP_ROLE.LEAD, side: SPACE_MEMBERSHIP_SIDE.GUEST },
      )
      create.spacesHelper.addMember(
        em,
        { user, space },
        { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR, side: SPACE_MEMBERSHIP_SIDE.HOST },
      )
      await em.flush()

      const createAnswerInput: CreateAnswerDTO = {
        discussionId: discussion.id,
        title: 'answer',
        content: 'test-content',
        attachments: EMPTY_ATTACHMENTS,
        notify: 'all',
      }

      await discussionService.createAnswer(createAnswerInput)
      expect(createSpaceNotificationTaskStub.callCount).eq(1)
      expect(createSpaceNotificationTaskStub.args[0][0]).to.be.equal(discussion.id)
      expect(createSpaceNotificationTaskStub.args[0][1]).to.be.equal(createAnswerInput.notify)
    })

    it('should not create task if notify is empty', async () => {
      const space = create.spacesHelper.create(em, generate.space.group())
      const guestLead = create.userHelper.create(em)
      const hostLead = create.userHelper.create(em)
      await em.flush()

      const discussion = create.discussionHelper.createInSpace(em, { user: guestLead, space }, {})
      create.spacesHelper.addMember(
        em,
        { user: hostLead, space },
        { role: SPACE_MEMBERSHIP_ROLE.LEAD, side: SPACE_MEMBERSHIP_SIDE.HOST },
      )
      create.spacesHelper.addMember(
        em,
        { user: guestLead, space },
        { role: SPACE_MEMBERSHIP_ROLE.LEAD, side: SPACE_MEMBERSHIP_SIDE.GUEST },
      )
      create.spacesHelper.addMember(
        em,
        { user, space },
        { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR, side: SPACE_MEMBERSHIP_SIDE.HOST },
      )
      await em.flush()
      // const scope = `space-${space.id}` as Scope

      const createAnswerInput: CreateAnswerDTO = {
        discussionId: discussion.id,
        title: 'answer',
        content: 'test-content',
        attachments: EMPTY_ATTACHMENTS,
        notify: [],
      }
      await discussionService.createAnswer(createAnswerInput)
      expect(createSpaceNotificationTaskStub.callCount).eq(0)
    })

    it('should not create task if answer is not for a space discussion', async () => {
      const discussion = create.discussionHelper.createPublic(em, { user }, {})
      await em.flush()

      const createAnswerInput: CreateAnswerDTO = {
        discussionId: discussion.id,
        title: 'answer',
        content: 'test-content',
        attachments: EMPTY_ATTACHMENTS,
        notify: [],
      }
      await discussionService.createAnswer(createAnswerInput)
      expect(createSpaceNotificationTaskStub.callCount).eq(0)
    })
  })

  context('create comment and create notification tasks', () => {
    it('should send discussionId and notify all value', async () => {
      const space = create.spacesHelper.create(em, generate.space.group())
      const guestLead = create.userHelper.create(em)
      const hostLead = create.userHelper.create(em)
      await em.flush()
      const discussion = create.discussionHelper.createInSpace(em, { user, space }, {})

      create.spacesHelper.addMember(
        em,
        { user: hostLead, space },
        { role: SPACE_MEMBERSHIP_ROLE.LEAD, side: SPACE_MEMBERSHIP_SIDE.HOST },
      )
      create.spacesHelper.addMember(
        em,
        { user: guestLead, space },
        { role: SPACE_MEMBERSHIP_ROLE.LEAD, side: SPACE_MEMBERSHIP_SIDE.GUEST },
      )
      create.spacesHelper.addMember(
        em,
        { user: user, space },
        { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR, side: SPACE_MEMBERSHIP_SIDE.GUEST },
      )
      await em.flush()
      // createSpaceNotificationTaskStub.reset()

      const createCommentInput: CreateCommentDTO = {
        content: 'test-comment',
        notify: 'all',
        discussionId: discussion.id,
      }
      const createdComment = await discussionService.createComment(createCommentInput)
      expect(createdComment.body).eq(createCommentInput.content)
      expect(createSpaceNotificationTaskStub.callCount).eq(1)
      expect(createSpaceNotificationTaskStub.args[0][0]).to.be.equal(discussion.id)
      expect(createSpaceNotificationTaskStub.args[0][1]).to.be.equal(createCommentInput.notify)
    })

    it('value should be false if notifyAll is missing', async () => {
      const space = create.spacesHelper.create(em, generate.space.group())
      const guestLead = create.userHelper.create(em)
      const hostLead = create.userHelper.create(em)
      await em.flush()
      const discussion = create.discussionHelper.createInSpace(em, { user, space }, {})
      await em.flush()

      create.spacesHelper.addMember(
        em,
        { user: hostLead, space },
        { role: SPACE_MEMBERSHIP_ROLE.LEAD, side: SPACE_MEMBERSHIP_SIDE.HOST },
      )
      create.spacesHelper.addMember(
        em,
        { user: guestLead, space },
        { role: SPACE_MEMBERSHIP_ROLE.LEAD, side: SPACE_MEMBERSHIP_SIDE.GUEST },
      )
      create.spacesHelper.addMember(
        em,
        { user: user, space },
        { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR, side: SPACE_MEMBERSHIP_SIDE.GUEST },
      )
      await em.flush()

      createSpaceNotificationTaskStub.reset()

      const comment = 'test-comment'
      const createCommentInput: CreateCommentDTO = {
        content: comment,
        discussionId: discussion.id,
        notify: [],
      }
      const createdComment = await discussionService.createComment(createCommentInput)
      expect(createdComment.body).eq(comment)
      expect(createSpaceNotificationTaskStub.callCount).eq(0)
    })

    it("should not create task if comment is a space discussion's answer", async () => {
      const space = create.spacesHelper.create(em, generate.space.group())
      const guestLead = create.userHelper.create(em)
      const hostLead = create.userHelper.create(em)
      await em.flush()
      const discussion = create.discussionHelper.createInSpace(em, { user, space }, {})
      await em.flush()
      create.spacesHelper.addMember(
        em,
        { user: hostLead, space },
        { role: SPACE_MEMBERSHIP_ROLE.LEAD, side: SPACE_MEMBERSHIP_SIDE.HOST },
      )
      create.spacesHelper.addMember(
        em,
        { user: guestLead, space },
        { role: SPACE_MEMBERSHIP_ROLE.LEAD, side: SPACE_MEMBERSHIP_SIDE.GUEST },
      )
      create.spacesHelper.addMember(
        em,
        { user: user, space },
        { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR, side: SPACE_MEMBERSHIP_SIDE.GUEST },
      )
      await em.flush()
      const answer = create.discussionHelper.createAnswer(em, { user, discussion })
      await em.flush()

      const comment = 'test-comment'
      const createCommentInput: CreateCommentDTO = {
        content: comment,
        answerId: answer.id,
        notify: [],
      }
      const createdComment = await discussionService.createComment(createCommentInput)
      expect(createdComment.body).eq(comment)
      expect(createSpaceNotificationTaskStub.callCount).eq(0)
    })
  })

  it('should not create task if comment is not for a space discussion', async () => {
    const discussion = create.discussionHelper.createPublic(em, { user }, {})
    await em.flush()

    const comment = 'test-comment'
    const createCommentInput: CreateCommentDTO = {
      content: comment,
      discussionId: discussion.id,
      notify: [],
    }
    const createdComment = await discussionService.createComment(createCommentInput)
    expect(createdComment.body).eq(comment)
    expect(createSpaceNotificationTaskStub.callCount).eq(0)
  })

  it("should create task if comment is not for a space discussion's answer", async () => {
    const discussion = create.discussionHelper.createPublic(em, { user }, {})
    create.userHelper.create(em)
    await em.flush()
    const answer = create.discussionHelper.createAnswer(em, { user, discussion })
    await em.flush()

    const comment = 'test-comment'
    const createCommentInput: CreateCommentDTO = {
      content: comment,
      answerId: answer.id,
      notify: [],
    }
    const createdComment = await discussionService.createComment(createCommentInput)
    expect(createdComment.body).eq(comment)
    expect(createSpaceNotificationTaskStub.callCount).eq(0)
  })
})
