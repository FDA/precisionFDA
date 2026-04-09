import { Body, Controller, Get, HttpCode, Put, UseGuards } from '@nestjs/common'
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import {
  GroupedPreferences,
  NotificationPreferenceService,
  PreferenceKey,
} from '@shared/domain/notification-preference/notification-preference.service'
import { UserContextGuard } from '../user-context/guard/user-context.guard'

@ApiTags('Notification Preferences')
@ApiCookieAuth()
@UseGuards(UserContextGuard)
@Controller('/notification-preferences')
export class NotificationPreferencesController {
  constructor(private readonly notificationPreferenceService: NotificationPreferenceService) {}

  @ApiOperation({
    summary: 'Get notification preferences',
    description: "Returns the current user's notification preferences grouped by role/scope.",
  })
  @ApiResponse({ status: 200, description: 'Grouped notification preferences' })
  @ApiResponse({ status: 401, description: 'Unauthorized – missing or invalid session' })
  @Get()
  async index(): Promise<{ preference: GroupedPreferences }> {
    const preference = await this.notificationPreferenceService.getGroupedPreferences()
    return { preference }
  }

  @ApiOperation({
    summary: 'Update notification preferences',
    description: "Creates or updates the current user's notification preferences.",
  })
  @ApiResponse({ status: 204, description: 'Preferences updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized – missing or invalid session' })
  @Put()
  @HttpCode(204)
  async change(@Body() body: Partial<Record<PreferenceKey, boolean>>): Promise<void> {
    await this.notificationPreferenceService.updatePreferences(body)
  }
}
