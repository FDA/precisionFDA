import { CreateResourceResponse, DataPortalParam, FileParam } from './data-portal.types'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { DataPortal } from '../data-portal.entity'
import { PlatformClient } from '../../../platform-client'
import { UserFile } from '../../user-file'
import { UserFileRepository } from '../../user-file/user-file.repository'
import { QueryOrder } from '@mikro-orm/core'
import { FILE_STATE_DX } from '../../user-file/user-file.types'
import { Resource } from '../../resource'
import { entities, errors } from '@pfda/https-apps-shared'
import { getLogger } from '../../../logger'
import { User } from '../../user'
import { createFileEvent, EVENT_TYPES } from '../../event/event.helper'
import { ADMIN_GROUP_ROLES } from '../../admin-group'
import { SPACE_MEMBERSHIP_ROLE } from '../../space-membership/space-membership.enum'
import { CAN_EDIT_ROLES } from '../../space-membership/space-membership.helper'

const logger = getLogger('data-portals.service')

export interface IDataPortalService {
  create: (input: DataPortalParam, userId: number) => Promise<DataPortalParam>
  update: (input: DataPortalParam, userId: number) => Promise<DataPortalParam>
  list: (userId: number) => Promise<any>
  get: (dataPortalId: number, userId: number) => Promise<DataPortalParam>
  createCardImage: (input: FileParam, dataPortalId: number, userId: number) => Promise<string>
  createResource: (input: FileParam, dataPortalId: number, userId: number) => Promise<CreateResourceResponse>
  createResourceLink: (id: number) => Promise<string>
  listResources: (dataPortalId: number, userId: number) => Promise<Resource[]>
  removeResource: (id: number, userId: number) => Promise<void>
}

export class DataPortalService implements IDataPortalService {

  private em: SqlEntityManager
  private userPlatformClient: PlatformClient

  private editRolesText = ['ADMIN', 'LEAD', 'CONTRIBUTOR']
  private viewRoles = [SPACE_MEMBERSHIP_ROLE.ADMIN, SPACE_MEMBERSHIP_ROLE.LEAD, SPACE_MEMBERSHIP_ROLE.CONTRIBUTOR, SPACE_MEMBERSHIP_ROLE.VIEWER]

  constructor(em: SqlEntityManager, userPlatformClient: PlatformClient) {
    this.em = em
    this.userPlatformClient = userPlatformClient
  }

  listResources = async (dataPortalId: number, userId: number): Promise<any> => {
    logger.info(`DataPortalService: listing resources for portal id: ${dataPortalId}`)
    const dataPortal = await this.em.findOneOrFail(
      entities.DataPortal,
      {id: dataPortalId},
      {populate: ['resources', 'space.spaceMemberships']}
    )
    if (await this.hasRoles(dataPortal, this.viewRoles, userId)) {
      return {"resources": dataPortal.resources.getItems()}
    } else {
      return {"resources": []} // Ruby needs the root key
    }
  }

  createResourceLink = async (id: number): Promise<string> => {
    logger.info(`DataPortalService: creating resource link for resource id: ${id}`)
    const resource = await this.em.findOneOrFail(entities.Resource, {id: id}, { populate: ['userFile'] })
    resource.url = await this.getUserFileUrl(resource.userFile.getEntity().uid)
    await this.em.flush()
    return resource.url
  }

  createResource = async (input: FileParam, dataPortalId: number, userId: number): Promise<CreateResourceResponse>  => {
    logger.info(`DataPortalService: creating resource for portal id: ${dataPortalId}`, input)
    const user = await this.em.findOneOrFail(entities.User, {id: userId}, {populate: ['organization']})
    const dataPortal = await this.em.findOneOrFail(
      entities.DataPortal,
      { id: dataPortalId },
      { populate: ['space.spaceMemberships.user', 'space'] }
    )
    if (! await this.hasRoles(dataPortal, CAN_EDIT_ROLES, userId)) {
      throw new errors.PermissionError(`Only roles ${this.editRolesText} can create resources`)
    }
    const userFile = await this.createFile(input, user, dataPortal.space.getEntity().hostProject, `space-${dataPortal.space.id}`)

    const resource = new Resource(user, userFile)
    dataPortal.resources.add(resource)
    await this.em.persistAndFlush(dataPortal)
    return { id: resource.id, fileUid: userFile.uid }
  }
  removeResource = async (id: number, userId: number) => {
    logger.info(`DataPortalService: removing resource: ${id}`)
    const user = await this.em.findOneOrFail(entities.User, {id: userId}, {populate: ['organization']})
    const resource = await this.em.findOneOrFail(entities.Resource, {id: id})
    const dataPortal = await this.em.findOneOrFail(entities.DataPortal, {id: resource.dataPortal.id}, {populate: ['space.spaceMemberships.user', 'space']})
    if (! await this.hasRoles(dataPortal, CAN_EDIT_ROLES, userId)) {
      throw new errors.PermissionError(`Only roles ${this.editRolesText} can remove resources`)
    }

    const userFile = await this.em.findOneOrFail(entities.UserFile, {id: resource.userFile.id})
    await this.createFileEvent(userFile, user, EVENT_TYPES.FILE_DELETED)
    await this.em.remove(resource.userFile)
    await this.em.removeAndFlush(resource)
  }

  private getUserFileUrl = async(uid: string): Promise<string> => {
    logger.info(`DataPortalService: getting url for id: ${uid}`)
    const fileRepo = this.em.getRepository(UserFile) as UserFileRepository
    const userFile = await fileRepo.findFileWithUid(uid)

    if (!userFile) {
      throw new errors.NotFoundError(`Cannot find card image id ${uid}`)
    }
    const link = await this.userPlatformClient.fileDownloadLink({
      fileDxid: userFile.dxid,
      filename: userFile.name,
      project: userFile.project,
      duration: 9999999999,
    })

    return link.url
  }

  private createFile = async(input: FileParam, user: User, projectId: string, scope: string): Promise<UserFile> => {
    const response = await this.userPlatformClient.fileCreate({
      name: input.name,
      description: input.description,
      project: projectId
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

    await this.em.persist(userFile)
    await this.createFileEvent(userFile, user, EVENT_TYPES.FILE_CREATED)
    await this.em.flush()

    return userFile
  }

  private createFileEvent = async (userFile: UserFile, user: User, type: string) => {
    const fileEvent = await createFileEvent(
      type,
      userFile,
      userFile.name,
      user,
    )
    this.em.persist(fileEvent)
  }

  createCardImage = async(input: FileParam, dataPortalId: number, userId: number): Promise<string> => {
    logger.info('DataPortalService: creating card image', input)
    const dataPortal = await this.em.findOneOrFail(entities.DataPortal, {id: dataPortalId}, {populate: ['space']})
    const user = await this.em.findOneOrFail(entities.User, {id: userId}, {populate: ['organization']})
    const userFile = await this.createFile(input, user, dataPortal.space.getEntity().hostProject, `space-${dataPortal.space.id}`)
    return userFile.uid
  }

  // TODO: Use user.isSiteAdmin() instead
  private hasSiteAdminRole = async(userId: number): Promise<boolean> => {
    logger.info(`DataPortalService: verifying site admin role for id ${userId}`)
    const user = await this.em.findOneOrFail(entities.User, {id: userId}, {populate: ['adminMemberships', 'adminMemberships.adminGroup']})
    let verified = false
    user.adminMemberships.getItems().forEach((membership) => {
      if (membership.adminGroup.getEntity().role === ADMIN_GROUP_ROLES.ROLE_SITE_ADMIN) {
        verified = true
      }
    })
    return verified
  }

  // TODO: Refactor as method in DataPortal entity object
  private isPortalLead = async(dataPortal: DataPortal, userId: number): Promise<boolean> => {
    logger.info(`DataPortalService: verifying portal leads role id ${userId}`)
    for (const membership of dataPortal.space.getEntity().spaceMemberships.getItems()) {
      if (membership.isLead() && membership.user.id === userId) {
        return true
      }
    }
    return false
  }

  // TODO: Refactor as method in DataPortal entity object
  private isPortalAdmin = async(dataPortal: DataPortal, userId: number): Promise<boolean> => {
    logger.info(`DataPortalService: verifying portal admin role id ${userId}`)
    for (const membership of dataPortal.space.getEntity().spaceMemberships.getItems()) {
      if (membership.isAdmin() && membership.user.id === userId) {
        return true
      }
    }
    return false
  }

  // TODO: Refactor as method in DataPortal entity object
  private isPortalMember = async(dataPortal: DataPortal, userId: number): Promise<boolean> => {
    logger.info(`DataPortalService: verifying portal member role id ${userId}`)
    for (const membership of dataPortal.space.getEntity().spaceMemberships.getItems()) {
      if (membership.user.id === userId) {
        return true
      }
    }
    return false
  }

  private hasRoles = async(dataPortal: DataPortal, roles: SPACE_MEMBERSHIP_ROLE[], userId: number): Promise<boolean> => {
    await dataPortal.space.getEntity().spaceMemberships.init()
    for (const membership of dataPortal.space.getEntity().spaceMemberships.getItems()) {
      if (membership.user.id === userId && roles.includes(membership.role)) {
        return true
      }
    }
    return false
  }

  // TODO add creating spaces once we have them in Node.js
  create = async(input: DataPortalParam, userId: number): Promise<DataPortalParam> => {
    logger.info('DataPortalService: creating data portal', input, userId)
    if (!(await this.hasSiteAdminRole(userId))) {
      throw new errors.PermissionError('Only site admins can create Data Portals')
    }
    const space = await this.em.findOneOrFail(entities.Space, {id: input.spaceId}, {populate: ['spaceMemberships.user']})

    const dataPortal = new DataPortal(space)
    dataPortal.name = input.name
    dataPortal.description = input.description
    dataPortal.sortOrder = input.sortOrder
    dataPortal.status = input.status
    dataPortal.content = input.content

    await this.em.persistAndFlush(dataPortal)
    return this.map(dataPortal)
  }

  update = async (input: DataPortalParam, userId: number): Promise<DataPortalParam> => {
    logger.info('DataPortalService: updating data portal', input, userId)
    const portal = await this.em.findOneOrFail(entities.DataPortal, {id: input.id}, {populate: ['space.spaceMemberships.user']})

    const keys = Object.keys(input)
    if (!(keys.length === 1 && input.hasOwnProperty('cardImageUid') && await this.hasSiteAdminRole(userId))) {
      if (input.content) {
        if (!(await this.isPortalAdmin(portal, userId) || await this.isPortalLead(portal, userId))) {
          throw new errors.PermissionError('Only portal admins and leads can update portal content')
        }
      } else {
        if (!(await this.isPortalLead(portal, userId))) {
          throw new errors.PermissionError('Only portal leads can update portal settings')
        }
      }
    }

    const propertiesToUpdate = ['name', 'description', 'status', 'sortOrder', 'content', 'editorState'];

    for (const property of propertiesToUpdate) {
      if (input.hasOwnProperty(property)) {
        // @ts-ignore
        portal[property] = input[property];
      }
    }

    if (input.cardImageUid && portal.cardImageId !== input.cardImageUid) {
      // TODO we're updating, should we delete the old one?
      portal.cardImageId = input.cardImageUid
      portal.cardImageUrl = await this.getUserFileUrl(input.cardImageUid)
    }
    portal.updatedAt = new Date()

    await this.em.flush()
    return this.map(portal, true)
  }

  list = async(userId: number): Promise<any> => {
    logger.info('DataPortalService: getting data portals for user', userId)
    let portals

    if (await this.hasSiteAdminRole(userId)) {
      portals = await this.em.find(entities.DataPortal, {}, {
        populate: ['space.spaceMemberships.user'],
        orderBy: {sortOrder: QueryOrder.ASC}
      })
    } else {
      portals = await this.em.find(entities.DataPortal,
        {space: {
            spaceMemberships: { user: userId }
          }},
        {
          populate: ['space.spaceMemberships.user'],
          orderBy: {sortOrder: QueryOrder.ASC}
        })
    }

    const response = portals.map((portal: DataPortal) => this.map(portal))

    return {"data_portals": response} // Ruby needs the root key
  }

  get = async(id: number, userId: number): Promise<DataPortalParam> => {
    logger.info('DataPortalService: get data portal detail', id, userId)

    const portal = await this.em.findOne(entities.DataPortal, {id}, {populate: ['space.spaceMemberships.user']})
    if (portal) {
      if (!(await this.isPortalMember(portal, userId))) {
        throw new errors.PermissionError('Only members of the corresponding space can access this portal')
      }
      return this.map(portal, true)
    }

    throw new errors.NotFoundError(`DataPortal with id ${id} was not found`)
  }

  private map = (portal: DataPortal, includeContent?: boolean): DataPortalParam => {
    const param = new DataPortalParam()
    param.id = portal.id
    param.name = portal.name
    param.description = portal.description
    param.sortOrder = portal.sortOrder
    param.cardImageUid = portal.cardImageId
    param.cardImageUrl = portal.cardImageUrl
    param.status = portal.status
    param.spaceId = portal.space.id
    if (includeContent) {
      param.content = portal.content
      param.editorState = portal.editorState
    }

    portal.space.getEntity().spaceMemberships.getItems().forEach(sm => {
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
