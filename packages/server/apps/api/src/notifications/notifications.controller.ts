import { Body, Controller, Get, HttpCode, Param, Post, Put, UseGuards } from '@nestjs/common'
import { NotificationDTO } from '@shared/domain/notification/dto/notification.dto'
import { Notification } from '@shared/domain/notification/notification.entity'
import { NotificationInput } from '@shared/domain/notification/notification.input'
import { NotificationService } from '@shared/domain/notification/services/notification.service'
import { InternalRouteGuard } from '../internal/guard/internal.guard'
import { UserContextGuard } from '../user-context/guard/user-context.guard'

@UseGuards(UserContextGuard)
@Controller('/notifications')
export class NotificationsController {
  constructor(private readonly notificationService: NotificationService) {}

  @HttpCode(204)
  @UseGuards(InternalRouteGuard)
  @Post()
  async createNotification(@Body() notification: NotificationInput): Promise<void> {
    await this.notificationService.createNotification(notification)
  }

  @Put('/:notificationId')
  async updateNotification(@Param('notificationId') notificationId: number): Promise<NotificationDTO> {
    const updated = await this.notificationService.updateDeliveredAt(notificationId)
    return NotificationDTO.fromEntity(updated)
  }

  @Get('/unread')
  async getUnreadNotifications(): Promise<NotificationDTO[]> {
    const notifications = await this.notificationService.getUnreadNotifications()
    return notifications.map((notification: Notification) => NotificationDTO.fromEntity(notification))
  }
}
