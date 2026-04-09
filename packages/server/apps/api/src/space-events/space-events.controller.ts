import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { SpaceEventDTO } from '@shared/domain/space-event/dto/space-event.dto'
import { SpaceEventService } from '@shared/domain/space-event/space-event.service'
import { UserContextGuard } from '../user-context/guard/user-context.guard'

@UseGuards(UserContextGuard)
@Controller('/space-events')
export class SpaceEventsController {
  constructor(private readonly spaceEventService: SpaceEventService) {}

  @Post()
  async createAndSendSpaceEvent(@Body() input: SpaceEventDTO): Promise<void> {
    return await this.spaceEventService.createAndSendSpaceEvent(input)
  }
}
