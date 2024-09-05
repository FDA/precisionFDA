import type { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { database } from '@shared/database'
import { DataPortal } from '@shared/domain/data-portal/data-portal.entity'
import { CreateDataPortalDTO } from '@shared/domain/data-portal/dto/CreateDataPortalDTO'
import { DataPortalService } from '@shared/domain/data-portal/service/data-portal.service'
import { DataPortalParam, FileParam } from '@shared/domain/data-portal/service/data-portal.types'
import { NotificationInput } from '@shared/domain/notification/notification.input'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { UserFileService } from '@shared/domain/user-file/service/user-file.service'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { User } from '@shared/domain/user/user.entity'
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
import { FILE_STATE_DX, PARENT_TYPE } from '@shared/domain/user-file/user-file.types'
import * as generate from '../../../src/test/generate'
import { DataPortalRepository } from '@shared/domain/data-portal/data-portal.repository'
import { stub } from 'sinon'
import { DataPortalUrlSlugFormatError, NotFoundError, PermissionError } from '@shared/errors'
import { UniqueConstraintViolationException } from '@mikro-orm/core'

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
  let userFileService: UserFileService
  const findDataPortalsStub = stub()
  const getDownloadLinkStub = stub()
  const removeFileStub = stub()

  const createDataPortalService = (userId: number) => {
    const userCtx: UserCtx = {
      id: userId,
      accessToken: 'accessToken',
      dxuser: 'dxuser',
    }
    dataPortalRepository = {
      findDataPortalsByCardImageUid: findDataPortalsStub,
    } as unknown as DataPortalRepository

    userFileService = {
      getDownloadLink: getDownloadLinkStub,
      removeFile: removeFileStub,
    } as unknown as UserFileService

    return new DataPortalService(
      em,
      userCtx,
      dataPortalRepository,
      userClient,
      notificationService,
      userFileService,
    )
  }

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork({ useContext: true })
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

    getDownloadLinkStub.reset()
    getDownloadLinkStub.resolves('link')

    dataPortalService = createDataPortalService(user.id)
  })

  const createPortalAndAddMember = async (
    portalName: string,
    urlSlug: string,
    role: SPACE_MEMBERSHIP_ROLE,
  ): Promise<any> => {
    const space = create.spacesHelper.create(em, { name: portalName })
    const internalUser = create.userHelper.create(em, { dxuser: generate.random.chance.name() })
    await em.flush()

    const portal = create.dataPortalsHelper.create(
      em,
      { space },
      { name: portalName, urlSlug: urlSlug },
    )
    await em.flush()
    create.spacesHelper.addMember(
      em,
      { user: internalUser, space },
      {
        role,
        side: SPACE_MEMBERSHIP_SIDE.HOST,
        active: true,
      },
    )
    await em.flush()
    return { userId: internalUser.id, portalId: portal.id }
  }

  const createPortal = async (
    spaceName: string,
    hostLeadDxUser: string,
    guestLeadDxUser: string,
    portalName: string,
    urlSlug: string,
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
        active: true,
      },
    )
    create.spacesHelper.addMember(
      em,
      { user: guestLead, space },
      {
        role: SPACE_MEMBERSHIP_ROLE.LEAD,
        side: SPACE_MEMBERSHIP_SIDE.GUEST,
        active: true,
      },
    )
    create.spacesHelper.addMember(
      em,
      { user, space },
      {
        role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR,
        side: SPACE_MEMBERSHIP_SIDE.GUEST,
        active: true,
      },
    )

    return create.dataPortalsHelper.create(
      em,
      { space },
      {
        name: portalName,
        urlSlug,
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
      urlSlug: 'test-data-portal',
      description: 'description',
      sortOrder: 1,
      status: DATA_PORTAL_STATUS.OPEN,
      spaceId: space.id,
    } as CreateDataPortalDTO

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
    } as CreateDataPortalDTO

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
        urlSlug: 'test-data-portal',
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
    const portal = create.dataPortalsHelper.create(
      em,
      { space },
      { name: 'test-data-portal', urlSlug: 'test-data-portal' },
    )
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
    const portal = create.dataPortalsHelper.create(
      em,
      { space },
      { name: 'test-data-portal', urlSlug: 'test-data-portal' },
    )
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

  it('test get data portal - fail with non active membership', async () => {
    const portal = await createPortal(
      'space-name',
      'host-lead',
      'guest-lead',
      'test-data-portal',
      'urlSlug',
      'description',
      DATA_PORTAL_STATUS.OPEN,
      1,
      'testUrl',
    )
    portal.space
      .getEntity()
      .spaceMemberships.getItems()
      .filter((membership) => membership.user.id == user.id)
      .forEach((membership) => (membership.active = false))
    await em.flush()

    await expect(dataPortalService.get(portal.id)).to.be.rejectedWith(
      PermissionError,
      'Only members of the corresponding space can access this portal',
    )
  })

  it('test get data portal - fail with lack of privileges', async () => {
    const viewer = await createPortalAndAddMember(
      'portal1',
      'portal1',
      SPACE_MEMBERSHIP_ROLE.VIEWER,
    )
    const contributor = await createPortalAndAddMember(
      'portal2',
      'portal2',
      SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR,
    )
    const admin = await createPortalAndAddMember('portal3', 'portal3', SPACE_MEMBERSHIP_ROLE.ADMIN)
    const lead = await createPortalAndAddMember('portal4', 'portal4', SPACE_MEMBERSHIP_ROLE.LEAD)

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
    const viewer = await createPortalAndAddMember(
      'portal1',
      'portal1',
      SPACE_MEMBERSHIP_ROLE.VIEWER,
    )
    const contributor = await createPortalAndAddMember(
      'portal2',
      'portal2',
      SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR,
    )
    const admin = await createPortalAndAddMember('portal3', 'portal3', SPACE_MEMBERSHIP_ROLE.ADMIN)
    const lead = await createPortalAndAddMember('portal4', 'portal4', SPACE_MEMBERSHIP_ROLE.LEAD)
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

  it('test create data portal card image', async () => {
    const challengeUser = create.userHelper.createChallengeBot(em)
    const space = create.spacesHelper.create(em, { name: 'space-name', hostProject: 'hostProject' })
    const dataPortal = create.dataPortalsHelper.create(
      em,
      { space },
      { name: 'test-data-portal', urlSlug: 'testdataportal' },
    )
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
    expect(file.user.id).eq(2) // challenge bot
    expect(file.parentId).eq(2) // challenge bot
    expect(file.parentType).eq(PARENT_TYPE.USER)
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
    const dataPortal = create.dataPortalsHelper.create(
      em,
      { space },
      { name: 'portal-name', urlSlug: 'portalname' },
    )
    await em.flush()

    await dataPortalService.createResource(
      {
        name: 'test-resource.jpg',
        description: 'description',
      },
      dataPortal.id.toString(),
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
    expect(userFile.parentType).eq(PARENT_TYPE.USER)
  })

  it('test create data portal resource - fail with lack of privileges', async () => {
    const space = create.spacesHelper.create(em, { name: 'space-name' })
    await em.flush()
    const dataPortal = create.dataPortalsHelper.create(
      em,
      { space },
      { name: 'portal-name', urlSlug: 'portalname' },
    )
    await em.flush()

    try {
      await dataPortalService.createResource(
        { name: 'test' } as FileParam,
        dataPortal.id.toString(),
      )
      expect.fail('Operation is expected to fail')
    } catch (error: any) {
      expect(error.name).to.equal('PermissionError')
      expect(error.message).eq('Only roles ADMIN,LEAD,CONTRIBUTOR can create resources')
    }
  })

  it('test remove data portal resource', async () => {
    dataPortalService = createDataPortalService(user.id)

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
    expect(removeFileStub.callCount).eq(1)
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
    const dataPortal = create.dataPortalsHelper.create(
      em,
      { space },
      { name: 'portal-name', urlSlug: 'portalname' },
    )
    await em.flush()
    create.dataPortalsHelper.addResource(em, { user, dataPortal }, 'name1', 'dxid1')
    create.dataPortalsHelper.addResource(em, { user, dataPortal }, 'name2', 'dxid2')
    await em.flush()

    const result = await dataPortalService.listResources(dataPortal.id.toString())
    expect(result.length).eq(2)
  })

  it('test list resources - unprivileged receives no resources', async () => {
    const loadedDataPortal = await createAndLoadPortal()
    const unprivilegedUser = create.userHelper.create(em)
    await em.flush()

    dataPortalService = createDataPortalService(unprivilegedUser.id)
    const result = await dataPortalService.listResources(loadedDataPortal.id.toString())
    expect(result.length).eq(0)
  })

  it('wrong url slug format check', async () => {
    const siteAdmin = create.userHelper.createSiteAdmin(em)
    const space = create.spacesHelper.create(em, { name: 'space-name' })
    await em.flush()

    dataPortalService = createDataPortalService(siteAdmin.id)

    const input = {
      name: 'test-data-portal',
      urlSlug: null,
      description: 'description',
      sortOrder: 1,
      status: DATA_PORTAL_STATUS.OPEN,
      spaceId: space.id,
    } as CreateDataPortalDTO

    // Null url slug
    await expect(dataPortalService.create(input)).to.be.rejectedWith(DataPortalUrlSlugFormatError)

    // Digits only url slug
    input.urlSlug = '42'
    await expect(dataPortalService.create(input)).to.be.rejectedWith(DataPortalUrlSlugFormatError)

    // Special chars in url slug
    input.urlSlug = 'abc$'
    await expect(dataPortalService.create(input)).to.be.rejectedWith(DataPortalUrlSlugFormatError)

    // Uppercase chars in url slug
    input.urlSlug = 'abc-D'
    await expect(dataPortalService.create(input)).to.be.rejectedWith(DataPortalUrlSlugFormatError)
  })

  it('duplicate url slug', async () => {
    const spaceA = create.spacesHelper.create(em, { name: 'SpaceA' })
    const spaceB = create.spacesHelper.create(em, { name: 'SpaceB' })
    create.dataPortalsHelper.create(
      em,
      { space: spaceA },
      { name: 'Portal A', urlSlug: 'same_url_slug' },
    )
    create.dataPortalsHelper.create(
      em,
      { space: spaceB },
      { name: 'Portal B', urlSlug: 'same_url_slug' },
    )
    await expect(em.flush()).to.be.rejectedWith(UniqueConstraintViolationException)
  })

  it('both id and url slug works to retrieve data portal', async () => {
    const portalName = `Portal ${new Date().toLocaleString()}`
    const urlSlug = 'portal-url-slug'

    // THE portal
    const { userId, portalId } = await createPortalAndAddMember(
      portalName,
      urlSlug,
      SPACE_MEMBERSHIP_ROLE.VIEWER,
    )

    // Some random portals to fill the DB
    for (let i = 0; i < 10; i++) {
      await createPortalAndAddMember(
        new Date().toLocaleString(),
        `slug_${i}`,
        SPACE_MEMBERSHIP_ROLE.VIEWER,
      )
    }

    dataPortalService = createDataPortalService(userId)

    const portalFromGetMethod = await dataPortalService.get(portalId)
    const portalBySlug = await dataPortalService.getByUrlSlugOrId(urlSlug)
    const portalById = await dataPortalService.getByUrlSlugOrId(portalId.toString())

    expect(portalBySlug.id).eq(portalId)
    expect(portalById.id).eq(portalId)
    expect(portalFromGetMethod.id).eq(portalId)

    expect(portalBySlug.urlSlug).eq(urlSlug)
    expect(portalById.urlSlug).eq(urlSlug)
    expect(portalFromGetMethod.urlSlug).eq(urlSlug)
  })
})
