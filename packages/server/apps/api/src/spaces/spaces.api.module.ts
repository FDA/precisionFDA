import { Module } from '@nestjs/common'
import { EmailModule } from '@shared/domain/email/email.module'
import { SpaceModule } from '@shared/domain/space/space.module'
import { SpacesController } from './spaces.controller'

@Module({
  imports: [SpaceModule, EmailModule],
  controllers: [SpacesController],
})
export class SpacesApiModule {}
