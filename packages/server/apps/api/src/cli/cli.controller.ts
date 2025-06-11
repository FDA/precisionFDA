import { Body, Controller, Get, HttpCode, Param, Post, Put, UseGuards } from '@nestjs/common'
import { CliNodeSearchDTO } from '@shared/domain/cli/dto/CliNodeSearchDTO'
import { CliService } from '@shared/domain/cli/service/cli.service'
import { DxId } from '@shared/domain/entity/domain/dxid'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { DbClusterUidParamDto } from '../dbclusters/model/dbcluster-uid-param.dto'
import { CliCreateDiscussionDTO } from '@shared/domain/cli/dto/cli-create-discussion.dto'
import { CliCreateReplyDTO } from '@shared/domain/cli/dto/cli-create-reply.dto'
import { CliEditDiscussionDTO } from '@shared/domain/cli/dto/cli-edit-discussion.dto'
import { CliEditReplyDTO } from '@shared/domain/cli/dto/cli-edit-reply.dto'
import { CliCreateDiscussionFacade } from '../facade/discussion/cli-create-discussion.facade'
import { CliCreateDiscussionReplyFacade } from '../facade/discussion/cli-create-discussion-reply.facade'
import { CliUpdateDiscussionFacade } from '../facade/discussion/cli-update-discussion.facade'
import { CliUpdateDiscussionReplyFacade } from '../facade/discussion/cli-update-discussion-reply.facade'
import { CliDescribeEntityFacade } from '../facade/cli/cli-describe-entity.facade'
import { CliJobScopeFacade } from '../facade/cli/cli-job-scope.facade'
import {
  CliAppDescribeDTO,
  CliDbClusterDescribeDTO,
  CliDiscussionDescribeDTO,
  CliExecutionDescribeDTO,
  CliFileDescribeDTO,
  CliFolderDescribeDTO,
  CliWorkflowDescribeDTO,
} from '@shared/domain/cli/dto/CliDescribeDTO'
import { CliSpaceMemberDTO } from '@shared/domain/cli/dto/CliSpaceMemberDTO'
import { CliDiscussionDTO } from '@shared/domain/cli/dto/CliDiscussionDTO'
import { UserFile } from '@shared/domain/user-file/user-file.entity'
import { Folder } from '@shared/domain/user-file/folder.entity'
import { EntityScope } from '@shared/types/common'

// SPECIAL ROUTES INTENDED FOR CLI USAGE ONLY. CONTAINS CLI SPECIFIC LOGIC & SPECIAL RESPONSE OBJECTS.
@Controller('/cli')
export class CliController {
  constructor(
    private readonly cliService: CliService,
    private readonly cliDescribeEntityFacade: CliDescribeEntityFacade,
    private readonly cliCreateDiscussionFacade: CliCreateDiscussionFacade,
    private readonly cliCreateDiscussionReplyFacade: CliCreateDiscussionReplyFacade,
    private readonly cliUpdateDiscussionFacade: CliUpdateDiscussionFacade,
    private readonly cliUpdateDiscussionReplyFacade: CliUpdateDiscussionReplyFacade,
    private readonly cliJobScopeFacade: CliJobScopeFacade,
  ) {}

  @UseGuards(UserContextGuard)
  @HttpCode(200)
  @Post('/nodes')
  async findNodes(@Body() body: CliNodeSearchDTO): Promise<UserFile[] | Folder[]> {
    return this.cliService.findNodes(body)
  }

  @Get('/version/latest')
  getLatestVersion(): { version: string } {
    return { version: '2.9.0' }
  }

  @UseGuards(UserContextGuard)
  @Get('/:uid/describe')
  async describeEntity(
    @Param('uid') uid: string,
  ): Promise<
    | CliFileDescribeDTO
    | CliWorkflowDescribeDTO
    | CliAppDescribeDTO
    | CliExecutionDescribeDTO
    | CliDiscussionDescribeDTO
    | CliFolderDescribeDTO
    | CliDbClusterDescribeDTO
  > {
    return this.cliDescribeEntityFacade.describeEntity(uid)
  }

  @UseGuards(UserContextGuard)
  @Get('/job/:dxid/scope')
  async getJobScope(@Param('dxid') jobDxid: DxId<'job'>): Promise<{
    scope: EntityScope
  }> {
    return this.cliJobScopeFacade.getJobScope(jobDxid)
  }

  @UseGuards(UserContextGuard)
  @Get('/spaces/:id/members')
  async listMembers(@Param('id') spaceId: number): Promise<CliSpaceMemberDTO[]> {
    return this.cliService.listSpaceMembers(spaceId)
  }

  @UseGuards(UserContextGuard)
  @Get('/spaces/:id/discussions')
  async listDiscussions(@Param('id') spaceId: number): Promise<CliDiscussionDTO[]> {
    return this.cliService.listSpaceDiscussions(spaceId)
  }

  // TODO: REMOVE IN V3.0.0, migrated to /cli/{uid}/describe
  @UseGuards(UserContextGuard)
  @Get('/discussions/:discussionId/describe')
  async describeDiscussion(
    @Param('discussionId') discussionId: number,
  ): Promise<CliDiscussionDescribeDTO> {
    return this.cliDescribeEntityFacade.describeDiscussion(discussionId)
  }

  @UseGuards(UserContextGuard)
  @Get('/dbclusters/:dbclusterUid/password')
  async getDbClusterPassword(@Param() params: DbClusterUidParamDto): Promise<{ password: string }> {
    const password = await this.cliService.dbClusterGetPassword(params.dbclusterUid)
    return { password }
  }

  @UseGuards(UserContextGuard)
  @Post('/dbclusters/:dbclusterUid/password')
  async rotateDbClusterPassword(@Param() params: DbClusterUidParamDto): Promise<{
    password: string
  }> {
    const password = await this.cliService.dbClusterRotatePassword(params.dbclusterUid)
    return { password }
  }

  @UseGuards(UserContextGuard)
  @HttpCode(201)
  @Post('/spaces/:id/discussions')
  async createDiscussion(
    @Param('id') spaceId: number,
    @Body() body: CliCreateDiscussionDTO,
  ): Promise<{
    url: string
  }> {
    const url = await this.cliCreateDiscussionFacade.createDiscussion(spaceId, body)
    return { url }
  }

  @UseGuards(UserContextGuard)
  @HttpCode(201)
  @Post('/discussions/reply')
  async replyToDiscussion(@Body() body: CliCreateReplyDTO): Promise<{ url: string }> {
    const url = await this.cliCreateDiscussionReplyFacade.createReply(body)
    return { url }
  }

  @UseGuards(UserContextGuard)
  @Put('/discussions/reply')
  async editReply(@Body() body: CliEditReplyDTO): Promise<{ url: string }> {
    const url = await this.cliUpdateDiscussionReplyFacade.updateReply(body)
    return { url }
  }

  @UseGuards(UserContextGuard)
  @Put('/discussions/:discussionId')
  async editDiscussion(
    @Param('discussionId') id: number,
    @Body() body: CliEditDiscussionDTO,
  ): Promise<{
    url: string
  }> {
    const url = await this.cliUpdateDiscussionFacade.updateDiscussion(id, body)
    return { url }
  }
}
