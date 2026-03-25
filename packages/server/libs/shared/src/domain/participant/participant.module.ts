import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { Participant } from '@shared/domain/participant/entity/participant.entity'
import { ParticipantService } from '@shared/domain/participant/service/participant.service'

@Module({
  imports: [MikroOrmModule.forFeature([Participant])],
  providers: [ParticipantService],
  exports: [ParticipantService],
})
export class ParticipantModule {}
