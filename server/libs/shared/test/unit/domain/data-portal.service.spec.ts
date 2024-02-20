import type { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { database } from '@shared/database'
import { DataPortal } from '@shared/domain/data-portal/data-portal.entity'
import { DataPortalService } from '@shared/domain/data-portal/service/data-portal.service'
import { DataPortalParam, FileParam } from '@shared/domain/data-portal/service/data-portal.types'
import { NotificationInput } from '@shared/domain/notification/notification.input'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { Resource } from '@shared/domain/resource/resource.entity'
import { FileRemoveOperation } from '@shared/domain/user-file/ops/file-remove'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { User } from '@shared/domain/user/user.entity'
import { Event } from '@shared/domain/event/event.entity'
import { NOTIFICATION_ACTION, SEVERITY } from '@shared/enums'
import { expect } from 'chai'
import { create, db } from '../../../src/test'
import type { PlatformClient } from '@shared/platform-client'
import type {
  FileCreateParams,
  FileDownloadLinkParams,
} from '@shared/platform-client/platform-client.params'
import type {
  ClassIdResponse,
  FileDownloadLinkResponse,
} from '@shared/platform-client/platform-client.responses'
import {
  DATA_PORTAL_MEMBER_ROLE,
  DATA_PORTAL_STATUS,
} from '@shared/domain/data-portal/data-portal.enum'
import {
  SPACE_MEMBERSHIP_ROLE,
  SPACE_MEMBERSHIP_SIDE,
} from '@shared/domain/space-membership/space-membership.enum'
import { FILE_STATE_DX } from '@shared/domain/user-file/user-file.types'
import { EVENT_TYPES } from '@shared/domain/event/event.helper'
import * as generate from '../../../src/test/generate'
import type { IdInput } from '@shared/types'
import { DataPortalRepository } from '@shared/domain/data-portal/data-portal.repository'
import { stub } from 'sinon'
import { NotFoundError } from '@shared/errors'

describe('data portal service tests', () => {
  const FILE_DXID = 'file-dxid'
  const FILE_UID = `${FILE_DXID}-1`
  const FILE_NAME = 'file-name'
  const DATA_PORTAL_NAME = 'data-portal-name'
  const PROJECT = 'project'

  let em: EntityManager<MySqlDriver>
  let user: User
  let notificationParams: NotificationInput

  let userClient: PlatformClient
  let dataPortalService: DataPortalService
  let notificationService: NotificationService
  let dataPortalRepository: DataPortalRepository
  const findDataPortalsStub = stub()

  const createDataPortalService = (userId: number, fileRemoveOperation?: FileRemoveOperation) => {
    const userCtx: UserCtx = {
      id: userId,
      accessToken: 'accessToken',
      dxuser: 'dxuser',
    }
    dataPortalRepository = {
      findDataPortalsByCardImageUid: findDataPortalsStub,
    } as unknown as DataPortalRepository

    return new DataPortalService(
      em,
      userCtx,
      dataPortalRepository,
      userClient,
      notificationService,
      fileRemoveOperation,
    )
  }

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork()
    user = create.userHelper.create(em)
    await em.flush()

    userClient = {
      async fileDownloadLink(params: FileDownloadLinkParams): Promise<FileDownloadLinkResponse> {
        return { url: 'testingURL' } as FileDownloadLinkResponse
      },
      async fileCreate(params: FileCreateParams): Promise<ClassIdResponse> {
        return { id: FILE_DXID } as ClassIdResponse
      },
    } as PlatformClient

    notificationService = {
      async createNotification(params: NotificationInput): Promise<void> {
        notificationParams = params
      },
    } as NotificationService

    findDataPortalsStub.reset()
    findDataPortalsStub.resolves([
      {
        name: DATA_PORTAL_NAME,
        cardImage: {
          getEntity: () => ({
            dxid: FILE_DXID,
            name: FILE_NAME,
            project: PROJECT,
          }),
        },
      },
    ])

    dataPortalService = createDataPortalService(user.id)
  })

  const createPortalAndAddMember = async (
    portalName: string,
    role: SPACE_MEMBERSHIP_ROLE,
  ): Promise<any> => {
    const space = create.spacesHelper.create(em, { name: portalName })
    const internalUser = create.userHelper.create(em, { dxuser: generate.random.chance.name() })
    await em.flush()

    const portal = create.dataPortalsHelper.create(em, { space }, { name: portalName })
    await em.flush()
    create.spacesHelper.addMember(
      em,
      { user: internalUser, space },
      {
        role,
        side: SPACE_MEMBERSHIP_SIDE.HOST,
      },
    )
    return { userId: internalUser.id, portalId: portal.id }
  }

  const createPortal = async (
    spaceName: string,
    hostLeadDxUser: string,
    guestLeadDxUser: string,
    portalName: string,
    description: string,
    status: DATA_PORTAL_STATUS,
    sortOrder: number,
    cardImageUrl: string,
  ): Promise<DataPortal> => {
    const space = create.spacesHelper.create(em, { name: spaceName })
    await em.flush()
    const hostLead = create.userHelper.create(em, { dxuser: hostLeadDxUser })
    const guestLead = create.userHelper.create(em, { dxuser: guestLeadDxUser })
    await em.flush()
    create.spacesHelper.addMember(
      em,
      { user: hostLead, space },
      {
        role: SPACE_MEMBERSHIP_ROLE.LEAD,
        side: SPACE_MEMBERSHIP_SIDE.HOST,
      },
    )
    create.spacesHelper.addMember(
      em,
      { user: guestLead, space },
      {
        role: SPACE_MEMBERSHIP_ROLE.LEAD,
        side: SPACE_MEMBERSHIP_SIDE.GUEST,
      },
    )
    create.spacesHelper.addMember(
      em,
      { user, space },
      {
        role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR,
        side: SPACE_MEMBERSHIP_SIDE.GUEST,
      },
    )

    return create.dataPortalsHelper.create(
      em,
      { space },
      {
        name: portalName,
        description,
        status,
        sortOrder,
        cardImageUrl,
      },
    )
  }

  it('test create data portal', async () => {
    const siteAdmin = create.userHelper.createSiteAdmin(em)
    const space = create.spacesHelper.create(em, { name: 'space-name' })
    await em.flush()

    const input = {
      name: 'test-data-portal',
      description: 'description',
      sortOrder: 1,
      status: DATA_PORTAL_STATUS.OPEN,
      spaceId: space.id,
    } as DataPortalParam

    dataPortalService = createDataPortalService(siteAdmin.id)
    const portal = await dataPortalService.create(input)
    em.clear()

    const loadedDataPortal = await em.findOneOrFail(
      DataPortal,
      { id: portal.id },
      { populate: ['space'] },
    )
    expect(loadedDataPortal.name).eq('test-data-portal')
    expect(loadedDataPortal.description).eq('description')
    expect(loadedDataPortal.sortOrder).eq(1)
    expect(loadedDataPortal.status).eq(DATA_PORTAL_STATUS.OPEN)
    expect(loadedDataPortal.space.id).eq(space.id)
  })

  it('test create data portal - fail without site admin privileges', async () => {
    const adminUser = create.userHelper.createAdmin(em)
    const challengeBotUser = create.userHelper.createChallengeBot(em)
    const space = create.spacesHelper.create(em, { name: 'space-name' })
    await em.flush()

    const input = {
      name: 'test-data-portal',
      description: 'description',
      sortOrder: 1,
      status: DATA_PORTAL_STATUS.OPEN,
      spaceId: space.id,
    } as DataPortalParam

    try {
      await dataPortalService.create(input)
      expect.fail('Operation is expected to fail.')
    } catch (error: any) {
      expect(error.name).to.equal('PermissionError')
      expect(error.message).eq('Only site admins can create Data Portals')
    }

    try {
      dataPortalService = createDataPortalService(adminUser.id)
      await dataPortalService.create(input)
      expect.fail('Operation is expected to fail.')
    } catch (error: any) {
      expect(error.name).to.equal('PermissionError')
      expect(error.message).eq('Only site admins can create Data Portals')
    }

    try {
      dataPortalService = createDataPortalService(challengeBotUser.id)
      await dataPortalService.create(input)
      expect.fail('Operation is expected to fail.')
    } catch (error: any) {
      expect(error.name).to.equal('PermissionError')
      expect(error.message).eq('Only site admins can create Data Portals')
    }
  })

  it('test update data portal', async () => {
    const space = create.spacesHelper.create(em, { name: 'space-name' })
    const cardImageFile = create.filesHelper.create(em, { user }, { name: 'cardImageFile' })
    await em.flush()

    const portal = create.dataPortalsHelper.create(
      em,
      { space },
      {
        name: 'test-data-portal',
        description: 'description',
        status: DATA_PORTAL_STATUS.OPEN,
        sortOrder: 1,
        cardImageUrl: 'testUrl',
      },
    )
    create.spacesHelper.addMember(
      em,
      { user, space },
      {
        role: SPACE_MEMBERSHIP_ROLE.LEAD,
        side: SPACE_MEMBERSHIP_SIDE.HOST,
      },
    )
    await em.flush()

    await dataPortalService.update({
      id: portal.id,
      name: 'name-updated',
      description: 'description-updated',
      status: DATA_PORTAL_STATUS.CLOSED,
      sortOrder: 2,
      cardImageUid: cardImageFile.uid,
      content: 'content-update',
      editorState: 'editorState',
    } as DataPortalParam)
    em.clear()

    const loadedDataPortal = await em.findOneOrFail(
      DataPortal,
      { id: portal.id },
      { populate: ['space', 'cardImage'] },
    )
    expect(loadedDataPortal.name).eq('name-updated')
    expect(loadedDataPortal.description).eq('description-updated')
    expect(loadedDataPortal.sortOrder).eq(2)
    expect(loadedDataPortal.cardImage.getEntity().uid).eq(cardImageFile.uid)
    expect(loadedDataPortal.space.id).eq(space.id)
    expect(loadedDataPortal.cardImageUrl).eq('testUrl')
    expect(loadedDataPortal.content).eq('content-update')
    expect(loadedDataPortal.editorState).eq('editorState')
  })

  it('test update data portal settings - fail without space lead privileges', async () => {
    const space = create.spacesHelper.create(em, { name: 'space-name' })
    await em.flush()
    const portal = create.dataPortalsHelper.create(em, { space }, { name: 'test-data-portal' })
    create.spacesHelper.addMember(
      em,
      { user, space },
      {
        role: SPACE_MEMBERSHIP_ROLE.ADMIN,
        side: SPACE_MEMBERSHIP_SIDE.HOST,
      },
    )
    await em.flush()

    try {
      await dataPortalService.update({
        id: portal.id,
        name: 'name-updated',
      } as DataPortalParam)
      expect.fail('Operation is expected to fail.')
    } catch (error: any) {
      expect(error.name).to.equal('PermissionError')
      expect(error.message).eq('Only portal leads can update portal settings')
    }
  })

  it('test update data portal content - fail without space lead or admin privileges', async () => {
    const admin = create.userHelper.create(em)
    const lead = create.userHelper.create(em)
    const ordinary = create.userHelper.create(em)
    const space = create.spacesHelper.create(em, { name: 'space-name' })
    await em.flush()
    const portal = create.dataPortalsHelper.create(em, { space }, { name: 'test-data-portal' })
    create.spacesHelper.addMember(
      em,
      { user: admin, space },
      {
        role: SPACE_MEMBERSHIP_ROLE.ADMIN,
        side: SPACE_MEMBERSHIP_SIDE.HOST,
      },
    )
    create.spacesHelper.addMember(
      em,
      { user: lead, space },
      {
        role: SPACE_MEMBERSHIP_ROLE.LEAD,
        side: SPACE_MEMBERSHIP_SIDE.HOST,
      },
    )
    create.spacesHelper.addMember(
      em,
      {
        user: ordinary,
        space,
      },
      { role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR, side: SPACE_MEMBERSHIP_SIDE.HOST },
    )
    await em.flush()

    dataPortalService = createDataPortalService(admin.id)
    await dataPortalService.update({
      id: portal.id,
      content: 'change 1',
    } as DataPortalParam)

    dataPortalService = createDataPortalService(lead.id)
    await dataPortalService.update({
      id: portal.id,
      content: 'change 2',
    } as DataPortalParam)

    try {
      dataPortalService = createDataPortalService(ordinary.id)
      await dataPortalService.update({
        id: portal.id,
        content: 'change 3',
      } as DataPortalParam)
      expect.fail('Operation is expected to fail.')
    } catch (error: any) {
      expect(error.name).to.equal('PermissionError')
      expect(error.message).eq('Only portal admins and leads can update portal content')
    }
  })

  it('test get data portal', async () => {
    const portal = await createPortal(
      'space-name',
      'host-lead',
      'guest-lead',
      'test-data-portal',
      'description',
      DATA_PORTAL_STATUS.OPEN,
      1,
      'testUrl',
    )
    create.spacesHelper.addMember(
      em,
      {
        user,
        space: portal.space.getEntity(),
      },
      { role: SPACE_MEMBERSHIP_ROLE.VIEWER, side: SPACE_MEMBERSHIP_SIDE.HOST },
    )

    await em.flush()

    const result = await dataPortalService.get(portal.id)
    expect(result.name).eq('test-data-portal')
    expect(result.description).eq('description')
    expect(result.status).eq(DATA_PORTAL_STATUS.OPEN)
    expect(result.sortOrder).eq(1)
    expect(result.cardImageUrl).eq('testUrl')
    expect(result.hostLeadDxuser).eq('host-lead')
    expect(result.guestLeadDxuser).eq('guest-lead')

    expect(result.members.length).eq(4)
    expect(result.members[0].dxuser).eq('host-lead')
    expect(result.members[0].role).eq(DATA_PORTAL_MEMBER_ROLE.LEAD)
    expect(result.members[1].dxuser).eq('guest-lead')
    expect(result.members[1].role).eq(DATA_PORTAL_MEMBER_ROLE.LEAD)
    expect(result.members[2].dxuser.startsWith('user-')).eq(true)
    expect(result.members[2].role).eq(DATA_PORTAL_MEMBER_ROLE.CONTRIBUTOR)
    expect(result.members[3].dxuser.startsWith('user-')).eq(true)
    expect(result.members[3].role).eq(DATA_PORTAL_MEMBER_ROLE.VIEWER)
  })

  it('test get data portal - fail with lack of privileges', async () => {
    const viewer = await createPortalAndAddMember('portal1', SPACE_MEMBERSHIP_ROLE.VIEWER)
    const contributor = await createPortalAndAddMember('portal2', SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR)
    const admin = await createPortalAndAddMember('portal3', SPACE_MEMBERSHIP_ROLE.ADMIN)
    const lead = await createPortalAndAddMember('portal4', SPACE_MEMBERSHIP_ROLE.LEAD)

    // following should be fine
    dataPortalService = createDataPortalService(viewer.userId)
    await dataPortalService.get(viewer.portalId)
    dataPortalService = createDataPortalService(contributor.userId)
    await dataPortalService.get(contributor.portalId)
    dataPortalService = createDataPortalService(admin.userId)
    await dataPortalService.get(admin.portalId)
    dataPortalService = createDataPortalService(lead.userId)
    await dataPortalService.get(lead.portalId)

    dataPortalService = createDataPortalService(user.id)
    try {
      await dataPortalService.get(lead.portalId)
      expect.fail('Operation is expected to fail')
    } catch (error: any) {
      expect(error.name).to.equal('PermissionError')
      expect(error.message).eq('Only members of the corresponding space can access this portal')
    }
  })

  it('test list data portal', async () => {
    await createPortal(
      'space-name_1',
      'host-lead_1',
      'guest-lead_1',
      'test-data-portal_1',
      'description_1',
      DATA_PORTAL_STATUS.OPEN,
      2,
      'testUrl_1',
    )
    await createPortal(
      'space-name_2',
      'host-lead_2',
      'guest-lead_2',
      'test-data-portal_2',
      'description_2',
      DATA_PORTAL_STATUS.CLOSED,
      1,
      'testUrl_2',
    )

    const result = await dataPortalService.list()

    expect(result.data_portals.length).eq(2)
    expect(result.data_portals[0].name).eq('test-data-portal_2')
    expect(result.data_portals[0].description).eq('description_2')
    expect(result.data_portals[0].hostLeadDxuser).eq('host-lead_2')
    expect(result.data_portals[0].guestLeadDxuser).eq('guest-lead_2')
    expect(result.data_portals[0].status).eq(DATA_PORTAL_STATUS.CLOSED)
    expect(result.data_portals[0].sortOrder).eq(1)
    expect(result.data_portals[0].cardImageUrl).eq('testUrl_2')

    expect(result.data_portals[1].name).eq('test-data-portal_1')
    expect(result.data_portals[1].description).eq('description_1')
    expect(result.data_portals[1].hostLeadDxuser).eq('host-lead_1')
    expect(result.data_portals[1].guestLeadDxuser).eq('guest-lead_1')
    expect(result.data_portals[1].status).eq(DATA_PORTAL_STATUS.OPEN)
    expect(result.data_portals[1].sortOrder).eq(2)
    expect(result.data_portals[1].cardImageUrl).eq('testUrl_1')
  })

  it('test list data portal - filter by user roles', async () => {
    const viewer = await createPortalAndAddMember('portal1', SPACE_MEMBERSHIP_ROLE.VIEWER)
    const contributor = await createPortalAndAddMember('portal2', SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR)
    const admin = await createPortalAndAddMember('portal3', SPACE_MEMBERSHIP_ROLE.ADMIN)
    const lead = await createPortalAndAddMember('portal4', SPACE_MEMBERSHIP_ROLE.LEAD)
    const nocoiner = create.userHelper.create(em, { dxuser: 'has nothing' })

    dataPortalService = createDataPortalService(viewer.userId)
    let result = await dataPortalService.list()
    expect(result.data_portals.length).eq(1)

    dataPortalService = createDataPortalService(contributor.userId)
    result = await dataPortalService.list()
    expect(result.data_portals.length).eq(1)

    dataPortalService = createDataPortalService(admin.userId)
    result = await dataPortalService.list()
    expect(result.data_portals.length).eq(1)

    dataPortalService = createDataPortalService(lead.userId)
    result = await dataPortalService.list()
    expect(result.data_portals.length).eq(1)

    dataPortalService = createDataPortalService(nocoiner.id)
    result = await dataPortalService.list()
    expect(result.data_portals.length).eq(0)
  })

  it('test list data portal - filter by default', async () => {
    const siteAdmin = create.userHelper.createSiteAdmin(em)
    const space = create.spacesHelper.create(em, { name: 'space-name', hostProject: 'hostProject' })
    await em.flush()
    create.spacesHelper.addMember(em, { space, user }, { role: SPACE_MEMBERSHIP_ROLE.VIEWER })
    create.dataPortalsHelper.create(
      em,
      { space },
      { name: 'test-data-portal-default', default: true },
    )
    create.dataPortalsHelper.create(
      em,
      { space },
      { name: 'test-data-portal-non-default', default: false },
    )
    await em.flush()

    let result = await dataPortalService.list()
    expect(result.data_portals.length).eq(2)

    dataPortalService = createDataPortalService(siteAdmin.id)
    result = await dataPortalService.list(true)
    expect(result.data_portals.length).eq(1)

    dataPortalService = createDataPortalService(user.id)
    result = await dataPortalService.list(true)
    expect(result.data_portals.length).eq(1)
  })

  it('test update data portal and make sure only one is default', async () => {
    const siteAdmin = create.userHelper.createSiteAdmin(em)
    const space = create.spacesHelper.create(em, { name: 'space-name', hostProject: 'hostProject' })
    await em.flush()
    await create.dataPortalsHelper.create(
      em,
      { space },
      { name: 'test-data-portal-default', default: true },
    )
    const dataPortal2 = create.dataPortalsHelper.create(
      em,
      { space },
      { name: 'test-data-portal-non-default', default: false },
    )
    await em.flush()

    dataPortalService = createDataPortalService(siteAdmin.id)
    await dataPortalService.update({ id: dataPortal2.id, default: true } as DataPortalParam)

    const result = await dataPortalService.list(true)
    expect(result.data_portals.length).eq(1)
  })

  it('test create data portal card image', async () => {
    const challengeUser = create.userHelper.createChallengeBot(em)
    const space = create.spacesHelper.create(em, { name: 'space-name', hostProject: 'hostProject' })
    const dataPortal = create.dataPortalsHelper.create(em, { space }, { name: 'test-data-portal' })
    await em.flush()

    dataPortalService = createDataPortalService(challengeUser.id)
    await dataPortalService.createCardImage(
      { name: 'test-card.jpg', description: 'description' },
      dataPortal.id,
    )
    const file = await em.findOneOrFail(UserFile, { name: 'test-card.jpg' })

    expect(file.uid).eq('file-dxid-1')
    expect(file.project).eq('hostProject')
    expect(file.description).eq('description')
    expect(file.userId).eq(2) // challenge bot
    expect(file.parentId).eq(2) // challenge bot
    expect(file.state).eq(FILE_STATE_DX.OPEN)
    expect(file.scope).eq('space-1')
    expect(file.uid).eq('file-dxid-1')
  })

  it('test update card image url', async () => {
    await dataPortalService.updateCardImageUrl(FILE_UID)

    expect(findDataPortalsStub.getCall(0).args[0]).to.eq(FILE_UID)
    expect(notificationParams).deep.eq({
      message: `Card image url for ${DATA_PORTAL_NAME} has been updated`,
      severity: SEVERITY.INFO,
      action: NOTIFICATION_ACTION.DATA_PORTAL_CARD_IMAGE_URL_UPDATED,
      userId: user.id,
    })
  })

  it('test update card image url - no corresponding data portal found', async () => {
    findDataPortalsStub.resolves([])
    await expect(dataPortalService.updateCardImageUrl(FILE_UID)).to.be.rejectedWith(
      NotFoundError,
      `DataPortal for fileUid ${FILE_UID} was not found`,
    )
  })

  const createAndLoadPortal = async (): Promise<DataPortal> => {
    const space = create.spacesHelper.create(em, { name: 'space-name' })
    await em.flush()
    create.spacesHelper.addMember(em, { user, space }, { role: SPACE_MEMBERSHIP_ROLE.LEAD })
    const dataPortal = create.dataPortalsHelper.create(em, { space }, { name: 'portal-name' })
    await em.flush()

    await dataPortalService.createResource(
      {
        name: 'test-resource.jpg',
        description: 'description',
      },
      dataPortal.id,
    )
    em.clear()
    return await em.findOneOrFail(
      DataPortal,
      { id: dataPortal.id },
      { populate: ['space', 'resources.userFile'] },
    )
  }

  it('test create data portal resource', async () => {
    const loadedDataPortal = await createAndLoadPortal()
    const resources = loadedDataPortal.resources.getItems()
    expect(resources.length).eq(1)
    const userFile = resources[0].userFile.getEntity()
    expect(userFile.name).eq('test-resource.jpg')
    expect(userFile.description).eq('description')
  })

  it('test create data portal resource - fail with lack of privileges', async () => {
    const space = create.spacesHelper.create(em, { name: 'space-name' })
    await em.flush()
    const dataPortal = create.dataPortalsHelper.create(em, { space }, { name: 'portal-name' })
    await em.flush()

    try {
      await dataPortalService.createResource({ name: 'test' } as FileParam, dataPortal.id)
      expect.fail('Operation is expected to fail')
    } catch (error: any) {
      expect(error.name).to.equal('PermissionError')
      expect(error.message).eq('Only roles ADMIN,LEAD,CONTRIBUTOR can create resources')
    }
  })

  it('test remove data portal resource', async () => {
    let fileRemoveOperationParam: IdInput = { id: 0 }
    const fileRemoveOperation = {
      async run(input): Promise<number> {
        const fileToDelete = await em.findOne(UserFile, { id: input.id })
        if (fileToDelete) {
          const fileDeleteEvent = new Event()
          fileDeleteEvent.type = EVENT_TYPES.FILE_DELETED
          fileDeleteEvent.dxuser = user.dxuser
          fileDeleteEvent.param1 = '10'
          fileDeleteEvent.param2 = fileToDelete.dxid

          await em.persistAndFlush(fileDeleteEvent)
          await em.removeAndFlush(fileToDelete)
        }

        fileRemoveOperationParam = input
        return input.id
      },
    } as FileRemoveOperation
    dataPortalService = createDataPortalService(user.id, fileRemoveOperation)

    const loadedDataPortal = await createAndLoadPortal()
    await dataPortalService.removeResource(loadedDataPortal.resources.getItems()[0].id)
    em.clear()

    // load portal and verify that resource was removed
    const loadedDataPortalAfterRemoval = await em.findOneOrFail(
      DataPortal,
      { id: loadedDataPortal.id },
      { populate: ['space', 'resources.userFile'] },
    )
    expect(loadedDataPortalAfterRemoval.resources.getItems().length).eq(0)

    // verify that resource was removed from database
    const userFile = await em.findOne(UserFile, { name: 'test-resource.jpg' })
    expect(userFile).eq(null)
    const resource = await em.find(Resource, {})
    expect(resource.length).eq(0)

    // verify that event was created
    const events = await em.find(Event, {})
    expect(events.length).eq(1)

    expect(events[0].type).eq(EVENT_TYPES.FILE_DELETED)
    expect(events[0].dxuser).eq(user.dxuser)
    expect(events[0].param1).eq('10')
    expect(events[0].param2).eq('file-dxid')

    expect(fileRemoveOperationParam?.id).eq(1)
  })

  it('test remove data portal resource - fail with lack of privileges', async () => {
    const loadedDataPortal = await createAndLoadPortal()
    const unprivilegedUser = create.userHelper.create(em)
    await em.flush()

    try {
      dataPortalService = createDataPortalService(unprivilegedUser.id)
      await dataPortalService.removeResource(loadedDataPortal.resources.getItems()[0].id)
      expect.fail('Operation is expected to fail')
    } catch (error: any) {
      expect(error.name).to.equal('PermissionError')
      expect(error.message).eq('Only roles ADMIN,LEAD,CONTRIBUTOR can remove resources')
    }
  })

  it('test list resources', async () => {
    const space = create.spacesHelper.create(em, { name: 'space-name' })
    await em.flush()
    create.spacesHelper.addMember(em, { user, space }, { role: SPACE_MEMBERSHIP_ROLE.LEAD })
    const dataPortal = create.dataPortalsHelper.create(em, { space }, { name: 'portal-name' })
    await em.flush()
    create.dataPortalsHelper.addResource(em, { user, dataPortal }, 'name1', 'dxid1')
    create.dataPortalsHelper.addResource(em, { user, dataPortal }, 'name2', 'dxid2')
    await em.flush()

    const result = await dataPortalService.listResources(dataPortal.id)
    expect(result.resources.length).eq(2)
  })

  it('test list resources - unprivileged receives no resources', async () => {
    const loadedDataPortal = await createAndLoadPortal()
    const unprivilegedUser = create.userHelper.create(em)
    await em.flush()

    dataPortalService = createDataPortalService(unprivilegedUser.id)
    const result = await dataPortalService.listResources(loadedDataPortal.id)
    expect(result.resources.length).eq(0)
  })

  it('test create resource link', async () => {
    create.userHelper.createChallengeBot(em)
    const space = create.spacesHelper.create(em, { name: 'space-name' })
    await em.flush()
    const dataPortal = create.dataPortalsHelper.create(em, { space }, { name: 'portal-name' })
    await em.flush()
    const resource = create.dataPortalsHelper.addResource(
      em,
      { user, dataPortal },
      'name1',
      'dxid1',
    )
    await em.flush()
    em.clear()

    const result = await dataPortalService.createResourceLink(resource.id)
    expect(result).eq('testingURL')
    const loadedResource = await em.findOneOrFail(Resource, { id: resource.id })
    expect(loadedResource.url).eq('testingURL')
  })

  it('list custom portals - no env variables set', async () => {
    const result = await dataPortalService.listAccessibleCustomPortals()

    expect(result.length).eq(0)
  })

  const customDPIds = (
    prismPortalId?: number,
    prismSpaceId?: number,
    toolsPortalId?: number,
    toolsSpaceId?: number,
    gettingStartedPortalId?: number,
    gettingStartedSpaceId?: number,
  ) => {
    const PRISM_PORTAL_ID = prismPortalId ?? 1
    const PRISM_SPACE_ID = prismSpaceId ?? 1
    const TOOLS_PORTAL_ID = toolsPortalId ?? 2
    const TOOLS_SPACE_ID = toolsSpaceId ?? 2
    const GETTING_STARTED_PORTAL_ID = gettingStartedPortalId ?? 3
    const GETTING_STARTED_SPACE_ID = gettingStartedSpaceId ?? 3

    process.env.PRISM_PORTAL_ID = PRISM_PORTAL_ID.toString()
    process.env.PRISM_SPACE_ID = PRISM_SPACE_ID.toString()
    process.env.TOOLS_PORTAL_ID = TOOLS_PORTAL_ID.toString()
    process.env.TOOLS_SPACE_ID = TOOLS_SPACE_ID.toString()
    process.env.GETTING_STARTED_PORTAL_ID = GETTING_STARTED_PORTAL_ID.toString()
    process.env.GETTING_STARTED_SPACE_ID = GETTING_STARTED_SPACE_ID.toString()
    return {
      PRISM_PORTAL_ID,
      PRISM_SPACE_ID,
      TOOLS_PORTAL_ID,
      TOOLS_SPACE_ID,
      GETTING_STARTED_PORTAL_ID,
      GETTING_STARTED_SPACE_ID,
    }
  }

  const testPortalsForAdmin = async (userId: number) => {
    const result = await dataPortalService.listAccessibleCustomPortals()

    expect(result.length).eq(0)
  }

  it('list custom portals - site admin role is irrelevant', async () => {
    create.userHelper.addSiteAdminRole(em, user)
    await em.flush()

    await testPortalsForAdmin(user.id)
  })

  it('list custom portals - accessible PRISM portal', async () => {
    const prismSpace = create.spacesHelper.create(em, { name: 'PRISM' })
    await em.flush()
    create.spacesHelper.addMember(
      em,
      { user, space: prismSpace },
      { role: SPACE_MEMBERSHIP_ROLE.LEAD },
    )
    const prismPortal = create.dataPortalsHelper.create(
      em,
      { space: prismSpace },
      { name: 'PRISM_PORTAL' },
    )
    await em.flush()
    const { PRISM_PORTAL_ID, PRISM_SPACE_ID } = customDPIds(prismPortal.id, prismSpace.id)

    const result = await dataPortalService.listAccessibleCustomPortals()
    expect(result.length).eq(1)
    expect(result[0].name).eq('PRISM')
    expect(result[0].id).eq(PRISM_PORTAL_ID)
    expect(result[0].spaceId).eq(PRISM_SPACE_ID)
  })

  it('list custom portals - accessible Tools portal', async () => {
    const toolsSpace = create.spacesHelper.create(em, { name: 'TOOLS' })
    await em.flush()
    create.spacesHelper.addMember(
      em,
      { user, space: toolsSpace },
      { role: SPACE_MEMBERSHIP_ROLE.LEAD },
    )
    const toolsPortal = create.dataPortalsHelper.create(
      em,
      { space: toolsSpace },
      { name: 'Tools_PORTAL' },
    )
    await em.flush()
    const { TOOLS_PORTAL_ID, TOOLS_SPACE_ID } = customDPIds(100, 100, toolsPortal.id, toolsSpace.id)

    const result = await dataPortalService.listAccessibleCustomPortals()
    expect(result.length).eq(1)
    expect(result[0].name).eq('Tools')
    expect(result[0].id).eq(TOOLS_PORTAL_ID)
    expect(result[0].spaceId).eq(TOOLS_SPACE_ID)
  })

  it('list custom portals - accessible Getting Started portal', async () => {
    const gettingStartedSpace = create.spacesHelper.create(em, { name: 'Getting Started and Next Steps' })
    await em.flush()
    create.spacesHelper.addMember(
      em,
      { user, space: gettingStartedSpace },
      { role: SPACE_MEMBERSHIP_ROLE.LEAD },
    )
    const gettingStartedPortal = create.dataPortalsHelper.create(
      em,
      { space: gettingStartedSpace },
      { name: 'Getting Started and Next Steps' },
    )
    await em.flush()
    const {
      GETTING_STARTED_SPACE_ID,
      GETTING_STARTED_PORTAL_ID,
    } = customDPIds(11, 11, 22, 22, gettingStartedPortal.id, gettingStartedSpace.id)

    const result = await dataPortalService.listAccessibleCustomPortals()
    expect(result.length).eq(1)
    expect(result[0].name).eq('Getting Started and Next Steps')
    expect(result[0].id).eq(GETTING_STARTED_PORTAL_ID)
    expect(result[0].spaceId).eq(GETTING_STARTED_SPACE_ID)
  })

  it('list custom portals - envs set, but not accessible', async () => {
    const prismSpace = create.spacesHelper.create(em, { name: 'PRISM' })
    const toolsSpace = create.spacesHelper.create(em, { name: 'TOOLS' })
    const gettingStartedSpace = create.spacesHelper.create(em, { name: 'Getting Started and Next Steps' })
    await em.flush()
    const prismPortal = create.dataPortalsHelper.create(
      em,
      { space: prismSpace },
      { name: 'Prism_PORTAL' },
    )
    const toolsPortal = create.dataPortalsHelper.create(
      em,
      { space: toolsSpace },
      { name: 'Tools_PORTAL' },
    )
    const gettingStartedPortal = create.dataPortalsHelper.create(
      em,
      { space: gettingStartedSpace },
      { name: 'Getting Started and Next Steps' },
    )

    await em.flush()

    customDPIds(prismPortal.id, prismSpace.id, toolsPortal.id, toolsSpace.id, gettingStartedPortal.id, gettingStartedSpace.id)

    const result = await dataPortalService.listAccessibleCustomPortals()
    expect(result.length).eq(0)
  })
})
