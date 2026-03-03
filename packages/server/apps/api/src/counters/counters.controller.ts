import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common'
import { ApiCookieAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { CountersResponse, SpaceCountersResponse } from '@shared/domain/counters/counters.types'
import { HOME_SCOPE } from '@shared/enums'
import { CountersFacade } from '@shared/facade/counters/counters.facade'
import { UserContextGuard } from '../user-context/guard/user-context.guard'

@ApiTags('Counters')
@ApiCookieAuth()
@UseGuards(UserContextGuard)
@Controller('/counters')
export class CountersController {
  constructor(private readonly countersFacade: CountersFacade) {}

  @ApiOperation({
    summary: 'Get counters for private (my) scope',
    description:
      'Returns entity counts (files, apps, assets, jobs, etc.) visible to the current user in their private scope.',
  })
  @ApiResponse({ status: 200, description: 'Entity counts for the private scope', type: CountersResponse })
  @ApiResponse({ status: 401, description: 'Unauthorized – missing or invalid session' })
  @Get()
  async getCounters(): Promise<CountersResponse> {
    return this.countersFacade.getCounters(HOME_SCOPE.ME)
  }

  @ApiOperation({
    summary: 'Get counters for featured scope',
    description: 'Returns entity counts for items that have been marked as featured.',
  })
  @ApiResponse({ status: 200, description: 'Entity counts for the featured scope', type: CountersResponse })
  @ApiResponse({ status: 401, description: 'Unauthorized – missing or invalid session' })
  @Get('/featured')
  async getFeaturedCounters(): Promise<CountersResponse> {
    return this.countersFacade.getCounters(HOME_SCOPE.FEATURED)
  }

  @ApiOperation({
    summary: 'Get counters for everybody (public) scope',
    description: 'Returns entity counts for all publicly accessible items.',
  })
  @ApiResponse({ status: 200, description: 'Entity counts for the public scope', type: CountersResponse })
  @ApiResponse({ status: 401, description: 'Unauthorized – missing or invalid session' })
  @Get('/everybody')
  async getEverybodyCounters(): Promise<CountersResponse> {
    return this.countersFacade.getCounters(HOME_SCOPE.EVERYBODY)
  }

  @ApiOperation({
    summary: 'Get counters for spaces scope',
    description: 'Returns aggregated entity counts across all spaces the current user has access to.',
  })
  @ApiResponse({ status: 200, description: 'Aggregated entity counts for spaces', type: CountersResponse })
  @ApiResponse({ status: 401, description: 'Unauthorized – missing or invalid session' })
  @Get('/spaces')
  async getSpacesCounters(): Promise<CountersResponse> {
    return this.countersFacade.getCounters(HOME_SCOPE.SPACES)
  }

  @ApiOperation({
    summary: 'Get counters for a specific space',
    description:
      'Returns entity counts for a single space identified by its ID. Includes a members count in addition to the standard counters. The current user must have access to the space.',
  })
  @ApiParam({ name: 'spaceId', type: Number, description: 'Numeric ID of the space', example: 42 })
  @ApiResponse({ status: 200, description: 'Entity counts for the specified space', type: SpaceCountersResponse })
  @ApiResponse({ status: 401, description: 'Unauthorized – missing or invalid session' })
  @ApiResponse({ status: 404, description: 'Space not found or not accessible' })
  @Get('/spaces/:spaceId')
  async getSpaceCounters(@Param('spaceId', ParseIntPipe) spaceId: number): Promise<SpaceCountersResponse> {
    return this.countersFacade.getSpaceCounters(spaceId)
  }
}
