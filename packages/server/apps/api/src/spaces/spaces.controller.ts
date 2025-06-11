import { SqlEntityManager } from '@mikro-orm/mysql'
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Logger,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common'
import { DEPRECATED_SQL_ENTITY_MANAGER } from '@shared/database/provider/deprecated-sql-entity-manager.provider'
import { EMAIL_TYPES } from '@shared/domain/email/email.config'
import { EmailFacade } from '@shared/domain/email/email.facade'
import { SPACE_EVENT_ACTIVITY_TYPE } from '@shared/domain/space-event/space-event.enum'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import {
  SPACE_MEMBERSHIP_ROLE,
  SPACE_MEMBERSHIP_SIDE,
} from '@shared/domain/space-membership/space-membership.enum'
import { SpacesHiddenDto } from '@shared/domain/space/dto/spaces-hidden.dto'
import { SpaceAcceptOperation } from '@shared/domain/space/ops/accept-space'
import { SpaceService } from '@shared/domain/space/service/space.service'
import { Space } from '@shared/domain/space/space.entity'
import { SPACE_TYPE } from '@shared/domain/space/space.enum'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { PermissionError } from '@shared/errors'
import { PlatformClient } from '@shared/platform-client'
import { UserOpsCtx } from '@shared/types'
import { SiteAdminGuard } from '../admin/guards/site-admin.guard'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { CreateSpaceDTO } from '@shared/domain/space/dto/create-space.dto'
import { UpdateSpaceDTO } from '@shared/domain/space/dto/update-space.dto'
import { ServiceLogger } from '@shared/logger/decorator/service-logger'

@UseGuards(UserContextGuard)
@Controller('/spaces')
export class SpacesController {
  @ServiceLogger()
  protected readonly logger: Logger

  constructor(
    @Inject(DEPRECATED_SQL_ENTITY_MANAGER) private readonly oldEm: SqlEntityManager,
    private readonly spaceService: SpaceService,
    private readonly user: UserContext,
    private readonly emailFacade: EmailFacade,
  ) {}

  @Post()
  async create(@Body() space: CreateSpaceDTO): Promise<{ id: number }> {
    const spaceId = await this.spaceService.create(space)
    return { id: spaceId }
  }

  @Put('/:id')
  async update(
    @Param('id', ParseIntPipe) spaceId: number,
    @Body() space: UpdateSpaceDTO,
  ): Promise<Space> {
    return await this.spaceService.update(spaceId, space)
  }

  @HttpCode(204)
  @Patch('/:id/accept')
  async acceptSpace(@Param('id', ParseIntPipe) spaceId: number): Promise<void> {
    const opsCtx: UserOpsCtx = {
      log: this.logger,
      user: this.user,
      em: this.oldEm,
    }

    await new SpaceAcceptOperation(opsCtx).execute({ spaceId })
  }

  @HttpCode(204)
  @Patch('/:id/lock')
  async lockSpace(@Param('id', ParseIntPipe) spaceId: number): Promise<void> {
    await this.spaceService.lockSpace(spaceId)

    await this.emailFacade.sendEmail({
      input: {
        initUserId: this.user.id,
        spaceId,
        activityType: SPACE_EVENT_ACTIVITY_TYPE[SPACE_EVENT_ACTIVITY_TYPE.space_locked],
      },
      receiverUserIds: [],
      emailTypeId: EMAIL_TYPES.spaceChanged,
    })
  }

  @HttpCode(204)
  @Patch('/:id/unlock')
  async unlockSpace(@Param('id', ParseIntPipe) spaceId: number): Promise<void> {
    await this.spaceService.unlockSpace(spaceId)

    await this.emailFacade.sendEmail({
      input: {
        initUserId: this.user.id,
        spaceId,
        activityType: SPACE_EVENT_ACTIVITY_TYPE[SPACE_EVENT_ACTIVITY_TYPE.space_unlocked],
      },
      receiverUserIds: [],
      emailTypeId: EMAIL_TYPES.spaceChanged,
    })
  }

  @HttpCode(204)
  @Patch('/:id/fix_guest_permissions')
  async fixGuestPermissions(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const spaceToFix = await this.oldEm.findOne(Space, { id }, {})

    const membership = await this.oldEm.findOne(
      SpaceMembership,
      {
        spaces: id,
        user: this.user.id,
      },
      {},
    )

    if (
      spaceToFix == null ||
      membership == null ||
      spaceToFix.type !== SPACE_TYPE.GROUPS ||
      membership.role !== SPACE_MEMBERSHIP_ROLE.LEAD
    ) {
      throw new PermissionError('Operation not permitted.')
    }
    const platformClient = new PlatformClient({ accessToken: this.user.accessToken }, this.logger)
    if (membership.side === SPACE_MEMBERSHIP_SIDE.GUEST) {
      try {
        // try to get some data from host project - should fail.
        await platformClient.projectDescribe({
          projectDxid: spaceToFix.hostProject,
          body: {},
        })
      } catch {
        throw new PermissionError(
          'Please contact host lead of this space to perform the same action. You can copy the URL and send it to the lead.',
        )
      }
      // if no error, the permissions are correct.
      throw new PermissionError('Permissions are already corrected for guest side.')
    } else {
      // check project first.
      const res = await platformClient.projectDescribe({
        projectDxid: spaceToFix.hostProject,
        body: {
          fields: {
            permissions: true,
          },
        },
      })

      if (spaceToFix.guestDxOrg in res.permissions) {
        throw new PermissionError('Permissions are already corrected for guest side.')
      }

      const response = await platformClient.projectInvite({
        projectDxid: spaceToFix.hostProject,
        invitee: spaceToFix.guestDxOrg,
        level: 'CONTRIBUTE',
      })
      this.logger.log({ response }, 'Guest organization invited to host project.')
    }
  }

  @Get('/:id/selectable-spaces')
  async getSelectableSpaces(@Param('id', ParseIntPipe) id: number): Promise<Space[]> {
    return await this.spaceService.getSelectableSpaces(id)
  }

  @UseGuards(SiteAdminGuard)
  @HttpCode(204)
  @Patch('/hidden')
  async updateSpacesHidden(@Body() spacesHiddenDto: SpacesHiddenDto): Promise<void> {
    await this.spaceService.updateSpacesHiddenForAdmin(spacesHiddenDto.ids, spacesHiddenDto.hidden)
  }
}
