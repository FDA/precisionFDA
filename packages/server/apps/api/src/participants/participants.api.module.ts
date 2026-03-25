import { Module } from '@nestjs/common'
import { ParticipantModule } from '@shared/domain/participant/participant.module'
import { ParticipantsController } from './participants.controller'

@Module({
  imports: [ParticipantModule],
  controllers: [ParticipantsController],
})
export class ParticipantsApiModule {}
