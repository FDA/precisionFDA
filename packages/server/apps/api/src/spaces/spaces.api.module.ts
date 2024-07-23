import { Module } from '@nestjs/common'
import { SpaceModule } from '@shared/domain/space/space.module'
import { SpacesController } from './spaces.controller'

@Module({
  imports: [SpaceModule],
  controllers: [SpacesController],
})
export class SpacesApiModule {}
