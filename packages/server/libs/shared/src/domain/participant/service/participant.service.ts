import { Injectable } from '@nestjs/common'
import { ParticipantDTO } from '@shared/domain/participant/dto/participant.dto'
import { ParticipantKind } from '@shared/domain/participant/entity/participant.entity'
import { ParticipantRepository } from '@shared/domain/participant/repository/participant.repository'

@Injectable()
export class ParticipantService {
  constructor(private readonly participantRepository: ParticipantRepository) {}

  async getOrgParticipants(): Promise<ParticipantDTO[]> {
    const participants = await this.participantRepository.find(
      { kind: ParticipantKind.ORG },
      { orderBy: { position: 'ASC', id: 'ASC' } },
    )

    return participants.map((participant) => ParticipantDTO.fromEntity(participant))
  }
}
