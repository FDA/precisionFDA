import { Module } from '@nestjs/common'
import { ResourceModule } from '@shared/domain/resource/resource.module'
import { ResourcesController } from './resources.controller'

@Module({
  imports: [ResourceModule],
  controllers: [ResourcesController]
})
export class ResourcesApiModule {}
