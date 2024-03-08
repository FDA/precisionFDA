import type { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { create, db } from '@shared/test'
import { expect } from 'chai'
import type { UserCtx } from '@shared/types'
import { mocksReset as localMocksReset } from '@worker-test/utils/mocks'
import type { User } from '../../../domain'
import { EntityFetcherService } from '../../../domain/entity/entity-fetcher.service'
import { App, Discussion, Folder, UserFile } from '../../../domain'
import { mocksReset } from '../../mocks'
import { SPACE_MEMBERSHIP_ROLE } from '../../../domain/space-membership/space-membership.enum'
import { STATIC_SCOPE } from '../../../enums'
import { database, entities } from '@shared'

describe('EntityFetcherService tests', () => {
  let em: EntityManager<MySqlDriver>
  let user: User
  let differentUser: User
  let userCtx: UserCtx
  let entityFetcher: EntityFetcherService

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork()
    user = create.userHelper.create(em)
    differentUser = create.userHelper.create(em)
    await em.flush()
    userCtx = { ...user, accessToken: 'secretTokenDoNotTellAnyone' }

    // all tests are done from the perspective of 'user' and its data
    entityFetcher = new EntityFetcherService(em, userCtx)

    localMocksReset()
    mocksReset()
  })


  it('test user can access own private files', async () => {
    create.filesHelper.create(em, { user })
    create.filesHelper.create(em, { user: differentUser })
    create.filesHelper.createUploaded(em, { user })
    await em.flush()

    const accessibleFiles = await entityFetcher.getAccessible(UserFile)
    const editableFiles = await entityFetcher.getEditable(UserFile)
    expect(accessibleFiles.length).to.equal(2)
    expect(editableFiles.length).to.equal(2)
    expect(accessibleFiles[0].user.id).to.equal(user.id)
    expect(accessibleFiles[1].user.id).to.equal(user.id)
    expect(editableFiles[0].user.id).to.equal(user.id)
    expect(editableFiles[1].user.id).to.equal(user.id)

    create.discussionHelper.create(em, { user })
    create.discussionHelper.create(em, { user: differentUser })

    const myDiscussions = await entityFetcher.getAccessible(Discussion)
    expect(myDiscussions.length).to.equal(1)
    expect(myDiscussions[0].user.id).to.equal(user.id)
  })

  it('test user can access valid spaces', async () => {
    const editableSpace = create.spacesHelper.create(em)
    const accessibleSpace = create.spacesHelper.create(em)
    const notAccessibleSpace = create.spacesHelper.create(em)
    const someOtherSpace = create.spacesHelper.create(em)

    create.spacesHelper.addMember(em, {
      user,
      space: editableSpace,
    }, { role: SPACE_MEMBERSHIP_ROLE.LEAD })
    create.spacesHelper.addMember(em, {
      user,
      space: accessibleSpace,
    }, { role: SPACE_MEMBERSHIP_ROLE.VIEWER })
    create.spacesHelper.addMember(em, {
      user,
      space: notAccessibleSpace,
    }, { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR, active: false }) // inactive membership
    create.spacesHelper.addMember(em, {
      user: differentUser,
      space: someOtherSpace,
    }, { role: SPACE_MEMBERSHIP_ROLE.ADMIN }) // user is not even member
    await em.flush()

    const accessibleSpaces = await entityFetcher.getAccessible(entities.Space)
    expect(accessibleSpaces.length).to.equal(2)
    expect(accessibleSpaces[0].id).to.equal(editableSpace.id)
    expect(accessibleSpaces[1].id).to.equal(accessibleSpace.id)

    const editableSpaces = await entityFetcher.getEditable(entities.Space)
    expect(editableSpaces.length).to.equal(1)
    expect(editableSpaces[0].id).to.equal(editableSpace.id)

    //TODO Jiri: Currently not allowed to fetch spaces with getEditableById or getAccessibleById
    // const shouldBeNullSpace = await entityFetcher.getEditableById(entities.Space, notAccessibleSpace.id)
    // const shouldBeAlsoNullSpace = await entityFetcher.getAccessibleById(entities.Space, notAccessibleSpace.id)
    // const shouldBeAnotherNullSpace = await entityFetcher.getAccessibleById(entities.Space, someOtherSpace.id)

    // expect(shouldBeNullSpace).to.be.null()
    // expect(shouldBeAlsoNullSpace).to.be.null()
    // expect(shouldBeAnotherNullSpace).to.be.null()
  })

  it('test user can access files in valid spaces', async () => {
    const editableSpace = create.spacesHelper.create(em)
    const nonEditableSpace = create.spacesHelper.create(em)
    const someOtherSpace = create.spacesHelper.create(em)

    create.spacesHelper.addMember(em, {
      user,
      space: editableSpace,
    }, { role: SPACE_MEMBERSHIP_ROLE.LEAD })
    create.spacesHelper.addMember(em, {
      user,
      space: nonEditableSpace,
    }, { role: SPACE_MEMBERSHIP_ROLE.VIEWER })
    create.spacesHelper.addMember(em, {
      user: differentUser,
      space: someOtherSpace,
    }, { role: SPACE_MEMBERSHIP_ROLE.LEAD })
    await em.flush()
    create.filesHelper.create(em, { user }, { scope: `space-${editableSpace.id}` })
    create.filesHelper.create(em, { user }, {
      scope: `space-${editableSpace.id}`,
      scopedParentFolderId: 3,
    })
    create.filesHelper.create(em, { user }, { scope: `space-${nonEditableSpace.id}` })
    create.filesHelper.create(em, { user }, {
      scope: `space-${nonEditableSpace.id}`,
      scopedParentFolderId: 5,
    })
    create.filesHelper.create(em, { user: differentUser }, { scope: `space-${someOtherSpace.id}` })
    await em.flush()

    const editableFiles = await entityFetcher.getEditable(UserFile)
    expect(editableFiles.length).to.equal(2)
    const accessibleFiles = await entityFetcher.getAccessible(UserFile)
    expect(accessibleFiles.length).to.equal(4)
  })

  it('test user can access files in valid space, private and public scopes', async () => {
    const editableSpace = create.spacesHelper.create(em)
    const nonEditableSpace = create.spacesHelper.create(em)

    create.spacesHelper.addMember(em, {
      user,
      space: editableSpace,
    }, { role: SPACE_MEMBERSHIP_ROLE.LEAD })
    create.spacesHelper.addMember(em, {
      user,
      space: nonEditableSpace,
    }, { role: SPACE_MEMBERSHIP_ROLE.VIEWER })
    create.spacesHelper.addMember(em, {
      user: differentUser,
      space: nonEditableSpace,
    }, { role: SPACE_MEMBERSHIP_ROLE.LEAD })
    await em.flush()
    create.filesHelper.create(em, { user }, { scope: `space-${editableSpace.id}` })
    create.filesHelper.create(em, { user }, { scope: STATIC_SCOPE.PUBLIC })
    create.filesHelper.create(em, { user }, { scope: STATIC_SCOPE.PRIVATE, parentFolderId: 5 })
    create.filesHelper.create(em, { user: differentUser }, {
      scope: `space-${nonEditableSpace.id}`,
      scopedParentFolderId: 3,
    })
    create.filesHelper.create(em, { user: differentUser }, { scope: STATIC_SCOPE.PRIVATE })
    create.filesHelper.create(em, { user: differentUser }, { scope: STATIC_SCOPE.PUBLIC })
    await em.flush()

    const editableFiles = await entityFetcher.getEditable(UserFile)
    expect(editableFiles.length).to.equal(3)
    const accessibleFiles = await entityFetcher.getAccessible(UserFile)
    expect(accessibleFiles.length).to.equal(5)
  })

  it('test user can access data in public/private scopes', async () => {
    create.appHelper.createRegular(em, { user }, { scope: STATIC_SCOPE.PRIVATE })
    create.appHelper.createRegular(em, { user: differentUser }, { scope: STATIC_SCOPE.PRIVATE })
    create.appHelper.createHTTPS(em, { user })
    create.appHelper.createHTTPS(em, { user: differentUser })
    await em.flush()
    const accessibleApps = await entityFetcher.getAccessible(entities.App)
    const editableApps = await entityFetcher.getEditable(entities.App)
    expect(accessibleApps.length).to.equal(3)
    expect(editableApps.length).to.equal(2)

    create.workflowHelper.create(em, { user })
    create.workflowHelper.create(em, { user: differentUser })
    create.workflowHelper.create(em, { user: differentUser }, { scope: STATIC_SCOPE.PUBLIC })
    await em.flush()
    const accessibleWorkflows = await entityFetcher.getAccessible(entities.Workflow)
    const editableWorkflows = await entityFetcher.getEditable(entities.Workflow)
    expect(accessibleWorkflows.length).to.equal(2)
    expect(editableWorkflows.length).to.equal(1)

    create.jobHelper.create(em, { user })
    create.jobHelper.create(em, { user }, { scope: STATIC_SCOPE.PUBLIC })
    create.jobHelper.create(em, { user: differentUser })
    create.jobHelper.create(em, { user: differentUser }, { scope: STATIC_SCOPE.PUBLIC })
    await em.flush()
    const accessibleJobs = await entityFetcher.getAccessible(entities.Job)
    const editableJobs = await entityFetcher.getEditable(entities.Job)
    expect(accessibleJobs.length).to.equal(3)
    expect(editableJobs.length).to.equal(2)

    create.assetHelper.create(em, { user })
    create.assetHelper.create(em, { user }, { scope: STATIC_SCOPE.PUBLIC })
    create.assetHelper.create(em, { user: differentUser })
    await em.flush()
    const accessibleAssets = await entityFetcher.getAccessible(entities.Asset)
    const editableAssets = await entityFetcher.getEditable(entities.Asset)
    expect(accessibleAssets.length).to.equal(2)
    expect(editableAssets.length).to.equal(2)


    create.filesHelper.createFolder(em, { user })
    create.filesHelper.createFolder(em, { user }, { scope: STATIC_SCOPE.PUBLIC })
    create.filesHelper.createFolder(em, { user: differentUser })
    await em.flush()
    const accessibleFolders = await entityFetcher.getAccessible(Folder)
    const editableFolders = await entityFetcher.getEditable(Folder)
    expect(accessibleFolders.length).to.equal(2)
    expect(editableFolders.length).to.equal(2)
  })

  it('test user cannot access other users private data', async () => {
    create.filesHelper.create(em, { user: differentUser })
    create.filesHelper.createJobOutput(em, { user: differentUser, jobId: 1 })
    create.filesHelper.createUploaded(em, { user: differentUser })
    await em.flush()
    const accessibleFiles = await entityFetcher.getAccessible(UserFile)
    const editableFiles = await entityFetcher.getEditable(UserFile)
    expect(accessibleFiles.length).to.equal(0)
    expect(editableFiles.length).to.equal(0)

    create.appHelper.createRegular(em, { user: differentUser }, { scope: 'private' })
    await em.flush()
    const accessibleApps = await entityFetcher.getAccessible(App)
    const editableApps = await entityFetcher.getEditable(App)
    expect(accessibleApps.length).to.equal(0)
    expect(editableApps.length).to.equal(0)
  })
})
