import { Module } from '@nestjs/common'
import { SpaceModule } from '@shared/domain/space/space.module'
import { SpaceGroupsController } from './space-groups.controller'

@Module({
  imports: [SpaceModule],
  controllers: [SpaceGroupsController],
})
export class SpaceGroupsApiModule {}
