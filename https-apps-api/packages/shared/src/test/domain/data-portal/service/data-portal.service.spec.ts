import { EntityManager, MySqlDriver } from '@mikro-orm/mysql'
import { create, db } from '@pfda/https-apps-shared/src/test'
import { database, entities } from '@pfda/https-apps-shared'
import { DataPortal, User, Event } from '../../../../domain'
import { DataPortalService } from '../../../../domain/data-portal/service/data-portal.service'
import { DataPortalParam, FileParam } from '../../../../domain/data-portal/service/data-portal.types'
import { ClassIdResponse, PlatformClient } from '../../../../platform-client'
import { FileCreateParams, FileDownloadLinkParams } from '../../../../platform-client/platform-client.params'
import { FileDownloadLinkResponse } from '../../../../platform-client/platform-client.responses'
import { expect } from 'chai'
import {
  DATA_PORTAL_MEMBER_ROLE,
  DATA_PORTAL_STATUS
} from '../../../../domain/data-portal/data-portal.enum'
import {
  SPACE_MEMBERSHIP_ROLE,
  SPACE_MEMBERSHIP_SIDE
} from '../../../../domain/space-membership/space-membership.enum'
import { FILE_STATE_DX } from '../../../../domain/user-file/user-file.types'
import { EVENT_TYPES } from '../../../../domain/event/event.helper'
import * as generate from '../../../generate'
import { FileRemoveOperation } from '../../../../domain/user-file'
import { IdInput } from '../../../../types'

describe('data portal service tests', () => {
  let em: EntityManager<MySqlDriver>
  let user: User
  let userClient: PlatformClient
  let dataPortalService: DataPortalService

  beforeEach(async () => {
    await db.dropData(database.connection())
    em = database.orm().em.fork()
    user = create.userHelper.create(em)
    await em.flush()

    userClient = {
      async fileDownloadLink(params: FileDownloadLinkParams): Promise<FileDownloadLinkResponse> {
        return {url: 'testingURL'} as FileDownloadLinkResponse
      },
      async fileCreate(params: FileCreateParams): Promise<ClassIdResponse> {
        return {id: 'file-dxid'} as ClassIdResponse
      }
    } as PlatformClient

    dataPortalService = new DataPortalService(em, userClient)
  })

  const createPortalAndAddMember = async (portalName: string, role: SPACE_MEMBERSHIP_ROLE): Promise<any> => {
    const space = create.spacesHelper.create(em, {name: portalName})
    const internalUser = create.userHelper.create(em, {dxuser: generate.random.chance.name()})
    await em.flush()

    const portal = create.dataPortalsHelper.create(em, { space }, { name: portalName })
    await em.flush()
    create.spacesHelper.addMember(em, {user: internalUser, space}, {
      role: role,
      side: SPACE_MEMBERSHIP_SIDE.HOST
    })
    return {userId: internalUser.id, portalId: portal.id}
  }

  const createPortal = async(spaceName: string, hostLeadDxUser: string, guestLeadDxUser: string,
                             portalName: string, description: string, status: DATA_PORTAL_STATUS,
                             sortOrder: number, cardImageId: string, cardImageUrl: string): Promise<DataPortal> => {
    const space = create.spacesHelper.create(em, {name: spaceName})
    await em.flush()
    const hostLead = create.userHelper.create(em, {dxuser: hostLeadDxUser})
    const guestLead = create.userHelper.create(em, {dxuser: guestLeadDxUser})
    await em.flush()
    create.spacesHelper.addMember(em, {user: hostLead, space}, {
      role: SPACE_MEMBERSHIP_ROLE.LEAD,
      side: SPACE_MEMBERSHIP_SIDE.HOST
    })
    create.spacesHelper.addMember(em, {user: guestLead, space}, {
      role: SPACE_MEMBERSHIP_ROLE.LEAD,
      side: SPACE_MEMBERSHIP_SIDE.GUEST
    })
    create.spacesHelper.addMember(em, {user, space}, {
      role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR,
      side: SPACE_MEMBERSHIP_SIDE.GUEST
    })

    return create.dataPortalsHelper.create(em, { space }, {
      name: portalName,
      description,
      status,
      sortOrder,
      cardImageId,
      cardImageUrl,
    })
  }

  it('test create data portal', async () => {
    const siteAdmin = create.userHelper.createSiteAdmin(em)
    const space = create.spacesHelper.create(em, {name: 'space-name'})
    await em.flush()

    const input = {
      name: 'test-data-portal',
      description: 'description',
      sortOrder: 1,
      status: DATA_PORTAL_STATUS.OPEN,
      spaceId: space.id,
    } as DataPortalParam
    const portal = await dataPortalService.create(input, siteAdmin.id)
    em.clear()

    const loadedDataPortal = await em.findOneOrFail(entities.DataPortal, { id: portal.id }, { populate: ['space'] })
    expect(loadedDataPortal.name).eq('test-data-portal')
    expect(loadedDataPortal.description).eq('description')
    expect(loadedDataPortal.sortOrder).eq(1)
    expect(loadedDataPortal.status).eq(DATA_PORTAL_STATUS.OPEN)
    expect(loadedDataPortal.space.id).eq(space.id)
  })

  it('test create data portal - fail without site admin privileges', async () => {
    const adminUser = create.userHelper.createAdmin(em)
    const challengeBotUser = create.userHelper.createChallengeBot(em)
    const space = create.spacesHelper.create(em, {name: 'space-name'})
    await em.flush()

    const input = {
      name: 'test-data-portal',
      description: 'description',
      sortOrder: 1,
      status: DATA_PORTAL_STATUS.OPEN,
      spaceId: space.id,
    } as DataPortalParam

    try {
      await dataPortalService.create(input, user.id)
      expect.fail('Operation is expected to fail.')
    } catch (error: any) {
      expect(error.name).to.equal('PermissionError')
      expect(error.message).eq('Only site admins can create Data Portals')
    }

    try {
      await dataPortalService.create(input, adminUser.id)
      expect.fail('Operation is expected to fail.')
    } catch (error: any) {
      expect(error.name).to.equal('PermissionError')
      expect(error.message).eq('Only site admins can create Data Portals')
    }

    try {
      await dataPortalService.create(input, challengeBotUser.id)
      expect.fail('Operation is expected to fail.')
    } catch (error: any) {
      expect(error.name).to.equal('PermissionError')
      expect(error.message).eq('Only site admins can create Data Portals')
    }
  })

  it('test update data portal', async () => {
    const space = create.spacesHelper.create(em, {name: 'space-name'})
    const cardImageFile = create.filesHelper.create(em, { user }, { name: 'cardImageFile' })
    await em.flush()

    const portal = create.dataPortalsHelper.create(em, { space }, {
      name: 'test-data-portal',
      description: 'description',
      status: DATA_PORTAL_STATUS.OPEN,
      sortOrder: 1,
      cardImageId: 'testUid',
      cardImageUrl: 'testUrl',
    })
    create.spacesHelper.addMember(em, {user, space}, {role: SPACE_MEMBERSHIP_ROLE.LEAD, side: SPACE_MEMBERSHIP_SIDE.HOST})
    await em.flush()

    await dataPortalService.update({
      id: portal.id,
      name: 'name-updated',
      description: 'description-updated',
      status: DATA_PORTAL_STATUS.CLOSED,
      sortOrder: 2,
      cardImageUid: cardImageFile.uid,
      content: 'content-update',
      editorState: 'editorState'
    } as DataPortalParam,user.id)
    em.clear()

    const loadedDataPortal = await em.findOneOrFail(entities.DataPortal, { id: portal.id }, { populate: ['space'] })
    expect(loadedDataPortal.name).eq('name-updated')
    expect(loadedDataPortal.description).eq('description-updated')
    expect(loadedDataPortal.sortOrder).eq(2)
    expect(loadedDataPortal.cardImageId).eq(cardImageFile.uid)
    expect(loadedDataPortal.space.id).eq(space.id)
    expect(loadedDataPortal.cardImageUrl).eq('testingURL')
    expect(loadedDataPortal.content).eq('content-update')
    expect(loadedDataPortal.editorState).eq('editorState')
  })

  it('test update data portal settings - fail without space lead privileges', async () => {
    const space = create.spacesHelper.create(em, {name: 'space-name'})
    await em.flush()
    const portal = create.dataPortalsHelper.create(em, { space }, { name: 'test-data-portal' })
    create.spacesHelper.addMember(em, {user, space}, {role: SPACE_MEMBERSHIP_ROLE.ADMIN, side: SPACE_MEMBERSHIP_SIDE.HOST})
    await em.flush()

    try {
      await dataPortalService.update({
        id: portal.id,
        name: 'name-updated'
      } as DataPortalParam, user.id)
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
    const space = create.spacesHelper.create(em, {name: 'space-name'})
    await em.flush()
    const portal = create.dataPortalsHelper.create(em, { space }, { name: 'test-data-portal' })
    create.spacesHelper.addMember(em, {user: admin, space}, {role: SPACE_MEMBERSHIP_ROLE.ADMIN, side: SPACE_MEMBERSHIP_SIDE.HOST})
    create.spacesHelper.addMember(em, {user: lead, space}, {role: SPACE_MEMBERSHIP_ROLE.LEAD, side: SPACE_MEMBERSHIP_SIDE.HOST})
    create.spacesHelper.addMember(em, {
        user: ordinary,
        space
      },
      {role: SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR, side: SPACE_MEMBERSHIP_SIDE.HOST},
    )
    await em.flush()

    await dataPortalService.update({
      id: portal.id,
      content: 'change 1'
    } as DataPortalParam, admin.id)

    await dataPortalService.update({
      id: portal.id,
      content: 'change 2'
    } as DataPortalParam, lead.id)

    try {
      await dataPortalService.update({
        id: portal.id,
        content: 'change 3'
      } as DataPortalParam, ordinary.id)
      expect.fail('Operation is expected to fail.')
    } catch (error: any) {
      expect(error.name).to.equal('PermissionError')
      expect(error.message).eq('Only portal admins and leads can update portal content')
    }
  })

  it('test get data portal', async () => {
    const portal = await createPortal('space-name', 'host-lead', 'guest-lead',
      'test-data-portal', 'description', DATA_PORTAL_STATUS.OPEN, 1, 'testUid', 'testUrl')
    create.spacesHelper.addMember(em, {
        user,
        space: portal.space.getEntity()
      },
      {role: SPACE_MEMBERSHIP_ROLE.VIEWER, side: SPACE_MEMBERSHIP_SIDE.HOST},
    )

    await em.flush()

    const result = await dataPortalService.get(portal.id, user.id)
    expect(result.name).eq('test-data-portal')
    expect(result.description).eq('description')
    expect(result.status).eq(DATA_PORTAL_STATUS.OPEN)
    expect(result.sortOrder).eq(1)
    expect(result.cardImageUid).eq('testUid')
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
    await dataPortalService.get(viewer.portalId, viewer.userId)
    await dataPortalService.get(contributor.portalId, contributor.userId)
    await dataPortalService.get(admin.portalId, admin.userId)
    await dataPortalService.get(lead.portalId, lead.userId)

    try {
      await dataPortalService.get(lead.portalId, user.id)
      expect.fail('Operation is expected to fail')
    } catch (error: any) {
      expect(error.name).to.equal('PermissionError')
      expect(error.message).eq('Only members of the corresponding space can access this portal')
    }
  })

  it('test list data portal', async () => {
    await createPortal('space-name_1', 'host-lead_1', 'guest-lead_1',
      'test-data-portal_1', 'description_1', DATA_PORTAL_STATUS.OPEN, 2, 'testUid_1', 'testUrl_1')
    await createPortal('space-name_2', 'host-lead_2', 'guest-lead_2',
      'test-data-portal_2', 'description_2', DATA_PORTAL_STATUS.CLOSED, 1, 'testUid_2', 'testUrl_2')

    const result = await dataPortalService.list(user.id)

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

  it('test list data portal - filter by user roles', async() => {
    const viewer = await createPortalAndAddMember('portal1', SPACE_MEMBERSHIP_ROLE.VIEWER)
    const contributor = await createPortalAndAddMember('portal2', SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR)
    const admin = await createPortalAndAddMember('portal3', SPACE_MEMBERSHIP_ROLE.ADMIN)
    const lead = await createPortalAndAddMember('portal4', SPACE_MEMBERSHIP_ROLE.LEAD)
    const nocoiner = await create.userHelper.create(em, {dxuser: 'has nothing'})

    let result = await dataPortalService.list(viewer.userId)
    expect(result.data_portals.length).eq(1)

    result = await dataPortalService.list(contributor.userId)
    expect(result.data_portals.length).eq(1)

    result = await dataPortalService.list(admin.userId)
    expect(result.data_portals.length).eq(1)

    result = await dataPortalService.list(lead.userId)
    expect(result.data_portals.length).eq(1)

    result = await dataPortalService.list(nocoiner.id)
    expect(result.data_portals.length).eq(0)
  })

  it('test list data portal - filter by default', async() => {
    const siteAdmin = await create.userHelper.createSiteAdmin(em)
    const space = await create.spacesHelper.create(em, { name: 'space-name', hostProject: 'hostProject' })
    await em.flush()
    await create.spacesHelper.addMember(em, { space, user }, {role: SPACE_MEMBERSHIP_ROLE.VIEWER })
    await create.dataPortalsHelper.create(em, { space }, { name: 'test-data-portal-default', default: true })
    await create.dataPortalsHelper.create(em, { space }, { name: 'test-data-portal-non-default', default: false })
    await em.flush()

    let result = await dataPortalService.list(user.id)
    expect(result.data_portals.length).eq(2)

    result = await dataPortalService.list(siteAdmin.id, true)
    expect(result.data_portals.length).eq(1)

    result = await dataPortalService.list(user.id, true)
    expect(result.data_portals.length).eq(1)
  })

  it('test update data portal and make sure only one is default', async () => {
    const siteAdmin = await create.userHelper.createSiteAdmin(em)
    const space = await create.spacesHelper.create(em, { name: 'space-name', hostProject: 'hostProject' })
    await em.flush()
    await create.dataPortalsHelper.create(em, { space }, { name: 'test-data-portal-default', default: true })
    const dataPortal2 = await create.dataPortalsHelper.create(em, { space }, { name: 'test-data-portal-non-default', default: false })
    await em.flush()

    await dataPortalService.update({ id: dataPortal2.id, default: true } as DataPortalParam, siteAdmin.id)

    const result = await dataPortalService.list(siteAdmin.id, true)
    expect(result.data_portals.length).eq(1)
  })

  it('test create data portal card image', async () => {
    const challengeUser = await create.userHelper.createChallengeBot(em)
    const space = await create.spacesHelper.create(em, { name: 'space-name', hostProject: 'hostProject' })
    const dataPortal = await create.dataPortalsHelper.create(em, { space }, { name: 'test-data-portal' })
    await em.flush()
    const result = await dataPortalService.createCardImage({name: 'test-card.jpg', description: 'description'}, dataPortal.id, challengeUser.id)
    const file = await em.findOneOrFail(entities.UserFile, {name: 'test-card.jpg'})

    expect(result).eq('file-dxid-1')
    expect(file.project).eq('hostProject')
    expect(file.description).eq('description')
    expect(file.userId).eq(2) // challenge bot
    expect(file.parentId).eq(2) // challenge bot
    expect(file.state).eq(FILE_STATE_DX.OPEN)
    expect(file.scope).eq('space-1')
    expect(file.uid).eq('file-dxid-1')
  })

  const createAndLoadPortal = async (): Promise<DataPortal> => {
    const space = create.spacesHelper.create(em, {name: 'space-name'})
    await em.flush()
    create.spacesHelper.addMember(em, {user, space}, {role: SPACE_MEMBERSHIP_ROLE.LEAD})
    const dataPortal = create.dataPortalsHelper.create(em, {space}, {name: 'portal-name'})
    await em.flush()

    await dataPortalService.createResource({
      name: 'test-resource.jpg',
      description: 'description'
    }, dataPortal.id, user.id)
    em.clear()
    return await em.findOneOrFail(entities.DataPortal, {id: dataPortal.id}, {populate: ['space', 'resources.userFile']})
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
    const space = create.spacesHelper.create(em, {name: 'space-name'})
    await em.flush()
    const dataPortal = create.dataPortalsHelper.create(em, {space}, {name: 'portal-name'})
    await em.flush()

    try {
      await dataPortalService.createResource({name: 'test'} as FileParam, dataPortal.id, user.id)
      expect.fail('Operation is expected to fail')
    } catch (error: any) {
      expect(error.name).to.equal('PermissionError')
      expect(error.message).eq('Only roles ADMIN,LEAD,CONTRIBUTOR can create resources')
    }
  })

  it('test remove data portal resource', async () => {
    let fileRemoveOperationParam: IdInput
    const fileRemoveOperation = {
      async run(input): Promise<number> {
        const fileToDelete = await em.findOne(entities.UserFile, {id: input.id})
        if (fileToDelete) {
          const fileDeleteEvent = new Event()
          fileDeleteEvent.type = EVENT_TYPES.FILE_DELETED
          fileDeleteEvent.dxuser = user.dxuser
          fileDeleteEvent.param1 = fileToDelete.name
          fileDeleteEvent.param2 = fileToDelete.dxid

          await em.persistAndFlush(fileDeleteEvent)
          await em.removeAndFlush(fileToDelete)
        }

        fileRemoveOperationParam = input
        return input.id
      }
    } as FileRemoveOperation
    dataPortalService = new DataPortalService(em, userClient, fileRemoveOperation)

    const loadedDataPortal = await createAndLoadPortal()
    await dataPortalService.removeResource(loadedDataPortal.resources.getItems()[0].id, user.id)
    await em.clear()

    // load portal and verify that resource was removed
    const loadedDataPortalAfterRemoval = await em.findOneOrFail(entities.DataPortal, {id: loadedDataPortal.id}, {populate: ['space', 'resources.userFile']})
    expect(loadedDataPortalAfterRemoval.resources.getItems().length).eq(0)

    // verify that resource was removed from database
    const userFile = await em.findOne(entities.UserFile, {name: 'test-resource.jpg'})
    expect(userFile).eq(null)
    const resource = await em.find(entities.Resource, {})
    expect(resource.length).eq(0)

    // verify that event was created
    const events = await em.find(entities.Event, {})
    expect(events.length).eq(2)

    expect(events[0].type).eq(EVENT_TYPES.FILE_CREATED)
    expect(events[0].dxuser).eq(user.dxuser)
    expect(events[0].param1).eq('test-resource.jpg')
    expect(events[0].param2).eq('file-dxid')

    expect(events[1].type).eq(EVENT_TYPES.FILE_DELETED)
    expect(events[1].dxuser).eq(user.dxuser)
    expect(events[1].param1).eq('test-resource.jpg')
    expect(events[1].param2).eq('file-dxid')
  })

  it('test remove data portal resource - fail with lack of privileges', async () => {
    const loadedDataPortal = await createAndLoadPortal()
    const unprivilegedUser = await create.userHelper.create(em)
    await em.flush()

    try {
      await dataPortalService.removeResource(loadedDataPortal.resources.getItems()[0].id, unprivilegedUser.id)
      expect.fail('Operation is expected to fail')
    } catch (error: any) {
      expect(error.name).to.equal('PermissionError')
      expect(error.message).eq('Only roles ADMIN,LEAD,CONTRIBUTOR can remove resources')
    }
  })

  it('test list resources', async () => {
    const space = create.spacesHelper.create(em, {name: 'space-name'})
    await em.flush()
    create.spacesHelper.addMember(em, {user, space}, {role: SPACE_MEMBERSHIP_ROLE.LEAD})
    const dataPortal = create.dataPortalsHelper.create(em, {space}, {name: 'portal-name'})
    await em.flush()
    create.dataPortalsHelper.addResource(em, {user, dataPortal}, 'name1', 'dxid1')
    create.dataPortalsHelper.addResource(em, {user, dataPortal}, 'name2', 'dxid2')
    await em.flush()

    const result = await dataPortalService.listResources(dataPortal.id, user.id)
    expect(result.resources.length).eq(2)
  })

  it('test list resources - unprivileged receives no resources', async () => {
    const loadedDataPortal = await createAndLoadPortal()
    const unprivilegedUser = await create.userHelper.create(em)
    await em.flush()

    const result = await dataPortalService.listResources(loadedDataPortal.id, unprivilegedUser.id)
    expect(result.resources.length).eq(0)
  })

  it('test create resource link', async () => {
    await create.userHelper.createChallengeBot(em)
    const space = create.spacesHelper.create(em, {name: 'space-name'})
    await em.flush()
    const dataPortal = create.dataPortalsHelper.create(em, {space}, {name: 'portal-name'})
    await em.flush()
    const resource = create.dataPortalsHelper.addResource(em, {user, dataPortal}, 'name1', 'dxid1')
    await em.flush()
    em.clear()

    const result = await dataPortalService.createResourceLink(resource.id)
    expect(result).eq('testingURL')
    const loadedResource = await em.findOneOrFail(entities.Resource, {id: resource.id})
    expect(loadedResource.url).eq('testingURL')
  })
})
