import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { Resource } from '@shared/domain/resource/resource.entity'
import { Space } from '@shared/domain/space/space.entity'
import { FileRemoveOperation } from '@shared/domain/user-file/ops/file-remove'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { User } from '@shared/domain/user/user.entity'
import {
  DataPortalUrlSlugFormatError,
  DataPortalUrlSlugNotUniqueError,
  InternalError,
  NotFoundError,
  PermissionError,
} from '@shared/errors'
import { NOTIFICATION_ACTION, SEVERITY } from '@shared/enums'
import {
  CreateResourceResponse,
  DataPortalMemberParam,
  DataPortalParam,
} from './data-portal.types'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { DataPortal } from '../data-portal.entity'
import { PlatformClient } from '@shared/platform-client'
import { UserFileRepository } from '../../user-file/user-file.repository'
import { FindOneOptions, QueryOrder, Reference, wrap } from '@mikro-orm/core'
import { FILE_STATE_DX } from '../../user-file/user-file.types'
import { getLogger } from '@shared/logger'
import { SPACE_MEMBERSHIP_ROLE } from '../../space-membership/space-membership.enum'
import { CAN_EDIT_ROLES } from '../../space-membership/space-membership.helper'
import { DATA_PORTAL_MEMBER_ROLE } from '../data-portal.enum'
import { SCOPE } from '@shared/types/common'
import { Injectable, Logger } from '@nestjs/common'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { DataPortalRepository } from '@shared/domain/data-portal/data-portal.repository'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'
import { CreateFileParamDTO } from '@shared/domain/data-portal/dto/CreateFileParamDTO'
import { UpdateDataPortalDTO } from '@shared/domain/data-portal/dto/UpdateDataPortalDTO'
import { CreateDataPortalDTO } from '@shared/domain/data-portal/dto/CreateDataPortalDTO'

const logger = getLogger('data-portal.service')

@Injectable()
export class DataPortalService {
  @ServiceLogger()
  private readonly log: Logger

  private URL_SLUG_MIN_LENGTH = 3
  private URL_SLUG_MAX_LENGTH = 50
  // The URL slug has to contain only alphanumerical characters and dashes and at least one alphabetical character
  private URL_SLUG_REGEXP = /^(?=.*[a-z])[a-z0-9-]+$/

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

  listResources = async (dataPortalIdentifier: string): Promise<any> => {
    logger.verbose(`Listing resources for portal identifier: ${dataPortalIdentifier}`)

    const dataPortal = await this.findPortalBySlugOrId(dataPortalIdentifier, {
      populate: ['resources', 'space.spaceMemberships'],
    })

    if (await this.hasRoles(dataPortal, this.viewRoles, this.user.id)) {
      return { resources: dataPortal.resources.getItems() }
    } else {
      return { resources: [] } // Ruby needs the root key
    }
  }

  createResourceLink = async (id: number): Promise<string> => {
    logger.verbose(`Creating resource link for resource id: ${id}`)
    const resource = await this.em.findOneOrFail(Resource, { id: id }, { populate: ['userFile'] })
    resource.url = await this.getUserFileUrl(resource.userFile.getEntity().uid)
    await this.em.flush()
    return resource.url
  }

  createResource = async (
    input: CreateFileParamDTO,
    dataPortalIdentifier: string,
  ): Promise<CreateResourceResponse> => {
    logger.verbose(`Creating resource for portal identifier: ${dataPortalIdentifier}`, input)
    const user = await this.em.findOneOrFail(
      User,
      { id: this.user.id },
      { populate: ['organization'] },
    )
    const dataPortal = await this.findPortalBySlugOrId(dataPortalIdentifier, {
      populate: ['space.spaceMemberships.user', 'space'],
    })

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
    logger.verbose(`Removing resource: ${id}`)
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
    logger.verbose(`Getting url for id: ${uid}`)
    const fileRepo = this.em.getRepository(UserFile) as UserFileRepository
    const userFile = await fileRepo.findFileWithUid(uid)

    if (!userFile) {
      throw new NotFoundError(`Cannot find card image id ${uid}`)
    }
    const link = await this.platformClient.fileDownloadLink({
      fileDxid: userFile.dxid,
      filename: userFile.name,
      project: userFile.project,
      duration: 9_999_999_999,
    })

    return link.url
  }

  private createFile = async (
    input: CreateFileParamDTO,
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

  createCardImage = async (input: CreateFileParamDTO, dataPortalId: number): Promise<UserFile> => {
    logger.verbose('Creating card image', input)
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
    logger.verbose(`Verifying site admin role for id ${userId}`)
    const user = await this.em.findOneOrFail(
      User,
      { id: userId },
      { populate: ['adminMemberships', 'adminMemberships.adminGroup'] },
    )
    return user.isSiteAdmin()
  }

  // TODO: Refactor as method in DataPortal entity object
  private isPortalLead = async (dataPortal: DataPortal, userId: number): Promise<boolean> => {
    logger.verbose(`Verifying portal leads role id ${userId}`)
    for (const membership of dataPortal.space.getEntity().spaceMemberships.getItems()) {
      if (membership.isLead() && membership.user.id === userId) {
        return true
      }
    }
    return false
  }

  // TODO: Refactor as method in DataPortal entity object
  private isPortalAdmin = async (dataPortal: DataPortal, userId: number): Promise<boolean> => {
    logger.verbose(`Verifying portal admin role id ${userId}`)
    for (const membership of dataPortal.space.getEntity().spaceMemberships.getItems()) {
      if (membership.isAdmin() && membership.user.id === userId) {
        return true
      }
    }
    return false
  }

  // TODO: Refactor as method in DataPortal entity object
  private isPortalMember = async (dataPortal: DataPortal, userId: number): Promise<boolean> => {
    logger.verbose(`Verifying portal member role id ${userId}`)
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

  private validateUrlSlug = async (urlSlug: string) => {
    // Length and regexp check
    if (
      !urlSlug ||
      urlSlug.length < this.URL_SLUG_MIN_LENGTH ||
      urlSlug.length > this.URL_SLUG_MAX_LENGTH ||
      !urlSlug.match(this.URL_SLUG_REGEXP)
    ) {
      logger.warn(
        `Cannot create data portal with slug ${urlSlug} because it doesn't match the requirements: regexp ${this.URL_SLUG_REGEXP}, length ${this.URL_SLUG_MIN_LENGTH} - ${this.URL_SLUG_MAX_LENGTH}`,
      )
      throw new DataPortalUrlSlugFormatError(
        urlSlug,
        this.URL_SLUG_REGEXP.toString(),
        this.URL_SLUG_MIN_LENGTH,
        this.URL_SLUG_MAX_LENGTH,
      )
    }

    // Check url slug uniqueness
    if (await this.urlSlugExists(urlSlug)) {
      logger.warn(`Cannot create data portal with slug '${urlSlug}' because it already exists`)
      throw new DataPortalUrlSlugNotUniqueError(urlSlug)
    }
  }

  // TODO add creating spaces once we have them in Node.js
  create = async (input: CreateDataPortalDTO): Promise<DataPortalParam> => {
    logger.verbose('Creating data portal', input, this.user.id)
    if (!(await this.hasSiteAdminRole(this.user.id))) {
      throw new PermissionError('Only site admins can create Data Portals')
    }
    const space = await this.em.findOneOrFail(
      Space,
      { id: input.spaceId },
      { populate: ['spaceMemberships.user'] },
    )

    input.default = await this.processDefault(input.default)

    const dataPortal = new DataPortal(space)
    dataPortal.name = input.name
    dataPortal.description = input.description
    dataPortal.urlSlug = input.urlSlug
    dataPortal.sortOrder = input.sortOrder
    dataPortal.status = input.status
    dataPortal.content = input.content
    dataPortal.default = input.default

    await this.validateUrlSlug(dataPortal.urlSlug)
    await this.em.persistAndFlush(dataPortal)

    logger.verbose('Creating card image', input)

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

  /**
   * Check the default parameter of the currently processed data portal in order to make sure there will be one and only one default data portal
   * If the input param is True, un-default all the existing data portals; If there is no default data portal in the system,
   * the current one will become default
   * @param defaultParam Preferred default param settings
   * @return True if processed data portal should be set as default, False otherwise
   * @private
   */
  private async processDefault(defaultParam: boolean) {
    const portals = await this.em.find(DataPortal, { default: true })
    if (defaultParam) {
      // Make sure we un-default all others
      for (const p of portals) {
        p.default = false
      }
      return true
    } else {
      // Check whether there is at least one default data portal, otherwise the processed one should become default
      return portals.length <= 0
    }
  }

  private async urlSlugExists(urlSlug: string): Promise<boolean> {
    const portal = await this.em.findOne(DataPortal, { urlSlug })
    return portal !== null
  }

  private async findPortalBySlugOrId(
    identifier: string,
    options: FindOneOptions<DataPortal, any> = {
      populate: ['space.spaceMemberships.user', 'cardImage'],
    },
  ) {
    // Try to load data portal by url slug
    let portal = await this.em.findOne(DataPortal, { urlSlug: identifier }, options)

    if (!portal && /^\d+$/.test(identifier)) {
      // Data portal not found by url slug -> try to find it by id
      portal = await this.em.findOne(DataPortal, { id: parseInt(identifier) }, options)
    }

    return portal
  }

  update = async (input: UpdateDataPortalDTO): Promise<DataPortalParam> => {
    logger.verbose('Updating data portal', input, this.user.id)
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

    input.default = await this.processDefault(input.default)

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
    logger.verbose(`Updating card image url for fileUid ${fileUid}`)
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
    logger.verbose(`Card image url for fileUid ${fileUid} updated`)
    try {
      logger.verbose(`Notification service ${this.notificationService}`)
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
    logger.verbose('Getting data portals for user', this.user.id)
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
    logger.verbose('Get data portal detail', id, this.user.id)

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

  getByUrlSlugOrId = async (identifier: string): Promise<DataPortalParam> => {
    logger.verbose('Get data portal detail by url slug or id: ', identifier, this.user.id)

    // Try to load data portal by url slug
    const portal = await this.findPortalBySlugOrId(identifier)

    if (portal) {
      if (!(await this.isPortalMember(portal, this.user.id))) {
        throw new PermissionError('Only members of the corresponding space can access this portal')
      }
      return this.map(portal, true)
    }

    throw new NotFoundError(`DataPortal with identifier ${identifier} was not found`)
  }

  // TODO this is called frequently for site-settings, consider caching
  getDefault = async (): Promise<DataPortalParam> => {
    const userFromDb = await this.em.findOneOrFail(User, { id: this.user.id })
    const isSiteAdmin = await userFromDb.isSiteAdmin()

    logger.verbose('Get default data portal detail')
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
    param.urlSlug = portal.urlSlug
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
      try {
        JSON.parse(portal.editorState)
        param.editorState = portal.editorState
      } catch (error) {
        this.log.error(`Error parsing editorState for portal ${portal.id} ${error}`)
        param.editorState = null
      }

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
