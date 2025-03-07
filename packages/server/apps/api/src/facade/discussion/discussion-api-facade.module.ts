import { Module } from '@nestjs/common'
import { EmailModule } from '@shared/domain/email/email.module'
import { DiscussionModule } from '@shared/domain/discussion/discussion.module'
import { DiscussionFacade } from './discussion.facade'

@Module({
  imports: [DiscussionModule, EmailModule],
  providers: [DiscussionFacade],
  exports: [DiscussionFacade],
})
export class DiscussionApiFacadeModule {}
