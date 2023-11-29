import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { client, database, discussion as discussionDomain, types, entityFetcher } from '@shared'
import { expect } from 'chai'
import { App, Comparison, entities, Job, Node, User } from '../../../src/domain'
import {
  BaseInput,
  PublishDiscussionInput,
  UpdateDiscussionInput,
} from '../../../src/domain/discussion/discussion.types'
import {
  SPACE_MEMBERSHIP_ROLE,
  SPACE_MEMBERSHIP_SIDE,
} from '../../../src/domain/space-membership/space-membership.enum'
import { STATIC_SCOPE } from '../../../src/enums'
import { create, db, generate } from '../../../src/test'

describe('DiscussionService tests', () => {
  let em: EntityManager<MySqlDriver>
  let user: User
  let userCtx: types.UserCtx
  let discussionService: discussionDomain.DiscussionService

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork() as EntityManager<MySqlDriver>
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
      async publishComparisons(comparisons: Comparison[], user: User, scope: string): Promise<number> {
        return comparisons.length
      },
      async publishJobs(jobs: Job[], user: User, scope: string): Promise<number> {
        return jobs.length
      },
    } as discussionDomain.PublisherService
    const fetcher = new entityFetcher.EntityFetcherService(em, userCtx)
    discussionService = new discussionDomain.DiscussionService(em, userCtx, mockedPublisherService, fetcher)
  })

  it('create discussion', async () => {
    const file = create.filesHelper.create(em, { user }, { name: 'file' })
    const asset = create.filesHelper.create(em, { user }, { name: 'asset-file' })
    const app = create.appHelper.createRegular(em, { user }, { title: 'app-file' })
    const job = create.jobHelper.create(em, { user }, { name: 'job' })
    const comparison = create.comparisonHelper.create(em, {
      app,
      user,
    }, { name: 'comparison-file' })
    await em.flush()

    const createDiscussionInput: BaseInput = {
      title: 'test-discussion',
      content: 'test-content',
      attachments: {
        files: [file.id],
        assets: [asset.id],
        apps: [app.id],
        jobs: [job.id],
        comparisons: [comparison.id],
      },
    }

    const result = await discussionService.createDiscussion(createDiscussionInput)

    const loadedDiscussion = await em.findOneOrFail(
      entities.Discussion,
      { id: result.id },
      { populate: ['note', 'answers', 'comments'] },
    )
    const note = loadedDiscussion.note.getEntity()
    expect(note.title).eq(createDiscussionInput.title)
    expect(note.content).eq(createDiscussionInput.content)
    expect(note.scope).eq('private')
    expect(note.noteType).eq('Discussion')

    const follow = await em.findOneOrFail(entities.Follow, { followableId: loadedDiscussion.id })
    expect(follow.followableType).eq('Discussion')
    expect(follow.followerId).eq(user.id)
    expect(follow.followerType).eq('User')
    expect(follow.blocked).eq(false)

    const attachments = loadedDiscussion.note.getEntity().attachments.getItems()
    expect(attachments.length).eq(5)
    expect(attachments[0].itemId).eq(file.id)
    expect(attachments[0].itemType).eq('Node')
    expect(attachments[1].itemId).eq(asset.id)
    expect(attachments[1].itemType).eq('Node')
    expect(attachments[2].itemId).eq(app.id)
    expect(attachments[2].itemType).eq('App')
    expect(attachments[3].itemId).eq(job.id)
    expect(attachments[3].itemType).eq('Job')
    expect(attachments[4].itemId).eq(comparison.id)
    expect(attachments[4].itemType).eq('Comparison')
  })

  it('create discussion with non existing user', async () => {
    userCtx = { id: 10, dxuser: 'non-existing', accessToken: 'foo' }
    const publisherService = new discussionDomain.PublisherService(em, userCtx, new client.PlatformClient('foo'))
    const fetcher = new entityFetcher.EntityFetcherService(em, userCtx)
    discussionService = new discussionDomain.DiscussionService(em, userCtx, publisherService, fetcher)

    const createDiscussionInput: BaseInput = {
      title: 'test-discussion',
      content: 'test-content',
      attachments: {
        files: [],
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

  it('update discussion', async () => {
    // first create a discussion
    const discussion = create.discussionHelper.create(em, { user }, {})
    await em.flush()
    const file = create.filesHelper.create(em, { user }, { name: 'file' })
    const asset = create.filesHelper.create(em, { user }, { name: 'asset-file' })
    const app = create.appHelper.createRegular(em, { user }, { title: 'app' })
    const job = create.jobHelper.create(em, { user }, { name: 'job' })
    const comparison = create.comparisonHelper.create(em, {
      app,
      user,
    }, { name: 'comparison-file' })
    await em.flush()

    create.attachmentHelper.create(em, { note: discussion.note.getEntity() }, {
      itemId: file.id,
      itemType: 'Node',
    })
    create.attachmentHelper.create(em, { note: discussion.note.getEntity() }, {
      itemId: asset.id,
      itemType: 'Node',
    })
    create.attachmentHelper.create(em, { note: discussion.note.getEntity() }, {
      itemId: app.id,
      itemType: 'App',
    })
    create.attachmentHelper.create(em, { note: discussion.note.getEntity() }, {
      itemId: job.id,
      itemType: 'Job',
    })
    create.attachmentHelper.create(em, { note: discussion.note.getEntity() }, {
      itemId: comparison.id,
      itemType: 'Comparison',
    })
    await em.flush()

    let updateDiscussionInput: UpdateDiscussionInput = {
      id: discussion.id,
      title: 'updated-title',
      content: 'updated-content',
      attachments: {
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
      entities.Discussion,
      { id: discussion.id },
      { populate: ['note', 'note.attachments'] },
    )
    let note = loadedDiscussion.note.getEntity()
    expect(note.title).eq('updated-title')
    expect(note.content).eq('updated-content')
    expect(note.scope).eq('private')
    expect(note.noteType).eq('Discussion')
    expect(note.attachments.getItems().length).eq(0)

    // then add attachments back to discussion
    updateDiscussionInput = {
      id: discussion.id,
      title: 'updated-title',
      content: 'updated-content',
      attachments: {
        files: [file.id],
        assets: [asset.id],
        apps: [app.id],
        jobs: [job.id],
        comparisons: [comparison.id],
      },
    }
    await discussionService.updateDiscussion(updateDiscussionInput)

    loadedDiscussion = await em.findOneOrFail(
      entities.Discussion,
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
    expect(note.attachments.getItems()[1].itemId).eq(asset.id)
    expect(note.attachments.getItems()[1].itemType).eq('Node')
    expect(note.attachments.getItems()[2].itemId).eq(app.id)
    expect(note.attachments.getItems()[2].itemType).eq('App')
    expect(note.attachments.getItems()[3].itemId).eq(job.id)
    expect(note.attachments.getItems()[3].itemType).eq('Job')
    expect(note.attachments.getItems()[4].itemId).eq(comparison.id)
    expect(note.attachments.getItems()[4].itemType).eq('Comparison')
  })

  it('publish discussion with non existing discussion id', async () => {
    const publishDiscussionInput: PublishDiscussionInput = {
      id: 10,
      scope: STATIC_SCOPE.PUBLIC,
      toPublish: { apps: [], assets: [], comparisons: [], files: [], jobs: [] },
    }

    try {
      await discussionService.publishDiscussion(publishDiscussionInput)
      expect.fail('Operation is expected to fail.')
    } catch (error: any) {
      expect(error.name).to.equal('NotFoundError')
      expect(error.message).eq('Unable to publish discussion: not found or insufficient permissions.')
    }
  })

  it('publish discussion with non existing user', async () => {
    userCtx = { id: 10, dxuser: 'non-existing', accessToken: 'foo' }
    const publisherService = new discussionDomain.PublisherService(em, userCtx, new client.PlatformClient('foo'))
    const fetcher = new entityFetcher.EntityFetcherService(em, userCtx)
    discussionService = new discussionDomain.DiscussionService(em, userCtx, publisherService, fetcher)

    const publishDiscussionInput: PublishDiscussionInput = {
      id: 10,
      scope: STATIC_SCOPE.PUBLIC,
      toPublish: { apps: [], assets: [], comparisons: [], files: [], jobs: [] },
    }

    try {
      await discussionService.publishDiscussion(publishDiscussionInput)
      expect.fail('Operation is expected to fail.')
    } catch (error: any) {
      expect(error.name).to.equal('NotFoundError')
      expect(error.message).eq('User not found ({ id: 10 })')
    }
  })

  it('publish discussion with public scope', async () => {
    const discussion = create.discussionHelper.create(em, { user }, {})
    await em.flush()
    const file = create.filesHelper.create(em, { user }, { name: 'file' })
    const asset = create.filesHelper.createUploadedAsset(em, { user }, { name: 'asset-file' })
    const app = create.appHelper.createRegular(em, { user }, { title: 'app' })
    const job = create.jobHelper.create(em, { user }, { name: 'job' })
    const comparison = create.comparisonHelper.create(em, {
      app,
      user,
    }, { name: 'comparison-file' })
    await em.flush()

    const publishDiscussionInput: PublishDiscussionInput = {
      id: discussion.id,
      scope: STATIC_SCOPE.PUBLIC,
      toPublish: {
        files: [file.id],
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
    const asset = create.filesHelper.createUploadedAsset(em, { user }, {
      name: 'asset-file',
      scope,
    })
    const app = create.appHelper.createRegular(em, { user }, { title: 'app', scope })
    const job = create.jobHelper.create(em, { user }, { name: 'job', scope })
    const comparison = create.comparisonHelper.create(em, {
      app,
      user,
    }, { name: 'comparison-file', scope })
    await em.flush()

    const publishDiscussionInput: PublishDiscussionInput = {
      id: discussion.id,
      scope: scope,
      toPublish: {
        files: [file.id],
        assets: [asset.id],
        apps: [app.id],
        jobs: [job.id],
        comparisons: [comparison.id],
      },
    }

    const count = await discussionService.publishDiscussion(publishDiscussionInput)
    expect(count).eq(0) // nothing should be published - all items already in the space.
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
    const asset = create.filesHelper.createUploadedAsset(em, { user }, {
      name: 'asset-file',
      scope,
    })
    const app = create.appHelper.createRegular(em, { user }, { title: 'app', scope })
    const job = create.jobHelper.create(em, { user }, { name: 'job', scope: STATIC_SCOPE.PRIVATE })
    const comparison = create.comparisonHelper.create(em, {
      app,
      user,
    }, { name: 'comparison-file', scope })
    await em.flush()

    const publishDiscussionInput: PublishDiscussionInput = {
      id: discussion.id,
      scope: scope,
      toPublish: {
        files: [file.id],
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
    const asset = create.filesHelper.createUploadedAsset(em, { user }, {
      name: 'asset-file',
      scope,
    })
    const app = create.appHelper.createRegular(em, { user }, { title: 'app', scope })
    const job = create.jobHelper.create(em, { user }, { name: 'job', scope: STATIC_SCOPE.PRIVATE })
    const comparison = create.comparisonHelper.create(em, {
      app,
      user,
    }, { name: 'comparison-file', scope })
    await em.flush()

    const publishDiscussionInput: PublishDiscussionInput = {
      id: discussion.id,
      scope: scope,
      toPublish: {
        files: [file.id],
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

})
