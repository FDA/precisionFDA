import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { Resource } from '@shared/domain/resource/resource.entity'
import { Space } from '@shared/domain/space/space.entity'
import { FileRemoveOperation } from '@shared/domain/user-file/ops/file-remove'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { User } from '@shared/domain/user/user.entity'
import { InternalError, NotFoundError, PermissionError } from '@shared/errors'
import { parseIntFromProcess } from '@shared/config'
import { NOTIFICATION_ACTION, SEVERITY } from '@shared/enums'
import {
  CreateResourceResponse,
  CustomPortal,
  DataPortalMemberParam,
  DataPortalParam,
  FileParam,
} from './data-portal.types'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { DataPortal } from '../data-portal.entity'
import { PlatformClient } from '@shared/platform-client'
import { UserFileRepository } from '../../user-file/user-file.repository'
import { QueryOrder, Reference, wrap } from '@mikro-orm/core'
import { FILE_STATE_DX } from '../../user-file/user-file.types'
import { getLogger } from '@shared/logger'
import { SPACE_MEMBERSHIP_ROLE } from '../../space-membership/space-membership.enum'
import { CAN_EDIT_ROLES } from '../../space-membership/space-membership.helper'
import { DATA_PORTAL_MEMBER_ROLE } from '../data-portal.enum'
import { SCOPE } from '@shared/types/common'
import { Injectable } from '@nestjs/common'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { DataPortalRepository } from '@shared/domain/data-portal/data-portal.repository'

const logger = getLogger('data-portal.service')

@Injectable()
export class DataPortalService {
  private editRolesText = ['ADMIN', 'LEAD', 'CONTRIBUTOR']
  private viewRoles = [
    SPACE_MEMBERSHIP_ROLE.ADMIN,
    SPACE_MEMBERSHIP_ROLE.LEAD,
    SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR,
    SPACE_MEMBERSHIP_ROLE.VIEWER,
  ]

  constructor(
    private readonly em: SqlEntityManager,
    private readonly user: UserContext,
    private readonly dataPortalRepo: DataPortalRepository,
    private readonly platformClient: PlatformClient,
    private readonly notificationService: NotificationService,
    private readonly fileRemoveOperation?: FileRemoveOperation,
  ) {}

  checkUserHasDataPortal = async () => {
    try {
      // check whether there is a membership in at least one portal
      const count = await this.em.count(DataPortal, {
        space: { spaceMemberships: { user: this.user.id } },
      })
      return count > 0
    } catch (error) {
      return false
    }
  }

  listResources = async (dataPortalId: number): Promise<any> => {
    logger.verbose(`DataPortalService: listing resources for portal id: ${dataPortalId}`)
    const dataPortal = await this.em.findOneOrFail(
      DataPortal,
      { id: dataPortalId },
      { populate: ['resources', 'space.spaceMemberships'] },
    )
    if (await this.hasRoles(dataPortal, this.viewRoles, this.user.id)) {
      return { resources: dataPortal.resources.getItems() }
    } else {
      return { resources: [] } // Ruby needs the root key
    }
  }

  /**
   * Returns PRISM, Tools and Getting started portal if the user has access to them.
   */
  async listAccessibleCustomPortals(): Promise<CustomPortal[]> {
    const PRISM_PORTAL_ID = parseIntFromProcess(process.env.PRISM_PORTAL_ID) ?? undefined
    const PRISM_SPACE_ID = parseIntFromProcess(process.env.PRISM_SPACE_ID) ?? undefined
    const TOOLS_PORTAL_ID = parseIntFromProcess(process.env.TOOLS_PORTAL_ID) ?? undefined
    const TOOLS_SPACE_ID = parseIntFromProcess(process.env.TOOLS_SPACE_ID) ?? undefined
    const GETTING_STARTED_PORTAL_ID = parseIntFromProcess(process.env.GETTING_STARTED_PORTAL_ID) ?? undefined
    const GETTING_STARTED_SPACE_ID = parseIntFromProcess(process.env.GETTING_STARTED_SPACE_ID) ?? undefined

    if (!(PRISM_PORTAL_ID && PRISM_SPACE_ID && TOOLS_PORTAL_ID && TOOLS_SPACE_ID && GETTING_STARTED_PORTAL_ID && GETTING_STARTED_SPACE_ID)) {
      logger.verbose('DataPortalService: listAccessibleCustomPortals: missing env vars')
      return []
    }

    const prismPortal: CustomPortal = {
      name: 'PRISM',
      id: PRISM_PORTAL_ID,
      spaceId: PRISM_SPACE_ID,
    }
    const toolsPortal: CustomPortal = {
      name: 'Tools',
      id: TOOLS_PORTAL_ID,
      spaceId: TOOLS_SPACE_ID,
    }
    const gettingStartedPortal: CustomPortal = {
      name: 'Getting Started and Next Steps',
      id: GETTING_STARTED_PORTAL_ID,
      spaceId: GETTING_STARTED_SPACE_ID,
    }

    const accessiblePortals: CustomPortal[] = []
    if (await this.hasAccessToSpace(prismPortal.spaceId)) {
      accessiblePortals.push(prismPortal)
    }
    if (await this.hasAccessToSpace(toolsPortal.spaceId)) {
      accessiblePortals.push(toolsPortal)
    }
    if (await this.hasAccessToSpace(gettingStartedPortal.spaceId)) {
      accessiblePortals.push(gettingStartedPortal)
    }
    return accessiblePortals
  }

  /**
   * Returns true if user has any member role in a given space.
   */
  private async hasAccessToSpace(spaceId: number): Promise<boolean> {
    const space = await this.em.findOne(Space, {
      id: spaceId,
      spaceMemberships: {
        user: this.user.id,
        active: true,
      },
    })
    return Boolean(space)
  }

  createResourceLink = async (id: number): Promise<string> => {
    logger.verbose(`DataPortalService: creating resource link for resource id: ${id}`)
    const resource = await this.em.findOneOrFail(Resource, { id: id }, { populate: ['userFile'] })
    resource.url = await this.getUserFileUrl(resource.userFile.getEntity().uid)
    await this.em.flush()
    return resource.url
  }

  createResource = async (
    input: FileParam,
    dataPortalId: number,
  ): Promise<CreateResourceResponse> => {
    logger.verbose(`DataPortalService: creating resource for portal id: ${dataPortalId}`, input)
    const user = await this.em.findOneOrFail(
      User,
      { id: this.user.id },
      { populate: ['organization'] },
    )
    const dataPortal = await this.em.findOneOrFail(
      DataPortal,
      { id: dataPortalId },
      { populate: ['space.spaceMemberships.user', 'space'] },
    )
    if (!(await this.hasRoles(dataPortal, CAN_EDIT_ROLES, this.user.id))) {
      throw new PermissionError(`Only roles ${this.editRolesText} can create resources`)
    }
    const userFile = await this.createFile(
      input,
      user,
      dataPortal.space.getEntity().hostProject,
      `space-${dataPortal.space.id}`,
    )

    const resource = new Resource(user, userFile)
    dataPortal.resources.add(resource)
    await this.em.persistAndFlush(dataPortal)
    return { id: resource.id, fileUid: userFile.uid }
  }

  removeResource = async (id: number) => {
    logger.verbose(`DataPortalService: removing resource: ${id}`)
    const resource = await this.em.findOneOrFail(Resource, { id: id })
    const dataPortal = await this.em.findOneOrFail(
      DataPortal,
      { id: resource.dataPortal.id },
      { populate: ['space.spaceMemberships.user', 'space'] },
    )
    if (!(await this.hasRoles(dataPortal, CAN_EDIT_ROLES, this.user.id))) {
      throw new PermissionError(`Only roles ${this.editRolesText} can remove resources`)
    }

    // TODO fix transaction work
    await this.em.removeAndFlush(resource)
    await this.fileRemoveOperation?.run({ id: resource.userFile.id })
  }

  private getUserFileUrl = async (uid: string): Promise<string> => {
    logger.verbose(`DataPortalService: getting url for id: ${uid}`)
    const fileRepo = this.em.getRepository(UserFile) as UserFileRepository
    const userFile = await fileRepo.findFileWithUid(uid)

    if (!userFile) {
      throw new NotFoundError(`Cannot find card image id ${uid}`)
    }
    const link = await this.platformClient.fileDownloadLink({
      fileDxid: userFile.dxid,
      filename: userFile.name,
      project: userFile.project,
      duration: 9999999999,
    })

    return link.url
  }

  private createFile = async (
    input: FileParam,
    user: User,
    projectId: string,
    scope: SCOPE,
  ): Promise<UserFile> => {
    const response = await this.platformClient.fileCreate({
      name: input.name,
      description: input.description,
      project: projectId,
    })

    const userFile = new UserFile(user)
    userFile.dxid = response.id
    userFile.project = projectId
    userFile.name = input.name
    userFile.state = FILE_STATE_DX.OPEN
    userFile.description = input.description
    userFile.parentId = user.id
    userFile.scope = scope
    userFile.uid = `${response.id}-1`

    this.em.persist(userFile)
    // file event is created upon close
    await this.em.flush()

    return userFile
  }

  createCardImage = async (input: FileParam, dataPortalId: number): Promise<UserFile> => {
    logger.verbose('DataPortalService: creating card image', input)
    const dataPortal = await this.em.findOneOrFail(
      DataPortal,
      { id: dataPortalId },
      { populate: ['space'] },
    )
    const user = await this.em.findOneOrFail(
      User,
      { id: this.user.id },
      { populate: ['organization'] },
    )
    return await this.createFile(
      input,
      user,
      dataPortal.space.getEntity().hostProject,
      `space-${dataPortal.space?.getEntity().id}`,
    )
  }

  private hasSiteAdminRole = async (userId: number): Promise<boolean> => {
    logger.verbose(`DataPortalService: verifying site admin role for id ${userId}`)
    const user = await this.em.findOneOrFail(
      User,
      { id: userId },
      { populate: ['adminMemberships', 'adminMemberships.adminGroup'] },
    )
    return user.isSiteAdmin()
  }

  // TODO: Refactor as method in DataPortal entity object
  private isPortalLead = async (dataPortal: DataPortal, userId: number): Promise<boolean> => {
    logger.verbose(`DataPortalService: verifying portal leads role id ${userId}`)
    for (const membership of dataPortal.space.getEntity().spaceMemberships.getItems()) {
      if (membership.isLead() && membership.user.id === userId) {
        return true
      }
    }
    return false
  }

  // TODO: Refactor as method in DataPortal entity object
  private isPortalAdmin = async (dataPortal: DataPortal, userId: number): Promise<boolean> => {
    logger.verbose(`DataPortalService: verifying portal admin role id ${userId}`)
    for (const membership of dataPortal.space.getEntity().spaceMemberships.getItems()) {
      if (membership.isAdmin() && membership.user.id === userId) {
        return true
      }
    }
    return false
  }

  // TODO: Refactor as method in DataPortal entity object
  private isPortalMember = async (dataPortal: DataPortal, userId: number): Promise<boolean> => {
    logger.verbose(`DataPortalService: verifying portal member role id ${userId}`)
    for (const membership of dataPortal.space.getEntity().spaceMemberships.getItems()) {
      if (membership.user.id === userId) {
        return true
      }
    }
    return false
  }

  private hasRoles = async (
    dataPortal: DataPortal,
    roles: SPACE_MEMBERSHIP_ROLE[],
    userId: number,
  ): Promise<boolean> => {
    await dataPortal.space.getEntity().spaceMemberships.init()
    for (const membership of dataPortal.space.getEntity().spaceMemberships.getItems()) {
      if (membership.user.id === userId && roles.includes(membership.role)) {
        return true
      }
    }
    return false
  }

  // TODO add creating spaces once we have them in Node.js
  create = async (input: DataPortalParam): Promise<DataPortalParam> => {
    logger.verbose('DataPortalService: creating data portal', input, this.user.id)
    if (!(await this.hasSiteAdminRole(this.user.id))) {
      throw new PermissionError('Only site admins can create Data Portals')
    }
    const space = await this.em.findOneOrFail(
      Space,
      { id: input.spaceId },
      { populate: ['spaceMemberships.user'] },
    )

    await this.processDefault(input.default)

    const dataPortal = new DataPortal(space)
    dataPortal.name = input.name
    dataPortal.description = input.description
    dataPortal.sortOrder = input.sortOrder
    dataPortal.status = input.status
    dataPortal.content = input.content
    dataPortal.default = input.default

    await this.em.persistAndFlush(dataPortal)

    logger.verbose('DataPortalService: creating card image', input)

    const loadedUser = await this.em.findOneOrFail(
      User,
      { id: this.user.id },
      { populate: ['organization'] },
    )
    // TODO propagate filename through input
    const userFile = await this.createFile(
      { name: input.cardImageFileName, description: '' },
      loadedUser,
      dataPortal.space.getEntity().hostProject,
      `space-${dataPortal.space?.getEntity().id}`,
    )
    dataPortal.cardImage = Reference.create(userFile)
    await this.em.persistAndFlush(dataPortal)
    return this.map(dataPortal)
  }

  private async processDefault(defaultParam: boolean) {
    if (defaultParam) {
      // make sure we un-default all others
      const portals = await this.em.find(DataPortal, { default: true })
      for (const p of portals) {
        p.default = false
      }
    }
  }

  update = async (input: DataPortalParam): Promise<DataPortalParam> => {
    logger.verbose('DataPortalService: updating data portal', input, this.user.id)
    const portal = await this.em.findOneOrFail(
      DataPortal,
      { id: input.id },
      { populate: ['space.spaceMemberships.user', 'cardImage'] },
    )

    if (!(await this.hasSiteAdminRole(this.user.id))) {
      if (input.content) {
        if (
          !(
            (await this.isPortalAdmin(portal, this.user.id)) ||
            (await this.isPortalLead(portal, this.user.id))
          )
        ) {
          throw new PermissionError('Only portal admins and leads can update portal content')
        }
      } else {
        if (!(await this.isPortalLead(portal, this.user.id))) {
          throw new PermissionError('Only portal leads can update portal settings')
        }
      }
    }

    await this.processDefault(input.default)

    const propertiesToUpdate = [
      'name',
      'description',
      'status',
      'sortOrder',
      'content',
      'editorState',
      'default',
    ]

    for (const property of propertiesToUpdate) {
      if (input.hasOwnProperty(property)) {
        portal[property] = input[property]
      }
    }

    if (input.cardImageUid) {
      const userFile = await this.em.findOneOrFail(UserFile, { uid: input.cardImageUid })
      portal.cardImage = wrap(userFile).toReference()
    }
    portal.updatedAt = new Date()

    await this.em.flush()
    return this.map(portal, true)
  }

  /**
   * Updates the card image url for a data portal
   * @param fileUid
   */
  async updateCardImageUrl(fileUid: string) {
    logger.verbose(`DataPortalService: updating card image url for fileUid ${fileUid}`)
    const dataPortals = await this.dataPortalRepo.findDataPortalsByCardImageUid(fileUid)

    if (dataPortals.length === 0) {
      throw new NotFoundError(`DataPortal for fileUid ${fileUid} was not found`)
    }
    const dataPortal = dataPortals[0]
    const cardImage = dataPortal.cardImage.getEntity()

    const link = await this.platformClient.fileDownloadLink({
      fileDxid: cardImage.dxid,
      filename: cardImage.name,
      project: cardImage.project,
      duration: 9999999999,
    })

    dataPortal.cardImageUrl = link.url

    await this.em.flush()
    logger.verbose(`DataPortalService: card image url for fileUid ${fileUid} updated`)
    try {
      logger.verbose(`DataPortalService: notification service ${this.notificationService}`)
      const userId = this.user.id
      await this.notificationService.createNotification({
        message: `Card image url for ${dataPortal.name} has been updated`,
        severity: SEVERITY.INFO,
        action: NOTIFICATION_ACTION.DATA_PORTAL_CARD_IMAGE_URL_UPDATED,
        userId,
      })
    } catch (error) {
      logger.error(`Error creating notification ${error}`)
    }
  }

  list = async (defaultParam?: boolean): Promise<any> => {
    logger.verbose('DataPortalService: getting data portals for user', this.user.id)
    let portals: DataPortal[]

    if (await this.hasSiteAdminRole(this.user.id)) {
      portals = await this.em.find(
        DataPortal,
        { ...(defaultParam && { default: defaultParam }) },
        {
          populate: ['space.spaceMemberships.user', 'cardImage'],
          orderBy: { sortOrder: QueryOrder.ASC },
        },
      )
    } else {
      portals = await this.em.find(
        DataPortal,
        {
          $and: [
            {
              space: {
                spaceMemberships: { user: this.user.id },
              },
            },
            { ...(defaultParam && { default: defaultParam }) },
          ],
        },
        {
          populate: ['space.spaceMemberships.user', 'cardImage'],
          orderBy: { sortOrder: QueryOrder.ASC },
        },
      )
    }

    const response = portals.map((portal: DataPortal) => this.map(portal))

    return { data_portals: response } // Ruby needs the root key
  }

  get = async (id: number): Promise<DataPortalParam> => {
    logger.verbose('DataPortalService: get data portal detail', id, this.user.id)

    const portal = await this.em.findOne(
      DataPortal,
      { id },
      { populate: ['space.spaceMemberships.user', 'cardImage'] },
    )
    if (portal) {
      if (!(await this.isPortalMember(portal, this.user.id))) {
        throw new PermissionError('Only members of the corresponding space can access this portal')
      }
      return this.map(portal, true)
    }

    throw new NotFoundError(`DataPortal with id ${id} was not found`)
  }

  // TODO this is called frequently for site-settings, consider caching
  getDefault = async (): Promise<DataPortalParam> => {
    const userFromDb = await this.em.findOneOrFail(User, { id: this.user.id })
    const isSiteAdmin = await userFromDb.isSiteAdmin()

    logger.verbose('DataPortalService: get default data portal detail')
    const portal = await this.em.findOne(
      DataPortal,
      { default: true },
      { populate: ['space.spaceMemberships.user', 'cardImage'] },
    )
    if (portal) {
      if (isSiteAdmin) {
        return this.map(portal, true)
      }
      const canView = await this.checkUserHasDataPortal()
      if (canView) {
        return this.map(portal, true)
      }
      throw new PermissionError('Only users with Data Portal access can view this portal')
    }

    throw new NotFoundError('Default DataPortal was not found')
  }

  private getRole(role: SPACE_MEMBERSHIP_ROLE): DATA_PORTAL_MEMBER_ROLE {
    switch (role) {
      case SPACE_MEMBERSHIP_ROLE.ADMIN:
        return DATA_PORTAL_MEMBER_ROLE.ADMIN
      case SPACE_MEMBERSHIP_ROLE.LEAD:
        return DATA_PORTAL_MEMBER_ROLE.LEAD
      case SPACE_MEMBERSHIP_ROLE.VIEWER:
        return DATA_PORTAL_MEMBER_ROLE.VIEWER
      case SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR:
        return DATA_PORTAL_MEMBER_ROLE.CONTRIBUTOR
      default:
        throw new InternalError(`Unknown role ${role}`)
    }
  }

  private map = (portal: DataPortal, deepMapping?: boolean): DataPortalParam => {
    const param = new DataPortalParam()
    param.id = portal.id
    param.name = portal.name
    param.description = portal.description
    param.sortOrder = portal.sortOrder
    param.cardImageUid = portal.cardImage?.getEntity().uid
    param.cardImageUrl = portal.cardImageUrl
    param.status = portal.status
    param.spaceId = portal.space?.getEntity().id
    param.default = portal.default
    param.lastUpdated = portal.updatedAt.toString()

    if (deepMapping) {
      param.content = portal.content
      param.editorState = portal.editorState

      param.members = []
      portal.space
        .getEntity()
        .spaceMemberships.getItems()
        .forEach((sm) => {
          const member = new DataPortalMemberParam()
          member.dxuser = sm.user.getEntity().dxuser
          member.role = this.getRole(sm.role)
          param.members.push(member)
        })
    }

    portal.space
      .getEntity()
      .spaceMemberships.getItems()
      .forEach((sm) => {
        if (sm.isGuest() && sm.isLead()) {
          param.guestLeadDxuser = sm.user.getEntity().dxuser
        }
        if (sm.isHost() && sm.isLead()) {
          param.hostLeadDxuser = sm.user.getEntity().dxuser
        }
      })

    return param
  }
}
