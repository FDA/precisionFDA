import { Module } from '@nestjs/common'
import { SpaceCreateModule } from '@shared/domain/space/create/space-create.module'
import { SpaceService } from '@shared/domain/space/service/space.service'

@Module({
  imports: [SpaceCreateModule],
  providers: [SpaceService],
  exports: [SpaceService],
})
export class SpaceModule {}
