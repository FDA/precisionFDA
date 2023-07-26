import {
  CreateResourceResponse,
  DataPortalMemberParam,
  DataPortalParam,
  FileParam
} from './data-portal.types'
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
import { SPACE_MEMBERSHIP_ROLE } from '../../space-membership/space-membership.enum'
import { CAN_EDIT_ROLES } from '../../space-membership/space-membership.helper'
import { DATA_PORTAL_MEMBER_ROLE } from '../data-portal.enum'

const logger = getLogger('data-portals.service')

export interface IDataPortalService {
  create: (input: DataPortalParam, userId: number) => Promise<DataPortalParam>
  update: (input: DataPortalParam, userId: number) => Promise<DataPortalParam>
  list: (userId: number, defaultParam?: boolean) => Promise<any>
  get: (dataPortalId: number, userId: number) => Promise<DataPortalParam>
  getDefault: (userId: number) => Promise<DataPortalParam>
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

  checkUserHasDataPortal = async (userId: number) => {
    try {
      // check whether there is a membership in at least one portal
      let  count = await this.em.count(entities.DataPortal,
        { space: { spaceMemberships: { user: userId } } }
      )
      return count > 0;

    } catch (error) {
      return false
    }
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

  private hasSiteAdminRole = async(userId: number): Promise<boolean> => {
    logger.info(`DataPortalService: verifying site admin role for id ${userId}`)
    const user = await this.em.findOneOrFail(entities.User, {id: userId}, {populate: ['adminMemberships', 'adminMemberships.adminGroup']})
    return user.isSiteAdmin()
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

    await this.processDefault(input.default)

    const dataPortal = new DataPortal(space)
    dataPortal.name = input.name
    dataPortal.description = input.description
    dataPortal.sortOrder = input.sortOrder
    dataPortal.status = input.status
    dataPortal.content = input.content
    dataPortal.default = input.default

    await this.em.persistAndFlush(dataPortal)
    return this.map(dataPortal)
  }

  private async processDefault(defaultParam: boolean) {
    if (defaultParam) {
      // make sure we un-default all others
      const portals = await this.em.find(entities.DataPortal, {default: true})
      for (const p of portals) {
        p.default = false
      }
    }
  }

  update = async (input: DataPortalParam, userId: number): Promise<DataPortalParam> => {
    logger.info('DataPortalService: updating data portal', input, userId)
    const portal = await this.em.findOneOrFail(entities.DataPortal, {id: input.id}, {populate: ['space.spaceMemberships.user']})

    if (!await this.hasSiteAdminRole(userId)) {
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

    await this.processDefault(input.default)

    const propertiesToUpdate = ['name', 'description', 'status', 'sortOrder', 'content', 'editorState', 'default'];

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

  list = async(userId: number, defaultParam?: boolean): Promise<any> => {
    logger.info('DataPortalService: getting data portals for user', userId)
    let portals

    if (await this.hasSiteAdminRole(userId)) {
      portals = await this.em.find(entities.DataPortal, {...(defaultParam && {default: defaultParam})}, {
        populate: ['space.spaceMemberships.user'],
        orderBy: {sortOrder: QueryOrder.ASC}
      })
    } else {
      portals = await this.em.find(entities.DataPortal,
        {
          $and: [
            {
              space: {
                spaceMemberships: {user: userId}
              }
            },
            {...(defaultParam && {default: defaultParam})}
          ]
        },
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

  getDefault = async(userId: number): Promise<DataPortalParam> => {
    const userFromDb = await this.em.findOneOrFail(entities.User, { id: userId })
    const isSiteAdmin = await userFromDb.isSiteAdmin();

    logger.info('DataPortalService: get default data portal detail')
    const portal = await this.em.findOne(entities.DataPortal, { default: true }, {populate: ['space.spaceMemberships.user']})
    if (portal) {
      if (isSiteAdmin) {
        return this.map(portal, true)
      }
      const canView = await this.checkUserHasDataPortal(userId)
      if(canView) {
        return this.map(portal, true)
      }
      throw new errors.PermissionError('Only users with Data Portal access can view this portal')
    }

    throw new errors.NotFoundError(`Default DataPortal was not found`)
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
        throw new errors.InternalError(`Unknown role ${role}`)
    }
  }

  private map = (portal: DataPortal, deepMapping?: boolean): DataPortalParam => {
    const param = new DataPortalParam()
    param.id = portal.id
    param.name = portal.name
    param.description = portal.description
    param.sortOrder = portal.sortOrder
    param.cardImageUid = portal.cardImageId
    param.cardImageUrl = portal.cardImageUrl
    param.status = portal.status
    param.spaceId = portal.space.id
    param.default = portal.default

    if (deepMapping) {
      param.content = portal.content
      param.editorState = portal.editorState

      param.members = []
      portal.space.getEntity().spaceMemberships.getItems().forEach(sm => {
        const member = new DataPortalMemberParam()
        member.dxuser = sm.user.getEntity().dxuser
        member.role = this.getRole(sm.role)
        param.members.push(member)
      })
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
