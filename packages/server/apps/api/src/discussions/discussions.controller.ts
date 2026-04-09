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
import { CreateDiscussionDTO } from '@shared/domain/discussion/dto/create-discussion.dto'
import { CreateReplyDTO } from '@shared/domain/discussion/dto/create-reply.dto'
import { DiscussionDTO } from '@shared/domain/discussion/dto/discussion.dto'
import { DiscussionPaginationDTO } from '@shared/domain/discussion/dto/discussion-pagination.dto'
import { DiscussionReplyDTO } from '@shared/domain/discussion/dto/discussion-reply.dto'
import { SimpleDiscussionDTO } from '@shared/domain/discussion/dto/simple-discussion.dto'
import { UpdateDiscussionDTO } from '@shared/domain/discussion/dto/update-discussion.dto'
import { UpdateReplyDTO } from '@shared/domain/discussion/dto/update-reply.dto'
import { DiscussionService } from '@shared/domain/discussion/services/discussion.service'
import { PaginatedResult } from '@shared/domain/entity/domain/paginated.result'
import { CreateDiscussionFacade } from '../facade/discussion/create-discussion.facade'
import { CreateDiscussionReplyFacade } from '../facade/discussion/create-discussion-reply.facade'
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
  ) {}

  @Get()
  async listDiscussions(@Query() query: DiscussionPaginationDTO): Promise<PaginatedResult<SimpleDiscussionDTO>> {
    return await this.discussionService.listDiscussions(query)
  }

  @Get('/:id')
  async getDiscussion(@Param('id', ParseIntPipe) id: number): Promise<DiscussionDTO> {
    return await this.discussionService.getDiscussion(id)
  }

  @Get('/:id/replies/:replyId')
  async getReply(@Param('replyId', ParseIntPipe) replyId: number): Promise<DiscussionReplyDTO> {
    return await this.discussionService.getDiscussionReply(replyId)
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
  async updateDiscussion(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateDiscussionDTO): Promise<void> {
    await this.updateDiscussionFacade.updateDiscussion(id, body)
  }

  @HttpCode(204)
  @Patch('/:discussionId/replies/:replyId')
  async updateDiscussionReply(
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
    await this.discussionService.deleteReply(id)
  }

  @HttpCode(204)
  @Post('/:discussionId/follow')
  async followDiscussion(@Param('discussionId', ParseIntPipe) discussionId: number): Promise<void> {
    return await this.discussionService.followDiscussion(discussionId)
  }

  @HttpCode(204)
  @Post('/:discussionId/unfollow')
  async unfollowDiscussion(@Param('discussionId', ParseIntPipe) discussionId: number): Promise<void> {
    return await this.discussionService.unfollowDiscussion(discussionId)
  }
}
