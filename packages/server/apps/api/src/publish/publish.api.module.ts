import { Module } from '@nestjs/common'
import { PublishApiFacadeModule } from '../facade/publish/publish-facade.module'
import { PublishController } from './publish.controller'

@Module({
  imports: [PublishApiFacadeModule],
  controllers: [PublishController],
})
export class PublishApiModule {}
