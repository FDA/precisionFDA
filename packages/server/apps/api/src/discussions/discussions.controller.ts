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
  Put,
  Query,
  UseGuards,
} from '@nestjs/common'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { CreateDiscussionDTO } from '@shared/domain/discussion/dto/create-discussion.dto'
import { CreateAnswerDTO } from '@shared/domain/discussion/dto/create-answer.dto'
import { UpdateDiscussionDTO } from '@shared/domain/discussion/dto/update-discussion.dto'
import { CreateCommentDTO } from '@shared/domain/discussion/dto/create-comment.dto'
import { UpdateAnswerDTO } from '@shared/domain/discussion/dto/update-answer.dto'
import { UpdateCommentDTO } from '@shared/domain/discussion/dto/update-comment.dto'
import { DiscussionPaginationDTO } from '@shared/domain/discussion/dto/discussion-pagination.dto'
import { CreateDiscussionFacade } from '../facade/discussion/create-discussion.facade'
import { AttachmentManagementFacade } from '@shared/facade/discussion/attachment-management.facade'
import { UpdateDiscussionFacade } from '../facade/discussion/update-discussion.facade'
import { CreateAnswerFacade } from '../facade/discussion/create-answer.facade'
import { UpdateAnswerFacade } from '../facade/discussion/update-answer.facade'
import { CreateCommentFacade } from '../facade/discussion/create-comment.facade'
import { CommentDTO } from '@shared/domain/discussion/dto/comment.dto'
import { AnswerDTO } from '@shared/domain/discussion/dto/answer.dto'
import { PaginatedResult } from '@shared/domain/entity/domain/paginated.result'
import { DiscussionDTO } from '@shared/domain/discussion/dto/discussion.dto'
import { DiscussionAttachment } from '@shared/domain/discussion/discussion.types'

@UseGuards(UserContextGuard)
@Controller('/discussions')
export class DiscussionsController {
  constructor(
    private readonly discussionService: DiscussionService,
    private readonly createDiscussionFacade: CreateDiscussionFacade,
    private readonly createAnswerFacade: CreateAnswerFacade,
    private readonly createCommentFacade: CreateCommentFacade,
    private readonly updateDiscussionFacade: UpdateDiscussionFacade,
    private readonly updateAnswerFacade: UpdateAnswerFacade,
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
  @Post('/:discussionId/answers')
  async createAnswer(
    @Param('discussionId', ParseIntPipe) discussionId: number,
    @Body() body: CreateAnswerDTO,
  ): Promise<{ id: number }> {
    const result = await this.createAnswerFacade.createAnswer({ discussionId, ...body })

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
  @Put('/:discussionId/comments/:commentId')
  async editDiscussionComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() body: UpdateCommentDTO,
  ): Promise<{ id: number }> {
    const result = await this.discussionService.updateComment(commentId, body)
    return { id: result.id }
  }

  @HttpCode(204)
  @Patch('/:discussionId/answers/:answerId')
  async updateAnswer(
    @Param('discussionId', ParseIntPipe) discussionId: number,
    @Param('answerId', ParseIntPipe) answerId: number,
    @Body() body: UpdateAnswerDTO,
  ): Promise<void> {
    await this.updateAnswerFacade.updateAnswer(answerId, body)
  }

  @HttpCode(204)
  @Delete('/:id')
  async deleteDiscussion(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.discussionService.deleteDiscussion(id)
  }

  @HttpCode(204)
  @Delete('/:discussionId/answers/:id')
  async deleteAnswer(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.discussionService.deleteAnswer(id)
  }

  @HttpCode(204)
  @Delete('/:discussionId/comments/:id')
  async deleteDiscussionComment(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.discussionService.deleteComment(id, 'Discussion')
  }

  @HttpCode(204)
  @Delete('/:discussionId/answers/:answerId/comments/:id')
  async deleteAnswerComment(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.discussionService.deleteComment(id, 'Answer')
  }

  @HttpCode(201)
  @Post('/:discussionId/comments')
  async createDiscussionComment(
    @Param('discussionId', ParseIntPipe) discussionId: number,
    @Body() body: CreateCommentDTO,
  ): Promise<{ id: number }> {
    const result = await this.createCommentFacade.createComment({
      discussionId,
      ...body,
    })

    return { id: result.id }
  }

  @HttpCode(201)
  @Post('/:discussionId/answers/:answerId/comments')
  async createAnswerComment(
    @Param('discussionId', ParseIntPipe) discussionId: number,
    @Param('answerId', ParseIntPipe) id: number,
    @Body() body: CreateCommentDTO,
  ): Promise<{ id: number }> {
    const result = await this.createCommentFacade.createComment({
      answerId: id,
      ...body,
    })

    return { id: result.id }
  }

  @Put('/:discussionId/answers/:answerId/comments/:commentId')
  async editAnswerComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() body: UpdateCommentDTO,
  ): Promise<CommentDTO> {
    return await this.discussionService.updateComment(commentId, body)
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
