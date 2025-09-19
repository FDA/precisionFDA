import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { DISCUSSION_REPLY_TYPE } from '@shared/domain/discussion-reply/discussion-reply.types'
import { DiscussionAttachment } from '@shared/domain/discussion/discussion.types'
import { AnswerDTO } from '@shared/domain/discussion/dto/answer.dto'
import { CreateDiscussionDTO } from '@shared/domain/discussion/dto/create-discussion.dto'
import { CreateReplyDTO } from '@shared/domain/discussion/dto/create-reply.dto'
import { DiscussionPaginationDTO } from '@shared/domain/discussion/dto/discussion-pagination.dto'
import { DiscussionDTO } from '@shared/domain/discussion/dto/discussion.dto'
import { UpdateDiscussionDTO } from '@shared/domain/discussion/dto/update-discussion.dto'
import { UpdateReplyDTO } from '@shared/domain/discussion/dto/update-reply.dto'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import { PaginatedResult } from '@shared/domain/entity/domain/paginated.result'
import { AttachmentManagementFacade } from '@shared/facade/discussion/attachment-management.facade'
import { CreateDiscussionReplyFacade } from '../facade/discussion/create-discussion-reply.facade'
import { CreateDiscussionFacade } from '../facade/discussion/create-discussion.facade'
import { UpdateDiscussionFacade } from '../facade/discussion/update-discussion.facade'
import { UpdateDiscussionReplyFacade } from '../facade/discussion/update-reply.facade'
import { UserContextGuard } from '../user-context/guard/user-context.guard'

@UseGuards(UserContextGuard)
@Controller('/discussions')
export class DiscussionsController {
  constructor(
    private readonly discussionService: DiscussionService,
    private readonly createDiscussionFacade: CreateDiscussionFacade,
    private readonly createDiscussionReplyFacade: CreateDiscussionReplyFacade,
    private readonly updateDiscussionFacade: UpdateDiscussionFacade,
    private readonly updateDiscussionReplyFacade: UpdateDiscussionReplyFacade,
    private readonly attachmentFacade: AttachmentManagementFacade,
  ) {}

  @Get()
  async listDiscussions(
    @Query() query: DiscussionPaginationDTO,
  ): Promise<PaginatedResult<DiscussionDTO>> {
    return await this.discussionService.listDiscussions(query)
  }

  @Get('/:id')
  async getDiscussion(@Param('id', ParseIntPipe) id: number): Promise<DiscussionDTO> {
    return await this.discussionService.getDiscussion(id)
  }

  // TODO Jiri: refactor - we are using noteId where API standard expects discussionId.
  //  This is because we use this for both discussions and answers attachments fetch via noteId.
  @Get('/:noteId/attachments')
  async getNoteAttachments(
    @Param('noteId', ParseIntPipe) noteId: number,
  ): Promise<DiscussionAttachment[]> {
    return await this.attachmentFacade.getAttachments(noteId)
  }

  @Get('/:id/answers/:answerId')
  async getAnswer(@Param('answerId', ParseIntPipe) answerId: number): Promise<AnswerDTO> {
    return await this.discussionService.getAnswer(answerId)
  }

  @HttpCode(201)
  @Post()
  async createDiscussion(@Body() body: CreateDiscussionDTO): Promise<{ id: number }> {
    const result = await this.createDiscussionFacade.createDiscussion(body)

    return { id: result.id }
  }

  @HttpCode(201)
  @Post('/:discussionId/replies')
  async createDiscussionReply(
    @Param('discussionId', ParseIntPipe) discussionId: number,
    @Body() body: CreateReplyDTO,
  ): Promise<{ id: number }> {
    const result = await this.createDiscussionReplyFacade.createReply(discussionId, body)

    return { id: result.id }
  }

  @HttpCode(204)
  @Patch('/:id')
  async updateDiscussion(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateDiscussionDTO,
  ): Promise<void> {
    await this.updateDiscussionFacade.updateDiscussion(id, body)
  }

  @HttpCode(204)
  @Patch('/:discussionId/replies/:replyId')
  async updateDiscussionReply(
    @Param('discussionId', ParseIntPipe) discussionId: number,
    @Param('replyId', ParseIntPipe) replyId: number,
    @Body() body: UpdateReplyDTO,
  ): Promise<void> {
    await this.updateDiscussionReplyFacade.updateReply(replyId, body)
  }

  @HttpCode(204)
  @Delete('/:id')
  async deleteDiscussion(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.discussionService.deleteDiscussion(id)
  }

  @HttpCode(204)
  @Delete('/:discussionId/replies/:id')
  async deleteDiscussionReply(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.discussionService.deleteReply(id, DISCUSSION_REPLY_TYPE.ANSWER)
  }

  // TODO PFDA-5997 - part 1: remove delete routes after deprecating `comments` table
  @HttpCode(204)
  @Delete('/:discussionId/comments/:id')
  async deleteDiscussionComment(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.discussionService.deleteReply(id, DISCUSSION_REPLY_TYPE.COMMENT)
  }

  @HttpCode(204)
  @Delete('/:discussionId/answers/:answerId/comments/:id')
  async deleteAnswerComment(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.discussionService.deleteReply(id, DISCUSSION_REPLY_TYPE.COMMENT)
  }

  @HttpCode(204)
  @Post('/:discussionId/follow')
  async followDiscussion(@Param('discussionId', ParseIntPipe) discussionId: number): Promise<void> {
    return await this.discussionService.followDiscussion(discussionId)
  }

  @HttpCode(204)
  @Post('/:discussionId/unfollow')
  async unfollowDiscussion(
    @Param('discussionId', ParseIntPipe) discussionId: number,
  ): Promise<void> {
    return await this.discussionService.unfollowDiscussion(discussionId)
  }
}
