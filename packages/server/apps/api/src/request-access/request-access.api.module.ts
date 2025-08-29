import { Module } from '@nestjs/common'
import { RequestAccessFacadeModule } from '@shared/facade/request-access/request-access-facade.module'
import { RequestAccessController } from './request-access.controller'

@Module({
  imports: [RequestAccessFacadeModule],
  controllers: [RequestAccessController],
})
export class RequestAccessApiModule {}
