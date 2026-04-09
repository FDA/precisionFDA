import { Body, Controller, Get, HttpCode, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common'
import { CliCreateDiscussionDTO } from '@shared/domain/cli/dto/cli-create-discussion.dto'
import { CliDiscussionDTO } from '@shared/domain/cli/dto/cli-discussion.dto'
import { CliListSpaceDTO } from '@shared/domain/cli/dto/cli-list-spaces.dto'
import { CliListSpacesQueryDTO } from '@shared/domain/cli/dto/cli-list-spaces-query.dto'
import { CliSpaceMemberDTO } from '@shared/domain/cli/dto/cli-space-member.dto'
import { CliCreateDiscussionFacade } from '../facade/cli/cli-create-discussion.facade'
import { CliListDiscussionsFacade } from '../facade/cli/cli-list-discussions.facade'
import { CliListMembersFacade } from '../facade/cli/cli-list-members.facade'
import { CliListSpacesFacade } from '../facade/cli/cli-list-spaces.facade'
import { UserContextGuard } from '../user-context/guard/user-context.guard'

@Controller('/cli/spaces')
export class CliSpacesController {
  constructor(
    private readonly cliListSpacesFacade: CliListSpacesFacade,
    private readonly cliListMembersFacade: CliListMembersFacade,
    private readonly cliListDiscussionsFacade: CliListDiscussionsFacade,
    private readonly cliCreateDiscussionFacade: CliCreateDiscussionFacade,
  ) {}

  @UseGuards(UserContextGuard)
  @Get()
  async listSpaces(@Query() query: CliListSpacesQueryDTO): Promise<CliListSpaceDTO[]> {
    return this.cliListSpacesFacade.listSpaces(query)
  }

  @UseGuards(UserContextGuard)
  @Get('/:id/members')
  async listMembers(@Param('id', ParseIntPipe) spaceId: number): Promise<CliSpaceMemberDTO[]> {
    return this.cliListMembersFacade.listSpaceMembers(spaceId)
  }

  @UseGuards(UserContextGuard)
  @Get('/:id/discussions')
  async listDiscussions(@Param('id', ParseIntPipe) spaceId: number): Promise<CliDiscussionDTO[]> {
    return this.cliListDiscussionsFacade.listDiscussions(spaceId)
  }

  @UseGuards(UserContextGuard)
  @HttpCode(201)
  @Post('/:id/discussions')
  async createDiscussion(
    @Param('id', ParseIntPipe) spaceId: number,
    @Body() body: CliCreateDiscussionDTO,
  ): Promise<{ url: string }> {
    const url = await this.cliCreateDiscussionFacade.createDiscussion(spaceId, body)
    return { url }
  }
}
