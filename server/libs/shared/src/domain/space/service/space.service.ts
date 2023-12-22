import { SpaceParam } from './space.types'
import { SqlEntityManager } from '@mikro-orm/mysql'
import { PlatformClient } from '../../../platform-client'
import { Space} from '../space.entity'
import { entities, getLogger } from '@shared'
import * as crypto from 'crypto'
import { constructDxOrg } from '../../org/org.utils'
import { SPACE_TYPE } from '../space.enum'
import { OrgService } from '../../org/service/org.service'

const logger = getLogger('space.service')

export interface ISpaceService {
  create: (input: SpaceParam, userId: number) => Promise<number>

}

export class SpaceService implements ISpaceService {
  private em: SqlEntityManager
  private adminPlatformClient: PlatformClient
  private userPlatformClient: PlatformClient
  private orgService: OrgService

  constructor(em: SqlEntityManager, adminPlatformClient: PlatformClient,
              userPlatformClient: PlatformClient, orgService: OrgService) {
    this.em = em
    this.adminPlatformClient = adminPlatformClient
    this.userPlatformClient = userPlatformClient
    this.orgService = orgService
  }

  private createSpaceInDB = async(input: SpaceParam): Promise<Space> => {
    logger.log('SpaceService: creating space in database')
    const uuid = crypto.randomBytes(5).toString('hex')

    const space = new Space()
    space.name = input.name
    space.description = input.description
    space.hostDxOrg = constructDxOrg(`space_host_${uuid}`)
    if (input.guestLeadDxUser && input.hostLeadDxUser) {
      constructDxOrg(`space_guest_${uuid}`)
    }
    space.type = input.type
    space.meta = input.cts
    space.restrictToTemplate = input.restrictToTemplate
    space.protected = input.protected
    if (input.type === SPACE_TYPE.REVIEW && input.sponsorLeadDxUser) {
      const sponsor = await this.em.findOneOrFail(
        entities.User,
        { dxuser: input.sponsorLeadDxUser }, { populate: ['organization']}
      )
      space.sponsorOrgId = sponsor.organization.id
    }

    await this.em.persistAndFlush(space)
    return space
  }

  private createOrgs = async (orgs: string[]) => {
    logger.log(`SpaceService: creating orgs ${orgs}`)
    for (const orgDxid in orgs) {
      await this.orgService.create(orgDxid, false)
    }
  }

  create = async(input: SpaceParam): Promise<number> => {
    logger.log(input, 'SpaceService: creating space')
    // create space in DB
    const space = await this.createSpaceInDB(input)

    await this.createOrgs([space.hostDxOrg, space.guestDxOrg])

    // TODO add leads
    // TODO add invite challenge bot when it's used for challenges
    // TODO create shared or private project

    if (input.type === SPACE_TYPE.REVIEW) {
      // TODO create reviewer confidential space
    } else if ([SPACE_TYPE.GROUPS, SPACE_TYPE.GOVERNMENT, SPACE_TYPE.ADMINISTRATOR].includes(input.type)) {
      // TODO remove pfda admin user
    } else if (input.type === SPACE_TYPE.PRIVATE_TYPE) {
      space.spaceId = space.id // Private Spaces have space_id set to its own id
    }

    if ([SPACE_TYPE.PRIVATE_TYPE, SPACE_TYPE.GOVERNMENT, SPACE_TYPE.ADMINISTRATOR].includes(input.type)) {
      // TODO accept space automatically
    }

    if (input.type === SPACE_TYPE.ADMINISTRATOR) {
      // TODO create site admin invitations
      // site_admins = User.site_admins - [space.host_lead]
      // create_site_admin_invitations_to_space(space, site_admins) if space.administrator?
    }

    if (input.type !== SPACE_TYPE.PRIVATE_TYPE) {
      // TODO send emails
    }

    return space.id
  }

}
