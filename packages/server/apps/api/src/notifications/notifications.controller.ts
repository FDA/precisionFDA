import { Body, Controller, HttpCode, Param, Post, Put, UseGuards } from '@nestjs/common'
import { NotificationInput } from '@shared/domain/notification/notification.input'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { InternalRouteGuard } from '../internal/guard/internal.guard'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { Notification } from '@shared/domain/notification/notification.entity'

@UseGuards(InternalRouteGuard, UserContextGuard)
@Controller('/notifications')
export class NotificationsController {
  constructor(private readonly notificationService: NotificationService) {}

  @HttpCode(204)
  @Post()
  async createNotification(@Body() notification: NotificationInput): Promise<void> {
    await this.notificationService.createNotification(notification)
  }

  @Put('/:notificationId')
  async updateNotification(
    @Param('notificationId') notificationId: number,
    @Body() input: NotificationInput,
  ): Promise<Notification> {
    input.id = notificationId

    const updated = await this.notificationService.updateDeliveredAt(input.id, input.deliveredAt)
    updated.user = undefined
    return updated
  }
}
