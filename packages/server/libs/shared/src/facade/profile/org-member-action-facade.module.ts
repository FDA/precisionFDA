import { Module } from '@nestjs/common'
import { EventModule } from '@shared/domain/event/event.module'
import { OrgActionRequestModule } from '@shared/domain/org-action-request/org-action-request.module'
import { UserModule } from '@shared/domain/user/user.module'
import { OrgMemberActionFacade } from './org-member-action.facade'

@Module({
  imports: [UserModule, OrgActionRequestModule, EventModule],
  providers: [OrgMemberActionFacade],
  exports: [OrgMemberActionFacade],
})
export class OrgMemberActionFacadeModule {}
