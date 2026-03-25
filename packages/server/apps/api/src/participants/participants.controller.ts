import { Controller, Get } from '@nestjs/common'
import { ParticipantDTO } from '@shared/domain/participant/dto/participant.dto'
import { ParticipantService } from '@shared/domain/participant/service/participant.service'

@Controller('/participants')
export class ParticipantsController {
  constructor(private readonly participantService: ParticipantService) {}

  @Get()
  async list(): Promise<{ orgs: ParticipantDTO[] }> {
    const orgs = await this.participantService.getOrgParticipants()
    return { orgs }
  }
}
