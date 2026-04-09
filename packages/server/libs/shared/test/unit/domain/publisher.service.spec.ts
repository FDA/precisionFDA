import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { mocksReset } from '@worker-test/utils/mocks'
import { expect } from 'chai'
import { database } from '@shared/database'
import { App } from '@shared/domain/app/app.entity'
import { Comparison } from '@shared/domain/comparison/comparison.entity'
import { PublisherService } from '@shared/domain/discussion/services/publisher.service'
import { Job } from '@shared/domain/job/job.entity'
import { User } from '@shared/domain/user/user.entity'
import { Node } from '@shared/domain/user-file/node.entity'
import { PARENT_TYPE } from '@shared/domain/user-file/user-file.types'
import { STATIC_SCOPE } from '@shared/enums'
import { PlatformClient } from '@shared/platform-client'
import { create, db } from '../../../src/test'

describe('PublisherService tests', () => {
  let em: EntityManager<MySqlDriver>
  let user: User
  let publisherService: PublisherService

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork() as EntityManager<MySqlDriver>
    user = create.userHelper.create(em)
    const userContext = create.contextHelper.create(user)
    await em.flush()
    publisherService = new PublisherService(em, userContext, new PlatformClient({ accessToken: 'foo' }))
    // using mocked platform client to avoid actual calls to platform
    mocksReset()
  })

  it('publish nodes to public', async () => {
    const node1 = create.filesHelper.create(em, { user }, {})
    const node2 = create.filesHelper.createAsset(em, { user }, {})
    const node3 = create.filesHelper.createUploaded(em, { user }, {})
    await em.flush()
    const count = await publisherService.publishNodes([node1, node2, node3])
    em.clear()
    const loadedNode1 = await em.findOneOrFail(Node, { id: node1.id })
    const loadedNode2 = await em.findOneOrFail(Node, { id: node2.id })
    const loadedNode3 = await em.findOneOrFail(Node, { id: node3.id })
    expect(count).eq(3)
    expect(loadedNode1.isPublic()).is.true()
    expect(loadedNode2.isPublic()).is.true()
    expect(loadedNode3.isPublic()).is.true()
  })

  it('publish apps to public', async () => {
    const app1 = create.appHelper.createRegular(em, { user }, { scope: STATIC_SCOPE.PRIVATE })
    await em.flush()
    const appSeries1 = create.appSeriesHelper.create(
      em,
      {
        user,
      },
      { scope: STATIC_SCOPE.PRIVATE },
    )
    await em.flush()
    app1.appSeriesId = appSeries1.id
    await em.flush()

    const app2 = create.appHelper.createHTTPS(em, { user }, { scope: STATIC_SCOPE.PRIVATE })
    await em.flush()
    const appSeries2 = create.appSeriesHelper.create(
      em,
      {
        user,
      },
      { scope: STATIC_SCOPE.PRIVATE },
    )
    await em.flush()
    app2.appSeriesId = appSeries2.id
    await em.flush()

    const count = await publisherService.publishApps([app1, app2], STATIC_SCOPE.PUBLIC)
    em.clear()
    const loadedApp1 = await em.findOneOrFail(App, { id: app1.id })
    const loadedApp2 = await em.findOneOrFail(App, { id: app2.id })
    expect(count).eq(2)
    expect(loadedApp1.isPublic()).is.true()
    expect(appSeries1.isPublic()).is.true()
    expect(loadedApp2.isPublic()).is.true()
    expect(appSeries2.isPublic()).is.true()
  })

  it('publish jobs to public', async () => {
    const job1 = create.jobHelper.create(em, { user }, { scope: STATIC_SCOPE.PRIVATE })
    await em.flush()

    const count = await publisherService.publishJobs([job1], STATIC_SCOPE.PUBLIC)
    expect(count).eq(1)
    em.clear()
    const loadedJob1 = await em.findOneOrFail(Job, { id: job1.id })
    expect(loadedJob1.isPublic()).is.true()
  })

  it('publish comparisons to public', async () => {
    const app = create.appHelper.createRegular(em, { user }, { scope: STATIC_SCOPE.PRIVATE })
    const comparison1 = create.comparisonHelper.create(
      em,
      {
        user,
        app,
      },
      { scope: STATIC_SCOPE.PRIVATE },
    )
    const comparison2 = create.comparisonHelper.create(
      em,
      {
        user,
        app,
      },
      { scope: STATIC_SCOPE.PRIVATE },
    )
    await em.flush()
    create.filesHelper.create(
      em,
      { user },
      {
        scope: STATIC_SCOPE.PRIVATE,
        parentType: PARENT_TYPE.COMPARISON,
        parentId: comparison1.id,
        project: user.privateComparisonsProject,
      },
    )
    create.filesHelper.create(
      em,
      { user },
      {
        scope: STATIC_SCOPE.PUBLIC,
        parentType: PARENT_TYPE.COMPARISON,
        parentId: comparison2.id,
        project: user.publicFilesProject,
      },
    )
    await em.flush()
    const count = await publisherService.publishComparisons([comparison1, comparison2], STATIC_SCOPE.PUBLIC)
    expect(count).eq(2)
    em.clear()
    const loadedComparison1 = await em.findOneOrFail(Comparison, { id: comparison1.id })
    const loadedComparison2 = await em.findOneOrFail(Comparison, { id: comparison2.id })
    expect(loadedComparison1.isPublic()).is.true()
    expect(loadedComparison2.isPublic()).is.true()
  })

  it('publish folder to public', async () => {
    const folder = create.filesHelper.createFolder(em, { user }, {})
    await em.flush()
    const node = create.filesHelper.create(em, { user }, {})
    await em.flush()
    await publisherService.publishNodes([node, folder])
    const loadedFolder = await em.findOneOrFail(Node, { id: folder.id })
    const loadedNode = await em.findOneOrFail(Node, { id: node.id })
    expect(loadedFolder.scope).eq(STATIC_SCOPE.PUBLIC)
    expect(loadedNode.scope).eq(STATIC_SCOPE.PUBLIC)
  })
})
