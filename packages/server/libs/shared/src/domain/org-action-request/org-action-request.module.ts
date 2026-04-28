import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { OrgActionRequest } from './org-action-request.entity'
import { OrgActionRequestService } from './org-action-request.service'

@Module({
  imports: [MikroOrmModule.forFeature([OrgActionRequest])],
  providers: [OrgActionRequestService],
  exports: [OrgActionRequestService],
})
export class OrgActionRequestModule {}

