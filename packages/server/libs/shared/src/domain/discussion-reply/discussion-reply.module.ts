import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Module } from '@nestjs/common'
import { DiscussionReply } from './discussion-reply.entity'

@Module({
  imports: [MikroOrmModule.forFeature([DiscussionReply])],
  providers: [],
  exports: [MikroOrmModule],
})
export class DiscussionReplyModule {}
