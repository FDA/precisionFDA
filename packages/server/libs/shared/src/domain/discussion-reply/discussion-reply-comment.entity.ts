import { Entity } from '@mikro-orm/core'
import { DISCUSSION_REPLY_TYPE } from '../discussion-reply/discussion-reply.types'
import { DiscussionReply } from './discussion-reply.entity'

@Entity({
  discriminatorValue: DISCUSSION_REPLY_TYPE.COMMENT,
})
export class DiscussionReplyComment extends DiscussionReply {}
