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
import { DiscussionFacade } from '../facade/discussion/discussion.facade'

@UseGuards(UserContextGuard)
@Controller('/discussions')
export class DiscussionsController {
  constructor(
    private readonly discussionService: DiscussionService,
    private readonly discussionFacade: DiscussionFacade,
  ) {}

  @Get()
  async listDiscussions(@Query() query: DiscussionPaginationDTO) {
    return await this.discussionService.listDiscussions(query)
  }

  @Get('/:id')
  async getDiscussion(@Param('id', ParseIntPipe) id: number) {
    return await this.discussionService.getDiscussion(id)
  }

  // TODO Jiri: refactor - we are using noteId where API standard expects discussionId.
  //  This is because we use this for both discussions and answers attachments fetch via noteId.
  @Get('/:noteId/attachments')
  async getNoteAttachments(@Param('noteId', ParseIntPipe) noteId: number) {
    return await this.discussionService.getAttachments(noteId)
  }

  @Get('/:id/answers/:answerId')
  async getAnswer(@Param('answerId', ParseIntPipe) answerId: number) {
    return await this.discussionService.getAnswer(answerId)
  }

  @HttpCode(201)
  @Post()
  async createDiscussion(@Body() body: CreateDiscussionDTO) {
    const result = await this.discussionFacade.createDiscussion(body)

    return { id: result.id }
  }

  @HttpCode(201)
  @Post('/:discussionId/answers')
  async createAnswer(
    @Param('discussionId', ParseIntPipe) discussionId: number,
    @Body() body: CreateAnswerDTO,
  ) {
    const result = await this.discussionFacade.createAnswer({ discussionId, ...body })

    return { id: result.id }
  }

  @HttpCode(204)
  @Patch('/:id')
  async updateDiscussion(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateDiscussionDTO) {
    await this.discussionService.updateDiscussion(id, body)
  }

  @HttpCode(204)
  @Put('/:discussionId/comments/:commentId')
  async editDiscussionComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() body: UpdateCommentDTO,
  ) {
    const result = await this.discussionService.updateComment(commentId, body)
    return { id: result.id }
  }

  @HttpCode(204)
  @Patch('/:discussionId/answers/:answerId')
  async updateAnswer(
    @Param('discussionId', ParseIntPipe) discussionId: number,
    @Param('answerId', ParseIntPipe) answerId: number,
    @Body() body: UpdateAnswerDTO,
  ) {
    await this.discussionService.updateAnswer(answerId, body)
  }

  @HttpCode(204)
  @Delete('/:id')
  async deleteDiscussion(@Param('id', ParseIntPipe) id: number) {
    await this.discussionService.deleteDiscussion(id)
  }

  @HttpCode(204)
  @Delete('/:discussionId/answers/:id')
  async deleteAnswer(@Param('id', ParseIntPipe) id: number) {
    await this.discussionService.deleteAnswer(id)
  }

  @HttpCode(204)
  @Delete('/:discussionId/comments/:id')
  async deleteDiscussionComment(@Param('id', ParseIntPipe) id: number) {
    await this.discussionService.deleteComment(id, 'Discussion')
  }

  @HttpCode(204)
  @Delete('/:discussionId/answers/:answerId/comments/:id')
  async deleteAnswerComment(@Param('id', ParseIntPipe) id: number) {
    await this.discussionService.deleteComment(id, 'Answer')
  }

  @Post('/:discussionId/comments')
  async createDiscussionComment(
    @Param('discussionId', ParseIntPipe) discussionId: number,
    @Body() body: CreateCommentDTO,
  ) {
    const result = await this.discussionFacade.createComment(discussionId, {
      discussionId,
      ...body,
    })

    return { id: result.id }
  }

  @HttpCode(200)
  @Post('/:discussionId/answers/:answerId/comments')
  async createAnswerComment(
    @Param('answerId', ParseIntPipe) id: number,
    @Body() body: CreateCommentDTO,
  ) {
    const result = await this.discussionService.createComment({ answerId: id, ...body })

    return { id: result.id }
  }

  @Put('/:discussionId/answers/:answerId/comments/:commentId')
  async editAnswerComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() body: UpdateCommentDTO,
  ) {
    return await this.discussionService.updateComment(commentId, body)
  }

  @HttpCode(201)
  @Post('/:discussionId/follow')
  async followDiscussion(@Param('discussionId', ParseIntPipe) discussionId: number) {
    return await this.discussionService.followDiscussion(discussionId)
  }

  @HttpCode(201)
  @Post('/:discussionId/unfollow')
  async unfollowDiscussion(@Param('discussionId', ParseIntPipe) discussionId: number) {
    return await this.discussionService.unfollowDiscussion(discussionId)
  }
}
