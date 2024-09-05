import { Module } from '@nestjs/common'
import { SpaceModule } from '@shared/domain/space/space.module'
import { SpacesController } from './spaces.controller'
import { EmailModule } from '@shared/domain/email/email.module'

@Module({
  imports: [SpaceModule, EmailModule],
  controllers: [SpacesController],
})
export class SpacesApiModule {
}
