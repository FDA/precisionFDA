import { SqlEntityManager } from '@mikro-orm/mysql'
import { Body, Controller, HttpCode, Inject, Param, Post, Put, UseGuards } from '@nestjs/common'
import { DEPRECATED_SQL_ENTITY_MANAGER_TOKEN } from '@shared/database/provider/deprecated-sql-entity-manager.provider'
import { NotificationInput } from '@shared/domain/notification/notification.input'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { UserContext } from '@shared/domain/user-context/model/user-context'
import { UserContextGuard } from '../user-context/guard/user-context.guard'

@UseGuards(UserContextGuard)
@Controller('/notifications')
export class NotificationsController {
  constructor(
    private readonly user: UserContext,
    @Inject(DEPRECATED_SQL_ENTITY_MANAGER_TOKEN) private readonly em: SqlEntityManager,
  ) {}

  @HttpCode(204)
  @Post()
  async createNotification(@Body() notification: NotificationInput) {
    const notificationService = new NotificationService(this.em)
    notificationService.createNotification(notification)
  }

  @Put('/:notificationId')
  async updateNotification(
    @Param('notificationId') notificationId: number,
    @Body() input: NotificationInput,
  ) {
    input.id = notificationId

    const notificationService = new NotificationService(this.em)
    const updated = await notificationService.updateDeliveredAt(
      input.id,
      input.deliveredAt,
      this.user?.id,
    )

    updated.user = undefined

    return updated
  }
}
