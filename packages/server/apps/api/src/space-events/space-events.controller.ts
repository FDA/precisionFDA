import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { SpaceEventService } from '@shared/domain/space-event/space-event.service'
import { SpaceEventDTO } from '@shared/domain/space-event/dto/space-event.dto'

@UseGuards(UserContextGuard)
@Controller('/space-events')
export class SpaceEventsController {
  constructor(private readonly spaceEventService: SpaceEventService) {}

  @Post()
  async createAndSendSpaceEvent(@Body() input: SpaceEventDTO) {
    return await this.spaceEventService.createAndSendSpaceEvent(input)
  }
}
