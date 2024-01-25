import { SqlEntityManager } from '@mikro-orm/mysql'
import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Logger,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { DEPRECATED_SQL_ENTITY_MANAGER } from '@shared/database/provider/deprecated-sql-entity-manager.provider'
import { EMAIL_TYPES } from '@shared/domain/email/email.config'
import { EmailProcessOperation } from '@shared/domain/email/ops/email-process'
import { SPACE_EVENT_ACTIVITY_TYPE } from '@shared/domain/space-event/space-event.enum'
import { SpaceMembership } from '@shared/domain/space-membership/space-membership.entity'
import {
  SPACE_MEMBERSHIP_ROLE,
  SPACE_MEMBERSHIP_SIDE,
} from '@shared/domain/space-membership/space-membership.enum'
import { SpaceReportService } from '@shared/domain/space-report/service/space-report.service'
import { SpaceAcceptOperation } from '@shared/domain/space/ops/accept-space'
import { SpaceLockOperation } from '@shared/domain/space/ops/lock-space'
import { SelectableSpacesOperation } from '@shared/domain/space/ops/selectable-spaces'
import { SpaceUnlockOperation } from '@shared/domain/space/ops/unlock-space'
import { Space } from '@shared/domain/space/space.entity'
import { SPACE_TYPE } from '@shared/domain/space/space.enum'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { PermissionError } from '@shared/errors'
import { PlatformClient } from '@shared/platform-client'
import { UserOpsCtx } from '@shared/types'
import { SpaceReportCreateFacade } from '../facade/space-report/space-report-create.facade'
import { SpaceReportDeleteFacade } from '../facade/space-report/space-report-delete.facade'
import { UserContextGuard } from '../user-context/guard/user-context.guard'

// TODO most of the ops can be patch instead of post (currently used by ruby), might refactor
@UseGuards(UserContextGuard)
@Controller('/spaces')
export class SpacesController {
  constructor(
    @Inject(DEPRECATED_SQL_ENTITY_MANAGER) private readonly oldEm: SqlEntityManager,
    private readonly log: Logger,
    private readonly user: UserContext,
    private readonly spaceReportCreateFacade: SpaceReportCreateFacade,
    private readonly spaceReportService: SpaceReportService,
    private readonly spaceReportDeleteFacade: SpaceReportDeleteFacade,
  ) {}

  @HttpCode(204)
  @Patch('/:id/accept')
  async acceptSpace(@Param('id', ParseIntPipe) spaceId: number) {
    const opsCtx: UserOpsCtx = {
      log: this.log,
      user: this.user,
      em: this.oldEm,
    }

    await new SpaceAcceptOperation(opsCtx).execute({ spaceId })
  }

  @HttpCode(204)
  @Patch('/:id/lock')
  async lockSpace(@Param('id', ParseIntPipe) spaceId: number) {
    const opsCtx: UserOpsCtx = {
      log: this.log,
      user: this.user,
      em: this.oldEm,
    }

    await new SpaceLockOperation(opsCtx).execute({ spaceId })
    await new EmailProcessOperation(opsCtx).execute({
      input: {
        initUserId: this.user.id,
        spaceId,
        activityType: SPACE_EVENT_ACTIVITY_TYPE[SPACE_EVENT_ACTIVITY_TYPE.space_locked],
      },
      receiverUserIds: [],
      emailTypeId: EMAIL_TYPES.spaceChanged as any,
    })
  }

  @HttpCode(204)
  @Patch('/:id/unlock')
  async unlockSpace(@Param('id', ParseIntPipe) spaceId: number) {
    const opsCtx: UserOpsCtx = {
      log: this.log,
      user: this.user,
      em: this.oldEm,
    }

    await new SpaceUnlockOperation(opsCtx).execute({ spaceId })

    await new EmailProcessOperation(opsCtx).execute({
      input: {
        initUserId: this.user.id,
        spaceId,
        activityType: SPACE_EVENT_ACTIVITY_TYPE[SPACE_EVENT_ACTIVITY_TYPE.space_unlocked],
      },
      receiverUserIds: [],
      emailTypeId: EMAIL_TYPES.spaceChanged as any,
    })
  }

  @HttpCode(204)
  @Patch('/:id/fix_guest_permissions')
  async fixGuestPermissions(@Param('id', ParseIntPipe) id: number) {
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
    const platformClient = new PlatformClient(this.user.accessToken, this.log)
    if (membership.side === SPACE_MEMBERSHIP_SIDE.GUEST) {
      try {
        // try to get some data from host project - should fail.
        await platformClient.projectDescribe({
          projectDxid: spaceToFix.hostProject,
          body: {},
        })
      } catch (err) {
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
      this.log.verbose({ response }, 'Guest organization invited to host project.')
    }
  }

  @Get('/:id/selectable-spaces')
  async getSelectableSpaces(@Param('id', ParseIntPipe) id: number) {
    const opsCtx: UserOpsCtx = {
      log: this.log,
      user: this.user,
      em: this.oldEm,
    }

    return await new SelectableSpacesOperation(opsCtx).execute(id)
  }

  // TODO(PFDA-4831) - cover reports with integration tests after setting up full test env
  @Post('/:id/report')
  async createReport(@Param('id', ParseIntPipe) id: number) {
    const report = await this.spaceReportCreateFacade.createSpaceReport(id)

    return report?.id
  }

  @Get('/:id/report')
  async getReports(@Param('id', ParseIntPipe) id: number) {
    return await this.spaceReportService.getReportsForSpace(id)
  }

  @Delete('/report')
  async deleteReports(@Query('id', new ParseArrayPipe({ items: Number })) ids: number[]) {
    return await this.spaceReportDeleteFacade.deleteSpaceReports(ids)
  }
}
