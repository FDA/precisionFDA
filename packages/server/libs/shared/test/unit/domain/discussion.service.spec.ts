import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { database } from '@shared/database'
import { App } from '@shared/domain/app/app.entity'
import { Comparison } from '@shared/domain/comparison/comparison.entity'
import { Discussion } from '@shared/domain/discussion/discussion.entity'
import {
  BaseInput,
  CreateCommentInput,
  PublishAnswerInput,
  PublishDiscussionInput,
  UpdateDiscussionInput,
} from '@shared/domain/discussion/discussion.types'
import { DiscussionNotificationService } from '@shared/domain/discussion/services/discussion-notification.service'
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
import { User } from '@shared/domain/user/user.entity'
import { STATIC_SCOPE, Scope } from '@shared/enums'
import { PlatformClient } from '@shared/platform-client'
import { expect } from 'chai'
import { stub } from 'sinon'
import { create, db, generate } from '../../../src/test'

describe('DiscussionService tests', () => {
  let em: EntityManager<MySqlDriver>
  let user: User
  let userCtx: UserCtx
  let discussionService: DiscussionService
  let entityService: EntityService
  let discussionNotificationService: DiscussionNotificationService
  let fetcher: EntityFetcherService

  const getEntityLinkStub = stub()
  const notifyDiscussionStub = stub()
  const notifyDiscussionAnswerStub = stub()
  const notifyDiscussionCommentStub = stub()

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork({ useContext: true }) as EntityManager<MySqlDriver>
    user = create.userHelper.create(em)
    await em.flush()
    userCtx = { ...user, accessToken: 'foo' }
    const mockedPublisherService = {
      async publishNodes(nodes: Node[], user: User, scope: string): Promise<number> {
        return nodes.length
      },
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
    discussionNotificationService = {
      notifyDiscussion: notifyDiscussionStub,
      notifyDiscussionAnswer: notifyDiscussionAnswerStub,
      notifyDiscussionComment: notifyDiscussionCommentStub,
    } as unknown as DiscussionNotificationService
    discussionService = new DiscussionService(
      em,
      userCtx,
      mockedPublisherService,
      fetcher,
      entityService,
      discussionNotificationService,
    )
    notifyDiscussionStub.reset()
    notifyDiscussionAnswerStub.reset()
    notifyDiscussionCommentStub.reset()
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

    const createDiscussionInput: BaseInput = {
      title: 'test-discussion',
      content: 'test-content',
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
    expect(note.scope).eq('private')
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
    const discussion = create.discussionHelper.create(em, { user }, {})
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

    let updateDiscussionInput: UpdateDiscussionInput = {
      id: discussion.id,
      title: 'updated-title',
      content: 'updated-content',
      attachments: {
        folders: [],
        files: [],
        assets: [],
        apps: [],
        jobs: [],
        comparisons: [],
      },
    }

    // then update a discussion
    await discussionService.updateDiscussion(updateDiscussionInput)

    let loadedDiscussion = await em.findOneOrFail(
      Discussion,
      { id: discussion.id },
      { populate: ['note', 'note.attachments'] },
    )
    let note = loadedDiscussion.note.getEntity()
    expect(note.title).eq('updated-title')
    expect(note.content).eq('updated-content')
    expect(note.scope).eq('private')
    expect(note.noteType).eq('Discussion')
    expect(note.attachments.getItems().length).eq(0)

    // then add old attachments back to discussion, except one
    updateDiscussionInput = {
      id: discussion.id,
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
    await discussionService.updateDiscussion(updateDiscussionInput)

    loadedDiscussion = await em.findOneOrFail(
      Discussion,
      { id: discussion.id },
      { populate: ['note', 'note.attachments'] },
    )
    note = loadedDiscussion.note.getEntity()
    expect(note.title).eq('updated-title')
    expect(note.content).eq('updated-content')
    expect(note.scope).eq('private')
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
    const publisherService = new PublisherService(
      em,
      userCtx,
      new PlatformClient({ accessToken: 'foo' }),
    )
    const fetcher = new EntityFetcherService(em, userCtx)
    discussionService = new DiscussionService(
      em,
      userCtx,
      publisherService,
      fetcher,
      entityService,
      discussionNotificationService,
    )

    const createDiscussionInput: BaseInput = {
      title: 'test-discussion',
      content: 'test-content',
      attachments: {
        files: [],
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
    } catch (error: any) {
      expect(error.name).to.equal('NotFoundError')
      expect(error.message).eq('User not found ({ id: 10 })')
    }
  })

  it('publish discussion with non existing discussion id', async () => {
    const publishDiscussionInput: PublishDiscussionInput = {
      id: 10,
      scope: STATIC_SCOPE.PUBLIC,
      toPublish: { apps: [], folders: [], assets: [], comparisons: [], files: [], jobs: [] },
    }

    try {
      await discussionService.publishDiscussion(publishDiscussionInput)
      expect.fail('Operation is expected to fail.')
    } catch (error: any) {
      expect(error.name).to.equal('NotFoundError')
      expect(error.message).eq(
        'Unable to publish discussion: not found or insufficient permissions.',
      )
    }
  })

  it('publish discussion with non existing user', async () => {
    userCtx = { id: 10, dxuser: 'non-existing', accessToken: 'foo' }
    const publisherService = new PublisherService(
      em,
      userCtx,
      new PlatformClient({ accessToken: 'foo' }),
    )
    const fetcher = new EntityFetcherService(em, userCtx)
    discussionService = new DiscussionService(
      em,
      userCtx,
      publisherService,
      fetcher,
      entityService,
      discussionNotificationService,
    )

    const publishDiscussionInput: PublishDiscussionInput = {
      id: 10,
      scope: STATIC_SCOPE.PUBLIC,
      toPublish: { apps: [], folders: [], assets: [], comparisons: [], files: [], jobs: [] },
    }

    try {
      await discussionService.publishDiscussion(publishDiscussionInput)
      expect.fail('Operation is expected to fail.')
    } catch (error: any) {
      expect(error.name).to.equal('NotFoundError')
      expect(error.message).eq('User not found ({ id: 10 })')
    }
  })

  it('publish discussion in space without permission', async () => {
    const discussion = create.discussionHelper.create(em, { user }, {})
    const space = create.spacesHelper.create(em, generate.space.group())
    await em.flush()
    const scope = space.scope

    const file = create.filesHelper.create(em, { user }, { name: 'file', scope })
    await em.flush()

    const publishDiscussionInput: PublishDiscussionInput = {
      id: discussion.id,
      scope: scope,
      toPublish: { apps: [], folders: [], assets: [], comparisons: [], files: [file.id], jobs: [] },
    }

    try {
      await discussionService.publishDiscussion(publishDiscussionInput)
      expect.fail('Operation is expected to fail.')
    } catch (error: any) {
      expect(error.name).to.equal('PermissionError')
      expect(error.message).eq('Unable to publish: insufficient permissions.')
    }
  })

  it('publish discussion in space with discussion disabled', async () => {
    const discussion = create.discussionHelper.create(em, { user }, {})
    const space = create.spacesHelper.create(em, generate.space.simple())
    create.spacesHelper.addMember(em, { user, space })
    space.meta.restricted_discussions = true

    await em.flush()
    const scope = space.scope

    const file = create.filesHelper.create(em, { user }, { name: 'file', scope })
    await em.flush()

    const publishDiscussionInput: PublishDiscussionInput = {
      id: discussion.id,
      scope: scope,
      toPublish: { apps: [], folders: [], assets: [], comparisons: [], files: [file.id], jobs: [] },
    }

    try {
      await discussionService.publishDiscussion(publishDiscussionInput)
      expect.fail('Operation is expected to fail.')
    } catch (error: any) {
      expect(error.name).to.equal('InvalidStateError')
      expect(error.message).eq('Unable to publish discussion: space has restricted discussions.')
    }
  })

  it('publish discussion with public scope', async () => {
    const discussion = create.discussionHelper.create(em, { user }, {})
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

    const publishDiscussionInput: PublishDiscussionInput = {
      id: discussion.id,
      scope: STATIC_SCOPE.PUBLIC,
      toPublish: {
        files: [file.id],
        folders: [],
        assets: [asset.id],
        apps: [app.id],
        jobs: [job.id],
        comparisons: [comparison.id],
      },
    }
    const count = await discussionService.publishDiscussion(publishDiscussionInput)
    expect(count).eq(5)
  })

  it('publish discussion in space', async () => {
    const discussion = create.discussionHelper.create(em, { user }, {})
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

    const scope = space.scope as any

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

    const publishDiscussionInput: PublishDiscussionInput = {
      id: discussion.id,
      scope: scope,
      toPublish: {
        files: [file.id],
        folders: [folder.id],
        assets: [asset.id],
        apps: [app.id],
        jobs: [job.id],
        comparisons: [comparison.id],
      },
    }

    const count = await discussionService.publishDiscussion(publishDiscussionInput)
    expect(count).eq(0) // nothing should be published - all items already in the space.
  })

  it('publish discussion in space and notify members', async () => {
    const discussion = create.discussionHelper.create(em, { user }, {})
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
      { user: user, space },
      { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR, side: SPACE_MEMBERSHIP_SIDE.GUEST },
    )
    await em.flush()
    const scope = `space-${space.id}` as Scope

    const publishDiscussionInput: PublishDiscussionInput = {
      id: discussion.id,
      scope: scope,
      toPublish: {
        files: [],
        assets: [],
        apps: [],
        jobs: [],
        comparisons: [],
      },
      notifyAll: true,
    }

    const count = await discussionService.publishDiscussion(publishDiscussionInput)
    expect(count).eq(0)
    expect(notifyDiscussionStub.callCount).eq(1)
  })

  it('publish discussion in space and do not notify members if notifyAll is missing or uncheck', async () => {
    const discussion = create.discussionHelper.create(em, { user }, {})
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
      { user: user, space },
      { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR, side: SPACE_MEMBERSHIP_SIDE.GUEST },
    )
    await em.flush()
    const scope = `space-${space.id}` as Scope

    const basePublishDiscussionInput: PublishDiscussionInput = {
      id: discussion.id,
      scope: scope,
      toPublish: {
        files: [],
        assets: [],
        apps: [],
        jobs: [],
        comparisons: [],
      },
    }

    const count1 = await discussionService.publishDiscussion(basePublishDiscussionInput)
    expect(count1).eq(0)
    expect(notifyDiscussionStub.callCount).eq(0)

    const publishDiscussionInput: PublishDiscussionInput = {
      ...basePublishDiscussionInput,
      notifyAll: false,
    }

    const count2 = await discussionService.publishDiscussion(publishDiscussionInput)
    expect(count2).eq(0)
    expect(notifyDiscussionStub.callCount).eq(0)
  })

  it('publish discussion in space with attachment in wrong scope', async () => {
    const discussion = create.discussionHelper.create(em, { user }, {})
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

    const scope = space.scope as any

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

    const publishDiscussionInput: PublishDiscussionInput = {
      id: discussion.id,
      scope: scope,
      toPublish: {
        files: [file.id],
        folders: [folder.id],
        assets: [asset.id],
        apps: [app.id],
        jobs: [job.id],
        comparisons: [comparison.id],
      },
    }

    try {
      await discussionService.publishDiscussion(publishDiscussionInput)
      expect.fail('Operation is expected to fail.')
    } catch (error: any) {
      expect(error.name).to.equal('InvalidStateError')
      expect(error.message).eq('Unable to publish job - job is not in the space or is not public.')
    }
  })

  it('publish discussion in space with attachment that is not accessible by user', async () => {
    const discussion = create.discussionHelper.create(em, { user }, {})
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

    const scope = space.scope as any

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

    const publishDiscussionInput: PublishDiscussionInput = {
      id: discussion.id,
      scope: scope,
      toPublish: {
        files: [file.id],
        folders: [folder.id],
        assets: [asset.id],
        apps: [app.id],
        jobs: [job.id],
        comparisons: [comparison.id],
      },
    }

    try {
      await discussionService.publishDiscussion(publishDiscussionInput)
      expect.fail('Operation is expected to fail.')
    } catch (error: any) {
      expect(error.name).to.equal('InvalidStateError')
      expect(error.message).eq('Unable to publish job - job is not in the space or is not public.')
    }
  })

  it('publish answer in space and notify members', async () => {
    const space = create.spacesHelper.create(em, generate.space.group())
    const guestLead = create.userHelper.create(em, { email: generate.random.chance.email() })
    const hostLead = create.userHelper.create(em, { email: generate.random.chance.email() })
    await em.flush()
    const discussion = create.discussionHelper.create(em, { user: guestLead }, {})
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
    const answer = create.discussionHelper.createAnswer(em, { user: user, discussion })
    await em.flush()
    const scope = `space-${space.id}` as Scope

    const publishAnswerInput: PublishAnswerInput = {
      id: answer.id,
      discussionId: discussion.id,
      scope: scope,
      toPublish: {
        files: [],
        assets: [],
        apps: [],
        jobs: [],
        comparisons: [],
      },
      notifyAll: true,
    }
    const count = await discussionService.publishAnswer(publishAnswerInput)
    expect(count).eq(0)
    expect(notifyDiscussionAnswerStub.callCount).eq(1)
  })

  it('publish answer in space and do not notify members if notifyAll is missing or uncheck', async () => {
    const space = create.spacesHelper.create(em, generate.space.group())
    const guestLead = create.userHelper.create(em, { email: generate.random.chance.email() })
    const hostLead = create.userHelper.create(em, { email: generate.random.chance.email() })
    await em.flush()
    const discussion = create.discussionHelper.create(em, { user: guestLead }, {})
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
    const scope = `space-${space.id}` as Scope

    const basePublishAnswerInput: PublishAnswerInput = {
      id: answer.id,
      discussionId: discussion.id,
      scope: scope,
      toPublish: {
        files: [],
        assets: [],
        apps: [],
        jobs: [],
        comparisons: [],
      },
    }
    const count1 = await discussionService.publishAnswer(basePublishAnswerInput)
    expect(count1).eq(0)
    expect(notifyDiscussionAnswerStub.callCount).eq(0)

    const publishAnswerInput: PublishAnswerInput = {
      ...basePublishAnswerInput,
      notifyAll: false,
    }
    const count2 = await discussionService.publishAnswer(publishAnswerInput)
    expect(count2).eq(0)
    expect(notifyDiscussionAnswerStub.callCount).eq(0)
  })

  it('create comment with notifyAll', async () => {
    const space = create.spacesHelper.create(em, generate.space.group())
    const guestLead = create.userHelper.create(em, { email: generate.random.chance.email() })
    const hostLead = create.userHelper.create(em, { email: generate.random.chance.email() })
    const discussion = create.discussionHelper.create(em, { user }, {})
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
    await discussionService.publishDiscussion({
      id: discussion.id,
      scope: `space-${space.id}` as Scope,
      toPublish: { apps: [], assets: [], comparisons: [], files: [], jobs: [] },
    })
    const comment = 'test-comment'
    const createCommentInput = {
      comment,
      notifyAll: true,
      targetId: discussion.id,
      targetType: 'Discussion',
    } as CreateCommentInput
    const createdComment = await discussionService.createComment(createCommentInput)
    expect(createdComment.body).eq(comment)
    expect(notifyDiscussionCommentStub.callCount).eq(1)
  })

  it('create comment without notifyAll', async () => {
    const space = create.spacesHelper.create(em, generate.space.group())
    const guestLead = create.userHelper.create(em, { email: generate.random.chance.email() })
    const hostLead = create.userHelper.create(em, { email: generate.random.chance.email() })
    const discussion = create.discussionHelper.create(em, { user }, {})
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
    await discussionService.publishDiscussion({
      id: discussion.id,
      scope: `space-${space.id}` as Scope,
      toPublish: { apps: [], assets: [], comparisons: [], files: [], jobs: [] },
    })
    const comment = 'test-comment'
    const createCommentInput = {
      comment,
      targetId: answer.id,
      targetType: 'Answer',
    } as CreateCommentInput
    const createdComment = await discussionService.createComment(createCommentInput)
    expect(createdComment.body).eq(comment)
    expect(notifyDiscussionCommentStub.callCount).eq(0)

    const comment2 = 'test-comment-2'
    const createCommentInput2 = {
      comment: comment2,
      notifyAll: false,
      targetId: answer.id,
      targetType: 'Answer',
    } as CreateCommentInput
    const createdComment2 = await discussionService.createComment(createCommentInput2)
    expect(createdComment2.body).eq(comment2)
    expect(notifyDiscussionCommentStub.callCount).eq(0)
  })
})
