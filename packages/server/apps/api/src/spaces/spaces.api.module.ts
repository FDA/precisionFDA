import { Module } from '@nestjs/common'
import { SpacesController } from './spaces.controller'
import { EmailModule } from '@shared/domain/email/email.module'

@Module({
  imports: [EmailModule],
  controllers: [SpacesController],
})
export class SpacesApiModule {}
