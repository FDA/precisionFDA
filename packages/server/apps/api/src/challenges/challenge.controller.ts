import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
  Query,
} from '@nestjs/common'
import { ChallengeService } from '@shared/domain/challenge/challenge.service'
import { ChallengePaginationDto } from '@shared/domain/challenge/dto/challenge-pagination.dto'
import { ProposeChallengeDTO } from '@shared/domain/challenge/dto/propose-challenge.dto'
import { CreateChallengeDTO } from '@shared/domain/challenge/dto/create-challenge.dto'
import { UpdateChallengeContentDTO } from '@shared/domain/challenge/dto/update-challenge-content.dto'
import { ChallengeOrSiteAdminGuard } from '../admin/guards/challenge-or-site-admin.guard'
import { UpdateChallengeDTO } from '@shared/domain/challenge/dto/update-challenge.dto'
import { AssignScoringAppDTO } from '@shared/domain/challenge/dto/assign-scoring-app.dto'
import { ChallengeFacade } from '../facade/challenge/challenge.facade'
import { UserContextGuard } from '../user-context/guard/user-context.guard'
import { CreateChallengeResourceDTO } from '@shared/domain/challenge/dto/create-challenge-resource.dto'

@Controller('/challenges')
export class ChallengeController {
  constructor(
    private readonly challengeService: ChallengeService,
    private readonly challengeFacade: ChallengeFacade,
  ) {}

  @Get()
  async list(@Query() query: ChallengePaginationDto) {
    return await this.challengeService.listChallenges(query)
  }

  @HttpCode(204)
  @Post('/propose')
  async propose(@Body() body: ProposeChallengeDTO) {
    await this.challengeService.proposeChallenge(body)
  }

  @UseGuards(ChallengeOrSiteAdminGuard)
  @HttpCode(201)
  @Post()
  async create(@Body() body: CreateChallengeDTO) {
    return await this.challengeFacade.createChallenge(body)
  }

  @HttpCode(200)
  @Get(':id')
  async get(@Param('id', ParseIntPipe) id: number) {
    return await this.challengeService.getChallenge(id)
  }

  @UseGuards(ChallengeOrSiteAdminGuard)
  @HttpCode(201)
  @Post(':id/resources')
  async createResource(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CreateChallengeResourceDTO,
  ) {
    return await this.challengeFacade.createChallengeResource(id, body)
  }

  @UseGuards(UserContextGuard)
  @HttpCode(200)
  @Get(':id/entries')
  async getOwnEntries(@Param('id', ParseIntPipe) id: number) {
    return await this.challengeService.getOwnEntries(id)
  }

  @UseGuards(UserContextGuard)
  @HttpCode(200)
  @Get(':id/submissions')
  async getSubmissions(@Param('id', ParseIntPipe) id: number) {
    return await this.challengeService.getSubmissions(id)
  }

  @UseGuards(ChallengeOrSiteAdminGuard)
  @HttpCode(204)
  @Put('/:id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateChallengeDTO) {
    return await this.challengeFacade.updateChallenge(id, body)
  }

  @UseGuards(ChallengeOrSiteAdminGuard)
  @HttpCode(204)
  @Put(':id/content')
  async updateContent(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateChallengeContentDTO,
  ) {
    await this.challengeService.updateContent(id, body)
  }

  @UseGuards(UserContextGuard)
  @HttpCode(204)
  @Put(':id/app')
  async assignScoringApp(@Param('id', ParseIntPipe) id: number, @Body() body: AssignScoringAppDTO) {
    await this.challengeService.assignApp(id, body)
  }
}
