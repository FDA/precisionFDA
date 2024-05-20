import { Body, Controller, HttpCode, Param, Post, Put, UseGuards } from '@nestjs/common'
import { NotificationInput } from '@shared/domain/notification/notification.input'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { UserContextGuard } from '../user-context/guard/user-context.guard'

@UseGuards(UserContextGuard)
@Controller('/notifications')
export class NotificationsController {
  constructor(private readonly notificationService: NotificationService) {}

  @HttpCode(204)
  @Post()
  async createNotification(@Body() notification: NotificationInput) {
    await this.notificationService.createNotification(notification)
  }

  @Put('/:notificationId')
  async updateNotification(
    @Param('notificationId') notificationId: number,
    @Body() input: NotificationInput,
  ) {
    input.id = notificationId

    const updated = await this.notificationService.updateDeliveredAt(input.id, input.deliveredAt)
    updated.user = undefined
    return updated
  }
}
