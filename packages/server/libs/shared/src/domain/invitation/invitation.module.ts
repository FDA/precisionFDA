import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { Invitation } from './invitation.entity'
import { InvitationService } from './services/invitation.service'

@Module({
  imports: [MikroOrmModule.forFeature([Invitation])],
  providers: [InvitationService],
  exports: [InvitationService],
})
export class InvitationModule {}
